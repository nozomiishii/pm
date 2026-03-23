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
echo "📦 Linux バイナリをビルド中..."
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
echo "🐳 Docker イメージをビルド中..."

# projects.json の rootPath (~/ → /root/) を抽出してスペース区切りに
DEMO_DIRS=$(sed -n 's/.*"rootPath": *"~\(\/[^"]*\)".*/\/root\1/p' "$PROJECT_ROOT/demo/projects.json" | tr '\n' ' ')

docker build \
  --build-arg DEMO_DIRS="$DEMO_DIRS" \
  -t "$IMAGE_NAME" \
  -f "$DOCKERFILE" \
  "$PROJECT_ROOT"

echo "✅ ビルド完了"

# ----------------------------------------------------------
# 4. 各テープファイルを実行して GIF を生成
#    demo/*.tape を順番に処理する
# ----------------------------------------------------------
echo ""
echo "🎬 GIF を生成中..."

for tape in "$PROJECT_ROOT"/demo/*.tape; do
  name="$(basename "$tape" .tape)"
  echo "  ▶ $name"
  docker run --rm \
    -v "$PROJECT_ROOT":/vhs \
    "$IMAGE_NAME" \
    "demo/${name}.tape"
done

# ----------------------------------------------------------
# 5. 完了メッセージ
# ----------------------------------------------------------
echo ""
echo "✅ 生成完了! 以下の GIF が作成されました:"
for gif in "$PROJECT_ROOT"/demo/*.gif; do
  [ -f "$gif" ] && echo "  📄 $gif"
done
