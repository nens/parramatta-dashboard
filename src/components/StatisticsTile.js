import MDSpinner from "react-md-spinner";
import React, { Component } from "react";
import styles from "./StatisticsTile.css";

class StatisticsTile extends Component {
  constructor(props) {
    super(props);
    this.state = {
      width: null,
      height: null
    };
  }
  componentDidMount() {
    this.setState({
      width: this.myInput.offsetWidth,
      height: this.myInput.offsetHeight
    });
  }
  numTriggeredAlarms() {
    return this.props.alarms.data.filter(alarm => alarm.activeWarning()).length;
  }

  render() {
    const { title } = this.props;
    const { width } = this.state;

    let content;
    if (
      this.props.alarms &&
      !this.props.alarms.isFetching &&
      this.props.alarms.data
    ) {
      content = (
        <div>
          <p>{this.numTriggeredAlarms()}</p>
          {width > 200 ? <span>{title}</span> : null}
          {width > 200 ? (
            <span>of {this.props.alarms.data.length} alarms total</span>
          ) : null}
        </div>
      );
    } else {
      content = <MDSpinner size={24} />;
    }
    return (
      <div
        ref={input => {
          this.myInput = input;
        }}
        className={styles.StatisticsTile}
      >
        {content}
      </div>
    );
  }
}

export default StatisticsTile;
