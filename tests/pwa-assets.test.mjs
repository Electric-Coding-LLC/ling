import assert from "node:assert/strict";
import { createHash } from "node:crypto";
import { readFile } from "node:fs/promises";
import test from "node:test";

const root = new URL("../", import.meta.url);

async function layoutAssetPath(field) {
  const layout = await readFile(new URL("app/layout.tsx", root), "utf8");
  const match = layout.match(new RegExp("\\b" + field + ':\\s*"([^"]+)"'));
  assert.ok(match, "layout metadata must declare " + field);
  return match[1];
}

async function readPublicAsset(path) {
  assert.match(path, /^\//);
  return readFile(new URL("public" + path, root));
}

function assertContentAddressed(path, bytes, extension) {
  const digest = createHash("sha256").update(bytes).digest("hex").slice(0, 8);
  assert.ok(
    path.endsWith("-" + digest + extension),
    path + " must include its current content fingerprint",
  );
}

test("manifest declares a standalone app with content-addressed icons", async () => {
  const manifestPath = await layoutAssetPath("manifest");
  const manifestBytes = await readPublicAsset(manifestPath);
  assertContentAddressed(manifestPath, manifestBytes, ".webmanifest");

  const manifest = JSON.parse(manifestBytes.toString("utf8"));
  assert.equal(manifest.id, "/");
  assert.equal(manifest.start_url, "/");
  assert.equal(manifest.scope, "/");
  assert.equal(manifest.display, "standalone");

  for (const icon of manifest.icons) {
    const bytes = await readPublicAsset(icon.src);
    assertContentAddressed(icon.src, bytes, ".png");

    const [expectedWidth, expectedHeight] = icon.sizes.split("x").map(Number);
    assert.equal(bytes.readUInt32BE(16), expectedWidth);
    assert.equal(bytes.readUInt32BE(20), expectedHeight);
  }
});

test("browser and Apple icons use content-addressed Ling branding", async () => {
  const faviconPath = await layoutAssetPath("icon");
  const shortcutPath = await layoutAssetPath("shortcut");
  const applePath = await layoutAssetPath("apple");
  assert.equal(shortcutPath, faviconPath);

  const [faviconBytes, appleBytes, mark, icon] = await Promise.all([
    readPublicAsset(faviconPath),
    readPublicAsset(applePath),
    readFile(new URL("public/brand/ling-mark.svg", root), "utf8"),
    readFile(new URL("public/brand/ling-app-icon.svg", root), "utf8"),
  ]);

  assertContentAddressed(faviconPath, faviconBytes, ".svg");
  assertContentAddressed(applePath, appleBytes, ".png");
  assert.equal(appleBytes.readUInt32BE(16), appleBytes.readUInt32BE(20));

  const favicon = faviconBytes.toString("utf8");
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

test("service worker caches only the offline fallback and bypasses private routes", async () => {
  const worker = await readFile(new URL("public/sw.js", root), "utf8");
  assert.match(worker, /CACHE_NAME = "ling-shell-v0\.1\.1"/);
  assert.match(worker, /OFFLINE_URL = "\/offline\.html"/);
  assert.match(worker, /SHELL_ASSETS = \[OFFLINE_URL\]/);
  assert.match(worker, /request\.mode === "navigate"/);
  assert.match(worker, /fetch\(request\)\.catch\(\(\) => caches\.match\(OFFLINE_URL\)\)/);
  assert.match(worker, /pathname\.startsWith\("\/api\/"\)/);
  assert.match(worker, /\/signin-with-chatgpt/);
  assert.match(worker, /\/signout-with-chatgpt/);
  assert.match(worker, /\/callback/);
  assert.doesNotMatch(worker, /manifest\.webmanifest|\/icons\//);
  assert.doesNotMatch(worker, /cache\.put\(request/);
  assert.doesNotMatch(worker, /skipWaiting/);
});

test("service worker registration is production-only and bypasses HTTP caching", async () => {
  const registration = await readFile(new URL("app/pwa-registration.tsx", root), "utf8");
  assert.match(registration, /process\.env\.NODE_ENV !== "production"/);
  assert.match(registration, /navigator\.serviceWorker\s*\.register\("\/sw\.js"/);
  assert.match(registration, /updateViaCache:\s*"none"/);
});
