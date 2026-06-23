import { describe, expect, test } from "vitest";
import type { Project } from "./types.js";
import { findProject } from "./find-project.js";

const projects: Project[] = [
  { enabled: true, name: "🧙🏿‍♂️ dotfiles", rootPath: "~/dotfiles" },
  { enabled: true, name: "🪴 brain", rootPath: "~/brain" },
  { enabled: true, name: "🛰️ infra", rootPath: "~/Code/nozomiishii/infra" },
];

// findProject: 引数の名前からプロジェクトを検索する
describe("findProject", () => {
  // プレーンラベル（絵文字除去後）でマッチする
  test("matches by plain label", () => {
    const result = findProject(projects, "dotfiles");

    expect(result?.name).toBe("🧙🏿‍♂️ dotfiles");
  });

  // 生の name（絵文字付き）でもマッチする
  test("matches by raw name with emoji", () => {
    const result = findProject(projects, "🪴 brain");

    expect(result?.name).toBe("🪴 brain");
  });

  // 存在しない名前は undefined を返す
  test("returns undefined for unknown name", () => {
    expect(findProject(projects, "nonexistent")).toBeUndefined();
  });

  // プレーンラベルが重複する場合はエラーを投げる
  test("throws on ambiguous match", () => {
    const dupes: Project[] = [
      { enabled: true, name: "🚀 app", rootPath: "~/a" },
      { enabled: true, name: "🎯 app", rootPath: "~/b" },
    ];

    expect(() => findProject(dupes, "app")).toThrow("Ambiguous");
  });
});
