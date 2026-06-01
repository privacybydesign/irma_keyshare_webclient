import React from 'react';
import { createRoot } from 'react-dom/client';
import { Provider } from 'react-redux';

import buildStore from './store';
import App from './app';
import i18n, { baseLanguage } from './i18n';
import './index.scss';

const container = document.getElementById('root');
const root = createRoot(container);

// Misconfigured-deploy guard. `public/config.js` ships with
// `server: 'http://localhost:8081'` as the local-dev template, and
// production deploys overwrite it via the k8s overlay. If the overlay
// step is forgotten / fails silently, the deployed bundle would talk to
// the user's own machine for every API call — a confusing, hard-to-
// reproduce failure mode. Fail loud at boot time when the served origin
// clearly isn't a dev origin but `config.server` still points at
// localhost, so the operator sees a blank page + console error instead
// of mystified support tickets. Dev origins (localhost, 127.0.0.1, file:)
// are exempt — they're the legitimate template-default use case.
const devOriginPatterns = [/^localhost$/i, /^127\.0\.0\.1$/, /^\[::1\]$/];
const isDevOrigin =
  window.location.protocol === 'file:' || devOriginPatterns.some((re) => re.test(window.location.hostname));
const serverLooksLocal = /(^|\/\/)(localhost|127\.0\.0\.1|\[::1\])(:|\/|$)/i.test(window.config?.server ?? '');
if (!isDevOrigin && serverLooksLocal) {
  const msg =
    `[config.js misconfigured] window.config.server is ${JSON.stringify(window.config?.server)} ` +
    `but the app is served from ${window.location.origin}. ` +
    `The deploy overlay almost certainly didn't run — check that /config.js is overwritten with the production backend URL.`;
  // Render an explicit error rather than the blank page the failed
  // fetches would otherwise produce. Throwing here aborts module
  // evaluation, so React never mounts and the inline message is what
  // the user sees in the DOM.
  container.textContent = msg;
  throw new Error(msg);
}

const store = buildStore();

// Regex-driven dispatch: capture group `1` is the non-empty token tail.
// `startsWith` + `slice()` would also fire on `#token=` (empty tail) and
// dispatch a blank token, which the reducer would then POST verbatim to
// the backend. The `.+` ensures we only dispatch when there's actually
// a token to validate.
const HASH_ACTIONS = [
  { pattern: /^#token=(.+)$/, action: 'startTokenLogin' },
  { pattern: /^#verify=(.+)$/, action: 'startRegistrationVerify' },
];

function checkUrlHash() {
  const fragment = window.location.hash;
  for (const { pattern, action } of HASH_ACTIONS) {
    const match = fragment.match(pattern);
    if (match) {
      store.dispatch({ type: action, token: match[1] });
      return;
    }
  }
  store.dispatch({ type: 'verifySession' });
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

// HMR safety: each dev-time full reload re-runs this module and registers
// a fresh listener. Vite's `import.meta.hot.dispose` fires right before
// the old module is discarded, so we drop the previous listener there.
// Production builds strip `import.meta.hot` (it's undefined), so the
// optional chaining no-ops at runtime.
if (import.meta.hot) {
  import.meta.hot.dispose(() => {
    i18n.off('languageChanged', refreshDocumentTitle);
  });
}

root.render(
  <React.StrictMode>
    <Provider store={store}>
      <App />
    </Provider>
  </React.StrictMode>,
);
