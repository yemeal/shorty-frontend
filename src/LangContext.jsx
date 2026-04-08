import React, { createContext, useContext, useState, useEffect } from 'react';
import { translations } from './translations';

const LangContext = createContext();

export const LangProvider = ({ children }) => {
  const [lang, setLang] = useState('en');

  useEffect(() => {
    const savedLang = localStorage.getItem('shorty-lang');
    if (savedLang && (savedLang === 'ru' || savedLang === 'en')) {
      setLang(savedLang);
    } else {
      const browserLang = navigator.language.startsWith('ru') ? 'ru' : 'en';
      setLang(browserLang);
    }
  }, []);

  const toggleLang = () => {
    const next = lang === 'en' ? 'ru' : 'en';
    setLang(next);
    localStorage.setItem('shorty-lang', next);
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
