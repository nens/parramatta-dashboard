import React, { Component } from "react";
import { connect } from "react-redux";
import TimeseriesChart from "./TimeseriesChart";
import { makeGetter, getOrFetch } from "lizard-api-client";
import { getTimeseriesMetadataAction, fetchRaster } from "../actions";
import { getTimeseriesMetadata } from "../reducers";

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
  // Fix for tile not being updated when switching between tiles after a F5
  componentWillUpdate(nextProps) {
    if (this.props.tile.shortTitle !== nextProps.tile.shortTitle) {
      (nextProps.tile.timeseries || []).map(
        nextProps.getTimeseriesMetadataAction
      );
    }
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

function mapStateToProps(state) {
  return {
    rasters: state.rasters,
    getTimeseriesMetadata: uuid => getTimeseriesMetadata(state, uuid),
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

const TimeseriesTile = connect(
  mapStateToProps,
  mapDispatchToProps
)(TimeseriesTileComponent);

export default TimeseriesTile;
