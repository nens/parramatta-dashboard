import React, { Component } from "react";
import MDSpinner from "react-md-spinner";
import { connect } from "react-redux";
import GridLayout from "./components/GridLayout";
import FullLayout from "./components/FullLayout";
import { Route, withRouter } from "react-router-dom";
import { fetchBootstrap } from "./actions";
import styles from "./App.css";

class App extends Component {
  componentDidMount() {
    this.props.bootstrap();
  }
  render() {
    if (!this.props.session.bootstrap) {
      return (
        <div className={styles.LoadingIndicator}>
          <MDSpinner size={24} />
        </div>
      );
    }
    return (
      <div className={styles.App}>
        <Route exact path="/" component={GridLayout} />
        <Route exact path="/full/:id" component={FullLayout} />
      </div>
    );
  }
}

const mapStateToProps = (state, ownProps) => {
  return {
    session: state.session
  };
};

const mapDispatchToProps = (dispatch, ownProps) => {
  return {
    bootstrap: () => dispatch(fetchBootstrap())
  };
};

export default withRouter(connect(mapStateToProps, mapDispatchToProps)(App));
