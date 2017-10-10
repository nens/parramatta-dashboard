import { combineReducers } from "redux";
import { BoundingBox } from "./util/bounds";
import { DateTime } from "lizard-api-client";
import omit from "lodash/omit";
import {
  ADD_ASSET,
  ADD_LEGEND,
  ADD_TILE,
  ADD_TIMESERIES,
  CLOSE_TILE,
  FETCH_BOOTSTRAP,
  FETCH_LEGEND,
  FETCH_RASTER,
  RECEIVE_BOOTSTRAP_ERROR,
  RECEIVE_BOOTSTRAP_SUCCESS,
  RECEIVE_RASTER,
  REMOVE_RASTER,
  SELECT_TILE
} from "./actions";

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

function tiles(
  state = [
    {
      id: 1,
      title: "DEM Sydney",
      type: "raster",
      rasters: [
        {
          uuid: "eae92c48",
          opacity: 0.5
        }
      ]
    },
    {
      id: 2,
      title: "Water depth",
      type: "raster",
      rasters: [
        {
          uuid: "a8472933-0a9d-44c2-b74a-a72614d9be2b",
          opacity: 0.5
        }
      ],
      bbox: new BoundingBox(
        149.22454833984378, // westmost
        -34.94448806230625, // southmost
        152.80883789062503, // eastmost
        -32.699488680852674 // northmost
      ),
      datetime: new DateTime({
        type: "relative",
        to: "end",
        offset: 3 * 60 * 60 // 3 hours before end of series
      })
    },
    {
      id: 3,
      title: "Measuring stations",
      type: "assets",
      assetTypes: ["measuringstation"]
    },
    {
      id: 4,
      title: "Timeseries",
      type: "timeseries",
      period: [
        new DateTime({
          type: "relative",
          to: "end",
          offset: -3 * 24 * 3600
        }),
        new DateTime({
          type: "relative",
          to: "end",
          offset: 6 * 3600
        })
      ],
      timeseries: [
        "34b144a0-7849-4e3f-aaa8-b0fffc86abbf",
        "48d39158-b98e-4267-bd7e-a73fabec53c9"
      ]
    },
    {
      id: 5,
      title: "Alarms triggered",
      type: "statistics",
      number: 2
    }
  ],
  action
) {
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
    tileKeys: [],
    currentTile: null
  },
  action
) {
  let newState;
  switch (action.type) {
    case ADD_TILE:
      // Add tile key to tileKeys
      if (state.tileKeys.indexOf(action.tileKey) === -1) {
        let newState = { ...state };
        let newTileKeys = state.tileKeys.slice();
        newTileKeys.push(action.tileKey);
        newState.tileKeys = newTileKeys;
        return newState;
      } else {
        return state;
      }
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

const rootReducer = combineReducers({
  assets,
  legends,
  rasters,
  session,
  tiles,
  timeseries,
  ui
});

export default rootReducer;
