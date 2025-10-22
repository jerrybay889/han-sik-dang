import i18n from 'i18next';
import { initReactI18next } from 'react-i18next';
import LanguageDetector from 'i18next-browser-languagedetector';

const loadTranslations = async (lng: string) => {
  const response = await fetch(`/locales/${lng}/translation.json`);
  return response.json();
};

const resources: Record<string, any> = {};
const supportedLngs = ['en', 'ko', 'ja', 'zh-CN', 'zh-TW', 'es', 'fr', 'de', 'ru'];

Promise.all(
  supportedLngs.map(async (lng) => {
    try {
      resources[lng] = {
        translation: await loadTranslations(lng),
      };
    } catch (error) {
      console.error(`Failed to load translations for ${lng}:`, error);
    }
  })
).then(() => {
  i18n
    .use(LanguageDetector)
    .use(initReactI18next)
    .init({
      resources,
      fallbackLng: 'en',
      supportedLngs,
      interpolation: {
        escapeValue: false,
      },
      detection: {
        order: ['localStorage', 'navigator'],
        caches: ['localStorage'],
      },
    });
});

export default i18n;
