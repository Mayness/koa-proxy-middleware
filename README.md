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
``koa-proxy-middleware`` is used to forward HTTP requests in koa middleware,it look like the nginx in Node.   
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
``koa-proxy-middleware`` config option,expect ``Array``,Each of the config objects is a proxy combination, you should fill this option with client require ``context`` prefix and ``host`` server address.
  * `host` url string to be parsed with the url module
  * `context` Local proxy root address,required,string format
  * `rewrite` unrequired，``Function`` or ``Boolean``. It doesn't overwrite the path when it's false.
  * `proxyTimeout` unrequired，``Number``

- `proxyTimeout`  
timeout(in millis) for outgoing proxy requests. unrequired,default 30000

- `rewrite`  
rewrites the url redirects function.unrequired, default `() => path.replace(context, '')`，context before with '/', the second param does not require '/', because funciton ``rewrite`` will do this in [http-proxy](https://github.com/nodejitsu/node-http-proxy) 

- `logLevel`  
Log level of terminal output, inclue `error`, `warn`, `info`, `http`, `verbose`, `debug`, `debug`, `silly`, it dependence on [Winston](https://github.com/winstonjs/winston) package

- `handleReq`  
This function is triggered before send data. you can modify the request object of proxyReq and it will be returned with four arguments `proxyReq`,`req`,`res`,`options`
```js
const proxy = new Proxy({
  proxies: ...,
  handleReq: proxyObj => {
    { proxyReq, req, res, options } = proxyObj;
  }
});
```

- `handleRes`  
This function is triggered if the request to the target got a response,three arguments includes `proxyRes`,`req`,`res`

- `error`  
The error function is triggered if the request to the target server fail,three arguments includes `err`,`req`,`res`

Most options based on [http-proxy](https://github.com/nodejitsu/node-http-proxy). 
* host: the end point server
* context: the request url contains the 'context' will be proxy

```js
const proxy = new Proxy({
  proxies: [
    {
      target: 'http://127.0.0.1:3000',
      context: 'api',
      rewrite: path => path.rewrite('/api', 'rewriteApi'),
      proxyTimeout: 10000,
    },
    {
      ...
    },
  ],
  proxyTimeout: 5000,
  ...
});
app.use(proxy);
```
