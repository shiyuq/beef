const httpStatus = require('http-status');
const BaseException = require('./base-exception');

/**
 * http异常类，通常响应用户请求或第三方用户调用处理
 */
class HttpException extends BaseException {
  constructor(httpStatusCode, message) {
    super({ errorCode: httpStatusCode, message: message || httpStatus[httpStatusCode] });
    this.name = 'HttpException';
  }
}

module.exports = HttpException;
