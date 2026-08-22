import { defineConfig } from "tsdown";
import packageJson from "./package.json" with { type: "json" };

// SEA バイナリに同梱する node は開発時の runtime と揃える
const nodeVersion = packageJson.devEngines.runtime.version;

const shared = defineConfig({
  entry: ["src/cli.ts"],
  loader: { ".ascii": "text" },
});

export default defineConfig([
  {
    ...shared,
    name: "lib",
    outputOptions: { banner: "#!/usr/bin/env node" },
  },
  {
    ...shared,
    exe: {
      seaConfig: {
        disableExperimentalSEAWarning: true,
        useCodeCache: false,
        useSnapshot: false,
      },
      targets: [
        { arch: "x64", nodeVersion, platform: "darwin" },
        { arch: "arm64", nodeVersion, platform: "darwin" },
        { arch: "x64", nodeVersion, platform: "linux" },
        { arch: "arm64", nodeVersion, platform: "linux" },
      ],
    },
    name: "exe",
  },
]);
