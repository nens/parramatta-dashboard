import React, { Component } from "react";
import mapIcon from "../graphics/icon-map.svg";
import timeIcon from "../graphics/icon-chart.svg";
import radarIcon from "../graphics/icon-radar.svg";
import DocumentTitle from "react-document-title";
import StatisticsTile from "./StatisticsTile";
import Map from "./Map";
import FullStatistics from "./FullStatistics";
import ExternalTile from "./ExternalTile";
import TimeseriesTile from "./TimeseriesTile";
import { Scrollbars } from "react-custom-scrollbars";
import { connect } from "react-redux";
import { NavLink, withRouter } from "react-router-dom";
import styles from "./FullLayout.css";
import { getAllTiles, getTileById } from "../reducers";

class FullLayout extends Component {
  constructor(props) {
    super(props);
    this.state = {
      width: window.innerWidth,
      height: window.innerHeight
    };
    this.handleUpdateDimensions = this.handleUpdateDimensions.bind(this);
  }
  componentDidMount() {
    window.addEventListener("resize", this.handleUpdateDimensions, false);
  }
  componentWillUnmount() {
    window.removeEventListener("resize", this.handleUpdateDimensions, false);
  }
  handleUpdateDimensions() {
    this.setState({
      width: window.innerWidth,
      height: window.innerHeight
    });
  }
  render() {
    const { id } = this.props.match.params;
    const { getTileById, allTiles } = this.props;
    const { height, width } = this.state;
    const tilesById = getTileById(id);
    const selectedTile = tilesById[0];
    const isMobile = width < 700 ? true : false;
    if (tilesById.length === 0) {
      return <div />;
    }

    let element = null;
    switch (selectedTile.type) {
      case "map":
        element = (
          <Map
            {...this.props}
            isFull={true}
            width={width}
            height={height}
            tile={selectedTile}
            bbox={selectedTile.bbox}
          />
        );
        break;
      case "statistics":
        element = (
          <FullStatistics
            tile={selectedTile}
            width={width}
            height={height}
            isMobile={isMobile}
          />
        );
        break;
      case "timeseries":
        element = (
          <TimeseriesTile
            isFull={true}
            timeseries={selectedTile.timeseries}
            tile={selectedTile}
            showAxis={true}
            marginLeft={isMobile ? 0 : 195}
            marginTop={50}
          />
        );
        break;
      case "external":
        element = (
          <ExternalTile
            tile={selectedTile}
            isFull={true}
            width={width}
            height={height}
            showingBar={!isMobile}
          />
        );
        break;
      default:
        element = null;
        break;
    }

    return (
      <DocumentTitle title={`Parramatta | ${selectedTile.title}`}>
        <div className={styles.FullLayout}>
          {!isMobile ? (
            <div
              className={styles.SidebarWrapper}
              style={{ height: height - 70 }}
            >
              <Scrollbars height={height}>
                {allTiles.map((tile, i) => {
                  let previewTile = null;
                  switch (tile.type) {
                    case "map":
                      previewTile = (
                        <div
                          style={{ display: "flex", justifyContent: "center" }}
                        >
                          <img style={{ width: 75 }} src={mapIcon} alt="Map" />
                        </div>
                      );
                      break;
                    case "timeseries":
                      previewTile = (
                        <div
                          style={{ display: "flex", justifyContent: "center" }}
                        >
                          <img style={{ width: 75 }} src={timeIcon} alt="Map" />
                        </div>
                      );
                      break;
                    case "statistics":
                      previewTile = (
                        <StatisticsTile
                          alarms={this.props.alarms}
                          title={tile.title}
                        />
                      );
                      break;
                    case "external":
                      previewTile = (
                        <div
                          style={{ display: "flex", justifyContent: "center" }}
                        >
                          <img style={{ width: 75 }} src={radarIcon} alt="Map" />
                        </div>
                      );
                      break;
                    default:
                      previewTile = null;
                      break;
                  }

                  const shortTitle = tile.shortTitle || tile.title;

                  return (
                    <NavLink to={`/full/${tile.id}`} key={i}>
                      <div
                        className={styles.SidebarItemWrapper}
                        title={shortTitle}
                      >
                        <div
                          className={`${styles.SidebarItem} ${selectedTile.id ===
                          tile.id
                            ? styles.Active
                            : null}`}
                        >
                          {previewTile}
                        </div>
                        <div className={styles.SidebarItemLabel}>
                          {shortTitle}
                        </div>
                      </div>
                    </NavLink>
                  );
                })}
              </Scrollbars>
            </div>
          ) : null}
          <div className={styles.TitleBar}>
            <NavLink to="/">
              <div className={styles.BackButton}>
                <i className="material-icons">arrow_back</i>
              </div>
            </NavLink>
            <div className={styles.Title}>{selectedTile.title}</div>
            {selectedTile.viewInLizardLink ? (
              <div className={styles.ViewInLizardButton}>
                <a href={selectedTile.viewInLizardLink} target="_blank">
                  View in Lizard
                </a>
              </div>
            ) : (
              ""
            )}
          </div>
          {element}
        </div>
      </DocumentTitle>
    );
  }
}

const mapStateToProps = (state, ownProps) => {
  return {
    allTiles: getAllTiles(state),
    getTileById: id => getTileById(state, id),
    alarms: state.alarms
  };
};

const mapDispatchToProps = (dispatch, ownProps) => {
  return {};
};

export default withRouter(
  connect(mapStateToProps, mapDispatchToProps)(FullLayout)
);
