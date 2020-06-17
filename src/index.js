import React from 'react';
import ReactDOM from 'react-dom';
import { Provider } from 'react-redux';

import buildStore from './store';
import App from './app';
import './i18n';
import './index.css';

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
      <App context={context}/>
    </Provider>
  </React.StrictMode>,
  document.getElementById('root')
);
