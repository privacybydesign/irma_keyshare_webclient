// Silence Node 22's experimental built-in localStorage warning. It fires per
// worker because Node sees no --localstorage-file CLI flag, but we deliberately
// use the jsdom/polyfilled localStorage instead — Node's built-in is irrelevant
// to these tests and the warning just drowns out real test output.
process.removeAllListeners('warning');
process.on('warning', (w) => {
  if (w.name === 'ExperimentalWarning' && /localStorage/.test(w.message)) return;
  console.warn(w);
});

// jsdom 29 inside vitest 4 does not consistently expose `window.localStorage`
// (Node's own experimental localStorage shadows the jsdom one in some
// configurations). Drop in a small in-memory polyfill so the switcher tests
// can spy on getItem/setItem and the i18n config-detection code can read it.
if (!window.localStorage) {
  const store = new Map();
  window.localStorage = {
    getItem: (k) => (store.has(k) ? store.get(k) : null),
    setItem: (k, v) => store.set(k, String(v)),
    removeItem: (k) => store.delete(k),
    clear: () => store.clear(),
    key: (i) => Array.from(store.keys())[i] ?? null,
    get length() {
      return store.size;
    },
  };
}

// Several modules read window.config at import time (i18n.js for the
// initial language; the redux store's userdata initialState for the Yivi
// session URL). Mirror the deployed public/config.js shape so any module
// that indexes window.config can load cleanly under jsdom — including the
// per-language URL maps that components import lazily.
window.config = {
  server: 'http://localhost:8080',
  lang: 'en',
  emailIssuanceUrl: {
    en: 'https://email-issuer.test/en',
    nl: 'https://email-issuer.test/nl',
  },
  attributesOverviewUrl: {
    en: 'https://yivi.test/en/storing_and_sharing/',
    nl: 'https://yivi.test/storing_and_sharing/',
  },
};
