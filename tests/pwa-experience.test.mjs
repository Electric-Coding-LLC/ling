import assert from "node:assert/strict";
import { readFile } from "node:fs/promises";
import test from "node:test";

const root = new URL("../", import.meta.url);

test("installed Ling supports guarded pull-to-refresh and build update feedback", async () => {
  const [experience, layout, shellStyles, globalStyles] = await Promise.all([
    readFile(new URL("app/pwa-experience.tsx", root), "utf8"),
    readFile(new URL("app/layout.tsx", root), "utf8"),
    readFile(new URL("app/styles/shell.css", root), "utf8"),
    readFile(new URL("app/globals.css", root), "utf8"),
  ]);

  assert.match(layout, /<PwaExperience \{\.\.\.appVersion\} \/>/);
  assert.match(experience, /matchMedia\("\(display-mode: standalone\)"\)/);
  assert.match(experience, /standalone === true/);
  assert.match(experience, /event\.touches\.length !== 1 \|\| window\.scrollY > 0/);
  assert.match(experience, /Math\.abs\(distanceX\) >= distanceY/);
  assert.match(experience, /addEventListener\("touchmove", onTouchMove, \{ passive: false \}\)/);
  assert.match(experience, /event\.preventDefault\(\)/);
  assert.match(experience, /rawPullDistanceRef\.current < PULL_REFRESH_THRESHOLD/);
  assert.match(experience, /window\.location\.reload\(\)/);
  assert.match(experience, /Pull to refresh/);
  assert.match(experience, /Release to refresh/);
  assert.match(experience, /Refreshing Ling/);

  assert.match(experience, /fetch\("\/api\/pwa\/version", \{/);
  assert.match(experience, /cache: "no-store"/);
  assert.match(experience, /current\.build !== build/);
  assert.match(experience, /addEventListener\("focus", checkForUpdate\)/);
  assert.match(experience, /addEventListener\("visibilitychange", checkWhenVisible\)/);
  assert.match(experience, /localStorage\.getItem\(LAST_BUILD_STORAGE_KEY\)/);
  assert.match(experience, /previousBuild !== build/);
  assert.match(experience, /A Ling update is ready/);
  assert.match(experience, /Ling updated/);
  assert.match(experience, /aria-live="polite"/);

  assert.match(shellStyles, /\.pwa-pull-indicator\s*\{[^}]*position:\s*fixed/s);
  assert.match(shellStyles, /\.pwa-update-toast\s*\{[^}]*position:\s*fixed/s);
  assert.match(shellStyles, /env\(safe-area-inset-bottom\)/);
  assert.match(globalStyles, /prefers-reduced-motion: reduce[\s\S]*\.pwa-pull-indicator/);
});

test("Help lists the package version and deployment build", async () => {
  const [help, version, route, viteConfig] = await Promise.all([
    readFile(new URL("app/stations/help/page.tsx", root), "utf8"),
    readFile(new URL("src/modules/app-version.ts", root), "utf8"),
    readFile(new URL("app/api/pwa/version/route.ts", root), "utf8"),
    readFile(new URL("vite.config.ts", root), "utf8"),
  ]);

  assert.match(help, /Version \{formatAppVersion\(appVersion\)\}/);
  assert.match(version, /packageJson\.version/);
  assert.match(version, /build: __LING_BUILD_SHA__/);
  assert.match(viteConfig, /__LING_BUILD_SHA__:\s*JSON\.stringify/);
  assert.match(version, /build\.slice\(0, 7\)/);
  assert.match(route, /getAppVersion\(\)/);
});
