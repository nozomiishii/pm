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

class ExitError extends Error {
  readonly code: number;

  constructor(message: string, code: number) {
    super(message);
    this.code = code;
  }
}

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
  process.stdout.write(`${LOGO_COLOR}\n`);
}

function usage(): void {
  process.stdout.write(`Usage: pm [options] [command]

Commands:
  cd [name]                    Jump to a project (fzf if no name given)
  ls                           List project names
  logo                         Display the pm logo
  uninstall                    Uninstall pm from your system

Options:
  --config <path>              Path to projects.json (or PM_CONFIG)
  --help                       Show this help
  --version                    Show version

Running \`pm\` without a command opens the fzf picker.\n`);
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
        process.stderr.write("fzf is not installed. Install it or pass a project name directly.\n");
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
      throw new ExitError(`Project not found: ${name}`, 1);
    }
  } else {
    target = await fzfSelect(projects);

    if (!target) {
      throw new ExitError("", 1);
    }
  }

  const dir = expandHome(target.rootPath);

  if (!existsSync(dir)) {
    throw new ExitError(`Directory not found: ${dir}`, 1);
  }

  process.stdout.write(`${dir}\n`);
}

async function main() {
  const args = parseArgs(process.argv.slice(2));

  if (args.version) {
    process.stdout.write(`${packageJson.version}\n`);

    return;
  }

  if (args.help) {
    usage();

    return;
  }

  if (args.subcommand === "logo") {
    printLogo();

    return;
  }

  if (args.subcommand === "uninstall") {
    await runUninstall();

    return;
  }

  const filePath = expandHome(args.config);

  if (!existsSync(filePath)) {
    throw new ExitError(`File not found: ${filePath}`, 1);
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
        process.stdout.write(`${plainLabel(p.name)}\n`);
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
    const arg = argv[i];

    if (arg !== undefined) {
      handleArg(state, arg, () => argv[++i] ?? "");
    }
  }

  return state;
}

function plainLabel(name: string): string {
  return stripEmojiLabel(name) || name;
}

function runUninstall(): Promise<void> {
  return new Promise((resolve) => {
    const url = "https://raw.githubusercontent.com/nozomiishii/pm/main/uninstall.sh";
    const proc = spawn("bash", ["-c", `curl -fsSL "${url}" | bash`], {
      stdio: "inherit",
    });
    proc.on("close", (code) => {
      process.exitCode = code ?? 0;
      resolve();
    });
  });
}

try {
  await main();
} catch (error: unknown) {
  if (error instanceof ExitError) {
    if (error.message) {
      process.stderr.write(`${error.message}\n`);
    }

    process.exitCode = error.code;
  } else {
    process.stderr.write(`${String(error)}\n`);
    process.exitCode = 1;
  }
}
