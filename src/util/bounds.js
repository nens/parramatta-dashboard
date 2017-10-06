// Helper code for bounds and bounding boxes.

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

  toLizardBbox() {
    return [this.westmost, this.southmost, this.eastmost, this.northmost].join(
      ","
    );
  }
}
