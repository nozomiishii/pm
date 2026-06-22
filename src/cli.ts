import { spawn } from "node:child_process";
import { existsSync } from "node:fs";
import { readFile } from "node:fs/promises";
import path from "node:path";
import type { Project } from "./types.js";
import packageJson from "../package.json";
import { expandHome } from "./expand-home.js";
import { filterProjects } from "./filter-projects.js";
import { findProject } from "./find-project.js";
import LOGO_COLOR from "./logo/logo-color.ascii" with { type: "text" };
import { stripEmojiLabel } from "./strip-emoji-label.js";

// VS Code Project Manager 拡張のデフォルト保存先に合わせている
// https://github.com/alefragnani/vscode-project-manager — src/utils/path.ts getFilePathFromAppData()
// https://github.com/alefragnani/vscode-project-manager/blob/master/src/utils/path.ts
function defaultConfigPath(): string {
  const home = process.env.HOME ?? "";

  switch (process.platform) {
    case "darwin": {
      return path.join(
        home,
        "Library/Application Support/Code/User/globalStorage/alefragnani.project-manager/projects.json",
      );
    }
    case "win32": {
      return path.join(
        process.env.APPDATA ?? "",
        "Code/User/globalStorage/alefragnani.project-manager/projects.json",
      );
    }
    default: {
      return path.join(
        home,
        ".config/Code/User/globalStorage/alefragnani.project-manager/projects.json",
      );
    }
  }
}

function printLogo(): void {
  console.log(LOGO_COLOR);
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

const SUBCOMMANDS = new Set(["cd", "logo", "ls", "uninstall"]);

function fzfSelect(projects: Project[]): Promise<Project | undefined> {
  return new Promise((resolve, reject) => {
    const lines = projects.map((p) => `${plainLabel(p.name)}\t${expandHome(p.rootPath)}`);
    const proc = spawn(
      "fzf",
      [
        "--delimiter=\t",
        "--with-nth=1",
        "--preview",
        "bat --color=always --style=header,grid --line-range :80 {2}/README.* 2>/dev/null || echo 'No README found'",
      ],
      {
        stdio: ["pipe", "pipe", "inherit"],
      },
    );

    let stdout = "";
    proc.stdout.on("data", (d: Buffer) => {
      stdout += d.toString();
    });

    proc.stdin.write(lines.join("\n") + "\n");
    proc.stdin.end();

    proc.on("close", (code) => {
      if (code !== 0) {
        resolve(undefined);

        return;
      }
      const selected = stdout.trim();
      const idx = lines.indexOf(selected);
      resolve(idx === -1 ? undefined : projects[idx]);
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

function handleArg(
  state: {
    config: string;
    help: boolean;
    rest: string[];
    subcommand: string | undefined;
    version: boolean;
  },
  arg: string,
  nextArg: () => string,
): void {
  switch (arg) {
    case "--config": {
      state.config = nextArg();
      break;
    }
    case "--help": {
      state.help = true;
      break;
    }
    case "--version": {
      state.version = true;
      break;
    }
    default: {
      if (!state.subcommand && SUBCOMMANDS.has(arg)) {
        state.subcommand = arg;
      } else {
        state.rest.push(arg);
      }
    }
  }
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

  const raw = await readFile(filePath, "utf8");
  const allProjects: Project[] = JSON.parse(raw) as Project[];

  switch (args.subcommand) {
    case "cd": {
      const projects = filterProjects(allProjects, []);
      await jumpToProject(projects, args.rest[0]);
      break;
    }
    case "ls": {
      const projects = filterProjects(allProjects, []);

      for (const p of projects) {
        console.log(plainLabel(p.name));
      }
      break;
    }
    default: {
      const projects = filterProjects(allProjects, []);
      await jumpToProject(projects);
      break;
    }
  }
}

function parseArgs(argv: string[]) {
  const state = {
    config: process.env.PM_CONFIG ?? defaultConfigPath(),
    help: false,
    rest: [] as string[],
    subcommand: undefined as string | undefined,
    version: false,
  };

  for (let i = 0; i < argv.length; i++) {
    handleArg(state, argv[i], () => argv[++i] ?? "");
  }

  return state;
}

function plainLabel(name: string): string {
  return stripEmojiLabel(name) || name;
}

try {
  await main();
} catch (error: unknown) {
  console.error(error);
  process.exit(1);
}
