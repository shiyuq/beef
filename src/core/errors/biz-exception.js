const BaseException = require('./base-exception');
const BusinessErrors = require('./error-enum/business-error');
const UserErrors = require('./error-enum/user-error');
const CommonErrors = require('./error-enum/common-error');

/**
 * 业务异常类，业务异常正常使用200的http状态码。
 */
class BizException extends BaseException {
  /**
   *
   * @param {Object} moduleError 错误枚举
   * @param {String} moduleError.errorCode 错误代码
   * @param {String} moduleError.message 错误消息模板
   * @param {...String} param 参数列表
   */
  constructor(moduleError, ...param) {
    super(moduleError, param);
    this.name = 'BizException';
  }
}

BizException.BusinessErrors = BusinessErrors;
BizException.UserErrors = UserErrors;
BizException.CommonErrors = CommonErrors;

module.exports = BizException;
