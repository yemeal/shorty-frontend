import React from 'react';
import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import HomePage from './pages/HomePage';
import ProfilePlaceholder from './pages/ProfilePlaceholder';
import { LangProvider } from './LangContext';
import { ThemeProvider, useTheme } from './ThemeContext';
import { Toaster } from 'sonner';

const AppContent = () => {
  const { theme } = useTheme();
  
  return (
    <LangProvider>
      <Toaster 
        theme={theme} 
        position="bottom-center" 
        expand={true} 
        richColors 
        toastOptions={{
          className: 'font-sans p-4 sm:p-6',
          style: {
            fontSize: 'var(--toast-font-size, 0.95rem)',
            padding: 'var(--toast-padding, 1rem)',
            borderRadius: '1.25rem',
            minWidth: 'var(--toast-min-width, 280px)',
            maxWidth: '90vw'
          }
        }}
      />
      <div className="relative w-full min-h-screen">
        <Router>
          <Routes>
            <Route path="/" element={<HomePage />} />
            <Route path="/profile-placeholder" element={<ProfilePlaceholder />} />
            <Route path="*" element={<ForceServerRedirect />} />
          </Routes>
        </Router>
      </div>
    </LangProvider>
  );
};

const ForceServerRedirect = () => {
  React.useEffect(() => {
    window.location.reload();
  }, []);
  return null;
};

const App = () => {
  return (
    <ThemeProvider>
      <AppContent />
    </ThemeProvider>
  );
};

export default App;