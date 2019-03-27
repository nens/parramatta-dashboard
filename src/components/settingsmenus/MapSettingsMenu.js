import React, { Component } from "react";
import { connect } from "react-redux";
import { withRouter } from "react-router-dom";
import { MAP_BACKGROUNDS } from "../../config";
import styles from "../SettingsMenu.css";
import { setMapBackgroundAction } from "../../actions";
import { getCurrentMapBackground } from "../../reducers";

class MapSettingsMenu extends Component {
  constructor(props) {
    super(props);
    this.toggleMapBackground = this.toggleMapBackground.bind(this);
  }

  toggleMapBackground() {
    const current = this.props.currentMapBackground;

    if (current.url === MAP_BACKGROUNDS[1].url) {
      this.props.setMapBackground(MAP_BACKGROUNDS[0]);
    } else {
      this.props.setMapBackground(MAP_BACKGROUNDS[1]);
    }
  }

  render() {
    return (
      <div style={{ padding: 20 }}>
        <h4 style={{ padding: 0, margin: 0 }}>Map settings</h4>
        <hr />
        <div className={styles.MapSettings}>
          <p>
            There are {MAP_BACKGROUNDS ? MAP_BACKGROUNDS.length : 0} available
            map background(s):
            {MAP_BACKGROUNDS[0].description} and{" "}
            {MAP_BACKGROUNDS[1].description}.
          </p>
          <p>
            Currently selected:&nbsp;
            <strong>{this.props.currentMapBackground.description}</strong>.
          </p>
          <button onClick={this.toggleMapBackground}>Switch</button>
        </div>
        <br />
        <button
          className={styles.OKButton}
          onClick={this.props.closeSettingsMenu}
        >
          OK
        </button>
      </div>
    );
  }
}

const mapStateToProps = (state, ownProps) => {
  return {
    currentMapBackground: getCurrentMapBackground(state)
  };
};

const mapDispatchToProps = (dispatch, ownProps) => {
  return {
    setMapBackground: setMapBackgroundAction(dispatch)
  };
};

export default withRouter(
  connect(mapStateToProps, mapDispatchToProps)(MapSettingsMenu)
);
