import React, { Component } from "react";
import { connect } from "react-redux";
import moment from "moment";
import "moment/locale/en-au";
import {
  addAsset,
  getRasterEvents,
  getTimeseriesEvents,
  fetchRaster
} from "../actions";
import { makeGetter } from "lizard-api-client";
import {
  Line,
  Bar,
  CartesianGrid,
  ComposedChart,
  ReferenceLine,
  Label,
  Legend,
  ResponsiveContainer,
  Tooltip,
  XAxis,
  YAxis
} from "recharts";
import { scaleTime } from "d3-scale";
import findIndex from "lodash/findIndex";

function combineEventSeries(series) {
  // Events has the form [{uuid: uuid1, events: [events1]}, ...]
  //
  // Return a sorted array of the form
  // [{timestamp: timestamp, uuid1: value1, uuid2: value}}]

  let events = {}; // {timestamp: {uuid1: value1}}

  series.forEach(serie => {
    const isRatio = serie.observation_type.scale === "ratio";

    serie.events.forEach((event, idx) => {
      const timestamp = event.timestamp;
      if (!events.hasOwnProperty(timestamp)) {
        events[timestamp] = {};
      }
      events[timestamp][serie.uuid] = isRatio ? event.sum : event.max;
    });
  });

  let timestamps = Object.keys(events)
    .map(parseFloat)
    .slice()
    .sort();

  return timestamps.map(timestamp => {
    const values = events[timestamp];
    values.timestamp = timestamp;
    return values;
  });
}

function ReferenceLabel(props) {
  const { fill, value, textAnchor, fontSize, viewBox, dy, dx } = props;
  const x = viewBox.width + viewBox.x;
  const y = viewBox.y - 6;
  return (
    <text
      x={x}
      y={y}
      dy={dy}
      dx={dx}
      fill={fill}
      fontSize={fontSize || 10}
      textAnchor={textAnchor}
    >
      {value}
    </text>
  );
}

class TimeseriesChartComponent extends Component {
  constructor(props) {
    super(props);

    this.state = this.getDateTimeState();
  }

  getDateTimeState() {
    const period = this.props.tile.period;

    return {
      start: period[0].asTimestamp(),
      end: period[1].asTimestamp()
    };
  }

  updateDateTimeState() {
    this.setState(this.getDateTimeState());
  }

  componentWillMount() {
    this.updateTimeseries();

    this.interval = setInterval(
      this.updateDateTimeState.bind(this),
      5 * 60 * 1000
    );
  }

  componentWillUpdate(nextProps, nextState) {
    if (
      nextState.start !== this.state.start ||
      nextState.end !== this.state.end
    ) {
      this.updateTimeseries();
    }
  }

  componentWillUnmount() {
    clearInterval(this.interval);
  }

  updateTimeseries() {
    (this.props.tile.timeseries || []).map(uuid =>
      this.props.getTimeseriesEvents(uuid, this.state.start, this.state.end)
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

  getTicks() {
    // Calculate ticks using d3_scale.scaleTime.
    const domain = [new Date(this.state.start), new Date(this.state.end)];
    const scale = scaleTime().domain(domain);

    // One tick per 200 pixels, no more than 4.
    const numTicks = Math.min(4, Math.floor(this.props.width / 200));
    // Note that numTicks is only considered a hint
    const ticks = scale.ticks(numTicks);

    return ticks.map(entry => entry.getTime());
  }

  tickFormatter(tick) {
    const period = this.state.end - this.state.start;
    const periodHours = period / (1000 * 3600);

    const date = moment(tick).format("l");
    const time = moment(tick).format("LT");

    if (periodHours < 24) {
      return time;
    } else if (periodHours < 24 * 7) {
      return date + " " + time;
    } else {
      return date;
    }
  }

  allUuids() {
    // Return UUIDs of all timeseries plus those of all rasters
    return this.props.tile.timeseries.concat(
      (this.props.tile.rasterIntersections || []).map(
        intersection => intersection.uuid
      )
    );
  }

  axisLabel(observationType) {
    return observationType.unit || observationType.reference_frame;
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

  indexForType(axes, observationType) {
    return findIndex(
      axes,
      ax =>
        this.axisLabel(ax) === this.axisLabel(observationType) &&
        ax.scale === observationType.scale
    );
  }

  getAxesData() {
    const axes = [];

    this.allUuids().forEach(uuid => {
      const observationType = this.observationType(uuid);
      if (!observationType) {
        return null;
      }

      const axis = this.indexForType(axes, observationType);

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

  getYAxes(axes, isFull) {
    return axes.map((axis, idx) => {
      return (
        <YAxis
          hide={!isFull}
          key={idx}
          yAxisId={idx}
          orientation={["left", "right"][idx]}
          domain={[axis.scale === "ratio" ? 0 : "auto", "auto"]}
        >
          <Label
            value={this.axisLabel(axis)}
            position="left"
            style={{ textAnchor: "middle" }}
            angle={270}
          />
        </YAxis>
      );
    });
  }

  getLinesAndBars(axes) {
    return this.allUuids().map((uuid, idx) => {
      const observationType = this.observationType(uuid);
      if (!observationType) return null;

      const axisIndex = this.indexForType(axes, observationType);
      let color;

      if (this.props.tile.colors && this.props.tile.colors.length > idx) {
        color = this.props.tile.colors[idx];
      } else {
        color = ["#26A7F1", "#000058", "#99f"][idx % 3]; // Some shades of blue
      }

      if (observationType.scale === "interval") {
        return (
          <Line
            key={uuid}
            yAxisId={axisIndex}
            connectNulls={true}
            fillOpacity={1}
            dot={false}
            name={observationType.getLegendString()}
            type="monotone"
            dataKey={uuid}
            stroke={color}
          />
        );
      } else if (observationType.scale === "ratio") {
        return (
          <Bar
            key={uuid}
            yAxisId={axisIndex}
            name={observationType.getLegendString()}
            dataKey={uuid}
          />
        );
      }
      return null;
    });
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

    const referenceLines = relevantAlarms.map(alarm => {
      // A timeseriesAlarm can have multiple thresholds, make a reference line
      // for each.
      return alarm.thresholds.map(threshold => {
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

        // Figure out which Y axis the value is on so Recharts knows where to plot it
        // The TimeseriesAlarm also have an ObservationType itself, it should be exactly
        // the same as that of the timeseries, but I think using the timeseries' observation
        // type is more robust as we used those to construct the Y axes.
        const observationType = alarm.isTimeseriesAlarm()
          ? this.observationType(alarm.timeseries.uuid)
          : alarm.observation_type;

        const axisIndex = this.indexForType(axes, observationType);

        if (axisIndex === 0 || axisIndex === 1) {
          return (
            <ReferenceLine
              key={`alarmreference-${alarm.uuid}-${threshold.value}`}
              y={threshold.value}
              yAxisId={axisIndex}
              stroke={color}
            >
              <Label value={label} position="insideBottomLeft" />
            </ReferenceLine>
          );
        } else {
          return null;
        }
      });
    });

    // It is an array of arrays now, return flattened version
    return Array.prototype.concat([], referenceLines);
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

    const combinedEvents = combineEventSeries(
      timeseriesEvents.concat(rasterEvents)
    );
    const axes = this.getAxesData();

    if (!axes.length) return null;

    return this.props.isFull
      ? this.renderFull(combinedEvents, axes)
      : this.renderTile(combinedEvents, axes);
  }

  renderFull(combinedEvents, axes) {
    const { width, height, tile } = this.props;

    const grid = <CartesianGrid strokeDasharray="3 3" />;
    const xaxis = (
      <XAxis
        dataKey="timestamp"
        type="number"
        domain={[this.state.start, this.state.end]}
        ticks={this.getTicks()}
        tickFormatter={this.tickFormatter.bind(this)}
      />
    );
    const legend = <Legend verticalAlign="bottom" height={36} />;
    const yaxes = this.getYAxes(axes, true);
    const margin = 0;
    const lines = this.getLinesAndBars(axes);

    return (
      <ComposedChart
        width={width}
        height={height}
        data={combinedEvents}
        margin={{
          top: 75,
          bottom: margin,
          left: width < 700 ? 20 : 220,
          right: 2 * margin
        }}
        key={"composedchart-" + tile.id}
      >
        {grid}
        {lines}
        {xaxis}
        {yaxes}
        {legend}
        {
          <ReferenceLine
            x={new Date().getTime()}
            strokeWidth={2}
            stroke="#ccc"
            label={<ReferenceLabel fill={"#000"} value={"Now"} />}
          />
        }
        {this.alarmReferenceLines(axes)}
        <Tooltip
          isAnimationActive={false}
          labelFormatter={label => {
            return moment(label)
              .locale("en-au")
              .format("LLL");
          }}
        />
      </ComposedChart>
    );
  }

  renderTile(combinedEvents, axes) {
    const { width, height, tile } = this.props;

    const yaxes = this.getYAxes(axes, false);
    const lines = this.getLinesAndBars(axes);

    return (
      <ResponsiveContainer>
        <ComposedChart
          width={width}
          height={height}
          data={combinedEvents}
          margin={{
            top: 50
          }}
          key={"composedchart-tile-" + tile.id}
        >
          {lines}
          {yaxes}
          {<ReferenceLine x={new Date().getTime()} stroke="black" />}
          {this.alarmReferenceLines(axes)}
        </ComposedChart>
      </ResponsiveContainer>
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
    alarms: state.alarms
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
