require("rootpath")();
const fs = require("fs");
const ogr = require("ogr2ogr");
const cmd = require("node-cmd");
const commands = `-f geojson -sql "select * from entities where OGR_GEOMETRY=POINT" point.geojson BURNLEY_PMCS.DXF`;
const path = require("path");
const Promise = require("bluebird");
class dxf {
  log(err, data, stderr) {
    if (!err) {
      console.log("All done", data);
    } else {
      console.log("error", err);
    }
  }
  async exportToGeojson(dxfId, dxfPath) {
    const geometryTypes = ["POINT", "POLYGON", "LINESTRING"];
    const getAsync = Promise.promisify(cmd.get, {
      multiArgs: true,
      context: cmd
    });

    cmd.get(`mkdir ./storage/geojson/${dxfId}`, this.log);
    for (var geometry of geometryTypes) {
      const response = await getAsync(
        `ogr2ogr -f geojson -sql "select * from entities where OGR_GEOMETRY='${geometry}'" ./storage/geojson/${dxfId}/${geometry}.geojson ${dxfPath}`
      );
    }
  }
}

module.exports = new dxf();
