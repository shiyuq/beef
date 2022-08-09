const ModuleError = require('./module-error');

class DBError extends ModuleError {
  /**
   * 数据库模块异常
   * @param {String} errorCode 错误代码
   * @param {String} message 错误消息
   */
  constructor(errorCode, message) {
    super(errorCode, message, '1');
  }
}

const DBErrors = {
  CANNOT_GET_SPLIT_TABLE_NAME: new DBError('001', '无效生成有效的分表表名，表名{0}，分表参数：{1}')
};

module.exports = DBErrors;
