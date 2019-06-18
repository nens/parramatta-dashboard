import React, { Component } from "react";
import { connect } from "react-redux";
import TimeseriesChart from "./TimeseriesChart";
import { makeGetter, getOrFetch } from "lizard-api-client";
import { getTimeseriesMetadataAction, fetchRaster } from "../actions";

// Wrapper for TimeseriesChart.

// The TimeseriesTile fetches the assets and timeseries objects
// that the TimeseriesChart uses; then, when all are present, it renders
// a TimeseriesChart (which fetches the actual timeseries events).
// This is a fix for various "do-this-async-first-then-that-async" issues.

class TimeseriesTileComponent extends Component {
  constructor(props) {
    super(props);
    this.state = {
      theDiv: null
    };
    this.setTheDivRef = theDiv => {
      this.setState({
        theDiv: theDiv
      });
    };
  }

  componentWillMount() {
    (this.props.tile.timeseries || []).map(
      this.props.getTimeseriesMetadataAction
    );

    (this.props.tile.rasterIntersections || []).map(intersection => {
      return getOrFetch(
        this.props.getRaster,
        this.props.fetchRaster,
        intersection.uuid
      );
    });
  }

  timeseries() {
    return this.props.tile.timeseries || [];
  }

  rasters() {
    return (this.props.tile.rasterIntersections || []).map(
      intersection => intersection.uuid
    );
  }

  allAssetsPresent() {
    return (
      this.timeseries().every(this.props.getTimeseriesMetadata) &&
      this.rasters().every(uuid => this.props.getRaster(uuid).object)
    );
  }

  render() {
    let { width, height, iframeModeActive } = this.props;

    if (!width && !height) {
      if (this.props.isFull) {
        width = window.innerWidth;
        height = window.innerHeight;
      } else if (this.state.theDiv) {
        width = this.state.theDiv.clientWidth;
        height = this.state.theDiv.clientHeight;
      }
    }

    const marginLeft = iframeModeActive ? 0 : this.props.marginLeft;

    const newProps = {
      ...this.props,
      width: width - marginLeft,
      height: height - this.props.marginTop
    };

    newProps.marginLeft = marginLeft;

    return (
      <div
        ref={this.setTheDivRef}
        style={{
          width: "100%",
          height: "100%"
        }}
      >
        {this.allAssetsPresent() ? <TimeseriesChart {...newProps} /> : null}
      </div>
    );
  }
}

function mapStateToProps(state, ownProps) {
  if (ownProps.tile.id === 8) {
    // console.log('ownProps.tile',ownProps.tile, state.rasters);
  }
  const rasterIntersectionsUuids =
    (ownProps.tile.rasterIntersections &&
      ownProps.tile.rasterIntersections.map(rasterInt => rasterInt.uuid)) ||
    [];

  const rasterData = {};
  const rasterMetaData = {};
  for (const key in state.rasters.metadata) {
    const shortUuid = key.slice(0, 7);
    if (rasterIntersectionsUuids.includes(shortUuid)) {
      rasterMetaData[key] = state.rasters.data[key];
    }
  }
  for (const key in state.rasters.data) {
    const shortUuid = key.slice(0, 7);
    if (rasterIntersectionsUuids.includes(shortUuid)) {
      rasterData[key] = state.rasters.data[key];
    }
  }
  if (ownProps.tile.id === 8) {
    console.log("rasterData", rasterData, rasterMetaData);
  }
  const rasterObj = {
    data: rasterData,
    metadata: rasterMetaData
  };

  return {
    rasters: rasterObj, // state.rasters,
    getTimeseriesMetadata: uuid => state.timeseries[uuid],
    getRaster: makeGetter(rasterObj), // makeGetter(state.rasters),
    iframeModeActive: state.iframeMode.active
  };
}

function mapDispatchToProps(dispatch) {
  return {
    fetchRaster: uuid => fetchRaster(dispatch, uuid),
    getTimeseriesMetadataAction: uuid =>
      dispatch(getTimeseriesMetadataAction(uuid))
  };
}

const TimeseriesTile = connect(
  mapStateToProps,
  mapDispatchToProps
)(TimeseriesTileComponent);

export default TimeseriesTile;
