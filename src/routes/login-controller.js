const Router = require('@koa/router');
const joi = require('../core/joi');
const acl = require('../middleware/access-control');
const permissions = require('../constants/permissions');
const userService = require('../services/user-service');

/**
 * @api {post} /auth/login 登陆
 * @apiVersion 1.0.0
 * @apiName authLogin
 * @apiGroup auth
 *
 * @apiDescription 用户登录
 * @apiParam {String} token 第三方平台的令牌
 * @apiParam {String} openid 第三方平台的用户标识
 *
 * @apiSuccessExample {json} Success-Response:
  {
    "status": 200,
    "message": "ok",
    "data": {
        "userInfo": {
          "name": "韩正天",
          "nickName": "Arthurhan",
          "contactNumber": "15962664438"
        },
        "token": "27d9efd2-ebe3-441b-a492-bfe035cdac91"
    }
  }
 */
const authLogin = async(ctx) => {
  const body = ctx.request.body;
  let input = {
    token: body.token,
    openid: body.openid
  };

  const schema = joi.object({
    token: joi.string().required(),
    openid: joi.string().required()
  });
  const valid = schema.validate(input, { allowUnknown: true });
  if (valid.error) {
    throw valid.error;
  }
  input = valid.value;
  const result = await userService.login(input);
  ctx.ok(result);
};

const router = new Router({
  prefix: '/auth'
});
router.post('/login', acl({ permission: permissions.login.authLogin }), authLogin);
module.exports = router;
