const joi = require('joi');
const { isFunction } = require('lodash');

const JoiMoment = require('./joi-date-extension');
const JoiEnums = require('./joi-emuns-extension');
const JoiString = require('./joi-string-extension');

const Joi = joi.extend(JoiMoment, JoiEnums, JoiString);

/**
 * joi校验
 * @param {Object} schema 校验规则
 * @param {Object} value 校验值
 * @param {Object} option 校验参数
 * @returns
 */
Joi.validate = function(schema, value, option = { stripUnknown: true }) {
  let res;
  if (isFunction(schema.validate)) {
    res = schema.validate(value, option);
  } else {
    res = joi.object(schema).validate(value, option);
  }

  if (res.error) {
    throw res.error;
  }

  return res.value;
};

module.exports = Joi;
