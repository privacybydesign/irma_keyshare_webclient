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
    const token = fragment.slice(7);
    if (token) store.dispatch({ type: 'startTokenLogin', token });
    else store.dispatch({ type: 'verifySession' });
  } else if (fragment.startsWith('#verify=')) {
    const token = fragment.slice(8);
    if (token) store.dispatch({ type: 'startRegistrationVerify', token });
    else store.dispatch({ type: 'verifySession' });
  } else {
    store.dispatch({ type: 'verifySession' });
  }
}

window.addEventListener('hashchange', checkUrlHash);
checkUrlHash();

document.documentElement.setAttribute('lang', i18n.language);

const refreshDocumentTitle = () => {
  document.title = i18n.t('app:title');
};
refreshDocumentTitle();
i18n.on('languageChanged', refreshDocumentTitle);

root.render(
  <React.StrictMode>
    <Provider store={store}>
      <App />
    </Provider>
  </React.StrictMode>,
);
