import i18n from "i18next";
import { initReactI18next } from "react-i18next";
import type { Language } from "../types";
import en from "./locales/en.json";
import vi from "./locales/vi.json";

export const LANGUAGE_STORAGE_KEY = "interview-studio.language.v1";

function getInitialLanguage(): Language {
  return localStorage.getItem(LANGUAGE_STORAGE_KEY) === "vi" ? "vi" : "en";
}

void i18n.use(initReactI18next).init({
  resources: { en: { translation: en }, vi: { translation: vi } },
  lng: getInitialLanguage(),
  fallbackLng: "en",
  interpolation: { escapeValue: false },
});

export function setAppLanguage(language: Language): void {
  localStorage.setItem(LANGUAGE_STORAGE_KEY, language);
  void i18n.changeLanguage(language);
}

export default i18n;
