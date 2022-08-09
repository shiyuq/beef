const stringFormat = require('string-format');

stringFormat.extend(String.prototype);

/**
 * 应用异常基类
 */
class BaseException extends Error {
  /**
   * 应用异常
   * @param {Object} moduleError 模块错误类
   * @param {String} moduleError.errorCode 错误代码
   * @param {String} moduleError.message 错误消息
   * @param {...String} param 错误参数
   */
  constructor(moduleError, ...param) {
    super(moduleError.message?.format(...param));
    this.errorCode = moduleError.errorCode;
  }
}

module.exports = BaseException;
