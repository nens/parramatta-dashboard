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

// TileActions
export const ADD_TILE = "ADD_TILE";
export const SELECT_TILE = "SELECT_TILE";
export const CLOSE_TILE = "CLOSE_TILE";

// TimeseriesActions
export const ADD_TIMESERIES = "ADD_TIMESERIES";
export const FETCH_TIMESERIES_EVENTS = "FETCH_TIMESERIES_EVENTS";
export const RECEIVE_TIMESERIES_EVENTS = "RECEIVE_TIMESERIES_EVENTS";
export const FETCH_RASTER_EVENTS = "FETCH_RASTER_EVENTS";
export const RECEIVE_RASTER_EVENTS = "RECEIVE_RASTER_EVENTS";

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
      console.error(error);
      dispatch(receiveAlarmsAction([], true));
    }
  );

  getRasterAlarms().then(
    alarms => {
      dispatch(receiveAlarmsAction(alarms, false));
    },
    error => {
      // If there is an error, we simply have no alarms to show.
      console.error(error);
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

export function fetchBootstrap(dispatch, sessionState) {
  if (sessionState && (sessionState.isFetching || sessionState.hasBootstrap)) {
    return;
  }

  dispatch(fetchBootstrapAction());

  getBootstrap().then(
    bootstrap => {
      dispatch(receiveBootstrapSuccessAction(bootstrap));
    },
    error => {
      dispatch(receiveBootstrapErrorAction(error));
      console.error(error);
    }
  );
}

// Tile
export const addTile = (tileKey, tile) => {
  return {
    type: ADD_TILE,
    tileKey,
    tile: { ...tile }
  };
};

export const selectTile = tileKey => {
  return {
    type: SELECT_TILE,
    tileKey
  };
};

export const closeTile = () => {
  return {
    type: CLOSE_TILE
  };
};

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

      const params = {
        window: 3600000
      };

      if (raster.observation_type.scale === "ratio") {
        params.fields = "sum";
      } else {
        params.fields = "average";
      }

      raster.getDataAtPoint(geometry, start, end, params).then(results => {
        if (results && results.data) {
          // Rewrite to a format compatible with normal timeseries.
          const data = results.data.map(event => {
            return {
              timestamp: event[0],
              sum: event[1],
              max: event[1]
            };
          });

          dispatch(
            receiveRasterEventsAction(raster.uuid, geomKey, start, end, data)
          );
        }
      });
    }
  };
}

export const fetchRaster = makeFetcher("rasters", getRasterDetail);
