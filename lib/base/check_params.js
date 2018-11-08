const assert = require('power-assert');
const packageInfo = require('../../package.json');

/**
 * 校验参数
 * @param {*} option 代理所需的参数
 * @return {*} object
 */
module.exports = option => {
  const { name } = packageInfo;
  let options = {};
  assert.ok(!option, `${name}: missing main parameters`);
  assert.ok(option.proxies && Array.isArray(option.proxies), `${name}: missing main parameters`);
  assert.ok(!option.rewrite || typeof option.rewrite === 'function', `${name}: missing main parameters`);
  // 校验全局参数
  options = {
    proxyTimeout: option.proxyTimeout || 30000,
    proxies: option.proxies,
    handleReq: option.proxyReq,
    handleRes: option.proxyRes,
    handleError: option.error,
  };
  // 判断全局rewrite
  if (option.rewrite === false) {
    options.rewrite = () => path => path.replace(/^\//, '');
  } else {
    options.rewrite = option.rewrite ? () => option.rewrite : pattern => path => path.replace(pattern, '');
  }
};
