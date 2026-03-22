FROM ghcr.io/charmbracelet/vhs:v0.11.0

RUN apt-get update \
  && apt-get install -y --no-install-recommends \
    fzf=0.60.3-1+b2 \
    zsh=5.9-8+b21 \
    zsh-syntax-highlighting=0.8.0-2 \
  && rm -rf /var/lib/apt/lists/*

# デモ用のダミーディレクトリを作成
# demo.sh が projects.json から rootPath を読み取り、build arg として渡す
ARG DEMO_DIRS
RUN mkdir -p ${DEMO_DIRS}

# pm バイナリをインストール
COPY dist/pm-linux /usr/local/bin/pm

# デモ用の設定ファイルをコピー
COPY demo/projects.json /etc/pm/projects.json
ENV PM_CONFIG=/etc/pm/projects.json
