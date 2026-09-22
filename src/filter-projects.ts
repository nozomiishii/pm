import type { Project } from "./types.js";

export function filterProjects(projects: Project[], tags: string[]): Project[] {
  return projects.filter((p) => {
    if (p.enabled === false) {
      return false;
    }

    return tags.every((t) => p.tags?.includes(t));
  });
}
