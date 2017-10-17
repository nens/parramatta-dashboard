import {
  getTimeseries,
  getBootstrap,
  getRasterDetail
} from "lizard-api-client";

// AssetActions
export const ADD_ASSET = "ADD_ASSET";

// LegendActions
export const FETCH_LEGEND = "FETCH_LEGEND";
export const ADD_LEGEND = "ADD_LEGEND";

// RasterActions
export const FETCH_RASTER = "FETCH_RASTER";
export const RECEIVE_RASTER = "RECEIVE_RASTER";
export const REMOVE_RASTER = "REMOVE_RASTER";

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
      console.log("Retrieving data:", data);
      dispatch(addLegend(uuid, data));
    });
  };
}

// Raster
export const fetchRaster = uuid => {
  return {
    type: FETCH_RASTER,
    uuid
  };
};

const receiveRaster = (uuid, data) => {
  return {
    type: RECEIVE_RASTER,
    uuid,
    data
  };
};

export const removeRaster = uuid => {
  return {
    type: REMOVE_RASTER,
    uuid
  };
};

export function getRaster(uuid, dispatch) {
  return (dispatch, getState) => {
    const currentData = getState().rasters[uuid];

    if (currentData) {
      if (currentData.data) {
        // Already present.
        return true;
      }
      if (currentData.isFetching || currentData.error) {
        // It's not there, but we're not going to do anything either.
        return false;
      }
    }

    // We need to go fetch it.

    // Set isFetching to true.
    dispatch(fetchRaster(uuid));
    // Send a request, store the resulting raster.
    getRasterDetail(uuid).then(data => {
      dispatch(receiveRaster(uuid, data));
    });

    return false; // No data present yet.
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
  console.log("Returning this function");
  if (sessionState && (sessionState.isFetching || sessionState.hasBootstrap)) {
    console.log("Already have bootstrap");
    return;
  }

  dispatch(fetchBootstrapAction());

  getBootstrap().then(
    bootstrap => {
      console.log("Received bootstrap:", bootstrap);
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

export function updateTimeseriesMetadata(dispatch, uuid) {
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
