# pm — project manager shell wrapper
# Source this file from .zshrc to enable `pm` and tab completion.
#
# Required:
#   export PM_CONFIG="$HOME/Code/nozomiishii/workspaces/projects.json"

pm() {
  local output
  output="$(command pm "$@")" || return
  case "${1:-}" in
    ls|create-workspace|--help)
      printf '%s\n' "$output"
      ;;
    *)
      [[ -d "$output" ]] && cd "$output" || printf '%s\n' "$output"
      ;;
  esac
}

_pm() {
  local -a names
  names=("${(@f)$(command pm ls 2>/dev/null)}")
  compadd -a names
}

compdef _pm pm
