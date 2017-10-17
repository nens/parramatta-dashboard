import React, { Component } from "react";
import styles from "./StatisticsTile.css";

class StatisticsTile extends Component {
  constructor(props) {
    super(props);
    this.state = {
      width: null,
      height: null
    };
  }
  componentDidMount() {
    this.setState({
      width: this.myInput.offsetWidth,
      height: this.myInput.offsetHeight
    })
  }
  render() {
    const { title, number } = this.props;
    const { width } = this.state;
    return (
      <div
        ref={input => {this.myInput = input}}
        className={styles.StatisticsTile}
      >
        <div>
          <p>{number}</p>
          {width > 200 ? <span>{title}</span> : null}
        </div>
      </div>
    );
  }
}

export default StatisticsTile;
