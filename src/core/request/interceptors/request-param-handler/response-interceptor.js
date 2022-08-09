const { get, isFunction } = require('lodash');

function handleResponse(response) {
  const dataHandler = get(response, 'config.state.dataHandler');
  if (isFunction(dataHandler)) {
    return dataHandler(response.data);
  }
  return response.data;
}

module.exports = {
  handleResponse
};
