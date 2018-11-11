'use strict';
const { check_params, handle } = require('./base');
const HttpProxy = require('http-proxy');
const proxyServer = HttpProxy.createProxyServer();
const compose = require('koa-compose');
const log = require('../util/logger');

class Proxy {
  nginx(context, options) {
    return (ctx, next) => {
      if (!ctx.url.startsWith(context)) {
        return next();
      }
      const { rewrite, target } = options;

      ctx.req.body = ctx.request.body || null;
      options.headers = ctx.request.headers;
      return new Promise(resolve => {
        ctx.req.url = rewrite(ctx.url);
        log.info(`- proxy - ${ctx.req.method} ${target}${ctx.req.url}`);
        proxyServer.web(ctx.req, ctx.res, options, e => {
          const status = {
            ECONNRESET: 502,
            ECONNREFUSED: 503,
            ETIMEOUT: 504,
          }[ e.code ];
          if (status) ctx.status = status;
          if (this.options.handleError) {
            this.options.handleError.call(null, { e, req: ctx.req, res: ctx.res });
          }
          log.error(`- proxy - ${ctx.status} ${ctx.req.method} ${target}${ctx.req.url}`);
          resolve();
        });
      });
    };
  }

  proxy(option) {
    this.options = check_params(option);
    const { proxies, rewrite, proxyTimeout } = this.options;
    handle(proxyServer);
    const mildArr = [];
    proxies.forEach(proxy => {
      const pattern = new RegExp('^/' + proxy.context + '(/|/w+)?');
      mildArr.push(
        this.nginx('/' + proxy.context, {
          // 校验局部参数
          target: proxy.host,
          changeOrigin: true,
          xfwd: true,
          /*  先后顺序：
          *  1, 局部rewrite值为false的情况，不进行路径的rewrite
          *  2，局部自定义rewrite
          *  3, rewrite值为false的情况，不进行rewrite
          *  4，全局自定义rewrite
          *  5，默认去除context
          */
          rewrite: proxy.rewrite === false ? path => path.replace(/^\//, '') : proxy.rewrite || rewrite(pattern),
          proxyTimeout: proxy.proxyTimeout || proxyTimeout,
        })
      );
    });
    return compose(mildArr);
  }
}


module.exports = new Proxy();
