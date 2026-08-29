import { createContext, useContext, useState, useCallback, useEffect } from 'react';
import { translations } from '../data/translations';

const LanguageContext = createContext(null);

export function LanguageProvider({ children }) {
  const [lang, setLangState] = useState(() => {
    return localStorage.getItem('carelink_lang') || 'en';
  });

  const setLang = useCallback((newLang) => {
    setLangState(newLang);
    localStorage.setItem('carelink_lang', newLang);
  }, []);

  const toggleLang = useCallback(() => {
    setLangState(prev => {
      const next = prev === 'en' ? 'mr' : 'en';
      localStorage.setItem('carelink_lang', next);
      return next;
    });
  }, []);

  const t = useCallback((key) => {
    if (!key) return '';
    return translations[lang]?.[key] || translations['en']?.[key] || key;
  }, [lang]);

  return (
    <LanguageContext.Provider value={{ lang, setLang, t, toggleLang }}>
      {children}
    </LanguageContext.Provider>
  );
}

export function useLang() {
  const context = useContext(LanguageContext);
  if (!context) throw new Error('useLang must be used within LanguageProvider');
  return context;
}
