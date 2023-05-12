/**
 * 权限
 */
const permissions = {
  login: {
    authLogin: 'api-login-authLogin'
  },
  file: {
    importFile: 'api-file-importFile',
    insertData: 'api-file-insertData',
    getProvince: 'api-file-getProvince'
  }
};

/**
 * 匿名用户
 */
const anonymous = [
  permissions.login.authLogin,
  permissions.file.importFile,
  permissions.file.insertData,
  permissions.file.getProvince
];

/**
 * 普通用户
 */
const normal = [
  ...anonymous
];

/**
 * 管理员用户
 */
const admin = [
  ...normal
];

/**
 * 角色
 * 匿名用户，普通用户与ops用户的角色控制基于用户
 * 管理员用户与超级管理员用户的角色控制基于用户与eid
 */
const role = {
  anonymous: anonymous,
  normal: normal,
  admin: admin
};

module.exports = {
  role,
  ...permissions
};
