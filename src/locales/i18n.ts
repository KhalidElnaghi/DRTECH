import i18n from 'i18next';
import { initReactI18next } from 'react-i18next';
import LanguageDetector from 'i18next-browser-languagedetector';

import { defaultLang } from './config-lang';
import translationEn from './langs/en.json';
import translationAr from './langs/ar.json';

// ----------------------------------------------------------------------

// Initialize with default language, will be overridden on client side
const lng =
  typeof window !== 'undefined'
    ? localStorage.getItem('i18nextLng') || defaultLang.value
    : defaultLang.value;

i18n
  .use(LanguageDetector)
  .use(initReactI18next)
  .init({
    resources: {
      en: { translations: translationEn },
      ar: { translations: translationAr },
    },
    lng,
    fallbackLng: 'en',
    debug: false,
    ns: ['translations'],
    defaultNS: 'translations',
    interpolation: {
      escapeValue: false,
    },
  });

export default i18n;
