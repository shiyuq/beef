const _ = require('lodash');

/**
 * 权限
 */
const permissions = {
  login: {
    authLogin: 'api-login-authLogin'
  },
  openFile: {
    uploadBase64: 'api-openFile-uploadBase64'
  }
};

/**
 * ops用户
 */
const ops = [
  ..._.values(permissions.openFile)
];

/**
 * 匿名用户
 */
const anonymous = [
  ...ops,
  permissions.login.authLogin
];

/**
 * 普通用户
 */
const normal = [
  ...anonymous
];

/**
 * 实名认证管理员用户
 */
const admin = [
  ...normal
];

/**
 * 实名认证超级管理员用户
 */
const superAdmin = [
  ...admin
];

/**
 * 角色
 * 匿名用户，普通用户与ops用户的角色控制基于用户
 * 管理员用户与超级管理员用户的角色控制基于用户与eid
 */
const role = {
  anonymous: anonymous,
  normal: normal,
  admin: admin,
  superAdmin: superAdmin
};

module.exports = {
  role,
  ...permissions
};
