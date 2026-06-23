import { defineConfig } from "tsdown";

const shared = {
  entry: ["src/cli.ts"],
  loader: { ".ascii": "text" },
} as const;

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
        { arch: "x64", nodeVersion: "25.7.0", platform: "darwin" },
        { arch: "arm64", nodeVersion: "25.7.0", platform: "darwin" },
        { arch: "x64", nodeVersion: "25.7.0", platform: "linux" },
        { arch: "arm64", nodeVersion: "25.7.0", platform: "linux" },
      ],
    },
    name: "exe",
  },
]);
