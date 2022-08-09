const config = require('../../config');
const OSS = require('ali-oss');
const BizException = require('../../core/errors/biz-exception');
const { bizLogger } = require('../logger');

const store = new OSS(config.oss.client);

const getEnvDir = () => {
  return '';
};

const envDir = getEnvDir();
/**
 * 上传文件到文件存储,在文件存储中生成唯一文件名
 * @param {String} localPath 本地文件路径
 * @param {String} storgePath 文件存储路径
 */
const uploadFile = async(localPath, storgePath) => {
  try {
    await store.put(envDir + storgePath, localPath);
  } catch (e) {
    bizLogger.error('[uploadFile] uploadFile failed', e, localPath, storgePath);
    throw new BizException(BizException.CommonErrors.fileSaveFailed);
  }
};

/**
 * oss复制文件
 * @param {String} fromPath 文件源地址
 * @param {String} toPath 文件目标地址
 */
const copyFile = async(fromPath, toPath) => {
  try {
    await store.copy(envDir + toPath, envDir + fromPath);
  } catch (e) {
    bizLogger.error('[copyFile] copyFile failed', e, fromPath, toPath);
    throw new BizException(BizException.CommonErrors.fileSaveFailed);
  }
};

/**
 * oss复制文件
 * @param {String} fromPath 文件源地址
 * @param {String} toPath 文件目标地址
 */
const copyFileTmp = async(fromPath, toPath) => {
  try {
    await store.copy(toPath, fromPath);
  } catch (e) {
    bizLogger.error('[copyFileTmp] copyFileTmp failed', e, fromPath, toPath);
    throw new BizException(BizException.CommonErrors.fileSaveFailed);
  }
};

/**
 * 上传内存文件到文件存储,在文件存储中生成唯一文件名
 * @param {String} buffer 内存文件
 * @param {String} storgePath 文件存储路径
 * @returns {String} path  文件存储路径
 */
const uploadFileBuffer = async(buffer, storgePath) => {
  try {
    await store.put(envDir + storgePath, buffer);
  } catch (e) {
    bizLogger.error('[uploadFileBuffer] uploadFileBuffer failed', e, storgePath);
    throw new BizException(BizException.CommonErrors.fileSaveFailed);
  }
};

/**
 * 上传文件流到文件存储,在文件存储中生成唯一文件名
 * @param {String} buffer 内存文件
 * @param {String} storgePath 文件存储路径
 */
const uploadFileStream = async(stream, storgePath) => {
  try {
    await store.putStream(envDir + storgePath, stream);
  } catch (e) {
    bizLogger.error('[uploadFileStream] uploadFileStream failed', e, storgePath);
    throw new BizException(BizException.CommonErrors.fileSaveFailed);
  }
};

/**
 * 从文件存储下载文件
 * @param {*} localPath 本地文件路径
 * @param {*} storgePath 文件存储路径
 */
const downloadFile = async(localPath, storgePath) => {
  const result = await store.get(envDir + storgePath, localPath);
  if (!result || !result.res || result.res.status !== 200) {
    throw new BizException(BizException.CommonErrors.fileDownloadFailed);
  }
  return localPath;
};

/**
 * 从文件存储下载文件到内存
 * @param {*} storgePath 文件存储路径
 */
const downloadFileBuffer = async(storgePath) => {
  const result = await store.get(envDir + storgePath);
  if (!result || !result.res || result.res.status !== 200) {
    throw new BizException(BizException.CommonErrors.fileDownloadFailed);
  }
  return result.content;
};

/**
 * 从文件存储下载文件到内存
 * @param {*} storgePath 文件存储路径
 */
const downloadFileStream = async(storgePath) => {
  const result = await store.getStream(envDir + storgePath);
  if (!result || !result.res || result.res.status !== 200) {
    throw new BizException(BizException.CommonErrors.fileDownloadFailed);
  }
  return result.stream;
};

/**
 * 将文件从文件存储移除
 * @param {*} storgePath 文件存储路径
 */
const removeFile = async(storgePath) => {
  await store.delete(envDir + storgePath);
};

/**
 * 获取文件访问路径
 * @param {*} storgePath
 */
const getUrl = (storgePath) => {
  // store.useBucket(config.oss.bucketName.material)
  // const url = store.signatureUrl(envDir + storgePath, {expires: 3600 * 3})
  storgePath = envDir + storgePath;
  return `http://ent-claim-img-osscache.qixin.com/${storgePath}`;
};

module.exports = {
  uploadFile,
  copyFile,
  uploadFileBuffer,
  uploadFileStream,
  downloadFile,
  downloadFileBuffer,
  downloadFileStream,
  removeFile,
  getUrl,
  copyFileTmp
};
