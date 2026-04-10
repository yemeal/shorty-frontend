import { describe, it, expect, beforeEach, vi } from "vitest";
import { render, screen, waitFor } from "@testing-library/react";
import React from "react";
import { MemoryRouter, Routes, Route, Navigate } from "react-router-dom";
import { ThemeProvider } from "../ThemeContext";
import { LangProvider } from "../LangContext";
import { AuthProvider, useAuth } from "../AuthContext";

beforeEach(() => {
  localStorage.clear();
  vi.restoreAllMocks();
  vi.spyOn(globalThis, "fetch").mockRejectedValue(new Error("no network"));
});

const RequireAuth = ({ children }) => {
  const { isAuthenticated, isBootstrapping } = useAuth();
  if (isBootstrapping) return <div>Loading...</div>;
  if (!isAuthenticated) return <Navigate to="/login" replace />;
  return children;
};

function renderApp(initialRoute) {
  return render(
    <ThemeProvider>
      <LangProvider>
        <AuthProvider>
          <MemoryRouter initialEntries={[initialRoute]}>
            <Routes>
              <Route path="/" element={<div data-testid="home">Home</div>} />
              <Route path="/login" element={<div data-testid="login">Login</div>} />
              <Route path="/register" element={<div data-testid="register">Register</div>} />
              <Route
                path="/profile"
                element={
                  <RequireAuth>
                    <div data-testid="profile">Profile</div>
                  </RequireAuth>
                }
              />
              <Route
                path="/profile-placeholder"
                element={<Navigate to="/placeholder" replace />}
              />
              <Route path="/placeholder" element={<div data-testid="placeholder">Placeholder</div>} />
              <Route path="/not-found" element={<div data-testid="not-found">Not Found</div>} />
              <Route path="*" element={<Navigate to="/not-found" replace />} />
            </Routes>
          </MemoryRouter>
        </AuthProvider>
      </LangProvider>
    </ThemeProvider>,
  );
}

describe("Routing — public routes", () => {
  it("renders home at /", async () => {
    renderApp("/");
    expect(screen.getByTestId("home")).toBeInTheDocument();
  });

  it("renders login at /login", async () => {
    renderApp("/login");
    expect(screen.getByTestId("login")).toBeInTheDocument();
  });

  it("renders register at /register", async () => {
    renderApp("/register");
    expect(screen.getByTestId("register")).toBeInTheDocument();
  });

  it("renders placeholder at /placeholder", async () => {
    renderApp("/placeholder");
    expect(screen.getByTestId("placeholder")).toBeInTheDocument();
  });
});

describe("Routing — redirects", () => {
  it("/profile-placeholder redirects to /placeholder", async () => {
    renderApp("/profile-placeholder");
    await waitFor(() => {
      expect(screen.getByTestId("placeholder")).toBeInTheDocument();
    });
  });

  it("unknown route redirects to /not-found", async () => {
    renderApp("/some-random-path");
    await waitFor(() => {
      expect(screen.getByTestId("not-found")).toBeInTheDocument();
    });
  });
});

describe("Routing — protected routes", () => {
  it("redirects to /login when visiting /profile unauthenticated", async () => {
    renderApp("/profile");
    await waitFor(() => {
      expect(screen.getByTestId("login")).toBeInTheDocument();
    });
  });

  it("shows profile when authenticated", async () => {
    localStorage.setItem(
      "shorty-auth-user",
      JSON.stringify({ id: 1, username: "u", email: "a@b.c" }),
    );
    vi.spyOn(globalThis, "fetch").mockResolvedValue({
      ok: true,
      text: async () => JSON.stringify({ ok: true }),
    });
    renderApp("/profile");
    await waitFor(() => {
      expect(screen.getByTestId("profile")).toBeInTheDocument();
    });
  });

  it("shows loading spinner while bootstrapping", () => {
    localStorage.setItem(
      "shorty-auth-user",
      JSON.stringify({ id: 1, username: "u", email: "a@b.c" }),
    );
    vi.spyOn(globalThis, "fetch").mockImplementation(
      () => new Promise(() => {}),
    );
    renderApp("/profile");
    expect(screen.getByText("Loading...")).toBeInTheDocument();
  });
});

describe("Routing — contexts", () => {
  it("ThemeProvider renders without error", () => {
    render(
      <ThemeProvider>
        <div data-testid="ok">ok</div>
      </ThemeProvider>,
    );
    expect(screen.getByTestId("ok")).toBeInTheDocument();
  });

  it("LangProvider renders without error", () => {
    render(
      <LangProvider>
        <div data-testid="ok">ok</div>
      </LangProvider>,
    );
    expect(screen.getByTestId("ok")).toBeInTheDocument();
  });
});
