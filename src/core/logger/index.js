const log4js = require('log4js');
const config = require('config');

const logger = log4js.configure(config.get('log4js'));

module.exports = {
  logger: logger,
  bizLogger: logger.getLogger('bizLog'), // elk日志，bizLogger.info(message),bizLogger.error(message,error),bizLogger.info('[moduleName] message')
  apiLogger: logger.getLogger('apiLog'), // elk日志，apiLogger.info(message,apiLogObject)
  sqlLogger: logger.getLogger('sqlLog'), // elk日志，sqlLogger.info(message,sqlLogObject)
  businessLogger: logger.getLogger('businessLog'),
  payLogger: logger.getLogger('payLog')
};
