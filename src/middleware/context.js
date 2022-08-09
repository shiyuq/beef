const common = require('../constants/common');
const context = require('../core/context');
const util = require('../core/util');

const httpCtx = async(ctx, next) => {
  ctx.state = {
    user: ctx.state.user,
    userId: ctx.state.user?.id || common.anonymousUser.id,
    userName: ctx.state.user?.name || common.anonymousUser.name,
    reqId: ctx.state.reqId || util.uuid(),
    clientType: ctx.state.clientType,
    ip: util.getIp(ctx)
  };
  await context.ctxScope(ctx.state, next);
};

module.exports = {
  httpCtx
};
