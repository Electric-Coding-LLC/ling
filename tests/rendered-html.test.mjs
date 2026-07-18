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
  assert.equal(response.headers.get("cache-control"), "private, no-store");

  const html = await response.text();
  assert.match(html, /<title>Ling<\/title>/i);
  assert.match(html, /rel="manifest" href="\/manifest-[a-f0-9]{8}\.webmanifest"/i);
  assert.match(
    html,
    /rel="apple-touch-icon" href="https:\/\/raw\.githubusercontent\.com\/Electric-Coding-LLC\/ling\/[a-f0-9]{40}\/public\/icons\/icon-512-[a-f0-9]{8}\.png" sizes="512x512" type="image\/png"/i,
  );
  assert.match(html, /data-brand="ling-four-stroke"/i);
  assert.match(html, /viewBox="7 7 50 50"/i);
  assert.match(html, /data-line="sound"[^>]*>Sound</i);
  assert.match(html, /data-line="script"[^>]*>Script</i);
  assert.match(html, /data-network-view="desktop"/i);
  assert.match(html, /class="network-desktop-viewport"[^>]*tabindex="0"/i);
  assert.doesNotMatch(html, /class="network-map network-map-desktop"[^>]*tabindex=/i);
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

test("server-renders the minimal Vowels station", async () => {
  const response = await request("/stations/vowels");
  assert.equal(response.status, 200);
  assert.match(response.headers.get("content-type") ?? "", /^text\/html\b/i);

  const html = await response.text();
  assert.match(html, /aria-label="Return to the Ling network map"/i);
  assert.match(html, /href="\/"/i);
  assert.match(html, /aria-label="Station navigation"/i);
  assert.doesNotMatch(html, /aria-current="page"/i);
  assert.doesNotMatch(html, /href="\/stations\/mora-timing"/i);
  assert.match(html, /aria-label="Return to network map from Vowels"/i);
  assert.equal((html.match(/href="\/\?focus=vowels"/gi) ?? []).length, 1);
  assert.match(html, /data-position="vowels"/i);
  assert.match(html, /class="station-map-sound"/i);
  assert.match(html, /class="station-map-script"/i);
  assert.match(html, /aria-label="Lines"/i);
  assert.match(html, /data-line="sound"[^>]*>Sound</i);
  assert.match(html, /data-line="script"[^>]*>Script</i);
  assert.match(html, /Vowels/i);
  assert.match(html, /aria-label="Japanese vowels"/i);
  assert.match(html, /class="station-page station-page-vowels"/i);
  assert.match(html, /<th scope="col">Kana<\/th>/i);
  assert.match(
    html,
    /<th class="vowels-english-heading" scope="col">English<\/th>/i,
  );
  assert.match(html, /<th scope="col">Example<\/th>/i);
  assert.match(html, /<th scope="col">Translation<\/th>/i);
  assert.equal((html.match(/class="vowel-audio-button vowel-kana-button"/gi) ?? []).length, 5);
  assert.match(html, />あ<.*>い<.*>う<.*>え<.*>お</is);
  assert.match(html, /Japanese has five clear, steady vowels/i);
  assert.match(
    html,
    /<td class="vowel-english-cue">a<\/td>.*<td class="vowel-english-cue">i<\/td>.*<td class="vowel-english-cue">u<\/td>.*<td class="vowel-english-cue">e<\/td>.*<td class="vowel-english-cue">o<\/td>/is,
  );
  assert.match(html, /あさ.*いぬ.*うみ.*えき.*おと/is);
  assert.match(
    html,
    /<td class="vowel-translation">morning<\/td>.*<td class="vowel-translation">dog<\/td>.*<td class="vowel-translation">sea<\/td>.*<td class="vowel-translation">station<\/td>.*<td class="vowel-translation">sound<\/td>/is,
  );
  assert.doesNotMatch(html, /father|machine|relaxed oo|pure oh/i);
  assert.match(html, /One symbol, one steady sound/i);
  assert.match(html, /Length matters/i);
  assert.doesNotMatch(html, /role="tablist"|role="tab"|aria-selected/i);
  assert.doesNotMatch(html, /Pronunciation audio is not available yet/i);
  assert.doesNotMatch(html, /Cold check/i);
  assert.equal((html.match(/aria-label="Play isolated vowel [あいうえお]"/gi) ?? []).length, 5);
  assert.equal((html.match(/aria-label="Play example word (?:あさ|いぬ|うみ|えき|おと)"/gi) ?? []).length, 5);
  assert.equal((html.match(/data-icon="speaker"/gi) ?? []).length, 0);
  assert.match(html, /あ/);
  assert.doesNotMatch(html, /Open your mouth naturally/i);
  assert.doesNotMatch(html, /Reveal|Continue|I said it|Practice again/i);
  assert.doesNotMatch(html, /Sound to writing|Writing to sound|Say it aloud/i);
  assert.doesNotMatch(html, /synthetic.*not.*human.reviewed/i);
  assert.doesNotMatch(html, /score|streak|progress meter/i);
});

test("server-renders an honest Mora timing preview", async () => {
  const response = await request("/stations/mora-timing");
  assert.equal(response.status, 200);
  assert.match(response.headers.get("content-type") ?? "", /^text\/html\b/i);

  const html = await response.text();
  assert.match(html, /Mora timing/i);
  assert.match(html, /aria-label="Return to the Ling network map"/i);
  assert.match(html, /href="\/"/i);
  assert.match(html, /aria-label="Station navigation"/i);
  assert.doesNotMatch(html, /aria-current="page"/i);
  assert.doesNotMatch(html, /href="\/stations\/vowels"/i);
  assert.match(html, /aria-label="Return to network map from Mora timing"/i);
  assert.equal((html.match(/href="\/\?focus=mora-timing"/gi) ?? []).length, 1);
  assert.match(html, /data-position="mora-timing"/i);
  assert.match(html, /data-terminal="true"/i);
  assert.match(html, /class="station-map-sound"/i);
  assert.match(html, /aria-label="Lines"/i);
  assert.match(html, /data-line="sound"[^>]*>Sound</i);
  assert.doesNotMatch(html, /data-line="script"[^>]*>Script</i);
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
