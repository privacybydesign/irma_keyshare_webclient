import i18n from "i18next";
import { initReactI18next } from "react-i18next";

import en from "./translations/en.json";
import nl from "./translations/nl.json";

const resources = {
  en: en,
  nl: nl,
};

i18n
  .use(initReactI18next) // passes i18n down to react-i18next
  .init({
    resources,
    lng: "nl", // TODO: Set to en when english version is requested or use language detector.

    keySeparator: false, // we do not use keys in form messages.welcome

    interpolation: {
      escapeValue: false // react already safes from xss
    }
  });

export default i18n;
