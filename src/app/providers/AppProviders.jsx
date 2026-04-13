import React from "react";
import { AuthProvider } from "../../AuthContext";
import { LangProvider } from "../../LangContext";
import { ThemeProvider } from "../../ThemeContext";
import ToasterHost from "./ToasterHost";

/**
 * Theme → Toaster (изолирован) → Language → Auth → children.
 */
const AppProviders = ({ children }) => {
  return (
    <ThemeProvider>
      <ToasterHost />
      <LangProvider>
        <AuthProvider>{children}</AuthProvider>
      </LangProvider>
    </ThemeProvider>
  );
};

export default AppProviders;
