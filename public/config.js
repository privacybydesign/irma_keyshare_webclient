// Resolution order: previously saved choice (localStorage) -> browser preference
// -> 'en' fallback. The switcher in YiviAppBar writes back to localStorage so the
// user's pick survives reloads.
//
// Operator override: replacing `detectLanguage()` with a literal (e.g. `'nl'`)
// pins the initial language across all sessions, but be aware that this
// disables persistence of the in-app NL/EN switcher: the user can still
// click to switch within a session, and localStorage is still written, but
// the next page load reads this literal — not localStorage — so the pick
// silently reverts. From the user's perspective the switcher will appear
// broken on reload. If you pin, you almost certainly also want to hide
// the switcher in YiviAppBar (and drop the unused localStorage writes).
function detectLanguage() {
  const supported = ['nl', 'en'];
  try {
    const saved = window.localStorage && window.localStorage.getItem('lang');
    if (saved && supported.indexOf(saved) !== -1) return saved;
  } catch (e) {
    // localStorage unavailable (Safari private mode, sandboxed iframe, etc.) — ignore.
  }
  const langs = navigator.languages && navigator.languages.length ? navigator.languages : [navigator.language || 'en'];
  for (let i = 0; i < langs.length; i++) {
    const base = (langs[i] || '').toLowerCase().split('-')[0];
    if (supported.indexOf(base) !== -1) return base;
  }
  return 'en';
}

window.config = {
  server: 'http://localhost:8081',
  lang: detectLanguage(),
  emailIssuanceUrl: {
    en: 'https://email-issuer.yivi.app/en',
    nl: 'https://email-issuer.yivi.app/nl',
  },
  // yivi.app is a Dutch-default site: /storing_and_sharing/ serves the Dutch
  // page (<title>Wat kan ik opslaan en delen | Yivi</title>) and English lives
  // under the /en/ prefix. The asymmetry below mirrors that — don't "fix" the
  // missing /nl/ on the nl entry.
  attributesOverviewUrl: {
    en: 'https://yivi.app/en/storing_and_sharing/',
    nl: 'https://yivi.app/storing_and_sharing/',
  },
};
