import {
  getTimeseries,
  getTimeseriesAlarms,
  getBootstrap,
  getRasterDetail,
  makeFetcher
} from "lizard-api-client";

// AlarmActions
export const FETCH_ALARMS = "FETCH_ALARMS";
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

// Alarms
export const fetchAlarmsAction = () => {
  return {
    type: FETCH_ALARMS
  };
};

export const receiveAlarmsAction = alarms => {
  return {
    type: RECEIVE_ALARMS,
    alarms: alarms
  };
};

export function fetchAlarms(dispatch, sessionState) {
  if (sessionState && sessionState.isFetching) {
    return;
  }

  dispatch(fetchAlarmsAction());

  getTimeseriesAlarms().then(
    alarms => {
      dispatch(receiveAlarmsAction(alarms));
    },
    error => {
      // If there is an error, we simply have no alarms to show.
      console.error(error);
      dispatch(receiveAlarmsAction([]));
    }
  );
}

// Asset
export const addAsset = (assetType, id, instance) => {
  return {
    type: ADD_ASSET,
    assetType: assetType,
    id: id,
    instance: instance
  };
};

// Legend
export const fetchLegend = uuid => {
  return {
    type: FETCH_LEGEND,
    uuid: uuid
  };
};

export const addLegend = (uuid, legendData) => {
  return {
    type: ADD_LEGEND,
    uuid: uuid,
    data: legendData
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
    tileKey: tileKey,
    tile: { ...tile }
  };
};

export const selectTile = tileKey => {
  return {
    type: SELECT_TILE,
    tileKey: tileKey
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
    uuid: uuid,
    timeseries: timeseries
  };
};

export function updateTimeseriesMetadata(uuid) {
  return (dispatch, getState) => {
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

export const fetchRaster = makeFetcher("rasters", getRasterDetail);
