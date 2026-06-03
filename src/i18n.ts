import i18n from 'i18next';
import { initReactI18next } from 'react-i18next';

import en from './translations/en.json';
import nl from './translations/nl.json';

i18n.use(initReactI18next).init({
  resources: { nl, en },
  lng: (() => { try { return window.localStorage.getItem('lang') ?? window.config?.lang ?? 'en'; } catch { return window.config?.lang ?? 'en'; } })(),
  fallbackLng: 'en',
  keySeparator: false,
  nsSeparator: ':',
  interpolation: {
    escapeValue: false,
  },
});

export default i18n;
