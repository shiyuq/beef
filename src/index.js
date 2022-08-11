const Koa = require('koa');
const path = require('path');
const config = require('config');
const cors = require('@koa/cors');
const koaBody = require('koa-body');
const helmet = require('koa-helmet');
const bodyParser = require('koa-bodyparser');
const { v4: uuidv4 } = require('uuid');
const router = require('./server-router');
const { bizLogger } = require('./core/logger');
// const jobService = require('./services/job-service');
const session = require('./middleware/session');
const context = require('./middleware/context');
const rateLimit = require('./middleware/rate-limit');
const requestId = require('./middleware/request-id');
const apiLogger = require('./middleware/http-logger');
const responseHandler = require('./middleware/json-response');
const exceptionHandler = require('./middleware/exception-handler');

process.on('uncaughtException', (err) => {
  bizLogger.fatal('[serverError] server uncaughtException', err);
  setTimeout(() => {
    process.exit(1);
  }, 0);
});

process.on('unhandledRejection', (err) => {
  bizLogger.fatal('[serverError] server unhandledRejection', err);
});

const app = new Koa();
// cros
app.use(
  cors({
    allowMethods: ['GET', 'POST', 'OPTIONS'],
    allowHeaders: [
      'Origin',
      'Content-Type',
      'Content-Length',
      'Authorization',
      'Accept',
      'X-Requested-With',
      'Token',
      'Accept-Encoding'
    ],
    credentials: true
  })
);

// security
app.use(helmet());

// api logger
app.use(
  apiLogger({
    requestBodyDataAdapter: (ctx, body) => {
      return body;
    }
  })
);

app.use(
  bodyParser({
    // content-type为text/plain时也转换为json，兼容express架构时的设置
    extendTypes: {
      json: ['text']
    },
    jsonLimit: '20mb'
  })
);

app.use(responseHandler());
// error handler
app.use(exceptionHandler());
// traceid
app.use(
  requestId({
    header: (ctx) => {
      return (
        ctx.request.headers['request-id'] ||
        ctx.request.headers.requestId ||
        ctx.request.headers.requestid ||
        ctx.request.headers['req-id'] ||
        ctx.request.headers.reqId
      );
    },
    exposeHeader: 'request-id'
  })
);
app.use(session);

app.use(
  koaBody({
    multipart: true,
    jsonLimit: '20mb',
    formLimit: '50mb',
    formidable: {
      multiples: false,
      maxFileSize: 50 * 1024 * 1024, // Bytes
      keepExtensions: true,
      uploadDir: path.join(__dirname, '/temp'),
      onFileBegin: (_, file) => {
        // 重命名文件名称
        file.newFilename = uuidv4() + path.extname(file.newFilename);
      }
    },
    onError: (err) => {
      bizLogger.error('[bodyError] body parse error', err);
      throw err;
    }
  })
);

app.use(context.httpCtx);

// 接口限流
app.use(rateLimit);

router(app);

app.listen(config.get('port'), async() => {
  bizLogger.info(`server start on port ${config.get('port')}`);
});

// jobService.taskInit();
