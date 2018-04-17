// Various constants that could be configured. NB! This is parramatta specific!

import { BoundingBox } from "./util/bounds";

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

export const MAP_BACKGROUNDS = [
  {
    description: "Labelled Satellite Map",
    url:
      "https://{s}.tiles.mapbox.com/v3/nelenschuurmans.iaa79205/{z}/{x}/{y}.png"
  },
  {
    description: "Topographical Map",
    url:
      "https://{s}.tiles.mapbox.com/v3/nelenschuurmans.iaa98k8k/{z}/{x}/{y}.png"
  }
];
