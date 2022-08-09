const httpStatus = require('http-status');
const schedule = require('node-schedule');
const common = require('../../constants/common');
const context = require('../context');
const { HttpException } = require('../errors');
const { bizLogger } = require('../logger');
const redlock = require('../redis/redis-redlock');
const util = require('../util');

const scheduleJob = (cron, ttl, job, fn) => {
  schedule.scheduleJob(job, cron, async() => {
    await context.ctxScope(
      {
        user: common.systemUser,
        userId: common.systemUser.id,
        reqId: util.uuid()
      },
      async() => {
        try {
          bizLogger.debug(`[${job}] schedule job start`);
          await redlock.lock(job, ttl, fn);
          bizLogger.debug(`[${job}] schedule job finished`);
        } catch (err) {
          if (err instanceof HttpException && err.errorCode === httpStatus.LOCKED) {
            return;
          }
          bizLogger.error(`[${job}] schedule job failed`, err, { cron, ttl });
        }
      }
    );
  });
};

module.exports = {
  scheduleJob
};
