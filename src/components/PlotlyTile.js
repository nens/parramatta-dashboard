import React, { Component } from "react";
import { connect } from "react-redux";
import TimeseriesChart from "./TimeseriesChart";
import { makeGetter, getOrFetch } from "lizard-api-client";
import { getTimeseriesMetadataAction, fetchRaster } from "../actions";
import plotComponentFactory from "react-plotly.js/factory";
import PlotlyChart from "./PlotlyChart";

// Wrapper for TimeseriesChart.

// The TimeseriesTile fetches the assets, timeseries objects and alarms
// that the TimeseriesChart uses; then, when all are present, it renders
// a TimeseriesChart (which fetches the actual timeseries events).
// This is a fix for various "do-this-async-first-then-that-async" issues.

class PlotlyTileComponent extends Component {
  componentWillMount() {
    (this.props.tile.timeseries || []).map(
      this.props.getTimeseriesMetadataAction
    );
    this.props.tile.data
      .filter(d => d.xy && d.xy.type === "timeseries")
      .map(d => {
        console.log("gettimeseries dispatch", d.xy.uuid);
        this.props.getTimeseriesMetadataAction(d.xy.uuid);
      });

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
    const Plot = plotComponentFactory(window.Plotly);

    console.log("PlotlyTile ", this.props.tile.data, this.props.tile.layout);

    if (!width && !height) {
      if (this.props.isFull) {
        width = window.innerWidth;
        height = window.innerHeight;
      } else if (this.theDiv) {
        width = this.theDiv.clientWidth;
        height = this.theDiv.clientHeight;
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
        ref={theDiv => (this.theDiv = theDiv)}
        style={{
          width: "100%",
          height: "100%"
        }}
      >
        {/* {this.allAssetsPresent() ? <TimeseriesChart {...newProps} /> : null} */}
        {/* <Plot
          className="fullPlot"
          data={this.props.tile.data}
          layout={this.props.tile.layout}
          config={{ displayModeBar: true }}
        /> */}
        {this.allAssetsPresent() ? <PlotlyChart {...newProps} /> : null}
        {/* <PlotlyChart {...newProps} /> */}
      </div>
    );
  }
}

function mapStateToProps(state) {
  return {
    rasters: state.rasters,
    getTimeseriesMetadata: uuid => state.timeseries[uuid],
    getRaster: makeGetter(state.rasters),
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

const PlotlyTile = connect(mapStateToProps, mapDispatchToProps)(
  PlotlyTileComponent
);

export default PlotlyTile;
