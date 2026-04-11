import React from "react";
import { AuthProvider } from "../../AuthContext";
import { LangProvider } from "../../LangContext";
import { ThemeProvider, useTheme } from "../../ThemeContext";
import { Toaster } from "sonner";

/**
 * Provides global app context layers in one place:
 * Theme -> Language -> Auth -> Toaster.
 */
const AppProvidersContent = ({ children }) => {
  const { theme } = useTheme();
  const [isMobile, setIsMobile] = React.useState(window.innerWidth < 640);

  React.useEffect(() => {
    const handleResize = () => setIsMobile(window.innerWidth < 640);
    window.addEventListener("resize", handleResize);
    return () => window.removeEventListener("resize", handleResize);
  }, []);

  return (
    <LangProvider>
      <AuthProvider>
        <Toaster
          theme={theme}
          position={isMobile ? "top-center" : "bottom-right"}
          expand
          visibleToasts={3}
          richColors
          toastOptions={{
            className: "font-sans",
            style: {
              borderRadius: "1.25rem",
              fontSize: "0.9rem",
            },
          }}
        />
        {children}
      </AuthProvider>
    </LangProvider>
  );
};

const AppProviders = ({ children }) => {
  return (
    <ThemeProvider>
      <AppProvidersContent>{children}</AppProvidersContent>
    </ThemeProvider>
  );
};

export default AppProviders;
