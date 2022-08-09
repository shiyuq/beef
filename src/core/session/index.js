const _ = require('lodash');
const config = require('config');
const util = require('../util');
const { cacheKey } = require('../cahce');
const { mainRedis } = require('../redis');
const { BizException } = require('../errors');

/**
 * 获取token的session信息
 * @param {String} token
 */
const getSession = async(token) => {
  const sessionInfo = await mainRedis.get(cacheKey.userSession(token));
  if (sessionInfo) {
    mainRedis.expire(cacheKey.userSession(token), config.get('tokenTimeOut'));
    return JSON.parse(sessionInfo);
  } else {
    return null;
  }
};

const setSession = async(session) => {
  if (!session || !_.isObject(session) || _.isEmpty(session)) {
    throw new BizException(BizException.UserErrors.userNotExist);
  }
  const token = util.uuid();

  await mainRedis.setex(cacheKey.userSession(token), config.get('tokenTimeOut'), JSON.stringify(session));

  return token;
};

/**
 * 移除token的session信息
 * @param {String} token
 */
const removeSession = async(token) => {
  await mainRedis.del(cacheKey.userSession(token));
};

module.exports = {
  getSession,
  setSession,
  removeSession
};
