const ModuleError = require('./module-error');

class CommonModuleError extends ModuleError {
  constructor(status, message) {
    super(status, message, '5');
  }
}

const CommonErrors = {
  fileNotExist: new CommonModuleError('001', '原文件不存在，请重新上传文件'),
  fileSaveFailed: new CommonModuleError('002', '文件保存失败'),
  sendEmailFailed: new CommonModuleError('003', '邮件发送失败'),
  fileDownloadFailed: new CommonModuleError('004', '文件下载失败'),
  districtNotExist: new CommonModuleError('005', '区县代码不存在'),
  remoteCallFailed: new CommonModuleError('006', '{0}'),
  onlyQxbUser: new CommonModuleError('007', '仅支持启信宝用户'),
  serverIsBusy: new CommonModuleError('008', '服务繁忙，请稍后再试！'),
  picAlreadyAudited: new CommonModuleError('009', '图片已审核过'),
  illegalMimeType: new CommonModuleError('010', '无效的媒体类型: {0}'),
  illegalFileExtension: new CommonModuleError('011', '无效的文件拓展名: {0}'),
  fileSizeBeyondLimit: new CommonModuleError('012', '文件大小超出限制: {0}'),
  downloadBeyondLimit: new CommonModuleError('013', '邮件发送今日已达上限，请明日再尝试'),
  versionTooOld: new CommonModuleError('014', '请升级app版本后使用此功能')
};

module.exports = CommonErrors;
