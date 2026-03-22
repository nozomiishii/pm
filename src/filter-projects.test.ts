import { describe, expect, it } from "vitest";
import type { Project } from "./types.js";
import { filterProjects } from "./filter-projects.js";

// enabled と tags による絞り込み
describe("filterProjects", () => {
  const projects: Project[] = [
    { name: "a", rootPath: "~/a", tags: ["workspace"], enabled: true },
    { name: "b", rootPath: "~/b", tags: ["dev"], enabled: true },
    { name: "c", rootPath: "~/c", tags: ["workspace", "dev"], enabled: true },
    { name: "d", rootPath: "~/d", tags: [], enabled: false },
    { name: "e", rootPath: "~/e", tags: ["workspace"] },
  ];

  // タグ未指定なら enabled: true のものを全て返す
  it("returns all enabled when no tags given", () => {
    const result = filterProjects(projects, []);
    const names = result.map((p) => p.name);
    expect(names).toEqual(["a", "b", "c", "e"]);
  });

  // 単一タグで絞り込む
  it("filters by single tag", () => {
    const result = filterProjects(projects, ["workspace"]);
    const names = result.map((p) => p.name);
    expect(names).toEqual(["a", "c", "e"]);
  });

  // 複数タグは AND 条件で絞り込む
  it("filters by multiple tags (AND)", () => {
    const result = filterProjects(projects, ["workspace", "dev"]);
    const names = result.map((p) => p.name);
    expect(names).toEqual(["c"]);
  });

  // enabled: false は常に除外する
  it("excludes disabled even if tags match", () => {
    const result = filterProjects(projects, []);
    expect(result.find((p) => p.name === "d")).toBeUndefined();
  });

  // enabled フィールドが未定義ならデフォルトで有効扱い
  it("includes projects without explicit enabled field", () => {
    const result = filterProjects(projects, []);
    expect(result.find((p) => p.name === "e")).toBeDefined();
  });
});
