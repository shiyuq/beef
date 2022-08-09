const httpStatus = require('../../http-status');

const chinese = /[\u4e00-\u9fa5]/;

function handleException(error) {
  if (error.response) {
    // The request was made and the server responded with a status code
    // that falls out of the range of 2xx
    if (+error.response.status === 500) {
      const err = new Error(chinese.test(error.response.data.message) ? error.response.data.message : '系统内部错误');
      err.status = 500;
      err.errcode = error.response.data.status;
      return Promise.reject(err);
    } else {
      const err = httpStatus.getError(error.response.status);
      if (err) {
        return Promise.reject(err);
      } else {
        const err = new Error('未知错误');
        err.status = 500;
        return Promise.reject(err);
      }
    }
  } else if (error.request) {
    // The request was made but no response was received
    // `error.request` is an instance of XMLHttpRequest in the browser and an instance of
    // http.ClientRequest in node.js
    const err = new Error(error.message || 'request error');
    err.status = 500;
    return Promise.reject(err);
  } else {
    // something happened in setting up the request that triggered an Error
    const err = new Error(error.message);
    err.status = 500;
    return Promise.reject(err);
  }
}

module.exports = {
  handleException
};
