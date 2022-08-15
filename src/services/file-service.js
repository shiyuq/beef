// const _ = require('lodash');
const exceljs = require('exceljs');

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

module.exports = {
  importFile
};
