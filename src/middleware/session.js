const _ = require('lodash');
const config = require('config');
const common = require('../constants/common');
const session = require('../core/session');

module.exports = async(ctx, next) => {
  const token =
    ctx.request.headers[config.get('session').name] ||
    ctx.request.body[config.get('session').name] ||
    ctx.request.query[config.get('session').name];
  if (!token) {
    if (_.startsWith(ctx.path, '/ops') || _.startsWith(ctx.path, '/open')) {
      ctx.state.user = common.systemUser;
    } else {
      ctx.state.user = common.anonymousUser;
    }
  } else {
    const user = await session.getSession(token);
    ctx.state.user = user;
  }
  return next();
};
