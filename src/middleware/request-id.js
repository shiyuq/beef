const _ = require('lodash');
const utils = require('../core/util');

/**
 * Return middleware that gets an unique request id from a header or generates a new id.
 *
 * @param {Object} [options={}] - Optional configuration.
 * @param {String|Function} [options.header=x-request-id] - Request header name to get the forwarded request id. or function to get request id
 * function(ctx){return requestId}
 * @param {String|Function} [options.exposeHeader=x-request-id] - Response header name. or function to set response header
 * function(ctx,requestId){return}
 * @param {Function} [options.generator=uuidV4] - Id generator function.
 * @return {Function} Koa middleware.
 */
module.exports = (options = {}) => {
  const { header = 'x-request-id', exposeHeader = 'x-request-id', generator = utils.uuid } = options;
  return async function requestId(ctx, next) {
    if (_.isString(header)) {
      ctx.state.reqId = ctx.request.headers[header];
    } else if (_.isFunction(header)) {
      ctx.state.reqId = header(ctx);
    }
    if (!ctx.state.reqId) {
      ctx.state.reqId = generator();
    }
    if (_.isFunction(exposeHeader)) {
      exposeHeader(ctx, ctx.state.reqId);
    } else if (_.isString(exposeHeader)) {
      ctx.response.set(exposeHeader, ctx.state.reqId);
    }

    return next();
  };
};
