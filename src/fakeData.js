import { combineReducers } from "redux";
import { RECEIVE_BOOTSTRAP_SUCCESS } from "./actions";
import { processMultipleResultsResponse } from "lizard-api-client";

// Redux reducer and selectors for storing and using fake data,
// to use in the Training Mode. Consists of separate sub-reducers for
// timeseries, rasterdata, timeseriesalarms and rasteralarms.

// The state of fakeData is only changed once, when the Bootstrap is received;
// if it contains fake data, then it is parsed using lizard-api-client here
// and saved. Then it can be used instead of sending actual API requests.

// "Start" and "end" timestamps are ignored as it assumed all fake data covers
// the same time period.

// Each type of request has its own reducer, that are combined in the Redux state.

function fakeTimeseriesData(state = {}, action) {
  // The state of fakeTimeseriesData has uuids as keys, and parsed
  // results of API calls as values.
  if (action.type !== RECEIVE_BOOTSTRAP_SUCCESS) {
    return state;
  }

  const config = action.bootstrap.configuration;

  if (!config || !config.fakeData || !config.fakeData.timeseries) {
    return state;
  }

  const newState = {};

  Object.keys(config.fakeData.timeseries).forEach(uuid => {
    const timeseriesData = config.fakeData.timeseries[uuid];
    const parsed = processMultipleResultsResponse(
      "Timeseries",
      timeseriesData,
      "http://example.com"
    );

    if (parsed) {
      newState[uuid] = parsed;
    }
  });

  return newState;
}

export const fakeDataReducer = combineReducers({
  timeseries: fakeTimeseriesData
});

// Selectors

// It is a bit sad that functions in this file have to know that they are called
// fakeData in the global state, but I don't know how to avoid that.
export const getFakeTimeseriesData = function(state, uuid) {
  return state.fakeData && state.fakeData.timeseries[uuid];
};
