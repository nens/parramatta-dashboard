import React, { Component } from "react";
import { connect } from "react-redux";
import moment from "moment";
import { addTimeseries } from "../actions";
import { getTimeseries } from "lizard-api-client";
import {
  Bar,
  CartesianGrid,
  ComposedChart,
  ReferenceLine,
  Legend,
  Line,
  Tooltip,
  XAxis,
  YAxis
} from "recharts";
import { scaleTime } from "d3-scale";
import { timeMinute as minute } from "d3-time";
import findIndex from "lodash/findIndex";

function combineEventSeries(series) {
  // Events has the form [{uuid: uuid1, events: [events1]}, ...]
  //
  // Return a sorted array of the form
  // [{timestamp: timestamp, uuid1: value1, uuid2: value}}]

  let events = {}; // {timestamp: {uuid1: value1}}

  series.forEach(serie => {
    // const isRatio = serie.timeseries.observation_type.scale === "ratio";
    const isRatio = false; // TODO: BUG: Had to force this because ^^ serie.timeseries is undefined
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

class TimeseriesChartComponent extends Component {
  constructor() {
    super();
    this.state = {
      start: null,
      end: null,
      eventsPerTimeseries: {}
    };
  }

  allTimeseriesHaveMetadata() {
    const result = this.props.tile.timeseries.every(uuid =>
      this.props.timeseries.hasOwnProperty(uuid)
    );
    return result;
  }

  allTimeseriesHaveEvents() {
    const result = this.props.tile.timeseries.every(
      uuid =>
        this.state.eventsPerTimeseries.hasOwnProperty(uuid) &&
        !this.state.eventsPerTimeseries[uuid].fetching
    );
    return result;
  }

  componentDidMount() {
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
    const scale = scaleTime()
      .domain(domain)
      .range([0, 1]);
    const ticks = scale.ticks(minute, 5);

    return ticks.map(entry => entry.getTime());
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
    }
  }

  getAllTimeseriesMetadata() {
    const result = this.props.tile.timeseries.forEach(uuid => {
      this.updateTimeseries(uuid, null, null);
    });
    return result;
  }

  tickFormatter(tick) {
    return moment(tick).format(" HH:mm");
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

  axisLabel(observationType) {
    return (
      (observationType.unit || "") + (observationType.reference_frame || "")
    );
  }

  observationType(uuid) {
    return this.props.timeseries[uuid].observation_type;
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

    this.props.tile.timeseries.forEach(uuid => {
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

  getYAxes(axes) {
    return axes.map((axis, idx) => {
      return (
        <YAxis
          key={idx}
          yAxisId={idx}
          orientation={["left", "right"][idx]}
          domain={[axis.scale === "ratio" ? 0 : "auto", "auto"]}
          label={this.axisLabel(axis)}
        />
      );
    });
  }

  getLinesAndBars(axes) {
    return this.props.tile.timeseries.map((uuid, idx) => {
      const observationType = this.observationType(uuid);
      const axisIndex = this.indexForType(axes, observationType);

      if (observationType.scale === "interval") {
        return (
          <Line
            key={uuid}
            yAxisId={axisIndex}
            connectNulls={true}
            name={observationType.getLegendString()}
            type="monotone"
            dataKey={uuid}
            stroke={["#00f", "#000058", "#99f"][idx % 3]}
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
            fill={["#00f", "#000058", "#99f"][idx % 3]}
          />
        );
      }
      return null;
    });
  }

  render() {
    const { tile, width, height } = this.props;
    if (!this.allTimeseriesHaveMetadata() || !this.allTimeseriesHaveEvents()) {
      return null;
    }
    const combinedEvents = combineEventSeries(
      tile.timeseries.map(uuid => {
        return {
          uuid: uuid,
          events: this.state.eventsPerTimeseries[uuid].events
        };
      })
    );
    const axes = this.getAxesData();
    const grid = <CartesianGrid strokeDasharray="3 3" />;
    const xaxis = (
      <XAxis
        dataKey="timestamp"
        type="number"
        domain={[this.state.start, this.state.end]}
        ticks={this.getTicks()}
        tickFormatter={this.tickFormatter}
      />
    );
    const legend = <Legend verticalAlign="bottom" height={36} />;
    const yaxes = this.getYAxes(axes);
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
          left: width < 700 ? 0 : 220,
          right: 2 * margin
        }}
      >
        {grid}
        {lines}
        {xaxis}
        {yaxes}
        {legend}
        <ReferenceLine x={new Date().getTime()} stroke="black" label="Now" />
        <Tooltip />
      </ComposedChart>
    );
  }
}

function mapStateToProps(state) {
  return {
    timeseries: state.timeseries
  };
}

function mapDispatchToProps(dispatch) {
  return {
    addTimeseriesToState: (uuid, timeseries) =>
      dispatch(addTimeseries(uuid, timeseries))
  };
}

const FullTimeseries = connect(mapStateToProps, mapDispatchToProps)(
  TimeseriesChartComponent
);

export default FullTimeseries;
