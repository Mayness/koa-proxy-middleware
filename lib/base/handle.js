const queryString = require('querystring');

/**
 * 处理钩子函数、处理bodyparser post请求
 * @param {*} proxyServer 代理服务
 */
module.exports = proxyServer => {
  const { handleReq, handleRes, handleError } = this.options;
  proxyServer.on('proxyReq', (proxyReq, req, res, options) => {
    if (handleReq) {
      handleReq.call(null, { proxyReq, req, res, options });
    }
    const contentType = proxyReq.getHeader('Content-Type');
    if (req.body && contentType) {
      let bodyData;
      if (contentType.match(/application\/json/)) {
        bodyData = JSON.stringify(req.body);
      } else if (contentType.match(/application\/x-www-form-urlencoded/)) {
        bodyData = queryString.stringify(req.body);
      }
      if (bodyData) {
        proxyReq.write(bodyData);
        proxyReq.end();
      }
    }
  });
  proxyServer.on('proxyRes', (proxyRes, req, res) => {
    if (handleRes) {
      handleRes.call(null, { proxyRes, req, res });
    }
  });
  proxyServer.on('error', (err, req, res) => {
    if (handleError) {
      handleError.call(null, { err, req, res });
    }
  });
};
