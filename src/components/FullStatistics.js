import React, { Component } from "react";
import styles from "./FullStatistics.css";

class FullStatistics extends Component {
  render() {
    const { tile, height } = this.props;
    return (
      <div className={styles.FullStatistics} style={{ height }}>
        <div className={styles.Number}>{tile.number}</div>
        <div className={styles.Title}>{tile.title}</div>
      </div>
    );
  }
}


export default FullStatistics;
