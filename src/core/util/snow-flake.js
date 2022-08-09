const _ = require('lodash');
const FlakeId = require('flake-idgen');
const intFormat = require('biguint-format');
const redis = require('../redis');

redis.mainRedis.defineCommand('cycleCount', {
  numberOfKeys: 1,
  lua: `local key = KEYS[1]
  local val = redis.call("incr", key);
  
  if val >= tonumber(ARGV[1])
  then
      redis.call('SET', key, ARGV[2])
  end
  return val`
});

const getWorker = async() => {
  const worker = await redis.mainRedis.cycleCount('worker', 1023, 0);
  return worker;
};

let flakeIdGen = new FlakeId({ id: _.random(0, 1023, false) })

;(async() => {
  const worker = await getWorker();
  flakeIdGen = new FlakeId({ id: worker });
})();

const generateId = () => {
  const id = intFormat(flakeIdGen.next(), 'dec');
  return id;
};

module.exports = {
  generateId
};
