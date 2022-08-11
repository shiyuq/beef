/**
 * @param {Knex} knex knex实例
 * @param {Object} namespace cls-hooked命名空间；cls.createNamespace('my-very-own-namespace');
 */
module.exports = (knex, namespace) => {
  /**
   * 事务scope，此范围中的sql，自动加入当前事务
   * @param {*} fn
   * @returns
   */
  const transaction = async(fn) => {
    const trx = await knex.transaction();
    try {
      const result = await namespace.runPromise(async() => {
        namespace.set('transaction', trx);
        const result = await fn();
        await trx.commit();
        return result;
      });
      return result;
    } catch (err) {
      await trx.rollback();
      throw err;
    }
  };

  /**
   * sql是否需要加入当前事务
   * @param {*} builder
   * @returns
   */
  const addTransaction = (builder) => {
    const trx = namespace.get('transaction');
    if (trx && !trx.isCompleted()) {
      builder.transacting(trx);
      return true;
    }
    return false;
  };

  return {
    transaction,
    addTransaction
  };
};
