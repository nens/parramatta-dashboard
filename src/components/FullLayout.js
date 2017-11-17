import React, { Component } from "react";
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
      case "assets":
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
      case "raster":
        element = (
          <Map
            {...this.props}
            isFull={true}
            width={width}
            height={height}
            tile={selectedTile}
            isInteractive={true}
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
            width={width}
            height={height}
            timeseries={selectedTile.timeseries}
            tile={selectedTile}
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
                    case "raster":
                      previewTile = (
                        <Map isFull={false} bbox={tile.bbox} tile={tile} />
                      );
                      break;
                    case "assets":
                      previewTile = (
                        <Map isFull={false} bbox={tile.bbox} tile={tile} />
                      );
                      break;
                    case "timeseries":
                      previewTile = (
                        <TimeseriesTile
                          isFull={false}
                          width={300}
                          height={300}
                          timeseries={tile.timeseries}
                          tile={tile}
                        />
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
                        <ExternalTile
                          isFull={false}
                          tile={tile}
                          width={300}
                          height={300}
                        />
                      );
                      break;
                    default:
                      previewTile = null;
                      break;
                  }
                  return (
                    <NavLink to={`/full/${tile.id}`} key={i}>
                      <div
                        className={styles.SidebarItemWrapper}
                        title={tile.title}
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
                          {tile.title}
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
    allTiles: state.tiles,
    getTileById: id =>
      state.tiles.filter(tile => {
        if (Number(tile.id) === Number(id)) return tile;
        return false;
      }),
    alarms: state.alarms
  };
};

const mapDispatchToProps = (dispatch, ownProps) => {
  return {};
};

export default withRouter(
  connect(mapStateToProps, mapDispatchToProps)(FullLayout)
);
