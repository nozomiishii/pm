import { readFile } from "node:fs/promises";
import type { CodeWorkspace } from "../types.js";

export async function loadExistingWorkspace(
  workspacePath: string,
): Promise<Partial<CodeWorkspace>> {
  try {
    const raw = await readFile(workspacePath, "utf8");
    const parsed = JSON.parse(raw) as CodeWorkspace;
    const { folders: _f, ...rest } = parsed;
    return rest;
  } catch {
    return {};
  }
}
