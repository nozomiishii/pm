import { mkdtemp, rm, writeFile } from "node:fs/promises";
import os from "node:os";
import path from "node:path";
import { afterEach, beforeEach, describe, expect, it } from "vitest";
import { loadExistingWorkspace } from "./load-existing-workspace.js";

// 既存 workspace ファイルから folders 以外のキーを保持する
describe("loadExistingWorkspace", () => {
  let tmpDir: string;

  beforeEach(async () => {
    tmpDir = await mkdtemp(path.join(os.tmpdir(), "ws-test-"));
  });

  afterEach(async () => {
    await rm(tmpDir, { recursive: true, force: true });
  });

  // settings など folders 以外のキーを返し、folders は除外する
  it("returns non-folder keys from existing workspace", async () => {
    const ws = {
      folders: [{ name: "x", path: "." }],
      settings: { "editor.fontSize": 14 },
    };
    const filePath = path.join(tmpDir, "test.code-workspace");
    await writeFile(filePath, JSON.stringify(ws));

    const result = await loadExistingWorkspace(filePath);
    expect(result).toEqual({ settings: { "editor.fontSize": 14 } });
    expect(result).not.toHaveProperty("folders");
  });

  // ファイルが存在しない場合は空オブジェクトを返す
  it("returns empty object when file does not exist", async () => {
    const result = await loadExistingWorkspace(
      path.join(tmpDir, "nope.code-workspace"),
    );
    expect(result).toEqual({});
  });
});
