import { readFileSync, writeFileSync } from "node:fs";
import path from "node:path";
import { colorizeLogo } from "./colorize-logo.js";

const args = process.argv.slice(2);
const input = path.resolve(args[0] ?? "src/logo/logo.ascii");
const output = path.resolve(args[1] ?? "src/logo/logo-color.ascii");

const logo = readFileSync(input, "utf-8");
const colored = colorizeLogo(logo);

writeFileSync(output, colored + "\n");
process.stdout.write(`Created ${output}\n`);
