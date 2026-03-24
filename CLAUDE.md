# CLAUDE.md

このリポジトリで Claude Code (claude.ai/code) が作業する際のガイドラインです。

## 言語

- **応答言語**: プラン説明や返答は常に日本語で行い、コードやコマンド、技術用語はそのまま使用してよい。
- **PR 本文**: プルリクエストの本文（body）は日本語で記述する。

## よく使うコマンド

```bash
# 依存のインストール
bun install

# テスト実行
bun run test

# ネイティブバイナリをビルド
bun run build

# npm パッケージ用のビルドは prepublishOnly に記述する (npm publish 時に自動実行される)

# デモ GIF を生成 (Docker 経由)
bun run demo:all

# 個別のデモを生成
bun demo demo/logo.tape

# ローカルで CLI を実行
bun dev logo
```

## アーキテクチャ概要

[VS Code Project Manager](https://marketplace.visualstudio.com/items?itemName=alefragnani.project-manager) の `projects.json` をターミナルから操作する CLI ツール。Bun でネイティブバイナリにコンパイルし、`install.sh` で配布する。

### 主要コンポーネント

1. **`src/cli.ts`**: CLI エントリポイント。手動ループでの引数パース → サブコマンドルーティング (`cd`, `ls`, `create-workspace`)。
2. **`src/` ユーティリティ**: 各機能は単一責務の純粋関数として分離 (`expand-home.ts`, `filter-projects.ts`, `find-project.ts`, `strip-emoji-label.ts`)。
3. **`src/create-workspace/`**: `.code-workspace` 生成ロジック。
4. **`src/pm.zsh`**: シェルラッパー。バイナリの出力がディレクトリなら現在のシェルで `cd` する + タブ補完。
5. **`install.sh`**: curl | bash のワンライナーインストーラー。GitHub Releases からバイナリをダウンロード。

### デモシステム

- **`demo/Dockerfile`**: VHS コンテナに fzf + zsh-syntax-highlighting を追加。ダミーディレクトリは `demo/projects.json` から動的に生成。
- **`demo/*.tape`**: VHS テープファイル。各コマンドの GIF を生成。
- **`scripts/demo.sh`**: Linux バイナリのクロスコンパイル → Docker ビルド → 全テープ実行を自動化。
- VHS はシェル起動時にプロンプト (PS1/PROMPT) をハードコードで上書きするため、Dockerfile や `Env` コマンドではプロンプトを変更できない。`Hide` + `clear` が現時点での唯一の回避策。参照: [vhs#419](https://github.com/charmbracelet/vhs/issues/419), [vhs#130](https://github.com/charmbracelet/vhs/issues/130)

## インストール・配布設計

### XDG Base Directory 準拠

ユーザー環境へのファイル配置は XDG Base Directory に従う。

| 種類 | パス | 環境変数 |
|------|------|---------|
| バイナリ | `~/.local/bin/pm` | `XDG_BIN_HOME` |
| シェルラッパー・設定 | `~/.config/pm/` | `XDG_CONFIG_HOME` |

### ビルド・配布チャネル

| チャネル | ビルドコマンド | 備考 |
|---------|-------------|------|
| バイナリ (curl \| bash) | `bun run build` | Bun クロスコンパイル。CI で 4 プラットフォーム分ビルド |
| npm | `prepublishOnly` に記述 | `npm publish` 時に自動実行 |
| Homebrew | CI ワークフローで対応 | package.json には含めない |

### install.sh の設計ルール

- `.zshrc` への重複追記防止には `source` 行をマーカーとして使う（コメントはユーザーに削除される可能性がある）
- XDG 環境変数のフォールバックは常に記述する: `${XDG_CONFIG_HOME:-$HOME/.config}`

## Git ワークフロー

- **rebase 優先**: main の最新を取り込む際は `git merge` ではなく `git rebase origin/main` を使う。マージコミットでの履歴汚染を避ける。
- **新しい PR は最新 main から**: 新しいブランチは必ず `git fetch origin main && git checkout -b <branch> origin/main` で作成する。他の PR のコミットが混入しないようにする。
- **force push**: rebase 後は `git push --force-with-lease` を使う。

## GitHub Actions ワークフロー命名規則

- **`_` プレフィックス付き** (`_actionlint.yaml`, `_secretlint.yaml` 等): 他プロジェクトでも共通で使う汎用ワークフロー。
- **`_` プレフィックスなし** (`test.yaml` 等): このプロジェクト固有のワークフロー。

## 重要なパターン

- **ESM only**: `"type": "module"`。import には `.js` 拡張子を付ける (`import { foo } from "./foo.js"`)。Node 組み込みは `node:` プレフィックス。
- **テスト**: Vitest。テストファイルはソースと同じディレクトリに `{name}.test.ts` で配置。
- **型定義**: `src/types.ts` に集約 (`Project`, `WorkspaceFolder`, `CodeWorkspace`)。
- **外部依存なし**: CLI 引数パースを含め、ランタイム依存は zero。

## README フォーマットルール

README.ja.md (日本語) と README.md (英語) は同じ構成を保つ。新しい項目を追加する際は以下に従う。

- **改行**: セクション間は空行1つ。連続空行は使わない。
- **Usage サブコマンド**: セクションタイトル (`### pm <subcommand>`) → 概要 → コマンド例 (` ```sh `) → デモ GIF の順。GIF があるコマンドのみ GIF を配置。概要はテキスト説明が基本だが、`pm --help` のようにコマンド出力そのものが概要になる場合はコードブロックで貼る。
- **Configuration**: まず概要コードブロック (`.zshrc` の全体像) → サブセクションで各項目を詳しく解説。
- **概要コードブロック内コメント**: 各行に簡潔な日本語コメントで役割を説明。任意項目には `(任意)` を先頭に付ける。
- **具体例**: 入力と出力のペアで見せる (例: `projects.json` → `.code-workspace`)。デモ用データは `demo/projects.json` の内容を使う。
- **`pm --help` セクションの同期**: CLI のオプションやサブコマンドを追加・変更した場合は、両 README の `pm --help` コードブロックを更新し、`bun run demo:all` でデモ GIF も再生成する。
