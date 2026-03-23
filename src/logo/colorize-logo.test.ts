import { describe, expect, it } from "vitest";
import { colorizeLogo } from "./colorize-logo.js";

describe("colorizeLogo", () => {
  // 各行に ANSI カラーコードが付与される
  it("wraps each line with ANSI 24-bit color codes", () => {
    const input = "line1\nline2";
    const result = colorizeLogo(input);
    const lines = result.split("\n");

    expect(lines).toHaveLength(2);
    expect(lines[0]).toBe("\x1b[38;2;120;180;255mline1\x1b[0m");
    expect(lines[1]).toBe("\x1b[38;2;100;160;245mline2\x1b[0m");
  });

  // 空行はスキップされる
  it("skips empty lines", () => {
    const input = "line1\n\nline2\n";
    const result = colorizeLogo(input);
    const lines = result.split("\n");

    expect(lines).toHaveLength(2);
  });

  // グラデーションの色数を超える行は最後の色が使われる
  it("clamps to the last gradient color for extra lines", () => {
    const lines = Array.from({ length: 15 }, (_, i) => `line${i}`).join("\n");
    const result = colorizeLogo(lines);
    const outputLines = result.split("\n");

    // 10行目以降は同じ色 (10, 50, 185)
    for (let i = 9; i < 15; i++) {
      expect(outputLines[i]).toContain("\x1b[38;2;10;50;185m");
    }
  });

  // 空文字列は空文字列を返す
  it("returns empty string for empty input", () => {
    expect(colorizeLogo("")).toBe("");
  });
});
