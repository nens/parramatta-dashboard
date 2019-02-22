import { connect } from "react-redux";
import { Map } from "immutable";
import { getLegend } from "../actions";
import { MOBILE_BREAKPOINT } from "../config";
import { withRouter } from "react-router-dom";
import React, { Component } from "react";
import styles from "./Legend.css";
import { Scrollbars } from "react-custom-scrollbars";

import {
  IconNoAlarmSVG,
  IconInactiveAlarmSVG,
  IconActiveAlarmSVG
} from "./Icons.js";

const vectorIconsLegend = [
  <div className={styles.IconLineContainer} key="icon1">
    {IconActiveAlarmSVG}
    <div className={styles.IconSVGContainer}>station with triggered alarm</div>
  </div>,
  <div className={styles.IconLineContainer} key="icon2">
    {IconInactiveAlarmSVG}
    <div className={styles.IconSVGContainer}>station with alarm</div>
  </div>,
  <div className={styles.IconLineContainer} key="icon3">
    {IconNoAlarmSVG}
    <div className={styles.IconSVGContainer}>station without alarm</div>
  </div>
];

class Legend extends Component {
  constructor(props) {
    super(props);
    this.state = {
      width: window.innerWidth,
      height: window.innerHeight,
      isOpen: false,
      legends: {}
    };
    this.handleUpdateDimensions = this.handleUpdateDimensions.bind(this);
  }
  componentDidMount() {
    const { drawRaster, uuid, wmsInfo, styles } = this.props;
    if (drawRaster) {
      this.props.doGetLegend(uuid, wmsInfo, styles);
    }
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

  renderExtraLegends(extraLegends) {
    return extraLegends.map((extraLegend, idx1) => (
      <div key={"extra-legend-" + idx1}>
        <h3 className={styles.LegendSubHeader}>{extraLegend.title}</h3>
        {extraLegend.steps.map((step, idx2) => (
          <div
            key={"extraLegend" + idx1 + "-" + idx2}
            className={styles.LegendStep}
            style={{
              backgroundColor: step.color,
              color: this.getCorrectTextColor(step.color),
              minWidth: 0
            }}
          >
            {step.text}
          </div>
        ))}
      </div>
    ));
  }

  getLegendCssClass(iframeModeActive, isMobile) {
    if (iframeModeActive) {
      return styles.legendIframe;
    } else if (isMobile) {
      return styles.LegendMobile;
    } else {
      return styles.Legend;
    }
  }

  render() {
    // Don't show the legend if showLegend is set to false.
    if (this.props.tile && this.props.tile.showLegend === false) {
      return null;
    }

    const { width, isOpen } = this.state;
    const {
      drawRaster,
      drawVectorIcons,
      legends,
      tile,
      uuid,
      iframeModeActive
    } = this.props;
    const isMobile = !iframeModeActive && width < MOBILE_BREAKPOINT;
    const legendsList = Map(legends).toJS();
    const legendSteps =
      drawRaster && legendsList[uuid] && legendsList[uuid].data
        ? legendsList[uuid].data.legend
        : [];
    const legendCssClass = this.getLegendCssClass(iframeModeActive, isMobile);

    return (
      <div
        className={legendCssClass}
        key={"legend-" + tile.id}
        style={{
          bottom: isOpen ? 0 : -300,
          opacity: tile.opacity ? tile.opacity : 0.8
        }}
      >
        <div
          className={styles.LegendTitle}
          onClick={() =>
            this.setState({
              isOpen: !isOpen
            })}
        >
          <span title="LEGEND">LEGEND</span>
          <i className="material-icons">drag_handle</i>
        </div>

        <Scrollbars autoHeight={true} autoHeightMin={300}>
          {legendSteps.length ? (
            <div>
              <h3 className={styles.LegendSubHeader}>= Raster legend =</h3>
              {legendSteps
                .map((step, i) => {
                  return (
                    <div
                      key={i}
                      className={styles.LegendStep}
                      style={{
                        backgroundColor: step.color,
                        color: this.getCorrectTextColor(step.color)
                      }}
                    >
                      {i === legendSteps.length - 1 ? "> " : ""}
                      {step.value.toFixed(1)} {this.props.observationType.unit}
                    </div>
                  );
                })
                .reverse()}
            </div>
          ) : null}

          {drawVectorIcons && tile.assetTypes && tile.assetTypes.length ? (
            <div>
              <h3 className={styles.LegendSubHeader}>= Icons =</h3>
              <div>{vectorIconsLegend}</div>
            </div>
          ) : null}

          {tile.extraLegends
            ? this.renderExtraLegends(tile.extraLegends)
            : null}
        </Scrollbars>
      </div>
    );
  }
}

function mapStateToProps(state) {
  return {
    legends: state.legends,
    iframeModeActive: state.iframeMode.active
  };
}

function mapDispatchToProps(dispatch) {
  return {
    doGetLegend: (uuid, wmsInfo, styles) =>
      dispatch(getLegend(uuid, wmsInfo, styles))
  };
}

export default withRouter(connect(mapStateToProps, mapDispatchToProps)(Legend));
