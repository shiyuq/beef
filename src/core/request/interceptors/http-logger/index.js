const requestInterceptor = require('./request-interceptor');
const buildResponseLogger = require('./response-interceptor');

module.exports = {
  request: {
    getOnFulfilled() {
      return requestInterceptor.injectTimeProperty;
    },
    getOnRejected(logger) {
      return requestInterceptor.requestLogger(logger);
    }
  },
  response: {
    getOnFulfilled(logger, config) {
      return buildResponseLogger(logger, config, false);
    },
    getOnRejected(logger, config) {
      return buildResponseLogger(logger, config, true);
    }
  }
};
