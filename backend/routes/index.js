module.exports = router => {
  router.use("/dxf", require("./dxf"));
  router.use("/geojson", require("./geojson"));
};
