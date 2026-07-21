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
  assert.equal(manifest.background_color, "#11110f");
  assert.equal(manifest.theme_color, "#11110f");

  for (const icon of manifest.icons) {
    const bytes = await readPublicAsset(icon.src);
    assertContentAddressed(icon.src, bytes, ".png");

    const [expectedWidth, expectedHeight] = icon.sizes.split("x").map(Number);
    assert.equal(bytes.readUInt32BE(16), expectedWidth);
    assert.equal(bytes.readUInt32BE(20), expectedHeight);
  }
});

test("browser icons use content-addressed Ling branding", async () => {
  const faviconPath = await layoutAssetPath("icon");
  const shortcutPath = await layoutAssetPath("shortcut");
  assert.equal(shortcutPath, faviconPath);

  const [faviconBytes, mark, icon] = await Promise.all([
    readPublicAsset(faviconPath),
    readFile(new URL("public/brand/ling-mark.svg", root), "utf8"),
    readFile(new URL("public/brand/ling-app-icon.svg", root), "utf8"),
  ]);

  assertContentAddressed(faviconPath, faviconBytes, ".svg");

  const favicon = faviconBytes.toString("utf8");
  for (const asset of [favicon, mark, icon]) {
    assert.match(asset, /data-brand="ling-four-stroke"/);
    assert.equal((asset.match(/<path\b/g) ?? []).length, 4);
  }
  assert.doesNotMatch(favicon, /#68C4FF|#0C79D8|#2E9EFF/i);
});

test("Safari installation bypasses the private Sites asset perimeter", async () => {
  const layout = await readFile(new URL("app/layout.tsx", root), "utf8");
  const installIcon = layout.match(
    /safariInstallIcon\s*=\s*"(https:\/\/raw\.githubusercontent\.com\/[^\"]+)"/,
  );

  assert.ok(installIcon, "Safari install icon must be publicly fetchable");
  assert.match(
    layout,
    /\bapple:\s*\[\{ url: safariInstallIcon, sizes: "512x512", type: "image\/png" \}\]/,
  );
  assert.match(
    installIcon[1],
    /^https:\/\/raw\.githubusercontent\.com\/Electric-Coding-LLC\/ling\/[a-f0-9]{40}\/public\/icons\/icon-512-[a-f0-9]{8}\.png$/,
  );

  const publicPath = new URL(installIcon[1]).pathname.replace(
    /^\/Electric-Coding-LLC\/ling\/[a-f0-9]{40}\/public/,
    "",
  );
  const bytes = await readPublicAsset(publicPath);
  assertContentAddressed(publicPath, bytes, ".png");
  assert.equal(bytes.readUInt32BE(16), 512);
  assert.equal(bytes.readUInt32BE(20), 512);
});

test("the standalone wordmark uses fixed vector outlines", async () => {
  const wordmark = await readFile(new URL("public/brand/ling-wordmark.svg", root), "utf8");

  assert.match(wordmark, /data-brand="ling-wordmark"/);
  assert.match(wordmark, /data-glyph-style="concept-b-primary"/);
  assert.match(wordmark, /stroke-width: 12/);
  assert.match(wordmark, /fill: #f2f1eb/);
  assert.match(wordmark, /stroke: #f2f1eb/);
  assert.doesNotMatch(wordmark, /prefers-color-scheme/);
  assert.doesNotMatch(wordmark, /<text\b/i);
  assert.equal((wordmark.match(/<use\b/g) ?? []).length, 4);
});

test("the app shell is fullscreen at every viewport", async () => {
  const styles = await readFile(new URL("app/styles/shell.css", root), "utf8");
  const shell = styles.match(/\.shell\s*\{([^}]*)\}/)?.[1] ?? "";

  assert.match(shell, /min-height: 100dvh/);
  assert.match(shell, /background: var\(--surface\)/);
  assert.doesNotMatch(shell, /margin:/);
  assert.doesNotMatch(shell, /border(?:-radius)?:/);
});

test("the server-rendered boot screen remains until React is responsive", async () => {
  const [layout, loading, ready] = await Promise.all([
    readFile(new URL("app/layout.tsx", root), "utf8"),
    readFile(new URL("app/styles/loading.css", root), "utf8"),
    readFile(new URL("app/boot-ready.tsx", root), "utf8"),
  ]);

  assert.match(layout, /<LoadingScreen boot overlay \/>/);
  assert.match(layout, /<BootReady \/>/);
  assert.match(loading, /html\[data-ling-ready="true"\] \.loading-shell-boot\s*\{[^}]*display:\s*none/s);
  assert.match(ready, /performance\.mark\(HYDRATION_MARK\)/);
  assert.match(ready, /document\.documentElement\.dataset\.lingReady = "true"/);
});

test("the retirement worker removes the legacy offline shell", async () => {
  const worker = await readFile(new URL("public/sw.js", root), "utf8");
  assert.match(worker, /self\.skipWaiting\(\)/);
  assert.match(worker, /cacheName\.startsWith\("ling-shell-"\)/);
  assert.match(worker, /self\.registration\.unregister\(\)/);
  assert.doesNotMatch(worker, /addEventListener\("fetch"/);
  assert.doesNotMatch(worker, /cache\.add|cache\.put/);
});

test("production removes legacy Ling workers and caches instead of registering one", async () => {
  const cleanup = await readFile(new URL("app/pwa-cleanup.tsx", root), "utf8");
  assert.match(cleanup, /process\.env\.NODE_ENV !== "production"/);
  assert.match(cleanup, /navigator\.serviceWorker\.getRegistrations\(\)/);
  assert.match(cleanup, /registration\.unregister\(\)/);
  assert.match(cleanup, /cacheName\.startsWith\(LING_CACHE_PREFIX\)/);
  assert.match(cleanup, /caches\.delete\(cacheName\)/);
  assert.doesNotMatch(cleanup, /\.register\("\/sw\.js"/);
});
