import React, { Component } from "react";
import DocumentTitle from "react-document-title";
import FullMap from "./FullMap";
import FullStatistics from "./FullStatistics";
import FullTimeseries from "./FullTimeseries";
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
      case "raster":
        element = (
          <FullMap
            {...this.props}
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
          <FullStatistics tile={selectedTile} width={width} height={height} />
        );
        break;
      case "timeseries":
        element = (
          <FullTimeseries
            timeseries={selectedTile.timeseries}
            tile={selectedTile}
          />
        );
        break;
      default:
        element = null;
        break;
    }

    return (
      <DocumentTitle title={selectedTile.title}>
        <div className={styles.FullLayout}>
          {!isMobile ? (
            <div
              className={styles.SidebarWrapper}
              style={{ height: height - 70 }}
            >
              <Scrollbars height={height}>
                {allTiles.map((tile, i) => {
                  return (
                    <NavLink to={`/full/${tile.id}`} key={i}>
                      <div
                        className={`${styles.SidebarItem} ${selectedTile.id ===
                        tile.id
                          ? styles.Active
                          : null}`}
                      >
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
            <div
              className={styles.ViewInLizardButton}
              onClick={() => {
                console.log("View in Lizard");
                window.open("https://demo.lizard.net/favourites/7d1c6b5a-fb5e-4d0d-bb78-bfa1521a235f", "_blank");
              }}
            >
              View in Lizard
            </div>
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
      })
  };
};

const mapDispatchToProps = (dispatch, ownProps) => {
  return {};
};

export default withRouter(
  connect(mapStateToProps, mapDispatchToProps)(FullLayout)
);
