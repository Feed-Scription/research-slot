import i18n from 'i18next';
import { initReactI18next } from 'react-i18next';
import zhCN from './locales/zh-CN.json';
import en from './locales/en.json';

export type Lang = 'zh-CN' | 'en';
const STORAGE_KEY = 'research-slot-lang';

function detectLang(): Lang {
  if (typeof window === 'undefined') return 'zh-CN';
  try {
    const saved = localStorage.getItem(STORAGE_KEY);
    if (saved === 'zh-CN' || saved === 'en') return saved;
  } catch {
    /* ignore */
  }
  const nav = (typeof navigator !== 'undefined' && navigator.language) || 'zh-CN';
  return nav.toLowerCase().startsWith('zh') ? 'zh-CN' : 'en';
}

void i18n.use(initReactI18next).init({
  resources: {
    'zh-CN': { translation: zhCN },
    en: { translation: en },
  },
  lng: detectLang(),
  fallbackLng: 'en',
  interpolation: { escapeValue: false },
  returnNull: false,
});

export function setLang(lang: Lang) {
  void i18n.changeLanguage(lang);
  try {
    localStorage.setItem(STORAGE_KEY, lang);
  } catch {
    /* ignore */
  }
}

export function getLang(): Lang {
  return (i18n.language as Lang) || 'zh-CN';
}

export function commentCount(): number {
  return (i18n.t('comments', { returnObjects: true }) as string[]).length;
}

export default i18n;
