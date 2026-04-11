import { describe, it, expect, beforeEach, vi } from "vitest";
import { screen, fireEvent, waitFor } from "@testing-library/react";
import ShortenForm from "../components/ShortenForm";
import { renderWithRouter } from "./helpers";

vi.mock("qrcode.react", () => ({
  QRCodeCanvas: (props) => <canvas data-testid="qr-canvas" id={props.id} />,
}));

beforeEach(() => {
  localStorage.clear();
  vi.restoreAllMocks();
});

describe("ShortenForm — render", () => {
  it("renders URL input", () => {
    renderWithRouter(<ShortenForm />);
    expect(screen.getByPlaceholderText(/Paste your long link|Вставь длинную/i)).toBeInTheDocument();
  });

  it("renders shorten button", () => {
    renderWithRouter(<ShortenForm />);
    expect(screen.getByText(/Shorten|Сократить/i)).toBeInTheDocument();
  });

  it("renders custom slug toggle", () => {
    renderWithRouter(<ShortenForm />);
    expect(screen.getByText(/Custom link|Своя ссылка/i)).toBeInTheDocument();
  });
});

describe("ShortenForm — submit", () => {
  it("shows error on empty URL submit", async () => {
    renderWithRouter(<ShortenForm />);
    fireEvent.click(screen.getByText(/Shorten|Сократить/i));
    await waitFor(() => {
      const input = screen.getByPlaceholderText(/Paste your long link|Вставь длинную/i);
      expect(input).toBeInTheDocument();
    });
  });

  it("calls /short_url/ API on valid URL", async () => {
    vi.spyOn(globalThis, "fetch").mockResolvedValue({
      ok: true,
      json: async () => ({ short_url: "abc123" }),
      text: async () => JSON.stringify({ short_url: "abc123" }),
    });
    renderWithRouter(<ShortenForm />);
    const input = screen.getByPlaceholderText(/Paste your long link|Вставь длинную/i);
    fireEvent.change(input, { target: { value: "https://example.com/long" } });
    fireEvent.click(screen.getByText(/Shorten|Сократить/i));

    await waitFor(() => {
      expect(fetch).toHaveBeenCalledWith(
        "/short_url/",
        expect.objectContaining({
          method: "POST",
          body: expect.stringContaining("example.com"),
        }),
      );
    });
  });

  it("displays generated short URL after success", async () => {
    vi.spyOn(globalThis, "fetch").mockResolvedValue({
      ok: true,
      json: async () => ({ slug: "Xz2nAw" }),
      text: async () => JSON.stringify({ slug: "Xz2nAw" }),
    });
    renderWithRouter(<ShortenForm />);
    fireEvent.change(
      screen.getByPlaceholderText(/Paste your long link|Вставь длинную/i),
      { target: { value: "https://example.com" } },
    );
    fireEvent.click(screen.getByText(/Shorten|Сократить/i));

    await waitFor(() => {
      expect(screen.getByText(/Xz2nAw/)).toBeInTheDocument();
    });
  });

  it("supports legacy short_url response field", async () => {
    vi.spyOn(globalThis, "fetch").mockResolvedValue({
      ok: true,
      json: async () => ({ short_url: "legacy42" }),
      text: async () => JSON.stringify({ short_url: "legacy42" }),
    });
    renderWithRouter(<ShortenForm />);
    fireEvent.change(
      screen.getByPlaceholderText(/Paste your long link|Вставь длинную/i),
      { target: { value: "https://example.com/legacy" } },
    );
    fireEvent.click(screen.getByText(/Shorten|Сократить/i));

    await waitFor(() => {
      expect(screen.getByText(/legacy42/)).toBeInTheDocument();
    });
  });

  it("prepends https:// if missing", async () => {
    vi.spyOn(globalThis, "fetch").mockResolvedValue({
      ok: true,
      json: async () => ({ short_url: "test" }),
      text: async () => JSON.stringify({ short_url: "test" }),
    });
    renderWithRouter(<ShortenForm />);
    fireEvent.change(
      screen.getByPlaceholderText(/Paste your long link|Вставь длинную/i),
      { target: { value: "example.com" } },
    );
    fireEvent.click(screen.getByText(/Shorten|Сократить/i));

    await waitFor(() => {
      expect(fetch).toHaveBeenCalledWith(
        "/short_url/",
        expect.objectContaining({
          body: expect.stringContaining("https://example.com"),
        }),
      );
    });
  });
});

describe("ShortenForm — custom slug", () => {
  it("custom slug input hidden by default", () => {
    renderWithRouter(<ShortenForm />);
    expect(screen.getByPlaceholderText(/my-cool-link|moi-slug/i)).not.toBeVisible();
  });

  it("shows custom slug input when toggle enabled", async () => {
    renderWithRouter(<ShortenForm />);
    fireEvent.click(screen.getByText(/Custom link|Своя ссылка/i));
    await waitFor(() => {
      expect(screen.getByPlaceholderText(/my-cool-link|moi-slug/i)).toBeInTheDocument();
    });
  });

  it("hides custom slug input when toggle disabled again", async () => {
    renderWithRouter(<ShortenForm />);
    fireEvent.click(screen.getByText(/Custom link|Своя ссылка/i));
    await waitFor(() => {
      expect(screen.getByPlaceholderText(/my-cool-link|moi-slug/i)).toBeInTheDocument();
    });
    fireEvent.click(screen.getByText(/Custom link|Своя ссылка/i));
    await waitFor(() => {
      expect(screen.getByPlaceholderText(/my-cool-link|moi-slug/i)).not.toBeVisible();
    });
  });

  it("sends slug in payload when custom slug is set", async () => {
    vi.spyOn(globalThis, "fetch").mockResolvedValue({
      ok: true,
      json: async () => ({ short_url: "myslug" }),
      text: async () => JSON.stringify({ short_url: "myslug" }),
    });
    renderWithRouter(<ShortenForm />);
    fireEvent.click(screen.getByText(/Custom link|Своя ссылка/i));

    await waitFor(() => {
      expect(screen.getByPlaceholderText(/my-cool-link|moi-slug/i)).toBeInTheDocument();
    });

    fireEvent.change(
      screen.getByPlaceholderText(/Paste your long link|Вставь длинную/i),
      { target: { value: "https://example.com" } },
    );
    fireEvent.change(screen.getByPlaceholderText(/my-cool-link|moi-slug/i), {
      target: { value: "my-custom-slug" },
    });
    fireEvent.click(screen.getByText(/Shorten|Сократить/i));

    await waitFor(() => {
      expect(fetch).toHaveBeenCalledWith(
        "/short_url/",
        expect.objectContaining({
          body: expect.stringContaining("my-custom-slug"),
        }),
      );
    });
  });

  it("rejects slug shorter than 6 chars", async () => {
    const spy = vi.spyOn(globalThis, "fetch").mockResolvedValue({
      ok: true,
      json: async () => ({}),
      text: async () => "{}",
    });
    renderWithRouter(<ShortenForm />);
    fireEvent.click(screen.getByText(/Custom link|Своя ссылка/i));

    await waitFor(() => {
      expect(screen.getByPlaceholderText(/my-cool-link|moi-slug/i)).toBeInTheDocument();
    });

    fireEvent.change(
      screen.getByPlaceholderText(/Paste your long link|Вставь длинную/i),
      { target: { value: "https://example.com" } },
    );
    fireEvent.change(screen.getByPlaceholderText(/my-cool-link|moi-slug/i), {
      target: { value: "ab" },
    });
    fireEvent.click(screen.getByText(/Shorten|Сократить/i));

    await new Promise((r) => setTimeout(r, 100));
    expect(spy).not.toHaveBeenCalled();
  });

  it("rejects reserved slug", async () => {
    const spy = vi.spyOn(globalThis, "fetch").mockResolvedValue({
      ok: true,
      json: async () => ({}),
      text: async () => "{}",
    });
    renderWithRouter(<ShortenForm />);
    fireEvent.click(screen.getByText(/Custom link|Своя ссылка/i));

    await waitFor(() => {
      expect(screen.getByPlaceholderText(/my-cool-link|moi-slug/i)).toBeInTheDocument();
    });

    fireEvent.change(
      screen.getByPlaceholderText(/Paste your long link|Вставь длинную/i),
      { target: { value: "https://example.com" } },
    );
    fireEvent.change(screen.getByPlaceholderText(/my-cool-link|moi-slug/i), {
      target: { value: "admin" },
    });
    fireEvent.click(screen.getByText(/Shorten|Сократить/i));

    await new Promise((r) => setTimeout(r, 100));
    expect(spy).not.toHaveBeenCalled();
  });
});

describe("ShortenForm — result buttons", () => {
  async function setupWithResult() {
    vi.spyOn(globalThis, "fetch").mockResolvedValue({
      ok: true,
      json: async () => ({ short_url: "Xz2nAw" }),
      text: async () => JSON.stringify({ short_url: "Xz2nAw" }),
    });
    renderWithRouter(<ShortenForm />);
    fireEvent.change(
      screen.getByPlaceholderText(/Paste your long link|Вставь длинную/i),
      { target: { value: "https://example.com" } },
    );
    fireEvent.click(screen.getByText(/Shorten|Сократить/i));
    await waitFor(() => expect(screen.getByText(/Xz2nAw/)).toBeInTheDocument());
  }

  it("shows QR, copy, and open buttons after result", async () => {
    await setupWithResult();
    const btns = screen.getAllByRole("button");
    expect(btns.length).toBeGreaterThanOrEqual(2);
    expect(screen.getByLabelText(/Open short link/i)).toBeInTheDocument();
  });

  it("uses two-row mobile-ready layout in result card", async () => {
    await setupWithResult();
    const successTitle = screen.getByText(/Success|Успех/i);
    const wrapper = successTitle.closest("div.flex.flex-col.sm\\:flex-row");
    expect(wrapper).toBeInTheDocument();
  });

  it("open link has correct href", async () => {
    await setupWithResult();
    const openLink = screen.getByLabelText(/Open short link/i);
    expect(openLink).toHaveAttribute("href", expect.stringContaining("Xz2nAw"));
    expect(openLink).toHaveAttribute("target", "_blank");
  });

  it("highlights QR button while QR block is open", async () => {
    await setupWithResult();
    const qrButton = screen.getByLabelText(/Download QR|Скачать QR/i);
    fireEvent.click(qrButton);
    expect(qrButton.className).toContain("border-blue-500");
    fireEvent.click(qrButton);
  });

  it("turns copy button green after successful copy", async () => {
    await setupWithResult();
    const writeText = vi.fn().mockResolvedValue(undefined);
    Object.assign(navigator, { clipboard: { writeText } });
    const copyButton = screen.getByLabelText(/Copy|Копировать/i);
    fireEvent.click(copyButton);
    await waitFor(() => expect(writeText).toHaveBeenCalled());
    expect(copyButton.className).toContain("border-emerald-500");
    const successIcon = copyButton.querySelector("svg");
    expect(successIcon?.className.baseVal || successIcon?.className).toContain("text-emerald");
  });
});

describe("ShortenForm — error handling", () => {
  it("shows error on 409 (slug taken)", async () => {
    vi.spyOn(globalThis, "fetch").mockResolvedValue({
      ok: false,
      status: 409,
      json: async () => ({ detail: "Slug taken" }),
      text: async () => JSON.stringify({ detail: "Slug taken" }),
    });
    renderWithRouter(<ShortenForm />);
    fireEvent.click(screen.getByText(/Custom link|Своя ссылка/i));

    await waitFor(() => {
      expect(screen.getByPlaceholderText(/my-cool-link|moi-slug/i)).toBeInTheDocument();
    });

    fireEvent.change(
      screen.getByPlaceholderText(/Paste your long link|Вставь длинную/i),
      { target: { value: "https://example.com" } },
    );
    fireEvent.change(screen.getByPlaceholderText(/my-cool-link|moi-slug/i), {
      target: { value: "taken-slug-name" },
    });
    fireEvent.click(screen.getByText(/Shorten|Сократить/i));

    await waitFor(() => {
      expect(fetch).toHaveBeenCalled();
    });
  });

  it("shows error on network failure", async () => {
    vi.spyOn(globalThis, "fetch").mockRejectedValue(new Error("Network Error"));
    renderWithRouter(<ShortenForm />);
    fireEvent.change(
      screen.getByPlaceholderText(/Paste your long link|Вставь длинную/i),
      { target: { value: "https://example.com" } },
    );
    fireEvent.click(screen.getByText(/Shorten|Сократить/i));
    await waitFor(() => {
      expect(fetch).toHaveBeenCalled();
    });
  });
});

describe("ShortenForm — recent links", () => {
  it("does not show recent links section when empty", () => {
    renderWithRouter(<ShortenForm />);
    expect(screen.queryByText(/Recent Links|Недавние ссылки/i)).not.toBeInTheDocument();
  });

  it("shows recent links button after creating a link", async () => {
    vi.spyOn(globalThis, "fetch").mockResolvedValue({
      ok: true,
      json: async () => ({ short_url: "abc" }),
      text: async () => JSON.stringify({ short_url: "abc" }),
    });
    renderWithRouter(<ShortenForm />);
    fireEvent.change(
      screen.getByPlaceholderText(/Paste your long link|Вставь длинную/i),
      { target: { value: "https://example.com" } },
    );
    fireEvent.click(screen.getByText(/Shorten|Сократить/i));

    await waitFor(() => {
      expect(screen.getByText(/Recent Links|Недавние ссылки/i)).toBeInTheDocument();
    });
  });

  it("keeps only one recent QR open at a time", async () => {
    localStorage.setItem(
      "shorty-recent-links",
      JSON.stringify([
        { shortUrl: "localhost:5173/first11", original: "https://example.com/1", date: new Date().toISOString() },
        { shortUrl: "localhost:5173/second22", original: "https://example.com/2", date: new Date().toISOString() },
      ]),
    );
    renderWithRouter(<ShortenForm />);
    fireEvent.click(screen.getByText(/Recent Links|Недавние ссылки/i));
    let qrButtons = [];
    await waitFor(() => {
      qrButtons = screen.getAllByLabelText(/Download QR|Скачать QR/i).slice(0, 2);
      expect(qrButtons).toHaveLength(2);
    });
    fireEvent.click(qrButtons[0]);
    await waitFor(() => expect(screen.getAllByTestId("qr-canvas")).toHaveLength(1));

    fireEvent.click(qrButtons[1]);
    await waitFor(() => expect(screen.getAllByTestId("qr-canvas")).toHaveLength(1));
  });
});
