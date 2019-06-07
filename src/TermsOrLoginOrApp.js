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
import { fetchBootstrap, setIframeMode } from "./actions";
import getParameterByName from "./util/getQueryParams.js";

// import FullLayout from "./components/FullLayout";
// import { Route } from "react-router-dom";

class TermsOrLoginOrAppComponent extends Component {
  constructor() {
    super();
    this.state = {
      termsSigned: false
    };
  }

  componentDidMount() {
    const dashboardName = this.getDashboardName();
    this.props.fetchBootstrap(this.props.sessionState, dashboardName);
    this.props.setIframeMode(getParameterByName("iframe") === "true");
  }

  termsSigned() {
    this.setState({ termsSigned: true });
  }

  getDashboardName = () => {
    // gets dashboard name from url as defined in /admin/lizard_nxt/clientconfiguration/ "client slug" field
    // the url should be in format of /floodsmart/<dashboard_name>/

    // if no dashboard name is given this function should return undefined
    // this is required to create the basename of the JSX Router component (see in this file)

    //  if a dashboard name of undefined is returned then the default name 'parramatta-dashboard' will be used by function getBootstrap (in file actions.js).
    // when no dashboard is in the url at all this function should return undefined. this should only be the case on dev

    // if dashboardname = 'full' we assume it is not really the dashboardname but the url path to a full tile
    // this rule should ensures that the url /floodsmart/full/ returns  undefined

    // examples:
    // /floodsmart/my_name/ -> my_name
    // /floodsmart/my_name -> my_name
    // /floodsmart/my_name/?iframe=true -> my_name
    // /floodsmart/dashboard/ -> dashboard
    // /floodsmart/dashboard -> dashboard
    // /floodsmart/dashboard/?iframe=true -> dashboard
    // /floodsmart/full/1 -> undefined
    // /floodsmart/full/1/?iframe=true -> undefined
    // /floodsmart/ -> undefined
    // /floodsmart -> undefined
    // /floodsmart/?iframe=true -> undefined
    // / -> undefined

    // split on /floodsmart/
    // slashes are included in split so we do not also split on the second floodsmart in /floodsmart/floodsmart
    // const urlPreQueryParameters = window.location.href.split('?')[0];
    // const urlPostDashboard = urlPreQueryParameters.split("/floodsmart/")[1];
    const urlPostDashboard = window.location.href.split("/floodsmart/")[1];

    if (
      !urlPostDashboard || // if there was no /floodsmart/ in the url, should only happen in dev or with a url of /floodsmart (no tailing slash)
      urlPostDashboard[0] === "?" // or if the rest of the url starts with a question mark (?), this happens when the url has ?iframe=true as parameter
    ) {
      return undefined;
    }
    const dashboardName = urlPostDashboard.split("/")[0];
    // if dashboardname = 'full' we assume it is not really the dashboardname but the url path to a full tile
    // this rule should ensures that the url /dashboard/full/ returns  undefined
    if (dashboardName === "full") {
      return undefined;
    } else if (dashboardName === "") {
      // if dashboardname = '' then we assume that no dashboard name is given and we return undefined which will resolve to the default
      return undefined;
    } else {
      return dashboardName;
    }
  };

  hasBootstrap() {
    const session = this.props.sessionState;
    const result = !!(session && session.hasBootstrap && session.bootstrap);
    return result;
  }

  render() {
    const { iframeModeActive } = this.props;
    const dashboardName = this.getDashboardName();

    const basename = dashboardName
      ? "/floodsmart/" + dashboardName
      : "/floodsmart";

    if (!this.hasBootstrap() || iframeModeActive === null) {
      return (
        <div className={styles.LoadingIndicator}>
          <MDSpinner size={24} />
        </div>
      );
    } else if (iframeModeActive === false) {
      if (!this.props.sessionState.bootstrap.authenticated) {
        this.props.sessionState.bootstrap.doLogin();
      } else if (!this.state.termsSigned) {
        return (
          <TermsAndConditions
            termsSigned={this.termsSigned.bind(this)}
            clientConfiguration={
              this.props.sessionState.bootstrap.configuration
            }
          />
        );
      } else {
        return (
          <Router basename={basename}>
            <App />
          </Router>
        );
      }
    } else {
      return (
        <Router basename={basename}>
          <App />
        </Router>
      );
    }
  }
}

function mapStateToProps(state) {
  return {
    sessionState: state.session,
    iframeModeActive: state.iframeMode.active
  };
}

function mapDispatchToProps(dispatch) {
  return {
    fetchBootstrap: (sessionState, dashboardName) =>
      fetchBootstrap(dispatch, sessionState, dashboardName),
    setIframeMode: bool => setIframeMode(dispatch, bool)
  };
}

export default connect(
  mapStateToProps,
  mapDispatchToProps
)(TermsOrLoginOrAppComponent);
