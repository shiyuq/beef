const _ = require('lodash');
const httpStatus = require('http-status');
const common = require('../constants/common');
const { role } = require('../constants/permissions');
const HttpException = require('../core/errors/http-exception');

/**
 * 接口权限验证
 * 默认接口匿名可访问，需显式申明所需权限或角色
 *
 * @param {String} permission 权限代码
 * @param {Boolean} check 是否校验
 */
module.exports = function({ permission, check = false }) {
  return async(ctx, next) => {
    if (!permission) return next();
    if (_.find(role.anonymous, (p) => p === permission)) {
      return next();
    }
    if (!ctx.state.user || ctx.state.userId === common.anonymousUser.id || ctx.state.userId === common.systemUser.id) {
      throw new HttpException(httpStatus.UNAUTHORIZED);
    }
    let userRole = role.normal;
    if (check) {
      // const userId = ctx.state.user.id;
      // const permisson = await userService.getUserRoles({ userId: userId });
      // userRole = role[permisson?.role];
      userRole = role.superAdmin;
    }
    const access = _.find(userRole, (p) => p === permission);
    if (!access) {
      throw new HttpException(httpStatus.FORBIDDEN);
    }
    return next();
  };
};
