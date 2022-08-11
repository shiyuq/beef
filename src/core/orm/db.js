const _ = require('lodash');
const config = require('config');
const cls = require('cls-hooked');
const KnexPro = require('./knex');
const util = require('../util');
const idStrategy = require('./knex/id-strategy');

const ns = cls.createNamespace(config.get('mysql').db.write.database);

const db = new KnexPro({
  logSql: config.get('mysql').logSql,
  ns: ns,
  modelConfig: {
    idGenerator: idStrategy.uniqueId
  },
  config: {
    client: 'mysql2',
    replication: {
      read: config.get('mysql').db.read,
      write: config.get('mysql').db.write
    },
    connection: {
      charset: 'utf8mb4',
      dateStrings: true,
      typeCast(field, next) {
        if (field.type === 'LONGLONG') {
          const val = field.string();
          if (val === null || val === undefined) return val;
          if (val.length >= 15) return val;
          return parseInt(val, 10);
        }
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
    pool: config.get('mysql').pool,
    wrapIdentifier: (value, origImpl) => origImpl(_.snakeCase(value)),
    postProcessResponse: (result) => {
      if (!result) return;
      return util.camelCaseModel(result);
    },
    useNullAsDefault: true
  }
});

module.exports = db;
