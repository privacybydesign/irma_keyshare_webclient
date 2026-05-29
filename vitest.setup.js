// Several modules read window.config at import time (i18n.js for the
// initial language; the redux store's userdata initialState for the Yivi
// session URL). Mirror the shape of the deployed public/config.js so any
// such module can load cleanly under jsdom.
window.config = {
  server: 'http://localhost:8080',
  lang: 'en',
};
