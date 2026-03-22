import path from "node:path";
import { describe, expect, it } from "vitest";
import { expandHome } from "./expand-home.js";

// ~/ をホームディレクトリに展開する
describe("expandHome", () => {
  const home = process.env.HOME ?? "";

  // ~/ 付きパスを $HOME に展開する
  it("expands ~/ prefix", () => {
    expect(expandHome("~/dotfiles")).toBe(path.join(home, "dotfiles"));
  });

  // ~ 単体を $HOME に展開する
  it("expands bare ~", () => {
    expect(expandHome("~")).toBe(home);
  });

  // 絶対パスはそのまま返す
  it("leaves absolute paths unchanged", () => {
    expect(expandHome("/usr/local/bin")).toBe("/usr/local/bin");
  });

  // 相対パスはそのまま返す
  it("leaves relative paths unchanged", () => {
    expect(expandHome("./foo/bar")).toBe("./foo/bar");
  });
});
