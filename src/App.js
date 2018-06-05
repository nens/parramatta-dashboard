import React, { Component } from "react";
import GridLayout from "./components/GridLayout";
import FullLayout from "./components/FullLayout";
import { connect } from "react-redux";
import { Route, withRouter } from "react-router-dom";

import { fetchAlarms } from "./actions";
import styles from "./App.css";

class App extends Component {
  componentDidMount() {
    if (!this.props.iframeModeActive) {
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
    iframeModeActive: state.iframeMode.active
  };
}

function mapDispatchToProps(dispatch) {
  return {
    fetchAlarms: () => fetchAlarms(dispatch)
  };
}

export default withRouter(connect(mapStateToProps, mapDispatchToProps)(App));
