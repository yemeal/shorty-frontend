import { describe, it, expect, beforeEach, vi } from "vitest";
import { screen, fireEvent, waitFor } from "@testing-library/react";
import ProfilePage from "../pages/ProfilePage";
import { renderWithProviders } from "./helpers";
import { installProfileShortUrlsFetchMock } from "./profileShortUrlsApiMock";

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
  installProfileShortUrlsFetchMock();
});

async function expectArticleCount(n) {
  await waitFor(() => {
    expect(screen.getAllByRole("article")).toHaveLength(n);
  });
}

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
  it("renders 5 shorty cards on page 1", async () => {
    renderWithProviders(<ProfilePage />, { route: "/profile" });
    await expectArticleCount(5);
  });

  it("shows pagination badge with correct range", async () => {
    renderWithProviders(<ProfilePage />, { route: "/profile" });
    await waitFor(() => {
      expect(screen.getByText(/1-5 (из|of) 8/)).toBeInTheDocument();
    });
  });

  it("shows page info in pagination bar", async () => {
    renderWithProviders(<ProfilePage />, { route: "/profile" });
    await waitFor(() => {
      expect(screen.getByText(/1 \/ 2/)).toBeInTheDocument();
    });
  });

  it("navigates to page 2", async () => {
    renderWithProviders(<ProfilePage />, { route: "/profile" });
    await expectArticleCount(5);
    fireEvent.click(screen.getByText(/Next|Вперёд/i));
    await expectArticleCount(3);
    await waitFor(() => {
      expect(screen.getByText(/6-8 (из|of) 8/)).toBeInTheDocument();
    });
  });

  it("prev button disabled on page 1", async () => {
    renderWithProviders(<ProfilePage />, { route: "/profile" });
    await expectArticleCount(5);
    const prevBtn = screen.getByText(/Prev|Назад/i);
    expect(prevBtn).toBeDisabled();
  });

  it("next button disabled on last page", async () => {
    renderWithProviders(<ProfilePage />, { route: "/profile" });
    await expectArticleCount(5);
    fireEvent.click(screen.getByText(/Next|Вперёд/i));
    await expectArticleCount(3);
    await waitFor(() => {
      expect(screen.getByText(/Next|Вперёд/i)).toBeDisabled();
    });
  });

  it("prev returns to page 1", async () => {
    renderWithProviders(<ProfilePage />, { route: "/profile" });
    await expectArticleCount(5);
    fireEvent.click(screen.getByText(/Next|Вперёд/i));
    await expectArticleCount(3);
    fireEvent.click(screen.getByText(/Prev|Назад/i));
    await expectArticleCount(5);
  });
});

describe("ProfilePage — sort", () => {
  it("default sort is newest first", async () => {
    renderWithProviders(<ProfilePage />, { route: "/profile" });
    await waitFor(() => {
      const articles = screen.getAllByRole("article");
      expect(articles[0].textContent).toContain("echo");
    });
  });

  it("oldest-first sort works", async () => {
    renderWithProviders(<ProfilePage />, { route: "/profile" });
    await expectArticleCount(5);
    const select = screen.getByDisplayValue(/Newest|Сначала новые/i);
    fireEvent.change(select, { target: { value: "oldest" } });
    await waitFor(() => {
      const articles = screen.getAllByRole("article");
      expect(articles[0].textContent).toContain("spacefox");
    });
  });

  it("most-clicks sort works", async () => {
    renderWithProviders(<ProfilePage />, { route: "/profile" });
    await expectArticleCount(5);
    const select = screen.getByDisplayValue(/Newest|Сначала новые/i);
    fireEvent.change(select, { target: { value: "clicks_desc" } });
    await waitFor(() => {
      const articles = screen.getAllByRole("article");
      expect(articles[0].textContent).toContain("ultra-read");
    });
  });
});

describe("ProfilePage — search", () => {
  it("filters by short URL", async () => {
    renderWithProviders(<ProfilePage />, { route: "/profile" });
    await expectArticleCount(5);
    const input = screen.getByPlaceholderText(/Search|Поиск/i);
    fireEvent.change(input, { target: { value: "echo" } });
    await expectArticleCount(1);
  });

  it("filters by original URL", async () => {
    renderWithProviders(<ProfilePage />, { route: "/profile" });
    await expectArticleCount(5);
    const input = screen.getByPlaceholderText(/Search|Поиск/i);
    fireEvent.change(input, { target: { value: "podcast" } });
    await expectArticleCount(1);
  });

  it("shows empty state when nothing matches", async () => {
    renderWithProviders(<ProfilePage />, { route: "/profile" });
    await expectArticleCount(5);
    fireEvent.change(screen.getByPlaceholderText(/Search|Поиск/i), {
      target: { value: "zzzzzzzzzzz" },
    });
    await waitFor(() => {
      expect(screen.queryAllByRole("article")).toHaveLength(0);
    });
    expect(screen.getByText(/No shorties|По текущим/i)).toBeInTheDocument();
  });

  it("resets page to 1 on search", async () => {
    renderWithProviders(<ProfilePage />, { route: "/profile" });
    await expectArticleCount(5);
    fireEvent.click(screen.getByText(/Next|Вперёд/i));
    await expectArticleCount(3);
    fireEvent.change(screen.getByPlaceholderText(/Search|Поиск/i), {
      target: { value: "spa" },
    });
    await waitFor(() => {
      expect(screen.getByText(/1 \/ 1/)).toBeInTheDocument();
    });
  });
});

describe("ProfilePage — card buttons", () => {
  it("has QR button on each card", async () => {
    renderWithProviders(<ProfilePage />, { route: "/profile" });
    await waitFor(() => {
      const qrBtns = screen.getAllByLabelText(/QR/i);
      expect(qrBtns.length).toBeGreaterThanOrEqual(5);
    });
  });

  it("has copy button on each card", async () => {
    renderWithProviders(<ProfilePage />, { route: "/profile" });
    await waitFor(() => {
      const copyBtns = screen.getAllByLabelText(/copy/i);
      expect(copyBtns.length).toBeGreaterThanOrEqual(5);
    });
  });

  it("has open link on each card", async () => {
    renderWithProviders(<ProfilePage />, { route: "/profile" });
    await waitFor(() => {
      const openBtns = screen.getAllByLabelText(/Open shorty/i);
      expect(openBtns.length).toBeGreaterThanOrEqual(5);
    });
  });

  it("has edit button on each card", async () => {
    renderWithProviders(<ProfilePage />, { route: "/profile" });
    await waitFor(() => {
      const editBtns = screen.getAllByLabelText(/Edit shorty/i);
      expect(editBtns.length).toBeGreaterThanOrEqual(5);
    });
  });

  it("has delete button on each card", async () => {
    renderWithProviders(<ProfilePage />, { route: "/profile" });
    await waitFor(() => {
      const delBtns = screen.getAllByLabelText(/Delete shorty/i);
      expect(delBtns.length).toBeGreaterThanOrEqual(5);
    });
  });

  it("delete button is neutral until hover state", async () => {
    renderWithProviders(<ProfilePage />, { route: "/profile" });
    await waitFor(() => {
      expect(screen.getAllByLabelText(/Delete shorty/i).length).toBeGreaterThanOrEqual(1);
    });
    const deleteButton = screen.getAllByLabelText(/Delete shorty/i)[0];
    expect(deleteButton.className).toContain("text-slate-500");
    expect(deleteButton.className).toContain("hover:text-red-500");
  });

  it("QR button toggles QR code display", async () => {
    renderWithProviders(<ProfilePage />, { route: "/profile" });
    await waitFor(() => {
      expect(screen.getAllByLabelText(/QR/i).length).toBeGreaterThanOrEqual(1);
    });
    const qrBtns = screen.getAllByLabelText(/QR/i);
    fireEvent.click(qrBtns[0]);
    expect(screen.getByTestId("qr-canvas")).toBeInTheDocument();
    fireEvent.click(qrBtns[0]);
  });

  it("copy button copies to clipboard", async () => {
    const writeText = vi.fn().mockResolvedValue(undefined);
    Object.assign(navigator, { clipboard: { writeText } });
    renderWithProviders(<ProfilePage />, { route: "/profile" });
    await waitFor(() => {
      expect(screen.getAllByLabelText(/copy/i).length).toBeGreaterThanOrEqual(1);
    });
    const copyBtns = screen.getAllByLabelText(/copy/i);
    fireEvent.click(copyBtns[0]);
    expect(writeText).toHaveBeenCalled();
  });

  it("QR download button appears when QR expanded", async () => {
    renderWithProviders(<ProfilePage />, { route: "/profile" });
    await waitFor(() => {
      expect(screen.getAllByLabelText(/QR/i).length).toBeGreaterThanOrEqual(1);
    });
    fireEvent.click(screen.getAllByLabelText(/QR/i)[0]);
    expect(screen.getByText(/Download QR|Скачать QR/i)).toBeInTheDocument();
  });

  it("uses two-row mobile-ready card layout", async () => {
    renderWithProviders(<ProfilePage />, { route: "/profile" });
    await waitFor(() => {
      expect(screen.getAllByRole("article").length).toBeGreaterThanOrEqual(1);
    });
    const firstArticle = screen.getAllByRole("article")[0];
    const row = firstArticle.querySelector("div.flex.flex-col.sm\\:flex-row");
    expect(row).toBeInTheDocument();
  });

  it("centers card actions row", async () => {
    renderWithProviders(<ProfilePage />, { route: "/profile" });
    await waitFor(() => {
      expect(screen.getAllByRole("article").length).toBeGreaterThanOrEqual(1);
    });
    const firstArticle = screen.getAllByRole("article")[0];
    const actionsRow = firstArticle.querySelector("div.justify-center");
    expect(actionsRow).toBeInTheDocument();
  });

  it("animates card collapse before deletion", async () => {
    const { container } = renderWithProviders(<ProfilePage />, { route: "/profile" });
    await waitFor(() => {
      expect(screen.getAllByLabelText(/Delete shorty/i).length).toBeGreaterThanOrEqual(1);
    });
    const deleteButton = screen.getAllByLabelText(/Delete shorty/i)[0];
    fireEvent.click(deleteButton);
    const collapsingWrapper = container.querySelector("div.grid.grid-rows-\\[0fr\\]");
    expect(collapsingWrapper).toBeInTheDocument();
  });
});
