import { DateTime } from "lizard-api-client";
import { BoundingBox } from "./util/bounds";

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
   to: "end",
   offset: 3 * 60 * 60 // 3 hours after end of series
   }),

   "end" means the end of the timeseries; it can also be relative to "now" or "start",
   or be absolute.

   Optionally a bbox field to show where to open the map:

   bbox: new BoundingBox(
   149.22454833984378, // westmost
   -34.94448806230625, // southmost
   152.80883789062503, // eastmost
   -32.699488680852674 // northmost
   ),

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

export const THE_TILES = [
  {
    id: 1,
    title: "Water depth",
    type: "raster",
    rasters: [
      {
        uuid: "a8472933-0a9d-44c2-b74a-a72614d9be2b",
        opacity: 0.5
      }
    ],
    bbox: new BoundingBox(
      150.96240520477298, // westmost
      -33.81217200269498, // southmost
      151.03141307830813, // eastmost
      -33.78071682642826 // northmost
    ),
    datetime: new DateTime({
      type: "relative",
      to: "end",
      offset: 3 * 60 * 60 // 3 hours after end of series
    }),
    viewInLizardLink: "https://parramatta.lizard.net/"
  },
  {
    id: 2,
    title: "Measuring stations",
    type: "assets",
    bbox: new BoundingBox(
      150.96240520477298, // westmost
      -33.81217200269498, // southmost
      151.03141307830813, // eastmost
      -33.78071682642826 // northmost
    ),
    assetTypes: ["measuringstation"]
  },
  {
    id: 3,
    title: "Breached thresholds",
    type: "statistics"
  },
  {
    id: 11,
    title: "Rain",
    type: "external",
    imageUrl: "https://nationaleregenradar.nl/images/radar.gif",
    url: "http://www.bom.gov.au/nsw/forecasts/parramatta.shtml"
  },
  {
    id: 4,
    title: "Redbank Rd (Toongabbie Ck)",
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
    timeseries: ["db99e1dd-01b2-4601-8c5f-b81873ba182b"],
    colors: ["#26A7F1", "#000058"]
  },
  {
    id: 5,
    title: "North Parramatta (Darling Mills Ck)",
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
    timeseries: ["707b11ff-5331-4ba6-821e-673f2a715292"],
    colors: ["#26A7F1", "#000058"]
  },
  {
    id: 6,
    title: "Johnstons Bridge (Toongabbie Ck)",
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
    timeseries: ["34b144a0-7849-4e3f-aaa8-b0fffc86abbf"],
    colors: ["#26A7F1", "#000058"]
  },
  {
    id: 7,
    title: "Loyalty Rd Basin (Darling Mills Ck)",
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
    timeseries: ["3b00360a-8253-4ee9-9e8d-06c274a5f388"],
    colors: ["#26A7F1", "#000058"]
  },
  {
    id: 8,
    title: "Marsden Weir",
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
    timeseries: ["9eb37739-c2c9-4db7-a084-d2a1c744f36e"],
    colors: ["#26A7F1", "#000058"]
  },
  {
    id: 9,
    title: "Blacktown Ck (Int. Peace Park)",
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
    timeseries: ["94630f07-7353-4d9e-89b0-0c692274af3e"],
    colors: ["#26A7F1", "#000058"]
  },
  {
    id: 10,
    title: "Lake Parramatta Rain",
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
    timeseries: ["e3e48d7a-4cb9-4361-9e6a-c3e6572a64e8"],
    colors: ["#26A7F1", "#000058"]
  }
];
