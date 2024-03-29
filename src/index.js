import React from 'react';
import { createRoot } from 'react-dom/client';
import { Provider } from 'react-redux';

import buildStore from './store';
import App from './app';
import i18n from './i18n';
import './index.scss';

const container = document.getElementById('root');
const root = createRoot(container);
const store = buildStore();

function checkUrlHash() {
  const fragment = window.location.hash;
  if (fragment.startsWith('#token=')) {
    const token = fragment.substr(7);
    store.dispatch({ type: 'startTokenLogin', token });
  } else if (fragment.startsWith('#verify=')) {
    const token = fragment.substr(8);
    store.dispatch({ type: 'startRegistrationVerify', token });
  } else {
    store.dispatch({ type: 'verifySession' });
  }
}

window.addEventListener('hashchange', checkUrlHash);
checkUrlHash();

document.documentElement.setAttribute('lang', window.config.lang);
document.title = i18n.t('app:title');

root.render(
  <React.StrictMode>
    <Provider store={store}>
      <App />
    </Provider>
  </React.StrictMode>
);
