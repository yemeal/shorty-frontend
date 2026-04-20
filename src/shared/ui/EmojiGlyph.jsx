import React from "react";

/**
 * Platform-native emoji renderer.
 *
 * Apple-style emoji cannot be legally redistributed as a global web asset pack,
 * so this component intentionally uses the host platform's native color font.
 * On Apple devices this resolves to Apple Color Emoji, on Windows to Segoe UI Emoji, etc.
 *
 * Kept API-compatible with the previous implementation so existing call-sites do
 * not need to care whether emoji are rendered as native glyphs or external images.
 */
const EmojiGlyph = ({
  emoji,
  label,
  className = "",
  textClassName = "",
  decorative = false,
}) => {
  const ariaProps = decorative
    ? { "aria-hidden": true }
    : { role: "img", "aria-label": label || emoji };

  return (
    <span
      className={`type-emoji inline-flex items-center justify-center select-none ${className}`.trim()}
      {...ariaProps}
    >
      <span className={`type-emoji leading-none ${textClassName}`.trim()}>{emoji}</span>
    </span>
  );
};

export default EmojiGlyph;
