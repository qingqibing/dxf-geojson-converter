const Router = require("koa-router");
const router = new Router();
const fs = require("fs");
var uniqid = require("uniqid");

const dxfController = require("../controllers/dxf");

router.get("/:id/:type", async ctx => {
  const id = ctx.params.id;
  const type = ctx.params.type;
  const geojson = fs.readFileSync(`./storage/geojson/${id}/${type}.geojson`);
  ctx.body = geojson;
});

module.exports = router.routes();
