import { describe, it, expect, beforeEach, vi } from "vitest";
import { screen, fireEvent } from "@testing-library/react";
import Header from "../components/Header";
import { renderWithProviders } from "./helpers";

beforeEach(() => {
  localStorage.clear();
  vi.restoreAllMocks();
  vi.spyOn(globalThis, "fetch").mockRejectedValue(new Error("no network"));
});

describe("Header", () => {
  it("renders brand name", () => {
    renderWithProviders(<Header />);
    expect(screen.getByText("шорти.рф")).toBeInTheDocument();
  });

  it("renders settings button", () => {
    renderWithProviders(<Header />);
    const btn = screen.getByRole("button", { expanded: false });
    expect(btn).toBeInTheDocument();
  });

  it("toggles settings open/closed", () => {
    renderWithProviders(<Header />);
    const btn = screen.getByRole("button", { expanded: false });
    fireEvent.click(btn);
    expect(btn).toHaveAttribute("aria-expanded", "true");
    fireEvent.click(btn);
    expect(btn).toHaveAttribute("aria-expanded", "false");
  });

  it("closes settings on Escape", () => {
    renderWithProviders(<Header />);
    const btn = screen.getByRole("button", { expanded: false });
    fireEvent.click(btn);
    expect(btn).toHaveAttribute("aria-expanded", "true");
    fireEvent.keyDown(window, { key: "Escape" });
    expect(btn).toHaveAttribute("aria-expanded", "false");
  });

  it("settings panel has language button", () => {
    renderWithProviders(<Header />);
    fireEvent.click(screen.getByRole("button", { expanded: false }));
    expect(screen.getByText("Язык / Lang")).toBeInTheDocument();
  });

  it("settings panel has theme toggle button", () => {
    renderWithProviders(<Header />);
    fireEvent.click(screen.getByRole("button", { expanded: false }));
    expect(screen.getByText(/Toggle theme|Сменить тему/i)).toBeInTheDocument();
  });

  it("settings panel has secret button", () => {
    renderWithProviders(<Header />);
    fireEvent.click(screen.getByRole("button", { expanded: false }));
    expect(screen.getByText(/Secret|Секрет/i)).toBeInTheDocument();
  });

  it("settings panel is aria-hidden when closed", () => {
    renderWithProviders(<Header />);
    const panel = document.querySelector("[aria-hidden]");
    expect(panel).toHaveAttribute("aria-hidden", "true");
  });

  it("brand links to /", () => {
    renderWithProviders(<Header />);
    const brandLink = screen.getByText("шорти.рф").closest("a");
    expect(brandLink).toHaveAttribute("href", "/");
  });

  it("shows login link when not authenticated", () => {
    renderWithProviders(<Header />);
    const loginLink = screen.getByRole("link", { name: /sign in|войти/i }) ||
      document.querySelector('a[href="/login"]');
    expect(loginLink).toBeTruthy();
  });
});
