import React, { Component } from "react";
import styles from "./ExternalTile.css";

class ExternalTileComponent extends Component {
  render() {
    const { isFull, tile, width, height } = this.props;

    if (isFull) {
      return this.renderImageFull(tile.title, tile.imageUrl, width, height);
    } else {
      return this.renderImageTiled(tile.title, tile.imageUrl);
    }
  }

  renderImageFull(title, imageUrl, width, height) {
    return (
      <div style={{ width, height, display: "flex" }}>
        <div className={styles.externalImageFull}>
          <img src={imageUrl} alt={title} />
        </div>
      </div>
    );
  }

  renderImageTiled(title, imageUrl) {
    return (
      <div className={styles.externalWrapper}>
        <img src={imageUrl} alt={title} className={styles.externalImage} />
      </div>
    );
  }
}

export default ExternalTileComponent;
