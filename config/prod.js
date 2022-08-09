const defaultConfig = {
  resErrorStack: true
};

const env = 'DEV';

const port = 6001;

const session = {
  name: 'token',
  authorization: 'authorization',
  prefix: 'session:'
};

const tokenTimeOut = 24 * 60 * 60;

const domain = {
  githubService: 'https://github.com',
  githubApiService: 'https://api.github.com'
};

const redis = {
  mainRedis: {
    name: 'test',
    host: '127.0.0.1',
    port: '6379',
    password: '',
    db: 1,
    keyPrefix: ''
  },
  syncEntInfoRedis: {
    name: 'test',
    host: '127.0.0.1',
    port: '6379',
    password: '',
    db: 2,
    keyPrefix: ''
  }
};

const mysql = {
  name: 'db_wnb',
  logSql: true,
  connection: {
    write: {
      host: '127.0.0.1',
      port: 3306,
      database: 'db_wnb',
      user: 'root',
      password: 'shiyuq',
      dateStrings: true
    },
    read: {
      host: '127.0.0.1',
      port: 3306,
      database: 'db_wnb',
      user: 'root',
      password: 'shiyuq',
      dateStrings: true
    }
  },
  pool: {
    min: 10,
    max: 50,
    acquireTimeoutMillis: 3000,
    createTimeoutMillis: 3000,
    idleTimeoutMillis: 30000,
    reapIntervalMillis: 1000
  }
};

const log4js = {
  appenders: {
    console: { type: 'console' },
    apiLog: { type: 'console' },
    sqlLog: { type: 'console' },
    bizLog: { type: 'console' }
  },
  categories: {
    default: {
      appenders: ['console'],
      level: 'debug'
    },
    apiLog: {
      appenders: ['apiLog'],
      level: 'debug'
    },
    sqlLog: {
      appenders: ['sqlLog'],
      level: 'debug'
    },
    bizLog: {
      appenders: ['bizLog'],
      level: 'debug'
    }
  }
};

module.exports = {
  defaultConfig,
  env,
  port,
  session,
  tokenTimeOut,
  domain,
  redis,
  mysql,
  log4js
};
