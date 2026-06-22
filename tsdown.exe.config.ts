import { defineConfig } from "tsdown";

export default defineConfig({
  entry: ["src/cli.ts"],
  exe: {
    targets: [
      { platform: "darwin", arch: "x64", nodeVersion: "25.7.0" },
      { platform: "darwin", arch: "arm64", nodeVersion: "25.7.0" },
      { platform: "linux", arch: "x64", nodeVersion: "25.7.0" },
      { platform: "linux", arch: "arm64", nodeVersion: "25.7.0" },
    ],
    seaConfig: {
      disableExperimentalSEAWarning: true,
      useCodeCache: false,
      useSnapshot: false,
    },
  },
});
