import type { Project } from "./types.js";
import { stripEmojiLabel } from "./strip-emoji-label.js";

/**
 * 引数の名前から一致するプロジェクトを探す。
 * 生の name とプレーンラベルの両方にマッチする。
 * 重複した場合はエラーを投げる。
 */
export function findProject(
  projects: Project[],
  query: string,
): Project | undefined {
  const matches = projects.filter((p) => {
    if (p.name === query) return true;
    const plain = stripEmojiLabel(p.name);
    return plain === query;
  });

  if (matches.length > 1) {
    throw new Error(
      `Ambiguous name "${query}" matches: ${matches.map((p) => p.name).join(", ")}`,
    );
  }

  return matches[0];
}
