import React, { createContext, useContext, useState, useEffect } from 'react';

const ThemeContext = createContext();

/**
 * Global light/dark theme provider with persisted preference.
 */
export const ThemeProvider = ({ children }) => {
  const [theme, setTheme] = useState(() => {
    const savedTheme = localStorage.getItem('shorty-theme');
    if (savedTheme === 'light' || savedTheme === 'dark' || savedTheme === 'system') {
      return savedTheme;
    }
    return window.matchMedia('(prefers-color-scheme: dark)').matches ? 'dark' : 'light';
  });
  const [isAntigravity, setIsAntigravity] = useState(false);

  /**
   * Applies active theme class to `<html>`.
   * @param {'light' | 'dark'} mode - resolved mode (never `system`)
   */
  const updateDOM = (mode) => {
    if (mode === 'dark') {
      document.documentElement.classList.add('dark');
    } else {
      document.documentElement.classList.remove('dark');
    }
  };

  const resolveSystemTheme = () =>
    window.matchMedia('(prefers-color-scheme: dark)').matches ? 'dark' : 'light';

  useEffect(() => {
    if (theme === 'system') {
      updateDOM(resolveSystemTheme());
    } else {
      updateDOM(theme);
    }
    localStorage.setItem('shorty-theme', theme);
  }, [theme]);

  useEffect(() => {
    if (theme !== 'system') return undefined;
    const mq = window.matchMedia('(prefers-color-scheme: dark)');
    const onChange = () => updateDOM(resolveSystemTheme());
    mq.addEventListener('change', onChange);
    return () => mq.removeEventListener('change', onChange);
  }, [theme]);

  const toggleTheme = () => {
    if (theme === 'system') {
      setTheme(resolveSystemTheme() === 'dark' ? 'light' : 'dark');
      return;
    }
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
    <ThemeContext.Provider value={{ theme, setTheme, toggleTheme, isAntigravity, triggerAntigravity }}>
      {children}
    </ThemeContext.Provider>
  );
};

// eslint-disable-next-line react-refresh/only-export-components
export const useTheme = () => useContext(ThemeContext);
