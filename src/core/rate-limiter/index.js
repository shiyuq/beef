const RateLimit = require('async-ratelimiter');
const { mainRedis } = require('../redis');

const rateLimiter = new RateLimit({
  db: mainRedis,
  max: 50,
  duration: 3 * 3600 * 1000 // 每3小时访问限制50次
});

module.exports = rateLimiter;
