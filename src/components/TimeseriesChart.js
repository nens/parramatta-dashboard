import React, { Component } from "react";
import { connect } from "react-redux";
import moment from "moment";
import "moment/locale/en-au";
import { addTimeseries, addAsset, fetchRaster } from "../actions";
import {
  getTimeseries,
  getMeasuringStation,
  makeGetter,
  getOrFetch
} from "lizard-api-client";
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

    this.state = {
      start: null,
      end: null,
      eventsPerTimeseries: {}
    };
  }

  allUuids() {
    // Return UUIDs of all timeseries plus those of all rasters
    return this.props.tile.timeseries.concat(
      (this.props.tile.rasterIntersections || []).map(
        intersection => intersection.uuid
      )
    );
  }

  allTimeseriesHaveMetadata() {
    let result = this.props.tile.timeseries.every(uuid =>
      this.props.timeseries.hasOwnProperty(uuid)
    );

    if (this.props.tile.rasterIntersections) {
      result =
        result &&
        this.props.tile.rasterIntersections.every(intersection => {
          if (!this.props.rasters.data[intersection.uuid]) return false;
          if (
            intersection.measuringStation &&
            !this.props.measuringstations[intersection.measuringStation]
          )
            return false;
          return true;
        });
    }

    return result;
  }

  allTimeseriesHaveEvents() {
    const result = this.allUuids().every(
      uuid =>
        this.state.eventsPerTimeseries[uuid] &&
        !this.state.eventsPerTimeseries[uuid].fetching
    );
    return result;
  }

  componentDidMount() {
    if (this.props.tile.rasterIntersections) {
      this.props.tile.rasterIntersections.forEach(intersection => {
        getOrFetch(
          this.props.getRaster,
          this.props.fetchRaster,
          intersection.uuid
        );

        if (
          intersection.measuringStation &&
          !this.props.measuringstations[intersection.measuringStation]
        ) {
          // Fetch it.
          getMeasuringStation(
            intersection.measuringStation
          ).then(measuringStation => {
            this.props.addAsset(
              "measuringstation",
              measuringStation.id,
              measuringStation
            );
          });
        }
      });
    }

    if (!this.allTimeseriesHaveMetadata()) {
      this.getAllTimeseriesMetadata();
    } else {
      this.componentDidUpdate();
    }
  }
  updateStartEnd() {
    const period = this.props.tile.period;

    const startDatetime = period[0];
    const endDatetime = period[1];

    let startOfTs = null;
    let endOfTs = null;

    if (startDatetime.needsStartEnd() || endDatetime.needsStartEnd()) {
      let startendOfTs = this.startEndOfTs();
      startOfTs = startendOfTs[0];
      endOfTs = startendOfTs[1];
    }

    const startTimestamp = startDatetime.asTimestamp(startOfTs, endOfTs);
    const endTimestamp = endDatetime.asTimestamp(startOfTs, endOfTs);

    if (
      startTimestamp !== this.state.start ||
      endTimestamp !== this.state.end
    ) {
      this.setState({
        start: startTimestamp,
        end: endTimestamp,
        eventsPerTimeseries: {}
      });
    }
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

  startEndOfTs() {
    // Get minimum start and maximum end of all timeseries
    let start = null;
    let end = null;
    this.props.tile.timeseries.forEach(uuid => {
      if (start === null) {
        start = this.props.timeseries[uuid].start;
      } else {
        start = Math.min(start, this.props.timeseries[uuid].start);
      }
      if (end === null) {
        end = this.props.timeseries[uuid].end;
      } else {
        end = Math.max(end, this.props.timeseries[uuid].end);
      }
    });
    return [start, end];
  }

  componentDidUpdate() {
    if (!this.allTimeseriesHaveMetadata()) {
      return; // Still waiting for requests
    }

    if (!this.state.start || !this.state.end) {
      this.updateStartEnd();
      return;
    }

    if (!this.allTimeseriesHaveEvents()) {
      this.props.tile.timeseries.forEach(uuid => {
        if (this.state.eventsPerTimeseries.hasOwnProperty(uuid)) {
          return;
        }

        let newEvents = { ...this.state.eventsPerTimeseries };
        newEvents[uuid] = { fetching: true, events: null };
        this.setState({ eventsPerTimeseries: newEvents });

        const params = {
          window: "hour"
        };

        if (this.props.timeseries[uuid].observation_type.scale === "ratio") {
          params.fields = "sum";
        }
        this.updateTimeseries(uuid, this.state.start, this.state.end, params);
      });
      (this.props.tile.rasterIntersections || []).forEach(intersection => {
        const raster = this.props.rasters.data[intersection.uuid];

        if (this.state.eventsPerTimeseries.hasOwnProperty(intersection.uuid)) {
          return;
        }

        let newEvents = { ...this.state.eventsPerTimeseries };
        newEvents[intersection.uuid] = { fetching: true, events: null };
        this.setState({ eventsPerTimeseries: newEvents });

        this.updateRasterData(
          intersection,
          raster,
          this.state.start,
          this.state.end
        );
      });
    }
  }

  getAllTimeseriesMetadata() {
    const result = this.props.tile.timeseries.forEach(uuid => {
      this.updateTimeseries(uuid, null, null);
    });
    return result;
  }

  updateTimeseries(uuid, start, end, params) {
    getTimeseries(uuid, start, end, params).then(results => {
      if (results && results.length) {
        if (!this.props.timeseries[uuid]) {
          this.props.addTimeseriesToState(uuid, results[0]);
        }
        if (start && end) {
          let newEvents = { ...this.state.eventsPerTimeseries };
          newEvents[uuid] = { fetching: false, events: results[0].events };
          this.setState({ eventsPerTimeseries: newEvents });
        }
      }
    });
  }

  updateRasterData(intersection, raster, start, end) {
    const params = {
      window: 3600000
    };

    if (raster.observation_type.scale === "ratio") {
      params.fields = "sum";
    } else {
      params.fields = "average";
    }

    let point;
    if (intersection.measuringStation) {
      point = this.props.measuringstations[intersection.measuringStation]
        .geometry;
    } else {
      point = intersection.point;
    }

    raster.getDataAtPoint(point, start, end, params).then(results => {
      if (results && results.data) {
        let newEvents = { ...this.state.eventsPerTimeseries };
        newEvents[raster.uuid] = { fetching: false, events: results.data };
        this.setState({ eventsPerTimeseries: newEvents });
      }
    });
  }

  axisLabel(observationType) {
    return observationType.unit || observationType.reference_frame;
  }

  observationType(uuid) {
    if (this.props.timeseries[uuid]) {
      return this.props.timeseries[uuid].observation_type;
    } else {
      return this.props.rasters.data[uuid].observation_type;
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
            barSize={20}
            dataKey={uuid}
            fill={color}
          />
        );
      }
      return null;
    });
  }

  alarmReferenceLines(axes) {
    const { timeseriesAlarms, isFull, tile } = this.props;

    if (!timeseriesAlarms.data || !timeseriesAlarms.data.length) {
      return null;
    }

    // Select those alarms that are related to one of the timeseries on
    // this tile.
    const relevantAlarms = timeseriesAlarms.data.filter(
      timeseriesAlarm =>
        tile.timeseries.indexOf(timeseriesAlarm.timeseries.uuid) !== -1
    );

    const referenceLines = relevantAlarms.map(alarm => {
      // A timeseriesAlarm can have multiple thresholds, make a reference line
      // for each.
      return alarm.thresholds.map(threshold => {
        let label = "";
        let active;
        let color;

        if (alarm.warning_threshold.value === threshold.value) {
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
          label = `${alarm.name} ${threshold}${active})`;
        }

        // Figure out which Y axis the value is on so Recharts knows where to plot it
        // The TimeseriesAlarm also have an ObservationType itself, it should be exactly
        // the same as that of the timeseries, but I think using the timeseries' observation
        // type is more robust as we used those to construct the Y axes.
        const observationType = this.observationType(alarm.timeseries.uuid);
        const axisIndex = this.indexForType(axes, observationType);

        return (
          <ReferenceLine
            key={`alarmreference-${alarm.uuid}-${threshold}`}
            y={threshold}
            yAxisId={axisIndex}
            stroke={color}
          >
            <Label value={label} position="insideBottomLeft" />
          </ReferenceLine>
        );
      });
    });

    // It is an array of arrays now, return flattened version
    return Array.prototype.concat([], referenceLines);
  }

  render() {
    const { tile } = this.props;

    if (!this.allTimeseriesHaveMetadata() || !this.allTimeseriesHaveEvents()) {
      return null;
    }

    const combinedEvents = combineEventSeries(
      tile.timeseries
        .map(uuid => {
          return {
            uuid: uuid,
            observation_type: this.props.timeseries[uuid].observation_type,
            events: this.state.eventsPerTimeseries[uuid].events
          };
        })
        .concat(
          (tile.rasterIntersections || []).map(intersection => {
            const raster = this.props.rasters.data[intersection.uuid];

            const events = this.state.eventsPerTimeseries[
              intersection.uuid
            ].events.map(event => {
              return {
                timestamp: event[0],
                sum: event[1],
                max: event[1]
              };
            });

            return {
              uuid: intersection.uuid,
              observation_type: raster.observation_type,
              events: events
            };
          })
        )
    );

    return this.props.isFull
      ? this.renderFull(combinedEvents)
      : this.renderTile(combinedEvents);
  }

  renderFull(combinedEvents) {
    const { width, height } = this.props;

    const axes = this.getAxesData();
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
      >
        {grid}
        {lines}
        {xaxis}
        {yaxes}
        {legend}
        <ReferenceLine
          x={new Date().getTime()}
          strokeWidth={2}
          stroke="#ccc"
          label={<ReferenceLabel fill={"#000"} value={"Now"} />}
        />
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

  renderTile(combinedEvents) {
    const { width, height } = this.props;

    const axes = this.getAxesData();
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
        >
          {lines}
          {yaxes}
          <ReferenceLine x={new Date().getTime()} stroke="black" />
          {this.alarmReferenceLines(axes)}
        </ComposedChart>
      </ResponsiveContainer>
    );
  }
}

function mapStateToProps(state) {
  return {
    measuringstations: state.assets.measuringstation || {},
    rasters: state.rasters,
    getRaster: makeGetter(state.rasters),
    timeseries: state.timeseries,
    timeseriesAlarms: state.alarms
  };
}

function mapDispatchToProps(dispatch) {
  return {
    addAsset: (assetType, id, instance) =>
      dispatch(addAsset(assetType, id, instance)),
    fetchRaster: uuid => fetchRaster(dispatch, uuid),
    addTimeseriesToState: (uuid, timeseries) =>
      dispatch(addTimeseries(uuid, timeseries))
  };
}

const TimeseriesChart = connect(mapStateToProps, mapDispatchToProps)(
  TimeseriesChartComponent
);

export default TimeseriesChart;
