import React from 'react';
import ReactDOM from 'react-dom';
import './index.css';

import buildStore from './store';

store = buildStore()

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
  </React.StrictMode>,
  document.getElementById('root')
);
