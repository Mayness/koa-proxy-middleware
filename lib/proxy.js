const { check_params } = require('./base');
// const HttpProxy = require('http-proxy');
// const proxyServer = HttpProxy.createProxyServer();
// const compose = require('koa-compose');
// const log = require('./utils/logger');

const proxy = (options) => {
  check_params(options);
};

module.exports = {
  proxy,
}