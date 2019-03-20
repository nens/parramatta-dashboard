import React, { Component } from "react";
import DocumentTitle from "react-document-title";
import { connect } from "react-redux";
import Tile from "./Tile";
import Ink from "react-ink";
import { withRouter } from "react-router-dom";
import SettingsMenu from "./SettingsMenu";
import TimeseriesTile from "./TimeseriesTile";
import StatisticsTile from "./StatisticsTile";
import ExternalTile from "./ExternalTile";
import Map from "./Map";
import logoCombo from "../graphics/logo-combo.png";
import styles from "./GridLayout.css";
import { getAllTiles, getConfiguredDate, getConfiguredTime } from "../reducers";

import { MOBILE_BREAKPOINT } from "../config";

import debounce from "lodash/debounce";

class GridLayout extends Component {
  constructor(props) {
    super(props);
    this.state = {
      width: window.innerWidth,
      height: window.innerHeight,
      settingsMenu: false
    };
    this.handleUpdateDimensions = this.handleUpdateDimensions.bind(this);
    this.handleKeyPress = this.handleKeyPress.bind(this);
    this.closeSettingsMenu = this.closeSettingsMenu.bind(this);
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
      this.setState({
        settingsMenu: false
      });
    }
  }
  handleUpdateDimensions() {
    this.setState({
      width: window.innerWidth,
      height: window.innerHeight
    });
  }

  closeSettingsMenu() {
    this.setState({
      settingsMenu: false
    });
  }

  render() {
    const { width, settingsMenu } = this.state;
    const { tiles, history } = this.props;

    if (settingsMenu) {
      return (
        <SettingsMenu
          closeSettingsMenu={this.closeSettingsMenu}
          height={this.state.height}
        />
      );
    }

    const tileComponents = tiles.map(tile => {
      const shortTitle = tile.shortTitle || tile.title;

      switch (tile.type) {
        case "map":
          return (
            <Tile
              {...this.props}
              title={shortTitle}
              onClick={() => history.push(`/full/${tile.id}`)}
            >
              <Map isFull={false} bbox={tile.bbox} tile={tile} />
            </Tile>
          );
        case "timeseries":
          return (
            <Tile
              {...this.props}
              title={shortTitle}
              onClick={() => history.push(`/full/${tile.id}`)}
            >
              <TimeseriesTile
                isFull={false}
                timeseries={tile.timeseries}
                tile={tile}
                showAxis={true}
                marginLeft={0}
                marginTop={30}
              />
            </Tile>
          );
        case "statistics":
          return (
            <Tile
              {...this.props}
              title={shortTitle}
              onClick={() => history.push(`/full/${tile.id}`)}
            >
              <StatisticsTile
                alarms={this.props.alarms}
                title="Triggered alarms"
              />
            </Tile>
          );
        case "external":
          return (
            <Tile
              {...this.props}
              title={shortTitle}
              backgroundColor={"#cccccc"}
              onClick={() => history.push(`/full/${tile.id}`)}
            >
              <ExternalTile isFull={false} tile={tile} />
            </Tile>
          );
        default:
          return null;
      }
    });

    const TILE_WIDTH = window.innerWidth / 3 - 20;

    return (
      <DocumentTitle title="Parramatta | Dashboard">
        <div className={styles.GridLayout}>
          <div
            style={{
              position: "absolute",
              width: "100%",
              textAlign: "center",
              height: 60,
              padding: "20px 0 0 0"
            }}
          >
            <span className={styles.HeaderTitle}>
              FloodSmart Parramatta Dashboard
            </span>
          </div>
          <img
            src={logoCombo}
            style={{ height: 54 }}
            alt="Logos for relevant organisations"
            className={styles.LogoCombo}
          />

          {width > MOBILE_BREAKPOINT ? (
            <div
              className={styles.SettingsButton}
              onClick={() =>
                this.setState({
                  settingsMenu: true
                })}
            >
              <span>
                <i className="material-icons">settings</i>&nbsp;&nbsp;Settings
              </span>
              <Ink />
            </div>
          ) : null}

          <div
            className={styles.LogoutButton}
            onClick={() => this.props.session.bootstrap.doLogout()}
          >
            {width > MOBILE_BREAKPOINT ? (
              <span>
                <i className="material-icons">lock</i>&nbsp;&nbsp;Log out
              </span>
            ) : (
              <i className="material-icons">lock</i>
            )}
            <Ink />
          </div>
          <div>
            {width > MOBILE_BREAKPOINT
              ? tileComponents.map((tc, i) => {
                  return (
                    <div
                      style={{
                        width: TILE_WIDTH,
                        height: 300,
                        margin: 5,
                        float: "left"
                      }}
                      key={i}
                    >
                      {tc}
                    </div>
                  );
                })
              : tileComponents.map((tc, i) => {
                  return (
                    <div
                      style={{
                        width: "calc(100% - 15px)",
                        height: 300,
                        margin: 5
                      }}
                      key={i}
                    >
                      {tc}
                    </div>
                  );
                })}
          </div>
          <footer className={styles.Footer}>Nelen &amp; Schuurmans</footer>
        </div>
      </DocumentTitle>
    );
  }
}

const mapStateToProps = (state, ownProps) => {
  return {
    session: state.session,
    tiles: getAllTiles(state),
    alarms: state.alarms
  };
};

export default withRouter(connect(mapStateToProps)(GridLayout));
