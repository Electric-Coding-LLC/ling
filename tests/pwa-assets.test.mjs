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
