import React, { Component } from "react";
import { setDateTimeAction, resetDateTimeAction } from "../../actions";
import {
  getTimezones,
  getChosenTimezone,
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

class PickDateTime extends Component {
  constructor(props) {
    super(props);

    const { initial, initialTimezone } = props;

    const dateAndTimeString = getDateAndTimeStrings(
      initial,
      this.timezoneOffset(initialTimezone)
    );

    this.state = {
      date: dateAndTimeString[0],
      time: dateAndTimeString[1],
      timezone: initialTimezone
    };

    this.setDate = this.setDate.bind(this);
    this.setTime = this.setTime.bind(this);
    this.setTimezone = this.setTimezone.bind(this);
    this.apply = this.apply.bind(this);
  }

  timezoneOffset(timezone) {
    // Translate a string like "browser" to a UTC offset in hours
    if (!timezone) {
      timezone = this.state.timezone;
    }
    const currentTimezone = this.props.timezones.find(tz => tz[0] === timezone);
    const tzOffset = currentTimezone[2];
    return tzOffset;
  }

  setDate(date) {
    if (date) {
      this.setState({ date: date });
    }
  }
  setTime(time) {
    if (time) {
      this.setState({ time: time });
    }
  }
  setTimezone(timezone) {
    this.setState({ timezone: timezone });
  }

  apply() {
    // Ugly but I don't know the datetime APIs well enough
    const fakeUtcDateTime = this.state.date + "T" + this.state.time + "Z";
    let timestamp = new Date(fakeUtcDateTime).getTime();
    timestamp -= this.timezoneOffset() * 3600000;

    const newUtcDateTime = new Date(timestamp);
    this.props.changeDateTime(
      newUtcDateTime.toISOString(),
      this.state.timezone
    );

    // Then close the edit field
    this.props.close();
  }

  render() {
    return (
      <div style={{ background: "#eee", padding: "10px" }}>
        <p>
          Please choose *both* a date and a time, and optionally a time zone.
        </p>
        <div className={styles.DateTimePicker}>
          <div>
            <h5>Date (e.g. "23/12/2018")</h5>
            <input
              type="date"
              name="date"
              value={this.state.date}
              onChange={event => this.setDate(event.target.value)}
            />
          </div>
          <div>
            <h5>Time (e.g. "09:15 AM")</h5>
            <input
              type="time"
              name="time"
              required
              value={this.state.time}
              onChange={event => this.setTime(event.target.value)}
            />
          </div>
          <div>
            <h5>Timezone</h5>
            <select
              name="timezone"
              required
              value={this.state.timezone}
              onChange={event => this.setTimezone(event.target.value)}
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
          <button className={styles.OKButton} onClick={this.apply}>
            Apply
          </button>
          &nbsp;
          <button className={styles.OKButton} onClick={this.props.close}>
            Cancel
          </button>
        </p>
      </div>
    );
  }
}

class DateTimeMenu extends Component {
  constructor(props) {
    super(props);

    this.openEdit = this.openEdit.bind(this);
    this.closeEdit = this.closeEdit.bind(this);

    this.state = {
      editOpen: false
    };
  }

  disabledRender() {
    return (
      <div style={{ padding: 20 }}>
        <h4 style={{ padding: 0, margin: 0 }}>Date/time settings &nbsp;</h4>
        <hr />
        <p>
          The date and time have been set to a fixed value in this
          dashboard&#39;s configuration, and can not be changed manually.
        </p>
        <button
          className={styles.OKButton}
          onClick={() => {
            this.props.closeSettingsMenu();
          }}
        >
          Close
        </button>
      </div>
    );
  }

  openEdit() {
    this.setState({ editOpen: true });
  }

  closeEdit() {
    this.setState({ editOpen: false });
  }

  render() {
    if (this.props.disableDateTimeSettings) {
      return this.disabledRender();
    }

    return (
      <div style={{ padding: 20 }}>
        <h4 style={{ padding: 0, margin: 0 }}>Date/time settings</h4>
        <hr />

        <p>
          The Dashboard is currently using
          <strong>
            {this.props.hasConfiguredDateTime
              ? " a fixed configured time "
              : " your local time "}
            ({new Date(this.props.now).toLocaleString()})
          </strong>
          &nbsp;as "now".
        </p>

        {this.state.editOpen ? (
          <PickDateTime
            initial={this.props.now}
            initialTimezone={this.props.chosenTimezone}
            timezones={this.props.timezones}
            changeDateTime={this.props.changeDateTime}
            close={this.closeEdit}
          />
        ) : (
          <p>
            <button className={styles.OKButton} onClick={this.openEdit}>
              Choose new fixed time
            </button>
            &nbsp;
            <button
              className={styles.OKButton}
              onClick={this.props.resetDateTime}
            >
              Reset to local time
            </button>
          </p>
        )}
        <hr />
        <button
          className={styles.OKButton}
          onClick={() => {
            this.props.closeSettingsMenu();
          }}
        >
          Close
        </button>
      </div>
    );
  }
}

const mapStateToProps = (state, ownProps) => {
  return {
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
    resetDateTime: resetDateTimeAction(dispatch)
  };
};

export default withRouter(
  connect(mapStateToProps, mapDispatchToProps)(DateTimeMenu)
);
