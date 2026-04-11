import React, { createContext, useContext, useState, useEffect } from 'react';
import { translations } from './shared/i18n/translations';

const LangContext = createContext();

/**
 * Provides language state and dictionary access (`t`) across the app.
 */
export const LangProvider = ({ children }) => {
  const [lang, setLang] = useState(() => {
    const savedLang = localStorage.getItem('shorty-lang');
    if (savedLang && (savedLang === 'ru' || savedLang === 'en')) {
      return savedLang;
    }
    return navigator.language.startsWith('ru') ? 'ru' : 'en';
  });

  useEffect(() => {
    // Keep persisted choice in sync with current provider state.
    localStorage.setItem('shorty-lang', lang);
  }, [lang]);

  /**
   * Toggles between supported languages and persists choice.
   */
  const toggleLang = () => {
    const next = lang === 'en' ? 'ru' : 'en';
    setLang(next);
  };

  const t = translations[lang];

  return (
    <LangContext.Provider value={{ lang, toggleLang, t }}>
      {children}
    </LangContext.Provider>
  );
};

// eslint-disable-next-line react-refresh/only-export-components
export const useLang = () => useContext(LangContext);
