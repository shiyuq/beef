const _ = require('lodash');

class DicTable {
  constructor(code, name) {
    this.code = code;
    this.name = name;
  }
}

/**
 * 用户类型
 */
const userType = {
  superAdmin: new DicTable('1', '超级管理员'),
  admin: new DicTable('2', '管理员'),
  normalUser: new DicTable('3', '普通员工'),
  visitor: new DicTable('4', '游客')
};

/**
 * 根据代码查询字典表的名称
 * @param {object} dic 字典表
 * @param {string} code 字典代码
 */
const getNameByCode = (dic, code) => {
  if (!dic || !code) return null;
  const dicArray = _.values(dic);
  const index = _.findIndex(dicArray, ['code', code + '']);
  if (index >= 0) {
    return dicArray[index].name;
  }
  return null;
};

/**
 * 根据代码查询字典表的键值
 * @param {object} dic 字典表
 * @param {string} code 字典代码
 */
const getKeyByCode = (dic, code) => {
  if (!dic || !code) return null;
  const dicKeysArray = _.keys(dic);
  const dicValuesArray = _.values(dic);
  const index = _.findIndex(dicValuesArray, ['code', code + '']);
  if (index >= 0) {
    return dicKeysArray[index];
  }
  return null;
};

/**
 * 根据名称查询字典表的代码
 * @param {object} dic 字典表
 * @param {string} name 字典名称
 */
const getCodeByName = (dic, name) => {
  if (!dic || !name) return null;
  const dicArray = _.values(dic);
  const index = _.findIndex(dicArray, ['name', _.trim(name + '')]);
  if (index >= 0) {
    return dicArray[index].code;
  }
  return null;
};

/**
 * 根据代码查询字典表的字典项
 * @param {object} dic 字典表
 * @param {string} code 字典代码
 */
const getTableByCode = (dic, code) => {
  if (!dic || !code) return null;
  const dicArray = _.values(dic);
  const index = _.findIndex(dicArray, ['code', _.trim(code + '')]);
  if (index >= 0) {
    return dicArray[index];
  }
  return null;
};

module.exports = {
  userType,
  getNameByCode,
  getKeyByCode,
  getCodeByName,
  getTableByCode
};
