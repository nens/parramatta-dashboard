import { trainingDashboards } from "../../reducers";
import React, { Component } from "react";
import { connect } from "react-redux";
import { withRouter } from "react-router-dom";

class TrainingsMenu extends Component {
  render() {
    return (
      <div style={{ padding: 20 }}>
        <h4 style={{ padding: 0, margin: 0 }}>
          Choose another dashboard for training
        </h4>
        <hr />
        <p>Choose training dashboard</p>
        <select
          onChange={e => {
            const value = e.target.value;
            const url = "/floodsmart/" + value;
            window.location.href = url;
          }}
        >
          <option disabled selected value>
            {" "}
            -- select an option --{" "}
          </option>
          {this.props.trainingsDashboards.map(e => (
            <option key={e.url} value={e.url}>
              {e.name}
            </option>
          ))}
        </select>
      </div>
    );
  }
}

const mapStateToProps = (state, ownProps) => {
  return {
    trainingsDashboards: trainingDashboards(state)
  };
};

export default withRouter(connect(mapStateToProps)(TrainingsMenu));
