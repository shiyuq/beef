const _ = require('lodash');
const dayjs = require('dayjs');
const idGenerator = require('./id-strategy');
const { DBException } = require('../../errors');

/**
 * @param {typeof knex} knex
 * @param {Object} globalOptions
 * @param {Function} globalOptions.idGenerator 主键生成策略
 * @param {String} globalOptions.createdTime=createdTime 数据库添加字段名称，格式YYYY-MM-DD HH:mm:ss
 * @param {String} globalOptions.updateTIme=lastUpdateTime 数据库更新字段名称 格式YYYY-MM-DD HH:mm:ss
 * @param {String} globalOptions.rowStatus 数据有效性字段名称，true有效，false无效
 */
const knexModel = (knex, globalOptions) => {
  const getNowStr = () => {
    return dayjs().format('YYYY-MM-DD HH:mm:ss');
  };
  const defaultOptions = {
    idGenerator: idGenerator.uuid,
    createdTime: 'created_time',
    lastUpdateTime: 'last_update_time',
    timestamp: getNowStr,
    rowStatus: undefined
  };
  const options = _.assign(defaultOptions, globalOptions);

  class Model {
    constructor({ column, tableName, idGenerator, createdTime, lastUpdateTime, timestamp, rowStatus }) {
      this.column = column;
      this.tableName = tableName;
      this.idGenerator = idGenerator || options.idGenerator;
      this.createdTime = createdTime || options.createdTime;
      this.lastUpdateTime = lastUpdateTime || options.lastUpdateTime;
      this.rowStatus = rowStatus || options.rowStatus;
      this.timestamp = timestamp || options.timestamp;
      this.knex = knex;
    }

    /**
     * 根据主键查找一条记录
     *
     * @param {String|Number} id 主键
     * @param {String[]=this.column} column 查询返回的字段，默认全部
     * @returns
     */
    async getOne(id, column) {
      if (!id) {
        return null;
      }
      const sql = this.knex(this.tableName)
        .select(column || this.column)
        .where({ id })
        .first();
      if (this.rowStatus) sql.where({ [this.rowStatus]: true });
      const data = await sql;
      return data === undefined ? null : data;
    }

    /**
     * 根据id批量查询数据
     * @param {string[]|number[]} idArray id数组
     * @param {string[]} column 查询的列
     * @param {Object[]} orderBy 排序
     * @returns 对应记录
     */
    async list(idArray, column, orderBy) {
      const sql = this.knex(this.tableName)
        .select(column || this.column)
        .whereIn('id', idArray);
      if (this.rowStatus) sql.where({ [this.rowStatus]: true });
      if (orderBy) sql.orderBy(orderBy);
      const data = await sql;
      return data;
    }

    /**
     * 查询一条记录
     *
     * @param {Object} where 筛选条件
     * @param {String[]=this.column} props
     * @param {Object[]} orderBy 排序规则
     * @returns
     */
    async findOne(where, column, orderBy) {
      const sql = this.knex(this.tableName).select(column || this.column);
      if (this.rowStatus) sql.where({ [this.rowStatus]: true });
      if (where) sql.where(where);
      if (orderBy) sql.orderBy(orderBy);
      const data = await sql.first();
      return data === undefined ? null : data;
    }

    /**
     * 查询记录
     *
     * @param {Object} where 筛选条件
     * @param {String[]=this.column} column
     * @param {Object[]} orderBy 排序规则
     * @param {Number} limit 记录条数限制
     * @returns
     */
    async findAll(where, column, orderBy, limit) {
      const sql = this.knex(this.tableName).select(column || this.column);
      if (this.rowStatus) sql.where({ [this.rowStatus]: true });
      if (where) sql.where(where);
      if (orderBy) sql.orderBy(orderBy);
      if (limit) sql.limit(limit);
      const data = await sql;
      return data;
    }

    /**
     * 统计记录数
     *
     * @param {Object} where 筛选条件
     * @returns
     */
    async count(where) {
      const sql = this.knex(this.tableName)
        .count({ count: knex.raw('*') })
        .first();
      if (this.rowStatus) sql.where({ [this.rowStatus]: true });
      if (where) sql.where(where);
      const data = await sql;
      return data.count;
    }

    /**
     * 新增记录
     *
     * @param {Object} props 属性字段
     */
    async insert(props) {
      props.id = props.id || this.idGenerator();
      if (this.createdTime) {
        props[this.createdTime] = props[this.createdTime] || this.timestamp();
      }
      if (this.lastUpdateTime) {
        props[this.lastUpdateTime] = props[this.lastUpdateTime] || this.timestamp();
      }
      if (this.rowStatus) {
        props[this.rowStatus] = props[this.rowStatus] || true;
      }
      const data = await this.knex(this.tableName).insert(props);
      if (_.isNil(props.id)) {
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
      return this.getOne(data.id);
    }

    /**
     * 根据id更新一条记录
     *
     * @param {String} id 主键
     * @param {Object} props 需更新的属性
     */
    async update(id, props) {
      if (this.lastUpdateTime) {
        props[this.lastUpdateTime] = props[this.lastUpdateTime] || this.timestamp();
      }
      const sql = this.knex(this.tableName).update(props).where({ id });
      if (this.rowStatus) sql.where({ [this.rowStatus]: true });
      const data = await sql;
      return data;
    }

    /**
     * 根据id更新一条记录，并返回更新后的记录
     *
     * @param {String} id 主键
     * @param {Object} props 需更新的属性
     */
    async updateAndFetch(id, props) {
      await this.update(id, props);
      return this.getOne(id);
    }

    /**
     * 根据过滤条件批量更新记录
     *
     * @param {Object} where 过滤条件
     * @param {Object} props 需更新属性
     */
    async updateByFilters(where, props) {
      if (this.lastUpdateTime) {
        props[this.lastUpdateTime] = props[this.lastUpdateTime] || this.timestamp();
      }
      const sql = this.knex(this.tableName).update(props).where(where);
      if (this.rowStatus) sql.where({ [this.rowStatus]: true });
      const data = await sql;
      return data;
    }

    /**
     * 根据id移除一条记录
     *
     * @param {String} id
     */
    async delete(id) {
      return this.knex(this.tableName).del().where({ id });
    }

    /**
     * 根据id逻辑删除一条记录
     *
     * @param {String} id
     */
    async destroy(id) {
      if (this.rowStatus) {
        return this.update(id, { [this.rowStatus]: false });
      }
      throw new Error('invalid rowStatus,not support destroy method');
    }

    /**
     * 根据过滤条件批量移除记录
     *
     * @param {Object} where 过滤条件
     */
    async deleteByFilters(where) {
      return this.knex(this.tableName).del().where(where);
    }

    /**
     * 根据条件逻辑删除一条记录
     *
     * @param {String} id
     */
    async destroyByFilters(where) {
      if (this.rowStatus) {
        return this.updateByFilters(where, { [this.rowStatus]: false });
      }
      throw new Error('invalid rowStatus,not support destroy method');
    }

    /**
     * 分页查询
     *
     * @param {Object} where 分页条件
     * @param {String[]} column 查询的列名
     * @param {Object[]} orderBy 排序
     * @param {int} limit 每页数量
     * @param {int} offset 分页起始
     */
    async page(where, column, orderBy, offset, limit) {
      const sql = this.knex(this.tableName).select(column || this.column);
      if (this.rowStatus) sql.where({ [this.rowStatus]: true });
      if (where) sql.where(where);
      const countSql = sql
        .clone()
        .clearSelect()
        .count({ count: knex.raw('*') })
        .first();
      if (orderBy) sql.orderBy(orderBy);

      const [items, { count }] = await Promise.all([sql.offset(offset).limit(limit), countSql]);
      return {
        total: count,
        hasNextPage: offset + limit < count,
        items: items
      };
    }

    /**
     * 判断表中是否存在满足条件的记录
     * @param {object} where 筛选条件
     * @returns 是否存在满足条件的记录
     */
    async exists(where) {
      const sql = this.knex(this.tableName).select('id').where(where).limit(1);
      if (this.rowStatus) sql.where({ [this.rowStatus]: true });
      const data = await sql;
      return !_.isEmpty(data);
    }
  }

  class SplitTableModel {
    /**
     * 单库分表模式
     * @param {String[]} column 列名
     * @param {String} tableName 表名
     * @param {Function} splitFunc 分表算法 function(splitData){return tableIndex}
     * @param {String} [splitChar='_'] 表名与索引的分隔符，默认为下划线
     */
    constructor({
      column,
      tableName,
      idGenerator,
      createdTime,
      lastUpdateTime,
      timestamp,
      rowStatus,
      splitFunc,
      splitChar = '_'
    }) {
      this.column = column;
      this.tableName = tableName;
      this.idGenerator = idGenerator;
      this.createdTime = createdTime;
      this.lastUpdateTime = lastUpdateTime;
      this.timestamp = timestamp;
      this.rowStatus = rowStatus;
      this.splitFunc = splitFunc;
      this.splitModels = [];
      this.splitChar = splitChar;
      this.knex = knex;
    }

    /**
     * 计算分表后的表名
     * @param {Object} ctx 上下文
     * @param {Object} data 分表计算参数
     * @returns
     */
    getSplitTableName(data) {
      let tableIndex = this.splitFunc(data);
      if (_.isObject(tableIndex) && _.isFunction(tableIndex.then)) {
        tableIndex = tableIndex.then();
      }
      if (!tableIndex) {
        throw new DBException(DBException.DBErrors.INVALID_TABLE_NAME, (data && JSON.stringify(data)) || 'null');
      }
      const splitTableName = this.tableName + this.splitChar + tableIndex;
      return splitTableName;
    }

    splitKnex(data) {
      return this.knex(this.getSplitTableName(data));
    }

    /**
     * 分表
     * @param {Object} ctx 上下文
     * @param {Object} data 分表参数
     * @returns {Model}
     */
    split(data) {
      const splitTableName = this.getSplitTableName(data);
      let model = _.find(this.splitModels, (s) => s.tableName === splitTableName);
      if (model) return model;
      model = new Model({
        column: this.column,
        tableName: splitTableName,
        idGenerator: this.idGenerator,
        createdTime: this.createdTime,
        lastUpdateTime: this.lastUpdateTime,
        timestamp: this.timestamp,
        rowStatus: this.rowStatus
      });
      this.splitModels.push(model);
      return model;
    }
  }
  return { Model, SplitTableModel };
};

module.exports = knexModel;
