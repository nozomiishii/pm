# pm - VS Code Project Manager CLI

English | [日本語](./README.ja.md)

<br>
<div align="center">
  <img src="demo/logo.gif" alt="logo" width="480" />
</div>
<br>

I wanted to use [VS Code Project Manager](https://marketplace.visualstudio.com/items?itemName=alefragnani.project-manager) from the terminal too!

With the `pm` command, you can jump to any project registered in VS Code Project Manager.

## Prerequisites

`pm` uses [fzf](https://github.com/junegunn/fzf) for interactive project selection. Install it before setting up pm.

```sh
# macOS
brew install fzf

# Debian / Ubuntu
sudo apt install fzf

# Fedora
sudo dnf install fzf

# Arch Linux
sudo pacman -S fzf
```

## Install

### macOS/Linux (recommended)

```sh
curl -fsSL https://raw.githubusercontent.com/nozomiishii/pm/main/install.sh | bash
```

The `pm` binary is downloaded to `~/.pm/bin/pm`, and the wrapper script that calls `pm` is placed at `~/.pm/pm.zsh`. The `.zshrc` configuration is added automatically.

Restart your terminal or run `source ~/.zshrc` to start using pm.

### npm

```sh
npm install -g @nozomiishii/pm
```

## Uninstall

```sh
pm uninstall
```

Removes the binary, config files, and `.zshrc` entries.

## Usage

### pm --help

```
Usage: pm [options] [command]

Commands:
  cd [name]                    Jump to a project (fzf if no name given)
  ls                           List project names
  logo                         Display the pm logo
  uninstall                    Uninstall pm from your system

Options:
  --config <path>              Path to projects.json (or PM_CONFIG)
  --help                       Show this help
  --version                    Show version

Running `pm` without a command opens the fzf picker.
```

```sh
pm --help
```

![pm --help](demo/pm-help.gif)

### pm

Opens fzf picker and jumps to the selected project.

```sh
pm
```

![pm](demo/pm.gif)

### pm cd

Jumps to a project by name. Falls back to fzf if no name is given.

```sh
pm cd <name>
```

![pm cd](demo/pm-cd.gif)

### pm ls

Lists all project names.

```sh
pm ls
```

![pm ls](demo/pm-ls.gif)

## Configuration

The installer configures `.zshrc` automatically. For manual setup, add the following:

```sh
# (Optional) Path to projects.json. Defaults to the VS Code Project Manager path
export PM_CONFIG="$HOME/path/to/projects.json"

# Required
export PATH="$HOME/.pm/bin:$PATH"
source "$HOME/.pm/pm.zsh"
```

### PM_CONFIG

pm reads project data from a `projects.json` file. If `PM_CONFIG` is omitted, it defaults to the [VS Code Project Manager](https://marketplace.visualstudio.com/items?itemName=alefragnani.project-manager) config path.

| OS | Default path |
| --- | --- |
| macOS | `~/Library/Application Support/Code/User/globalStorage/alefragnani.project-manager/projects.json` |
| Linux | `~/.config/Code/User/globalStorage/alefragnani.project-manager/projects.json` |
| Windows | `%APPDATA%/Code/User/globalStorage/alefragnani.project-manager/projects.json` |

You can also override the path temporarily with the `--config` flag:

```sh
pm --config ./projects.json ls
```

### source "$HOME/.pm/pm.zsh"

The `pm` binary runs as a separate process, so `cd` inside the binary cannot change the calling shell's directory. The shell function loaded by `source "$HOME/.pm/pm.zsh"` runs `cd` in the current shell when the binary outputs a directory path.

```sh
# What pm.zsh does (simplified)
pm() {
  local output
  output="$(command pm "$@")"       # Run the binary
  [[ -d "$output" ]] && cd "$output"  # cd if output is a directory
}
```

This mechanism also provides tab completion for project names.

## Acknowledgments

pm is heavily inspired by these projects. Thank you so much for boosting my productivity.

- [VS Code Project Manager](https://marketplace.visualstudio.com/items?itemName=alefragnani.project-manager) — The extension that pioneered `projects.json`-based project switching. The best of the best.
- [Raycast VSCode Project Manager](https://www.raycast.com/MarkusLanger/vscode-project-manager) — Use VS Code Project Manager from Raycast. Amazing.

## License

[MIT](LICENSE)
