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
  pluralizeAlarms(n) {
    return n === 1 ? "alarm" : "alarms";
  }
  render() {
    const { width } = this.state;

    let content;
    if (this.props.alarms && this.props.alarms.data) {
      const triggerdAlarmCount = this.numTriggeredAlarms();
      const alarmCount = this.props.alarms.data.length;
      content = (
        <div>
          <p>{triggerdAlarmCount}</p>
          {width > 200 ? (
            <span>
              {"triggered " + this.pluralizeAlarms(triggerdAlarmCount)}
            </span>
          ) : null}
          {width > 200 ? (
            <span>
              of
              {" " + alarmCount + " " + this.pluralizeAlarms(alarmCount)}
              total
            </span>
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
