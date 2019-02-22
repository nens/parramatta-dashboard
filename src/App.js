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

    setInterval(function() {
      console.log("increment timer _____ ", new Date());

      const jsDateObject = new Date();
      const dateStr =
        jsDateObject.getUTCFullYear() +
        "-" +
        (jsDateObject.getUTCMonth() + 1) +
        "-" +
        jsDateObject.getUTCDate();
      const timeStr =
        jsDateObject.getUTCHours() + ":" + jsDateObject.getUTCMinutes();

      console.log("setInterval 5", dateStr, timeStr);

      props.setDateTimeAction(dateStr, timeStr);

      // store.dispatch({
      //   type : 'INCREMENT_TIMER'
      // })
    }, 15000);
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
