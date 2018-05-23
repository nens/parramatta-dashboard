import React, { Component } from "react";
import { connect } from "react-redux";

import styles from "./TermsAndConditions.css";
import { DEV_MODE_DOMAIN } from "../config.js";

class TermsAndConditionsComponent extends Component {
  constructor() {
    const APP_RUNS_IN_DEV_MODE =
      window.location.href.indexOf(DEV_MODE_DOMAIN) > -1;
    super();
    this.state = {
      boxChecked: APP_RUNS_IN_DEV_MODE,
      devMode: APP_RUNS_IN_DEV_MODE
    };
  }

  componentDidMount() {
    if (this.state.devMode) {
      console.log("[*] dev Environment: no need to check them checkb0xes...");
      const checkboxDOM = document.getElementById("termsCheckbox");
      checkboxDOM.checked = true;
      this.setState({ boxChecked: true });
      this.clickButton();
    }
  }

  toggleBox() {
    const checkbox = document.getElementById("termsCheckbox");
    this.setState({ boxChecked: checkbox.checked });
  }

  clickButton() {
    if (this.state.boxChecked) {
      // Scroll up -- otherwise we're going to a tiles page that may also be scrolled down
      document.body.scrollTop = document.documentElement.scrollTop = 0;
      this.props.termsSigned();
    }
  }

  render() {
    return (
      <div className={styles.terms}>
        <h1 className={styles.header}>
          FloodSmart Parramatta System Terms and Conditions
        </h1>
        <h1 className={styles.header}>(FloodSmart Parramatta System)</h1>
        <h1 className={styles.header}>Terms and Conditions</h1>
        <p>
          Use of the FloodSmart Parramatta System is subject to the terms and
          conditions set out below. If you proceed to use the FloodSmart
          Parramatta System, your use will be taken as acceptance of these terms
          and conditions.
        </p>
        <ol>
          <li>
            The FloodSmart Parramatta System is provided by City of Parramatta
            Council (Council), as part of a collaborative project between
            Council, Sydney Water Corporation, NSW State Emergency Services and
            Office for Environment and Heritage (together the Project Group).
          </li>
          <li>
            The FloodSmart Parramatta System intends to provide catchment, river
            and rain gauge, modelling and forecast data for information during a
            flood event. The FloodSmart Parramatta System will also provide
            automated alerts to warn of potential flood risk.
          </li>
          <li>
            While Council will use reasonable endeavours to ensure that the data
            is provided at the earliest opportunity and is fit for purpose, the
            FloodSmart Parramatta System relies on third party data and predicts
            future events therefore reliability cannot be guaranteed. Use of the
            data contained in the FloodSmart Parramatta System for incident
            response is at the user’s own risk.
          </li>
          <li>
            As the FloodSmart Parramatta System is subject to naturally
            occurring events, the Project Group does not warrant the accuracy
            and completeness of the information. The FloodSmart Parramatta
            System should not be solely relied upon. You are responsible for
            verifying the information provided by the FloodSmart Parramatta
            System and making your own independent assessment of the risks.
          </li>
          <li>
            While Council will use reasonable endeavours to ensure that any
            FloodSmart Parramatta System alerts are provided to you at the
            earliest opportunity, the FloodSmart Parramatta System relies on
            telecommunication networks to send alerts and the delivery of the
            alerts cannot be guaranteed.
          </li>
          <li>
            You acknowledge that you are using the FloodSmart Parramatta System
            and the data included within at your own risk. In consideration of
            you using the FloodSmart Parramatta System, you acknowledge and
            agree that the Project Group (including the respective directors,
            officers, employees and agents of each party in the Project Group)
            are not responsible (either jointly or severally) for any loss or
            damage suffered, incurred or sustained by you, in whatever nature
            and howsoever arising, in connection with the FloodSmart Parramatta
            System and to the extent permitted by law, you release each party in
            the Project Group in this respect (Release). This Release includes,
            but is not limited to, any loss or damage suffered, incurred or
            sustained by you arising from:
            <ol type="a">
              <li>inaccuracies, lack of, or delay in data provision;</li>
              <li>the delay and failure in warning you of an event;</li>
              <li>
                the interpretation of the magnitude or severity of an event;
              </li>
              <li>
                provision of an alert that warns of an event that fails to
                materialise;
              </li>
              <li>
                any inaccuracies in the predictions of the location of an event;
              </li>
              <li>
                any indirect, incidental, special and/or consequential losses or
                damages (including loss of profits, production, revenue,
                goodwill, data or opportunity) of whatever nature howsoever
                arising in connection with FloodSmart Parramatta System.
              </li>
            </ol>
          </li>
          <li>
            You expressly agree that the Release does not affect or limit
            s733(1) of the{" "}
            <span className={styles.law}>Local Government Act 1993</span> or the
            provisions of Part 5 of the{" "}
            <span className={styles.law}>Civil Liability Act 2002</span>.
          </li>
          <li>
            As permitted by law, Council excludes all conditions and warranties
            relating to your use of the FloodSmart Parramatta System that are
            not expressly outlined in these conditions.
          </li>
        </ol>

        <p>
          <input
            type="checkbox"
            id="termsCheckbox"
            value={this.state.boxChecked}
            onClick={this.toggleBox.bind(this)}
          />
          <strong>I accept these terms and conditions.</strong>
        </p>
        <p>
          <button
            id="termsSubmit"
            onClick={this.clickButton.bind(this)}
            disabled={!this.state.boxChecked}
          >
            SUBMIT
          </button>
        </p>
      </div>
    );
  }
}

export const TermsAndConditions = connect(null, null)(
  TermsAndConditionsComponent
);
