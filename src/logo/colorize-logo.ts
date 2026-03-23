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
      const [r, g, b] = BLUE_GRADIENT[Math.min(i, BLUE_GRADIENT.length - 1)];
      return `\x1b[38;2;${r};${g};${b}m${line}\x1b[0m`;
    })
    .join("\n");
}
