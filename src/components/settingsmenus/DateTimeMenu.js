import React, { Component } from "react";
import {
  setDateTimeAction,
  resetDateTimeAction,
  setChosenTimezone
} from "../../actions";
import {
  getChosenTimezone,
  getTimezones,
  getTimezone,
  getConfiguredDateTime,
  getNow,
  hasConfiguredDateTime,
  disableDateTimeSettings
} from "../../reducers";
import { connect } from "react-redux";
import { withRouter } from "react-router-dom";
import styles from "../SettingsMenu.css";

/*

Some background:

- The date/time stored in Redux and used by the application are IN UTC.

- Asking for a date and time and knowing the browser UTC offset is not
  enough to convert between the user input (preferably in local time)
  and UTC, as there may have been e.g. daylight savings time at the
  earlier date only.

- So we also offer a timezone choice, with browser time and UTC as
  default options, together with options defined in the config
  (AEDT and AEST for Sydney).

- This choice also need to be saved, in Redux because this component
  doesn't always exist, but it's only used here for now. To visualize
  times elsewhere, browser time is always used.

*/

const toTimezoneString = function(offset) {
  // Return the string "+10:00" for the input 10.
  // Should we laugh or cry?
  const absOffset = Math.abs(offset);
  const hours = Math.floor(absOffset);
  const minutes = Math.floor((absOffset - hours) * 60);

  return (
    (offset >= 0 ? "+" : "-") +
    (hours < 10 ? "0" + hours : hours) +
    ":" +
    (minutes < 10 ? "0" + minutes : minutes)
  );
};

const getDateAndTimeStrings = function(dateTime, offset) {
  // Takes a UTC dateTime string like "2019-03-21T10:58Z" and an
  // offset in hours like 1. Returns a date and time in the timezone
  // with that offset representing the same time.
  if (!dateTime) {
    return [null, null];
  }

  const utcTimestamp = new Date(dateTime).getTime();
  const withOffset = utcTimestamp + 3600000 * offset;

  const offsetDate = new Date(withOffset);

  const iso = offsetDate.toISOString();
  return [iso.slice(0, 10), iso.slice(11, 16)];
};

class DateTimeMenu extends Component {
  constructor(props) {
    super(props);
    this.setTime = this.setTime.bind(this);
  }

  setDateTimeUsingLocalTimestamp(timestamp) {
    timestamp -= this.props.currentTimezoneOffset * 3600000;
    const newUtcDateTime = new Date(timestamp);
    this.props.changeDateTime(newUtcDateTime.toISOString());
  }

  setTime(time) {
    if (!time || !this.props.currentDate) return;

    const fakeUtcDateTime = this.props.currentDate + "T" + time + "Z";
    const timestamp = new Date(fakeUtcDateTime).getTime();
    this.setDateTimeUsingLocalTimestamp(timestamp);
  }

  setDate(date) {
    if (!date) return;
    const fakeUtcDateTime =
      date + "T" + (this.props.currentTime || "00:00") + "Z";
    let timestamp = new Date(fakeUtcDateTime).getTime();
    this.setDateTimeUsingLocalTimestamp(timestamp);
  }

  disabledRender() {
    return (
      <div style={{ padding: 20 }}>
        <h4 style={{ padding: 0, margin: 0 }}>
          Date/time settings &nbsp;
          <button onClick={this.props.resetDateTime}>Reset</button>
        </h4>
        <hr />
        <p>
          The date and time have been set to a fixed value in this dashboard's
          configuration, and can not be changed manually.
        </p>
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

  render() {
    if (this.props.disableDateTimeSettings) {
      return this.disabledRender();
    }

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
              value={this.props.currentDate}
              onChange={event => {
                this.setDate(event.target.value);
              }}
            />
          </div>
          <div>
            <h5>Time (e.g. "09:15 AM")</h5>
            <input
              type="time"
              name="time"
              value={this.props.currentTime}
              onChange={event => {
                this.setTime(event.target.value);
              }}
            />
          </div>
          <div>
            <h5>Timezone</h5>
            <select
              name="timezone"
              value={this.props.chosenTimezone}
              onChange={event =>
                this.props.setChosenTimezone(event.target.value)}
            >
              {this.props.timezones.map(tz => {
                return (
                  <option key={tz[0]} value={tz[0]}>
                    {tz[1]} ({toTimezoneString(tz[2])})
                  </option>
                );
              })}
            </select>
          </div>
        </div>
        <p>
          To change the date/time used in the application instead of current
          local time, please enter a date and time.
        </p>
        <p>
          Currently using
          <strong>
            {this.props.hasConfiguredDateTime
              ? " your configured time"
              : " local time"}.
          </strong>
        </p>
        <p>
          By default the time entered is in your browser's current timezone. For
          internal use in the application it will be converted to UTC using the
          current offset between your time zone and UTC. In case a date is
          entered that has a different daylight savings status compared to
          today, please explicitly pick the timezone your entered time is in.
        </p>
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
  const currentTimezoneOffset = getTimezone(state)[2];
  const dateTime = getConfiguredDateTime(state);

  const currentDateAndTime = getDateAndTimeStrings(
    dateTime,
    currentTimezoneOffset
  );

  return {
    currentDate: currentDateAndTime[0],
    currentTime: currentDateAndTime[1],
    currentTimezoneOffset: currentTimezoneOffset,
    chosenTimezone: getChosenTimezone(state),
    timezones: getTimezones(state),
    now: getNow(state),
    hasConfiguredDateTime: hasConfiguredDateTime(state),
    disableDateTimeSettings: disableDateTimeSettings(state)
  };
};

const mapDispatchToProps = (dispatch, ownProps) => {
  return {
    changeDateTime: setDateTimeAction(dispatch),
    resetDateTime: resetDateTimeAction(dispatch),
    setChosenTimezone: setChosenTimezone(dispatch)
  };
};

export default withRouter(
  connect(mapStateToProps, mapDispatchToProps)(DateTimeMenu)
);
