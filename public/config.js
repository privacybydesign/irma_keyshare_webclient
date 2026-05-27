// Pick the first browser-preferred language we actually support; fall back to 'en'.
// Operators can hard-code a language by replacing the call with a literal e.g. 'nl'.
function detectLanguage() {
  const supported = ['nl', 'en'];
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
    en: 'https://privacybydesign.foundation/issuance/email/',
    nl: 'https://privacybydesign.foundation/uitgifte/email/',
  },
  attributesOverviewUrl: {
    en: 'https://privacybydesign.foundation/issuance/',
    nl: 'https://privacybydesign.foundation/uitgifte/',
  },
};
