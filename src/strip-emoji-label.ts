/** Remove emoji (incl. modifiers, ZWJ) and normalize whitespace. */
export function stripEmojiLabel(s: string): string {
  let t = s.normalize("NFC");

  for (let i = 0; i < 4; i++) {
    t = t.replaceAll(
      /[\p{Extended_Pictographic}\p{Emoji_Modifier}\p{Variation_Selector}\u{200D}]/gv,
      "",
    );
  }

  return t.replaceAll(/\s+/g, " ").trim();
}
