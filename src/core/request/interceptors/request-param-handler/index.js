const requestInterceptor = require('./request-interceptor');
const responseInterceptor = require('./response-interceptor');

module.exports = {
  request: {
    getOnFulfilled() {
      return requestInterceptor.handleParam;
    }
  },
  response: {
    getOnFulfilled() {
      return responseInterceptor.handleResponse;
    }
  }
};
