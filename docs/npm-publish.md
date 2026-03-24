# npm 配布フロー

## 概要

`@nozomiishii/pm` は npm パッケージとしても配布している。

```sh
npm install -g @nozomiishii/pm
# or
bunx @nozomiishii/pm
```

## ビルド

`package.json` の `prepublishOnly` に記述しており、`npm publish` 時に自動実行される。

```sh
bun build src/cli.ts --outfile dist/cli.js --target=node
```

- TypeScript を単一の Node.js 互換 JS にバンドル
- Bun 固有の `import ... with { type: "text" }` もバンドル時にインライン化されるため、Node.js で問題なく動作する
- ソースにシバンがないため、出力もクリーンな JS になる（npm が bin ラッパーを生成するのでシバン不要）

## CI ワークフロー（release.yaml）

```
release-please → リリース作成 → npm-publish ジョブ実行 → npm publish
```

- `actions/setup-node` の `registry-url: https://registry.npmjs.org` が `.npmrc` を生成し、認証を設定する
- `id-token: write` 権限は OIDC トークン生成（Trusted Publishers / provenance）に必要
- `publishConfig` は `package.json` に記述しており、CI の `npm publish` にフラグは不要

```jsonc
// package.json
"publishConfig": {
  "access": "public",    // スコープ付きパッケージはデフォルト private のため必要
  "provenance": true     // ビルド元のリポジトリ・ワークフローを証明する署名を付与
}
```

## 認証方式

### NPM_TOKEN（初回パブリッシュ）

初回は npm アクセストークンを GitHub Secrets に `NPM_TOKEN` として保存し、`NODE_AUTH_TOKEN` 環境変数で渡す。

初回のみトークンが必要な理由は、Trusted Publishers がパッケージの存在を前提とするため。

**トークン発行手順:**

1. https://www.npmjs.com/settings/nozomiishii/tokens にアクセス
2. **Generate New Token** → **Granular Access Token** を選択
3. 設定:
   - **Token name**: 識別しやすい名前（例: `pm-github-actions`）
   - **Expiration**: 短め推奨（Trusted Publishers 移行後は削除するため）
   - **Packages and scopes**: `@nozomiishii/pm` のみに制限
   - **Permissions**: **Read and write**（publish に必要）
4. トークンをコピー
5. GitHub リポジトリの Settings → Secrets and variables → Actions で `NPM_TOKEN` として登録
   - URL: `https://github.com/nozomiishii/pm/settings/secrets/actions`

### Trusted Publishers / OIDC（2回目以降）

OIDC で短命トークンを自動発行する仕組み。シークレット管理が不要になり、provenance attestation も自動付与される。

**移行手順:**

1. npm の設定画面で Trusted Publishers を登録
   - URL: `https://www.npmjs.com/package/@nozomiishii/pm/access`
   - Organization or user: `nozomiishii`
   - Repository: `pm`
   - Workflow filename: `release.yaml`
2. `release.yaml` から `NODE_AUTH_TOKEN` の env を削除
3. GitHub Secrets から `NPM_TOKEN` を削除

### 初回パブリッシュの制約

npm にパッケージが存在しない状態では Trusted Publishers を設定できない（鶏と卵問題）。PyPI は作成前に設定可能だが、npm は未対応。

**ワークアラウンド:**

- ローカルから `npm login` → `npm publish`
- [setup-npm-trusted-publish](https://github.com/azu/setup-npm-trusted-publish) でプレースホルダーを先に publish

初回パブリッシュの OIDC 対応は [npm/cli #8544](https://github.com/npm/cli/issues/8544) で議論中（npm チームは「MVP から意図的に除外、引き続き検討」と回答）。

## 参考リンク

- [npm Trusted Publishers ドキュメント](https://docs.npmjs.com/trusted-publishers)
- [npm/cli #8544 - Allow publishing initial version with OIDC](https://github.com/npm/cli/issues/8544)
- [GitHub Discussion #161015 - OIDC Support for npm Registry](https://github.com/orgs/community/discussions/161015)
- [GitHub Discussion #174507 - npm supply chain security roadmap](https://github.com/orgs/community/discussions/174507)
