import React, { Component } from "react";
import { connect } from "react-redux";
import { fetchAlarms } from "../actions";
import styles from "./FullStatistics.css";

class FullStatistics extends Component {
  componentDidMount() {
    this.props.fetchAlarms();
  }
  getAlarmsTable() {
    const { alarms } = this.props;
    console.log(alarms);
    const alarmsSortedByName = alarms.data
      ? alarms.data.slice().sort((a, b) => {
          if (a.name < b.name) {
            return -1;
          }
          if (a.name > b.name) {
            return 1;
          }
          return 0;
        })
      : [];
    const alarmRows = alarmsSortedByName.map((alarm, i) => {
      return (
        <tr key={i}>
          <td>
            {alarm.active ? (
              <i className="material-icons" style={{ color: "red" }}>
                warning
              </i>
            ) : (
              <i className="material-icons" style={{ color: "green" }}>
                check_circle
              </i>
            )}
          </td>
          <td>{alarm.name}</td>
          <td>
            {alarm.warning_threshold
              ? alarm.warning_threshold.warning_level
              : null}
          </td>
          <td>
            {alarm.warning_value
              ? alarm.warning_value
              : null}
          </td>
        </tr>
      );
    });
    return (
      <table className={styles.Table}>
        <thead>
          <tr>
            <td>&nbsp;</td>
            <td>Alarm name</td>
            <td>Level</td>
            <td>Value</td>
          </tr>
        </thead>
        <tbody>{alarmRows}</tbody>
      </table>
    );
  }
  render() {
    const { tile, height, isMobile, alarms } = this.props;
    const numberOfAlarms = (alarms.data) ? alarms.data.length : 0;
    return (
      <div
        className={styles.FullStatistics}
        style={{ height, paddingLeft: isMobile ? 0 : 200 }}
      >
        <div className={styles.Title}>{tile.title} ({numberOfAlarms})</div>
        {this.getAlarmsTable()}
      </div>
    );
  }
}

const mapStateToProps = (state, ownProps) => {
  return {
    alarms: state.alarms
  };
};

const mapDispatchToProps = (dispatch, ownProps) => {
  return {
    fetchAlarms: alarmsState => fetchAlarms(dispatch, alarmsState)
  };
};

export default connect(mapStateToProps, mapDispatchToProps)(FullStatistics);
