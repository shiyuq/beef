const _ = require('lodash');
const knex = require('knex');

const knexConfig = (config, connection, pool) => {
  config.connection = _.assign(config.connection, connection);
  config.pool = _.assign(config.pool, pool);
  return config;
};

module.exports = (config) => {
  if (config.replication) {
    const knexWrite = knex(knexConfig(config, config.replication.write));
    const write = () => knexWrite;
    const knexRead = _.map(config.replication.read, (c) => knex(knexConfig(config, c)));
    const read = () => knexRead[_.random(knexRead.length - 1)];
    return {
      write,
      read
    };
  } else {
    const knexWrite = knex(knexConfig(config));
    const write = () => knexWrite;
    return {
      write
    };
  }
};
