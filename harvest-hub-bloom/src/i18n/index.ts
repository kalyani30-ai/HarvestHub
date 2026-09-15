import i18n from 'i18next';
import { initReactI18next } from 'react-i18next';
import LanguageDetector from 'i18next-browser-languagedetector';

// Import translations
import enTranslation from './locales/en.json';
import hiTranslation from './locales/hi.json';
import teTranslation from './locales/te.json';
import taTranslation from './locales/ta.json';
import mlTranslation from './locales/ml.json';

// Custom language detector for localStorage persistence
const localStorageDetector = {
  name: 'localStorage',
  lookup() {
    return localStorage.getItem('i18nextLng') || undefined;
  },
  cacheUserLanguage(lng: string) {
    localStorage.setItem('i18nextLng', lng);
  }
};

i18n
  // detect user language
  .use(LanguageDetector)
  // pass the i18n instance to react-i18next
  .use(initReactI18next)
  // init i18next
  .init({
    debug: false,
    fallbackLng: 'en',
    supportedLngs: ['en', 'hi', 'te', 'ta', 'ml'],
    interpolation: {
      escapeValue: false, // not needed for react as it escapes by default
    },
    detection: {
      order: ['localStorage', 'navigator'],
      caches: ['localStorage']
    },
    resources: {
      en: {
        translation: enTranslation
      },
      hi: {
        translation: hiTranslation
      },
      te: {
        translation: teTranslation
      },
      ta: {
        translation: taTranslation
      },
      ml: {
        translation: mlTranslation
      }
    }
  }).then(() => {
    console.log('✅ i18n initialized successfully');
    console.log('📋 Available languages:', i18n.languages);
    console.log('🌍 Current language:', i18n.language);
  });

// Add custom detector
i18n.services.languageDetector.addDetector(localStorageDetector);

export default i18n; 