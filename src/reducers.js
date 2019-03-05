import { combineReducers } from "redux";
import {
  ADD_ASSET,
  ADD_LEGEND,
  ADD_TIMESERIES,
  FETCH_TIMESERIES_EVENTS,
  RECEIVE_TIMESERIES_EVENTS,
  FETCH_RASTER_EVENTS,
  RECEIVE_RASTER_EVENTS,
  SET_NOW,
  SET_DATE,
  SET_TIME,
  RESET_DATETIME,
  SET_MAP_BACKGROUND,
  RECEIVE_ALARMS,
  FETCH_BOOTSTRAP,
  FETCH_LEGEND,
  RECEIVE_BOOTSTRAP_ERROR,
  RECEIVE_BOOTSTRAP_SUCCESS,
  SET_IFRAME_MODE
} from "./actions";
import { MAP_BACKGROUNDS } from "./config";

import { makeReducer } from "lizard-api-client";

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

function iframeMode(state = { active: null, baseTileId: null }, action) {
  switch (action.type) {
    case SET_IFRAME_MODE:
      if (state.active === null) {
        console.log("[!] Initializing iframeMode.active: null =>", action.bool);
        return { ...state, active: action.bool };
      }
      return state;
    case RECEIVE_BOOTSTRAP_SUCCESS:
      if (state.baseTileId === null) {
        const baseTileId = action.bootstrap.configuration.iframeBaseTileId;
        console.log(
          "[!] Initializing iframeMode.baseTileId: null =>",
          baseTileId
        );
        return { ...state, baseTileId };
      }
      return state;
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

function timeseriesEvents(state = {}, action) {
  let newState;
  switch (action.type) {
    case FETCH_TIMESERIES_EVENTS:
      newState = { ...state };
      newState[action.uuid] = {
        isFetching: true,
        start: action.start,
        end: action.end,
        events: null
      };
      return newState;
    case RECEIVE_TIMESERIES_EVENTS:
      newState = { ...state };
      newState[action.uuid] = {
        isFetching: false,
        start: action.start,
        end: action.end,
        events: action.events
      };
      return newState;
    default:
      return state;
  }
}

function rasterEvents(state = {}, action) {
  let newState;
  let eventsForRaster = {};

  switch (action.type) {
    case FETCH_RASTER_EVENTS:
      newState = { ...state };
      if (newState[action.uuid]) {
        eventsForRaster = { ...newState[action.uuid] };
      }
      eventsForRaster[action.geomKey] = {
        isFetching: true,
        start: action.start,
        end: action.end,
        events: null
      };
      newState[action.uuid] = eventsForRaster;
      return newState;
    case RECEIVE_RASTER_EVENTS:
      newState = { ...state };
      if (newState[action.uuid]) {
        eventsForRaster = { ...newState[action.uuid] };
      }
      eventsForRaster[action.geomKey] = {
        isFetching: false,
        start: action.start,
        end: action.end,
        events: action.events
      };
      newState[action.uuid] = eventsForRaster;
      return newState;
    default:
      return state;
  }
}

function settings(
  state = {
    configuredDate: null,
    configuredTime: null,
    nowDateTime: new Date().toISOString(),
    mapBackground: MAP_BACKGROUNDS[1]
  },
  action
) {
  switch (action.type) {
    case SET_NOW:
      console.log("SETTING DATETIME TO", action.data.dateTime);
      return {
        ...state,
        nowDateTime: action.data.dateTime
      };

    case SET_DATE:
      return {
        ...state,
        configuredDate: action.date
      };
    case SET_TIME:
      return {
        ...state,
        configuredTime: action.time
      };
    case RESET_DATETIME:
      return {
        ...state,
        configuredDate: null,
        configuredTime: null
      };
    case SET_MAP_BACKGROUND:
      return { ...state, mapBackground: action.mapBackground };
    default:
      return state;
  }
}

function alarms(
  state = {
    data: [],
    rasterData: [],
    timeseriesData: []
  },
  action
) {
  const isActive = alarm => alarm.active;

  switch (action.type) {
    case RECEIVE_ALARMS:
      // We received either raster or timeseries alarms; combine them both into one
      // 'data' array.
      const newState = { ...state };
      if (action.isTimeseries) {
        newState.timeseriesData = action.alarms
          ? action.alarms.filter(isActive)
          : [];
      } else {
        newState.rasterData = action.alarms
          ? action.alarms.filter(isActive)
          : [];
      }

      newState.data = newState.timeseriesData.concat(newState.rasterData);
      return newState;

    default:
      return state;
  }
}

const rootReducer = combineReducers({
  alarms,
  assets,
  legends,
  rasters: makeReducer("rasters"),
  session,
  timeseries,
  timeseriesEvents,
  rasterEvents,
  settings,
  iframeMode
});

export default rootReducer;

// Selectors
// See https://gist.github.com/abhiaiyer91/aaf6e325cf7fc5fd5ebc70192a1fa170

export const getBootstrap = function(state) {
  if (!state.session || !state.session.hasBootstrap) return null;
  return state.session.bootstrap;
};

const getConfiguration = function(state) {
  const bootstrap = getBootstrap(state);
  if (bootstrap && bootstrap.configuration) {
    return bootstrap.configuration;
  } else {
    return null;
  }
};

export const getAllTiles = function(state) {
  const configuration = getConfiguration(state);
  if (configuration)
    if (state.iframeMode.active) {
      if (configuration.publicTiles) return configuration.publicTiles;
    } else {
      if (configuration.tiles) return configuration.tiles;
    }
  return [];
};

export const getReferenceLevels = function(state) {
  const configuration = getConfiguration(state);
  if (configuration && configuration.referenceLevels) {
    return configuration.referenceLevels;
  } else {
    return {};
  }
};

export const getTileById = function(state, id) {
  return getAllTiles(state).filter(tile => {
    if (Number(tile.id) === Number(id)) return tile;
    return false;
  });
};

export const getNow = function(state) {
  // Return a *string* containing the current UTC date/time.
  // This is not the "real" current time, but either a time configured
  // by the user, or the time updated by the main App component.
  // Use a string instead of a datetime so React can see that it hasn't
  // changed.

  if (state.settings.configuredDate && state.settings.configuredTime) {
    return (
      state.settings.configuredDate + "T" + state.settings.configuredTime + "Z"
    );
  } else {
    return state.settings.nowDateTime;
  }
};

// These two are for the settings page only
export const getConfiguredDate = function(state) {
  return state.settings.configuredDate || "";
};

export const getConfiguredTime = function(state) {
  return state.settings.configuredTime || "";
};

export const getCurrentMapBackground = function(state) {
  return state.settings.mapBackground;
};
