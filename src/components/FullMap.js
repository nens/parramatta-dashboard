import React, { Component } from "react";
import { BOUNDS } from "../config";
import { connect } from "react-redux";
import { getRaster, addAsset, updateTimeseriesMetadata } from "../actions";
import { getMeasuringStations } from "lizard-api-client";
import {
  Map,
  CircleMarker,
  Popup,
  TileLayer,
  WMSTileLayer
} from "react-leaflet";
import Legend from "./Legend";
import styles from "./FullMap.css";

class FullMap extends Component {
  constructor(props) {
    super(props);
    this.getPopup = this.getPopup.bind(this);
  }
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
  clickMarker(assetType, assetId) {
    const asset = this.props.assets[assetType][assetId];
    if (!asset.timeseries) return;
    asset.timeseries.forEach(this.props.updateTimeseries);
  }
  getPopup(asset) {
    let timeseriesTable;
    if (!asset.timeseries || !asset.timeseries.length) {
      timeseriesTable = <p>This asset has no timeseries.</p>;
    } else {
      const timeseriesWithMetadata = asset.timeseries.filter(
        ts => this.props.timeseriesMetadata[ts.uuid]
      );

      if (timeseriesWithMetadata.length) {
        // Create a table with units and latest values.
        const rows = timeseriesWithMetadata.map((ts, idx) => {
          const metadata = this.props.timeseriesMetadata[ts.uuid];
          return (
            <tr key={idx}>
              <td>{metadata.name}</td>
              <td>{metadata.last_value}</td>
              <td>{metadata.observation_type.unit || ""}</td>
            </tr>
          );
        });
        timeseriesTable = (
          <table className={styles.PopupTable}>
            <thead>
              <tr>
              <td><strong>Timeseries name</strong></td>
              <td><strong>Last value</strong></td>
              <td><strong>Unit</strong></td>
              </tr>
            </thead>
            <tbody>
            {rows}
            </tbody>
          </table>
        );
      } else {
        timeseriesTable = <p>Loading timeseries...</p>;
      }
    }

    return (
      <Popup minWidth={250}>
        <div className={styles.Popup}>
          <p>
            <strong>{asset.name}</strong>
          </p>
          {timeseriesTable}
        </div>
      </Popup>
    );
  }

  render() {
    const { isInteractive, tile, width, height } = this.props;
    const boundsForLeaflet = this.getBbox().toLeafletArray();


    let markers = [];

    this.props.tile.assetTypes.forEach(assetType => {
      const assets = this.props.assets[assetType];
      if (!assets) {
        return;
      }

      Object.values(assets).forEach((asset, idx) => {
        const {coordinates} = asset.geometry;
        let marker = (
          <CircleMarker
            onclick={() =>
              !this.props.isThumb && this.clickMarker(assetType, asset.id)}
            radius={5}
            color="#fff"
            fillColor="green"
            weight={1}
            fillOpacity={1}
            center={[coordinates[1], coordinates[0]]}
            key={asset.id}
          >
            {this.getPopup(asset)}
          </CircleMarker>
        );
        markers.push(marker);
      });
    });

    let legend = null;
    if (tile.rasters && tile.rasters.length > 0) {
      const rasterUuid = tile.rasters[0].uuid;
      if (
        !this.props.rasters[rasterUuid] ||
        !this.props.rasters[rasterUuid].data
      ) {
        legend = null;
      } else {
        const raster = this.props.rasters[rasterUuid].data;
        legend = (
          <Legend
            tile={tile}
            uuid={rasterUuid}
            title={raster.name}
            wmsInfo={raster.wms_info}
            observationType={raster.observation_type}
            styles={raster.options.styles}
          />
        );
      }
    }

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
          {tile.rasters
            ? tile.rasters.map(raster => this.tileLayerForRaster(raster))
            : null}
          {markers}
        </Map>
        {legend}
      </div>
    );
  }
}

function mapStateToProps(state) {
  return {
    assets: state.assets,
    rasters: state.rasters,
    timeseriesMetadata: state.timeseries
  };
}

function mapDispatchToProps(dispatch) {
  return {
    addAsset: (assetType, id, instance) =>
      dispatch(addAsset(assetType, id, instance)),
    getRaster: uuid => dispatch(getRaster(uuid)),
    updateTimeseries: timeseries =>
      dispatch(updateTimeseriesMetadata(timeseries.uuid))
  };
}

export default connect(mapStateToProps, mapDispatchToProps)(FullMap);
