import { readFileSync, writeFileSync } from "node:fs";
import path from "node:path";
import { colorizeLogo } from "./colorize-logo.js";

const args = process.argv.slice(2);
const input = args[0] ? path.resolve(args[0]) : path.resolve("src/logo/logo.ascii");
const output = args[1] ? path.resolve(args[1]) : path.resolve("src/logo/logo-color.ascii");

const logo = readFileSync(input, "utf8");
const colored = colorizeLogo(logo);

writeFileSync(output, colored + "\n");
console.log(`Created ${output}`);
