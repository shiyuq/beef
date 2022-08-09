const Redlock = require('redlock');
const { LockError } = require('redlock');
const httpStatus = require('http-status');
const redisIns = require('./index');
const { HttpException } = require('../errors');
const { bizLogger } = require('../logger');
// see https://github.com/mike-marcacci/node-redlock
const redlock = new Redlock([redisIns.mainRedis], {
  // the expected clock drift; for more details
  // see http://redis.io/topics/distlock
  driftFactor: 0.01, // time in ms

  // the max number of times Redlock will attempt
  // to lock a resource before erroring
  retryCount: 0,

  // the time in ms between attempts
  retryDelay: 100, // time in ms

  // the max time in ms randomly added to retries
  // to improve performance under high contention
  // see https://www.awsarchitectureblog.com/2015/03/backoff.html
  retryJitter: 200 // time in ms
});

/**
 * 执行方法前，执行分布式锁。
 * @param {String||Array} resources 锁标识，支持数组
 * @param {Int} ttl 锁过期时间，毫秒ms
 * @param {function} fn 执行的函数
 */
const lock = async(resources, ttl, fn) => {
  resources += ':lock';
  let l = null;
  try {
    l = await redlock.lock(resources, ttl);
    bizLogger.debug(`[redisLock] lock start:${resources}`, resources);
    const result = await fn();
    return result;
  } catch (err) {
    if (err instanceof LockError) {
      throw new HttpException(httpStatus.LOCKED);
    }
    throw err;
  } finally {
    if (l) {
      try {
        bizLogger.debug(`[redisLock] lock preunlock,${resources}`, resources);
        await l.unlock(); // 解锁失败不报错
        bizLogger.debug(`[redisLock] lock unlock,${resources}`, resources);
      } catch (e) {
        bizLogger.error(`[redisLock] lock release error,${resources}`, resources, e);
      }
    }
  }
};

module.exports = {
  lock
};
