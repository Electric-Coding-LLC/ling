import assert from "node:assert/strict";
import { readFile } from "node:fs/promises";
import test from "node:test";

const root = new URL("../", import.meta.url);

test("the root route has a branded, accessible loading state", async () => {
  const source = await readFile(new URL("app/loading.tsx", root), "utf8");
  const screen = await readFile(new URL("app/loading-screen.tsx", root), "utf8");
  const loadingStyles = await readFile(new URL("app/styles/loading.css", root), "utf8");
  const shellStyles = await readFile(new URL("app/styles/shell.css", root), "utf8");
  const globalStyles = await readFile(new URL("app/globals.css", root), "utf8");
  const kanaLoading = await readFile(new URL("app/stations/kana/loading.tsx", root), "utf8");
  const extensionsLoading = await readFile(
    new URL("app/stations/kana-extensions/loading.tsx", root),
    "utf8",
  );
  const soundMarksLoading = await readFile(
    new URL("app/stations/sound-marks/loading.tsx", root),
    "utf8",
  );
  const combinedSoundsLoading = await readFile(
    new URL("app/stations/combined-sounds/loading.tsx", root),
    "utf8",
  );
  const pitchAccentLoading = await readFile(
    new URL("app/stations/pitch-accent/loading.tsx", root),
    "utf8",
  );
  const wordsLoading = await readFile(
    new URL("app/stations/words/loading.tsx", root),
    "utf8",
  );
  const romajiLoading = await readFile(
    new URL("app/stations/romaji/loading.tsx", root),
    "utf8",
  );
  const japanLoading = await readFile(
    new URL("app/stations/japan/loading.tsx", root),
    "utf8",
  );
  const navigationFeedback = await readFile(
    new URL("app/navigation-feedback.tsx", root),
    "utf8",
  );
  const networkMap = await readFile(new URL("app/network-map.tsx", root), "utf8");
  const stationTopbar = await readFile(
    new URL("app/stations/station-topbar.tsx", root),
    "utf8",
  );
  const welcomeMapLink = await readFile(
    new URL("app/welcome/welcome-map-link.tsx", root),
    "utf8",
  );

  assert.match(source, /<LoadingScreen \/>/);
  assert.match(screen, /aria-busy="true"/);
  assert.match(screen, /aria-live="polite"/);
  assert.match(screen, /role="status"/);
  assert.match(screen, /<LingWordmark className="loading-wordmark" \/>/);
  assert.match(screen, /Entering station/);
  assert.match(screen, /returningToMap[\s\S]*"Returning to"/);
  assert.match(screen, /returningToMap \? "Map" : null/);
  assert.match(screen, /"Loading"/);
  assert.match(screen, /loading-title/);
  assert.match(screen, /loading-track/);
  assert.doesNotMatch(screen, /<svg|loading-network|spinner/i);
  assert.match(kanaLoading, /<LoadingScreen station="Kana" \/>/);
  assert.match(extensionsLoading, /<LoadingScreen station="Dakuten & Handakuten" \/>/);
  assert.match(soundMarksLoading, /<LoadingScreen station="Dakuten & Handakuten" \/>/);
  assert.match(combinedSoundsLoading, /<LoadingScreen station="Yōon" \/>/);
  assert.match(pitchAccentLoading, /<LoadingScreen station="Pitch" \/>/);
  assert.match(wordsLoading, /<LoadingScreen station="Words" \/>/);
  assert.match(romajiLoading, /<LoadingScreen station="Rōmaji" \/>/);
  assert.match(japanLoading, /<LoadingScreen station="Japan" \/>/);
  assert.doesNotMatch(loadingStyles, /--loading-accent|\.loading-shell\[data-station=/);
  assert.match(
    navigationFeedback,
    /<NavigationFeedbackContext value=\{\{ beginNavigation, scheduleNavigation \}\}>[\s\S]*<RouteReadyContext value=\{completeNavigation\}>/,
  );
  assert.match(navigationFeedback, /const pathname = usePathname\(\)/);
  assert.match(
    navigationFeedback,
    /<LoadingScreen[\s\S]*departing=\{pending\.departing\}[\s\S]*overlay[\s\S]*returningToMap=\{pending\.returningToMap\}[\s\S]*station=\{pending\.station\}/,
  );
  assert.match(networkMap, /<LoadingScreen boot overlay \/>/);
  assert.match(
    navigationFeedback,
    /<div className="route-transition-surface" key=\{pathname\}>/,
  );
  assert.match(navigationFeedback, /<NavigationCompletion onComplete=\{completeNavigation\} \/>/);
  assert.match(navigationFeedback, /useLayoutEffect\(\(\) => \{/);
  assert.match(
    navigationFeedback,
    /if \(pathname === "\/"\)[\s\S]*removeAttribute\("data-ling-ready"\)[\s\S]*else \{[\s\S]*dataset\.lingReady = "true"/,
  );
  assert.match(navigationFeedback, /if \(pathname !== "\/"\) onComplete\(\)/);
  assert.match(navigationFeedback, /document\.documentElement\.dataset\.lingReady = "true"/);
  assert.match(navigationFeedback, /const MINIMUM_ROUTE_TRANSITION_MS = 420/);
  assert.match(navigationFeedback, /const OVERLAY_EXIT_MS = 180/);
  assert.match(
    navigationFeedback,
    /minimumVisibleMs = current\.station \|\| current\.returningToMap[\s\S]*\? MINIMUM_ROUTE_TRANSITION_MS[\s\S]*: 0/,
  );
  assert.match(
    navigationFeedback,
    /minimumVisibleMs - \(performance\.now\(\) - current\.startedAt\)/,
  );
  assert.match(navigationFeedback, /departing: true/);
  assert.match(navigationFeedback, /pendingRef\.current = null/);
  assert.match(navigationFeedback, /usePathname, useRouter/);
  assert.match(
    navigationFeedback,
    /controlledNavigation = \(loadingMap \|\| loadingStation\) && typeof href === "string"/,
  );
  assert.match(
    navigationFeedback,
    /navigationTimeout\.current = window\.setTimeout\(\(\) => \{[\s\S]*action\(\);[\s\S]*\}, delayMs\)/,
  );
  assert.match(
    navigationFeedback,
    /if \(controlledNavigation && navigationDelayMs > 0\)[\s\S]*event\.preventDefault\(\);[\s\S]*scheduleNavigation\(performNavigation, navigationDelayMs\);[\s\S]*return/,
  );
  assert.match(
    navigationFeedback,
    /flushSync\(\(\) => \{[\s\S]*onNavigationCommit\?\.\(\);[\s\S]*beginNavigation\(\{ returningToMap: loadingMap, station: loadingStation \}\)/,
  );
  assert.match(
    navigationFeedback,
    /if \(replace\)[\s\S]*router\.replace\(href, \{ scroll \}\)[\s\S]*router\.push\(href, \{ scroll \}\)/,
  );
  assert.match(navigationFeedback, /if \(controlledNavigation\) event\.preventDefault\(\)/);
  assert.match(
    navigationFeedback,
    /\.querySelector\("\.loading-shell-boot"\)[\s\S]*\.setAttribute\("data-ling-departing", "true"\)/,
  );
  assert.match(navigationFeedback, /if \(\s*event\.defaultPrevented/);
  assert.match(
    navigationFeedback,
    /event\.metaKey[\s\S]*event\.ctrlKey[\s\S]*event\.shiftKey[\s\S]*event\.altKey[\s\S]*target !== "_self"/,
  );
  assert.doesNotMatch(navigationFeedback, /loadingVisible|showBootLoader|hasReachedReadyRoute/);
  assert.equal((stationTopbar.match(/loadingMap/g) ?? []).length, 2);
  assert.match(welcomeMapLink, /href="\/"[\s\S]*loadingMap/);

  assert.match(loadingStyles, /\.loading-shell\s*\{[^}]*min-height:\s*100dvh/s);
  assert.match(
    loadingStyles,
    /\.loading-shell-overlay\s*\{[^}]*position:\s*fixed[^}]*opacity:\s*1[^}]*transition:[^}]*opacity 180ms ease-out/s,
  );
  assert.match(
    loadingStyles,
    /\.loading-shell-overlay\[data-departing="true"\]\s*\{[^}]*opacity:\s*0[^}]*visibility:\s*hidden[^}]*pointer-events:\s*none/s,
  );
  assert.match(
    loadingStyles,
    /html\[data-ling-ready="true"\] \.loading-shell-boot,\s*\.loading-shell-boot\[data-ling-departing="true"\]\s*\{[^}]*opacity:\s*0[^}]*visibility:\s*hidden/s,
  );
  const hiddenBootRule = loadingStyles.match(
    /html\[data-ling-ready="true"\] \.loading-shell-boot,\s*\.loading-shell-boot\[data-ling-departing="true"\]\s*\{[^}]*\}/s,
  )?.[0] ?? "";
  assert.doesNotMatch(hiddenBootRule, /pointer-events/);
  assert.match(
    shellStyles,
    /\.route-transition-surface\s*\{[^}]*animation:\s*route-content-enter 180ms ease-out both/s,
  );
  assert.match(shellStyles, /@keyframes route-content-enter\s*\{[\s\S]*opacity:\s*0\.25[\s\S]*opacity:\s*1/s);
  assert.match(loadingStyles, /@keyframes loading-track-sweep/);
  assert.match(
    loadingStyles,
    /\.loading-track::after\s*\{[^}]*background:\s*var\(--foreground\)/s,
  );
  assert.match(
    globalStyles,
    /@media \(prefers-reduced-motion: reduce\)[\s\S]*\.loading-shell-overlay\s*\{[^}]*transition:\s*none[\s\S]*\.route-transition-surface\s*\{[^}]*animation:\s*none[\s\S]*\.loading-track::after\s*\{[^}]*animation:\s*none/s,
  );
});
