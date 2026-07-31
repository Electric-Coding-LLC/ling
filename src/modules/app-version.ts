import packageJson from "../../package.json";

declare const __LING_BUILD_SHA__: string;

export type AppVersion = {
  readonly build: string;
  readonly version: string;
};

export function getAppVersion(): AppVersion {
  return {
    build: __LING_BUILD_SHA__,
    version: packageJson.version,
  };
}

export function formatAppVersion({ build, version }: AppVersion) {
  const buildLabel = build === "development" ? build : build.slice(0, 7);
  return `${version} · ${buildLabel}`;
}
