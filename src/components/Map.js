import React, { Component } from "react";
import { BOUNDS } from "../config";
import { connect } from "react-redux";
import { find } from "lodash";
import { updateTimeseriesMetadata, fetchRaster, addAsset } from "../actions";
import {
  getReferenceLevels,
  getAllTiles,
  getCurrentMapBackground
} from "../reducers";
import { withRouter } from "react-router-dom";

import {
  getMeasuringStations,
  makeGetter,
  getOrFetch,
  DateTime
} from "lizard-api-client";
import { BoundingBox, isSamePoint } from "../util/bounds";

import { Map, Marker, Popup, TileLayer, WMSTileLayer } from "react-leaflet";
import Legend from "./Legend";
import styles from "./Map.css";
import { IconActiveAlarm, IconInactiveAlarm, IconNoAlarm } from "./MapIcons";

class MapComponent extends Component {
  // make this to hold state of background layer
  constructor(props) {
    super(props);
    let firstRaster = null;
    console.log("props.tile.rasters", props.tile.rasters);
    if (props.tile.rasters && props.tile.rasters.length > 0) {
      firstRaster = getOrFetch(
        props.getRaster,
        props.fetchRaster,
        props.tile.rasters[0].uuid
      );

      props.tile.rasters.forEach((raster, ind) => {
        console.log("if (ind !== 0) {", ind);
        if (ind !== 0) {
          getOrFetch(props.getRaster, props.fetchRaster, raster.uuid);
        }
      });
    }
    this.state = {
      firstRaster: firstRaster
    };
  }

  // comment out component will receive props because this should be done in the constructor
  componentWillReceiveProps(props) {
    if (props.tile.rasters && props.tile.rasters.length > 0) {
      const firstRaster = getOrFetch(
        props.getRaster,
        props.fetchRaster,
        props.tile.rasters[0].uuid
      );
      props.tile.rasters.forEach((raster, ind) => {
        if (ind !== 0) {
          getOrFetch(props.getRaster, props.fetchRaster, raster.uuid);
        }
      });
      if (firstRaster) {
        this.setState({ firstRaster });
      }
    }
  }

  componentDidMount() {
    const { tile } = this.props;
    const inBboxFilter = this.getBbox().toLizardBbox();

    if (tile.assetTypes) {
      tile.assetTypes.forEach(assetType => {
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
      const bbox = this.props.tile.bbox;
      return new BoundingBox(bbox[0], bbox[1], bbox[2], bbox[3]);
    }
    return BOUNDS;
  }

  tileLayerForRaster(raster) {
    console.log("raster.uuid _______ ", raster.uuid);
    // let rasterObject = getOrFetch(
    //   this.props.getRaster,
    //   this.props.fetchRaster,
    //   raster.uuid
    // );
    let rasterObject = this.props.getRaster(raster.uuid).object;

    if (!rasterObject) {
      return null;
    }

    let wmsUrl;
    if (rasterObject.last_value_timestamp && this.props.tile.datetime) {
      console.log(
        "raster.uuid _______ 2 ",
        raster.uuid,
        new DateTime(this.props.tile.datetime)
      );
      console.log(
        "raster.uuid _______ 3 ",
        rasterObject.first_value_timestamp,
        rasterObject.last_value_timestamp
      );
      wmsUrl = rasterObject.wms_info.addTimeToEndpoint(
        new DateTime(this.props.tile.datetime),
        rasterObject.first_value_timestamp,
        rasterObject.last_value_timestamp
      );
      console.log(
        "raster.uuid _______ 3.5 ",
        rasterObject.first_value_timestamp,
        rasterObject.last_value_timestamp
      );
      console.log("raster.uuid _______ 4 ", raster.uuid, wmsUrl);
    } else {
      console.log(
        "raster.uuid _______ 999 ",
        raster.uuid,
        rasterObject.wms_info.endpoint
      );
      wmsUrl = rasterObject.wms_info.endpoint;
    }

    return (
      <WMSTileLayer
        url={wmsUrl}
        key={rasterObject.uuid}
        layers={rasterObject.wms_info.layer}
        styles={rasterObject.options.styles}
        opacity={raster.opacity ? Number.parseFloat(raster.opacity) : 0}
      />
      // <WMSTileLayer
      //         key={i}
      //         url={layer.url}
      //         format={layer.format}
      //         layers={layer.layers}
      //         transparent={layer.transparent}
      //         width={layer.width}
      //         height={layer.height}
      //         srs={layer.srs}
      //         opacity={layer.opacity !== undefined ? layer.opacity : 0.5}
      //       />
      // <div>

      // </div>
    );
  }

  iconForAsset(asset) {
    // Return true if there is a raster alarm at the same location and it is active.
    if (!this.props.alarms.rasterData) return IconNoAlarm;

    // Get the first alarm for this geometry
    const alarm = find(this.props.alarms.rasterData, alarm =>
      alarm.sameGeometry(asset.geometry)
    );

    if (!alarm) return IconNoAlarm;

    if (alarm.activeWarning()) {
      return IconActiveAlarm;
    } else {
      return IconInactiveAlarm;
    }
  }

  getTileLinkForTimeseries(tsUuids) {
    for (let i = 0; i < tsUuids.length; i++) {
      let uuid = tsUuids[i];

      for (let j = 0; j < this.props.allTiles.length; j++) {
        let tile = this.props.allTiles[j];

        if (tile.type !== "timeseries") continue;

        if (tile.timeseries && tile.timeseries.indexOf(uuid) !== -1) {
          // Return a link to this tile.
          return `/full/${tile.id}`;
        }
      }
    }

    // No tile found.
    return null;
  }

  getTileLinkForGeometry(point) {
    for (var j = 0; j < this.props.allTiles.length; j++) {
      const tile = this.props.allTiles[j];

      if (tile.type !== "timeseries") continue;

      if (
        find(tile.rasterIntersections || [], intersection =>
          isSamePoint(point, intersection.geometry)
        )
      ) {
        // Return a link to this tile.
        return `/full/${tile.id}`;
      }
    }
  }

  getPopup(asset) {
    if (!this.props.isFull) return null;

    let timeseriesTable;
    var link = null;

    if (!asset.timeseries || !asset.timeseries.length) {
      timeseriesTable = <p>This asset has no timeseries.</p>;
    } else {
      link = this.getTileLinkForTimeseries(asset.timeseries.map(ts => ts.uuid));

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

    const linkSpan = link ? (
      <button onClick={() => this.props.history.push(link)}>View Chart</button>
    ) : null;

    const referenceLevels = this.props.referenceLevels;
    let referenceLevelText = null;
    if (referenceLevels && referenceLevels[asset.id] !== undefined) {
      referenceLevelText = (
        <p>
          <strong>Reference level: {referenceLevels[asset.id]}</strong>
        </p>
      );
    }

    return (
      <Popup minWidth={250} keepInView={true}>
        <div className={styles.Popup}>
          <p>
            <strong>{asset.name}</strong>
            &nbsp;{linkSpan}
          </p>
          {referenceLevelText}
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
    const allMarkers = this.assetMarkers().concat(this.geometryMarkers());
    return allMarkers.length ? allMarkers : null;
  }

  assetMarkers() {
    const { tile } = this.props;
    if (!tile.assetTypes) return [];

    const markers = [];
    tile.assetTypes.forEach(assetType => {
      const assets = this.props.assets[assetType] || {};
      Object.values(assets).forEach(asset => {
        const { coordinates } = asset.geometry;
        const alarmIcon = this.iconForAsset(asset);
        const marker = (
          <Marker
            key={asset.id}
            icon={alarmIcon}
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

  iconForGeometry(point) {
    // Return true if there is a raster alarm at the same location and it is active.
    if (!this.props.alarms.rasterData) return IconNoAlarm;

    // Get the first alarm for this geometry
    const alarm = find(this.props.alarms.rasterData, alarm =>
      alarm.sameGeometry(point)
    );

    if (!alarm) return IconNoAlarm;

    if (alarm.activeWarning()) {
      return IconActiveAlarm;
    } else {
      return IconInactiveAlarm;
    }
  }

  geometryMarkers() {
    const { tile } = this.props;
    if (!tile.points) return [];

    const markers = [];
    tile.points.forEach((point, idx) => {
      const { coordinates } = point.geometry;
      const alarmIcon = this.iconForGeometry(point.geometry);
      const link = this.getTileLinkForGeometry(point.geometry);

      const linkSpan = link ? (
        <button onClick={() => this.props.history.push(link)}>
          View Chart
        </button>
      ) : null;

      const marker = (
        <Marker
          key={"point-" + idx}
          icon={alarmIcon}
          position={[
            Number.parseFloat(coordinates[1]),
            Number.parseFloat(coordinates[0])
          ]}
        >
          <Popup minWidth={250} keepInView={true}>
            <div className={styles.Popup}>
              <p>
                <strong>{point.title}</strong>
                &nbsp;{linkSpan}
              </p>
            </div>
          </Popup>
        </Marker>
      );
      markers.push(marker);
    });
    return markers;
  }

  tileHasVectors(tile) {
    return tile.type === "map" && tile.assetTypes && tile.assetTypes.length > 0;
  }

  render() {
    return this.props.isFull ? this.renderFull() : this.renderSmall();
  }

  renderFull() {
    const { tile, width, height } = this.props;
    const { firstRaster } = this.state;
    let legend = null;

    if (!firstRaster) {
      legend = (
        <Legend
          drawRaster={false}
          drawVectorIcons={this.tileHasVectors(tile)}
          tile={tile}
        />
      );
    } else {
      legend = (
        <Legend
          drawRaster={true}
          drawVectorIcons={this.tileHasVectors(tile)}
          tile={tile}
          uuid={firstRaster.uuid}
          title={firstRaster.name}
          wmsInfo={firstRaster.wms_info}
          observationType={firstRaster.observation_type}
          styles={firstRaster.options.styles}
        />
      );
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
              opacity={layer.opacity !== undefined ? layer.opacity : 0.5}
            />
          );
        })
      : null;

    return (
      <div
        className={styles.MapTileFull}
        key={"map-" + tile.id}
        style={{ width, height }}
      >
        {legend}
        <Map
          bounds={this.getBbox().toLeafletBounds()}
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
          <TileLayer url={this.props.mapBackground.url} />
          {tile.rasters
            ? tile.rasters.map(raster => this.tileLayerForRaster(raster))
            : null}
          {this.markers()}
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
          bounds={this.getBbox().toLeafletBounds()}
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
          <TileLayer url={this.props.mapBackground.url} />
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
    timeseriesMetadata: state.timeseries,
    allTiles: getAllTiles(state),
    mapBackground: getCurrentMapBackground(state),
    referenceLevels: getReferenceLevels(state)
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

export default withRouter(
  connect(mapStateToProps, mapDispatchToProps)(MapComponent)
);
