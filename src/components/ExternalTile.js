import React, { Component } from "react";
import styles from "./ExternalTile.css";

class ExternalTileComponent extends Component {
  render() {
    const { isFull, tile, width, height } = this.props;

    if (isFull) {
      return this.renderIframe(tile.title, tile.url, width, height);
    } else {
      return this.renderImage(tile.title, tile.imageUrl);
    }
  }

  renderIframe(title, url, width, height) {
    const { showingBar } = this.props;

    return (
      <iframe
        title="externalTile"
        referrerPolicy="no-referrer"
        src={url}
        className={styles.externalIframe}
        width={width}
        height={height}
        style={{
          left: showingBar ? 205 : 0
        }}
      />
    );
  }

  renderImage(title, imageUrl) {
    return (
      <div className={styles.externalWrapper}>
        <img src={imageUrl} alt={title} className={styles.externalImage} />
      </div>
    );
  }
}

export default ExternalTileComponent;
