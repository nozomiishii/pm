const BLUE_GRADIENT: [number, number, number][] = [
  [120, 180, 255],
  [100, 160, 245],
  [80, 140, 235],
  [60, 120, 225],
  [45, 100, 215],
  [30, 80, 205],
  [20, 65, 195],
  [10, 50, 185],
  [10, 50, 185],
  [10, 50, 185],
];

export function colorizeLogo(text: string): string {
  const lines = text.split("\n").filter((l) => l.length > 0);

  return lines
    .map((line, i) => {
      const color = BLUE_GRADIENT.at(Math.min(i, BLUE_GRADIENT.length - 1)) ?? [10, 50, 185];
      const [r, g, b] = color;

      return `\u{1B}[38;2;${String(r)};${String(g)};${String(b)}m${line}\u{1B}[0m`;
    })
    .join("\n");
}
