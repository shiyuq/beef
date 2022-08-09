const _ = require('lodash');

/**
 * 计算从填充config.start字段的拦截器开始到现在消耗的时间
 * @param {Object} axiosConfig axios配置对象
 * @returns 到目前为止消耗的时间
 */
function getElapsedTime(axiosConfig) {
  return axiosConfig && axiosConfig.state ? new Date().getTime() - axiosConfig.state.start : null;
}

/**
 * 拆分url，并解析url参数
 * @param {Object} axiosConfig axios配置对象
 * @returns 包含url和params的对象
 */
function splitUrlAndParseParams(axiosConfig) {
  const fullUrl = _.get(axiosConfig, 'url');
  if (!fullUrl) {
    return {};
  }
  const [url, paramsStr] = _.split(fullUrl, '?', 2);

  let params = {};
  if (paramsStr) {
    const searchParams = new URLSearchParams(paramsStr);
    searchParams.forEach((v, k, p) => {
      params[k] = v;
    });
  }
  // 合并url中手动拼接的参数
  params = _.assign(axiosConfig.params, params);
  return {
    url: _.trimEnd(url, '/'),
    params
  };
}

/**
 * 打印response日志
 * @param {Object} ctx axios response拦截器入参
 */
function logResponse(ctx, isError) {
  // response拦截器onfulfilled入参为response对象；onrejected入参为context对象，需要取出response
  const response = isError ? _.get(ctx, 'response') : ctx;

  if (!response) {
    return isError ? Promise.reject(ctx) : ctx;
  }

  const config = response.config;
  const state = config.state;
  const urlAndParam = splitUrlAndParseParams(config);
  const elapsed = getElapsedTime(config);
  const logParam = {};
  const data = response.data || {};

  if (_.includes(this.logResponseDataUrl, urlAndParam.url)) {
    logParam.response = JSON.stringify(data);
  }
  logParam.responseMessage = data.err || data.message || response.statusText;
  logParam.responseStatus = data.ret || data.status || response.status;
  logParam.status = response.status;
  logParam.headers = response.headers;

  const logInfo = {
    eventType: 'third-api-request',
    req: {
      url: urlAndParam.url,
      query: JSON.stringify(urlAndParam.params),
      body: this.requestBodyAdapter?.(urlAndParam.url, config.data),
      method: _.upperCase(_.get(config, 'method')),
      headers: JSON.stringify(_.get(config, 'headers'))
    },
    res: {
      httpStatus: logParam.status,
      status: logParam.responseStatus,
      message: logParam.responseMessage,
      headers: JSON.stringify(logParam.headers),
      body: logParam.response
    },
    ctx: {
      reqId: state?.reqId,
      userId: state?.userId
    },
    duration: elapsed
  };
  isError ? this.logger.error('外部请求', logInfo) : this.logger.info('外部请求', logInfo);
  return isError ? Promise.reject(ctx) : ctx;
}

function buildResponseLogger(logger, config, isError) {
  if (!logger) {
    throw new TypeError('no logger provided');
  }
  const thisArg = {
    logger,
    logResponseDataUrl: config?.logResponseDataUrl ?? [],
    requestBodyAdapter: config?.requestBodyAdapter ?? ((url, body) => body)
  };
  return _.curry(logResponse.bind(thisArg), 2)(_, isError);
}

module.exports = buildResponseLogger;
