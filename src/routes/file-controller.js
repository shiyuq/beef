const _ = require('lodash');
const Router = require('@koa/router');
const db = require('../core/orm/db');
const joi = require('../core/joi');
const util = require('../core/util');
const acl = require('../middleware/access-control');
const permissions = require('../constants/permissions');
const fileService = require('../services/file-service');

/**
 * @api {post} /file/import 文件导入
 * @apiVersion 1.0.0
 * @apiName importFile
 * @apiGroup file
 *
 * @apiDescription 文件导入
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
const importFile = async(ctx) => {
  let input = _.first(Object.values(ctx.request.files || {}));
  try {
    const schema = joi.object({
      size: joi.number().required(),
      filepath: joi.string().required(),
      newFilename: joi.string().required(),
      mimetype: joi.string().required(),
      originalFilename: joi.string().max(100).required()
    });
    const valid = schema.validate(input, { stripUnknown: true });
    if (valid.error) {
      throw valid.error;
    }
    input = valid.value;
    const result = await db.transaction(() => fileService.importFile(input));
    ctx.ok(result);
  } finally {
    util.deleteUploadFile(input);
  }
};

const router = new Router({
  prefix: '/file'
});
router.post('/import', acl({ permission: permissions.file.importFile }), importFile);
module.exports = router;
