const _ = require('lodash');
function injectTimeProperty(config) {
  config.state = _.extend(
    {
      start: new Date().getTime()
    },
    config.state || {}
  );
  return config;
}

function requestLogger(logger) {
  return function(err) {
    logger.error('[thirdRequest] request invoke failed', err);
    return Promise.reject(err);
  };
}

module.exports = {
  injectTimeProperty,
  requestLogger
};
