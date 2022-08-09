const _ = require('lodash');
const rateLimiter = require('../core/rate-limiter');
const BizException = require('../core/errors/biz-exception');

const whiteIp = ['127.0.0.1', '121.236.118.52', '58.210.143.102'];

const rateLimitUrl = [];

const idGenerator = function(url, ip) {
  return ip + '#' + url;
};

const rateLimit = async(ctx, next) => {
  if (_.indexOf(whiteIp, ctx.state.ip) >= 0) {
    return next();
  }
  if (_.indexOf(rateLimitUrl, ctx.path) < 0) {
    return next();
  }
  const limit = await rateLimiter.get({
    id: idGenerator(ctx.path, ctx.state.ip),
    max: 50,
    duration: 3 * 3600 * 1000 // 每3小时访问限制50次
  });
  if (!limit.remaining) {
    throw new BizException(BizException.CommonErrors.serverIsBusy);
  }
  return next();
};

module.exports = rateLimit;
