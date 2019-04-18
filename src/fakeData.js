import { RECEIVE_BOOTSTRAP_SUCCESS } from "./actions";
import { processMultipleResultsResponse } from "lizard-api-client";

// Redux reducer and selectors for storing and using fake data,
// to use in the Training Mode.

// It is a key-value store, each type of request has its own key;
// the values are *processed* API responses. E.g. responses from
// the Timeseries endpoint are processed using processMultipleResultsResponse
// in lizard-api-client, so the same happens here.

// The state of fakeData is currently only changed once, when the
// Bootstrap is received.

// "Start" and "end" timestamps are ignored as it assumed all fake data covers
// the same time period.

export const fakeDataReducer = function(state = {}, action) {
  if (action.type !== RECEIVE_BOOTSTRAP_SUCCESS) {
    // We only need to update based on received bootstraps.
    return state;
  }

  const config = action.bootstrap.configuration;

  if (!config || !config.fakeData) {
    return state;
  }

  const newState = {};

  Object.keys(config.fakeData).forEach(key => {
    const data = config.fakeData[key];
    let parsed = null;

    if (/^timeseries-/.test(key)) {
      parsed = processMultipleResultsResponse(
        "Timeseries",
        data,
        "http://example.com"
      );

      parsed = parsed && parsed.length > 0 ? parsed[0] : null;
    } else if (/^raster-/.test(key)) {
      parsed = data;
    } else if (key === "timeseriesAlarms" || key === "rasterAlarms") {
      const valueObject =
        key === "timeseriesAlarms" ? "TimeseriesAlarm" : "RasterAlarm";

      parsed = processMultipleResultsResponse(
        valueObject,
        data,
        "http://example.com"
      ).filter(alarm => alarm.active);

      // Also store a *combined* list of parsed alarms in newState.alarms
      newState.alarms = (newState.alarms || []).concat(parsed);
    }

    if (parsed) {
      newState[key] = parsed;
    }
  });

  return newState;
};

// Selectors

export const fakeTimeseriesKey = uuid => `timeseries-${uuid}`;

export const fakeRasterKey = (uuid, geometry) =>
  `raster-${uuid}-${geometry.coordinates[0]}-${geometry.coordinates[1]}`;

export const getFakeData = (state, key) =>
  state.fakeData && state.fakeData[key];
