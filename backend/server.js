const Koa = require("koa");
const Router = require("koa-router");
const Logger = require("koa-logger");
const Cors = require("@koa/cors");
const koaBody = require("koa-body")({ multipart: true });
const Helmet = require("koa-helmet");
const respond = require("koa-respond");

const app = new Koa();
const router = new Router();

app.use(Helmet());

if (process.env.NODE_ENV === "development") {
  app.use(Logger());
}

app.use(Cors());
app.use(koaBody);

app.use(respond());

// API routes
require("./routes")(router);
app.use(router.routes());
app.use(router.allowedMethods());

module.exports = app;
