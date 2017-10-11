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
    window.addEventListener("resize", this.handleUpdateDimensions, false);
    // console.log(this.props.legends);
    // console.log(this.props.rasters);
    // this.props.doGetLegend(this.props.legendUuid);
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
    const isMobile = width < 700 ? true : false;
    return (
      <div className={isMobile ? styles.LegendMobile : styles.Legend} style={{
        bottom: (isOpen) ? 0 : -390
      }}>
        <div
          className={styles.LegendTitle}
          onClick={() =>
            this.setState({
              isOpen: !isOpen
            })}
        >
          Legend
          <i className="material-icons">drag_handle</i>
        </div>
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
