import React from "react";
import { BrowserRouter as Router, Navigate, Route, Routes } from "react-router-dom";
import { Toaster } from "sonner";
import { AuthProvider, useAuth } from "./AuthContext";
import { LangProvider } from "./LangContext";
import { ThemeProvider, useTheme } from "./ThemeContext";
import HomePage from "./pages/HomePage";
import AuthPage from "./pages/AuthPage";
import ProfilePage from "./pages/ProfilePage";
import PlaceholderPage from "./pages/PlaceholderPage";
import NotFoundPage from "./pages/NotFoundPage";
import BrandLoader from "./components/BrandLoader";

const RequireAuth = ({ children }) => {
  const { isAuthenticated, isBootstrapping } = useAuth();

  if (isBootstrapping) {
    return (
      <div className="min-h-screen flex items-center justify-center text-slate-500 dark:text-slate-300">
        <BrandLoader label="Loading session..." />
      </div>
    );
  }

  if (!isAuthenticated) {
    return <Navigate to="/login" replace />;
  }

  return children;
};

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
      <AuthProvider>
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
            <Route path="/login" element={<AuthPage defaultTab="login" />} />
            <Route path="/register" element={<AuthPage defaultTab="register" />} />
            {/* Profile is a protected page and requires an active auth session. */}
            <Route
              path="/profile"
              element={
                <RequireAuth>
                  <ProfilePage />
                </RequireAuth>
              }
            />
            {/* Legacy fallback for old bookmarks. */}
            <Route path="/profile-placeholder" element={<Navigate to="/placeholder" replace />} />
            <Route path="/placeholder" element={<PlaceholderPage />} />
            <Route path="/not-found" element={<NotFoundPage />} />
            <Route path="*" element={<Navigate to="/not-found" replace />} />
          </Routes>
        </Router>
      </div>
      </AuthProvider>
    </LangProvider>
  );
};

const App = () => {
  return (
    <ThemeProvider>
      <AppContent />
    </ThemeProvider>
  );
};

export default App;