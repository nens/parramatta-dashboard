// Various constants that could be configured. NB! This is parramatta specific!

import { BoundingBox } from "./util/bounds";

export const MOBILE_BREAKPOINT = 700;

// A parramatta bbox.
export const BOUNDS = new BoundingBox(
  150.9476776123047, // westmost
  -33.87831497192377, // southmost
  151.0842590332031, // eastmost
  -33.76800155639643 // northmost
);

// If the screen is wider than this many pixels, we still only get
// this many data points for speed purposes.
export const MAX_TIMESERIES_POINTS = 320;

// see default public token at https://account.mapbox.com/
const mapBoxAccesToken =
  "pk.eyJ1IjoibmVsZW5zY2h1dXJtYW5zIiwiYSI6ImhkXzhTdXcifQ.3k2-KAxQdyl5bILh_FioCw";

export const MAP_BACKGROUNDS = [
  {
    description: "Labelled Satellite Map",
    url: `https://api.mapbox.com/styles/v1/nelenschuurmans/ck8oabi090nys1imfdxgb6nv3/tiles/256/{z}/{x}/{y}@2x?access_token=${mapBoxAccesToken}`
  },
  {
    description: "Topographical Map",
    url: `https://api.mapbox.com/styles/v1/nelenschuurmans/ck8sgpk8h25ql1io2ccnueuj6/tiles/256/{z}/{x}/{y}@2x?access_token=${mapBoxAccesToken}`
  }
];
