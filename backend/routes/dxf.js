const Router = require("koa-router");
const router = new Router();
const fs = require("fs");
var uniqid = require("uniqid");

const dxfController = require("../controllers/dxf");

router.post("/", async ctx => {
  const file = ctx.request.files.dxf;
  console.log(ctx.request.files);
  const unique = uniqid();
  const dxfPath = file.path;
  const convertFiles = await dxfController.exportToGeojson(unique, dxfPath);
  ctx.body = {
    id: unique
  };
});

module.exports = router.routes();
