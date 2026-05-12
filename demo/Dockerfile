FROM ghcr.io/charmbracelet/vhs:v0.11.0@sha256:9d5fc3dc0c160b0fb1d2212baff07e6bdf3fa9438c504a3237484567302fcf93

RUN apt-get update \
  && apt-get install -y --no-install-recommends \
    bat=0.25.0-2+b2 \
    fzf=0.60.3-1+b2 \
    zsh=5.9-8+b21 \
    zsh-syntax-highlighting=0.8.0-2 \
  && rm -rf /var/lib/apt/lists/* \
  && ln -s /usr/bin/batcat /usr/local/bin/bat

# デモ用のダミーディレクトリを作成
# demo.sh が projects.json から rootPath を読み取り、build arg として渡す
# fzf preview 用の README も配置（demo/readmes/<basename>.md があればコピー、なければ最小限の README を生成）
ARG DEMO_DIRS
COPY demo/readmes/ /tmp/readmes/
RUN mkdir -p ${DEMO_DIRS} \
  && for dir in ${DEMO_DIRS}; do \
       name=$(basename "$dir"); \
       if [ -f "/tmp/readmes/${name}.md" ]; then \
         cp "/tmp/readmes/${name}.md" "$dir/README.md"; \
       else \
         printf '# %s\n\nDemo project.\n' "$name" > "$dir/README.md"; \
       fi; \
     done

# pm バイナリをインストール
COPY dist/pm-linux /usr/local/bin/pm

# デモ用の設定ファイルをコピー
COPY demo/projects.json /etc/pm/projects.json
ENV PM_CONFIG=/etc/pm/projects.json
