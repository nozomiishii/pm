# CLAUDE.md

[VS Code Project Manager](https://marketplace.visualstudio.com/items?itemName=alefragnani.project-manager) の `projects.json` をターミナルから操作する CLI。Bun でネイティブバイナリにコンパイルし `install.sh` で配布する。`src/pm.zsh` がバイナリ出力をうけて現在のシェルで `cd` する（バイナリ単体では親シェルを移動できないため）。

## デモ (VHS)

VHS はシェル起動時にプロンプト (PS1/PROMPT) をハードコードで上書きする。Dockerfile や `Env` では変更できず、`Hide` + `clear` が唯一の回避策。参照: [vhs#419](https://github.com/charmbracelet/vhs/issues/419), [vhs#130](https://github.com/charmbracelet/vhs/issues/130)。GIF 再生成は `bun run demo:all`。

## install.sh

- XDG Base Directory に準拠する。フォールバックは常に書く: `${XDG_CONFIG_HOME:-$HOME/.config}`
- `.zshrc` への重複追記防止は `source` 行をマーカーにする（コメントはユーザーに削除されうる）

## GitHub Actions ワークフロー命名

`_` プレフィックスあり = 他プロジェクトでも使う汎用ワークフロー。なし = このプロジェクト固有。

## README

README.ja.md と README.md は同じ構成を保ち、既存のスタイルに合わせる。CLI のオプション・サブコマンドを変えたら両 README の `pm --help` ブロックを更新し、`bun run demo:all` で GIF を再生成する。
