import React, { createContext, useContext, useState, useEffect } from 'react';

const ThemeContext = createContext();

export const ThemeProvider = ({ children }) => {
  const [theme, setTheme] = useState('dark');
  const [isAntigravity, setIsAntigravity] = useState(false);

  const updateDOM = (mode) => {
    if (mode === 'dark') {
      document.documentElement.classList.add('dark');
    } else {
      document.documentElement.classList.remove('dark');
    }
  };

  useEffect(() => {
    // Check local storage or system preference
    const savedTheme = localStorage.getItem('shorty-theme');
    if (savedTheme) {
      setTheme(savedTheme);
      updateDOM(savedTheme);
    } else {
      const prefersDark = window.matchMedia('(prefers-color-scheme: dark)').matches;
      setTheme(prefersDark ? 'dark' : 'light');
      updateDOM(prefersDark ? 'dark' : 'light');
    }
  }, []);

  const toggleTheme = () => {
    const next = theme === 'dark' ? 'light' : 'dark';
    setTheme(next);
    localStorage.setItem('shorty-theme', next);
    updateDOM(next);
  };

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
