import { readFileSync, writeFileSync } from "node:fs";
import { resolve } from "node:path";
import { colorizeLogo } from "./colorize-logo.js";

const args = process.argv.slice(2);
const input = args[0] ? resolve(args[0]) : resolve("src/logo/logo.ascii");
const output = args[1] ? resolve(args[1]) : resolve("src/logo/logo-color.ascii");

const logo = readFileSync(input, "utf-8");
const colored = colorizeLogo(logo);

writeFileSync(output, colored + "\n");
console.log(`Created ${output}`);
