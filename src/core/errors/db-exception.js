const BaseException = require('./base-exception');
const DBErrors = require('./error-enum/db-error');
/**
 * 数据库异常类，数据库异常正常使用500的http状态码。
 */
class DBException extends BaseException {
  /**
   *
   * @param {Object} moduleError 错误枚举
   * @param {String} moduleError.errorCode 错误代码
   * @param {String} moduleError.message 错误消息模板
   * @param {...String} param 参数列表
   */
  constructor(moduleError, ...param) {
    super(moduleError, ...param);
    this.name = 'DBException';
  }
}

DBException.DBErrors = DBErrors;

module.exports = DBException;
