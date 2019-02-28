import { combineReducers } from "redux";
import {
  ADD_ASSET,
  ADD_LEGEND,
  ADD_TIMESERIES,
  FETCH_TIMESERIES_EVENTS,
  RECEIVE_TIMESERIES_EVENTS,
  FETCH_RASTER_EVENTS,
  RECEIVE_RASTER_EVENTS,
  SET_DATE_TIME,
  SET_DATE,
  SET_TIME,
  SET_DATE_TIME_STATIC,
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
    nowDate: null,
    nowTime: null,
    dateTimeStatic: false,
    mapBackground: MAP_BACKGROUNDS[1]
  },
  action
) {
  switch (action.type) {
    // the case SET_DATE_TIME_STATIC case is for now not used, but instead done via other existing actions
    // anyway it may be used for training module. otherwise it should be removed.
    case SET_DATE_TIME_STATIC:
      return {
        ...state,
        dateTimeStatic: action.data
      };
    case SET_DATE_TIME:
      // only update date time is this is not static
      // date time is static if the user configured a static date time through settings
      if (state.dateTimeStatic === true) {
        return state;
      } else {
        return {
          ...state,
          configuredDate: action.data.date,
          configuredTime: action.data.time,
          nowDate: action.data.date,
          nowTime: action.data.time
        };
      }

    case SET_DATE:
      return {
        ...state,
        configuredDate: action.date,
        dateTimeStatic: true
      };
    case SET_TIME:
      return {
        ...state,
        configuredTime: action.time,
        dateTimeStatic: true
      };
    case RESET_DATETIME:
      return {
        ...state,
        configuredDate: null,
        configuredTime: null,
        dateTimeStatic: false
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

export const getConfiguredDate = function(state) {
  return state.settings.configuredDate || "";
};

export const getConfiguredTime = function(state) {
  return state.settings.configuredTime || "";
};

const _getCurrentDate = function() {
  return new Date().toISOString().split("T")[0];
};

const _getCurrentTime = function() {
  const isoTimeStr = new Date().toISOString().split("T")[1];
  return isoTimeStr.slice(0, isoTimeStr.length - 1);
};

export const getConfiguredDateTime = function(state) {
  let dateResult, timeResult;

  if (!state.settings.configuredDate && !state.settings.configuredTime) {
    return null;
  } else if (!state.settings.configuredDate && state.settings.configuredTime) {
    dateResult = _getCurrentDate();
    timeResult = state.settings.configuredTime;
  } else if (state.settings.configuredDate && !state.settings.configuredTime) {
    dateResult = state.settings.configuredDate;
    timeResult = _getCurrentTime();
  } else {
    dateResult = state.settings.configuredDate;
    timeResult = state.settings.configuredTime;
  }

  const resultISOString = dateResult + "T" + timeResult + "Z";
  return new Date(resultISOString);
};

export const getConfiguredNow = function(state) {
  // Usually the current date/time, but sometimes a different one is configured
  const configured = getConfiguredDateTime(state);
  return configured || null;
};

export const getCurrentMapBackground = function(state) {
  return state.settings.mapBackground;
};
