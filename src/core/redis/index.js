const config = require('config');
const { bizLogger } = require('../logger');
const redisClient = require('./redis-client');

const mainRedis = redisClient.client(config.get('redis').mainRedis, bizLogger);
const syncEntInfoRedis = redisClient.client(config.get('redis').syncEntInfoRedis, bizLogger);

module.exports = { mainRedis, syncEntInfoRedis };
