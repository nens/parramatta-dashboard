import React, { Component } from "react";

import plotComponentFactory from "react-plotly.js/factory";

class PlotlyWrapper extends Component {
  shouldComponentUpdate(nextProps) {
    const props = this.props;
    return (
      props.tileId !== nextProps.tileId ||
      this.didDataPropsChange(props.data, nextProps.data)
    );
  }

  didDataPropsChange(plotlyData, nextPlotlyData) {
    if (plotlyData.length !== nextPlotlyData.length) {
      return true;
    }

    for (let i = 0; i < plotlyData.length; i++) {
      // Assume that if data changes, that the length of the array changes
      // or x or y value of the first data item.
      const events = plotlyData[i];
      const nextEvents = nextPlotlyData[i];

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

        // Now compare last values from data as well
        // Probably overkill to check last data because:
        // -during startup data will change from empty to full
        // -during tile change tile id will change
        // - during update first time value will change
        // thus for now comment out
        // if (
        //   x.length > 0 &&
        //   x[x.length - 1].getTime() !== nextX[nextX.length - 1].getTime()
        // ) {
        //   return true;
        // }
        // if (y.length > 0 && y[y.length - 1] !== nextY[nextY.length - 1]) {
        //   return true;
        // }
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
