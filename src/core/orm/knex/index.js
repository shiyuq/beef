const _ = require('lodash');
const sqlString = require('sqlstring');
const util = require('../../util');
const trxScope = require('./trx-scope');
const context = require('../../context');
const knexProxy = require('./knex-proxy');
const knexModel = require('./knex-model');
const dataSourceManager = require('./data-source');

class KnexPro {
  constructor({ config, logSql, modelConfig, ns, logger }) {
    this.config = config;
    this.logSql = logSql;
    this.dataSource = dataSourceManager(config);
    this.trxScope = trxScope(this.dataSource.write(), ns);
    this.knexProxy = knexProxy(this.dataSource, this.trxScope, config, logSql);
    const modelBase = knexModel(this.knexProxy, modelConfig);
    this.Model = modelBase.Model;
    this.SplitTableModel = modelBase.SplitTableModel;
    this.logger = logger || console;
  }

  transaction(fn) {
    return this.trxScope.transaction(fn);
  }

  async executeSql(sql, params) {
    const ctx = await context.getCtx();
    const startTime = new Date().getTime();
    const builder = this.knexProxy.raw(sql, params);

    let server = 'write';
    let transaction = false;
    try {
      if (this.trxScope.addTransaction(builder)) {
        transaction = true;
      } else if (_.startsWith(_.toLower(_.trim(sql)), 'select') && !this.forceMaster) {
        builder.client = this.dataSource.read().client;
        server = 'read';
      }
      let result = await builder;
      if (this.logSql) {
        const sqlLog = {
          reqId: ctx?.reqId,
          sql: sqlString.format(sql, params),
          sqlId: util.MD5(sql),
          duration: Date.now() - startTime,
          poolUsed: builder.client.pool?.numUsed(),
          poolFree: builder.client.pool?.numFree(),
          server,
          transaction
        };
        this.logger.info('sql-query-response', sqlLog);
      }
      result = _.map(result[0], (data) => {
        if (_.isArray(data)) {
          return _.map(data, (r) => _.mapKeys(r, (v, k) => _.camelCase(k)));
        }
        return _.mapKeys(data, (v, k) => _.camelCase(k));
      });
      return result;
    } catch (err) {
      if (this.logSql) {
        const sqlLog = {
          reqId: ctx?.reqId,
          sql: sqlString.format(sql, params),
          sqlId: util.MD5(sql),
          duration: Date.now() - startTime,
          error: err,
          poolUsed: builder.client.pool?.numUsed(),
          poolFree: builder.client.pool?.numFree(),
          server,
          transaction
        };
        this.logger.error('sql-query-error', sqlLog, err);
      }
      throw err;
    }
  }

  async executePageSql(sql, params, offset = 0, limit = 5) {
    params = params || [];
    const pageParams = _.clone(params);
    pageParams.push(offset);
    pageParams.push(limit);
    const countSql = `select count(*) as total from (${sql}) as pageTemp`;
    const pageSql = `select * from (${sql}) as pageTemp limit ?,?`;
    const [total, items] = await Promise.all([this.executeSql(countSql, params), this.executeSql(pageSql, pageParams)]);
    return {
      total: total[0].total,
      items,
      hasNextPage: offset + limit < total[0].total
    };
  }
}

module.exports = KnexPro;
