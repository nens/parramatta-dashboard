// Helper code for bounds and bounding boxes.

import { LatLngBounds } from "leaflet";

export class BoundingBox {
  constructor(westmost, southmost, eastmost, northmost) {
    this.westmost = westmost;
    this.southmost = southmost;
    this.eastmost = eastmost;
    this.northmost = northmost;
  }

  toLeafletArray() {
    return [[this.southmost, this.westmost], [this.northmost, this.eastmost]];
  }

  toLeafletBounds() {
    return new LatLngBounds(this.toLeafletArray());
  }

  toLizardBbox() {
    return [this.westmost, this.southmost, this.eastmost, this.northmost].join(
      ","
    );
  }
}

export function isSamePoint(a, b) {
  return (
    a.type === "Point" &&
    b.type === "Point" &&
    a.coordinates &&
    a.coordinates.length >= 2 &&
    b.coordinates &&
    b.coordinates.length >= 2 &&
    a.coordinates[0] == b.coordinates[0] &&
    a.coordinates[1] == b.coordinates[1]
  );
}
