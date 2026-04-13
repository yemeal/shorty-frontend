import { describe, it, expect, beforeEach, vi } from "vitest";
import { screen, fireEvent, waitFor } from "@testing-library/react";
import ProfilePage from "../pages/ProfilePage";
import { renderWithProviders } from "./helpers";

/**
 * Mutable rows for ProfilePage API tests only (fetch is stubbed per test file).
 */
const PROFILE_LIST_TEST_ROWS = [
  {
    id: "11111111-1111-1111-1111-111111111101",
    slug: "spacefox",
    long_url: "https://example.com/blog/space-fox",
    usage_count: 212,
    created_at: "2026-03-27T11:20:00Z",
    updated_at: null,
    is_active: true,
  },
  {
    id: "11111111-1111-1111-1111-111111111102",
    slug: "chillwave",
    long_url: "https://example.com/playlist/chillwave",
    usage_count: 82,
    created_at: "2026-03-30T18:10:00Z",
    updated_at: null,
    is_active: true,
  },
  {
    id: "11111111-1111-1111-1111-111111111103",
    slug: "nightowl",
    long_url: "https://example.com/article/night-productivity",
    usage_count: 146,
    created_at: "2026-04-01T08:40:00Z",
    updated_at: null,
    is_active: true,
  },
  {
    id: "11111111-1111-1111-1111-111111111104",
    slug: "spark-labs",
    long_url: "https://example.com/product/spark-labs",
    usage_count: 67,
    created_at: "2026-04-03T13:00:00Z",
    updated_at: null,
    is_active: true,
  },
  {
    id: "11111111-1111-1111-1111-111111111105",
    slug: "sea-salt",
    long_url: "https://example.com/store/sea-salt",
    usage_count: 15,
    created_at: "2026-04-06T09:15:00Z",
    updated_at: null,
    is_active: true,
  },
  {
    id: "11111111-1111-1111-1111-111111111106",
    slug: "ultra-read",
    long_url: "https://example.com/docs/ultra-read",
    usage_count: 304,
    created_at: "2026-04-08T07:40:00Z",
    updated_at: null,
    is_active: true,
  },
  {
    id: "11111111-1111-1111-1111-111111111107",
    slug: "green-loop",
    long_url: "https://example.com/green-loop",
    usage_count: 43,
    created_at: "2026-04-08T19:20:00Z",
    updated_at: null,
    is_active: true,
  },
  {
    id: "11111111-1111-1111-1111-111111111108",
    slug: "echo",
    long_url: "https://example.com/podcast/echo",
    usage_count: 89,
    created_at: "2026-04-09T12:50:00Z",
    updated_at: null,
    is_active: true,
  },
];

let mutableProfileRows = [];

function cmpCreatedAt(a, b, order) {
  const da = new Date(a.created_at).getTime();
  const db = new Date(b.created_at).getTime();
  return order === "asc" ? da - db : db - da;
}

function cmpUsage(a, b, order) {
  return order === "asc" ? a.usage_count - b.usage_count : b.usage_count - a.usage_count;
}

function buildProfileShortUrlsJsonBody(inputUrl, rows = mutableProfileRows) {
  const u = new URL(inputUrl, "https://шорти.рф");
  const page = Math.max(1, Number(u.searchParams.get("page") || "1"));
  const pageSize = Math.min(20, Math.max(1, Number(u.searchParams.get("page_size") || "5")));
  const sortBy = u.searchParams.get("sort_by") || "created_at";
  const sortOrder = u.searchParams.get("sort_order") || "desc";
  const q = (u.searchParams.get("q") || "").trim().toLowerCase();

  let list = [...rows];
  if (q) {
    list = list.filter(
      (r) => r.slug.toLowerCase().includes(q) || r.long_url.toLowerCase().includes(q),
    );
  }
  list.sort((a, b) => {
    if (sortBy === "usage_count") return cmpUsage(a, b, sortOrder);
    return cmpCreatedAt(a, b, sortOrder);
  });

  const totalItems = list.length;
  const totalPages = totalItems === 0 ? 0 : Math.ceil(totalItems / pageSize);
  const offset = (page - 1) * pageSize;
  const items = list.slice(offset, offset + pageSize);

  const meta = {
    page,
    page_size: pageSize,
    total_pages: totalPages,
    total_items: totalItems,
    sort_by: sortBy,
    sort_order: sortOrder,
    has_next_page: page * pageSize < totalItems,
    has_previous_page: page > 1,
    q: q || null,
  };

  return JSON.stringify({ items, meta });
}

function isDeleteShortUrlUrl(url) {
  try {
    const u = new URL(url, "https://шорти.рф");
    return /^\/me\/short_urls\/[^/?#]+$/i.test(u.pathname);
  } catch {
    return /\/me\/short_urls\/[0-9a-f-]{36}/i.test(String(url));
  }
}

function extractDeleteId(url) {
  const u = new URL(url, "https://шорти.рф");
  const parts = u.pathname.split("/").filter(Boolean);
  return parts[parts.length - 1] || "";
}

function installProfileShortUrlsFetchMock() {
  mutableProfileRows = PROFILE_LIST_TEST_ROWS.map((r) => ({ ...r }));
  return vi.spyOn(globalThis, "fetch").mockImplementation((input, init) => {
    const url = typeof input === "string" ? input : input.url;
    const method = (init && init.method) || "GET";
    const s = String(url);

    if (method === "DELETE" && isDeleteShortUrlUrl(s)) {
      const id = extractDeleteId(s);
      mutableProfileRows = mutableProfileRows.filter((r) => r.id !== id);
      return Promise.resolve({
        ok: true,
        text: async () => JSON.stringify({ ok: true }),
      });
    }

    if (s.includes("/me/short_urls?") || /\/me\/short_urls$/i.test(s.split("?")[0])) {
      return Promise.resolve({
        ok: true,
        text: async () => buildProfileShortUrlsJsonBody(s),
      });
    }

    return Promise.resolve({
      ok: true,
      text: async () => JSON.stringify({ ok: true }),
    });
  });
}

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

  it("animates card collapse after delete confirmation", async () => {
    const { container } = renderWithProviders(<ProfilePage />, { route: "/profile" });
    await waitFor(() => {
      expect(screen.getAllByLabelText(/Delete shorty/i).length).toBeGreaterThanOrEqual(1);
    });
    fireEvent.click(screen.getAllByLabelText(/Delete shorty/i)[0]);
    await waitFor(() => {
      expect(screen.getByTestId("shorty-delete-confirm")).toBeInTheDocument();
    });
    fireEvent.click(screen.getByTestId("shorty-delete-confirm"));
    await waitFor(() => {
      const collapsingWrapper = container.querySelector("div.grid.grid-rows-\\[0fr\\]");
      expect(collapsingWrapper).toBeInTheDocument();
    });
  });

  it("clears matching slug from shorty-recent-links after delete", async () => {
    localStorage.setItem(
      "shorty-recent-links",
      JSON.stringify([
        {
          shortUrl: "localhost/echo",
          original: "https://example.com/podcast/echo",
          date: "2026-01-01T00:00:00.000Z",
        },
      ]),
    );
    renderWithProviders(<ProfilePage />, { route: "/profile" });
    await waitFor(() => {
      expect(screen.getAllByLabelText(/Delete shorty/i).length).toBeGreaterThanOrEqual(1);
    });
    fireEvent.click(screen.getAllByLabelText(/Delete shorty/i)[0]);
    await waitFor(() => {
      expect(screen.getByTestId("shorty-delete-confirm")).toBeInTheDocument();
    });
    fireEvent.click(screen.getByTestId("shorty-delete-confirm"));
    await waitFor(() => {
      const arr = JSON.parse(localStorage.getItem("shorty-recent-links") || "[]");
      expect(Array.isArray(arr)).toBe(true);
      expect(arr).toHaveLength(0);
    });
  });
});
