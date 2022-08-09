const fs = require('fs');
const _ = require('lodash');
const path = require('path');
const { v4 } = require('uuid');
const dayjs = require('dayjs');
const CryptoJS = require('crypto-js');
const snowFlake = require('./snow-flake');
/**
 * 生成uuid
 * @returns uuid字符串
 */
const uuid = () => v4();

/**
 * 生成uuid
 * @returns uuid字符串
 */
const uuidPure = () => {
  return v4().replace(/-/g, '');
};

/**
 * 生成全局唯一的序列号
 * 序列号随时间递增，非连续，数字形式
 * @returns
 */
const seqId = () => snowFlake.generateId();

/**
 * 获取当前时间的字符串
 * @returns
 */
const getNowStr = (format = 'YYYY-MM-DD HH:mm:ss') => dayjs().format(format);

/**
 * 获取当前日期的字符串
 * @returns
 */
const getTodayStr = (format = 'YYYY-MM-DD') => dayjs().format(format);

/**
 * 设置数据库通用插入字段
 * @param {*} model 数据库实体
 * @param {*} createdUser 创建用户id
 * @param {*} lastUpdateUser 更新用户id
 */
const setDbInsertCommonFields = (model, createdUser, lastUpdateUser) => {
  const time = getNowStr();
  lastUpdateUser = lastUpdateUser || createdUser;
  model.id = model.id || seqId();
  model.createdUser = model.createdUser || createdUser;
  model.createdTime = model.createdTime || time;
  model.lastUpdateUser = model.lastUpdateUser || lastUpdateUser || model.createdUser;
  model.lastUpdateTime = model.lastUpdateTime || time;
  return model;
};

/**
 *设置数据库通用更新字段
 * @param {*} model 数据库实体
 * @param {*} lastUpdateUser 更新用户id
 */
const setDbUpdateCommonFields = (model, lastUpdateUser) => {
  model.lastUpdateUser = model.lastUpdateUser || lastUpdateUser;
  model.lastUpdateTime = getNowStr() || model.lastUpdateTime;
  return model;
};

/**
 * md5编码
 *
 * @param {String} str 待编码的字符串
 * @param {String} encoder 编码方式，默认hex
 * @returns
 */
const MD5 = (str, encoder = CryptoJS.enc.Hex) => CryptoJS.MD5(str).toString(encoder);

const toStandardCurrency = (str) => {
  if (!str || str === '-') {
    str = '0 万元人民币';
  }
  if (str.indexOf('（单位：元/万元）') !== -1) {
    return str;
  }
  let amount = str.replace(/(&nbsp;|\r|\n|\t|<([^>]+)>)/gi, '');
  amount = amount.replace(/\s+/g, '');
  amount = amount.toLowerCase().replace('null', '');
  // AH
  amount = amount.replace(/,/gi, '');
  // AH,JS
  amount = amount.replace('人民币', '');
  if (amount.indexOf('美') > 0) {
    amount = amount.replace('万元美元', '万美元');
  } else if (amount.indexOf('港') > 0) {
    amount = amount.replace('万元港元', '万港币');
    amount = amount.replace('万元港币', '万港币');
    amount = amount.replace('万香港元', '万港币');
    amount = amount.replace('万港元', '万港币');
  } else if (amount.indexOf('欧') > 0) {
    amount = amount.replace('万元欧元', '万欧元');
  } else if (amount.indexOf('英') > 0) {
    amount = amount.replace('万元英镑', '万英镑');
  } else if (amount.indexOf('日') > 0) {
    amount = amount.replace('万元日元', '万日元');
  } else if (amount.indexOf('澳') > 0) {
    amount = amount.replace('万元澳大利亚元', '万澳大利亚元');
  } else if (amount.indexOf('德') > 0) {
    amount = amount.replace('万元德国马克', '万德国马克');
  } else if (amount.indexOf('新') > 0) {
    amount = amount.replace('万元新加坡元', '万新加坡元');
  } else if (amount.indexOf('加') > 0) {
    amount = amount.replace('万元加拿大元', '万加拿大元');
  } else if (amount.indexOf('法') > 0) {
    amount = amount.replace('万元法国法郎', '万法国法郎');
  } else if (amount.indexOf('荷') > 0) {
    amount = amount.replace('万元荷兰盾', '万荷兰盾');
  } else if (amount.indexOf('瑞') > 0) {
    amount = amount.replace('万元瑞士法郎', '万瑞士法郎');
  } else if (amount.indexOf('丹') > 0) {
    amount = amount.replace('万元丹麦克郎', '万丹麦克郎');
  } else {
    while (amount.indexOf('万元') > -1) {
      amount = amount.replace('万元', '万');
    }
    amount = amount + '人民币';
  }
  amount = amount.replace('万', ' 万');
  if (amount.substr(0, '0 万'.length) === '0 万') {
    amount = '-';
  }
  if (amount && amount !== '-') {
    const money = parseFloat(amount.replace(/[\u4e00-\u9fa5]/gi, ''));
    const unit = amount.replace(/[^\u4e00-\u9fa5]/gi, '');
    if (!isNaN(money)) amount = parseFloat(money) + ' ' + unit;
  }
  return amount;
};

const _snakeCase = (obj) => {
  if (obj.constructor === Object) {
    const newObj = {};
    Object.entries(obj).forEach(([key, value]) => {
      newObj[_.snakeCase(key)] = value;
    });
    return newObj;
  } else {
    return _.snakeCase(obj);
  }
};

/**
 * 对象的key下划线命名
 * @param {} obj
 */
const snakeCaseModel = (obj) => {
  if (Array.isArray(obj)) {
    return obj.map((row) => _snakeCase(row));
  } else {
    return _snakeCase(obj);
  }
};

/**
 * 对象的key驼峰命名
 * @param {} obj
 */
const _camelCase = (obj) => {
  if (!obj) return obj;
  const newObj = {};
  Object.entries(obj).forEach(([key, value]) => {
    newObj[_.camelCase(key)] = value;
  });
  return newObj;
};

/**
 * 对象的key驼峰命名
 * @param {} obj
 */
const camelCaseModel = (obj) => {
  if (Array.isArray(obj)) {
    return obj.map((row) => _camelCase(row));
  } else {
    return _camelCase(obj);
  }
};

/**
 * 将日期字符串等格式化标准的YYYY-MM-DD
 * @param {String|Number|Date} str
 */
const formatDate = (str, format = 'YYYY-MM-DD') => {
  if (!str) return null;
  if (!dayjs(str).isValid()) return null;
  return dayjs(str).format(format);
};

/**
 * 删除文件
 * @param {String} path
 */
const deleteFile = (path) => {
  if (path && fs.existsSync(path)) {
    fs.unlinkSync(path);
  }
};

/**
 * 删除文件
 * @param {String} path
 */
const deleteBase64File = (base64File) => {
  if (!base64File) return;
  if (_.isPlainObject(base64File)) {
    deleteFile(base64File.path);
    return;
  }
  if (_.isArray(base64File)) {
    for (const file of base64File) {
      if (_.isPlainObject(file)) {
        deleteFile(file.path);
      } else {
        deleteFile(file);
      }
    }
  }
};

const senseNonMobile = (str) => {
  if (str != null && str !== undefined) {
    if (str.length === 11) {
      const pat = /(\d{3})\d*(\d{4})/;
      return str.replace(pat, '$1****$2');
    } else {
      return str.replace(/^(.).*(.)$/, '$1***$2');
    }
  } else {
    return '';
  }
};

const senseNonName = (str) => {
  if (str != null && str !== undefined) {
    return str.replace(/^(.).*$/, '$1***');
  } else {
    return '';
  }
};

/**
 * 将联系方式号码做屏蔽处理
 * @param {String} numberStr 号码字符串
 * @returns 屏蔽中间位后的号码
 */
const coverPhoneNumber = (numberStr) => {
  if (numberStr) {
    const len = numberStr.length;
    return numberStr.substring(0, 3) + '****' + numberStr.substring(len - 2, len);
  }
  return null;
};

const getIp = (ctx) => {
  const request = ctx.request;
  const headers = request.headers;
  const ipv6 =
    // koa帮我们解析好的 x-forwarded-for请求头，或是配置的proxyIpHeader请求头
    request.ips[0] ||
    // 自取代理ip路径第一条
    (headers['x-forwarded-for'] || headers['x-real-ip'])?.split(',')[0] ||
    // 收到的请求的ip
    request.ip;
  // ipv6兼容ipv4时的前缀
  const ipv4CompatiblePrefix = '::ffff:';

  if (ipv6.startsWith(ipv4CompatiblePrefix)) {
    return ipv6.substring(ipv4CompatiblePrefix.length, ipv6.length);
  } else if (ipv6 === '::1') {
    return '127.0.0.1';
  }
  return ipv6;
};

/**
 * 文件名重命名，形成全局唯一不充分的文件名，文件名格式：'uuid'+'后缀名'
 * @param {*} fileName 文件名
 */
const uniqueFilename = (fileName) => {
  const ext = path.extname(fileName);
  fileName = uuid() + ext;
  return fileName;
};

/**
 * 认证证书计算累计认证年限
 * 认证通过时为第一天
 * 一年内：xxx天
 * 一年后：x年
 */
const dateDiff = (startDate, endDate) => {
  startDate = dayjs(startDate);
  endDate = dayjs(endDate);
  if (!startDate.isValid()) {
    throw new Error(`invalid start date: ${startDate}`);
  }
  if (!endDate.isValid()) {
    throw new Error(`invalid end date: ${endDate}`);
  }
  startDate = startDate.subtract(1, 'day').endOf('day');
  endDate = endDate.endOf('day');
  // 判断是否同一年
  const yearDiff = endDate.diff(startDate, 'year');
  if (yearDiff > 0) {
    return `${yearDiff}年`;
  }
  const dayDiff = endDate.diff(startDate, 'day');
  return `${dayDiff}天`;
};

const endings = ['/', ':', '?', '#'];
const starters = ['.', '/', '@'];

const getDomainFromUrl = (url) => {
  if (typeof url !== 'string') {
    return null;
  }
  let domainInc = 0;
  let offsetDomain = 0;
  let offsetStartSlice = 0;
  let offsetPath = 0;
  let len = url.length;
  let i = 0;
  // Find end offset of domain
  while (len-- && ++i) {
    if (domainInc && endings.indexOf(url[i]) > -1) {
      break;
    }
    if (url[i] !== '.') {
      continue;
    }
    ++domainInc;
    offsetDomain = i;
  }
  offsetPath = i;
  i = offsetDomain;
  // Find offset before domain name.
  while (i--) {
    // Look for sub domain, protocol or basic auth
    if (starters.indexOf(url[i]) === -1) {
      continue;
    }
    offsetStartSlice = i + 1;
    break;
  }
  // offsetStartSlice should always be larger than protocol
  if (offsetStartSlice < 2) {
    return '';
  }
  // Tried several approaches slicing a string. Can't get it any faster than this.
  return url.slice(offsetStartSlice, offsetPath);
};

/**
 * 获取url链接，移除url参数
 * @param {*} req express请求
 * @returns
 */
function getUrl(req) {
  return _.trimEnd(_.split(req.originalUrl || req.url, '?')[0], '/');
}

/**
 * 频闭简介敏感字
 * @param {String} word
 * @returns
 */
const senseIntroduction = (word) => {
  word = _.replace(
    word,
    /髪|髮|珐|琺|蕟|発|沷|冹|發|彂|睽|葵|揆|骙|暌|戣|藈|票|鰾|驃|慓|徱|僄|魒|飃|飄|翲|螵|彯|勡|剽|飘|旚|犥|漂|嘌|缥|瞟/g,
    '*'
  );
  return word;
};

const delay = (ms) => new Promise((resolve) => setTimeout(resolve, ms));

/**
 * 高亮处理文本检测后的违规内容
 * @param {Object} data
 * @param {string} data.value 文本内容
 * @param {number[][]} data.indexes 违规文本的下标数组
 * @returns 高亮处理后的文本
 */
const highlightIllegalText = (data) => {
  const { value, indexes } = data;
  let text = '';
  let start = 0;
  indexes.forEach((val) => {
    if (start < val[0]) {
      text = text.concat(value.substring(start, val[0]));
    }
    text = text.concat('<em>', value.substring(val[0], val[1]), '</em>');
    start = val[1];
  });
  if (start !== value.length) {
    text = text.concat(value.substr(start));
  }

  return {
    value,
    highlighted: text
  };
};

module.exports = {
  uuid,
  uuidPure,
  seqId,
  getNowStr,
  getTodayStr,
  setDbInsertCommonFields,
  setDbUpdateCommonFields,
  MD5,
  toStandardCurrency,
  snakeCaseModel,
  camelCaseModel,
  deleteFile,
  deleteBase64File,
  senseNonMobile,
  senseNonName,
  coverPhoneNumber,
  dateDiff,
  getDomainFromUrl,
  getUrl,
  senseIntroduction,
  formatDate,
  getIp,
  uniqueFilename,
  delay,
  highlightIllegalText
};
