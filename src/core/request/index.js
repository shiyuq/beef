const _ = require('lodash');
const axios = require('axios');
const config = require('config');
const context = require('../context');
const common = require('../../constants/common');
const { apiLogger, bizLogger } = require('../logger');
const httpLoggerInterceptor = require('./interceptors/http-logger');
const paramHandlerInterceptor = require('./interceptors/request-param-handler');
const exceptionHandlerInterceptor = require('./interceptors/exception-handler');

const createRequest = ({ url, headers, dataHandler, timeout }) => {
  const { reqId, userId } = context.getCtx();
  const requestConfig = {
    baseURL: url,
    headers: {
      'Content-Type': 'application/json;charset=utf-8',
      Connection: 'keep-alive',
      platform: common.platform
    },
    timeout: timeout || 4000,
    state: {
      reqId,
      userId,
      dataHandler
    }
  };
  requestConfig.headers = _.extend(requestConfig.headers, headers || {});
  const client = axios.create(requestConfig);
  const loggerInterceptorConfig = {
    // 要记录响应数据的url
    logResponseDataUrl: [],
    // 不记录请求体的url
    requestBodyAdapter: (url, reqBody) => {
      if (url === '/v4/internal/file/tmp/upload') {
        return '-';
      }
      return typeof reqBody === 'string' ? reqBody : JSON.stringify(reqBody);
    }
  };

  // setup interceptor for request
  client.interceptors.request.use(
    httpLoggerInterceptor.request.getOnFulfilled(),
    httpLoggerInterceptor.request.getOnRejected(bizLogger)
  );
  client.interceptors.request.use(paramHandlerInterceptor.request.getOnFulfilled());
  // setup interceptor for response
  client.interceptors.response.use(
    httpLoggerInterceptor.response.getOnFulfilled(apiLogger, loggerInterceptorConfig),
    httpLoggerInterceptor.response.getOnRejected(apiLogger, loggerInterceptorConfig)
  );
  client.interceptors.response.use(null, exceptionHandlerInterceptor.response.getOnRejected());
  client.interceptors.response.use(paramHandlerInterceptor.response.getOnFulfilled());

  return client;
};

const requestDetail = ({ url, headers, timeout }) => {
  return createRequest({
    url: url,
    headers: headers,
    dataHandler: function(data) {
      if (data && +data.status === 1) {
        return data.data;
      } else {
        throw new Error(`status: ${data.status}, msg: ${data.message}`);
      }
    },
    timeout: timeout
  });
};

const requestList = ({ url, headers, timeout }) => {
  return createRequest({
    url: url,
    headers: headers,
    dataHandler: (data) => {
      if (+data?.status === 1 && data.data) {
        const result = {
          total: data.data.total || data.data.count || 0,
          items: data.data.items || data.data.list || [],
          hasNextPage: data.data.has_next_page || false
        };
        return result;
      } else {
        throw new Error(`status: ${data.status}, msg: ${data.message}`);
      }
    },
    timeout: timeout
  });
};

/**
 * 邮件服务
 *
 * @param {*} headers
 * @param {*} timeout
 * @param {*}
 */
const emailClient = ({ headers, timeout } = {}) => {
  return createRequest({
    url: config.domain.emailService,
    headers,
    dataHandler: function(data) {
      if (data && +data.status === 1) {
        return data.data;
      } else {
        throw new Error(`status: ${data.status}, msg: ${data.message}`);
      }
    },
    timeout
  });
};

/**
 * 截屏服务
 *
 * @param {*} headers
 * @param {*} dataHandler
 * @param {*} timeout
 * @param {*}
 */
const screenShotClient = ({ headers, dataHandler, timeout }) => {
  return createRequest({ url: config.domain.screenShotService, headers, dataHandler, timeout });
};

/**
 * 发票服务
 *
 * @param {*} headers
 * @param {*} timeout
 * @param {*}
 */
const invoiceClient = ({ headers, timeout }) => {
  return createRequest({
    url: config.domain.invoiceService,
    headers,
    dataHandler: (data) => {
      if (data && +data.status === 1) {
        const result = data.data;
        return result;
      } else {
        throw new Error(`invoice service invoke failed,status:${data.status},message:${data.message}`);
      }
    },
    timeout
  });
};

/**
 * 短信服务
 *
 * @param {*} headers
 * @param {*} timeout
 * @param {*}
 */
const smsClient = ({ headers, timeout }) => {
  return createRequest({
    url: config.domain.smsService,
    headers,

    dataHandler: (data) => {
      if (data && +data.status === 1) {
        const result = data.data;
        if (result.trade_no || result.status === 'SUCCESS') {
          return result;
        } else {
          throw new Error(`invoice service invoke failed,status:${result.status},message:${result.message}`);
        }
      }
      throw new Error(`invoice service invoke failed,status:${data.status},message:${data.message}`);
    },
    timeout
  });
};

/**
 * 企业认证启信宝服务
 *
 * @param {*} headers
 * @param {*} timeout
 * @param {*}
 */
const qxbClaimClient = ({ headers, timeout }) => {
  return createRequest({
    url: config.domain.qxbClaimService,
    headers,
    dataHandler: (data) => {
      if (data && +data.status === 1) {
        const result = data.data;
        return result;
      } else {
        throw new Error(`claim sync service invoke failed,status:${data.status},message:${data.message}`);
      }
    },
    timeout
  });
};

/**
 * 企业认证通知启信宝企业信息变更
 *
 * @param {*} headers
 * @param {*} dataHandler
 * @param {*} timeout
 * @param {*}
 */
const qxbSyncEntBaseInfo = ({ headers, dataHandler, timeout }) => {
  return createRequest({
    url: config.domain.qxbSyncEntInfo,
    headers,
    dataHandler,
    timeout
  });
};

/**
 * 企业认证启信宝服务
 *
 * @param {*} headers
 * @param {*} timeout
 * @param {*}
 */
const orderSyncClient = ({ headers, timeout }) => {
  return createRequest({
    url: config.pay.payGateway,
    headers,
    dataHandler: (data) => {
      if (data && (+data.ret === 0 || +data.ret === 115)) {
        const result = data.data;
        return result;
      } else {
        throw new Error(`order sync service invoke failed,status:${data.ret},message:${data.err}`);
      }
    },
    timeout
  });
};

/**
 * 名片认证CC服务
 * @param {*} headers
 * @param {*} timeout
 * @param {*}
 */
const cardClaimClient = ({ headers, timeout }) => {
  return createRequest({
    url: config.domain.cardClaimService,
    headers,
    dataHandler: (data) => {
      if (data && +data.ret === 0) {
        const result = data.data;
        return result;
      } else {
        throw new Error(`card sync service invoke failed,status:${data.ret},message:${data.err}`);
      }
    },
    timeout
  });
};

/**
 * 阿里内容安全
 * @param {*} headers
 * @param {*} timeout
 * @param {*}
 */
const aliContentSecurityClient = ({ headers, timeout }) => {
  return createRequest({
    url: config.domain.aliContentSecurity,
    headers,
    dataHandler: (data) => {
      if (data && +data.code === 200) {
        const result = data.data;
        const err = _.find(result, (r) => r.code !== 200);
        if (err) {
          throw new Error(`ali content security service invoke failed,status:${err.code},message:${err.msg}`);
        }
        return result;
      } else {
        throw new Error(`ali content security service invoke failed,status:${data.code},message:${data.msg}`);
      }
    },
    timeout
  });
};

/**
 * 内容审核
 * @param {*} param0
 */
const censorClient = ({ headers, timeout }) => {
  return createRequest({
    url: config.domain.censorService,
    headers: headers,
    dataHandler: (data) => {
      if (data && +data.ret === 200003) {
        throw new Error(`intsig content security service invoke failed,status:${data.ret},message:${data.err}`);
      } else {
        return data.data;
      }
    },
    timeout: timeout
  });
};

/**
 * 更新搜索数据
 * @param {*} param0
 */
const searchSyncClient = ({ url, headers, timeout }) => {
  return createRequest({
    url,
    headers,
    dataHandler: (data) => {
      if (data && +data.ret === 0) {
        return data;
      } else {
        throw new Error(`search update service invoke failed,status:${data.ret},message:${data.err}`);
      }
    },
    timeout
  });
};

/**
 * 大数据平台接口
 * @param {*} param0
 */
const qxbBossClient = ({ url, headers, timeout }) => {
  return createRequest({
    url,
    headers,
    dataHandler: (data) => {
      if (data && +data.code === 0) {
        return data.data;
      } else {
        throw new Error(`错误代码：${data.code}，错误信息：${data.message}`);
      }
    },
    timeout
  });
};

const ccPictureAuditClient = () => {
  return createRequest({
    url: config.domain.cardClaimService,
    headers: null,
    dataHandler: (data) => {
      if (data && data.err === 0) {
        return data.data;
      } else {
        throw new TypeError(`cc图片审核结果推送失败：status：${data.err}，msg：${data.msg}`);
      }
    },
    timeout: 4000
  });
};

const enterpriseNgxClient = (headers, dataHandler) => {
  return createRequest({
    url: config.domain.enterpriseNgx,
    headers,

    timeout: 4000,
    dataHandler:
      dataHandler ||
      function(data) {
        if (data && +data.status === 1) {
          return data.data;
        } else {
          throw new TypeError(`status: ${data.status}, msg: ${data.message}`);
        }
      }
  });
};

const ccInternalServiceClient = (dataHandler) => {
  return createRequest({
    url: config.domain.cardClaimService,
    timeout: 4000,
    dataHandler:
      dataHandler ||
      function(data) {
        if (data && data.ret === '0') {
          return data.data;
        } else {
          throw new TypeError(`status ${data.ret}, msg: ${data.err}`);
        }
      }
  });
};

const clientBackendClient = (headers, dataHandler) => {
  return createRequest({
    url: config.domain.clientBackend,
    headers,

    timeout: 4000,
    dataHandler:
      dataHandler ||
      function(data) {
        if (data && +data.status === 1) {
          return data.data;
        } else {
          throw new TypeError(`status: ${data.status}, msg: ${data.message}`);
        }
      }
  });
};

const fileDownloadClient = (timeout) => {
  const { reqId, userId } = context.getCtx();
  const client = axios.create({
    responseType: 'stream',
    timeout: timeout,
    state: {
      reqId,
      userId
    }
  });
  client.interceptors.request.use(
    httpLoggerInterceptor.request.getOnFulfilled(),
    httpLoggerInterceptor.request.getOnRejected(bizLogger)
  );
  client.interceptors.request.use(paramHandlerInterceptor.request.getOnFulfilled());
  // setup interceptor for response
  client.interceptors.response.use(
    httpLoggerInterceptor.response.getOnFulfilled(apiLogger),
    httpLoggerInterceptor.response.getOnRejected(apiLogger)
  );
  client.interceptors.response.use(null, exceptionHandlerInterceptor.response.getOnRejected());
  return client;
};

module.exports = {
  emailClient,
  createRequest,
  requestDetail,
  requestList,
  screenShotClient,
  invoiceClient,
  smsClient,
  qxbClaimClient,
  cardClaimClient,
  aliContentSecurityClient,
  qxbSyncEntBaseInfo,
  orderSyncClient,
  censorClient,
  searchSyncClient,
  qxbBossClient,
  ccPictureAuditClient,
  enterpriseNgxClient,
  ccInternalServiceClient,
  clientBackendClient,
  fileDownloadClient
};
