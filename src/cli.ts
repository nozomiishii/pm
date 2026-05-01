import { existsSync } from "node:fs";
import { readFile } from "node:fs/promises";
import path from "node:path";
import { spawn } from "node:child_process";
import type { Project } from "./types.js";
import { filterProjects } from "./filter-projects.js";
import { expandHome } from "./expand-home.js";
import { stripEmojiLabel } from "./strip-emoji-label.js";
import { findProject } from "./find-project.js";
import LOGO_COLOR from "./logo/logo-color.ascii" with { type: "text" };
import packageJson from "../package.json";

// VS Code Project Manager 拡張のデフォルト保存先に合わせている
// https://github.com/alefragnani/vscode-project-manager — src/utils/path.ts getFilePathFromAppData()
// https://github.com/alefragnani/vscode-project-manager/blob/master/src/utils/path.ts
function defaultConfigPath(): string {
  const home = process.env.HOME ?? "";
  switch (process.platform) {
    case "darwin":
      return path.join(home, "Library/Application Support/Code/User/globalStorage/alefragnani.project-manager/projects.json");
    case "win32":
      return path.join(process.env.APPDATA ?? "", "Code/User/globalStorage/alefragnani.project-manager/projects.json");
    default:
      return path.join(home, ".config/Code/User/globalStorage/alefragnani.project-manager/projects.json");
  }
}

function usage(): void {
  console.log(`Usage: pm [options] [command]

Commands:
  cd [name]                    Jump to a project (fzf if no name given)
  ls                           List project names
  logo                         Display the pm logo
  uninstall                    Uninstall pm from your system

Options:
  --config <path>              Path to projects.json (or PM_CONFIG)
  --help                       Show this help
  --version                    Show version

Running \`pm\` without a command opens the fzf picker.`);
}

function printLogo(): void {
  console.log(LOGO_COLOR);
}

const SUBCOMMANDS = new Set(["cd", "ls", "logo", "uninstall"]);

function parseArgs(argv: string[]) {
  let config = process.env.PM_CONFIG ?? defaultConfigPath();
  let help = false;
  let version = false;
  let subcommand: string | undefined;
  const rest: string[] = [];

  for (let i = 0; i < argv.length; i++) {
    const arg = argv[i]!;
    if (arg === "--config") {
      config = argv[++i] ?? "";
    } else if (arg === "--help") {
      help = true;
    } else if (arg === "--version") {
      version = true;
    } else if (!subcommand && SUBCOMMANDS.has(arg)) {
      subcommand = arg;
    } else {
      rest.push(arg);
    }
  }

  return { config, help, version, subcommand, rest };
}

function plainLabel(name: string): string {
  return stripEmojiLabel(name) || name;
}

function fzfSelect(projects: Project[]): Promise<Project | undefined> {
  return new Promise((resolve, reject) => {
    const labels = projects.map((p) => plainLabel(p.name));
    const proc = spawn("fzf", [], {
      stdio: ["pipe", "pipe", "inherit"],
    });

    let stdout = "";
    proc.stdout.on("data", (d: Buffer) => {
      stdout += d.toString();
    });

    proc.stdin.write(labels.join("\n") + "\n");
    proc.stdin.end();

    proc.on("close", (code) => {
      if (code !== 0) {
        resolve(undefined);
        return;
      }
      const selected = stdout.trim();
      const idx = labels.indexOf(selected);
      resolve(idx >= 0 ? projects[idx] : undefined);
    });

    proc.on("error", (err: NodeJS.ErrnoException) => {
      if (err.code === "ENOENT") {
        console.error("fzf is not installed. Install it or pass a project name directly.");
        resolve(undefined);
      } else {
        reject(err);
      }
    });
  });
}

async function jumpToProject(projects: Project[], name?: string): Promise<void> {
  let target: Project | undefined;

  if (name) {
    target = findProject(projects, name);
    if (!target) {
      console.error(`Project not found: ${name}`);
      process.exit(1);
    }
  } else {
    target = await fzfSelect(projects);
    if (!target) {
      process.exit(1);
    }
  }

  const dir = expandHome(target.rootPath);

  if (!existsSync(dir)) {
    console.error(`Directory not found: ${dir}`);
    process.exit(1);
  }

  console.log(dir);
}

async function main() {
  const args = parseArgs(process.argv.slice(2));

  if (args.version) {
    console.log(packageJson.version);
    process.exit(0);
  }

  if (args.help) {
    usage();
    process.exit(0);
  }

  if (args.subcommand === "logo") {
    printLogo();
    process.exit(0);
  }

  if (args.subcommand === "uninstall") {
    const url = "https://raw.githubusercontent.com/nozomiishii/pm/main/uninstall.sh";
    const proc = spawn("bash", ["-c", `curl -fsSL "${url}" | bash`], {
      stdio: "inherit",
    });
    proc.on("close", (code) => process.exit(code ?? 0));
    return;
  }

  const filePath = expandHome(args.config);

  if (!existsSync(filePath)) {
    console.error(`File not found: ${filePath}`);
    process.exit(1);
  }

  const raw = await readFile(filePath, "utf-8");
  const allProjects: Project[] = JSON.parse(raw);

  switch (args.subcommand) {
    case "ls": {
      const projects = filterProjects(allProjects, []);
      for (const p of projects) {
        console.log(plainLabel(p.name));
      }
      break;
    }
    case "cd": {
      const projects = filterProjects(allProjects, []);
      await jumpToProject(projects, args.rest[0]);
      break;
    }
    default: {
      const projects = filterProjects(allProjects, []);
      await jumpToProject(projects);
      break;
    }
  }
}

main().catch((err) => {
  console.error(err);
  process.exit(1);
});
