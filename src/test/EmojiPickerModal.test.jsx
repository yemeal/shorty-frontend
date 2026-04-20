import { describe, it, expect, vi } from "vitest";
import { render, screen, fireEvent, waitFor } from "@testing-library/react";
import EmojiPickerModal from "../shared/ui/EmojiPickerModal";
import { EMOJI_CATEGORIES } from "../shared/config/emojiData";

// Mock scrollIntoView which is not implemented in JSDOM
Element.prototype.scrollIntoView = vi.fn();

describe("EmojiPickerModal", () => {
  const defaultI18n = {
    emojiPickerTitle: "Choose emoji",
    emojiPickerSearch: "Search emoji...",
    emojiPickerNoResults: "No emoji found",
  };

  it("does not render when isOpen is false", () => {
    render(<EmojiPickerModal isOpen={false} onSelect={() => {}} onClose={() => {}} t={defaultI18n} />);
    expect(screen.queryByText("Choose emoji")).not.toBeInTheDocument();
  });

  it("renders when isOpen is true", () => {
    render(<EmojiPickerModal isOpen={true} onSelect={() => {}} onClose={() => {}} t={defaultI18n} />);
    expect(screen.getByText("Choose emoji")).toBeInTheDocument();
    expect(screen.getByPlaceholderText("Search emoji...")).toBeInTheDocument();
  });

  it("filters emojis by search term", async () => {
    render(<EmojiPickerModal isOpen={true} onSelect={() => {}} onClose={() => {}} t={defaultI18n} />);
    const searchInput = screen.getByPlaceholderText("Search emoji...");
    
    // Type something that doesn't exist
    fireEvent.change(searchInput, { target: { value: "notarealemoji123" } });
    await waitFor(() => {
      expect(screen.getByText("No emoji found")).toBeInTheDocument();
    });

    // Type something that does exist (e.g., Hamburger, which we know is a food)
    fireEvent.change(searchInput, { target: { value: "burger" } });
    await waitFor(() => {
      expect(screen.queryByText("No emoji found")).not.toBeInTheDocument();
      // Should find at least one button matching the emoji
      const btns = screen.getAllByRole("button");
      expect(btns.length).toBeGreaterThan(1); // including internal modal buttons
    });
  });

  it("calls onSelect when an emoji is clicked", async () => {
    const onSelectMock = vi.fn();
    render(<EmojiPickerModal isOpen={true} onSelect={onSelectMock} onClose={() => {}} t={defaultI18n} />);
    
    // Click the first available emoji in the first category
    const firstEmoji = EMOJI_CATEGORIES[0].emojis[0][0];
    const emojiBtn = screen.getByRole("button", { name: firstEmoji });
    
    fireEvent.click(emojiBtn);
    
    await waitFor(() => {
      expect(onSelectMock).toHaveBeenCalledWith(firstEmoji);
    });
  });

  it("calls onClose when escape is pressed or close button clicked", async () => {
    const onCloseMock = vi.fn();
    render(
      <EmojiPickerModal isOpen={true} onSelect={() => {}} onClose={onCloseMock} t={defaultI18n} />
    );
    
    const closeBtn = screen.getByRole("button", { name: "Close" });
    fireEvent.click(closeBtn);
    
    await waitFor(() => {
      expect(onCloseMock).toHaveBeenCalledTimes(1);
    });

    // Fire escape
    fireEvent.keyDown(window, { key: "Escape", code: "Escape" });
    await waitFor(() => {
      expect(onCloseMock).toHaveBeenCalledTimes(2);
    });
  });

  it("renders category tabs after (below) the emoji grid in DOM order", () => {
    const { container } = render(
      <EmojiPickerModal isOpen={true} onSelect={() => {}} onClose={() => {}} t={defaultI18n} />
    );
    // The scrollable grid wrapper comes before the category bar in the DOM.
    const scrollArea = container.querySelector(".relative.flex-1");
    if (!scrollArea) return; // guard
    const children = [...scrollArea.children];
    // Grid div = overflow-y-auto, category bar = !absolute bottom-2
    const gridIdx = children.findIndex((el) => el.classList.contains("overflow-y-auto"));
    const catIdx = children.findIndex((el) => el.classList.contains("overflow-hidden"));
    expect(gridIdx).toBeLessThan(catIdx);
  });

  it("has a mobile-safe max height on the modal container", () => {
    const { container } = render(
      <EmojiPickerModal isOpen={true} onSelect={() => {}} onClose={() => {}} t={defaultI18n} />
    );
    const modal = container.querySelector(
      ".max-h-\\[calc\\(100dvh-6\\.25rem-env\\(safe-area-inset-bottom\\,0px\\)\\)\\]",
    );
    expect(modal).toBeInTheDocument();
  });

  it("uses a mobile bottom-sheet layout that keeps clear of the header", () => {
    const { container } = render(
      <EmojiPickerModal isOpen={true} onSelect={() => {}} onClose={() => {}} t={defaultI18n} />
    );

    const overlayShell = container.querySelector(".justify-end");
    const modal = container.querySelector(
      ".max-h-\\[calc\\(100dvh-6\\.25rem-env\\(safe-area-inset-bottom\\,0px\\)\\)\\]",
    );
    const categoryBar = container.querySelector(
      ".bottom-\\[calc\\(env\\(safe-area-inset-bottom\\,0px\\)\\+0\\.5rem\\)\\]",
    );
    const emojiGrid = container.querySelector(".grid-cols-5");

    expect(overlayShell?.className).toContain("sm:justify-center");
    expect(overlayShell?.className).toContain("pt-[6.25rem]");
    expect(modal?.className).toContain("sm:max-h-[92vh]");
    expect(categoryBar?.className).toContain("sm:bottom-2");
    expect(emojiGrid?.className).toContain("sm:grid-cols-6");
  });

  it("hides category tabs when searching", async () => {
    const { container } = render(
      <EmojiPickerModal isOpen={true} onSelect={() => {}} onClose={() => {}} t={defaultI18n} />
    );
    const searchInput = screen.getByPlaceholderText("Search emoji...");

    // Initially tabs are visible
    const catBar = container.querySelector("[data-cat-id]");
    expect(catBar).toBeInTheDocument();

    // Type a search query → tabs should disappear
    fireEvent.change(searchInput, { target: { value: "smile" } });
    await waitFor(() => {
      const catBarAfter = container.querySelector("[data-cat-id]");
      expect(catBarAfter).not.toBeInTheDocument();
    });
  });
});
