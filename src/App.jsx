import React from 'react';
import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import HomePage from './pages/HomePage';
import ProfilePlaceholder from './pages/ProfilePlaceholder';
import { LangProvider } from './LangContext';
import { ThemeProvider, useTheme } from './ThemeContext';
import { Toaster } from 'sonner';

const AppContent = () => {
  const { theme } = useTheme();
  const [isMobile, setIsMobile] = React.useState(window.innerWidth < 640);

  React.useEffect(() => {
    const handleResize = () => setIsMobile(window.innerWidth < 640);
    window.addEventListener('resize', handleResize);
    return () => window.removeEventListener('resize', handleResize);
  }, []);
  
  return (
    <LangProvider>
      <Toaster 
        theme={theme} 
        position={isMobile ? "top-center" : "bottom-right"} 
        expand={true} 
        visibleToasts={3}
        richColors 
        toastOptions={{
          className: 'font-sans',
          style: {
            borderRadius: '1.25rem',
            fontSize: '0.9rem',
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