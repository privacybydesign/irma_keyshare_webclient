import React from 'react';
import { createRoot } from 'react-dom/client';
import { Provider } from 'react-redux';

import buildStore from './store';
import App from './app';
import i18n, { baseLanguage } from './i18n';
import './index.scss';

const container = document.getElementById('root');
const root = createRoot(container);
const store = buildStore();

function checkUrlHash() {
  const fragment = window.location.hash;
  if (fragment.startsWith('#token=')) {
    const token = fragment.slice(7);
    store.dispatch({ type: 'startTokenLogin', token });
  } else if (fragment.startsWith('#verify=')) {
    const token = fragment.slice(8);
    store.dispatch({ type: 'startRegistrationVerify', token });
  } else {
    store.dispatch({ type: 'verifySession' });
  }
}

window.addEventListener('hashchange', checkUrlHash);
checkUrlHash();

// Use i18n's resolved language rather than the raw window.config.lang so the
// DOM attribute agrees with i18next at first paint. They normally match, but
// if config.lang is unset/typo'd, i18next's `fallbackLng` kicks in and we'd
// otherwise advertise the wrong language to crawlers / pre-render AT.
// Subsequent updates to <html lang> happen in YiviAppBar's switcher (which
// also guards against the rapid double-click race).
document.documentElement.setAttribute('lang', baseLanguage(i18n));

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
