import React, { Component } from "react";
import styles from "./Tile.css";

class Tile extends Component {
  render() {
    // console.log("[F] Tile.render; this.props =", this.props);
    const { onClick, title, children, backgroundColor } = this.props;

    return (
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
        {children}
      </div>
    );
  }
}

export default Tile;
