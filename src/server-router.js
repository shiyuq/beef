const loginController = require('./routes/login-controller');
const fileController = require('./routes/file-controller');

// 业务路由
function businessRoutes(app) {
  app.use(loginController.routes()); // 登陆模块
  app.use(fileController.routes()); // 文件模块
}

// OPS路由
function opsRoutes(app) {
}

// 第三方路由
function openRoutes(app) {
}

module.exports = (app) => {
  businessRoutes(app);
  opsRoutes(app);
  openRoutes(app);
};
