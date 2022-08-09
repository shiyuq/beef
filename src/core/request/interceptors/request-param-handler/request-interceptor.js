function handleParam(config) {
  if (!config.url) {
    throw new Error('axios configuration error，missing url');
  }
  return config;
}

module.exports = {
  handleParam
};
