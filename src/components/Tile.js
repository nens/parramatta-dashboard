import React, { Component } from "react";
import styles from "./Tile.css";

class Tile extends Component {
  render() {
    const { onClick, title, children } = this.props;
    return (
      <div
        className={styles.Tile}
        onClick={onClick}
      >
        <div className={styles.TileTitle}>
          <div className="drag-handle">{title}</div>
          <i className={`${styles.TileHandle} material-icons`}>more_vert</i>
        </div>
        {children}
      </div>
    );
  }
}

export default Tile;
