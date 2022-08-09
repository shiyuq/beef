class ModuleError {
  /**
   * 应用模块异常，一般根据业务分类。如user-error,order-error等
   * @param {String} errorCode 错误代码
   * @param {String} message 错误消息
   * @param {String} moduleCode 模块代码，系统级别异常1，组件异常2，
   */
  constructor(errorCode, message, moduleCode = '') {
    this.errorCode = moduleCode + errorCode;
    this.message = message;
  }
}

module.exports = ModuleError;
