const utility = require('../../util');

/**
 * 雪花id
 */
const snowFlakeID = utility.seqId;

/**
 * uuid，带-横线分隔符
 */
const uuid = utility.uuid;

/**
 * uuid，不带-横线分隔符
 */
const uuidPure = utility.uuidPure;

/**
 * 自增长，不设置ID字段，由数据库实现
 */
const autoIncrement = () => undefined;

module.exports = {
  snowFlakeID,
  uuid,
  uuidPure,
  autoIncrement
};
