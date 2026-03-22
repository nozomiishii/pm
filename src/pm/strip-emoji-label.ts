/** Remove emoji (incl. modifiers, ZWJ) and normalize whitespace. */
export function stripEmojiLabel(s: string): string {
  let t = s.normalize("NFC");
  for (let i = 0; i < 4; i++) {
    t = t
      .replace(/\p{Extended_Pictographic}/gu, "")
      .replace(/\p{Emoji_Modifier}/gu, "")
      .replace(/\u200d/g, "")
      .replace(/\ufe0f/g, "")
      .replace(/\ufe0e/g, "");
  }
  return t.replace(/\s+/g, " ").trim();
}
