import i18n from 'i18next';
import { initReactI18next } from 'react-i18next';

import en from './translations/en.json';
import nl from './translations/nl.json';

const resources = { en, nl };
const SUPPORTED_LANGUAGES = Object.keys(resources);

// Resolve the requested language up front rather than handing a possibly
// invalid value to i18next. If we passed `lng: 'fr'` with `fallbackLng: 'en'`,
// i18n.language would stay 'fr' (i18next records what was requested, not what
// can actually be rendered), so `<html lang>` would advertise a language we
// have no resources for. Validate against the supported set instead.
const requestedLang = (window.config.lang || '').toLowerCase().split('-')[0];
const initialLang = SUPPORTED_LANGUAGES.includes(requestedLang) ? requestedLang : 'en';

i18n
  .use(initReactI18next) // passes i18n down to react-i18next
  .init({
    resources,
    lng: initialLang,
    // Belt-and-suspenders: if any future i18next path tries to load a missing
    // namespace/key, fall back to English rather than render raw keys.
    fallbackLng: 'en',

    // Keys like `app:title` use `:` as the namespace separator. `keySeparator`
    // is the *dot* separator i18next uses to walk nested resource objects
    // (e.g. `parent.child`). We don't use nested objects, so disable it to
    // avoid accidental nesting from keys that happen to contain a dot.
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
