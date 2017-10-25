import { DateTime } from "lizard-api-client";
import { BoundingBox } from "./util/bounds";

export const THE_TILES = [
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
    ],
    colors: ["#26A7F1", "#000058"]
  },
  {
    id: 5,
    title: "Alarms triggered",
    type: "statistics"
  }
];
