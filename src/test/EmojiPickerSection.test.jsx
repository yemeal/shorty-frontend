import { describe, it, expect, vi } from "vitest";
import { render, screen, fireEvent, waitFor } from "@testing-library/react";
import EmojiPickerSection from "../features/profile/ui/EmojiPickerSection";

vi.mock("../LangContext", () => ({
  useLang: () => ({
    lang: "en",
    t: {
      profileEditAvatarLabel: "Avatar",
      avatarPreview: "Avatar Preview",
      profileEditAvatarHint: "Customize your identity",
      profileEditChangeEmoji: "Choose emoji",
      emojiPickerTitle: "Choose emoji",
      emojiPickerSearch: "Search...",
    }
  })
}));

// Mock scrollIntoView
Element.prototype.scrollIntoView = vi.fn();

describe("EmojiPickerSection", () => {
  it("renders the current emoji and description", async () => {
    // 🍔 matches "Hamburger" via getEmojiDesc for EN
    render(<EmojiPickerSection emoji="🍔" onChange={() => {}} />);
    
    expect(screen.getAllByText("🍔").length).toBeGreaterThanOrEqual(1);
    expect(await screen.findByText("Hamburger")).toBeInTheDocument();
  });

  it("opens the EmojiPickerModal when 'Choose emoji' is clicked", async () => {
    render(<EmojiPickerSection emoji="🍔" onChange={() => {}} />);
    
    // Modal is initially closed
    expect(screen.queryByPlaceholderText("Search...")).not.toBeInTheDocument();

    const changeBtn = screen.getByText("Choose emoji");
    fireEvent.click(changeBtn);

    await waitFor(() => {
      // Input from the modal should appear
      expect(screen.getByPlaceholderText("Search...")).toBeInTheDocument();
    });
  });

  it("calls onChange when an emoji is selected from the picker", async () => {
    const onChangeMock = vi.fn();
    render(<EmojiPickerSection emoji="🍔" onChange={onChangeMock} />);
    
    fireEvent.click(screen.getByText("Choose emoji"));

    await waitFor(() => {
      expect(screen.getByPlaceholderText("Search...")).toBeInTheDocument();
    });

    // Pick an emoji from the opened modal
    // For example, picking the first smile: 😀
    const emojiBtn = screen.getByRole("button", { name: "😀" });
    fireEvent.click(emojiBtn);

    await waitFor(() => {
      expect(onChangeMock).toHaveBeenCalledWith("😀");
    });
  });
});
