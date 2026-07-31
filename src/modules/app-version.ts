import packageJson from "../../package.json";

export type AppVersion = {
  readonly build: string;
  readonly version: string;
};

export function getAppVersion(): AppVersion {
  return {
    build: process.env.SITES_BUILD_SHA ?? "development",
    version: packageJson.version,
  };
}

export function formatAppVersion({ build, version }: AppVersion) {
  const buildLabel = build === "development" ? build : build.slice(0, 7);
  return `${version} · ${buildLabel}`;
}
