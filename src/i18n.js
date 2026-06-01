import i18n from 'i18next';
import { initReactI18next } from 'react-i18next';

import en from './translations/en.json';
import nl from './translations/nl.json';

// Order here is the switcher's left-to-right display order. The default
// fallback language is `DEFAULT_LANGUAGE` (below), *not* the first key,
// so reordering for UX doesn't change which language a misconfigured
// `config.lang` falls back to.
const resources = { nl, en };
// Exported so the language switcher (and any future consumer) doesn't
// duplicate the supported-languages list. NOTE: `public/config.js` ships
// independently (it's the runtime template, not bundled), so it inlines
// its own `['nl', 'en']` array. Keep that list in sync with this one if
// support for a new language is added.
export const SUPPORTED_LANGUAGES = Object.keys(resources);

// Default language when the requested one isn't supported. Hardcoded as a
// named constant rather than `supported[0]` so behavior doesn't change if
// someone reorders the `resources` object (e.g. inserts a third locale
// alphabetically before 'en'). `DEFAULT_LANGUAGE` must always be a member
// of `SUPPORTED_LANGUAGES` — the resolver enforces that invariant.
export const DEFAULT_LANGUAGE = 'en';

// Resolve the requested language up front rather than handing a possibly
// invalid value to i18next. If we passed `lng: 'fr'` with `fallbackLng: 'en'`,
// i18n.language would stay 'fr' (i18next records what was requested, not what
// can actually be rendered), so `<html lang>` would advertise a language we
// have no resources for. Validate against the supported set instead.
export function resolveInitialLang(configLang, supported = SUPPORTED_LANGUAGES) {
  const trimmed = (configLang ?? '').toString().trim().toLowerCase();
  const base = trimmed.split('-')[0];
  if (supported.includes(base)) return base;
  // Fall back to the explicit default rather than the first entry of the
  // supported set, so reordering `resources` can't quietly change the
  // fallback language. If a caller passes a `supported` set that doesn't
  // include DEFAULT_LANGUAGE (only the test suite does this for negative
  // cases), use the first entry as a last resort.
  return supported.includes(DEFAULT_LANGUAGE) ? DEFAULT_LANGUAGE : supported[0];
}

// Optional chaining: if /config.js 404s or fails to parse (operator misconfig,
// CDN hiccup) window.config is undefined and dereferencing `.lang` would throw
// at module load, blanking the page before React mounts. resolveInitialLang
// already treats undefined as "fall back to supported[0]".
const initialLang = resolveInitialLang(window.config?.lang);

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

    // Pin `nsSeparator` to i18next's default ':' rather than relying on the
    // default. This is the same separator the codebase already uses at every
    // call site (`t('app:title')`, `withTranslation('yivi-app-bar')`); making
    // it explicit documents the constraint that **translation keys must not
    // contain ':'**. A future translation that legitimately needed a colon
    // (e.g. `"time-format": "{{h}}:{{m}}"` as a key, not a value) would
    // otherwise silently route to a non-existent namespace and render the
    // raw key. If that ever becomes desirable, swap this for an unlikely
    // sentinel (e.g. `'::'`) and migrate every call site in lockstep.
    nsSeparator: ':',

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
