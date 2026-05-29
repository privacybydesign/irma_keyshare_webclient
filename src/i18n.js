import i18n from 'i18next';
import { initReactI18next } from 'react-i18next';

import en from './translations/en.json';
import nl from './translations/nl.json';

const resources = { en, nl };

i18n
  .use(initReactI18next) // passes i18n down to react-i18next
  .init({
    resources,
    lng: window.config.lang,
    // Guard against a misconfigured config.js (typo'd lang, empty string,
    // unsupported tag) — without a fallback, i18next would render raw
    // translation keys instead of falling back to English.
    fallbackLng: 'en',

    keySeparator: false,

    interpolation: {
      escapeValue: false, // react already safes from xss
    },
  });

// i18n.language may carry a region tag (e.g. 'nl-NL') if a future fallbackLng
// tweak introduces one. Translations and Vite's CSS pipeline tolerate that,
// but anywhere we index a two-key map keyed by base subtag — config.js URL
// maps, the language switcher's `isActive` compare, the language hint we
// pass to @privacybydesign/yivi-frontend — needs the base. Use this helper
// at those sites so a regression silently producing `nl-NL` doesn't make
// `href=undefined` or break the QR widget.
export function baseLanguage(instance = i18n) {
  return (instance.language || '').toLowerCase().split('-')[0];
}

export default i18n;
