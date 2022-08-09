const _ = require('lodash');
const knex = require('knex');
const config = require('config');
const sqlString = require('sqlstring');
const { sqlLogger } = require('../../logger');
const dataSource = require('./data-source');
const util = require('../../util');
const trxScope = require('./trx-scope');
const context = require('../../context');
const writePool = dataSource.write().client.pool;
const readPool = dataSource.read().client.pool;

const logSql = (ctx, queryBuilder, server, transaction) => {
  if (!config.get('mysql').logSql) return;
  const startTime = Date.now();
  const pool = server === 'write' ? writePool : readPool;
  queryBuilder
    .on('query', () => {})
    .on('query-error', (error, data) => {
      const sqlLog = {
        reqId: ctx?.reqId,
        sql: sqlString.format(data.sql, data.bindings),
        sqlId: util.MD5(data.sql),
        duration: Date.now() - startTime,
        method: data.method,
        poolUsed: pool?.numUsed(),
        poolFree: pool?.numFree(),
        server,
        transaction
      };
      sqlLogger.error('sql-query-error', sqlLog, error);
      throw error;
    })
    .on('query-response', (response, data, builder) => {
      const sqlLog = {
        reqId: ctx?.reqId,
        sql: sqlString.format(data.sql, data.bindings),
        sqlId: util.MD5(data.sql),
        duration: Date.now() - startTime,
        method: data.method,
        poolUsed: pool?.numUsed(),
        poolFree: pool?.numFree(),
        server,
        transaction
      };
      sqlLogger.info('sql-query-response', sqlLog);
    });
};

const _trx = (ctx, builder) => {
  let server = 'write';
  let transaction = false;
  // 加入当前事务管理器，开启事务默认走写数据库，参见transaction-scope
  if (trxScope.addTransaction(builder)) {
    // builder.client = dataSource.write().client
    transaction = true;
  } else if (_.find(['select', 'first'], (m) => m === _.toLower(builder.toSQL().method)) && !builder.forceMaster) {
    builder.client = dataSource.read().client;
    server = 'read';
  } else {
    builder.client = dataSource.write().client;
  }
  logSql(ctx, builder, server, transaction);
};

/**
 * knex 拓展分页方法，分页方法必须位于链式调用的最后。因为分页方法直接返回结果，不返回QueryBuilder
 * totalCount若等价于true，则进行count查询。若totalCount为true，则使用自动生成的count语句；否则将
 * totalCount视为count语句
 */
knex.QueryBuilder.extend('page', async function(offset = 0, limit = 5, totalCount = true) {
  if (!_.isNumber(offset)) {
    throw new Error('Paginate error: offset must be a number.');
  }
  if (!_.isNumber(limit)) {
    throw new Error('Paginate error: limit must be a number.');
  }
  let pagination = {};
  let countQuery = null;
  const ctx = await context.getCtx();
  _trx(ctx, this);

  if (totalCount) {
    countQuery =
      totalCount === true
        ? new this.constructor(this.client)
          .count(this.client.raw('*'))
          .from(this.clone().offset(0).clearOrder().as('count__query__'))
          .first()
          .debug(this._debug)
        : totalCount;
    _trx(ctx, countQuery);
  }
  this.offset(offset).limit(limit);
  const [result, countResult] = await Promise.all([this, countQuery]);
  if (countResult && countResult.count >= 0) {
    const total = countResult.count;
    pagination = {
      total,
      hasNextPage: offset + limit < total
    };
  }
  return { items: result, ...pagination };
});

knex.QueryBuilder.extend('exec', async function() {
  if (!this._timeout) {
    this.timeout(5000, { cancel: true }); // 默认超时
  }
  const ctx = await context.getCtx();
  _trx(ctx, this);
  return this;
});

/**
 * 强制使用写库
 */
knex.QueryBuilder.extend('onMaster', function() {
  this.forceMaster = true;
  return this;
});

const knexClient = knex(dataSource.knexConfig());

module.exports = knexClient;
