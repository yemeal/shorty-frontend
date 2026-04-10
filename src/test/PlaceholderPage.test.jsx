import { describe, it, expect, beforeEach, vi } from "vitest";
import { screen, fireEvent, within } from "@testing-library/react";
import ProfilePage from "../pages/ProfilePage";
import { renderWithProviders } from "./helpers";

vi.mock("qrcode.react", () => ({
  QRCodeCanvas: (props) => <canvas data-testid="qr-canvas" id={props.id} />,
}));

beforeEach(() => {
  localStorage.clear();
  localStorage.setItem(
    "shorty-auth-user",
    JSON.stringify({ username: "testuser", email: "a@b.c", emoji: "🦊" }),
  );
  vi.restoreAllMocks();
  vi.spyOn(globalThis, "fetch").mockResolvedValue({
    ok: true,
    text: async () => JSON.stringify({ ok: true }),
  });
});

describe("ProfilePage — render", () => {
  it("renders profile title", () => {
    renderWithProviders(<ProfilePage />, { route: "/profile" });
    expect(screen.getByText(/Profile|Профиль/i)).toBeInTheDocument();
  });

  it("displays user emoji", () => {
    renderWithProviders(<ProfilePage />, { route: "/profile" });
    const emojis = screen.getAllByText("🦊");
    expect(emojis.length).toBeGreaterThanOrEqual(1);
  });

  it("displays username and email", () => {
    renderWithProviders(<ProfilePage />, { route: "/profile" });
    expect(screen.getByText("testuser")).toBeInTheDocument();
    expect(screen.getByText("a@b.c")).toBeInTheDocument();
  });

  it("displays edit profile link", () => {
    renderWithProviders(<ProfilePage />, { route: "/profile" });
    const editLink = screen.getByText(/Edit|Редактировать/i).closest("a");
    expect(editLink).toHaveAttribute("href", "/placeholder");
  });
});

describe("ProfilePage — shorties list", () => {
  it("renders 5 shorty cards on page 1", () => {
    renderWithProviders(<ProfilePage />, { route: "/profile" });
    const articles = screen.getAllByRole("article");
    expect(articles).toHaveLength(5);
  });

  it("shows pagination badge with correct range", () => {
    renderWithProviders(<ProfilePage />, { route: "/profile" });
    expect(screen.getByText(/1–5 \/ 8/)).toBeInTheDocument();
  });

  it("shows page info in pagination bar", () => {
    renderWithProviders(<ProfilePage />, { route: "/profile" });
    expect(screen.getByText(/1 \/ 2/)).toBeInTheDocument();
  });

  it("navigates to page 2", () => {
    renderWithProviders(<ProfilePage />, { route: "/profile" });
    const nextBtn = screen.getByText(/Next|Вперёд/i);
    fireEvent.click(nextBtn);
    const articles = screen.getAllByRole("article");
    expect(articles).toHaveLength(3);
    expect(screen.getByText(/6–8 \/ 8/)).toBeInTheDocument();
  });

  it("prev button disabled on page 1", () => {
    renderWithProviders(<ProfilePage />, { route: "/profile" });
    const prevBtn = screen.getByText(/Prev|Назад/i);
    expect(prevBtn).toBeDisabled();
  });

  it("next button disabled on last page", () => {
    renderWithProviders(<ProfilePage />, { route: "/profile" });
    fireEvent.click(screen.getByText(/Next|Вперёд/i));
    expect(screen.getByText(/Next|Вперёд/i)).toBeDisabled();
  });

  it("prev returns to page 1", () => {
    renderWithProviders(<ProfilePage />, { route: "/profile" });
    fireEvent.click(screen.getByText(/Next|Вперёд/i));
    fireEvent.click(screen.getByText(/Prev|Назад/i));
    expect(screen.getAllByRole("article")).toHaveLength(5);
  });
});

describe("ProfilePage — sort", () => {
  it("default sort is newest first", () => {
    renderWithProviders(<ProfilePage />, { route: "/profile" });
    const articles = screen.getAllByRole("article");
    const first = within(articles[0]).getByText(/шорти\.рф\//);
    expect(first.textContent).toContain("echo");
  });

  it("oldest-first sort works", () => {
    renderWithProviders(<ProfilePage />, { route: "/profile" });
    const select = screen.getByDisplayValue(/Newest|Сначала новые/i);
    fireEvent.change(select, { target: { value: "oldest" } });
    const articles = screen.getAllByRole("article");
    const first = within(articles[0]).getByText(/шорти\.рф\//);
    expect(first.textContent).toContain("spacefox");
  });

  it("most-clicks sort works", () => {
    renderWithProviders(<ProfilePage />, { route: "/profile" });
    const select = screen.getByDisplayValue(/Newest|Сначала новые/i);
    fireEvent.change(select, { target: { value: "clicks_desc" } });
    const articles = screen.getAllByRole("article");
    const first = within(articles[0]).getByText(/шорти\.рф\//);
    expect(first.textContent).toContain("ultra-read");
  });
});

describe("ProfilePage — search", () => {
  it("filters by short URL", () => {
    renderWithProviders(<ProfilePage />, { route: "/profile" });
    const input = screen.getByPlaceholderText(/Search|Поиск/i);
    fireEvent.change(input, { target: { value: "echo" } });
    expect(screen.getAllByRole("article")).toHaveLength(1);
  });

  it("filters by original URL", () => {
    renderWithProviders(<ProfilePage />, { route: "/profile" });
    const input = screen.getByPlaceholderText(/Search|Поиск/i);
    fireEvent.change(input, { target: { value: "podcast" } });
    expect(screen.getAllByRole("article")).toHaveLength(1);
  });

  it("shows empty state when nothing matches", () => {
    renderWithProviders(<ProfilePage />, { route: "/profile" });
    fireEvent.change(screen.getByPlaceholderText(/Search|Поиск/i), {
      target: { value: "zzzzzzzzzzz" },
    });
    expect(screen.queryAllByRole("article")).toHaveLength(0);
    expect(screen.getByText(/No shorties|По текущим/i)).toBeInTheDocument();
  });

  it("resets page to 1 on search", () => {
    renderWithProviders(<ProfilePage />, { route: "/profile" });
    fireEvent.click(screen.getByText(/Next|Вперёд/i));
    fireEvent.change(screen.getByPlaceholderText(/Search|Поиск/i), {
      target: { value: "spa" },
    });
    expect(screen.getByText(/1 \/ 1/)).toBeInTheDocument();
  });
});

describe("ProfilePage — card buttons", () => {
  it("has QR button on each card", () => {
    renderWithProviders(<ProfilePage />, { route: "/profile" });
    const qrBtns = screen.getAllByLabelText(/QR/i);
    expect(qrBtns.length).toBeGreaterThanOrEqual(5);
  });

  it("has copy button on each card", () => {
    renderWithProviders(<ProfilePage />, { route: "/profile" });
    const copyBtns = screen.getAllByLabelText(/copy/i);
    expect(copyBtns.length).toBeGreaterThanOrEqual(5);
  });

  it("has open link on each card", () => {
    renderWithProviders(<ProfilePage />, { route: "/profile" });
    const openBtns = screen.getAllByLabelText(/Open shorty/i);
    expect(openBtns.length).toBeGreaterThanOrEqual(5);
  });

  it("has edit button on each card", () => {
    renderWithProviders(<ProfilePage />, { route: "/profile" });
    const editBtns = screen.getAllByLabelText(/Edit shorty/i);
    expect(editBtns.length).toBeGreaterThanOrEqual(5);
  });

  it("has delete button on each card", () => {
    renderWithProviders(<ProfilePage />, { route: "/profile" });
    const delBtns = screen.getAllByLabelText(/Delete shorty/i);
    expect(delBtns.length).toBeGreaterThanOrEqual(5);
  });

  it("QR button toggles QR code display", () => {
    renderWithProviders(<ProfilePage />, { route: "/profile" });
    const qrBtns = screen.getAllByLabelText(/QR/i);
    fireEvent.click(qrBtns[0]);
    expect(screen.getByTestId("qr-canvas")).toBeInTheDocument();
    fireEvent.click(qrBtns[0]);
  });

  it("copy button copies to clipboard", async () => {
    const writeText = vi.fn().mockResolvedValue(undefined);
    Object.assign(navigator, { clipboard: { writeText } });
    renderWithProviders(<ProfilePage />, { route: "/profile" });
    const copyBtns = screen.getAllByLabelText(/copy/i);
    fireEvent.click(copyBtns[0]);
    expect(writeText).toHaveBeenCalled();
  });

  it("QR download button appears when QR expanded", () => {
    renderWithProviders(<ProfilePage />, { route: "/profile" });
    fireEvent.click(screen.getAllByLabelText(/QR/i)[0]);
    expect(screen.getByText(/Download QR|Скачать QR/i)).toBeInTheDocument();
  });
});
