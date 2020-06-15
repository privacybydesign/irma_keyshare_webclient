import React from 'react';
import ReactDOM from 'react-dom';
import { Provider } from 'react-redux';
import globalThis from 'core-js/internals/global';
import {ThemeProvider, CssBaseline} from '@material-ui/core';

import buildStore from './store';
import App from './app';
import './i18n';
import './index.css';
import theme from './theme';

// TODO: Put in config file
globalThis.server = 'http://localhost:8080';

const store = buildStore();
const context = React.createContext();

const fragment = window.location.hash
if (fragment.startsWith('#token=')) {
  const token = fragment.substr(7);
  store.dispatch({type: 'startTokenLogin', token: token});
} else if (fragment.startsWith('#verify=')) {
  const token = fragment.substr(8);
  store.dispatch({type: 'startRegistrationVerify', token: token});
} else {
  store.dispatch({type: 'verifySession'});
}

ReactDOM.render(
  <React.StrictMode>
    <Provider store={store} context={context}>
      <ThemeProvider theme={theme}>
        <CssBaseline />
        <App context={context}/>
      </ThemeProvider>
    </Provider>
  </React.StrictMode>,
  document.getElementById('root')
);
