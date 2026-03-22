import path from "node:path";
import type { Project, WorkspaceFolder } from "../types.js";
import { expandHome } from "../expand-home.js";
import { filterProjects } from "../filter-projects.js";
import { stripEmojiLabel } from "../strip-emoji-label.js";

export function buildFolders(
  projects: Project[],
  opts: { tags: string[]; workspaceDir: string },
): WorkspaceFolder[] {
  const filtered = filterProjects(projects, opts.tags);
  const folders: WorkspaceFolder[] = [];

  for (const p of filtered) {
    const absolute = path.resolve(expandHome(p.rootPath));
    let rel = path.relative(opts.workspaceDir, absolute);
    if (!rel || rel === "") {
      rel = ".";
    }
    const relPosix = rel.split(path.sep).join("/");
    const name = stripEmojiLabel(p.name) || path.basename(absolute);
    folders.push({ name, path: relPosix });
  }

  return folders;
}
