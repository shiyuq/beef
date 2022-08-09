const _ = require('lodash');
const { pathToRegexp } = require('path-to-regexp');
const { apiLogger } = require('../core/logger');

/**
 * 记录http请求响应
 *
 * @param {Object} [options={}] - Optional configuration.
 * @param {string} [options.logRes] - 记录请求响应值的url，默认不记录请求响应，支持route路径匹配表达式
 * @param {Object} [options.logger] - 日志通道
 * @param {Object} [options.logger.info] 正常日志 info(msg,log)
 * @param {Object} [options.logger.error] 错误日志 error(msg,log,error)
 * @param {Function} [options.requestBodyDataAdapter]
 * @param {function} [options.dataAdapter=] - 数据适配器
 * @return {function} Koa middleware.
 */
module.exports = (options) => {
  const defaultOptions = {
    logRes: [],
    logger: apiLogger,
    requestBodyDataAdapter: (ctx, body) => body,
    dataAdapter: (ctx, data) => {
      return data;
    }
  };
  options = _.assign({}, defaultOptions, options);
  const pathExecs = _.map(options.logRes, (e) => pathToRegexp(e));

  const log = async(ctx, duration) => {
    let loggerData = {
      req: {
        url: ctx.path,
        query: JSON.stringify(ctx.request.query),
        body: JSON.stringify(options.requestBodyDataAdapter(ctx, ctx.request.body)),
        method: ctx.method,
        headers: JSON.stringify(ctx.headers),
        ip: ctx.state.ip
      },
      res: {
        httpStatus: ctx.status,
        status: ctx.body.status,
        message: ctx.body.message,
        // headers: JSON.stringify(ctx.response.headers),
        body: _.find(pathExecs, (e) => e.exec(ctx.path)) ? JSON.stringify(ctx.response.body) : '-'
      },
      ctx: {
        reqId: ctx.state.reqId,
        userId: ctx.state.userId,
        clientType: ctx.state.clientType
      },
      duration,
      eventType: 'request'
    };
    loggerData = options.dataAdapter?.(ctx, loggerData) ?? loggerData;
    const err = _.get(ctx, 'state.err');
    if (err) {
      options.logger.error('request', loggerData, err);
    } else {
      options.logger.info('request', loggerData);
    }
  };

  return async function httpLogger(ctx, next) {
    const startTime = Date.now();
    await next();
    const duration = Date.now() - startTime;
    log(ctx, duration);
  };
};
