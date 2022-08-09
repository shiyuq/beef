const clsHook = require('cls-hooked');
const dataSource = require('./data-source');

const { createNamespace } = clsHook;

const trxNamespace = createNamespace('trx-scope');

/**
 * 事务scope，此范围中的sql，自动加入当前事务
 * @param {*} fn
 * @returns
 */
const transaction = async(fn) => {
  const trx = await dataSource.write().transaction();
  try {
    const result = await trxNamespace.runPromise(async() => {
      trxNamespace.set('trx', trx);
      const result = await fn();
      trx.commit();
      return result;
    });
    return result;
  } catch (err) {
    trx.rollback();
    throw err;
  }
};

/**
 * sql是否需要加入当前事务
 * @param {*} builder
 * @returns
 */
const addTransaction = (builder) => {
  const trx = trxNamespace.get('trx');
  if (trx && !trx.isCompleted()) {
    builder.transacting(trx);
    return true;
  }
  return false;
};

/**
 * 当前是否在事务中
 * @param {*} builder
 * @returns
 */
const onTransaction = (builder) => {
  const trx = trxNamespace.get('trx');
  if (trx && !trx.isCompleted()) {
    return true;
  }
  return false;
};

module.exports = {
  transaction,
  addTransaction,
  onTransaction
};
