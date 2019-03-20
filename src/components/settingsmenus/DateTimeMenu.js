import React, { Component } from "react";
import {
  setDateAction,
  setTimeAction,
  resetDateTimeAction
} from "../../actions";
import { connect } from "react-redux";
import { withRouter } from "react-router-dom";
import { getConfiguredDate, getConfiguredTime } from "../../reducers";
import styles from "../SettingsMenu.css";

class DateTimeMenu extends Component {
  render() {
    return (
      <div style={{ padding: 20 }}>
        <h4 style={{ padding: 0, margin: 0 }}>
          Date/time settings &nbsp;
          <button onClick={this.props.resetDateTime}>Reset</button>
        </h4>
        <hr />
        <div className={styles.DateTimePicker}>
          <div>
            <h5>Date (e.g. "23/12/2018")</h5>
            <input
              type="date"
              name="date"
              value={this.props.date}
              onChange={event => {
                this.props.changeDate(event.target.value);
              }}
            />
          </div>
          <div>
            <h5>Time (e.g. "09:15 AM")</h5>
            <input
              type="time"
              name="time"
              value={this.props.time}
              onChange={event => {
                this.props.changeTime(event.target.value);
              }}
            />
          </div>
        </div>
        <br />
        <button
          className={styles.OKButton}
          onClick={() => {
            this.props.closeSettingsMenu();
          }}
        >
          OK
        </button>
      </div>
    );
  }
}

const mapStateToProps = (state, ownProps) => {
  return {
    date: getConfiguredDate(state),
    time: getConfiguredTime(state)
  };
};

const mapDispatchToProps = (dispatch, ownProps) => {
  return {
    changeDate: setDateAction(dispatch),
    changeTime: setTimeAction(dispatch),
    resetDateTime: resetDateTimeAction(dispatch)
  };
};

export default withRouter(
  connect(mapStateToProps, mapDispatchToProps)(DateTimeMenu)
);
