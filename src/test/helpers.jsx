import React from "react";
import { render } from "@testing-library/react";
import { MemoryRouter } from "react-router-dom";
import { ThemeProvider } from "../ThemeContext";
import { LangProvider } from "../LangContext";
import { AuthProvider } from "../AuthContext";

export function renderWithProviders(ui, { route = "/", ...options } = {}) {
  function Wrapper({ children }) {
    return (
      <ThemeProvider>
        <LangProvider>
          <AuthProvider>
            <MemoryRouter initialEntries={[route]}>{children}</MemoryRouter>
          </AuthProvider>
        </LangProvider>
      </ThemeProvider>
    );
  }
  return render(ui, { wrapper: Wrapper, ...options });
}

export function renderWithRouter(ui, { route = "/", ...options } = {}) {
  function Wrapper({ children }) {
    return (
      <ThemeProvider>
        <LangProvider>
          <MemoryRouter initialEntries={[route]}>{children}</MemoryRouter>
        </LangProvider>
      </ThemeProvider>
    );
  }
  return render(ui, { wrapper: Wrapper, ...options });
}
