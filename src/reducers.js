import { combineReducers } from "redux";
import omit from "lodash/omit";
import {
  ADD_ASSET,
  ADD_LEGEND,
  ADD_TILE,
  ADD_TIMESERIES,
  CLOSE_TILE,
  FETCH_ALARMS,
  RECEIVE_ALARMS,
  FETCH_BOOTSTRAP,
  FETCH_LEGEND,
  FETCH_RASTER,
  RECEIVE_BOOTSTRAP_ERROR,
  RECEIVE_BOOTSTRAP_SUCCESS,
  RECEIVE_RASTER,
  REMOVE_RASTER,
  SELECT_TILE
} from "./actions";
import { THE_TILES } from "./constants";

function assets(
  state = {
    measuringstation: {}
  },
  action
) {
  switch (action.type) {
    case ADD_ASSET:
      const newAssets = { ...state };
      const newAssetsOfType = { ...newAssets[action.assetType] };
      newAssetsOfType[action.id] = action.instance;
      newAssets[action.assetType] = newAssetsOfType;
      return newAssets;
    default:
      return state;
  }
}

function legends(state = {}, action) {
  let newState;
  let newLegend;
  switch (action.type) {
    case FETCH_LEGEND:
      newState = { ...state };

      if (action.uuid in newState) {
        newLegend = { ...newState[action.uuid] };
        newLegend.isFetching = true;
      } else {
        newLegend = {
          isFetching: false,
          data: null,
          error: null
        };
      }
      newState[action.uuid] = newLegend;
      return newState;
    case ADD_LEGEND:
      newState = { ...state };
      newLegend = { ...newState[action.uuid] };
      newLegend.isFetching = false;
      if (action.data === null) {
        newLegend.data = null;
        newLegend.error = "Error while fetching raster!";
      } else {
        newLegend.data = action.data;
        newLegend.error = null;
      }
      newState[action.uuid] = newLegend;
      return newState;
    default:
      return state;
  }
}

function rasters(state = {}, action) {
  let newState;
  let newRaster;
  switch (action.type) {
    case FETCH_RASTER:
      newState = { ...state };

      if (action.uuid in newState) {
        newRaster = { ...newState[action.uuid] };
      } else {
        newRaster = {
          isFetching: false,
          data: null,
          error: null
        };
      }
      newRaster.isFetching = true;
      newState[action.uuid] = newRaster;
      return newState;
    case RECEIVE_RASTER:
      newState = { ...state };
      newRaster = { ...newState[action.uuid] };
      newRaster.isFetching = false;
      if (action.data === null) {
        newRaster.data = null;
        newRaster.error = "Error while fetching raster!";
      } else {
        newRaster.data = action.data;
        newRaster.error = null;
      }
      newState[action.uuid] = newRaster;
      return newState;
    case REMOVE_RASTER:
      return omit(state, action.uuid);
    default:
      return state;
  }
}

function session(
  state = {
    isFetching: false,
    hasBootstrap: false,
    bootstrap: null
  },
  action
) {
  switch (action.type) {
    case FETCH_BOOTSTRAP:
      return {
        isFetching: true,
        hasBootstrap: state.hasBootstrap,
        bootstrap: state.bootstrap,
        error: null
      };
    case RECEIVE_BOOTSTRAP_SUCCESS:
      return {
        isFetching: false,
        hasBootstrap: true,
        bootstrap: action.bootstrap,
        error: null
      };
    case RECEIVE_BOOTSTRAP_ERROR:
      return {
        isFetching: false,
        hasBootstrap: false,
        bootstrap: null,
        error: action.error
      };
    default:
      return state;
  }
}

function tiles(state = THE_TILES, action) {
  switch (action.type) {
    case ADD_TILE:
      let newState = { ...state };
      newState[action.tileKey] = action.tile;
      return newState;
    default:
      return state;
  }
}

function timeseries(state = {}, action) {
  switch (action.type) {
    case ADD_TIMESERIES:
      const newState = { ...state };
      newState[action.uuid] = action.timeseries;
      return newState;
    default:
      return state;
  }
}

function ui(
  state = {
    currentTile: null
  },
  action
) {
  let newState;
  switch (action.type) {
    case SELECT_TILE:
      newState = { ...state };
      newState.currentTile = action.tileKey;
      return newState;
    case CLOSE_TILE:
      newState = { ...state };
      newState.currentTile = null;
      return newState;
    default:
      return state;
  }
}

function alarms(
  state = {
    data: null,
    isFetching: false
  },
  action
) {
  switch (action.type) {
    case FETCH_ALARMS:
      let newState = { ...state };
      newState.isFetching = true;
      return newState;
    case RECEIVE_ALARMS:
      // We receive *all* of them at once,
      // don't use old state.
      return {
        data: action.alarms,
        isFetching: false
      };
    default:
      return state;
  }
}

const rootReducer = combineReducers({
  alarms,
  assets,
  legends,
  rasters,
  session,
  tiles,
  timeseries,
  ui
});

export default rootReducer;
