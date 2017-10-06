import React, { Component } from "react";
import { connect } from "react-redux";
import { getRaster } from "../actions";
import { Map, TileLayer, WMSTileLayer } from "react-leaflet";
import styles from "./MapTile.css";

class MapTile extends Component {
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
    const { isInteractive, bbox, tile } = this.props;
    const bounds = bbox
      ? [[bbox.southmost, bbox.westmost], [bbox.northmost, bbox.eastmost]]
      : [
          [-34.87831497192377, 149.9476776123047],
          [-32.76800155639643, 152.0842590332031]
        ];


    return (
      <div className={styles.MapTile}>
        <Map
          bounds={bounds}
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
          {tile.rasters ? tile.rasters.map(raster =>
            this.tileLayerForRaster(raster)
          ) : null}

          {/*
          // TODO: Assets?!?!?
          {tile.assetTypes ? tile.assetTypes.map(asset =>
          ) : null}
          */}
        </Map>
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
    getRaster: uuid => dispatch(getRaster(uuid)),
  };
}

export default connect(mapStateToProps, mapDispatchToProps)(MapTile);
