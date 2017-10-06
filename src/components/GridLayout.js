import React, { Component } from "react";
import { connect } from "react-redux";
import ReactGridLayout from "react-grid-layout";
import Tile from "./Tile";
import Ink from "react-ink";
import { withRouter } from "react-router-dom";
import TimeseriesTile from "./TimeseriesTile";
import StatisticsTile from "./StatisticsTile";
import MapTile from "./MapTile";
import headerImage from "../graphics/parramatta-header-logo.svg";
import styles from "./GridLayout.css";

const layoutFromLocalStorage = JSON.parse(
  localStorage.getItem("parramatta-layout")
);
let x1 = 0,
  y1 = 0,
  z1 = 0,
  x2 = 0,
  y2 = 0,
  z2 = 0;
let sensitivity = 20;


class GridLayout extends Component {
  constructor(props) {
    super(props);
    this.state = {
      layout: layoutFromLocalStorage || null
    };
  }
  componentWillMount() {
    if (!this.state.layout && !layoutFromLocalStorage) {
      this.setState({
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
    if (typeof window.DeviceMotionEvent !== "undefined") {
      window.addEventListener("devicemotion", this.handleShake, false);
      setInterval(() => {
        var change = Math.abs(x1 - x2 + y1 - y2 + z1 - z2);
        if (change > sensitivity) {
          localStorage.removeItem("parramatta-layout");
          window.location.reload();
        }
        x2 = x1;
        y2 = y1;
        z2 = z1;
      }, 150);
    }
  }
  componentWillUnMount() {
    if (typeof window.DeviceMotionEvent !== "undefined") {
      window.removeEventListener("devicemotion", this.handShake, false);
    }
  }
  handleShake(e) {
    x1 = e.accelerationIncludingGravity.x;
    y1 = e.accelerationIncludingGravity.y;
    z1 = e.accelerationIncludingGravity.z;
  }
  render() {
    const { tiles, history } = this.props;
    const tileComponents = tiles.map(tile => {
      switch (tile.type) {
        case "raster":
          return (
            <Tile
              {...this.props}
              title={tile.title}
              handleDoubleClick={() => history.push(`/full/${tile.id}`)}
            >
              <MapTile isInteractive={true} bbox={tile.bbox} tile={tile} />
            </Tile>
          );
        case "assets":
          return (
            <Tile
              {...this.props}
              title={tile.title}
              handleDoubleClick={() => history.push(`/full/${tile.id}`)}
            >
              <MapTile isInteractive={true} bbox={tile.bbox} tile={tile} />
            </Tile>
          );
        case "timeseries":
          return (
            <Tile
              {...this.props}
              title={tile.title}
              handleDoubleClick={() => history.push(`/full/${tile.id}`)}
            >
              <TimeseriesTile
                width="300"
                height="300"
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
              handleDoubleClick={() => history.push(`/full/${tile.id}`)}
            >
              <StatisticsTile number={tile.number} title={tile.title} />
            </Tile>
          );
        default:
          return null;
      }
    });

    return (
      <div className={styles.GridLayout}>
        <img
          src={headerImage}
          alt="Parramatta dashboard"
          className={styles.HeaderImage}
        />
        <div
          className={styles.LogoutButton}
          onClick={() => {
            localStorage.removeItem("parramatta-layout");
            console.log("Log out");
          }}
        >
          <i className="material-icons">lock</i>&nbsp;&nbsp;Log out
          <Ink />
        </div>
        <ReactGridLayout
          className="layout"
          layout={this.state.layout}
          cols={12}
          rowHeight={30}
          width={1200}
          draggableHandle=".drag-handle"
          onLayoutChange={layout => {
            localStorage.setItem("parramatta-layout", JSON.stringify(layout));
          }}
        >
          {tileComponents.map((component, i) => {
            return <div key={i}>{component}</div>;
          })}
        </ReactGridLayout>
        <footer className={styles.Footer}>Nelen &amp; Schuurmans</footer>
      </div>
    );
  }
}

const mapStateToProps = (state, ownProps) => {
  return {
    session: state.session,
    tiles: state.tiles
  };
};

const mapDispatchToProps = (dispatch, ownProps) => {
  return {};
};

export default withRouter(
  connect(mapStateToProps, mapDispatchToProps)(GridLayout)
);
