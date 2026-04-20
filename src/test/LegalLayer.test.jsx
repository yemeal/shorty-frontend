import { describe, it, expect, beforeEach, vi } from "vitest";
import { fireEvent, render, screen, waitFor } from "@testing-library/react";
import React from "react";
import AppRoot from "../App";
import { renderWithProviders, renderWithRouter } from "./helpers";
import SiteFooter from "../shared/ui/SiteFooter";
import CookieNotice from "../shared/ui/CookieNotice";

beforeEach(() => {
  localStorage.clear();
  window.history.pushState({}, "", "/");
  vi.restoreAllMocks();
  vi.spyOn(globalThis, "fetch").mockRejectedValue(new Error("no network"));
});

describe("Legal layer - footer", () => {
  it("renders legal links without duplicating contact details", () => {
    renderWithRouter(<SiteFooter />);

    expect(screen.getByRole("link", { name: /Privacy|Политика/i })).toHaveAttribute(
      "href",
      "/legal/privacy",
    );
    expect(screen.getByRole("link", { name: /Terms|Условия/i })).toHaveAttribute(
      "href",
      "/legal/terms",
    );
    expect(screen.getByRole("link", { name: /Cookies/i })).toHaveAttribute(
      "href",
      "/legal/cookies",
    );
    expect(screen.getByRole("link", { name: /Contacts|Контакты/i })).toHaveAttribute(
      "href",
      "/legal/contacts",
    );
    expect(screen.getByText(/GitHub/i)).toBeInTheDocument();
    expect(screen.queryByText(/emelyalex@bk\.ru/i)).not.toBeInTheDocument();
  });
});

describe("Legal layer - cookie notice", () => {
  it("persists acknowledgement after accept", async () => {
    const { container } = renderWithProviders(<CookieNotice />);

    expect(screen.getByTestId("cookie-notice")).toBeInTheDocument();
    expect(container.querySelector("[data-testid='cookie-notice']")?.className).toContain("z-[60]");
    fireEvent.click(screen.getByRole("button", { name: /Понятно|Got it/i }));

    await waitFor(() => {
      expect(screen.queryByTestId("cookie-notice")).not.toBeInTheDocument();
    });
    expect(localStorage.getItem("shorty-cookie-consent-v1")).toBe("accepted");
  });
});

describe("Legal layer - routes", () => {
  it("renders privacy page through the real router", async () => {
    window.history.pushState({}, "", "/legal/privacy");
    render(<AppRoot />);

    expect(
      await screen.findByRole("heading", { name: /Privacy Policy|Политика обработки персональных данных/i }),
    ).toBeInTheDocument();
    expect(screen.getAllByText(/emelyalex@bk\.ru/i).length).toBeGreaterThan(0);
  });
});
