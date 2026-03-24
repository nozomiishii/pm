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

## 認証方式: Trusted Publishers / OIDC

OIDC で短命トークンを自動発行する仕組み。シークレット管理が不要で、provenance attestation も自動付与される。

設定は初回パブリッシュ後に npm の Web UI から行う（手順は後述）。

### 初回パブリッシュ

npm にパッケージが存在しない状態では Trusted Publishers を設定できない（鶏と卵問題）。初回は以下の手順でローカルから手動 publish し、その後 Trusted Publishers を設定する。

この制約の OIDC 対応は [npm/cli #8544](https://github.com/npm/cli/issues/8544) で議論中（npm チームは「MVP から意図的に除外、引き続き検討」と回答）。

**手順:**

1. ローカルで npm にログイン（ブラウザ認証が開く）
   ```sh
   npm login
   ```
2. 初回 publish を実行
   ```sh
   npm publish --no-provenance
   ```
   `--no-provenance` は `package.json` の `publishConfig.provenance: true` を上書きして provenance を無効化する。provenance は「どの CI のどのワークフローからビルドされたか」を OIDC で証明する仕組みで、CI 環境（GitHub Actions 等）でしか生成できない。ローカルから publish する場合はこのフラグが必要。
3. npm の設定画面で Trusted Publishers を登録
   - URL: `https://www.npmjs.com/package/@nozomiishii/pm/access`
   - Organization or user: `nozomiishii`
   - Repository: `pm`
   - Workflow filename: `release.yaml`
4. 同じページの **Publishing access** で **"Require two-factor authentication and disallow tokens (recommended)"** を選択
   - Trusted Publishers はどちらの設定でも動作する
   - disallow tokens にすることで、トークン漏洩による不正 publish を完全にブロックできる
5. 以降は CI の release-please → npm-publish ジョブで自動 publish される

## 参考リンク

- [npm Trusted Publishers ドキュメント](https://docs.npmjs.com/trusted-publishers)
- [npm/cli #8544 - Allow publishing initial version with OIDC](https://github.com/npm/cli/issues/8544)
- [GitHub Discussion #161015 - OIDC Support for npm Registry](https://github.com/orgs/community/discussions/161015)
- [GitHub Discussion #174507 - npm supply chain security roadmap](https://github.com/orgs/community/discussions/174507)
