#!/usr/bin/env bash
# pm — project CLI uninstaller
# Usage: curl -fsSL https://raw.githubusercontent.com/nozomiishii/pm/main/uninstall.sh | bash
set -euo pipefail

REPO="nozomiishii/pm"
BIN_DIR="${XDG_BIN_HOME:-$HOME/.local/bin}"
CONFIG_DIR="${XDG_CONFIG_HOME:-$HOME/.config}/pm"

# ---------------------------------------------------------------------------
# Confirm before uninstalling
# ---------------------------------------------------------------------------
confirm_uninstall() {
  echo "The following will be removed:"
  echo "  Binary:  $BIN_DIR/pm"
  echo "  Config:  $CONFIG_DIR/"
  echo "  Shell:   pm block in ~/.zshrc"
  echo ""

  local answer=""
  if [ -t 0 ]; then
    read -rp "Continue? [Y/n] " answer
  elif [ -e /dev/tty ]; then
    read -rp "Continue? [Y/n] " answer < /dev/tty
  fi

  case "$answer" in
    [nN]*) echo "Aborted."; exit 0 ;;
  esac
}

# ---------------------------------------------------------------------------
# Remove binary
# ---------------------------------------------------------------------------
remove_binary() {
  if [ -f "$BIN_DIR/pm" ]; then
    rm -f "$BIN_DIR/pm"
    echo "Removed $BIN_DIR/pm"
  else
    echo "Binary not found: $BIN_DIR/pm (skipped)"
  fi
}

# ---------------------------------------------------------------------------
# Remove config directory
# ---------------------------------------------------------------------------
remove_config() {
  if [ -f "$CONFIG_DIR/pm.zsh" ]; then
    rm -f "$CONFIG_DIR/pm.zsh"
    echo "Removed $CONFIG_DIR/pm.zsh"
  else
    echo "Config not found: $CONFIG_DIR/pm.zsh (skipped)"
  fi

  if [ -d "$CONFIG_DIR" ] && [ -z "$(ls -A "$CONFIG_DIR")" ]; then
    rmdir "$CONFIG_DIR"
    echo "Removed $CONFIG_DIR/"
  elif [ -d "$CONFIG_DIR" ]; then
    echo "Other files exist in $CONFIG_DIR/, directory kept"
  fi
}

# ---------------------------------------------------------------------------
# Remove pm block from .zshrc
# ---------------------------------------------------------------------------
unconfigure_shell() {
  local zshrc="$HOME/.zshrc"
  # shellcheck disable=SC2016
  local marker='source "${XDG_CONFIG_HOME:-$HOME/.config}/pm/pm.zsh"'

  if [ ! -f "$zshrc" ]; then
    echo "No .zshrc found (skipped)"
    return
  fi

  if ! grep -qF "$marker" "$zshrc"; then
    echo "No pm configuration found in $zshrc (skipped)"
    return
  fi

  local tmp
  tmp="$(mktemp)"

  # Delete the block: comment line through source line
  sed '/^# pm - VS Code Project Manager CLI$/,/^source .*\/pm\/pm\.zsh"$/d' "$zshrc" > "$tmp"

  # Remove PM_CONFIG export if present
  sed -i'' '/^export PM_CONFIG=.*$/d' "$tmp"

  # Squeeze consecutive blank lines
  cat -s "$tmp" > "$zshrc"
  rm -f "$tmp"

  echo "Removed pm configuration from $zshrc"
}

# ---------------------------------------------------------------------------
# Main
# ---------------------------------------------------------------------------
main() {
  confirm_uninstall
  remove_binary
  remove_config
  unconfigure_shell

  local logo_url="https://github.com/${REPO}/releases/latest/download/logo-color.ascii"
  local logo
  logo="$(curl -fsSL "$logo_url" 2>/dev/null)" || true

  echo ""
  if [ -n "$logo" ]; then
    echo "$logo"
    echo ""
  fi
  echo "pm was uninstalled successfully!"
  echo ""
  echo "Thank you for trying pm. See you again!"
  echo ""
  echo "Restart your terminal to apply changes."
}

main
