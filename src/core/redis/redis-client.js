const Redis = require('ioredis');
const _ = require('lodash');

/**
 * 创建redisClient
 * @param {Object} option 连接配置
 * @param {String} option.host 主机
 * @param {String} option.port 端口
 * @param {String} option.password 密码
 * @param {String} option.db db索引
 * @param {String} [option.prefix] redis Key前缀
 * @param {Object} [logger=console]
 * @param {Function} logger.info info(message)
 * @param {Function} logger.error error(message,option,err)
 * @returns @see {IORedis.Redis}
 */
const client = (option, logger = console) => {
  const redis = new Redis({
    commandTimeout: 5000,
    // 自动重连
    retryStrategy(times) {
      const delay = Math.min(times * 500, 2000);
      return delay;
    },
    ...option
  });
  redis.on('error', (err) => {
    logger.error('[redisClient] An error occurred while connecting', _.pick(option, 'host', 'db'), err);
  });
  return redis;
};

module.exports = {
  client
};
