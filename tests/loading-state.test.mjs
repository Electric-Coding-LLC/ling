import assert from "node:assert/strict";
import { readFile } from "node:fs/promises";
import test from "node:test";

const root = new URL("../", import.meta.url);

test("the root route has a branded, accessible loading state", async () => {
  const source = await readFile(new URL("app/loading.tsx", root), "utf8");
  const styles = await readFile(new URL("app/globals.css", root), "utf8");

  assert.match(source, /import \{ LingMark \} from "\.\/brand"/);
  assert.match(source, /aria-busy="true"/);
  assert.match(source, /aria-live="polite"/);
  assert.match(source, /role="status"/);
  assert.match(source, /Opening your network…/);
  assert.match(source, /loading-network-sound/);
  assert.match(source, /loading-network-script/);
  assert.doesNotMatch(source, /percent|progress|spinner/i);

  assert.match(styles, /\.loading-shell\s*\{[^}]*min-height:\s*100dvh/s);
  assert.match(styles, /@keyframes loading-network-pulse/);
  assert.match(
    styles,
    /@media \(prefers-reduced-motion: reduce\)[\s\S]*\.loading-network-pulse\s*\{[^}]*animation:\s*none/s,
  );
});
