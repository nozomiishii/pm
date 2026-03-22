Output demo/pm.gif

Set Shell "zsh"
Set Width 800
Set Height 400
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
# シェルラッパー: pm の出力先がディレクトリなら cd する (install.sh の pm.zsh と同じ役割)
Type `pm() { local d; d=$(command pm "$@"); if [ -d "$d" ]; then cd "$d"; else echo "$d"; fi }`
Enter
Type "cd /"
Enter
Type "clear"
Enter
# プロンプトを画面下部に固定 (Warp 風)
Type `printf '\n%.0s' {1..20}`
Enter
Sleep 500ms
Show

Sleep 500ms

Type "pm"
Sleep 500ms
Enter
Sleep 1s

Type "po"
Sleep 500ms

Enter
Sleep 1.5s
