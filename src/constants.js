import { DateTime } from "lizard-api-client";

/*
   Variable THE_TILES defines the tiles to show.

   Fields all tiles can have:
   - viewInLizardLink: link to go to by the "View in Lizard" link in the topright corner

   The types we have now:

   Raster tile
   ===========

   Looks like:

   {
   id: 1,
   title: "DEM Sydney",
   type: "raster",
   rasters: [
   {
   uuid: "eae92c48",
   opacity: 0.5
   }
   ],
   viewInLizardLink: "" // As in every tile, an optional link to a favourite or other
   },

   Optionally a datetime field for raster timeseries:

   datetime: new DateTime({
   type: "relative",
   to: "now",
   offset: 3 * 60 * 60 // 3 hours after end of series
   }),

   "end" means the end of the timeseries; it can also be relative to "now" or "start",
   or be absolute.

   Optionally a bbox field to show where to open the map:

   bbox: [
   149.22454833984378, // westmost
   -34.94448806230625, // southmost
   152.80883789062503, // eastmost
   -32.699488680852674 // northmost
   ],

   Assets map
   ==========

   Shows all assets of a specific type.

   {
   id: 2,
   title: "Measuring stations",
   type: "assets",
   assetTypes: ["measuringstation"]
   },

   Can also take a bbox field.

   Statistics
   ==========

   {
   id: 3,
   title: "Breached thresholds",
   type: "statistics"
   },

   Shows statistics on all configured alarms.

   Timeseries
   ==========

   {
   id: 4,
   title: "Timeseries",
   type: "timeseries",
   period: [
   new DateTime({
   type: "relative",
   to: "now",
   offset: -3 * 24 * 3600
   }),
   new DateTime({
   type: "relative",
   to: "now",
   offset: 6 * 3600
   })
   ],
   timeseries: [
   "34b144a0-7849-4e3f-aaa8-b0fffc86abbf",
   "48d39158-b98e-4267-bd7e-a73fabec53c9"
   ],
   colors: ["#26A7F1", "#000058"]
   },

   If 'colors' is empty, default colors are used.

   External tile
   =============

   A tile that links to something external (like a meteo service).

   It has two elements besides the title, an image to use in the small tile
   and an URL to load in an *iframe* in the full tile.

   {
   id: 4,
   title: 'An iframe tile',
   imageUrl: 'http://url-to-image.gif',
   url: 'http://www.nelen-schuurmans.nl'
   }
 */

/* These are not configurable per tile anymore */
const CHART_START_TIME = new DateTime({
  type: "relative",
  to: "now",
  offset: -10 * 24 * 3600,
  modulo: 300 // Round down to nearest 5 minutes
});

const CHART_END_TIME = new DateTime({
  type: "relative",
  to: "now",
  offset: 24 * 3600,
  modulo: 300 // Round down to nearest 5 minutes
});

export const CHART_PERIOD = [CHART_START_TIME, CHART_END_TIME];
