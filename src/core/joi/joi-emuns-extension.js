const _ = require('lodash');
const enums = require('../../enums/dic-table');

module.exports = (joi) => ({
  base: joi.any(),
  type: 'enum',
  messages: {
    valid: '"{{#label}}" must be a number or string',
    codeValid: '{{#label}} must be one of "{{#enums}}"'
  },
  validate(value) {
    return { value };
  },
  coerce(value, helpers) {
    if (value === undefined || value === '') {
      value = null;
    }
    if (value) {
      const map = helpers.schema.$_getFlag('map');
      if (map) {
        value = enums.getTableByCode(map, value);
        if (!value) {
          const errors = helpers.error('codeValid', {
            enums: _.join(
              _.map(_.values(map), (m) => {
                return `${m.code}:${m.name}`;
              }),
              ';'
            )
          });
          return { value, errors };
        }
      }
      return { value };
    }
    return { value };
  },
  rules: {
    map: {
      method(map) {
        return this.default(null).$_setFlag('map', map);
      }
    },
    asCode: {
      validate(value) {
        if (!value) {
          return value;
        }
        return value.code;
      }
    },
    asName: {
      validate(value) {
        if (!value) {
          return value;
        }
        return value.name;
      }
    }
  }
});
