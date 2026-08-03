import { createInstance } from "i18next";
import { initReactI18next } from "react-i18next";

import { en } from "@/i18n/locales/en";
import { ja } from "@/i18n/locales/ja";
import { ro } from "@/i18n/locales/ro";

export const SUPPORTED_LANGUAGES = ["en", "ro", "ja"] as const;
export type SupportedLanguage =
  (typeof SUPPORTED_LANGUAGES)[number];

export const i18n = createInstance();

void i18n.use(initReactI18next).init({
  fallbackLng: "en",
  initAsync: false,
  interpolation: {
    escapeValue: false,
  },
  lng: "en",
  react: {
    useSuspense: false,
  },
  resources: {
    en: { translation: en },
    ja: { translation: ja },
    ro: { translation: ro },
  },
  supportedLngs: [...SUPPORTED_LANGUAGES],
});
