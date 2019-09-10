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

  shouldComponentUpdate(nextProps) {
    if (this.props.width !== nextProps.width) return true;
    if (this.props.height !== nextProps.height) return true;
    if (this.allAssetsPresent(this.props) !== this.allAssetsPresent(nextProps))
      return true;
    return false;
  }

  timeseries() {
    return;
  }

  rasters() {
    return;
  }

  allAssetsPresent(props) {
    return (
      (props.tile.timeseries || []).every(props.getTimeseriesMetadata) &&
      (props.tile.rasterIntersections || [])
        .map(intersection => intersection.uuid)
        .every(uuid => props.getRaster(uuid).object)
    );
  }

  render() {
    let {
      width,
      height,
      iframeModeActive,
      isFull,
      marginLeft,
      marginTop
    } = this.props;

    if (!width && !height) {
      if (isFull) {
        width = window.innerWidth;
        height = window.innerHeight;
      } else if (this.state.theDiv) {
        width = this.state.theDiv.clientWidth;
        height = this.state.theDiv.clientHeight;
      }
    }

    const newMarginLeft = iframeModeActive ? 0 : marginLeft;

    const newProps = {
      ...this.props,
      marginLeft: newMarginLeft,
      width: width - marginLeft,
      height: height - marginTop
    };

    return (
      <div
        ref={this.setTheDivRef}
        style={{
          width: "100%",
          height: "100%"
        }}
      >
        {this.allAssetsPresent(this.props) ? (
          <TimeseriesChart {...newProps} />
        ) : null}
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

const TimeseriesTile = connect(
  mapStateToProps,
  mapDispatchToProps
)(TimeseriesTileComponent);

export default TimeseriesTile;
