const ModuleError = require('./module-error');
class UserModuleError extends ModuleError {
  constructor(status, message) {
    super(status, message, '1');
  }
}

const UserErrors = {
  userExist: new UserModuleError('001', '手机号码{0}已注册'),
  userNotExist: new UserModuleError('002', '用户不存在'),
  noContactNumber: new UserModuleError('003', '请先绑定手机号码'),
  userNoValid: new UserModuleError('004', '用户账号不合法'),
  platformNotMatch: new UserModuleError('005', '用户平台来源不一致'),
  grantExist: new UserModuleError('006', '已经授权成功，请勿重复操作')
};

module.exports = UserErrors;
