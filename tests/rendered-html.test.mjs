import assert from "node:assert/strict";
import test from "node:test";

async function request(pathname = "/") {
  const workerUrl = new URL("../dist/server/index.js", import.meta.url);
  workerUrl.searchParams.set("test", `${process.pid}-${Date.now()}-${pathname}`);
  const { default: worker } = await import(workerUrl.href);

  return worker.fetch(
    new Request(`http://localhost${pathname}`, {
      headers: { accept: pathname.startsWith("/api/") ? "application/json" : "text/html" },
    }),
    {
      ASSETS: { fetch: async () => new Response("Not found", { status: 404 }) },
    },
    { waitUntil() {}, passThroughOnException() {} },
  );
}

test("server-renders the Ling network home", async () => {
  const response = await request();
  assert.equal(response.status, 200);
  assert.match(response.headers.get("content-type") ?? "", /^text\/html\b/i);

  const html = await response.text();
  assert.match(html, /<title>Ling<\/title>/i);
  assert.match(html, /rel="manifest" href="\/manifest-[a-f0-9]{8}\.webmanifest"/i);
  assert.doesNotMatch(html, /rel="apple-touch-icon"/i);
  assert.match(html, /data-brand="ling-four-stroke"/i);
  assert.match(html, /viewBox="7 7 50 50"/i);
  assert.match(html, /data-line="sound"[^>]*>Sound</i);
  assert.match(html, /data-line="script"[^>]*>Script</i);
  assert.match(html, /data-network-view="desktop"/i);
  assert.match(html, /data-network-view="mobile"/i);
  assert.match(html, /aria-label="Sound and Script network"/i);
  assert.doesNotMatch(html, /<title>Sound and Script network<\/title>/i);
  assert.match(html, /data-tooltip="Sound line"/i);
  assert.match(html, /data-tooltip="Script line"/i);
  assert.doesNotMatch(html, /<title>(?:Sound|Script) line<\/title>/i);
  assert.match(html, /data-station="vowels"/i);
  assert.match(html, /data-station="mora-timing"/i);
  assert.match(html, /data-station="hiragana"/i);
  assert.match(html, /data-station="vowels"[^>]*data-station-kind="interchange"/i);
  assert.match(html, /data-station="mora-timing"[^>]*data-station-kind="single-line"/i);
  assert.match(html, /data-station="hiragana"[^>]*data-station-kind="single-line"/i);
  assert.match(html, /href="\/stations\/vowels"/i);
  assert.match(html, /alt="Ling"/i);
  assert.doesNotMatch(html, /aria-label="Ready"/i);
  assert.doesNotMatch(html, /Your site is taking shape|Codex is working|react-loading-skeleton/i);
});

test("server-renders the network at a linked station location", async () => {
  const response = await request("/?focus=mora-timing");
  assert.equal(response.status, 200);

  const html = await response.text();
  assert.match(html, /data-mobile-focus="mora"/i);
  assert.match(html, /network-mobile-track-mora/i);
});

test("server-renders the first guided Vowels station", async () => {
  const response = await request("/stations/vowels");
  assert.equal(response.status, 200);
  assert.match(response.headers.get("content-type") ?? "", /^text\/html\b/i);

  const html = await response.text();
  assert.match(html, /href="\/"/i);
  assert.match(html, /aria-label="Station navigation"/i);
  assert.doesNotMatch(html, /aria-current="page"/i);
  assert.doesNotMatch(html, /href="\/stations\/mora-timing"/i);
  assert.match(html, /aria-label="Return to network map from Vowels"/i);
  assert.equal((html.match(/href="\/\?focus=vowels"/gi) ?? []).length, 2);
  assert.match(html, /data-position="vowels"/i);
  assert.match(html, /class="station-map-sound"/i);
  assert.match(html, /class="station-map-script"/i);
  assert.doesNotMatch(html, /data-terminal="true"/i);
  assert.match(html, /Vowels/i);
  assert.match(html, /data-line="sound"[^>]*>Sound</i);
  assert.match(html, /data-line="script"[^>]*>Script</i);
  assert.doesNotMatch(html, /Cold check/i);
  assert.match(html, /Listen/i);
  assert.match(html, /Reveal/i);
  assert.match(html, /data-icon="ear"/i);
  assert.match(html, /data-icon="eye"/i);
  assert.match(html, /あ/);
  assert.match(html, /Open your mouth naturally/i);
  assert.match(html, /Say it aloud/i);
  assert.match(html, /Sound to writing/i);
  assert.match(html, /Writing to sound/i);
  assert.doesNotMatch(html, /synthetic.*not.*human.reviewed/i);
  assert.doesNotMatch(html, /\bromaji\b/i);
  assert.doesNotMatch(html, /score|streak|progress meter/i);
});

test("server-renders an honest Mora timing preview", async () => {
  const response = await request("/stations/mora-timing");
  assert.equal(response.status, 200);
  assert.match(response.headers.get("content-type") ?? "", /^text\/html\b/i);

  const html = await response.text();
  assert.match(html, /Mora timing/i);
  assert.match(html, /href="\/"/i);
  assert.match(html, /aria-label="Station navigation"/i);
  assert.doesNotMatch(html, /aria-current="page"/i);
  assert.doesNotMatch(html, /href="\/stations\/vowels"/i);
  assert.match(html, /aria-label="Return to network map from Mora timing"/i);
  assert.equal((html.match(/href="\/\?focus=mora-timing"/gi) ?? []).length, 2);
  assert.match(html, /data-position="mora-timing"/i);
  assert.match(html, /data-terminal="true"/i);
  assert.match(html, /class="station-map-sound"/i);
  assert.doesNotMatch(html, /class="station-map-script"/i);
  assert.match(html, /mapped.*lesson.*not.*built/i);
  assert.doesNotMatch(html, /Start lesson|Continue lesson/i);
});

test("health and version routes are private and non-cacheable", async () => {
  const health = await request("/api/health");
  assert.equal(health.status, 200);
  assert.equal(health.headers.get("cache-control"), "private, no-store");
  assert.deepEqual(await health.json(), { status: "ok" });

  const version = await request("/api/pwa/version");
  assert.equal(version.status, 200);
  assert.equal(version.headers.get("cache-control"), "private, no-store");
  assert.equal((await version.json()).version, "0.1.0");
});

test("the current-user API fails closed without production identity", async () => {
  const response = await request("/api/me");
  assert.equal(response.status, 401);
  assert.equal(response.headers.get("cache-control"), "private, no-store");
  assert.deepEqual(await response.json(), { error: "unauthorized" });
});
