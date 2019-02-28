import React, { Component } from "react";
import GridLayout from "./components/GridLayout";
import FullLayout from "./components/FullLayout";
import { connect } from "react-redux";
import { Route, withRouter } from "react-router-dom";
import { getConfiguredNow } from "./reducers";

import { fetchAlarms, setDateTimeAction } from "./actions";
import styles from "./App.css";

class App extends Component {
  componentWillMount() {
    this.setDateTimeActionWithNow();
    const that = this;
    // update redux time every minute (60000 miliseconds) because redux only saves time on the minute accurate
    setInterval(function() {
      that.setDateTimeActionWithNow();
    }, 60000);
  }

  componentDidMount() {
    if (!this.props.iframeModeActive) {
      this.props.fetchAlarms();
    }
  }

  setDateTimeActionWithNow() {
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

    this.props.setDateTimeAction(dateStr, timeStr);
  }

  componentDidUpdate(prevProps) {
    if (
      !prevProps.configuredNow ||
      this.props.configuredNow.getTime() != prevProps.configuredNow.getTime()
    ) {
      if (!this.props.iframeModeActive) {
        this.props.fetchAlarms();
      }
    }
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
    iframeModeActive: state.iframeMode.active,
    configuredNow: getConfiguredNow(state)
  };
}

function mapDispatchToProps(dispatch) {
  return {
    fetchAlarms: () => fetchAlarms(dispatch),
    setDateTimeAction: (date, time) => setDateTimeAction(dispatch)(date, time)
  };
}

export default withRouter(connect(mapStateToProps, mapDispatchToProps)(App));
