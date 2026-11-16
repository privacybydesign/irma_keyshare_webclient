import React from 'react';
import { createRoot } from 'react-dom/client';
import { Provider } from 'react-redux';

import buildStore from './store';
import App from './app';
import i18n from './i18n';
import { installHashLoginHandler } from './urlhash';
import './index.scss';

const container = document.getElementById('root');
if (!container) throw new Error('root element not found');
const root = createRoot(container);
const store = buildStore();

installHashLoginHandler(store.dispatch, () => store.getState().login.sessionState);

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
