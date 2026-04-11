import React, { createContext, useContext, useState, useEffect } from 'react';

const ThemeContext = createContext();

/**
 * Global light/dark theme provider with persisted preference.
 */
export const ThemeProvider = ({ children }) => {
  const [theme, setTheme] = useState(() => {
    const savedTheme = localStorage.getItem('shorty-theme');
    if (savedTheme === 'light' || savedTheme === 'dark') return savedTheme;
    return window.matchMedia('(prefers-color-scheme: dark)').matches ? 'dark' : 'light';
  });
  const [isAntigravity, setIsAntigravity] = useState(false);

  /**
   * Applies active theme class to `<html>`.
   */
  const updateDOM = (mode) => {
    if (mode === 'dark') {
      document.documentElement.classList.add('dark');
    } else {
      document.documentElement.classList.remove('dark');
    }
  };

  useEffect(() => {
    updateDOM(theme);
    localStorage.setItem('shorty-theme', theme);
  }, [theme]);

  const toggleTheme = () => {
    const next = theme === 'dark' ? 'light' : 'dark';
    setTheme(next);
  };

  /**
   * Fun easter-egg animation trigger used from settings panel.
   */
  const triggerAntigravity = () => {
    setIsAntigravity(true);
    // Add the class to body to trigger the rotation
    document.body.classList.add('antigravity-active');
    
    // Auto restore after 15.5 seconds (gives animation time to finish before class is removed)
    setTimeout(() => {
      document.body.classList.remove('antigravity-active');
      setIsAntigravity(false);
    }, 15500);
  };

  return (
    <ThemeContext.Provider value={{ theme, toggleTheme, isAntigravity, triggerAntigravity }}>
      {children}
    </ThemeContext.Provider>
  );
};

// eslint-disable-next-line react-refresh/only-export-components
export const useTheme = () => useContext(ThemeContext);
