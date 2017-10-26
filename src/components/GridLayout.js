import React, { Component } from "react";
import DocumentTitle from "react-document-title";
import { connect } from "react-redux";
import ReactGridLayout from "react-grid-layout";
import Tile from "./Tile";
import Ink from "react-ink";
import { withRouter } from "react-router-dom";
import TimeseriesChart from "./TimeseriesChart";
import StatisticsTile from "./StatisticsTile";
import ExternalTile from "./ExternalTile";
import Map from "./Map";
import headerImage from "../graphics/parramatta-header-logo.svg";
import styles from "./GridLayout.css";

const layoutFromLocalStorage = JSON.parse(
  localStorage.getItem("parramatta-layout")
);

class GridLayout extends Component {
  constructor(props) {
    super(props);
    this.state = {
      canMove: false,
      layout: layoutFromLocalStorage || null,
      width: window.innerWidth,
      height: window.innerHeight
    };
    this.handleUpdateDimensions = this.handleUpdateDimensions.bind(this);
  }
  componentWillMount() {
    if (!this.state.layout && !layoutFromLocalStorage) {
      this.setState({
        mobileLayout: this.props.tiles.map((tile, i) => {
          const y = 8;
          return {
            i: `${i}`,
            x: 0,
            y: i * 8,
            w: 12,
            h: y,
            minW: 2,
            maxW: 12
          };
        }),
        layout: this.props.tiles.map((tile, i) => {
          const w = 4;
          const y = 8;
          return {
            i: `${i}`,
            x: (i * 4) % 12,
            y: Math.floor(i / 6) * y,
            w: w,
            h: y,
            minW: 2,
            maxW: 4
          };
        })
      });
    } else {
      this.setState({
        layout: layoutFromLocalStorage
      });
    }
  }
  componentDidMount() {
    window.addEventListener("resize", this.handleUpdateDimensions, false);
  }
  componentWillUnMount() {
    window.removeEventListener("resize", this.handleUpdateDimensions, false);
  }
  handleUpdateDimensions() {
    this.setState({
      width: window.innerWidth,
      height: window.innerHeight
    });
  }
  render() {
    const { width, canMove } = this.state;
    const { tiles, history } = this.props;
    const tileComponents = tiles.map(tile => {
      switch (tile.type) {
        case "raster":
          return (
            <Tile
              {...this.props}
              title={tile.title}
              onClick={() => history.push(`/full/${tile.id}`)}
            >
              <Map isFull={false} bbox={tile.bbox} tile={tile} />
            </Tile>
          );
        case "assets":
          return (
            <Tile
              {...this.props}
              title={tile.title}
              onClick={() => history.push(`/full/${tile.id}`)}
            >
              <Map isFull={false} bbox={tile.bbox} tile={tile} />
            </Tile>
          );
        case "timeseries":
          return (
            <Tile
              {...this.props}
              title={tile.title}
              onClick={() => history.push(`/full/${tile.id}`)}
            >
              <TimeseriesChart
                isFull={false}
                width={300}
                height={300}
                timeseries={tile.timeseries}
                tile={tile}
              />
            </Tile>
          );
        case "statistics":
          return (
            <Tile
              {...this.props}
              title={tile.title}
              onClick={() => history.push(`/full/${tile.id}`)}
            >
              <StatisticsTile alarms={this.props.alarms} title={tile.title} />
            </Tile>
          );
        case "external":
          return (
            <Tile
              {...this.props}
              title={tile.title}
              backgroundColor={"#cccccc"}
              onClick={() => history.push(`/full/${tile.id}`)}
            >
              <ExternalTile
                isFull={false}
                tile={tile}
                width={300}
                height={300}
              />
            </Tile>
          );
        default:
          return null;
      }
    });

    return (
      <DocumentTitle title="Parramatta | Dashboard">
        <div className={styles.GridLayout}>
          <img
            src={headerImage}
            alt="Parramatta dashboard"
            className={styles.HeaderImage}
          />
          <div
            className={styles.LogoutButton}
            onClick={() => this.props.session.bootstrap.doLogout()}
          >
            {width > 700 ? (
              <span>
                <i className="material-icons">lock</i>&nbsp;&nbsp;Log out
              </span>
            ) : (
              <i className="material-icons">lock</i>
            )}
            <Ink />
          </div>
          <ReactGridLayout
            isDraggable={canMove}
            isResizable={canMove}
            className="layout"
            layout={width < 700 ? this.state.mobileLayout : this.state.layout}
            cols={12}
            rowHeight={30}
            width={width}
            draggableHandle=".drag-handle"
            onLayoutChange={layout => {
              // localStorage.setItem("parramatta-layout", JSON.stringify(layout));
            }}
          >
            {tileComponents.map((component, i) => {
              return <div key={i}>{component}</div>;
            })}
          </ReactGridLayout>
          <footer className={styles.Footer}>Nelen &amp; Schuurmans</footer>
        </div>
      </DocumentTitle>
    );
  }
}

const mapStateToProps = (state, ownProps) => {
  return {
    session: state.session,
    tiles: state.tiles,
    alarms: state.alarms
  };
};

const mapDispatchToProps = (dispatch, ownProps) => {
  return {};
};

export default withRouter(
  connect(mapStateToProps, mapDispatchToProps)(GridLayout)
);
