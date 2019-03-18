import React, { Component } from "react";
import DocumentTitle from "react-document-title";
import { connect } from "react-redux";
import Ink from "react-ink";
import { withRouter } from "react-router-dom";
import logoCombo from "../graphics/logo-combo.png";
import styles from "./SettingsMenu.css";
import { getAllTiles, getConfiguredDate, getConfiguredTime } from "../reducers";
import {
  setDateAction,
  setTimeAction,
  resetDateTimeAction,
  setMapBackgroundAction
} from "../actions";
import { getCurrentMapBackground } from "../reducers";
import { MAP_BACKGROUNDS, MOBILE_BREAKPOINT } from "../config";

import debounce from "lodash/debounce";

class SettingsMenu extends Component {
  constructor(props) {
    super(props);
    this.state = {
      width: window.innerWidth,
      height: window.innerHeight,
      settingsMenuId: 0
    };
    this.handleUpdateDimensions = this.handleUpdateDimensions.bind(this);
    this.handleKeyPress = this.handleKeyPress.bind(this);
  }
  componentDidMount() {
    window.addEventListener(
      "resize",
      debounce(this.handleUpdateDimensions),
      false
    );
    document.addEventListener("keydown", debounce(this.handleKeyPress), false);
  }
  componentWillUnMount() {
    window.removeEventListener("resize", this.handleUpdateDimensions, false);
    document.removeEventListener("keydown", this.handleKeyPress, false);
  }
  handleKeyPress(e) {
    if (e.key === "Escape" || e.keyCode === 27) {
      this.props.closeSettingsMenu();
    }
  }
  handleUpdateDimensions() {
    this.setState({
      width: window.innerWidth,
      height: window.innerHeight
    });
  }

  toggleMapBackground() {
    const current = this.props.currentMapBackground;

    if (current.url === MAP_BACKGROUNDS[1].url) {
      this.props.setMapBackground(MAP_BACKGROUNDS[0]);
    } else {
      this.props.setMapBackground(MAP_BACKGROUNDS[1]);
    }
  }

  render() {
    const { width, height, settingsMenuId } = this.state;
    const { tiles, history } = this.props;

    const nensMail = () => unescape("servicedesk%40nelen%2Dschuurmans%2Enl");
    const chrisTel = () => unescape("%30%34%30%35%20%30%35%32%20%34%36%32");
    const chrisMail = () =>
      unescape("cgooch%40cityofparramatta%2Ensw%2Egov%2Eau");

    return (
      <DocumentTitle title="Parramatta | Dashboard | Settings">
        <div className={styles.SettingsMenu} style={{ height: height }}>
          <img
            src={logoCombo}
            alt="Parramatta dashboard"
            className={styles.HeaderImage}
          />
          <div
            className={styles.CloseSettings}
            onClick={() => this.props.closeSettingsMenu()}
          >
            <i className="material-icons">close</i>
          </div>
          <div className={styles.SettingsMenuItemsWrapper}>
            <div
              className={styles.SettingsMenuItem}
              onClick={() =>
                this.setState({
                  settingsMenuId: 0
                })}
            >
              <i className="material-icons">access_time</i>
              <span
                className={`${settingsMenuId === 0 ? styles.ActiveMenu : null}`}
              >
                Date/Time settings
              </span>
            </div>

            <div
              className={styles.SettingsMenuItem}
              onClick={() =>
                this.setState({
                  settingsMenuId: 1
                })}
            >
              <i className="material-icons">layers</i>
              <span
                className={`${settingsMenuId === 1 ? styles.ActiveMenu : null}`}
              >
                Background layers
              </span>
            </div>

            <div
              className={styles.SettingsMenuItem}
              onClick={() =>
                this.setState({
                  settingsMenuId: 2
                })}
            >
              <i className="material-icons">copyright</i>
              <span
                className={`${settingsMenuId === 2 ? styles.ActiveMenu : null}`}
              >
                Contact
              </span>
            </div>
          </div>

          <main style={{ height: height - 100 }}>
            {settingsMenuId === 0 ? (
              <div style={{ padding: 20 }}>
                <h4 style={{ padding: 0, margin: 0 }}>
                  Date/time settings &nbsp;
                  <button onClick={this.props.resetDateTime}>Reset</button>
                </h4>
                <hr />
                <div className={styles.DateTimePicker}>
                  <div>
                    <h5>Date (e.g. "23/12/2018")</h5>
                    <input
                      type="date"
                      name="date"
                      value={this.props.date}
                      onChange={event => {
                        this.props.changeDate(event.target.value);
                      }}
                    />
                  </div>
                  <div>
                    <h5>Time (e.g. "09:15 AM")</h5>
                    <input
                      type="time"
                      name="time"
                      value={this.props.time}
                      onChange={event => {
                        this.props.changeTime(event.target.value);
                      }}
                    />
                  </div>
                </div>
                <br />
                <button
                  className={styles.OKButton}
                  onClick={() => {
                    this.props.closeSettingsMenu();
                  }}
                >
                  OK
                </button>
              </div>
            ) : null}
            {settingsMenuId === 1 ? (
              <div style={{ padding: 20 }}>
                <h4 style={{ padding: 0, margin: 0 }}>Map settings</h4>
                <hr />
                <div className={styles.MapSettings}>
                  <p>
                    There are {MAP_BACKGROUNDS
                      ? MAP_BACKGROUNDS.length
                      : 0}{" "}
                    available map background(s):
                    {MAP_BACKGROUNDS[0].description} and{" "}
                    {MAP_BACKGROUNDS[1].description}.
                  </p>
                  <p>
                    Currently selected:&nbsp;
                    <strong>
                      {this.props.currentMapBackground.description}
                    </strong>.
                  </p>
                  <button onClick={this.toggleMapBackground.bind(this)}>
                    Switch
                  </button>
                </div>
                <br />
                <button
                  className={styles.OKButton}
                  onClick={() => this.props.closeSettingsMenu()}
                >
                  OK
                </button>
              </div>
            ) : null}

            {settingsMenuId === 2 ? (
              <div style={{ padding: 20 }}>
                <h4 style={{ padding: 0, margin: 0 }}>Contact info</h4>
                <hr />
                <p>
                  For software issues with the FloodSmart Parramatta System
                  please contact Nelen & Schuurmans on {nensMail()}. For any
                  other issues, or suggestions for improvements to the
                  Parramatta Floodsmart System system, please contact Chris
                  Gooch on tel.&nbsp;
                  {chrisTel()} or email {chrisMail()}
                </p>
              </div>
            ) : null}
          </main>
        </div>
      </DocumentTitle>
    );
  }
}

const mapStateToProps = (state, ownProps) => {
  return {
    session: state.session,
    tiles: getAllTiles(state),
    alarms: state.alarms,
    date: getConfiguredDate(state),
    time: getConfiguredTime(state),
    currentMapBackground: getCurrentMapBackground(state)
  };
};

const mapDispatchToProps = (dispatch, ownProps) => {
  return {
    changeDate: setDateAction(dispatch),
    changeTime: setTimeAction(dispatch),
    resetDateTime: resetDateTimeAction(dispatch),
    setMapBackground: setMapBackgroundAction(dispatch)
  };
};

export default withRouter(
  connect(mapStateToProps, mapDispatchToProps)(SettingsMenu)
);
