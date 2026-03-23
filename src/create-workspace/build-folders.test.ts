import path from "node:path";
import { describe, expect, it } from "vitest";
import type { Project } from "../types.js";
import { buildFolders } from "./build-folders.js";

// projects から workspace の folders 配列を組み立てる
describe("buildFolders", () => {
  const home = process.env.HOME ?? "";
  const workspaceDir = path.join(home, "Code/nozomiishii/workspaces");

  // workspaceDir からの相対パスを計算する
  it("computes relative paths from workspaceDir", () => {
    const projects: Project[] = [
      { name: "infra", rootPath: "~/Code/nozomiishii/infra", enabled: true },
    ];
    const folders = buildFolders(projects, { tags: [], workspaceDir });
    expect(folders).toEqual([{ name: "infra", path: "../infra" }]);
  });

  // 同一ディレクトリの場合は "." になる
  it("uses '.' for same directory", () => {
    const projects: Project[] = [
      {
        name: "workspaces",
        rootPath: "~/Code/nozomiishii/workspaces",
        enabled: true,
      },
    ];
    const folders = buildFolders(projects, { tags: [], workspaceDir });
    expect(folders).toEqual([{ name: "workspaces", path: "." }]);
  });

  // name から絵文字を除去する
  it("strips emoji from name", () => {
    const projects: Project[] = [
      { name: "🪴 brain", rootPath: "~/brain", enabled: true },
    ];
    const folders = buildFolders(projects, { tags: [], workspaceDir });
    expect(folders[0]!.name).toBe("brain");
  });

  // 絵文字のみの場合はパスの basename にフォールバックする
  it("falls back to basename when name is emoji-only", () => {
    const projects: Project[] = [
      { name: "🦕", rootPath: "~/Code/nozomiishii/dino", enabled: true },
    ];
    const folders = buildFolders(projects, { tags: [], workspaceDir });
    expect(folders[0]!.name).toBe("dino");
  });

  // name フィールドが必ず出力される
  it("always includes name field", () => {
    const projects: Project[] = [
      { name: "dotfiles", rootPath: "~/dotfiles", enabled: true },
    ];
    const folders = buildFolders(projects, { tags: [], workspaceDir });
    expect(folders[0]).toHaveProperty("name", "dotfiles");
    expect(folders[0]).toHaveProperty("path");
  });

  // タグフィルタが適用される
  it("applies tag filter", () => {
    const projects: Project[] = [
      {
        name: "a",
        rootPath: "~/Code/nozomiishii/a",
        tags: ["workspace"],
        enabled: true,
      },
      { name: "b", rootPath: "~/Code/nozomiishii/b", tags: [], enabled: true },
    ];
    const folders = buildFolders(projects, {
      tags: ["workspace"],
      workspaceDir,
    });
    expect(folders).toHaveLength(1);
    expect(folders[0]!.name).toBe("a");
  });
});
