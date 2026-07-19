import assert from "node:assert/strict";
import { readFile } from "node:fs/promises";
import test from "node:test";

const root = new URL("../", import.meta.url);

test("the root route has a branded, accessible loading state", async () => {
  const source = await readFile(new URL("app/loading.tsx", root), "utf8");
  const loadingStyles = await readFile(new URL("app/styles/loading.css", root), "utf8");
  const globalStyles = await readFile(new URL("app/globals.css", root), "utf8");

  assert.match(source, /import \{ LingMark \} from "\.\/brand"/);
  assert.match(source, /aria-busy="true"/);
  assert.match(source, /aria-live="polite"/);
  assert.match(source, /role="status"/);
  assert.match(source, /Opening your network…/);
  assert.match(source, /loading-network-sound/);
  assert.match(source, /d="M90 24h70"/);
  assert.doesNotMatch(source, /loading-network-writing|loading-network-interchange/);
  assert.doesNotMatch(source, /percent|progress|spinner/i);

  assert.match(loadingStyles, /\.loading-shell\s*\{[^}]*min-height:\s*100dvh/s);
  assert.match(loadingStyles, /@keyframes loading-network-pulse/);
  assert.match(
    globalStyles,
    /@media \(prefers-reduced-motion: reduce\)[\s\S]*\.loading-network-pulse\s*\{[^}]*animation:\s*none/s,
  );
});
