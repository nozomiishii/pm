#!/usr/bin/env bash
# pm — project CLI installer
# Usage: curl -fsSL https://raw.githubusercontent.com/nozomiishii/pm/main/install.sh | bash
set -euo pipefail

REPO="nozomiishii/pm"
INSTALL_DIR="$HOME/.pm"
BIN_DIR="$INSTALL_DIR/bin"

# ---------------------------------------------------------------------------
# Detect platform
# ---------------------------------------------------------------------------
detect_platform() {
  local os arch
  os="$(uname -s)"
  arch="$(uname -m)"

  case "$os" in
    Darwin) os="darwin" ;;
    Linux)  os="linux" ;;
    *)
      echo "Error: unsupported OS: $os" >&2
      exit 1
      ;;
  esac

  case "$arch" in
    x86_64|amd64)  arch="x64" ;;
    arm64|aarch64) arch="arm64" ;;
    *)
      echo "Error: unsupported architecture: $arch" >&2
      exit 1
      ;;
  esac

  echo "${os}-${arch}"
}

# ---------------------------------------------------------------------------
# Download binary + shell wrapper from GitHub Releases
# ---------------------------------------------------------------------------
download() {
  local platform="$1"
  local version="${PM_VERSION:-latest}"
  local base_url

  if [ "$version" = "latest" ]; then
    base_url="https://github.com/${REPO}/releases/latest/download"
  else
    base_url="https://github.com/${REPO}/releases/download/${version}"
  fi

  local binary_url="${base_url}/pm-${platform}"
  local zsh_url="${base_url}/pm.zsh"

  mkdir -p "$BIN_DIR"

  echo "Downloading pm for ${platform}..."

  if command -v curl >/dev/null; then
    curl -fsSL "$binary_url" -o "$BIN_DIR/pm"
    curl -fsSL "$zsh_url" -o "$INSTALL_DIR/pm.zsh"
  elif command -v wget >/dev/null; then
    wget -qO "$BIN_DIR/pm" "$binary_url"
    wget -qO "$INSTALL_DIR/pm.zsh" "$zsh_url"
  else
    echo "Error: curl or wget is required" >&2
    exit 1
  fi

  chmod +x "$BIN_DIR/pm"
}

# ---------------------------------------------------------------------------
# Configure shell (.zshrc)
# ---------------------------------------------------------------------------
configure_shell() {
  local zshrc="$HOME/.zshrc"
  local marker="# pm (project)"

  # Skip if already configured
  if [ -f "$zshrc" ] && grep -qF "$marker" "$zshrc"; then
    echo "Shell already configured in $zshrc"
    return
  fi

  local config_block
  config_block=$(cat <<'BLOCK'

# pm (project)
export PATH="$HOME/.pm/bin:$PATH"
source "$HOME/.pm/pm.zsh"
BLOCK
)

  if [ -f "$zshrc" ]; then
    echo "$config_block" >> "$zshrc"
  else
    echo "$config_block" > "$zshrc"
  fi

  echo "Added pm configuration to $zshrc"
}

# ---------------------------------------------------------------------------
# Main
# ---------------------------------------------------------------------------
main() {
  local platform
  platform="$(detect_platform)"

  download "$platform"
  configure_shell

  echo ""
  echo "pm was installed successfully!"
  echo "  Binary:  $BIN_DIR/pm"
  echo "  Shell:   $INSTALL_DIR/pm.zsh"
  echo ""
  echo "Restart your terminal or run:"
  echo "  source ~/.zshrc"
}

main
