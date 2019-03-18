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
  constructor(props) {
    super(props);
    // this.setTheDivRef = this.setTheDivRef.bind(this);
    // this.theDiv = React.createRef();
    // this.getTheDiv = this.getTheDiv.bind(this);
    // this.getTheDivHeight = this.getTheDivHeight.bind(this);
    // this.getTheDivWidth = this.getTheDivWidth.bind(this);
    // this.theDiv = null;
    this.state = {
      theDiv: null
    };

    this.setTheDivRef = theDiv => {
      // this.theDiv = theDiv;
      this.setState({
        theDiv: theDiv
      });
    };
  }
  // getTheDiv(){
  //   return this.theDiv;
  // }
  // getTheDivHeight(){
  //   return this.theDiv.clientHeight;
  // }
  // getTheDivWidth(){
  //   return this.theDiv.clientWidth;
  // }
  // setTheDivRef(theDiv) {
  //   this.theDiv = theDiv;
  // }

  componentWillMount() {
    (this.props.tile.timeseries || []).map(
      this.props.getTimeseriesMetadataAction
    );
    console.log(
      "tile.id ______________________________________________________________",
      this.props.tile.id
    );
    (this.props.tile.rasterIntersections || []).map(intersection => {
      console.log("tile.id rasterIntersections ");
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

    console.log("thediv 0 ", width, height);

    if (!width && !height) {
      console.log("thediv 1 ", width, height, this.theDiv);
      if (this.props.isFull) {
        console.log("thediv 2 ", width, height);
        // debugger;
        width = window.innerWidth;
        height = window.innerHeight;
      } else if (this.state.theDiv) {
        // else if (this.theDiv) {
        // else if (this.getTheDiv()) {

        width = this.state.theDiv.clientWidth;
        height = this.state.theDiv.clientHeight;
        // width = this.theDiv.clientWidth;
        // height = this.theDiv.clientHeight;

        // width = this.getTheDivWidth();
        // height = this.getTheDivHeight();
        console.log("thediv ", width, height);
      }
    }

    const marginLeft = iframeModeActive ? 0 : this.props.marginLeft;

    const newProps = {
      ...this.props,
      width: width - marginLeft,
      height: height - this.props.marginTop
    };

    newProps.marginLeft = marginLeft;

    // console.log('timeseriesTile, render ', this.props.tile.id, this.allAssetsPresent())

    return (
      <div
        // ref={theDiv => (this.theDiv = theDiv)}
        ref={this.setTheDivRef}
        // ref={this.theDiv}
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

const TimeseriesTile = connect(mapStateToProps, mapDispatchToProps)(
  TimeseriesTileComponent
);

export default TimeseriesTile;
