const _ = require('lodash');
const { DBException } = require('../../errors');
const idStrategy = require('./id-strategy');
const Model = require('./model');
/**
 * 单库分表模式，暂不支持跨库的分表，跨库事务无法友好控制。
 *
 */
class SplitTableModel {
  /**
   * 单库分表模式
   * @param {String[]} column 列名
   * @param {String} tableName 表名
   * @param {Function} splitFunc 分表算法 function(splitData){return tableIndex}
   * @param {String} [splitChar='_'] 表名与索引的分隔符，默认为下划线
   */
  constructor({ column, tableName, idGenerator, createdTime, lastUpdateTime, rowStatus, splitFunc, splitChar = '_' }) {
    this.column = column;
    this.tableName = tableName;
    this.splitFunc = splitFunc;
    this.splitModels = [];
    this.splitChar = splitChar;
    this.idGenerator = idGenerator || idStrategy.snowFlakeID;
    this.createdTime = createdTime || 'createdTime';
    this.lastUpdateTime = lastUpdateTime || 'lastUpdateTime';
    this.rowStatus = rowStatus || 'rowStatus';
  }

  /**
   * 计算分表后的表名
   *
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

  /**
   * 分表
   *
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
      rowStatus: this.rowStatus
    });
    this.splitModels.push(model);
    return model;
  }
}

module.exports = SplitTableModel;
