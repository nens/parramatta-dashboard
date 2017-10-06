import React, { Component } from "react";
import styles from "./StatisticsTile.css";

class StatisticsTile extends Component {
  render() {
    const { title, number } = this.props;
    return (
      <div
        className={styles.StatisticsTile}
      >
        <div><p>{number}</p><span>{title}</span></div>
      </div>
    );
  }
}

export default StatisticsTile;
