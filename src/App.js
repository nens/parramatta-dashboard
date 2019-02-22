import React, { Component } from "react";
import GridLayout from "./components/GridLayout";
import FullLayout from "./components/FullLayout";
import { connect } from "react-redux";
import { Route, withRouter } from "react-router-dom";

import { fetchAlarms, setDateTimeAction } from "./actions";
import styles from "./App.css";

class App extends Component {
  componentDidMount() {
    if (!this.props.iframeModeActive) {
      this.props.fetchAlarms();
    }

    const props = this.props;

    // update redux time every minute (60000 miliseconds) because redux only saves time on the minute accurate
    setInterval(function() {
      const jsDateObject = new Date();
      const utcMinutes = jsDateObject.getUTCMinutes();
      const utcMinutesZeroPrefixed =
        utcMinutes < 10 ? "0" + utcMinutes : utcMinutes;

      const dateStr =
        jsDateObject.getUTCFullYear() +
        "-" +
        (jsDateObject.getUTCMonth() + 1) +
        "-" +
        jsDateObject.getUTCDate();
      const timeStr = jsDateObject.getUTCHours() + ":" + utcMinutesZeroPrefixed;

      props.setDateTimeAction(dateStr, timeStr);
    }, 60000);
  }

  render() {
    return (
      <div className={styles.App}>
        <Route exact path="/" component={GridLayout} />
        <Route exact path="/full/:id" component={FullLayout} />
      </div>
    );
  }
}

function mapStateToProps(state) {
  return {
    iframeModeActive: state.iframeMode.active
  };
}

function mapDispatchToProps(dispatch) {
  return {
    fetchAlarms: () => fetchAlarms(dispatch),
    setDateTimeAction: (date, time) => setDateTimeAction(dispatch)(date, time)
  };
}

export default withRouter(connect(mapStateToProps, mapDispatchToProps)(App));
