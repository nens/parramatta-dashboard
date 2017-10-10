import React, { Component } from "react";
import styles from "./Legend.css";

class Legend extends Component {
  render() {
    return (
      <div
        className={styles.Legend}
      >
        <div className={styles.LegendTitle}>Legenda</div>
      </div>
    );
  }
}

export default Legend;
