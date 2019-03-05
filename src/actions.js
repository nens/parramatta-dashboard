import {
  getTimeseries,
  getRasterAlarms,
  getTimeseriesAlarms,
  getBootstrap,
  getRasterDetail,
  makeFetcher
} from "lizard-api-client";

// AlarmActions
export const RECEIVE_ALARMS = "RECEIVE_ALARMS";

// AssetActions
export const ADD_ASSET = "ADD_ASSET";

// LegendActions
export const FETCH_LEGEND = "FETCH_LEGEND";
export const ADD_LEGEND = "ADD_LEGEND";

// SessionActions
export const FETCH_BOOTSTRAP = "FETCH_BOOTSTRAP";
export const RECEIVE_BOOTSTRAP_SUCCESS = "RECEIVE_BOOTSTRAP_SUCCESS";
export const RECEIVE_BOOTSTRAP_ERROR = "RECEIVE_BOOTSTRAP_ERROR";

// SettingsActions
export const SET_DATE = "SET_DATE";
export const SET_TIME = "SET_TIME";
export const RESET_DATETIME = "RESET_DATETIME";
export const SET_MAP_BACKGROUND = "SET_MAP_BACKGROUND";

// TimeseriesActions
export const ADD_TIMESERIES = "ADD_TIMESERIES";
export const FETCH_TIMESERIES_EVENTS = "FETCH_TIMESERIES_EVENTS";
export const RECEIVE_TIMESERIES_EVENTS = "RECEIVE_TIMESERIES_EVENTS";
export const FETCH_RASTER_EVENTS = "FETCH_RASTER_EVENTS";
export const RECEIVE_RASTER_EVENTS = "RECEIVE_RASTER_EVENTS";

// iframe mode
export const SET_IFRAME_MODE = "SET_IFRAME_MODE";

const setIframeModeAction = bool => {
  return {
    type: SET_IFRAME_MODE,
    bool
  };
};

export function setIframeMode(dispatch, mustSetIframeMode) {
  dispatch(setIframeModeAction(mustSetIframeMode));
}

export const receiveAlarmsAction = (alarms, isTimeseries) => {
  return {
    type: RECEIVE_ALARMS,
    isTimeseries,
    alarms
  };
};

export function fetchAlarms(dispatch) {
  getTimeseriesAlarms().then(
    alarms => {
      dispatch(receiveAlarmsAction(alarms, true));
    },
    error => {
      // If there is an error, we simply have no alarms to show.
      console.error("[E] There was a timeseriesAlarm API error: ", error);
      dispatch(receiveAlarmsAction([], true));
    }
  );

  getRasterAlarms({ active: true, page_size: 1000 }).then(
    alarms => {
      console.log("[P] Received alarms:", alarms);
      dispatch(receiveAlarmsAction(alarms, false));
    },
    error => {
      console.error("[E] There was a rasterAlarm API error: ", error);
      dispatch(receiveAlarmsAction([], false));
    }
  );
}

// Asset
export const addAsset = (assetType, id, instance) => {
  return {
    type: ADD_ASSET,
    assetType,
    id,
    instance
  };
};

// Legend
export const fetchLegend = uuid => {
  return {
    type: FETCH_LEGEND,
    uuid
  };
};

export const addLegend = (uuid, data) => {
  return {
    type: ADD_LEGEND,
    uuid,
    data
  };
};
export function getLegend(uuid, wmsInfo, styles, steps = 15) {
  return (dispatch, getState) => {
    dispatch(fetchLegend(uuid));

    wmsInfo.getLegend(styles, steps).then(data => {
      dispatch(addLegend(uuid, data));
    });
  };
}

// Session
export function fetchBootstrapAction() {
  return { type: FETCH_BOOTSTRAP };
}

export function receiveBootstrapSuccessAction(bootstrap) {
  return {
    type: RECEIVE_BOOTSTRAP_SUCCESS,
    bootstrap
  };
}

export function receiveBootstrapErrorAction(error) {
  return {
    type: RECEIVE_BOOTSTRAP_ERROR,
    error
  };
}

export function fetchBootstrap(dispatch, sessionState, dashboardName) {
  if (sessionState && (sessionState.isFetching || sessionState.hasBootstrap)) {
    return;
  }

  dispatch(fetchBootstrapAction());

  const finalDashboardName = dashboardName || "parramatta-dashboard";
  getBootstrap(finalDashboardName).then(
    bootstrap => {
      dispatch(receiveBootstrapSuccessAction(bootstrap));
    },
    error => {
      dispatch(receiveBootstrapErrorAction(error));
      console.error(error);
    }
  );
}

// Timeseries
export const addTimeseries = (uuid, timeseries) => {
  return {
    type: ADD_TIMESERIES,
    uuid,
    timeseries
  };
};

const fetchTimeseriesEventsAction = (uuid, start, end) => {
  return {
    type: FETCH_TIMESERIES_EVENTS,
    uuid,
    start,
    end
  };
};

const receiveTimeseriesEventsAction = (uuid, start, end, events) => {
  return {
    type: RECEIVE_TIMESERIES_EVENTS,
    uuid,
    start,
    end,
    events
  };
};

const fetchRasterEventsAction = (uuid, geomKey, start, end) => {
  return {
    type: FETCH_RASTER_EVENTS,
    uuid,
    geomKey,
    start,
    end
  };
};

const receiveRasterEventsAction = (uuid, geomKey, start, end, events) => {
  return {
    type: RECEIVE_RASTER_EVENTS,
    uuid,
    geomKey,
    start,
    end,
    events
  };
};

export const setDateAction = function(dispatch) {
  return date =>
    dispatch({
      type: SET_DATE,
      date: date
    });
};

export const setTimeAction = function(dispatch) {
  return time =>
    dispatch({
      type: SET_TIME,
      time: time
    });
};

export const resetDateTimeAction = function(dispatch) {
  return () =>
    dispatch({
      type: RESET_DATETIME
    });
};

export const setMapBackgroundAction = function(dispatch) {
  return mapBackground =>
    dispatch({
      type: SET_MAP_BACKGROUND,
      mapBackground: { ...mapBackground }
    });
};

export function updateTimeseriesMetadata(uuid) {
  return dispatch => {
    // Get timeseries with uuid, update its metadata. Does not
    // pass a start and end time, so does not receive any events,
    // although the metadata may contain a last value.
    getTimeseries(uuid).then(results => {
      if (results && results.length) {
        dispatch(addTimeseries(uuid, results[0]));
      }
    });
  };
}

export function getTimeseriesMetadataAction(uuid) {
  return (dispatch, getState) => {
    const timeseriesState = getState().timeseries;

    if (!timeseriesState[uuid]) {
      return getTimeseries(uuid).then(results => {
        if (results && results.length) {
          dispatch(addTimeseries(uuid, results[0]));
          return results[0];
        }
      });
    } else {
      return Promise.resolve(timeseriesState[uuid]);
    }
  };
}

export function getTimeseriesEvents(uuid, start, end, params) {
  return (dispatch, getState) => {
    const timeseriesEvents = getState().timeseriesEvents;
    const events = timeseriesEvents[uuid];

    if (events && events.start === start && events.end === end) {
      return; // Up to date.
    } else if (!events || !events.isFetching) {
      // Fetch it
      dispatch(fetchTimeseriesEventsAction(uuid, start, end));

      getTimeseries(uuid, start, end, params).then(results => {
        if (results && results.length === 1) {
          const result = results[0];

          // Events
          dispatch(
            receiveTimeseriesEventsAction(uuid, start, end, result.events)
          );
        }
      });
    }
  };
}

export function getTimeseriesAction(uuid, start, end, params) {
  return dispatch => {
    dispatch(getTimeseriesMetadataAction(uuid)).then(timeseriesMetadata =>
      dispatch(getTimeseriesEvents(timeseriesMetadata.uuid, start, end, params))
    );
  };
}

export function getRasterEvents(raster, geometry, start, end) {
  return (dispatch, getState) => {
    if (!raster) return null;
    // There can be multiple points on a raster where we store raster events from.
    // Therefore we create a key based on the coordinates of the point, and store
    // the events in state.rasterEvents[rasterUuid][geomKey].
    const geomKey = `${geometry.coordinates[0]}-${geometry.coordinates[1]}`;
    const rasterEvent = getState().rasterEvents[raster.uuid];

    let events;
    if (rasterEvent) {
      events = rasterEvent[geomKey];
    }

    if (events && events.start === start && events.end === end) {
      // Up to date.
      return;
    } else if (!events || !events.isFetching) {
      // Fetch it.
      dispatch(fetchRasterEventsAction(raster.uuid, geomKey, start, end));

      raster.getDataAtPoint(geometry, start, end).then(results => {
        let data;

        if (results && results.data) {
          // Rewrite to a format compatible with normal timeseries.
          data = results.data.map(event => {
            return {
              timestamp: event[0],
              sum: event[1],
              max: event[1]
            };
          });
        } else {
          // No data returned, treat as if an empty array was returned.
          // Happens e.g. when there is no data during the selected time period.
          data = [];
        }

        dispatch(
          receiveRasterEventsAction(raster.uuid, geomKey, start, end, data)
        );
      });
    }
  };
}

export const fetchRaster = makeFetcher("rasters", getRasterDetail);
