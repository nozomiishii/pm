// @see https://eslint.org/
// @see https://github.com/nozomiishii/configs/tree/main/packages/eslint-config
import { defineConfig, node } from "@nozomiishii/eslint-config";

export default defineConfig([
  ...node(),

  // エラーの解決手順や、よくある対応パターンはこちらにまとめています:
  // https://github.com/nozomiishii/configs/blob/main/packages/eslint-config/docs/troubleshooting.md
  {
    name: "project/overrides",
    rules: {
      "n/no-process-env": ["error", { allowedVariables: ["HOME", "APPDATA", "PM_CONFIG"] }],
      "n/no-process-exit": "off",
      "no-console": "off",
      "unicorn/no-process-exit": "off",
    },
  },
]);
