import i18n from 'i18next';
import { initReactI18next } from 'react-i18next';

import en from './translations/en.json';
import nl from './translations/nl.json';

i18n.use(initReactI18next).init({
  resources: { nl, en },
  lng: window.config?.lang ?? 'en',
  fallbackLng: 'en',
  keySeparator: false,
  nsSeparator: ':',
  interpolation: {
    escapeValue: false, // react already safes from xss
  },
});

export default i18n;
