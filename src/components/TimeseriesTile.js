import React, { Component } from "react";
import { connect } from "react-redux";
import TimeseriesChart from "./TimeseriesChart";
import { makeGetter, getOrFetch } from "lizard-api-client";
import { getTimeseriesMetadataAction, fetchRaster } from "../actions";

// Wrapper for TimeseriesChart.

// The TimeseriesTile fetches the assets, timeseries objects and alarms
// that the TimeseriesChart uses; then, when all are present, it renders
// a TimeseriesChart (which fetches the actual timeseries events).
// This is a fix for various "do-this-async-first-then-that-async" issues.

class TimeseriesTileComponent extends Component {
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
    let { width, height } = this.props;

    if (!width && !height) {
      if (this.props.isFull) {
        width = window.innerWidth;
        height = window.innerHeight;
      } else if (this.theDiv) {
        width = this.theDiv.clientWidth;
        height = this.theDiv.clientHeight;
      }
    }

    if (this.allAssetsPresent()) {
      const newProps = {
        ...this.props,
        width: width - this.props.marginLeft,
        height: height - this.props.marginTop
      };

      return (
        <div
          ref={theDiv => (this.theDiv = theDiv)}
          style={{
            width: "100%",
            height: "100%"
          }}
        >
          <TimeseriesChart {...newProps} />
        </div>
      );
    } else {
      return null;
    }
  }
}

function mapStateToProps(state) {
  return {
    rasters: state.rasters,
    getTimeseriesMetadata: uuid => state.timeseries[uuid],
    getRaster: makeGetter(state.rasters)
  };
}

function mapDispatchToProps(dispatch) {
  return {
    fetchRaster: uuid => fetchRaster(dispatch, uuid),
    getTimeseriesMetadataAction: uuid =>
      dispatch(getTimeseriesMetadataAction(uuid))
  };
}

const TimeseriesTile = connect(mapStateToProps, mapDispatchToProps)(
  TimeseriesTileComponent
);

export default TimeseriesTile;
