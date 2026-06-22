/** Remove emoji (incl. modifiers, ZWJ) and normalize whitespace. */
export function stripEmojiLabel(s: string): string {
  let t = s.normalize("NFC");

  for (let i = 0; i < 4; i++) {
    t = t
      .replaceAll(/\p{Extended_Pictographic}/gu, "")
      .replaceAll(/\p{Emoji_Modifier}/gu, "")
      .replaceAll("\u{200D}", "")
      .replaceAll("\u{FE0F}", "")
      .replaceAll("\u{FE0E}", "");
  }

  return t.replaceAll(/\s+/g, " ").trim();
}
