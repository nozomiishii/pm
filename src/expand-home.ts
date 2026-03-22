import path from "node:path";

export function expandHome(p: string): string {
  if (p.startsWith("~/")) {
    return path.join(process.env.HOME ?? "", p.slice(2));
  }
  if (p === "~") {
    return process.env.HOME ?? "";
  }
  return p;
}
