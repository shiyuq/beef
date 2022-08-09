const userDao = require('../dao/user-dao');

const login = async(input) => {
  const { token } = input;
  const user = await userDao.getOne(token);
  // 处理用户权限
  return { user };
};

module.exports = {
  login
};
