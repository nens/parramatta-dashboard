import React, { Component } from "react";
import Waypoint from "react-waypoint";
import styles from "./Tile.css";

class Tile extends Component {
  constructor(props) {
    super(props);
    this.state = {
      show: false
    };
  }
  render() {
    const { onClick, title, children, backgroundColor } = this.props;
    const { show } = this.state;

    return (
      <Waypoint
        onEnter={e => {
          if (e.currentPosition === "inside") {
            this.setState({
              show: true
            });
          }
        }}
      >
        <div
          style={{
            backgroundColor: backgroundColor ? backgroundColor : "#ffffff"
          }}
          className={styles.Tile}
          onClick={onClick}
        >
          <div className={styles.TileTitle}>
            <div className="drag-handle">{title}</div>
            <i className={`${styles.TileHandle} material-icons`}>more_vert</i>
          </div>
          {show ? children : null}
        </div>
      </Waypoint>
    );
  }
}

export default Tile;
