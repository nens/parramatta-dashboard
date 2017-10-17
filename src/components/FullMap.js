import React, { Component } from "react";
import { BOUNDS } from "../config";
import { connect } from "react-redux";
import { getRaster, addAsset } from "../actions";
import { getMeasuringStations } from "lizard-api-client";
import { Map, CircleMarker, TileLayer, WMSTileLayer } from "react-leaflet";
import Legend from "./Legend";
import styles from "./FullMap.css";

class FullMap extends Component {
  componentDidMount() {
    const { tile } = this.props;
    const inBboxFilter = this.getBbox().toLizardBbox();

    if (tile.assetTypes) {
      this.props.tile.assetTypes.forEach(assetType => {
        // This is really impossible, need something more generic
        if (assetType === "measuringstation") {
          getMeasuringStations({
            in_bbox: inBboxFilter,
            page_size: 1000
          }).then(results => {
            results.forEach(measuringStation => {
              this.props.addAsset(
                "measuringstation",
                measuringStation.id,
                measuringStation
              );
            });
          });
        }
      });
    }
  }
  getBbox() {
    // Either get it from the tile or return the global constant.
    if (this.props && this.props.tile && this.props.tile.bbox) {
      return this.props.tile.bbox;
    }
    return BOUNDS;
  }
  tileLayerForRaster(raster) {
    let rasterObject = null;
    if (this.props.rasters.hasOwnProperty(raster.uuid)) {
      rasterObject = this.props.rasters[raster.uuid].data;
    }

    if (!rasterObject) {
      this.props.getRaster(raster.uuid);
      return null;
    }

    let wmsUrl;
    if (rasterObject.last_value_timestamp && this.props.tile.datetime) {
      wmsUrl = rasterObject.wms_info.addTimeToEndpoint(
        this.props.tile.datetime,
        rasterObject.first_value_timestamp,
        rasterObject.last_value_timestamp
      );
    } else {
      wmsUrl = rasterObject.wms_info.endpoint;
    }

    return (
      <WMSTileLayer
        url={wmsUrl}
        key={rasterObject.uuid}
        layers={rasterObject.wms_info.layer}
        styles={rasterObject.options.styles}
        opacity={raster.opacity}
      />
    );
  }
  render() {
    const { isInteractive, bbox, tile, width, height } = this.props;

    const bounds = bbox
      ? [[bbox.southmost, bbox.westmost], [bbox.northmost, bbox.eastmost]]
      : [
          [-34.87831497192377, 149.9476776123047],
          [-32.76800155639643, 152.0842590332031]
        ];

    const boundsForLeaflet = this.getBbox().toLeafletArray();
    const assets = tile.assetTypes ? this.props.assets[tile.assetTypes] : {};
    const markers = Object.values(assets).map(asset => {
      const { coordinates } = asset.geometry;
      return (
        <CircleMarker
          radius={5}
          color="#fff"
          fillColor="green"
          weight={1}
          fillOpacity={1}
          center={[coordinates[1], coordinates[0]]}
          key={asset.id}
        />
        // ^^ TODO: fillColor red/green based on alarm threshold exceeding?
      );
    });

    return (
      <div className={styles.FullMap} style={{ width, height }}>
        <Map
          bounds={boundsForLeaflet}
          attributionControl={false}
          dragging={isInteractive}
          touchZoom={isInteractive}
          doubleClickZoom={isInteractive}
          scrollWheelZoom={isInteractive}
          boxZoom={isInteractive}
          keyboard={isInteractive}
          tap={isInteractive}
          zoomControl={false}
          attribution={false}
          className={styles.MapStyle}
        >
          <TileLayer url="https://{s}.tiles.mapbox.com/v3/nelenschuurmans.iaa98k8k/{z}/{x}/{y}.png" />
          {/* <Marker position={[-33.815, 151.0087]} /> */}
          {tile.rasters
            ? tile.rasters.map(raster => this.tileLayerForRaster(raster))
            : null}
          {markers}
        </Map>
        {tile.rasters && tile.rasters.length > 0 ? (
          <Legend tile={tile} />
        ) : null}
      </div>
    );
  }
}

function mapStateToProps(state) {
  return {
    assets: state.assets,
    rasters: state.rasters
  };
}

function mapDispatchToProps(dispatch) {
  return {
    addAsset: (assetType, id, instance) =>
      dispatch(addAsset(assetType, id, instance)),
    getRaster: uuid => dispatch(getRaster(uuid))
  };
}

export default connect(mapStateToProps, mapDispatchToProps)(FullMap);
