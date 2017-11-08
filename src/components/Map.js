import React, { Component } from "react";
import { BOUNDS } from "../config";
import { connect } from "react-redux";
import { find } from "lodash";
import { divIcon } from "leaflet";
import { updateTimeseriesMetadata, fetchRaster, addAsset } from "../actions";
import {
  getMeasuringStations,
  makeGetter,
  getOrFetch
} from "lizard-api-client";
import { Map, Marker, Popup, TileLayer, WMSTileLayer } from "react-leaflet";
import Legend from "./Legend";
import styles from "./Map.css";

class MapComponent extends Component {
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
    let rasterObject = getOrFetch(
      this.props.getRaster,
      this.props.fetchRaster,
      raster.uuid
    );

    if (!rasterObject) {
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
    if (!this.props.alarms.timeseriesData) return false;

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
        const iconAlarm = divIcon({
          className: "my-div-icon",
          html: `<svg fill="red" height="24" viewBox="0 0 24 24" width="24" xmlns="http://www.w3.org/2000/svg">
                  <path d="M0 0h24v24H0z" fill="none"/>
                  <path d="M1 21h22L12 2 1 21zm12-3h-2v-2h2v2zm0-4h-2v-4h2v4z"/>
              </svg>`
        });
        const iconNoAlarm = divIcon({
          className: "my-div-icon",
          html: `<svg fill="green" height="24" viewBox="0 0 24 24" width="24" xmlns="http://www.w3.org/2000/svg">
                  <path d="M0 0h24v24H0z" fill="none"/>
                  <path d="M12 2C6.48 2 2 6.48 2 12s4.48 10 10 10 10-4.48 10-10S17.52 2 12 2zm-2 15l-5-5 1.41-1.41L10 14.17l7.59-7.59L19 8l-9 9z"/>
              </svg>`
        });
        const marker = (
          <Marker
            key={asset.id}
            icon={isActive ? iconAlarm : iconNoAlarm}
            position={[coordinates[1], coordinates[0]]}
            onclick={() =>
              this.props.isFull && this.clickMarker(assetType, asset.id)}
          >
            {this.getPopup(asset)}
          </Marker>
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
      const raster = getOrFetch(
        this.props.getRaster,
        this.props.fetchRaster,
        rasterUuid
      );

      if (!raster) {
        legend = null;
      } else {
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

    const wmsLayers = tile.wmsLayers
      ? tile.wmsLayers.map((layer, i) => {
          return (
            <WMSTileLayer
              key={i}
              url={layer.url}
              format={layer.format}
              layers={layer.layers}
              transparent={layer.transparent}
              width={layer.width}
              height={layer.height}
              srs={layer.srs}
            />
          );
        })
      : null;

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
        >
          <TileLayer url="https://{s}.tiles.mapbox.com/v3/nelenschuurmans.iaa98k8k/{z}/{x}/{y}.png" />
          {tile.rasters
            ? tile.rasters.map(raster => this.tileLayerForRaster(raster))
            : null}
          {this.markers()}
          {legend}
          {wmsLayers}
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
    getRaster: makeGetter(state.rasters),
    alarms: state.alarms,
    timeseriesMetadata: state.timeseries
  };
}

function mapDispatchToProps(dispatch) {
  return {
    addAsset: (assetType, id, instance) =>
      dispatch(addAsset(assetType, id, instance)),
    fetchRaster: uuid => fetchRaster(dispatch, uuid),
    updateTimeseries: timeseries =>
      dispatch(updateTimeseriesMetadata(timeseries.uuid))
  };
}

export default connect(mapStateToProps, mapDispatchToProps)(MapComponent);
