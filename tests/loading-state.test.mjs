import assert from "node:assert/strict";
import { readFile } from "node:fs/promises";
import test from "node:test";

const root = new URL("../", import.meta.url);

test("the root route has a branded, accessible loading state", async () => {
  const source = await readFile(new URL("app/loading.tsx", root), "utf8");
  const screen = await readFile(new URL("app/loading-screen.tsx", root), "utf8");
  const loadingStyles = await readFile(new URL("app/styles/loading.css", root), "utf8");
  const globalStyles = await readFile(new URL("app/globals.css", root), "utf8");
  const kanaLoading = await readFile(new URL("app/stations/kana/loading.tsx", root), "utf8");

  assert.match(source, /<LoadingScreen \/>/);
  assert.match(screen, /aria-busy="true"/);
  assert.match(screen, /aria-live="polite"/);
  assert.match(screen, /role="status"/);
  assert.match(screen, /Opening station/);
  assert.match(screen, /loading-title/);
  assert.match(screen, /loading-track/);
  assert.doesNotMatch(screen, /<svg|loading-network|spinner/i);
  assert.match(kanaLoading, /<LoadingScreen station="Kana" \/>/);

  assert.match(loadingStyles, /\.loading-shell\s*\{[^}]*min-height:\s*100dvh/s);
  assert.match(loadingStyles, /\.loading-shell-overlay\s*\{[^}]*position:\s*fixed/s);
  assert.match(loadingStyles, /@keyframes loading-track-sweep/);
  assert.match(
    globalStyles,
    /@media \(prefers-reduced-motion: reduce\)[\s\S]*\.loading-track::after\s*\{[^}]*animation:\s*none/s,
  );
});
