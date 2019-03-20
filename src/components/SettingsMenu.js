import React, { Component } from "react";
import DocumentTitle from "react-document-title";
import { connect } from "react-redux";
import { withRouter } from "react-router-dom";
import logoCombo from "../graphics/logo-combo.png";
import styles from "./SettingsMenu.css";
import DateTimeMenu from "./settingsmenus/DateTimeMenu";
import MapSettingsMenu from "./settingsmenus/MapSettingsMenu";
import ContactMenu from "./settingsmenus/ContactMenu";
import TrainingsMenu from "./settingsmenus/TrainingsMenu";
import { hasTrainingDashboards } from "../reducers";

import debounce from "lodash/debounce";

class SettingsMenuTitle extends Component {
  render() {
    const { icon, title, active, setSettingsMenu } = this.props;

    return (
      <div className={styles.SettingsMenuItem} onClick={setSettingsMenu}>
        <i className="material-icons">{icon}</i>
        <span className={`${active ? styles.ActiveMenu : null}`}>{title}</span>
      </div>
    );
  }
}

class SettingsMenu extends Component {
  constructor(props) {
    super(props);
    this.state = {
      settingsMenuId: 0
    };
    this.handleKeyPress = this.handleKeyPress.bind(this);
    this.setSettingsMenu = this.setSettingsMenu.bind(this);
  }
  componentDidMount() {
    document.addEventListener("keydown", debounce(this.handleKeyPress), false);
  }
  componentWillUnMount() {
    document.removeEventListener("keydown", this.handleKeyPress, false);
  }
  handleKeyPress(e) {
    if (e.key === "Escape" || e.keyCode === 27) {
      this.props.closeSettingsMenu();
    }
  }

  setSettingsMenu(menuId) {
    this.setState({ settingsMenuId: menuId });
  }

  render() {
    const { settingsMenuId } = this.state;
    const { height } = this.props;

    return (
      <DocumentTitle title="Parramatta | Dashboard | Settings">
        <div className={styles.SettingsMenu} style={{ height: height }}>
          <img
            src={logoCombo}
            alt="Parramatta dashboard"
            className={styles.HeaderImage}
          />
          <div
            className={styles.CloseSettings}
            onClick={() => this.props.closeSettingsMenu()}
          >
            <i className="material-icons">close</i>
          </div>
          <div className={styles.SettingsMenuItemsWrapper}>
            <SettingsMenuTitle
              icon="access_time"
              title="Date/time settings"
              active={settingsMenuId === 0}
              setSettingsMenu={() => this.setSettingsMenu(0)}
            />

            <SettingsMenuTitle
              icon="layers"
              title="Background layers"
              active={settingsMenuId === 1}
              setSettingsMenu={() => this.setSettingsMenu(1)}
            />

            <SettingsMenuTitle
              icon="copyright"
              title="Contact"
              active={settingsMenuId === 2}
              setSettingsMenu={() => this.setSettingsMenu(2)}
            />

            {this.props.hasTrainingsDashboards ? (
              <SettingsMenuTitle
                icon="school"
                title="Training"
                active={settingsMenuId === 3}
                setSettingsMenu={() => this.setSettingsMenu(3)}
              />
            ) : null}
          </div>
          <main style={{ height: height - 100 }}>
            {settingsMenuId === 0 ? (
              <DateTimeMenu closeSettingsMenu={this.props.closeSettingsMenu} />
            ) : null}
            {settingsMenuId === 1 ? (
              <MapSettingsMenu
                closeSettingsMenu={this.props.closeSettingsMenu}
              />
            ) : null}
            {settingsMenuId === 2 ? <ContactMenu /> : null}
            {settingsMenuId === 3 ? <TrainingsMenu /> : null}
          </main>
        </div>
      </DocumentTitle>
    );
  }
}

const mapStateToProps = (state, ownProps) => {
  return {
    hasTrainingsDashboards: hasTrainingDashboards(state)
  };
};

export default withRouter(connect(mapStateToProps)(SettingsMenu));
