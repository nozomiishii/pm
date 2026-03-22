import { describe, expect, it } from "vitest";
import { stripEmojiLabel } from "./strip-emoji-label.js";

// 文字列から絵文字を除去してラベル名だけ取り出す
describe("stripEmojiLabel", () => {
  // 単純な絵文字プレフィックスを除去する
  it("strips a simple emoji prefix", () => {
    expect(stripEmojiLabel("🪴 brain")).toBe("brain");
  });

  // 肌色(暗)の ZWJ シーケンスを除去する
  it("strips dark skin-tone ZWJ sequence", () => {
    expect(stripEmojiLabel("🧙🏿‍♂️ dotfiles")).toBe("dotfiles");
  });

  // 肌色(明)の ZWJ シーケンスを除去する
  it("strips light skin-tone ZWJ sequence", () => {
    expect(stripEmojiLabel("👨🏻‍🚀 dev")).toBe("dev");
  });

  // 異体字セレクタ付き絵文字を除去する
  it("strips satellite emoji with variation selector", () => {
    expect(stripEmojiLabel("🛰️ infra")).toBe("infra");
  });

  // 絵文字のみの場合は空文字を返す
  it("returns empty string for emoji-only input", () => {
    expect(stripEmojiLabel("🦕")).toBe("");
  });

  // プレーンテキストはそのまま返す
  it("returns plain text unchanged", () => {
    expect(stripEmojiLabel("configs")).toBe("configs");
  });

  // 余分な空白を正規化する
  it("normalizes extra whitespace", () => {
    expect(stripEmojiLabel("  hello   world  ")).toBe("hello world");
  });
});
