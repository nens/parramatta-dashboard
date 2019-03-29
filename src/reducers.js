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
  SET_DATETIME,
  RESET_DATETIME,
  SET_MAP_BACKGROUND,
  RECEIVE_ALARMS,
  FETCH_BOOTSTRAP,
  FETCH_LEGEND,
  RECEIVE_BOOTSTRAP_ERROR,
  RECEIVE_BOOTSTRAP_SUCCESS,
  SET_IFRAME_MODE
} from "./actions";
import { fakeDataReducer } from "./fakeData";
import { MAP_BACKGROUNDS } from "./config";

import { makeReducer } from "lizard-api-client";

// We keep track of offsets as hours to add to UTC, so
// UTC+10:00 is 10. The browser reports minutes to subtract
// from the local time to get to UTC, so UTC+10:00 is -600.
// Convert here.
const TIMEZONE_OFFSET = -(new Date().getTimezoneOffset() / 60);

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
    configuredDateTime: null, // "DD-MM-YYYYTHH:MMZ" *in UTC*
    nowDateTime: new Date().toISOString(),
    mapBackground: MAP_BACKGROUNDS[1],
    chosenTimezone: "browser" // Used by datetime settings page
  },
  action
) {
  switch (action.type) {
    case SET_NOW:
      return {
        ...state,
        nowDateTime: action.data.dateTime
      };

    case SET_DATETIME:
      return {
        ...state,
        configuredDateTime: action.dateTime,
        chosenTimezone: action.timezone
      };
    case RESET_DATETIME:
      return {
        ...state,
        configuredDateTime: null,
        chosenTimezone: "browser"
      };
    case SET_MAP_BACKGROUND:
      return { ...state, mapBackground: action.mapBackground };
    case RECEIVE_BOOTSTRAP_SUCCESS:
      if (action.bootstrap.configuration.nowDateTimeUTC) {
        // Update configured date and time from bootstrap.
        return {
          ...state,
          configuredDateTime: action.bootstrap.configuration.nowDateTimeUTC
        };
      } else {
        return state;
      }
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

// Fake Data for the training modes.

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
  iframeMode,
  fakeData: fakeDataReducer
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

  return state.settings.configuredDateTime || state.settings.nowDateTime;
};

// These two are for the settings pages only
export const hasConfiguredDateTime = function(state) {
  return !!state.settings.configuredDateTime;
};

export const disableDateTimeSettings = function(state) {
  // If configured time and state were set in the configuration,
  // do not allow changing or resetting it.
  return !!state.session.bootstrap.configuration.nowDateTimeUTC;
};

export const getChosenTimezone = function(state) {
  return state.settings.chosenTimezone;
};

export const getTimezones = function(state) {
  let timezones = [["browser", "Browser", TIMEZONE_OFFSET]];
  const configuration = getConfiguration(state);

  // Add configured timezones in the middle.
  if (configuration && configuration.timezones) {
    state.session.bootstrap.configuration.timezones.forEach(tz => {
      timezones.push(tz);
    });
  }

  timezones.push(["utc", "UTC", 0]);
  return timezones;
};

export const getCurrentMapBackground = function(state) {
  return state.settings.mapBackground;
};

// Trainings page in the settings

export const hasTrainingDashboards = function(state) {
  const configuration = getConfiguration(state);
  return (
    configuration &&
    configuration.trainingDashboards &&
    configuration.trainingDashboards.length > 0
  );
};

export const trainingDashboards = function(state) {
  if (hasTrainingDashboards(state)) {
    return getConfiguration(state).trainingDashboards;
  } else {
    return [];
  }
};

// Misc

export const getDashboardTitle = function(state) {
  const configuration = getConfiguration(state);

  if (configuration && configuration.dashboardTitle) {
    return configuration.dashboardTitle;
  } else {
    return "FloodSmart Parramatta Dashboard";
  }
};
