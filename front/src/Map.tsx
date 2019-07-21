import React, { Component } from "react";
import { render } from "react-dom";
//@ts-ignore
import { StaticMap } from "react-map-gl";
//@ts-ignore
import DeckGL, { IconLayer, PathLayer, PolygonLayer } from "deck.gl";

const mapping = require("./data/location-icon-mapping.json");
const atlas = require("./data/location-icon-atlas.png");
// Set your mapbox token here
const MAPBOX_TOKEN =
  "pk.eyJ1IjoiZHZpbGFub3ZhIiwiYSI6ImNqcmhoa2NqdTJtcnY0OW4wdzZpbmdhdnUifQ.kpKlgU9cmI2vBpTn3I5a0g"; // eslint-disable-line

// Source data CSV

const geometries = ["POINT", "LINESTRING", "POLYGON"];
const DATA_URL = "http://localhost:8081/geojson/"; // eslint-disable-line
const factor = 10000;
const INITIAL_VIEW_STATE = {
  longitude: -35,
  latitude: 36.7,
  zoom: 1.8,
  maxZoom: 20,
  pitch: 0,
  bearing: 0
};

/* eslint-disable react/no-deprecated */
export default class Map extends Component<any, any> {
  constructor(props) {
    super(props);

    this.state = {
      x: 0,
      y: 0,
      hoveredObject: null,
      expandedObjects: null,
      POINT: [],
      LINESTRING: [],
      POLYGON: []
    };
    this._onHover = this._onHover.bind(this);
    this._onClick = this._onClick.bind(this);
    this._closePopup = this._closePopup.bind(this);
    this._renderhoveredItems = this._renderhoveredItems.bind(this);
  }

  _onHover(info) {
    if (this.state.expandedObjects) {
      return;
    }

    const { x, y, object } = info;
    this.setState({ x, y, hoveredObject: object });
  }

  _onClick(info) {
    const { showCluster = true } = this.props;
    const { x, y, objects, object } = info;

    if (object && showCluster) {
      this.setState({ x, y, expandedObjects: objects || [object] });
    } else {
      this._closePopup();
    }
  }

  _closePopup() {
    if (this.state.expandedObjects) {
      this.setState({ expandedObjects: null, hoveredObject: null });
    }
  }

  _renderhoveredItems() {
    const { x, y, hoveredObject, expandedObjects } = this.state;

    if (expandedObjects) {
      return (
        <div className="tooltip interactive" style={{ left: x, top: y }}>
          {expandedObjects.map(({ name, year, mass, class: meteorClass }) => {
            return (
              <div key={name}>
                <h5>{name}</h5>
                <div>Year: {year || "unknown"}</div>
                <div>Class: {meteorClass}</div>
                <div>Mass: {mass}g</div>
              </div>
            );
          })}
        </div>
      );
    }

    if (!hoveredObject) {
      return null;
    }

    return hoveredObject.cluster ? (
      <div className="tooltip" style={{ left: x, top: y }}>
        <h5>{hoveredObject.point_count} records</h5>
      </div>
    ) : (
      <div className="tooltip" style={{ left: x, top: y }}>
        <h5>
          {hoveredObject.name}{" "}
          {hoveredObject.year ? `(${hoveredObject.year})` : ""}
        </h5>
      </div>
    );
  }

  componentWillMount() {
    const { dxfId } = this.props;
    for (let geom of geometries) {
      const feat = fetch(DATA_URL + dxfId + "/" + geom).then(response => {
        response.json().then(data =>
          this.setState(
            {
              [geom]: data.features.map(d => this.escaleCoordinates(d, geom))
            },
            () => console.log(this.state)
          )
        );
      });
    }
  }

  escaleCoordinates(feature, type) {
    if (type === "POINT") {
      return {
        properties: feature.properties,
        geometry: {
          coordinates: feature.geometry.coordinates.map(d => d / factor)
        }
      };
    }
    if (type === "LINESTRING") {
      return {
        properties: feature.properties,
        geometry: {
          coordinates: feature.geometry.coordinates.map(d =>
            d.map(p => p / factor)
          )
        }
      };
    }
    if (type === "POLYGON") {
      console.log(
        feature.geometry.coordinates.map(d =>
          d.map(p => p.map(g => g / factor))
        )
      );
      return {
        properties: feature.properties,
        geometry: {
          coordinates: feature.geometry.coordinates.map(d =>
            d.map(p => p.map(g => g / factor))
          )
        }
      };
    }
  }
  _renderLayers() {
    const {
      iconMapping = mapping,
      iconAtlas = atlas,
      showCluster = true
    } = this.props;
    const { POINT, LINESTRING, POLYGON } = this.state;
    const layerProps = {
      pickable: true,
      wrapLongitude: true,
      getPosition: d => d.geometry.coordinates,
      iconAtlas,
      iconMapping,
      onHover: this._onHover
    };

    const points = new IconLayer({
      ...layerProps,
      data: POINT,
      id: "icon",
      getIcon: d => "marker",
      sizeUnits: "meters",
      sizeScale: 2000,
      sizeMinPixels: 30
    });
    const lines = new PathLayer({
      id: "path-layer",
      data: LINESTRING,
      pickable: true,
      widthScale: 1,
      widthMinPixels: 2,
      getPath: d => d.geometry.coordinates,
      getColor: d => [255, 255, 255],
      getWidth: d => 100
    });
    const polygons = new PolygonLayer({
      id: "poly",
      data: POLYGON,
      pickable: false,
      opacity: 5,
      stroked: false,
      mask: true,
      getPolygon: d => d.geometry.coordinates[0],
      getFillColor: f => [220, 220, 220],
      lineWidthMinPixels: 1,
      getElevation: 0,
      getLineColor: f => [0, 0, 0],
      getLineWidth: f => 1
    });

    return [polygons, lines, points];
  }

  render() {
    const { mapStyle = "mapbox://styles/mapbox/dark-v" } = this.props;

    return (
      <DeckGL
        layers={this._renderLayers()}
        initialViewState={INITIAL_VIEW_STATE}
        controller={{ dragRotate: false }}
        onViewStateChange={this._closePopup}
        onClick={this._onClick}
      >
        <StaticMap
          reuseMaps
          mapStyle={mapStyle}
          preventStyleDiffing={true}
          mapboxApiAccessToken={MAPBOX_TOKEN}
        />

        {this._renderhoveredItems}
      </DeckGL>
    );
  }
}
