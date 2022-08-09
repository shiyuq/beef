const day = require('dayjs');
const isSameOrBefore = require('dayjs/plugin/isSameOrBefore');
const isSameOrAfter = require('dayjs/plugin/isSameOrAfter');
const isBetween = require('dayjs/plugin/isBetween');
day.extend(isSameOrBefore);
day.extend(isSameOrAfter);
day.extend(isBetween);

module.exports = (joi) => ({
  type: 'date',
  base: joi.any(),
  messages: {
    'date.isBefore': '"{{#label}}" must be before {{#date}}, with precision "{{#precision}}"',
    'date.isAfter': '"{{#label}}" must be after {{#date}}, with precision "{{#precision}}"',
    'date.isSameOrBefore': '"{{#label}}" must be same as or before {{#date}}, with precision "{{#precision}}"',
    'date.isSameOrAfter': '"{{#label}}" must be same as or after {{#date}}, with precision "{{#precision}}"',
    'date.iso': '{{#label}} must match the format "{{#format}}"',
    'date.diff':
      'time span between "{{#label}}" and {{#date}} must be {{#operator}} {{#res}}, with precision "{{#precision}}"'
  },
  coerce(value, helpers) {
    // No value
    if (!value) {
      value = null;
      return { value };
    }

    // Convert to day
    if (!day.isDayjs(value)) {
      value = day(value);
    }
    // If invalid at this stage, return as is
    if (!value.isValid()) {
      return;
    }

    // Get flags
    const tz = helpers.schema.$_getFlag('tz');
    const startOf = helpers.schema.$_getFlag('startOf');
    const endOf = helpers.schema.$_getFlag('endOf');
    const max = helpers.schema.$_getFlag('max');
    const min = helpers.schema.$_getFlag('min');
    const format = helpers.schema.$_getFlag('format');

    // Apply a timezone
    if (tz) {
      value.tz(tz);
    }

    // Start of period
    if (startOf) {
      value = value.startOf(startOf);
    }

    // End of period
    if (endOf) {
      value = value.endOf(endOf);
    }

    // Min date
    if (min && value.isBefore(min)) {
      value = min;
    }

    // Max date
    if (max && value.isAfter(max)) {
      value = max;
    }

    // format date
    if (format) {
      value = value.format(format);
    }
    // Return value
    return { value };
  },
  validate(value, helpers) {
    // No value
    if (!value) {
      return value;
    }

    // Invalid date provided
    if (!day(value).isValid()) {
      const errors = helpers.error('date.iso', { format: 'iso_8601' });
      return { value, errors };
    }
  },
  rules: {
    tz: {
      method(tz) {
        return this.$_setFlag('tz', tz);
      }
    },
    startOf: {
      method(startOf) {
        return this.$_setFlag('startOf', startOf);
      }
    },
    endOf: {
      method(endOf) {
        return this.$_setFlag('endOf', endOf);
      }
    },
    maxDate: {
      method(max) {
        return this.$_setFlag('max', max);
      }
    },
    minDate: {
      method(min) {
        return this.$_setFlag('min', min);
      }
    },
    format: {
      convert: true,
      method(format) {
        return this.$_setFlag('format', format);
      },
      args: [
        {
          name: 'format',
          ref: true,
          assert: (value) => !value || typeof value === 'string',
          message: 'must be a date format string '
        }
      ]
    },
    formatDate: {
      method() {
        return this.format('YYYY-MM-DD');
      }
    },
    formatDateTime: {
      method() {
        return this.format('YYYY-MM-DD HH:mm:ss');
      }
    },
    isBefore: {
      method(date, precision) {
        return this.$_addRule({
          name: 'isBefore',
          args: { date, precision }
        });
      },
      args: [
        {
          name: 'date',
          ref: true,
          assert: (value) => !value || typeof value === 'string' || day.isDayjs(value),
          message: 'must be a date string or day object'
        },
        {
          name: 'precision',
          assert: (value) => typeof value === 'string',
          message: 'must be a string'
        }
      ],
      validate(value, helpers, args) {
        let { date, precision } = args;
        if (!date) {
          return value;
        }
        if (!precision) {
          precision = 'milliseconds';
        }
        if (typeof date === 'string') {
          date = day(date);
        }
        const mntValue = day(value);
        if (!mntValue.isValid() || mntValue.isBefore(date, precision)) {
          return value;
        }
        return helpers.error('date.isBefore', {
          date: day.isDayjs(date) ? date.format('YYYY-MM-DD HH:mm:ss:SSS') : date,
          precision
        });
      }
    },
    isAfter: {
      method(date, precision) {
        return this.$_addRule({
          name: 'isAfter',
          args: { date, precision }
        });
      },
      args: [
        {
          name: 'date',
          ref: true,
          assert: (value) => !value || typeof value === 'string' || day.isDayjs(value),
          message: 'must be a date string or day object'
        },
        {
          name: 'precision',
          assert: (value) => typeof value === 'string',
          message: 'must be a string'
        }
      ],
      validate(value, helpers, args) {
        let { date, precision } = args;
        if (!date) {
          return value;
        }
        if (!precision) {
          precision = 'milliseconds';
        }
        if (typeof date === 'string') {
          date = day(date);
        }
        const mntValue = day(value);
        if (!mntValue.isValid() || mntValue.isAfter(date, precision)) {
          return value;
        }
        return helpers.error('date.isAfter', {
          date: day.isDayjs(date) ? date.format('YYYY-MM-DD HH:mm:ss:SSS') : date,
          precision
        });
      }
    },
    isSameOrBefore: {
      method(date, precision) {
        return this.$_addRule({
          name: 'isSameOrBefore',
          args: { date, precision }
        });
      },
      args: [
        {
          name: 'date',
          ref: true,
          assert: (value) => !value || typeof value === 'string' || day.isDayjs(value),
          message: 'must be a date string or day object'
        },
        {
          name: 'precision',
          assert: (value) => typeof value === 'string',
          message: 'must be a string'
        }
      ],
      validate(value, helpers, args) {
        let { date, precision } = args;
        if (!date) {
          return value;
        }
        if (!precision) {
          precision = 'milliseconds';
        }
        if (typeof date === 'string') {
          date = day(date);
        }
        const mntValue = day(value);
        if (!mntValue.isValid() || mntValue.isSameOrBefore(date, precision)) {
          return value;
        }
        return helpers.error('date.isSameOrBefore', {
          date: day.isDayjs(date) ? date.format('YYYY-MM-DD HH:mm:ss:SSS') : date,
          precision
        });
      }
    },
    isSameOrAfter: {
      method(date, precision) {
        return this.$_addRule({
          name: 'isSameOrAfter',
          args: { date, precision }
        });
      },
      args: [
        {
          name: 'date',
          ref: true,
          assert: (value) => !value || typeof value === 'string' || day.isDayjs(value),
          message: 'must be a date string or day object'
        },
        {
          name: 'precision',
          assert: (value) => typeof value === 'string',
          message: 'must be a string'
        }
      ],
      validate(value, helpers, args) {
        let { date, precision } = args;
        if (!date) {
          return value;
        }
        if (!precision) {
          precision = 'milliseconds';
        }
        if (typeof date === 'string') {
          date = day(date);
        }
        const mntValue = day(value);
        if (!mntValue.isValid() || mntValue.isSameOrAfter(date, precision)) {
          return value;
        }
        return helpers.error('date.isSameOrAfter', {
          date: day.isDayjs(date) ? date.format('YYYY-MM-DD HH:mm:ss:SSS') : date,
          precision
        });
      }
    },
    diff: {
      method(date, precision, operator, res, abs = false) {
        return this.$_addRule({
          name: 'diff',
          args: { date, precision, operator, res, abs }
        });
      },
      args: [
        {
          name: 'date',
          ref: true,
          assert: (value) => !value || typeof value === 'string' || day.isDayjs(value),
          message: 'must be a date string or day object'
        },
        {
          name: 'precision',
          assert: (value) => typeof value === 'string',
          message: 'must be a string'
        },
        {
          name: 'operator',
          assert: (value) => ['=', '!=', '<', '<=', '>', '>='].indexOf(value) !== -1,
          message: 'must be one of [=,!=,<,<=,>,>=]'
        },
        {
          name: 'res',
          ref: true,
          assert: joi.number()
        },
        {
          name: 'abs',
          ref: true,
          assert: joi.bool()
        }
      ],
      validate(value, helpers, args) {
        const { operator, res, abs } = args;
        let { date, precision } = args;
        if (!date) {
          return value;
        }
        if (!precision) {
          precision = 'milliseconds';
        }
        if (typeof date === 'string') {
          date = day(date);
        }
        const mntValue = day(value);
        if (!mntValue.isValid()) {
          return value;
        }
        let diff = mntValue.diff(date, precision);
        if (abs) {
          diff = Math.abs(diff);
        }
        date = day.isDayjs(date) ? date.format('YYYY-MM-DD HH:mm:ss:SSS') : date;
        switch (operator) {
          case '=':
            return diff === res ? value : helpers.error('date.diff', { date, precision, res, operator });
          case '!=':
            return diff !== res ? value : helpers.error('date.diff', { date, precision, res, operator });
          case '<':
            return diff < res ? value : helpers.error('date.diff', { date, precision, res, operator });
          case '<=':
            return diff <= res ? value : helpers.error('date.diff', { date, precision, res, operator });
          case '>':
            return diff > res ? value : helpers.error('date.diff', { date, precision, res, operator });
          case '>=':
            return diff >= res ? value : helpers.error('date.diff', { date, precision, res, operator });
          default:
            break;
        }
        return helpers.error('date.diff', { date, precision, res, operator });
      }
    }
  }
});
