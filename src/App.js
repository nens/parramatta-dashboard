import React, { Component } from "react";
import GridLayout from "./components/GridLayout";
import FullLayout from "./components/FullLayout";
import { connect } from "react-redux";
import { Route, withRouter } from "react-router-dom";
import { getNow } from "./reducers";

import { fetchAlarms, setNowAction } from "./actions";
import styles from "./App.css";

class App extends Component {
  constructor(props) {
    super(props);
    // update redux time every x miliseconds -  redux only saves time on the minute accurate
    // see in client config: "refreshAutomatic"=bool "refreshEveryMiliseconds"=INT
    if (props.refreshAutomatic === true) {
      setInterval(
        this.props.setNowAction,
        props.refreshEveryMiliseconds || 300000
      );
    }
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
    if (prevProps.now !== this.props.now && !this.props.iframeModeActive) {
      this.props.fetchAlarms();
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
    now: getNow(state),
    refreshAutomatic: state.session.bootstrap.configuration.refreshAutomatic,
    refreshEveryMiliseconds:
      state.session.bootstrap.configuration.refreshEveryMiliseconds
  };
}

function mapDispatchToProps(dispatch) {
  return {
    fetchAlarms: () => fetchAlarms(dispatch),
    setNowAction: setNowAction(dispatch)
  };
}

export default withRouter(connect(mapStateToProps, mapDispatchToProps)(App));
