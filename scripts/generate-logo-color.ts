import { readFileSync, writeFileSync } from "node:fs";
import { join, dirname } from "node:path";
import { fileURLToPath } from "node:url";

const __dirname = dirname(fileURLToPath(import.meta.url));
const root = join(__dirname, "..");

const logo = readFileSync(join(root, "src", "logo.ascii"), "utf-8");

const colors: [number, number, number][] = [
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

const lines = logo.split("\n").filter((l) => l.length > 0);
const colored = lines
  .map((line, i) => {
    const [r, g, b] = colors[Math.min(i, colors.length - 1)];
    return `\x1b[38;2;${r};${g};${b}m${line}\x1b[0m`;
  })
  .join("\n");

writeFileSync(join(root, "src", "logo-color.ascii"), colored + "\n");
console.log("Generated src/logo-color.ascii");
