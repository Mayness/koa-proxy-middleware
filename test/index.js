'use strict';
const Proxy = require('../');
const request = require('supertest');
const Koa = require('koa');
const bodyParser = require('koa-bodyparser');
const path = require('path');
const beforeAll = global.beforeAll;
const afterAll = global.afterAll;
const expect = global.expect;
let server;

beforeAll(() => {
  const app = new Koa();
  app.use(bodyParser());
  app.use(async (ctx, next) => {
    let res;
    if (ctx.method === 'GET') {
      switch (ctx.url.split('?')[0]) {
        case '/': res = 'server is listen at port 3333'; break;
        case '/getMethod': res = ctx.query; break;
        case '/allNoRewrite1': res = ctx.query; break;
        default: break;
      }
    } else if (ctx.method === 'POST') {
      switch (ctx.url) {
        case '/upload': res = 'success'; break;
        case '/other/entry': res = ctx.request.body; break;
        case '/singleNoRewrite/entry': res = ctx.request.body; break;
        case '/allNoRewrite2/entry': res = ctx.request.body; break;
        default: break;
      }
    }
    if (ctx.url.match('/bodyParse')) {
      res = { body: ctx.request.body, query: ctx.query };
    }
    ctx.body = {
      status: 200,
      data: res,
    };
    await next();
  });
  server = app.listen(3333);
});

afterAll(() => {
  server.close();
});

describe('ngnix server is connection', () => {
  test('connection success', async done => {
    const res = await request(server).get('/');
    expect(res.body.status).toBe(200);
    done();
  });
});

describe('koa-ngnix in bodyparser Middleware test', () => {
  let serverNgnix;
  let agent;
  beforeAll(() => {
    const app = new Koa();
    const ngnix = Proxy.proxy({
      proxies: [
        {
          host: 'http://localhost:3333/',
          context: 'ngnix',
        },
        {
          host: 'http://localhost:3333/',
          context: 'rewrite',
          rewrite: path => path.replace('/rewrite', 'other'),
        },
        {
          host: 'http://localhost:3333/',
          context: 'singleNoRewrite',
          rewrite: false,
        },
        {
          host: 'http://localhost:1111/',
          context: 'notFound',
        },
      ],
      proxyRes: proxyObj => {
        const { proxyRes, req } = proxyObj;
        proxyRes.headers.token = req.headers.newtoken;
      },
      error: proxyObj => {
        const { res } = proxyObj;
        res.writeHead(505, {
          'Content-Type': 'text/plain',
        });
        res.end();
      },
    });
    app.use(bodyParser());
    app.use(ngnix);
    serverNgnix = app.listen(4444);
    agent = request.agent(serverNgnix);
  });
  afterAll(() => {
    serverNgnix.close();
  });

  test('GET method', async done => {
    const res = await agent.get('/ngnix/getMethod')
      .set('newtoken', 'tokenPassword')
      .query({
        test: 2222,
      });
    expect(res.header.token).toBe('tokenPassword');
    expect(res.body.data.test).toBe('2222');
    done();
  });

  test('POST method', async done => {
    const res = await agent.post('/ngnix/bodyParse')
      .set('Content-Type', 'application/json; charset=utf-8')
      .query({
        test2: 2222,
      })
      .send({});
    expect(res.body.data.body).toEqual({});
    expect(res.body.data.query.test2).toBe('2222');
    done();
  });

  test('upload test', async done => {
    const res = await new Promise(resolve => {
      agent.post('/ngnix/upload')
        .set('Content-Type', 'multipart/form-data')
        .field('name', 'testImg')
        .attach('avatar', path.join(__dirname, './static/test.png'))
        .end((err, result) => {
          if (!err) {
            resolve(result);
          }
        });
    });
    expect(res);
    done();
  });

  test('single rewrite test', async done => {
    const res = await agent.post('/rewrite/entry')
      .set('Content-Type', 'application/x-www-form-urlencoded')
      .send({
        test: 333,
      });
    expect(res.body.data.test).toBe('333');
    done();
  });

  test('rewrite false test', async done => {
    const res = await agent.post('/singleNoRewrite/entry')
      .set('Content-Type', 'application/x-www-form-urlencoded')
      .send({
        test: 444,
      });
    expect(res.body.data.test).toBe('444');
    done();
  });

  test('error handle', async done => {
    const res = await agent.post('/notFound');
    expect(res.status).toBe(505);
    done();
  });
});

// describe('all rewrite false test', () => {
//   let serverNgnix;
//   let agent;
//   beforeAll(() => {
//     const app = new Koa();
//     const ngnix = Proxy.proxy({
//       rewrite: false,
//       proxies: [
//         {
//           host: 'http://localhost:3333/',
//           context: 'allNoRewrite1',
//         },
//         {
//           host: 'http://localhost:3333/',
//           context: 'allNoRewrite2',
//         },
//       ],
//     });
//     app.use(bodyParser());
//     app.use(ngnix);
//     serverNgnix = app.listen(5555);
//     agent = request.agent(serverNgnix);
//   });

//   afterAll(() => {
//     serverNgnix.close();
//   });

//   test('all no rewrite get test', async done => {
//     const res = await agent.get('/allNoRewrite1')
//       .query({
//         test: 555,
//       });
//     expect(res.body.data.test).toBe('555');
//     done();
//   });

//   test('all no rewrite post test', async done => {
//     const res = await agent.post('/allNoRewrite2/entry')
//       .set('Content-Type', 'application/x-www-form-urlencoded')
//       .send({
//         test: 666,
//       });
//     expect(res.body.data.test).toBe('666');
//     done();
//   });
// })
