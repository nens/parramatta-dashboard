import React, { Component } from "react";

import plotComponentFactory from "react-plotly.js/factory";

class PlotlyWrapper extends Component {
  // constructor(props) {
  //   super(props);
  //   this.state = {
  //     show: false
  //   };
  // }

  shouldComponentUpdate(nextProps) {
    const props = this.props;
    return this.didDataPropsChange(props.data, nextProps.data);
  }

  didDataPropsChange(plotlyData, nextPlotlyData) {
    if (plotlyData.length !== nextPlotlyData.length) {
      return true;
    }

    for (let i = 0; i < plotlyData.length; i++) {
      // Assume that if data changes, that the length of the array changes
      // or x or y value of the first data item.
      const events = plotlyData[i].events;
      const nextEvents = nextPlotlyData[i].events;

      if (!events || !nextEvents) {
        // Update if their boolean value changed
        if (!!events !== !!nextEvents) {
          return true;
        }
      }

      if (events && nextEvents) {
        // x is an array of Data objects
        const x = events.x;
        const nextX = nextEvents.x;

        if (x.length !== nextX.length) {
          return true;
        }

        if (x.length > 0 && x[0].getTime() !== nextX[0].getTime()) {
          return true;
        }

        // y is an array of numbers, as strings with a fixed number of decimals
        const y = events.y;
        const nextY = nextEvents.y;
        if (y.length !== nextY.length) {
          return true;
        }
        if (y.length > 0 && y[0] !== nextY[0]) {
          return true;
        }
      }
    }
    return false;
  }
  //

  render() {
    const Plot = plotComponentFactory(window.Plotly);

    return (
      <Plot
        className={this.props.classNameProp}
        data={this.props.data}
        layout={this.props.layout}
        config={this.props.config}
      />
    );
  }
}

export default PlotlyWrapper;
