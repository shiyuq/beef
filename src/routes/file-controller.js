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

const insertData = async(ctx) => {
  const result = await db.transaction(() => fileService.insertData());
  ctx.ok(result);
};

const getProvince = async(ctx) => {
  const result = await fileService.getProvince();
  ctx.ok(result);
};

const getData = async(ctx) => {
  const body = ctx.request.body;
  let input = {
    type: body.type || 'beef',
    startDate: body.startDate,
    endDate: body.endDate,
    provinceList: body.provinceList || []
  };

  const schema = joi.object({
    type: joi.string().valid('beef', 'beefGuess').required(),
    startDate: joi.date().formatDate(),
    endDate: joi.date().formatDate(),
    provinceList: joi.array().items(joi.string().nullable())
  });
  const valid = schema.validate(input, { allowUnknown: true });
  if (valid.error) {
    throw valid.error;
  }
  input = valid.value;
  const result = await fileService.getData(input);
  ctx.ok(result);
};

const router = new Router({
  prefix: '/file'
});
router.post('/import', acl({ permission: permissions.file.importFile }), importFile);
router.post('/data/insert', acl({ permission: permissions.file.insertData }), insertData);
router.post('/province/get', acl({ permission: permissions.file.getProvince }), getProvince);
router.post('/data/get', acl({ permission: permissions.file.getData }), getData);
module.exports = router;
