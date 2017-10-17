import React from "react";
import ReactDOM from "react-dom";
import { Provider } from "react-redux";
import { IntlProvider } from "react-intl";
import configureStore from "./configureStore";
import TermsOrLoginOrApp from "./TermsOrLoginOrApp";
import registerServiceWorker from "./registerServiceWorker";

let store = configureStore();

const Root = ({ store }) => (
  <IntlProvider locale={navigator.language} messages={{}}>
    <Provider store={store}>
      <TermsOrLoginOrApp />
    </Provider>
  </IntlProvider>
);

ReactDOM.render(<Root store={store} />, document.getElementById("root"));
registerServiceWorker();

if (module.hot) {
  module.hot.accept("./TermsOrLoginOrApp", () => {
    const HotApp = require("./TermsOrLoginOrApp").default;
    ReactDOM.render(
      <IntlProvider locale={navigator.language} messages={{}}>
        <Provider store={store}>
          <HotApp />
        </Provider>
      </IntlProvider>,
      document.getElementById("root")
    );
  });
}
