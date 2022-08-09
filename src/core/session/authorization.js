const crypto = require('crypto');
const NodeRSA = require('node-rsa');
const joi = require('../joi');
const config = require('../../config');
const userService = require('../../services/user-service');
const openConfig = require('../../routes/open/openConfig');

const getAuthorization = async(req, res) => {
  try {
    let authorization = req.headers[config.session.authorization] || req.query[config.session.authorization];
    authorization = await logParams(authorization);
    if (!authorization) return;
    const userInfo = await userService.ossLogin(req.requestContext, authorization, req.session);
    if (!userInfo || !userInfo.token) return;
    res.set(config.session.name, userInfo.token);
    req.requestContext.user = req.session && req.session.user;
    req.requestContext.userId = req.session && req.session.user && req.session.user.id;
    req.requestContext.platform = req.session && req.session.user && req.session.user.platform;
  } catch (err) {
    return null;
  }
};

const logParams = async(authorization) => {
  try {
    if (!authorization) return null;
    authorization = JSON.parse(authorization);
    let input = {
      userInfo: authorization.userInfo,
      appId: authorization.appId
    };
    let schema = joi.object().keys({
      appId: joi.string().required(),
      userInfo: joi.string().required()
    });
    let valid = schema.validate(input, { allowUnknown: true });
    if (valid.error) {
      return null;
    }
    const app = openConfig.getPlatform(input.appId);
    const rsa = new NodeRSA(app.privateKey, {
      encryptionScheme: {
        scheme: 'pkcs1',
        padding: crypto.constants.RSA_NO_PADDING,
        toString: function() {
          return 'pkcs1-nopadding';
        }
      }
    });
    input.userInfo = rsa.decrypt(input.userInfo, 'utf8');
    input.userInfo = JSON.parse(input.userInfo);
    schema = joi.object().keys({
      appId: joi.string().required(),
      userInfo: joi
        .object()
        .keys({
          userId: joi.string().required(),
          mobile: joi.string().required(),
          name: joi.string().nullable(),
          timestamp: joi
            .number()
            .ruleset.min(Date.now() - 30 * 60 * 1000)
            .max(Date.now() + 30 * 60 * 1000)
            .rule({ message: 'timestamp is invalid' })
        })
        .required()
    });
    valid = schema.validate(input, { allowUnknown: true });
    if (valid.error) {
      return null;
    }
    input = valid.value;
    input.platform = app.platform;
    return input;
  } catch (err) {
    return null;
  }
};

module.exports = async(ctx, next) => {
  if (ctx.path.match(/^\/auth\/login(.*)$/)) {
    return next();
  }
  if (ctx.state && ctx.state.user) {
    return next();
  }
  await getAuthorization(ctx);
  return next();
};
