import React from 'react';
import ReactDOM from 'react-dom';
import { Provider } from "react-redux";
import { IntlProvider } from "react-intl";
import configureStore from "./configureStore";
import { BrowserRouter as Router } from "react-router-dom";
import App from './App';
import registerServiceWorker from './registerServiceWorker';

let store = configureStore();

const Root = ({ store }) => (
  <IntlProvider locale={navigator.language} messages={{}}>
    <Provider store={store}>
      <Router>
        <App />
      </Router>
    </Provider>
  </IntlProvider>
);

ReactDOM.render(<Root store={store} />, document.getElementById("root"));
registerServiceWorker();

if (module.hot) {
  module.hot.accept('./App', () => {
    const HotApp = require('./App').default;
    ReactDOM.render(
      <IntlProvider locale={navigator.language} messages={{}}>
        <Provider store={store}>
          <Router>
            <HotApp />
          </Router>
        </Provider>
      </IntlProvider>,
      document.getElementById("root")
    );
  });
}
