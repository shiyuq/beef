const _ = require('lodash');
const config = require('config');
const sqlString = require('sqlstring');
const knex = require('./knex');
const util = require('../../util');
const trxScope = require('./trx-scope');
const context = require('../../context');
const idStrategy = require('./id-strategy');
const dataSource = require('./data-source');
const { sqlLogger } = require('../../logger');

function onInsert(props) {
  props.id = props.id || this.idGenerator();
  props[this.createdTime] = props[this.createdTime] || util.getNowStr();
  props[this.lastUpdateTime] = props[this.lastUpdateTime] || util.getNowStr();
  if (!props.createdUser) {
    const ctx = context.getCtx();
    if (ctx) {
      props.createdUser = ctx.userId;
      props.lastUpdateUser = ctx.userId;
    }
  }
  if (!props.lastUpdateUser) {
    props.lastUpdateUser = props.createdUser;
  }
  return props;
}

class Model {
  constructor({ column, tableName, idGenerator, createdTime, lastUpdateTime }) {
    this.column = column;
    this.tableName = tableName;
    this.idGenerator = idGenerator || idStrategy.snowFlakeID;
    this.createdTime = createdTime || 'createdTime';
    this.lastUpdateTime = lastUpdateTime || 'lastUpdateTime';
    this.knex = knex;
  }

  /**
   * 根据主键查找一条记录
   *
   * @param {String|Number} id 主键
   * @param {String[]=this.column} props 查询返回的字段，默认全部
   * @returns
   */
  async getOne(id, props) {
    if (!id) {
      return null;
    }
    const sql = knex(this.tableName).select(props || this.column);
    sql.where({ id }).first();
    const data = await sql.exec();
    return data ?? null;
  }

  /**
   * 根据id批量查询数据
   * @param {string[]|number[]} idArray id数组
   * @param {string[]} props 查询的列
   * @param {Object[]} orderBy 排序
   * @returns 对应记录
   */
  async list(idArray, props, orderBy) {
    const sql = knex(this.tableName)
      .select(props || this.column)
      .whereIn('id', idArray);
    if (orderBy) {
      sql.orderBy(orderBy);
    }
    return sql.exec();
  }

  /**
   * 查询一条记录
   *
   * @param {Object} where 筛选条件
   * @param {String[]=this.column} props
   * @param {Object[]} orderBy 排序规则
   * @returns
   */
  async findOne(where, props, orderBy) {
    const sql = knex(this.tableName).select(props || this.column);
    if (where) sql.where(where);
    if (orderBy) sql.orderBy(orderBy);
    const data = await sql.first().exec();
    return data ?? null;
  }

  /**
   * 查询记录
   *
   * @param {Object} where 筛选条件
   * @param {String[]=this.column} props
   * @param {Object[]} orderBy 排序规则
   * @param {Number} limit 记录条数限制
   * @returns
   */
  async findAll(where, props, orderBy, limit) {
    const sql = knex(this.tableName).select(props || this.column);
    if (where) sql.where(where);
    if (orderBy) sql.orderBy(orderBy);
    if (limit) sql.limit(limit);
    return sql.exec();
  }

  /**
   * 统计记录数
   *
   * @param {Object} where 筛选条件
   * @returns
   */
  async count(where) {
    const sql = knex.count(knex.raw('*')).from(this.tableName).first();
    if (where) sql.where(where);
    const count = await sql.exec();
    return count.count;
  }

  /**
   * 新增记录
   *
   * @param {Object|Object[]} props 属性字段
   */
  async insert(props) {
    if (_.isArray(props)) {
      props = _.map(props, onInsert.bind(this));
    } else {
      props = onInsert.call(this, props);
    }
    const data = await knex.insert(props).into(this.tableName).exec();
    if (!_.isArray(props) && _.isNil(props.id)) {
      props.id = data && data[0];
    }
    return props;
  }

  /**
   * 新增记录并返回记录值
   *
   * @param {Object} props 属性字段
   */
  async insertAndFetch(props) {
    const data = await this.insert(props);
    return knex(this.tableName).select(this.column).where({ id: data.id }).first().onMaster().exec();
  }

  /**
   * 根据id更新一条记录
   *
   * @param {String} id 主键
   * @param {String[]} props 需更新的属性
   */
  async update(id, props) {
    const ctx = context.getCtx();
    props = util.setDbUpdateCommonFields(props, ctx.userId);
    return knex.update(props).from(this.tableName).where({ id }).exec();
  }

  /**
   * 根据id更新一条记录，并返回更新后的记录
   *
   * @param {String} id 主键
   * @param {String[]} props 需更新的属性
   */
  async updateAndFetch(id, props) {
    await this.update(id, props);
    return knex(this.tableName).select(this.column).where({ id: id }).first().onMaster().exec();
  }

  /**
   * 若id存在则更新，否则新增一条记录
   * @param {Object} props 要新增或更新的对象
   */
  async save(props) {
    if (props.id) {
      return this.update(props.id, _.omit(props, 'id'));
    } else {
      return this.insert(props);
    }
  }

  /**
   * 若id存在则更新，否则新增一条记录
   * @param {Object} props 要新增或更新的对象
   */
  async saveAndFetch(props) {
    if (props.id) {
      return this.updateAndFetch(props.id, _.omit(props, 'id'));
    } else {
      return this.insertAndFetch(props);
    }
  }

  /**
   * 根据过滤条件批量更新记录
   *
   * @param {Object} where 过滤条件
   * @param {String[]} props 需更新属性
   */
  async updateByFilters(where, props) {
    const ctx = context.getCtx();
    props = util.setDbUpdateCommonFields(props, ctx.userId);
    return knex.update(props).from(this.tableName).where(where).exec();
  }

  /**
   * 根据id移除一条记录
   *
   * @param {String} id
   */
  async delete(id) {
    return knex.del().from(this.tableName).where({ id }).exec();
  }

  /**
   * 根据过滤条件批量移除记录
   *
   * @param {Object} where 过滤条件
   */
  async deleteByFilters(where) {
    return knex.del().from(this.tableName).where(where).exec();
  }

  /**
   * 分页查询
   *
   * @param {Object} where 分页条件
   * @param {String[]} props 查询的列名
   * @param {Object[]} orderBy 排序
   * @param {int} limit 每页数量
   * @param {int} offset 分页起始
   */
  async page(where, props, orderBy, offset, limit) {
    const pageSql = knex.select(props || this.column).from(this.tableName);
    if (where) pageSql.where(where);
    if (orderBy) pageSql.orderBy(orderBy);
    return pageSql.page(offset, limit);
  }

  /**
   * 判断表中是否存在满足条件的记录
   * @param {object} where 筛选条件
   * @returns 是否存在满足条件的记录
   */
  async exists(where) {
    const record = await knex(this.tableName).select('id').where(where).limit(1).exec();
    return !_.isEmpty(record);
  }

  async executeSql(sql, params) {
    const ctx = await context.getCtx();
    const startTime = new Date().getTime();
    const builder = this.knex.raw(sql, params);

    let server = 'write';
    let transaction = false;
    try {
      if (trxScope.addTransaction(builder)) {
        // builder.client = dataSource.write().client
        transaction = true;
      } else if (_.startsWith(_.toLower(_.trim(sql)), 'select') && !this.forceMaster) {
        builder.client = dataSource.read().client;
        server = 'read';
      } else {
        builder.client = dataSource.write().client;
      }

      let result = await builder;
      if (config.get('mysql').logSql) {
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
        sqlLogger.info('sql-query-response', sqlLog);
      }
      result = _.map(result[0], (data) => {
        if (_.isArray(data)) {
          return _.map(data, (r) => _.mapKeys(r, (v, k) => _.camelCase(k)));
        }
        return _.mapKeys(data, (v, k) => _.camelCase(k));
      });
      return result;
    } catch (err) {
      if (config.get('mysql').logSql) {
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
        sqlLogger.error('sql-query-error', sqlLog, err);
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

module.exports = Model;
