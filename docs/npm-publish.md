# npm 配布フロー

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

## 認証方式: Trusted Publishers / OIDC

OIDC で短命トークンを自動発行する仕組み。シークレット管理が不要で、provenance attestation も自動付与される。

設定は npm の Web UI から行うが、パッケージが存在しないと設定できない。設定より先に publish する必要があるので、最初の 1 回だけローカルから publish する。

```
1 回目      ローカルから npm publish
              → npm にパッケージができる
              → Trusted Publishers を設定 (Web UI)
2 回目以降  CI が OIDC で publish
```

この制約の OIDC 対応は [npm/cli #8544](https://github.com/npm/cli/issues/8544) で議論中（npm チームは「MVP から意図的に除外、引き続き検討」と回答）。

## 初回パブリッシュ

- ローカルで npm にログインする（ブラウザ認証が開く）

  ```sh
  npm login
  ```

- 初回 publish を実行する

  ```sh
  npm publish --no-provenance
  ```

  `--no-provenance` は `package.json` の `publishConfig.provenance: true` を上書きして provenance を無効化する。provenance は「どの CI のどのワークフローからビルドされたか」を OIDC で証明する仕組みで、CI 環境（GitHub Actions 等）でしか生成できない。ローカルから publish する場合はこのフラグが必要。

- `https://www.npmjs.com/package/@nozomiishii/pm/access` で Trusted Publishers を登録する
  - Organization or user: `nozomiishii`
  - Repository: `pm`
  - Workflow filename: `release.yaml`

- 同じページの Publishing access で "Require two-factor authentication and disallow tokens (recommended)" を選ぶ。Trusted Publishers はどちらの設定でも動作するが、disallow tokens にすればトークン漏洩による不正 publish を完全にブロックできる

## CI ワークフロー（release.yaml）

```
release-please → リリース作成 → npm-publish ジョブ実行 → npm publish
```

- `.npmrc` は用意しない。publish 先は pnpm 既定の `https://registry.npmjs.org/` で、pnpm 11 の OIDC は `ACTIONS_ID_TOKEN_REQUEST_*` だけを読む（[pnpm v11.1.3](https://github.com/pnpm/pnpm/releases/tag/v11.1.3)）
- `id-token: write` 権限は OIDC トークン生成（Trusted Publishers / provenance）に必要
- `publishConfig` は `package.json` に記述しており、CI の `npm publish` にフラグは不要

```jsonc
// package.json
"publishConfig": {
  "access": "public",    // スコープ付きパッケージはデフォルト private のため必要
  "provenance": true     // ビルド元のリポジトリ・ワークフローを証明する署名を付与
}
```

## 参考リンク

- [npm Trusted Publishers ドキュメント](https://docs.npmjs.com/trusted-publishers)
- [npm/cli #8544 - Allow publishing initial version with OIDC](https://github.com/npm/cli/issues/8544)
- [GitHub Discussion #161015 - OIDC Support for npm Registry](https://github.com/orgs/community/discussions/161015)
- [GitHub Discussion #174507 - npm supply chain security roadmap](https://github.com/orgs/community/discussions/174507)
