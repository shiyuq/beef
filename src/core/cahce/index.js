const cacheManager = require('cache-manager');
const ioRedisStore = require('cache-manager-ioredis');
const redis = require('../redis');

const memoryCache = cacheManager.caching({
  store: 'memory',
  max: 100,
  ttl: 300,
  isCacheableValue: (value) => {
    return value !== null && value !== undefined;
  }
});

const redisCache = cacheManager.caching({
  redisInstance: redis.mainRedis,
  store: ioRedisStore,
  ttl: 300,
  isCacheableValue: (value) => {
    return value !== null && value !== undefined;
  }
});

const cacheKey = {
  userSession: (sessionId) => {
    return 'session:' + sessionId;
  }
};

module.exports = {
  memoryCache,
  redisCache,
  cacheKey
};
