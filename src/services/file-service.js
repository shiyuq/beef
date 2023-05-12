const _ = require('lodash');
const fs = require('fs');
const path = require('path');
const exceljs = require('exceljs');
const xlsx = require('node-xlsx');
const beefDao = require('../dao/beef-dao');
const beefGuessDao = require('../dao/beef-guess-dao');

/**
 * form data 上传文件信息
 * @param {Object} input
 * @param {Object} input.file
 * @param {Number} input.file.size
 * @param {String} input.file.filepath
 * @param {String} input.file.newFilename
 * @param {String} input.file.mimetype
 * @param {String} input.file.originalFilename
 */
const importFile = async(input) => {
  return readExcelTemplate(input.filepath);
};

const readExcelTemplate = async(path) => {
  const data = { keys: [], values: [] };
  const workbook = new exceljs.Workbook();
  await workbook.xlsx.readFile(path).then(() => {
    const worksheet = workbook.getWorksheet(1);
    worksheet.eachRow((row, rowNum) => {
      const tempValues = [];
      row.eachCell((cell, colNum) => {
        // 如果是第一行，处理活动名称和时间
        if (rowNum === 1) {
          data['activity'] = cell.value;
        } else if (rowNum === 2) {
          data.keys.push(cell.text);
        } else {
          if (tempValues.length === colNum - 1) {
            tempValues.push(cell.text);
          } else {
            tempValues.push(null);
            tempValues.push(cell.text);
          }
        }
      });
      if (rowNum > 2) data.values.push(tempValues);
    });
  });
  return data;
};

const insertData = async(input) => {
  const beefPricePath = path.resolve(__dirname, '../file/beef');
  const beefPriceGuessPath = path.resolve(__dirname, '../file/beef-guess');
  const beefPriceFiles = fs.readdirSync(beefPricePath);
  const beefPriceGuessFiles = fs.readdirSync(beefPriceGuessPath);
  let beefPriceData = [];
  let beefPriceGuessData = [];
  for (const file of beefPriceFiles) {
    const excelObj = xlsx.parse(path.resolve(beefPricePath, file));
    beefPriceData = [...beefPriceData, ...dealData(excelObj[0])];
  }
  for (const file of beefPriceGuessFiles) {
    const excelObj = xlsx.parse(path.resolve(beefPriceGuessPath, file));
    beefPriceGuessData = [...beefPriceGuessData, ...dealData(excelObj[0])];
  }
  for (const i of beefPriceData) {
    await beefDao.insert(i);
  }
  for (const i of beefPriceGuessData) {
    await beefGuessDao.insert(i);
  }
  return true;
};

const dealData = (input) => {
  const { name, data } = input;
  const result = [];
  if (!data.length) return result;
  _.forEach(data, item => {
    if (item) {
      if (item[0] !== '日期') {
        result.push({
          date: item[0],
          price: item[1],
          location: name
        });
      }
    }
  });
  return result;
};

const getProvince = async() => {
  return beefDao.getProvince();
};

const getData = async(input) => {
  const { type } = input;
  let data = [];
  if (type === 'beef') {
    data = await beefDao.findData(input);
  } else {
    data = await beefGuessDao.findData(input);
  }
  return _.groupBy(data, 'location');
};

module.exports = {
  importFile,
  insertData,
  getProvince,
  getData
};
