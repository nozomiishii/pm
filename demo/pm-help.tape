Output demo/pm-help.gif

Set Shell "zsh"
Set Width 800
Set Height 500
Set FontSize 16
Set Padding 20

# VHS はシェル起動時にプロンプトをハードコードで上書きするため、
# Dockerfile の ENV では PROMPT を変更できない。
# Hide + clear が現時点での唯一の回避策。
# https://github.com/charmbracelet/vhs/issues/419
# https://github.com/charmbracelet/vhs/issues/130
Hide
Type `source /usr/share/zsh-syntax-highlighting/zsh-syntax-highlighting.zsh`
Enter
Type `export PROMPT='%~ $ '`
Enter
Type "cd /"
Enter
Type "clear"
Enter
# プロンプトを画面下部に固定 (Warp 風)
Type `printf '\n%.0s' {1..24}`
Enter
Sleep 500ms
Show

Sleep 500ms

Type "pm --help"
Sleep 500ms
Enter
Sleep 2s
