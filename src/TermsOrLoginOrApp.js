// First a user has to check a checkbox on the Terms & Conditions screen,
// then he logs in if necessary, then the actual app is shown. This component
// models that workflow.

import MDSpinner from "react-md-spinner";
import React, { Component } from "react";
import { BrowserRouter as Router } from "react-router-dom";
import { connect } from "react-redux";

import App from "./App";
import styles from "./App.css";
import { TermsAndConditions } from "./components/TermsAndConditions";
import { fetchBootstrap } from "./actions";

class TermsOrLoginOrAppComponent extends Component {
  constructor() {
    super();
    this.state = {
      termsSigned: false
    };
  }

  componentDidMount() {
    this.props.fetchBootstrap(this.props.sessionState);
  }

  termsSigned() {
    this.setState({ termsSigned: true });
  }

  hasBootstrap() {
    const session = this.props.sessionState;
    const result = !!(session && session.hasBootstrap && session.bootstrap);
    return result;
  }

  render() {
    if (!this.hasBootstrap()) {
      return (
        <div className={styles.LoadingIndicator}>
          <MDSpinner size={24} />
        </div>
      );
    } else if (!this.props.sessionState.bootstrap.authenticated) {
      this.props.sessionState.bootstrap.doLogin();
    } else if (!this.state.termsSigned) {
      return <TermsAndConditions termsSigned={this.termsSigned.bind(this)} />;
    } else {
      return (
        <Router basename="/floodsmart">
          <App />
        </Router>
      );
    }
  }
}

function mapStateToProps(state) {
  return {
    sessionState: state.session
  };
}

function mapDispatchToProps(dispatch) {
  return {
    fetchBootstrap: sessionState => fetchBootstrap(dispatch, sessionState)
  };
}

export default connect(mapStateToProps, mapDispatchToProps)(
  TermsOrLoginOrAppComponent
);
