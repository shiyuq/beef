const ModuleError = require('./module-error');

class BusinessModuleError extends ModuleError {
  constructor(status, message) {
    super(status, message, '6');
  }
}

const BusinessErrors = {
  noSubscribeConfig: new BusinessModuleError('001', '用户暂无默认订阅配置')
};

module.exports = BusinessErrors;
