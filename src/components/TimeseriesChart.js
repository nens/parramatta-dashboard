import React, { Component } from "react";
// import ReactDOM from "react-dom"; re-anbale for Plot hack??
import MDSpinner from "react-md-spinner";
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

class TimeseriesChartComponent extends Component {
  constructor(props) {
    super(props);

    const curPer = currentPeriod(props.configuredNow, props.bootstrap);
    this.state = {
      ...curPer,
      componentHasMountedOnce: false,
      componentRef: "comp-" + parseInt(Math.random(), 10),
      wantedAxes: null,
      combinedEvents: null,
      isFinishedFetchingRasterEvents: false,
      isFinishedFetchingTimeseriesEvents: false
    };

    this._areAllRasterEventsLoaded = this._areAllRasterEventsLoaded.bind(this);
    this._areAlltimeseriesEventsLoaded = this._areAllTimeseriesEventsLoaded.bind(
      this
    );
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
        if (!events) {
          return null;
        }

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
  }

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
        if (axes.length >= 3) {
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

    if (!tile.rasterIntersections) {
      return false;
    }

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

  _areAllRasterEventsLoaded(tile) {
    let result = true;
    if (tile.rasterIntersections) {
      const SHORT_UUIDS = tile.rasterIntersections.map(is => is.uuid);
      SHORT_UUIDS.forEach(
        shortUuid =>
          (result = result && this.props.areRasterEventsLoaded(shortUuid))
      );
    }
    return result;
  }

  _areAllTimeseriesEventsLoaded(tile) {
    let result = true;
    if (tile.timeseries) {
      tile.timeseries.forEach(
        longUuid =>
          (result = result && this.props.areTimeseriesEventsLoaded(longUuid))
      );
    }
    return result;
  }

  areAllEventsLoaded(tile) {
    const allEventsAreFinishedLoading =
      this._areAllRasterEventsLoaded(tile) &&
      this._areAllTimeseriesEventsLoaded(tile);
    return allEventsAreFinishedLoading;
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
        let color = "#888";
        let active = "";
        let label = "";

        if (
          alarm.warning_threshold &&
          alarm.warning_threshold.value === threshold.value
        ) {
          const time = moment(alarm.warning_timestamp)
            .locale("en-au")
            .format("LLL");
          active = `, active since ${time}`;
          color = "#F00";
        }

        if (isFull) {
          label = `${threshold.warning_level}${active}`;
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
              dash: "dot",
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

  getThresholdLine(threshold, yref) {
    return {
      type: "line",
      layer: "above",
      x0: 0,
      x1: 1,
      xref: "paper",
      yref: yref,
      y0: threshold.value,
      y1: threshold.value,
      line: {
        width: 1,
        color: threshold.color
      }
    };
  }

  getThresholdAnnotation(threshold, yref) {
    return {
      text: " " + threshold.label + " ",
      bordercolor: threshold.color,
      xref: "paper",
      x0: 0,
      x1: 1,
      yanchor: "bottom",
      yref: yref,
      y: parseFloat(threshold.value),
      showarrow: false
    };
  }

  getAnnotationsAndShapes(axes, thresholds) {
    const { isFull, tile } = this.props;

    let timelines = [];
    if (tile.timelines) {
      timelines = tile.timelines;
    }

    let backgroundColorShapes = [];
    if (tile.backgroundColorShapes) {
      backgroundColorShapes = tile.backgroundColorShapes;
    }

    let shapes = [];
    let annotations = [];
    let thresholdLines, thresholdAnnotations;

    const now = getNow(this.props.configuredNow).getTime();
    const alarmReferenceLines = this.alarmReferenceLines(axes);

    if (thresholds) {
      thresholdLines = thresholds.map(th => {
        // Welke y as?
        let yref = "y";
        if (axes.length === 2 && axes[1].unit === th.unitReference) {
          yref = "y2";
        }
        return this.getThresholdLine(th, yref);
      });
      thresholdAnnotations = thresholds.map(th => {
        // Welke y as?
        let yref = "y";
        if (axes.length === 2 && axes[1].unit === th.unitReference) {
          yref = "y2";
        }
        return this.getThresholdAnnotation(th, yref);
      });
    }

    if (alarmReferenceLines) {
      shapes = alarmReferenceLines.shapes;
      annotations = alarmReferenceLines.annotations;
    }

    // Return lines for alarms, ts thresholds and timelines

    // Timelines with annotation
    // Always show nowline
    const nowLine = createVerticalLine(
      0,
      "#C0392B", // red in Lizard colors
      "dot",
      isFull,
      true,
      now
    );
    shapes.push(nowLine);
    const nowAnnotation = createAnnotationForVerticalLine(
      0,
      "#C0392B", // red in Lizard colors
      "NOW",
      true,
      now
    );
    annotations.push(nowAnnotation);
    timelines.forEach(function(timeline) {
      const nowLine = createVerticalLine(
        timeline.epochTimeInMilliSeconds,
        timeline.color,
        timeline.lineDash,
        isFull,
        timeline.isRelativeTimeFromNow,
        now
      );
      shapes.push(nowLine);
      const nowAnnotation = createAnnotationForVerticalLine(
        timeline.epochTimeInMilliSeconds,
        timeline.color,
        timeline.text,
        timeline.isRelativeTimeFromNow,
        now
      );
      annotations.push(nowAnnotation);
    });

    // Background color shapes to show a certain background color between
    // two x axis values.
    backgroundColorShapes.forEach(function(backgroundColorShape) {
      const backgroundShape = backgroundColorBetweenTwoX(
        backgroundColorShape.x1EpochTimeInMilliSeconds,
        backgroundColorShape.x2EpochTimeInMilliSeconds,
        backgroundColorShape.color,
        backgroundColorShape.opacity,
        backgroundColorShape.isRelativeTimeFromNow,
        now
      );
      shapes.push(backgroundShape);
    });

    if (thresholds) {
      thresholdLines.forEach(thLine => {
        shapes.push(thLine);
      });
      thresholdAnnotations.forEach(thAnnot => {
        annotations.push(thAnnot);
      });
    }

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

  getLayout(axes, thresholds = null) {
    const { width, height, isFull, showAxis, tile } = this.props;

    // We have a bunch of lines with labels, the labels are annotations and
    // the lines are shapes, that's why we have one function to make them.
    // Only full mode shows the labels.
    const annotationsAndShapes = this.getAnnotationsAndShapes(axes, thresholds);

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

    // Show the legend when isFull and if tile.showLegend is set to true or
    // when isFull and tile.showLegend does not exist (to make it backwards
    // compatible).
    let showLegend = false;
    if (isFull) {
      if (
        (tile && tile.showLegend) ||
        (tile && tile.showLegend === undefined)
      ) {
        showLegend = true;
      }
    }

    // Use the tile configuration for some of the configuration.
    // Use the react-plotly default (undefined), if no configuration is set.

    return {
      width: width,
      height: height,
      yaxis: {
        ...this.getYAxis(axes, 0),
        // No longer be able to zoom on yaxis on isFull, but keep pointer
        // cursor when isFull is false.
        fixedrange: isFull ? true : false,
        visible: showAxis
      },
      yaxis2: {
        ...this.getYAxis(axes, 1),
        // No longer be able to zoom on second yaxis on isFull, but keep
        // pointer cursor when isFull is false.
        fixedrange: isFull ? true : false,
        visible: showAxis
      },
      showlegend: showLegend,
      legend: {
        x: tile.legend && tile.legend.x ? tile.legend.x : 0.02, // 1.02 is default
        xanchor:
          tile.legend && tile.legend.xanchor ? tile.legend.xanchor : undefined, // left is default
        y: tile.legend && tile.legend.y ? tile.legend.y : 1, // 1 is default
        yanchor:
          tile.legend && tile.legend.yanchor ? tile.legend.yanchor : undefined, // auto is default
        borderwidth:
          tile.legend && tile.legend.borderwidth ? tile.legend.borderwidth : 1,
        bordercolor:
          tile.legend && tile.legend.bordercolor
            ? tile.legend.bordercolor
            : undefined,
        bgcolor:
          tile.legend && tile.legend.bgcolor ? tile.legend.bgcolor : undefined,
        font: {
          family:
            tile.legend && tile.legend.font && tile.legend.font.family
              ? tile.legend.font.family
              : undefined,
          size:
            tile.legend && tile.legend.font && tile.legend.font.size
              ? tile.legend.font.size
              : undefined, // 12
          color:
            tile.legend && tile.legend.font && tile.legend.font.color
              ? tile.legend.font.color
              : undefined
        },
        orientation:
          tile.legend && tile.legend.orientation
            ? tile.legend.orientation
            : undefined, // default is v
        traceorder:
          tile.legend && tile.legend.traceorder
            ? tile.legend.traceorder
            : undefined, // normal is default ?
        tracegroupgap:
          tile.legend && tile.legend.tracegroupgap
            ? tile.legend.tracegroupgap
            : undefined, // default is 10
        uirevision:
          tile.legend && tile.legend.uirevision
            ? tile.legend.uirevision
            : undefined, // default is layout.uirevision ?
        valign:
          tile.legend && tile.legend.valign ? tile.legend.valign : undefined
      },
      margin: margin,
      xaxis: {
        visible: showAxis,
        type: "date",
        showgrid: true,
        range: [this.state.start, this.state.end]
      },
      // False makes it unable to interact with the graph when displayed as tile
      dragmode: isFull ? "zoom" : false, // default is "zoom"
      shapes: annotationsAndShapes.shapes,
      annotations: isFull ? annotationsAndShapes.annotations : []
    };
  }

  render() {
    console.log("timeserieschart render 1");

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
      ? this.renderFull(axes, combinedEvents, tile)
      : this.renderTile(axes, combinedEvents, tile);
  }

  renderFull(axes, combinedEvents, tile) {
    const thresholds = tile.thresholds;
    const Plot = plotComponentFactory(window.Plotly);

    const SPINNER_SIZE = 48;
    const verticalOffset =
      Math.round(this.props.height / 2) - Math.round(SPINNER_SIZE / 2);

    return (
      <div
        id={this.state.componentRef}
        ref={this.state.componentRef}
        style={{
          overflowY: "hidden",
          marginTop: this.props.marginTop,
          marginLeft: this.props.marginLeft,
          width: this.props.width,
          height: this.props.height
        }}
      >
        {this.areAllEventsLoaded(tile) ? (
          <Plot
            className="fullPlot"
            data={combinedEvents}
            layout={this.getLayout(this.state.wantedAxes, thresholds)}
            config={{ displayModeBar: true }}
          />
        ) : (
          <div
            style={{
              position: "relative",
              margin:
                verticalOffset +
                "px calc(50% - " +
                Math.round(SPINNER_SIZE / 2) +
                "px)"
            }}
          >
            <MDSpinner size={SPINNER_SIZE} singleColor={"#16a085"} />
          </div>
        )}
      </div>
    );
  }

  renderTile(axes, combinedEvents, tile) {
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
        {this.areAllEventsLoaded(tile) ? (
          <Plot
            className="gridPlot"
            data={combinedEvents}
            layout={this.getLayout(this.state.wantedAxes)}
            config={{ displayModeBar: false }}
          />
        ) : (
          <div
            style={{
              position: "relative",
              margin: "150px calc(50% - 30px)"
            }}
          >
            <MDSpinner size={48} singleColor={"#16a085"} />
          </div>
        )}
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
    areRasterEventsLoaded: intersectionUuid => {
      let shortIntersectionUuid, theRasterEventsObject;
      if (!state.rasterEvents) {
        console.log(
          "[W] Cannot check for isFetching since state.rasterEvents =",
          state.rasterEvents
        );
        return null;
      } else {
        for (let longUuid in state.rasterEvents) {
          shortIntersectionUuid = longUuid.slice(0, 7);
          if (shortIntersectionUuid === intersectionUuid) {
            theRasterEventsObject = Object.values(
              state.rasterEvents[longUuid]
            )[0];
            return theRasterEventsObject.isFetching === false;
          }
        }
      }
    },
    timeseriesEvents: state.timeseriesEvents,
    areTimeseriesEventsLoaded: tsUuid => {
      if (!state.timeseriesEvents) {
        console.log(
          "[W] Cannot check for isFetching since state.timeseriesEvents =",
          state.timeseriesEvents
        );
        return null;
      } else {
        let theTimeseriesEventsObject;
        for (let longUuid in state.timeseriesEvents) {
          if (longUuid === tsUuid) {
            theTimeseriesEventsObject = state.timeseriesEvents[tsUuid];
            return theTimeseriesEventsObject.isFetching === false;
          }
        }
      }
    },
    alarms: state.alarms,
    configuredNow: getConfiguredNow(state),
    bootstrap: getBootstrap(state)
  };
}

function createVerticalLine(
  timeInEpoch,
  color,
  lineDash,
  isFull,
  isRelativeTimeFromNow,
  now
) {
  return {
    type: "line",
    layer: "above",
    x0: isRelativeTimeFromNow ? now + timeInEpoch : timeInEpoch,
    x1: isRelativeTimeFromNow ? now + timeInEpoch : timeInEpoch,
    yref: "paper",
    y0: 0,
    y1: 1,
    line: {
      dash: lineDash,
      color: color,
      width: isFull ? 2 : 1
    }
  };
}

function createAnnotationForVerticalLine(
  timeInEpoch,
  color,
  text,
  isRelativeTimeFromNow,
  now
) {
  return {
    text: text,
    bordercolor: color,
    x: isRelativeTimeFromNow ? now + timeInEpoch : timeInEpoch,
    xanchor: "right",
    yref: "paper",
    y: 1,
    yanchor: "top",
    showarrow: false
  };
}

function backgroundColorBetweenTwoX(
  timeInEpoch1,
  timeInEpoch2,
  color,
  opacity,
  isRelativeTimeFromNow,
  now
) {
  /*
  This function creates a shape between 2 x values (with times in epoch)
  that will be used to show a different background color between these 2
  x values.

  TODO: translate colors to Lizard colors?
  */

  return {
    type: "rect",
    xref: "x",
    yref: "paper",
    x0: isRelativeTimeFromNow ? now + timeInEpoch1 : timeInEpoch1,
    y0: 0,
    x1: isRelativeTimeFromNow ? now + timeInEpoch2 : timeInEpoch2,
    y1: 1,
    fillcolor: color,
    opacity: opacity,
    line: {
      width: 0
    }
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
