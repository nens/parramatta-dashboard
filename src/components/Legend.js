import { connect } from "react-redux";
import { getLegend } from "../actions";
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
    window.addEventListener("resize", this.handleUpdateDimensions, false);
    this.props.doGetLegend(uuid, wmsInfo, styles);
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
  render() {
    const { width, isOpen } = this.state;
    const { legends, title } = this.props;
    const isMobile = width < 700 ? true : false;
    const legend = Object.values(legends)[0];

    let legendSteps = null;
    try {
      legendSteps = legend.data.legend;
    } catch(e) {
      return null;
    }

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
          Legend ({title})
          <i className="material-icons">drag_handle</i>
        </div>

        {legendSteps
          ? legendSteps.map((step, i) => {
              return (
                <div
                  className={styles.LegendStep}
                  style={{ backgroundColor: step.color }}
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

export default connect(mapStateToProps, mapDispatchToProps)(Legend);
