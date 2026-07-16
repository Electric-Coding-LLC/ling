import assert from "node:assert/strict";
import { access, readFile } from "node:fs/promises";
import test from "node:test";

const root = new URL("../", import.meta.url);

test("manifest declares a standalone app with complete icons", async () => {
  const manifest = JSON.parse(await readFile(new URL("public/manifest.webmanifest", root), "utf8"));
  assert.equal(manifest.id, "/");
  assert.equal(manifest.start_url, "/");
  assert.equal(manifest.scope, "/");
  assert.equal(manifest.display, "standalone");

  for (const icon of manifest.icons) {
    const path = new URL(`public${icon.src}`, root);
    await access(path);
    const bytes = await readFile(path);
    const [expectedWidth, expectedHeight] = icon.sizes.split("x").map(Number);
    assert.equal(bytes.readUInt32BE(16), expectedWidth);
    assert.equal(bytes.readUInt32BE(20), expectedHeight);
  }
});

test("brand assets use the four-stroke Ling mark", async () => {
  const favicon = await readFile(new URL("public/favicon.svg", root), "utf8");
  const mark = await readFile(new URL("public/brand/ling-mark.svg", root), "utf8");
  const icon = await readFile(new URL("public/brand/ling-app-icon.svg", root), "utf8");

  for (const asset of [favicon, mark, icon]) {
    assert.match(asset, /data-brand="ling-four-stroke"/);
    assert.equal((asset.match(/<path\b/g) ?? []).length, 4);
  }
  assert.doesNotMatch(favicon, /#68C4FF|#0C79D8|#2E9EFF/i);
});

test("the standalone wordmark uses fixed vector outlines", async () => {
  const wordmark = await readFile(new URL("public/brand/ling-wordmark.svg", root), "utf8");

  assert.match(wordmark, /data-brand="ling-wordmark"/);
  assert.match(wordmark, /data-glyph-style="concept-b-primary"/);
  assert.match(wordmark, /stroke-width: 12/);
  assert.doesNotMatch(wordmark, /<text\b/i);
  assert.equal((wordmark.match(/<use\b/g) ?? []).length, 4);
});

test("the app shell is fullscreen at every viewport", async () => {
  const styles = await readFile(new URL("app/globals.css", root), "utf8");
  const shell = styles.match(/\.shell\s*\{([^}]*)\}/)?.[1] ?? "";

  assert.match(shell, /min-height: 100dvh/);
  assert.match(shell, /background: var\(--surface\)/);
  assert.doesNotMatch(shell, /margin:/);
  assert.doesNotMatch(shell, /border(?:-radius)?:/);
});

test("service worker caches only the static shell and bypasses private routes", async () => {
  const worker = await readFile(new URL("public/sw.js", root), "utf8");
  assert.match(worker, /OFFLINE_URL = "\/offline\.html"/);
  assert.match(worker, /request\.mode === "navigate"/);
  assert.match(worker, /fetch\(request\)\.catch\(\(\) => caches\.match\(OFFLINE_URL\)\)/);
  assert.match(worker, /pathname\.startsWith\("\/api\/"\)/);
  assert.match(worker, /\/signin-with-chatgpt/);
  assert.match(worker, /\/signout-with-chatgpt/);
  assert.match(worker, /\/callback/);
  assert.doesNotMatch(worker, /cache\.put\(request/);
  assert.doesNotMatch(worker, /skipWaiting/);
});

test("service worker registration is production-only", async () => {
  const registration = await readFile(new URL("app/pwa-registration.tsx", root), "utf8");
  assert.match(registration, /process\.env\.NODE_ENV !== "production"/);
  assert.match(registration, /navigator\.serviceWorker\s*\.register\("\/sw\.js"/);
});
