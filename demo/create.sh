#!/usr/bin/env bash
set -euo pipefail

# ============================================================
# デモ GIF 生成スクリプト
#
# VHS (https://github.com/charmbracelet/vhs) を Docker 経由で
# 実行し、各コマンドのデモ GIF を生成する。
#
# 使い方: bun run demo
# ============================================================

SCRIPT_DIR="$(cd "$(dirname "$0")" && pwd)"
PROJECT_ROOT="$(cd "$SCRIPT_DIR/.." && pwd)"
IMAGE_NAME="pm-vhs"
DOCKERFILE="$PROJECT_ROOT/demo/Dockerfile"

# ----------------------------------------------------------
# 1. Linux 向けバイナリをクロスコンパイル
#    macOS 上でも bun が Linux バイナリを生成してくれる
#    ホストの CPU アーキテクチャに合わせてターゲットを選択
# ----------------------------------------------------------
# Linux バイナリをビルド
echo "Building Linux binary..."
cd "$PROJECT_ROOT"

ARCH="$(uname -m)"
if [ "$ARCH" = "arm64" ] || [ "$ARCH" = "aarch64" ]; then
  BUN_TARGET="bun-linux-arm64"
else
  BUN_TARGET="bun-linux-x64"
fi

bun build --compile --target="$BUN_TARGET" src/cli.ts --outfile dist/pm-linux

# ----------------------------------------------------------
# 2. Docker イメージをビルド
#    VHS ベースイメージに fzf を追加したイメージを作成
#    projects.json から rootPath を読み取り、ダミーディレクトリとして渡す
# ----------------------------------------------------------
# Docker イメージをビルド
echo "Building Docker image..."

# projects.json の rootPath (~/ → /root/) を抽出してスペース区切りに
DEMO_DIRS=$(sed -n 's/.*"rootPath": *"~\(\/[^"]*\)".*/\/root\1/p' "$PROJECT_ROOT/demo/projects.json" | tr '\n' ' ')

docker build \
  --build-arg DEMO_DIRS="$DEMO_DIRS" \
  -t "$IMAGE_NAME" \
  -f "$DOCKERFILE" \
  "$PROJECT_ROOT"

# ビルド完了
echo "Build complete."

# ----------------------------------------------------------
# 4. 各テープファイルを実行して GIF を生成
#    demo/*.tape を順番に処理する
# ----------------------------------------------------------
echo ""
# GIF を生成
echo "Generating demo files..."

for tape in "$PROJECT_ROOT"/demo/*.tape; do
  name="$(basename "$tape" .tape)"
  echo "  > $name"
  docker run --rm \
    -v "$PROJECT_ROOT":/vhs \
    "$IMAGE_NAME" \
    "demo/${name}.tape"
done

# ----------------------------------------------------------
# 5. 完了メッセージ
# ----------------------------------------------------------
echo ""
# 生成完了
echo "Done. Generated files:"
for file in "$PROJECT_ROOT"/demo/*.gif "$PROJECT_ROOT"/demo/*.png; do
  [ -f "$file" ] && echo "  $file"
done
