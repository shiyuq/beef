const _ = require('lodash');
const config = require('config');
const httpStatus = require('http-status');
const { ValidationError } = require('joi');
const { BizException, DBException, HttpException } = require('../core/errors');

module.exports = () => {
  return async function(ctx, next) {
    try {
      await next();
      if (ctx.status === httpStatus.NOT_FOUND) {
        throw new HttpException(httpStatus.NOT_FOUND);
      }
    } catch (err) {
      ctx.state.err = err;
      if (err instanceof ValidationError) {
        ctx.body = {
          status: 400,
          message: err.message
        };
        ctx.status = httpStatus.BAD_REQUEST;
        return;
      }
      if (err instanceof BizException) {
        if (_.startsWith(ctx.path, '/ops/')) {
          ctx.error(err);
          ctx.status = httpStatus.INTERNAL_SERVER_ERROR;
        } else {
          ctx.error(err);
          ctx.status = httpStatus.OK;
        }
        return;
      }
      // 数据库异常不暴露错误信息，避免泄露数据库结构
      if (err instanceof DBException) {
        ctx.body = {
          status: 500,
          message: DBException.name,
          stack: config.get('defaultConfig').resErrorStack ? err.stack : undefined
        };
        ctx.status = httpStatus.INTERNAL_SERVER_ERROR;
        return;
      }
      if (err instanceof HttpException) {
        ctx.body = {
          status: err.errorCode,
          message: err.message,
          stack: config.get('defaultConfig').resErrorStack ? err.stack : undefined
        };
        ctx.status = err.errorCode;
        return;
      }
      ctx.body = {
        status: 500,
        message: 'INTERNAL_SERVER_ERROR',
        stack: config.get('defaultConfig').resErrorStack ? err.stack : undefined
      };
      ctx.status = httpStatus.INTERNAL_SERVER_ERROR;
    }
  };
};
