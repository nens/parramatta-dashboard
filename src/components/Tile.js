import React, { Component } from "react";
// import injectTapEventPlugin from "react-tap-event-plugin";
// import isDblTouchTap from "../util/isDblTouchTap";
import styles from "./Tile.css";

// injectTapEventPlugin();

class Tile extends Component {
  render() {
    const { onClick, title, children } = this.props;
    return (
      <div
        className={styles.Tile}
        onClick={onClick}
        // onTouchTap={e => {
        //   if (isDblTouchTap(e)) {
        //     handleDoubleClick();
        //   }
        // }}
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
