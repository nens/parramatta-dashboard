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
   to: "now",
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

export const THE_TILES = [
  {
    id: 1,
    title: "Water depth",
    type: "raster",
    rasters: [
      {
        uuid: "fbf70418-51a3-4c5b-bcd8-45c468623f92",
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
      to: "now",
      offset: -3 * 60 * 60 // 3 hours before end of raster-store timeseries
    }),
    viewInLizardLink:
      "https://parramatta.lizard.net/en/map/topography,assetgroup$9c2d7b6,scenario$969e390,raster$969e6e1/point@-33.7916,150.9768,14/-3Days0Hours+3Days0Hours",
    wmsLayers: [
      {
        url:
          "https://geoserver9.lizard.net/geoserver/parramatta/wms?SERVICE=WMS&REQUEST=GetMap&VERSION=1.1.1",
        layers: "cadaster",
        format: "image/png",
        transparent: true,
        height: 256,
        width: 256,
        zindex: 1004,
        srs: "EPSG:3857"
      }
    ]
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
    assetTypes: ["measuringstation"],
    wmsLayers: [
      {
        url:
          "https://geoserver9.lizard.net/geoserver/parramatta/wms?SERVICE=WMS&REQUEST=GetMap&VERSION=1.1.1",
        layers: "gauges",
        format: "image/png",
        transparent: true,
        height: 256,
        width: 256,
        zindex: 1004,
        srs: "EPSG:3857"
      },
      {
        url:
          "https://geoserver9.lizard.net/geoserver/parramatta/wms?SERVICE=WMS&REQUEST=GetMap&VERSION=1.1.1",
        layers: "fwa",
        format: "image/png",
        transparent: true,
        height: 256,
        width: 256,
        zindex: 1003,
        srs: "EPSG:3857"
      }
    ]
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
    url: "http://www.bom.gov.au/nsw/flood/sydney.shtml",
    viewInLizardLink:
      "https://parramatta.lizard.net/en/map/topography,assetgroup$9c2d7b6,raster$dcf2f11,scenario$969e390,raster$969e6e1/point@-33.7973,150.9801,14/-0Days18Hours+2Days22Hours"
  },
  {
    id: 4,
    title: "Westmead and North Parramatta", //  Timeseries van station: Redbank Rd (Toongabbie Ck)
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
        offset: 16 * 3600
      })
    ],
    timeseries: ["935739d4-f33a-41b6-8d5d-f77ad799034e"], //"db99e1dd-01b2-4601-8c5f-b81873ba182b"],
    colors: ["#26A7F1", "#000058"],
    viewInLizardLink:
      "https://parramatta.lizard.net/favourites/e25d7c93-9052-42cf-86f2-8cb6645ae16e",
    rasterIntersections: [
      {
        uuid: "9ebca383-82cb-4c09-9534-8ed27bf4b9df",
        geometry: {
          type: "Point",
          coordinates: [150.99194, -33.79943, 0.0]
        }
      }
    ]
  },
  {
    id: 5,
    title: "Darling Mills Ck", // station name: North Parramatta (Darling Mills Ck)
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
        offset: 16 * 3600
      })
    ],
    timeseries: ["707b11ff-5331-4ba6-821e-673f2a715292"],
    rasterIntersections: [
      {
        uuid: "9ebca383-82cb-4c09-9534-8ed27bf4b9df",
        geometry: {
          type: "Point",
          coordinates: [151.0029, -33.811, 0.0]
        }
      }
    ],
    colors: ["#26A7F1", "#000058"]
  },
  {
    id: 6,
    title: "Johnstons Bridge (Toongabbie Ck)",
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
        offset: 16 * 3600
      })
    ],
    timeseries: ["34b144a0-7849-4e3f-aaa8-b0fffc86abbf"],
    colors: ["#26A7F1", "#000058"]
  },
  {
    id: 8,
    title: "Parramatta CBD", // Marsden Weir
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
        offset: 16 * 3600
      })
    ],
    timeseries: ["9eb37739-c2c9-4db7-a084-d2a1c744f36e"],
    colors: ["#26A7F1", "#000058"],
    viewInLizardLink:
      "https://parramatta.lizard.net/favourites/6f10234f-e6a3-4969-b64c-3e27dddca676",
    rasterIntersections: [
      {
        uuid: "9ebca383-82cb-4c09-9534-8ed27bf4b9df",
        geometry: {
          type: "Point",
          coordinates: [151.0029, -33.811, 0.0]
        }
      }
    ]
  },
  {
    id: 9,
    title: "Blacktown Ck (Int. Peace Park)",
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
        offset: 16 * 3600
      })
    ],
    timeseries: ["94630f07-7353-4d9e-89b0-0c692274af3e"],
    colors: ["#26A7F1", "#000058"]
  },
  {
    id: 10,
    title: "Lake Parramatta",
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
        offset: 16 * 3600
      })
    ],
    timeseries: [
      "e3e48d7a-4cb9-4361-9e6a-c3e6572a64e8",
      "3ef3cb28-2196-4649-9a26-730d3d3213fd"
    ],
    colors: ["#26A7F1", "#000058"],
    viewInLizardLink:
      "https://parramatta.lizard.net/favourites/51406619-b9f2-4eb4-bd6e-134cb1f36748",
    rasterIntersections: [
      {
        uuid: "9ebca383-82cb-4c09-9534-8ed27bf4b9df",
        geometry: {
          type: "Point",
          coordinates: [151.0062, -33.7924, 0.0]
        }
      }
    ]
  },
  {
    id: 7,
    title: "Loyalty Rd Basin (Darling Mills Ck)",
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
        offset: 16 * 3600
      })
    ],
    timeseries: ["3b00360a-8253-4ee9-9e8d-06c274a5f388"],
    colors: ["#26A7F1", "#000058"]
  }
];
