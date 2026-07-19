import assert from "node:assert/strict";
import test from "node:test";

async function request(pathname = "/", init = {}) {
  const workerUrl = new URL("../dist/server/index.js", import.meta.url);
  workerUrl.searchParams.set("test", `${process.pid}-${Date.now()}-${pathname}`);
  const { default: worker } = await import(workerUrl.href);

  return worker.fetch(
    new Request(`http://localhost${pathname}`, {
      ...init,
      headers: {
        accept: pathname.startsWith("/api/") ? "application/json" : "text/html",
        ...init.headers,
      },
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
  assert.doesNotMatch(html, /data-line="writing"[^>]*>Writing</i);
  assert.match(html, /data-network-view="desktop"/i);
  assert.match(html, /class="network-desktop-viewport"[^>]*tabindex="0"/i);
  assert.doesNotMatch(html, /class="network-map network-map-desktop"[^>]*tabindex=/i);
  assert.match(html, /data-network-view="mobile"/i);
  assert.match(html, /aria-label="Sound network"/i);
  assert.doesNotMatch(html, /data-tooltip="Sound line"/i);
  assert.doesNotMatch(html, /data-tooltip="Writing line"/i);
  assert.doesNotMatch(html, /<title>(?:Sound|Writing) line<\/title>/i);
  assert.doesNotMatch(html, /data-station="mora-timing"/i);
  assert.doesNotMatch(html, /data-station="katakana"/i);
  assert.doesNotMatch(html, /data-station="hiragana"/i);
  assert.match(html, /data-station="kana"/i);
  assert.doesNotMatch(html, /data-station="vowels"/i);
  assert.match(html, /data-station="kana"[^>]*data-station-kind="single-line"/i);
  assert.doesNotMatch(html, /data-station="mora-timing"[^>]*data-station-kind="single-line"/i);
  assert.doesNotMatch(html, /href="\/stations\/mora-timing"/i);
  assert.doesNotMatch(html, /href="\/stations\/hiragana"/i);
  assert.match(html, /href="\/stations\/kana"/i);
  assert.doesNotMatch(html, /aria-disabled="true"|data-available=/i);
  assert.doesNotMatch(html, /Learn Hiragana to activate Mora timing/i);
  assert.match(html, /Kana is the first station on the Sound line/i);
  assert.doesNotMatch(html, /After Kana/i);
  assert.match(html, /alt="Ling"/i);
  assert.doesNotMatch(html, /aria-label="Ready"/i);
  assert.doesNotMatch(html, /Your site is taking shape|Codex is working|react-loading-skeleton/i);
});

test("server-renders only station locations the learner has revealed", async () => {
  const response = await request("/?focus=mora-timing");
  assert.equal(response.status, 200);

  const html = await response.text();
  assert.match(html, /data-mobile-focus="kana"/i);
  assert.doesNotMatch(html, /network-mobile-track-mora/i);

  const katakanaResponse = await request("/?focus=katakana");
  assert.equal(katakanaResponse.status, 200);
  const katakanaHtml = await katakanaResponse.text();
  assert.match(katakanaHtml, /data-mobile-focus="kana"/i);
  assert.doesNotMatch(katakanaHtml, /data-station="katakana"/i);

  const hiraganaResponse = await request("/?focus=hiragana");
  assert.equal(hiraganaResponse.status, 200);
  const hiraganaHtml = await hiraganaResponse.text();
  assert.match(hiraganaHtml, /data-mobile-station-focus="kana"/i);
  assert.match(hiraganaHtml, /network-mobile-track-kana/i);
});

test("the retired Vowels route leads to Kana", async () => {
  const response = await request("/stations/vowels");
  assert.ok([307, 308].includes(response.status));
  assert.match(response.headers.get("location") ?? "", /\/stations\/kana$/i);
});

test("redirects Mora timing until Kana extensions have been introduced", async () => {
  const response = await request("/stations/mora-timing");
  assert.ok([307, 308].includes(response.status));
  assert.match(response.headers.get("location") ?? "", /\/\?focus=mora-timing$/i);
});

test("redirects Hiragana until Kana has been introduced", async () => {
  const response = await request("/stations/hiragana");
  assert.ok([307, 308].includes(response.status));
  assert.match(response.headers.get("location") ?? "", /\/\?focus=hiragana$/i);
});

test("redirects Katakana until Hiragana has been introduced", async () => {
  const response = await request("/stations/katakana");
  assert.ok([307, 308].includes(response.status));
  assert.match(response.headers.get("location") ?? "", /\/\?focus=katakana$/i);
});

test("server-renders the Kana orientation", async () => {
  const response = await request("/stations/kana");
  assert.equal(response.status, 200);
  assert.match(response.headers.get("content-type") ?? "", /^text\/html\b/i);

  const html = await response.text();
  assert.match(html, /<h1>Kana<\/h1>/i);
  assert.match(html, /aria-label="Return to the Ling network map"/i);
  assert.match(html, /aria-label="Station navigation"/i);
  assert.match(html, /aria-label="Return to network map from Kana"/i);
  assert.equal((html.match(/href="\/\?focus=kana"/gi) ?? []).length, 1);
  assert.match(html, /data-position="kana"/i);
  assert.match(html, /class="station-map-sound"/i);
  assert.match(html, /class="station-map-writing"/i);
  assert.match(html, /data-line="sound"[^>]*>Sound</i);
  assert.match(html, /data-line="writing"[^>]*>Writing</i);
  assert.match(html, /Kana is the collective name for Hiragana and Katakana/i);
  assert.match(html, /used to write how Japanese words sound/i);
  assert.match(html, /Both sets represent the same sounds with different shapes/i);
  assert.match(html, /Hiragana is used for everyday Japanese words and grammar/i);
  assert.match(html, /Katakana is used mainly for borrowed words, foreign names, emphasis, and sound effects/i);
  assert.doesNotMatch(html, /<dl|<dt|<dd/i);
  assert.match(html, /Start with the five vowel sounds.*Tap a Kana pair or example word to hear it/is);
  assert.match(html, /aria-label="The five Japanese vowels in Hiragana and Katakana"/i);
  assert.equal((html.match(/class="kana-study-button kana-study-kana-button"/gi) ?? []).length, 5);
  assert.equal((html.match(/class="kana-study-button kana-study-example-button"/gi) ?? []).length, 5);
  assert.match(html, /あ.*ア.*い.*イ.*う.*ウ.*え.*エ.*お.*オ/is);
  assert.match(html, />ah<.*>ee<.*>oo<.*>eh<.*>oh</is);
  assert.match(html, /あさ.*いぬ.*うみ.*えき.*おと/is);
  assert.match(html, /morning.*dog.*sea.*station.*sound/is);
  assert.match(html, /Kanji primarily carries meaning and can have multiple readings/i);
  assert.doesNotMatch(html, /romaji|score|streak|progress meter/i);
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

  const introduction = await request(
    "/api/stations/hiragana/introduction",
    { method: "POST" },
  );
  assert.equal(introduction.status, 401);
  assert.equal(introduction.headers.get("cache-control"), "private, no-store");
  assert.deepEqual(await introduction.json(), { error: "unauthorized" });

  const kanaIntroduction = await request(
    "/api/stations/kana/introduction",
    { method: "POST" },
  );
  assert.equal(kanaIntroduction.status, 401);
  assert.equal(kanaIntroduction.headers.get("cache-control"), "private, no-store");
  assert.deepEqual(await kanaIntroduction.json(), { error: "unauthorized" });

  const katakanaIntroduction = await request(
    "/api/stations/katakana/introduction",
    { method: "POST" },
  );
  assert.equal(katakanaIntroduction.status, 401);
  assert.equal(katakanaIntroduction.headers.get("cache-control"), "private, no-store");
  assert.deepEqual(await katakanaIntroduction.json(), { error: "unauthorized" });
});
