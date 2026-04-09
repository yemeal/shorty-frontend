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
        position="top-center" 
        expand={true} 
        richColors 
        toastOptions={{
          className: 'font-sans'
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