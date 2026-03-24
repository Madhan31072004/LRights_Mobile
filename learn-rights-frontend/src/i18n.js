import i18n from 'i18next';
import { initReactI18next } from 'react-i18next';
import en from './locales/en.json';
import hi from './locales/hi.json';
import ta from './locales/ta.json';
import bn from './locales/bn.json';
import mr from './locales/mr.json';
import ur from './locales/ur.json';

const resources = {
  en: { translation: en },
  hi: { translation: hi },
  ta: { translation: ta },
  bn: { translation: bn },
  te: { translation: en }, // Telugu fallback to English
  mr: { translation: mr },
  ur: { translation: ur },
  gu: { translation: en }, // Gujarati fallback to English
  kn: { translation: en }, // Kannada fallback to English
  or: { translation: en }, // Odia fallback to English
  pa: { translation: en }, // Punjabi fallback to English
  ml: { translation: en }, // Malayalam fallback to English
  as: { translation: en }, // Assamese fallback to English
};

i18n
  .use(initReactI18next)
  .init({
    resources,
    lng: localStorage.getItem('language') || 'en',
    fallbackLng: 'en',
    interpolation: {
      escapeValue: false,
    },
  });

export default i18n;
