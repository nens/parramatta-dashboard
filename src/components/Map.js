import React, { Component } from "react";
import { BOUNDS } from "../config";
import { connect } from "react-redux";
import { find } from "lodash";

import { getRaster, addAsset } from "../actions";
import { getMeasuringStations } from "lizard-api-client";
import {
  Map,
  CircleMarker,
  Popup,
  TileLayer,
  WMSTileLayer
} from "react-leaflet";
import Legend from "./Legend";
import styles from "./Map.css";
import { updateTimeseriesMetadata } from "../actions";

class MapComponent extends Component {
  constructor(props) {
    console.log("Map props: ", props);
    super(props);
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

  isAssetActive(asset) {
    if (!this.props.alarms.data) return false;

    console.log("Asset:", asset.timeseries);
    // Get all active warnings, see if one belongs to this asset
    return !!find(
      this.props.alarms.data.filter(alarm => alarm.activeWarning()),
      alarm => alarm.belongsToAsset(asset)
    );
  }

  getPopup(asset) {
    if (!this.props.isFull) return null;

    let timeseriesTable;
    if (!asset.timeseries || !asset.timeseries.length) {
      timeseriesTable = <p>This asset has no timeseries.</p>;
    } else {
      console.log("asset.timeseries", asset.timeseries);
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
                <td>
                  <strong>Timeseries name</strong>
                </td>
                <td>
                  <strong>Last value</strong>
                </td>
                <td>
                  <strong>Unit</strong>
                </td>
              </tr>
            </thead>
            <tbody>{rows}</tbody>
          </table>
        );
      } else {
        timeseriesTable = <p>Loading timeseries...</p>;
      }
    }

    return (
      <Popup minWidth={250} keepInView={true}>
        <div className={styles.Popup}>
          <p>
            <strong>{asset.name}</strong>
          </p>
          {timeseriesTable}
        </div>
      </Popup>
    );
  }

  clickMarker(assetType, assetId) {
    const asset = this.props.assets[assetType][assetId];

    if (!asset.timeseries) return;

    asset.timeseries.forEach(this.props.updateTimeseries);
  }

  markers() {
    const { tile } = this.props;
    if (!tile.assetTypes) return null;

    const markers = [];

    tile.assetTypes.forEach(assetType => {
      const assets = this.props.assets[assetType] || {};
      Object.values(assets).forEach(asset => {
        const { coordinates } = asset.geometry;

        const isActive = this.isAssetActive(asset);

        const marker = (
          <CircleMarker
            onclick={() =>
              this.props.isFull && this.clickMarker(assetType, asset.id)}
            radius={5}
            color="#fff"
            fillColor={isActive ? "red" : "green"}
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

    return markers;
  }

  render() {
    return this.props.isFull ? this.renderFull() : this.renderSmall();
  }

  renderFull() {
    const { tile, width, height } = this.props;

    let legend = null;

    if (tile.rasters && tile.rasters.length > 0) {
      // Only show a legend for the first raster.
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
      <div className={styles.MapTileFull} style={{ width, height }}>
        <Map
          bounds={this.getBbox().toLeafletArray()}
          attributionControl={false}
          dragging={true}
          touchZoom={true}
          doubleClickZoom={true}
          scrollWheelZoom={true}
          boxZoom={true}
          keyboard={true}
          tap={true}
          zoomControl={false}
          attribution={false}
          className={styles.MapStyleFull}
          onclick={event =>
            console.log("LATLNG:", event.latlng.lat, event.latlng.lng)}
        >
          <TileLayer url="https://{s}.tiles.mapbox.com/v3/nelenschuurmans.iaa98k8k/{z}/{x}/{y}.png" />
          {tile.rasters
            ? tile.rasters.map(raster => this.tileLayerForRaster(raster))
            : null}
          {this.markers()}
          {legend}
        </Map>
      </div>
    );
  }

  renderSmall() {
    const { tile } = this.props;

    return (
      <div className={styles.MapStyleTile}>
        <Map
          bounds={this.getBbox().toLeafletArray()}
          attributionControl={false}
          dragging={false}
          touchZoom={false}
          doubleClickZoom={false}
          scrollWheelZoom={false}
          boxZoom={false}
          keyboard={false}
          tap={false}
          zoomControl={false}
          attribution={false}
          className={styles.MapStyleTile}
        >
          <TileLayer url="https://{s}.tiles.mapbox.com/v3/nelenschuurmans.iaa98k8k/{z}/{x}/{y}.png" />
          {tile.rasters
            ? tile.rasters.map(raster => this.tileLayerForRaster(raster))
            : null}
          {this.markers()}
        </Map>
      </div>
    );
  }
}

function mapStateToProps(state) {
  return {
    assets: state.assets,
    rasters: state.rasters,
    alarms: state.alarms,
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

export default connect(mapStateToProps, mapDispatchToProps)(MapComponent);
