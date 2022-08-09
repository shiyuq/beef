const responseInterceptor = require('./response-interceptor');

module.exports = {
  response: {
    getOnRejected() {
      return responseInterceptor.handleException;
    }
  }
};
