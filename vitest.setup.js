// Silence Node 22's experimental built-in localStorage warning. It fires per
// worker because Node sees no --localstorage-file CLI flag, but we deliberately
// use the jsdom/polyfilled localStorage instead — Node's built-in is irrelevant
// to these tests and the warning just drowns out real test output.
//
// Narrow filter: must be both an ExperimentalWarning *and* carry the specific
// CLI flag string Node emits. If Node ever rephrases the message but keeps the
// flag, this still matches; if Node drops the flag entirely, we'd notice
// because some other warning would stop firing — that's the desired behaviour.
const LOCALSTORAGE_WARNING = /--localstorage-file/;
const originalEmitWarning = process.emitWarning;
process.emitWarning = (warning, ...rest) => {
  const name = typeof warning === 'object' ? warning?.name : (rest[0]?.type ?? rest[0]);
  const message = typeof warning === 'object' ? warning?.message : warning;
  if (name === 'ExperimentalWarning' && LOCALSTORAGE_WARNING.test(String(message))) return;
  originalEmitWarning.call(process, warning, ...rest);
};

// jsdom 29 inside vitest 4 does not consistently expose `window.localStorage`
// (Node's own experimental localStorage shadows the jsdom one in some
// configurations). Drop in a small in-memory polyfill so the switcher tests
// can spy on getItem/setItem and the i18n config-detection code can read it.
//
// Use `Object.defineProperty` rather than `window.localStorage = …`:
// `localStorage` is exposed as a prototype getter on `Window`, and direct
// assignment under strict-mode ES modules throws ("Cannot set property
// localStorage of #<Window> which has only a getter"). The fall-through
// `configurable: true` lets a future setup file overwrite the polyfill if
// jsdom starts shipping a real localStorage.
if (!window.localStorage) {
  const store = new Map();
  Object.defineProperty(window, 'localStorage', {
    configurable: true,
    writable: true,
    value: {
      getItem: (k) => (store.has(k) ? store.get(k) : null),
      setItem: (k, v) => store.set(k, String(v)),
      removeItem: (k) => store.delete(k),
      clear: () => store.clear(),
      key: (i) => Array.from(store.keys())[i] ?? null,
      get length() {
        return store.size;
      },
    },
  });
}

// Several modules read window.config at import time (i18n.js for the
// initial language; the redux store's userdata initialState for the Yivi
// session URL). Mirror the deployed public/config.js shape so any module
// that indexes window.config can load cleanly under jsdom — including the
// per-language URL maps that components import lazily.
window.config = {
  server: 'http://localhost:8081',
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
