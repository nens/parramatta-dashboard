import { connect } from "react-redux";
import { Map } from "immutable";
import { getLegend } from "../actions";
import { withRouter } from "react-router-dom";
import React, { Component } from "react";
import styles from "./Legend.css";

class Legend extends Component {
  constructor(props) {
    super(props);
    this.state = {
      width: window.innerWidth,
      height: window.innerHeight,
      isOpen: false
    };
    this.handleUpdateDimensions = this.handleUpdateDimensions.bind(this);
  }
  componentDidMount() {
    const { uuid, wmsInfo, styles } = this.props;
    this.props.doGetLegend(uuid, wmsInfo, styles);
    window.addEventListener("resize", this.handleUpdateDimensions, false);
  }
  componentWillUnmount() {
    window.removeEventListener("resize", this.handleUpdateDimensions, false);
  }
  handleUpdateDimensions() {
    this.setState({
      width: window.innerWidth,
      height: window.innerHeight
    });
  }

  getCorrectTextColor(hex) {
    let threshold = 130;
    // ^^ About half of 256. Lower threshold equals more dark text on dark background

    let hRed = hexToR(hex);
    let hGreen = hexToG(hex);
    let hBlue = hexToB(hex);

    function hexToR(h) {
      return parseInt(cutHex(h).substring(0, 2), 16);
    }
    function hexToG(h) {
      return parseInt(cutHex(h).substring(2, 4), 16);
    }
    function hexToB(h) {
      return parseInt(cutHex(h).substring(4, 6), 16);
    }
    function cutHex(h) {
      return h.charAt(0) === "#" ? h.substring(1, 7) : h;
    }

    let cBrightness = (hRed * 299 + hGreen * 587 + hBlue * 114) / 1000;
    if (cBrightness > threshold) {
      return "#000000";
    } else {
      return "#ffffff";
    }
  }

  render() {
    const { width, isOpen } = this.state;
    const { legends, title, uuid } = this.props;
    const isMobile = width < 700 ? true : false;
    const legendsList = Map(legends).toJS();
    const legendSteps =
      legendsList[uuid] && legendsList[uuid].data
        ? legendsList[uuid].data.legend
        : [];

    return (
      <div
        className={isMobile ? styles.LegendMobile : styles.Legend}
        style={{
          bottom: isOpen ? 0 : -390
        }}
      >
        <div
          className={styles.LegendTitle}
          onClick={() =>
            this.setState({
              isOpen: !isOpen
            })}
        >
          <span title={title}>Legend ({title})</span>
          <i className="material-icons">drag_handle</i>
        </div>

        {legendSteps
          ? legendSteps.map((step, i) => {
              return (
                <div
                  key={i}
                  className={styles.LegendStep}
                  style={{
                    backgroundColor: step.color,
                    color: this.getCorrectTextColor(step.color)
                  }}
                >
                  {step.value.toFixed(1)}
                </div>
              );
            })
          : null}
      </div>
    );
  }
}

function mapStateToProps(state) {
  return {
    legends: state.legends,
    rasters: state.rasters
  };
}

function mapDispatchToProps(dispatch) {
  return {
    doGetLegend: (uuid, wmsInfo, styles) =>
      dispatch(getLegend(uuid, wmsInfo, styles))
  };
}

export default withRouter(connect(mapStateToProps, mapDispatchToProps)(Legend));
