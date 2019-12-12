# koa-proxy-middleware

[![NPM version][npm-image]][npm-url]
[![build status][travis-image]][travis-url]
[![Test coverage][codecov-image]][codecov-url]

[npm-image]: https://img.shields.io/npm/v/koa-proxy-middleware.svg?style=flat-square
[npm-url]: https://npmjs.org/package/koa-proxy-middleware
[travis-image]: https://img.shields.io/travis/Mayness/koa-proxy-middleware.svg
[travis-url]: https://travis-ci.org/Mayness/koa-proxy-middleware
[codecov-image]: https://img.shields.io/codecov/c/github/Mayness/koa-proxy-middleware.svg?style=flat-square
[codecov-url]: https://codecov.io/github/Mayness/koa-proxy-middleware?branch=master

Middleware for [koa2](https://github.com/koajs/koa). Reverse proxy middleware for koa. Proxy resources on other servers, such as Java services, and other node.js applications. Based on [http-proxy](https://github.com/nodejitsu/node-http-proxy) library.

# Require

node v8.x +

# Installation

[![NPM](https://nodei.co/npm/koa-proxy-middleware.png?downloads=true&downloadRank=true&stars=true)](https://nodei.co/npm/koa-proxy-middleware/)

# Usage
``koa-proxy-middleware`` is used to forward HTTP requests in koa middleware,it looks like the nginx in Node.   
example:
```
const Koa = require('koa');
const Proxy = require('koa-proxy-middleware');
const app = new Koa();
const proxy = new Proxy({
  proxies: [
    {
      host: 'http://localhost:3333/',
      context: 'nginx'
    },
  ]
});
app.use(proxy);
app.listen(3000);
    
```
# API
### Options

- `proxies`  
``koa-proxy-middleware`` config option,expect ``Array`` value,Each of the config objects is a proxy combination,you should fill this option with client require ``context`` prefix and ``host`` server address.
  * `host` url string to be parsed with the url module
  * `context` Local proxy root address,required,string format
  * `rewrite` unrequired，``Function``/``Boolean`` value. It doesn't overwrite the path when it's false.
  * `proxyTimeout` unrequired，``Number``

- `proxyTimeout`  
timeout(in millis) for outgoing proxy requests. unrequired,default 30000

- `rewrite`  
rewrite the url redirects function.unrequired,default ``() => path.replace(context, '')``.It's unnecessary to replace '/' path because funciton ``rewrite`` did it default in [http-proxy](https://github.com/nodejitsu/node-http-proxy)

- `logLevel`  
Log level of terminal output,includes `error`, `warn`, `info`, `http`, `verbose`, `debug`, `debug`, `silly`, it dependence on [Winston](https://github.com/winstonjs/winston) package

- `handleReq`  
The function will be triggered before send data. you can modify the request object of request before handle proxy.This method takes four arguments `proxyReq`,`req`,`res`,`options`
```js
const proxy = new Proxy({
  proxies: ...,
  handleReq: proxyObj => {
    { proxyReq, req, res, options } = proxyObj;
  }
});
```

- `handleRes`  
The function will be triggered if back response from the target server,three arguments `proxyRes`,`req`,`res`

- `error`  
The error function will be triggered when fail in request to the target server,three arguments `err`,`req`,`res`
