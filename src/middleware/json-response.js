const config = require('config');

/**
 * http响应格式
 */
module.exports = () => async(ctx, next) => {
  ctx.ok = (data) => {
    ctx.body = {
      status: 1,
      message: 'ok',
      data
    };
  };
  ctx.error = (err) => {
    ctx.body = {
      status: -err.errorCode,
      message: err.message,
      stack: config.get('defaultConfig').resErrorStack ? err.stack : undefined
    };
  };
  await next();
};
