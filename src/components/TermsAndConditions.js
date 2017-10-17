import React, { Component } from "react";
import { connect } from "react-redux";

import styles from "./TermsAndConditions.css";

class TermsAndConditionsComponent extends Component {
  constructor() {
    super();
    this.state = {
      boxChecked: false
    };
  }

  render() {
    return (
      <div className={styles.terms}>
        <h1 className={styles.header}>
          Parramatta River Flood Information System Hub
        </h1>
        <h1 className={styles.header}>(FISH)</h1>
        <h1 className={styles.header}>Terms and Conditions</h1>
        <p>
          Use of the Parramatta River Flood Information System Hub (FISH System)
          is subject to the terms and conditions set out below. If you proceed
          to use the FISH System, your use will be taken as acceptance of these
          terms and conditions.
        </p>
        <ol>
          <li>
            The FISH System is provided by City of Parramatta Council (Council),
            as part of a collaborative project between Council, Sydney Water
            Corporation, State Emergency Services, Office for Environment and
            Heritage, Bureau of Meteorology and Greater Sydney Local Land
            Services (together the Project Group).
          </li>
          <li>
            The FISH System intends to provide catchment, river and rain gauge,
            modelling and forecast data for information during a flood event.
            The FISH System will also provide automated alerts to warn of
            potential flood risk.{" "}
          </li>
          <li>
            While Council will use reasonable endeavours to ensure that the data
            is provided at the earliest opportunity and is fit for purpose, the
            FISH System relies on third party data and predicts future events
            therefore reliability cannot be guaranteed. Use of the data
            contained in the FISH System for incident response is at the user’s
            own risk.
          </li>
          <li>
            As the FISH System is subject to naturally occurring events, the
            Project Group does not warrant the accuracy and completeness of the
            information. The FISH System should not be solely relied upon. You
            are responsible for verifying the information provided by the FISH
            System and making your own independent assessment of the risks.
          </li>
          <li>
            While Council will use reasonable endeavours to ensure that any FISH
            System alerts are provided to you at the earliest opportunity, the
            FISH System relies on telecommunication networks to send alerts and
            the delivery of the alerts cannot be guaranteed.
          </li>
          <li>
            You acknowledge that you are using the FISH System and the data
            included within at your own risk. In consideration of you using the
            FISH System, you acknowledge and agree that the Project Group
            (including the respective directors, officers, employees and agents
            of each party in the Project Group) are not responsible (either
            jointly or severally) for any loss or damage suffered, incurred or
            sustained by you, in whatever nature and howsoever arising, in
            connection with the FISH System and to the extent permitted by law,
            you release each party in the Project Group in this respect
            (Release). This Release includes, but is not limited to, any loss or
            damage suffered, incurred or sustained by you arising from:
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
                arising in connection with FISH System.
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
            relating to your use of the FISH System that are not expressly
            outlined in these conditions.
          </li>
        </ol>

        <p>
          <input
            type="checkbox"
            id="termsCheck"
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

  toggleBox() {
    const checkbox = document.getElementById("termsCheck");
    this.setState({ boxChecked: checkbox.checked });
  }

  clickButton() {
    if (this.state.boxChecked) {
      this.props.termsSigned();
    }
  }
}

export const TermsAndConditions = connect(null, null)(
  TermsAndConditionsComponent
);
