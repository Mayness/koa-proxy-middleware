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

node v7.x +

# Installation

First install node.js(v7.6.0 or higher). Then:

```bash
$ npm i koa-proxy-middleware --save
```

# Usage
When you request url contains terminal, it will transmit to http://127.0.0.1:3000/ !

```
const Koa = require('koa');
const Proxy = require('koa-nginx');
const app = new Koa();
const Nginx = Proxy.proxy({
  proxies: [
    {
      host: 'http://localhost:3333/',
      context: 'nginx'
    },
  ]
});
app.use(Nginx);
app.listen(3000);
    
```
# API
### Options

- `proxyTimeout`
timeout for outgoing proxy requests.unrequired,the values are in millisecond,Number,default 30000

- `rewrite`
rewrites the url redirects.unrequired,Funtion, default `path.replace(context, '')`，context before with '/', the second param does not require '/', because the `http-proxy` will do this

- `handleReq`
This event is emitted before the data is sent. It gives you a chance to alter the proxyReq request object. Applies to "web",include `proxyReq`,`req`,`res`,`options`
```js
const Nginx = Proxy.proxy({
  proxies: ...,
  handleReq: proxyObj => {
    { proxyReq, req, res, options } = proxyObj;
  }
});
```

- `handleRes`
This event is emitted if the request to the target got a response,include `proxyRes`,`req`,`res`

- `error`
The error event is emitted if the request to the target fail,include `err`,`req`,`res`

- `proxies`
koa-proxy-middleware important parameter,required,expect get array,Each of the internal objects is a proxy combination, and some of the internal parameters can override globally parameters of the same name.
  * `target` url string to be parsed with the url module
  * `context` Local proxy root address,required,string format
  * `rewrite` unrequired，Function or Boolean. It doesn't overwrite the path when it's false.
  * `proxyTimeout` unrequired，Number

Most options based on [http-proxy](https://github.com/nodejitsu/node-http-proxy). 
* host: the end point server
* context: the request url contains the 'context' will be proxy

```js
const Nginx = Proxy.proxy({
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
app.use(Nginx);
```
