import React, { Component } from "react";
// import ReactDOM from "react-dom"; re-anbale for Plot hack??
import { connect } from "react-redux";
import moment from "moment";
import "moment/locale/en-au";
import {
  addAsset,
  getRasterEvents,
  getTimeseriesEvents,
  fetchRaster
} from "../actions";
import { MAX_TIMESERIES_POINTS } from "../config";
import { getBootstrap, getConfiguredNow } from "../reducers";

import { makeGetter } from "lizard-api-client";
import plotComponentFactory from "react-plotly.js/factory";

import {
  axisLabel,
  indexForType,
  combineEventSeries,
  getNow,
  currentPeriod
} from "./TimeseriesChartUtils.js";

// const log = console.log;

class TimeseriesChartComponent extends Component {
  constructor(props) {
    super(props);

    this.state = {
      ...currentPeriod(props.configuredNow, props.bootstrap),
      componentHasMountedOnce: false,
      componentRef: "comp-" + parseInt(Math.random(), 10),
      wantedAxes: null,
      combinedEvents: null
    };
  }

  /////////////////////////////////////////////////////////////////////////////
  // Component - lifecycle functions //////////////////////////////////////////
  /////////////////////////////////////////////////////////////////////////////

  componentWillMount() {
    this.updateTimeseries();

    const axes = this.getAxesData();

    const timeseriesEvents = this.props.tile.timeseries
      .filter(
        uuid =>
          this.props.timeseries[uuid] &&
          this.props.timeseriesEvents[uuid] &&
          this.props.timeseriesEvents[uuid].events
      )
      .map(uuid => {
        return {
          uuid: uuid,
          observation_type: this.props.timeseries[uuid].observation_type,
          events: this.props.timeseriesEvents[uuid].events
        };
      });

    const rasterEvents = (this.props.tile.rasterIntersections || [])
      .map(intersection => {
        const raster = this.props.getRaster(intersection.uuid).object;
        if (!raster) {
          return null;
        }

        const events = this.getRasterEvents(raster, intersection.geometry);
        if (!events) return null;

        return {
          uuid: intersection.uuid,
          observation_type: raster.observation_type,
          events: events
        };
      })
      .filter(e => e !== null); // Remove nulls

    const combinedEvents = combineEventSeries(
      timeseriesEvents.concat(rasterEvents),
      axes,
      this.props.tile.colors,
      this.props.isFull
    );

    this.setState({
      combinedEvents,
      wantedAxes: axes
    });

    /* this.interval = setInterval(
     *   this.updateDateTimeState.bind(this),
     *   5 * 60 * 1000
     * );*/
  }

  componentWillUpdate(nextProps, nextState) {
    if (
      nextState.start !== this.state.start ||
      nextState.end !== this.state.end
    ) {
      this.updateTimeseries();
    }
  }

  /* componentWillUnmount() {
   *   clearInterval(this.interval);
   * }*/

  /////////////////////////////////////////////////////////////////////////////
  // Component - custom functions /////////////////////////////////////////////
  /////////////////////////////////////////////////////////////////////////////

  updateDateTimeState() {
    this.setState(
      currentPeriod(this.props.configuredNow, this.props.bootstrap)
    );
  }

  updateTimeseries() {
    (this.props.tile.timeseries || []).map(uuid =>
      this.props.getTimeseriesEvents(uuid, this.state.start, this.state.end, {
        minpoints: MAX_TIMESERIES_POINTS
      })
    );

    (this.props.tile.rasterIntersections || []).map(intersection =>
      this.props.getRasterEvents(
        this.props.getRaster(intersection.uuid).object,
        intersection.geometry,
        this.state.start,
        this.state.end
      )
    );
  }

  allUuids() {
    // Return UUIDs of all timeseries plus those of all rasters
    return this.props.tile.timeseries.concat(
      (this.props.tile.rasterIntersections || []).map(
        intersection => intersection.uuid
      )
    );
  }

  observationType(uuid) {
    if (this.props.tile.timeseries.indexOf(uuid) !== -1) {
      // It's a timeseries.
      if (this.props.timeseries[uuid]) {
        return this.props.timeseries[uuid].observation_type;
      } else {
        return null;
      }
    } else {
      // It's a raster.
      const raster = this.props.getRaster(uuid).object;
      return raster ? raster.observation_type : null;
    }
  }

  getAxesData() {
    const axes = [];

    this.allUuids().forEach(uuid => {
      const observationType = this.observationType(uuid);
      if (!observationType) {
        return null;
      }

      const axis = indexForType(axes, observationType);

      if (axis === -1) {
        if (axes.length >= 2) {
          console.error(
            "Can't have a third Y axis for timeseries: ",
            uuid,
            " have:",
            axes
          );
          return axes;
        }
        axes.push(observationType);
      }
    });

    return axes;
  }

  isRelevantTimeseriesAlarm(alarm) {
    const { tile } = this.props;

    return (
      alarm.isTimeseriesAlarm() &&
      tile.timeseries.indexOf(alarm.timeseries.uuid) !== -1
    );
  }

  isRelevantRasterAlarm(alarm) {
    const { tile } = this.props;

    if (!tile.rasterIntersections) return false;

    return (
      !alarm.isTimeseriesAlarm() &&
      tile.rasterIntersections.some(rasterIntersection => {
        const raster = this.props.getRaster(rasterIntersection.uuid).object;
        return (
          raster &&
          alarm.sameIntersection(raster.url, rasterIntersection.geometry)
        );
      })
    );
  }

  alarmReferenceLines(axes) {
    const { alarms, isFull } = this.props;

    if (!alarms.data || !alarms.data.length) {
      return null;
    }

    // Select those alarms that are related to one of the timeseries on
    // this tile.
    const relevantAlarms = alarms.data.filter(
      alarm =>
        this.isRelevantTimeseriesAlarm(alarm) ||
        this.isRelevantRasterAlarm(alarm)
    );

    const shapes = [];
    const annotations = [];

    relevantAlarms.forEach(alarm => {
      // A timeseriesAlarm can have multiple thresholds, make a reference line
      // for each.
      return alarm.thresholds.forEach(threshold => {
        let label = "";
        let active;
        let color;

        if (
          alarm.warning_threshold &&
          alarm.warning_threshold.value === threshold.value
        ) {
          const time = moment(alarm.warning_timestamp)
            .locale("en-au")
            .format("LLL");
          active = `, active since ${time}`;
          color = "red";
        } else {
          active = "";
          color = "black";
        }

        if (isFull) {
          label = `${alarm.name} ${threshold.warning_level}${active}`;
        }

        // Figure out which Y axis the value is on so we know where to plot it
        // The TimeseriesAlarm also have an ObservationType itself, it should be exactly
        // the same as that of the timeseries, but I think using the timeseries' observation
        // type is more robust as we used those to construct the Y axes.
        const observationType = alarm.isTimeseriesAlarm()
          ? this.observationType(alarm.timeseries.uuid)
          : alarm.observation_type;

        const axisIndex = indexForType(axes, observationType);

        if (axisIndex === 0 || axisIndex === 1) {
          shapes.push({
            type: "line",
            layer: "above",
            xref: "paper",
            x0: 0,
            x1: 1,
            yref: axisIndex === 0 ? "y" : "y2",
            y0: threshold.value,
            y1: threshold.value,
            line: {
              color: color,
              width: isFull ? 2 : 1
            }
          });

          annotations.push({
            text: label,
            xref: "paper",
            x: 0,
            xanchor: "left",
            yref: axisIndex === 0 ? "y" : "y2",
            y: threshold.value,
            yanchor: "bottom",
            showarrow: false
          });
        }
      });
    });

    return { shapes, annotations };
  }

  getRasterEvents(raster, geometry) {
    const allEvents = this.props.rasterEvents;
    const geomKey = `${geometry.coordinates[0]}-${geometry.coordinates[1]}`;

    if (allEvents[raster.uuid] && allEvents[raster.uuid][geomKey]) {
      const events = allEvents[raster.uuid][geomKey];
      if (events.start === this.state.start && events.end === this.state.end) {
        return events.events;
      }
    }
    return null;
  }

  getAnnotationsAndShapes(axes) {
    const { isFull } = this.props;

    let annotations = [];
    let shapes = [];

    const alarmReferenceLines = this.alarmReferenceLines(axes);

    if (alarmReferenceLines) {
      annotations = alarmReferenceLines.annotations;
      shapes = alarmReferenceLines.shapes;
    }

    // Return lines for alarms and for "now".
    const now = getNow(this.props.configuredNow).getTime();

    const nowLine = {
      type: "line",
      layer: "above",
      x0: now,
      x1: now,
      yref: "paper",
      y0: 0,
      y1: 1,
      line: {
        color: "red",
        width: isFull ? 2 : 1
      }
    };

    const nowAnnotation = {
      text: "NOW",
      bordercolor: "red",
      x: now,
      xanchor: "right",
      yref: "paper",
      y: 1,
      yanchor: "top",
      showarrow: false
    };

    annotations.push(nowAnnotation);
    shapes.push(nowLine);

    return { annotations, shapes };
  }

  getYAxis(axes, idx) {
    if (idx >= axes.length) return null;

    const observationType = axes[idx];

    const isRatio = observationType.scale === "ratio";

    const yaxis = {
      title: axisLabel(observationType),
      type: "linear",
      rangemode: isRatio ? "tozero" : "normal",
      side: idx === 0 ? "left" : "right",
      overlaying: idx === 1 ? "y" : undefined,
      //      showspikes: true,
      //      spikemode: 'toaxis+across+marker',
      ticks: "outside",
      showgrid: idx === 0,
      zeroline: isRatio
    };

    if (isRatio) {
      yaxis.tick0 = 0;
    }

    return yaxis;
  }

  getLayout(axes) {
    const { width, height, isFull, showAxis } = this.props;

    // We have a bunch of lines with labels, the labels are annotations and
    // the lines are shapes, that's why we have one function to make them.
    // Only full mode shows the labels.
    const annotationsAndShapes = this.getAnnotationsAndShapes(axes);

    let margin = {};

    if (isFull || showAxis) {
      margin = {
        t: 20,
        l: 50,
        r: 50,
        b: 40
      };
    } else {
      margin = {
        t: 5,
        l: 5,
        r: 5,
        b: 5
      };
    }

    return {
      width: width,
      height: height,
      yaxis: {
        ...this.getYAxis(axes, 0),
        visible: showAxis
      },
      yaxis2: {
        ...this.getYAxis(axes, 1),
        visible: showAxis
      },
      showlegend: isFull,
      legend: {
        x: 0.02,
        borderwidth: 1
      },
      margin: margin,
      xaxis: {
        visible: showAxis,
        type: "date",
        showgrid: true,
        range: [this.state.start, this.state.end]
      },
      shapes: annotationsAndShapes.shapes,
      annotations: isFull ? annotationsAndShapes.annotations : []
    };
  }

  render() {
    const { tile } = this.props;

    const timeseriesEvents = tile.timeseries
      .filter(
        uuid =>
          this.props.timeseries[uuid] &&
          this.props.timeseriesEvents[uuid] &&
          this.props.timeseriesEvents[uuid].events
      )
      .map(uuid => {
        return {
          uuid: uuid,
          observation_type: this.props.timeseries[uuid].observation_type,
          events: this.props.timeseriesEvents[uuid].events
        };
      });

    const rasterEvents = (tile.rasterIntersections || [])
      .map(intersection => {
        const raster = this.props.getRaster(intersection.uuid).object;
        if (!raster) {
          return null;
        }

        const events = this.getRasterEvents(raster, intersection.geometry);
        if (!events) return null;

        return {
          uuid: intersection.uuid,
          observation_type: raster.observation_type,
          events: events
        };
      })
      .filter(e => e !== null); // Remove nulls

    const axes = this.getAxesData();

    const combinedEvents = combineEventSeries(
      timeseriesEvents.concat(rasterEvents),
      axes,
      tile.colors,
      this.props.isFull,
      tile.legendStrings
    );

    return this.props.isFull
      ? this.renderFull(axes, combinedEvents)
      : this.renderTile(axes, combinedEvents);
  }

  renderFull(axes, combinedEvents) {
    const Plot = plotComponentFactory(window.Plotly);

    return (
      <div
        id={this.state.componentRef}
        ref={this.state.componentRef}
        style={{
          marginTop: this.props.marginTop,
          marginLeft: this.props.marginLeft,
          width: this.props.width,
          height: this.props.height
        }}
      >
        <Plot
          data={combinedEvents}
          layout={this.getLayout(this.state.wantedAxes)}
          config={{ displayModeBar: true }}
        />
      </div>
    );
  }

  renderTile(axes, combinedEvents) {
    if (!this.props.height || !this.props.width || !window.Plotly) {
      return null;
    }

    const Plot = plotComponentFactory(window.Plotly);

    return (
      <div
        id={this.state.componentRef}
        ref={this.state.componentRef}
        style={{
          marginTop: this.props.marginTop,
          marginLeft: this.props.marginLeft,
          width: this.props.width,
          height: this.props.height
        }}
      >
        <Plot
          data={combinedEvents}
          layout={this.getLayout(this.state.wantedAxes)}
          config={{ displayModeBar: false }}
        />
      </div>
    );
  }
}

function mapStateToProps(state) {
  return {
    measuringstations: state.assets.measuringstation || {},
    getRaster: makeGetter(state.rasters),
    timeseries: state.timeseries,
    rasterEvents: state.rasterEvents,
    timeseriesEvents: state.timeseriesEvents,
    alarms: state.alarms,
    configuredNow: getConfiguredNow(state),
    bootstrap: getBootstrap(state)
  };
}

function mapDispatchToProps(dispatch) {
  return {
    addAsset: (assetType, id, instance) =>
      dispatch(addAsset(assetType, id, instance)),
    fetchRaster: uuid => fetchRaster(dispatch, uuid),
    getTimeseriesEvents: (uuid, start, end) =>
      dispatch(getTimeseriesEvents(uuid, start, end)),
    getRasterEvents: (raster, geometry, start, end) =>
      dispatch(getRasterEvents(raster, geometry, start, end))
  };
}

const TimeseriesChart = connect(mapStateToProps, mapDispatchToProps)(
  TimeseriesChartComponent
);

export default TimeseriesChart;
