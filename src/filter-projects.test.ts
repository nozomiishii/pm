import { describe, expect, test } from "vitest";
import type { Project } from "./types.js";
import { filterProjects } from "./filter-projects.js";

// enabled と tags による絞り込み
describe("filterProjects", () => {
  const projects: Project[] = [
    { enabled: true, name: "a", rootPath: "~/a", tags: ["workspace"] },
    { enabled: true, name: "b", rootPath: "~/b", tags: ["dev"] },
    { enabled: true, name: "c", rootPath: "~/c", tags: ["workspace", "dev"] },
    { enabled: false, name: "d", rootPath: "~/d", tags: [] },
    { name: "e", rootPath: "~/e", tags: ["workspace"] },
  ];

  // タグ未指定なら enabled: true のものを全て返す
  test("returns all enabled when no tags given", () => {
    const result = filterProjects(projects, []);
    const names = result.map((p) => p.name);

    expect(names).toStrictEqual(["a", "b", "c", "e"]);
  });

  // 単一タグで絞り込む
  test("filters by single tag", () => {
    const result = filterProjects(projects, ["workspace"]);
    const names = result.map((p) => p.name);

    expect(names).toStrictEqual(["a", "c", "e"]);
  });

  // 複数タグは AND 条件で絞り込む
  test("filters by multiple tags (AND)", () => {
    const result = filterProjects(projects, ["workspace", "dev"]);
    const names = result.map((p) => p.name);

    expect(names).toStrictEqual(["c"]);
  });

  // enabled: false は常に除外する
  test("excludes disabled even if tags match", () => {
    const result = filterProjects(projects, []);

    expect(result.find((p) => p.name === "d")).toBeUndefined();
  });

  // enabled フィールドが未定義ならデフォルトで有効扱い
  test("includes projects without explicit enabled field", () => {
    const result = filterProjects(projects, []);

    expect(result.find((p) => p.name === "e")).toBeDefined();
  });
});
