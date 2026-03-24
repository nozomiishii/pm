# pm - VS Code Project Manager CLI

[English](./README.md) | 日本語

<br>
<div align="center">
  <img src="demo/logo.gif" alt="logo" width="480" />
</div>
<br>

[VS Code Project Manager](https://marketplace.visualstudio.com/items?itemName=alefragnani.project-manager) をターミナルでも使いたい！

`pm`コマンドだったらVS Code Project Managerに登録されたプロジェクトへ移動できます。

## Prerequisites

`pm`はインタラクティブなプロジェクト選択に[fzf](https://github.com/junegunn/fzf) を使用します。pm をセットアップする前にインストールしてください。

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

### macOS/Linux (推奨)

```sh
curl -fsSL https://raw.githubusercontent.com/nozomiishii/pm/main/install.sh | bash
```

`pm`のバイナリが `~/.pm/bin/pm` にダウンロードされ、`pm`を呼び出すラッパースクリプトが `~/.pm/pm.zsh` に配置されます。`.zshrc` への設定も自動で追加されます。

ターミナルを再起動するか、`source ~/.zshrc` を実行すると`pm`が使えるようになります。

### npm

```sh
npm install -g @nozomiishii/pm
```

## Uninstall

```sh
pm uninstall
```

バイナリ・設定ファイル・`.zshrc` への追記をすべて削除します。

## Usage

### pm --help

```
Usage: pm [options] [command]

Commands:
  cd [name]                    Jump to a project (fzf if no name given)
  ls                           List project names
  logo                         Display the pm logo
  uninstall                    Uninstall pm from your system
  create-workspace             Generate a .code-workspace file
    --name <name>              Workspace name (outputs <name>.code-workspace)
    --tag <name>               Include only projects with this tag (repeatable)

Options:
  --config <path>              Path to projects.json (or PM_CONFIG)
  --help                       Show this help

Running `pm` without a command opens the fzf picker.
```

```sh
pm --help
```

![pm --help](demo/pm-help.gif)

### pm

fzfピッカーを開いて、選択したプロジェクトへ移動します。

```sh
pm
```

![pm](demo/pm.gif)

### pm cd

プロジェクト名を指定して移動します。名前を省略するとfzfが開きます。

```sh
pm cd <name>
```

![pm cd](demo/pm-cd.gif)

### pm ls

プロジェクト名を一覧表示します。

```sh
pm ls
```

![pm ls](demo/pm-ls.gif)

### pm create-workspace

`--tag` で指定したタグのプロジェクトを `.code-workspace` ファイルにまとめます。

```sh
pm create-workspace --name <name> --tag <tag>
```

たとえば `projects.json` に以下のプロジェクトがある場合:

```json
[
  { "name": "dotfiles",  "rootPath": "~/Code/nozomiishii/dotfiles",  "tags": ["personal"] },
  { "name": "portfolio", "rootPath": "~/Code/nozomiishii/portfolio", "tags": ["personal"] },
  { "name": "fzf",       "rootPath": "~/Code/junegunn/fzf",         "tags": ["oss"]      }
]
```

次のコマンドを実行することで

```sh
pm create-workspace --name my-workspace --tag personal
```

`my-workspace.code-workspace` が生成されます:

```json
{
  "folders": [
    { "name": "dotfiles",  "path": "../nozomiishii/dotfiles" },
    { "name": "portfolio", "path": "../nozomiishii/portfolio" }
  ]
}
```

`--tag` は複数指定でき、すべてのタグを持つプロジェクトだけが含まれます。

## Configuration

インストーラーが `.zshrc` を自動で設定しますが、手動でセットアップする場合は以下を追加してください。

```sh
# (任意) projects.json のパスを指定。省略すると VS Code Project Manager のデフォルトパスを使用
export PM_CONFIG="$HOME/path/to/projects.json"

# 必須設定
export PATH="$HOME/.pm/bin:$PATH"
source "$HOME/.pm/pm.zsh"
```

### PM_CONFIG

pm は `projects.json` ファイルからプロジェクト情報を読み込みます。`PM_CONFIG` を省略した場合は [VS Code Project Manager](https://marketplace.visualstudio.com/items?itemName=alefragnani.project-manager) のデフォルトパスを参照します。

| OS | デフォルトパス |
| --- | --- |
| macOS | `~/Library/Application Support/Code/User/globalStorage/alefragnani.project-manager/projects.json` |
| Linux | `~/.config/Code/User/globalStorage/alefragnani.project-manager/projects.json` |
| Windows | `%APPDATA%/Code/User/globalStorage/alefragnani.project-manager/projects.json` |

`--config` フラグで一時的にパスを指定することもできます。

```sh
pm --config ./projects.json ls
```

### source "$HOME/.pm/pm.zsh"

`pm` バイナリは別プロセスで実行されるため、バイナリ内で `cd` しても呼び出し元のシェルのディレクトリは変わりません。`source "$HOME/.pm/pm.zsh"` で読み込まれるシェル関数が、バイナリの出力がディレクトリだった場合に現在のシェルで `cd` を実行します。

```sh
# pm.zsh がやっていること (簡略版)
pm() {
  local output
  output="$(command pm "$@")"       # バイナリを実行
  [[ -d "$output" ]] && cd "$output"  # 出力がディレクトリなら cd
}
```

この仕組みにより、プロジェクト名のタブ補完もサポートしています。

## 謝辞

pm は以下のプロジェクトから大きな影響を受けています。僕の生産性を上げてくれて本当にありがとうございます

- [VS Code Project Manager](https://marketplace.visualstudio.com/items?itemName=alefragnani.project-manager) — `projects.json` ベースのプロジェクト切り替えを切り開いた拡張機能です。最高で最高です。
- [Raycast VSCode Project Manager](https://www.raycast.com/MarkusLanger/vscode-project-manager) — RaycastからVS Code Project Managerが使えます。アメージングです。

## License

[MIT](LICENSE)
