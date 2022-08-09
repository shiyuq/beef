const clsHook = require('cls-hooked');
const _ = require('lodash');

const { createNamespace } = clsHook;

const session = createNamespace('session');

const ctxScope = async(ctx, fn) => {
  const result = await session.runPromise(async() => {
    session.set('ctx', ctx);
    const result = await fn();
    return result;
  });
  return result;
};

const getCtx = () => {
  return session.get('ctx');
};

const updateCtx = (ctx) => {
  return session.set('ctx', ctx);
};

const mergeCtx = (value) => {
  const ctx = getCtx();
  return session.set('ctx', _.assign(ctx, value));
};

module.exports = {
  getCtx,
  ctxScope,
  updateCtx,
  mergeCtx
};
