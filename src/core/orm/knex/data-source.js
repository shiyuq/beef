const _ = require('lodash');
const knex = require('knex');
const config = require('config');
const util = require('../../util');

const knexConfig = (connection, poolConfig) => {
  return {
    client: 'mysql2',
    connection: {
      ...connection,
      charset: 'utf8mb4',
      // supportBigNumbers和bigNumberStrings都开启，所有bigint和decimal都会被转换为string
      // 只开启supportBigNumbers则只当数字超出safe integer时才转为string
      supportBigNumbers: true,
      typeCast(field, next) {
        if (field.type === 'TINY' && +field.length === 1) {
          const val = field.string();
          if (val === null || val === undefined) return val;
          return val === '1'; // 1 = true, 0 = false
        }
        if (field.type === 'JSON') {
          const val = field.buffer();
          if (val === null || val === undefined) return val;
          return JSON.parse(val.toString('utf-8'));
        }
        return next();
      }
    },
    pool: poolConfig,
    wrapIdentifier: (value, origImpl) => origImpl(_.snakeCase(value)),
    postProcessResponse: (result) => {
      if (!result) return;
      return util.camelCaseModel(result);
    },
    useNullAsDefault: true
  };
};

const knexRead = _.map(config.get('mysql').connection.read, (c) => knex(knexConfig(c, config.get('mysql').pool)));

const knexWrite = knex(knexConfig(config.get('mysql').connection.write, config.get('mysql').pool));

const write = () => knexWrite;

const read = () => knexRead[_.random(knexRead.length - 1)];

module.exports = {
  knexConfig,
  write,
  read
};
