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
  assert.match(html, /class="loading-shell loading-shell-overlay loading-shell-boot"/i);
  assert.match(html, /class="loading-wordmark"/i);
  assert.match(html, /<p class="loading-kicker">Loading<\/p>/i);
  assert.doesNotMatch(html, /<p class="loading-title">Ling<\/p>/i);
  assert.doesNotMatch(html, /data-ling-ready=/i);
  assert.match(html, /data-line="sound"[^>]*>Speech</i);
  assert.doesNotMatch(html, /data-line="writing"[^>]*>Kana</i);
  assert.match(html, /data-network-view="desktop"/i);
  assert.match(html, /class="network-desktop-viewport"[^>]*tabindex="0"/i);
  assert.doesNotMatch(html, /class="network-map network-map-desktop"[^>]*tabindex=/i);
  assert.match(html, /data-network-view="mobile"/i);
  assert.match(html, /aria-label="Speech network"/i);
  assert.doesNotMatch(html, /data-tooltip="Speech line"/i);
  assert.doesNotMatch(html, /data-tooltip="Kana line"/i);
  assert.doesNotMatch(html, /<title>(?:Speech|Kana) line<\/title>/i);
  assert.doesNotMatch(html, /data-station="mora-timing"/i);
  assert.doesNotMatch(html, /data-station="katakana"/i);
  assert.doesNotMatch(html, /data-station="kana-extensions"/i);
  assert.doesNotMatch(html, /data-station="sound-marks"/i);
  assert.doesNotMatch(html, /data-station="combined-sounds"/i);
  assert.doesNotMatch(html, /data-station="hiragana"/i);
  assert.match(html, /data-station="kana"/i);
  assert.doesNotMatch(html, /data-station="vowels"/i);
  assert.match(html, /data-station="kana"[^>]*data-station-kind="single-line"/i);
  assert.doesNotMatch(html, /data-station="mora-timing"[^>]*data-station-kind="single-line"/i);
  assert.doesNotMatch(html, /href="\/stations\/mora-timing"/i);
  assert.doesNotMatch(html, /href="\/stations\/hiragana"/i);
  assert.doesNotMatch(html, /href="\/stations\/kana-extensions"/i);
  assert.doesNotMatch(html, /href="\/stations\/sound-marks"/i);
  assert.doesNotMatch(html, /href="\/stations\/combined-sounds"/i);
  assert.match(html, /href="\/stations\/kana"/i);
  assert.doesNotMatch(html, /aria-disabled="true"|data-available=/i);
  assert.doesNotMatch(html, /Learn Hiragana to activate Mora timing/i);
  assert.match(html, /Vowels is the first station on the Speech line/i);
  assert.doesNotMatch(html, /After Vowels/i);
  assert.match(html, /alt="Ling"/i);
  assert.doesNotMatch(html, /aria-label="Ready"/i);
  assert.doesNotMatch(html, /Your site is taking shape|Codex is working|react-loading-skeleton/i);
});

test("server-renders the base network before private availability loads", async () => {
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

  const marksResponse = await request("/?focus=sound-marks");
  assert.equal(marksResponse.status, 200);
  const marksHtml = await marksResponse.text();
  assert.match(marksHtml, /data-mobile-station-focus="kana"/i);
  assert.doesNotMatch(marksHtml, /data-station="sound-marks"/i);

  const combinedResponse = await request("/?focus=combined-sounds");
  assert.equal(combinedResponse.status, 200);
  const combinedHtml = await combinedResponse.text();
  assert.match(combinedHtml, /data-mobile-station-focus="kana"/i);
  assert.doesNotMatch(combinedHtml, /data-station="combined-sounds"/i);
});

test("the retired Vowels route leads to Kana", async () => {
  const response = await request("/stations/vowels");
  assert.ok([307, 308].includes(response.status));
  assert.match(response.headers.get("location") ?? "", /\/stations\/kana$/i);
});

test("redirects Mora timing until Yōon is complete", async () => {
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

test("redirects Dakuten & Handakuten until Katakana is complete", async () => {
  const response = await request("/stations/sound-marks");
  assert.ok([307, 308].includes(response.status));
  assert.match(response.headers.get("location") ?? "", /\/\?focus=sound-marks$/i);
});

test("redirects Yōon until Dakuten & Handakuten is complete", async () => {
  const response = await request("/stations/combined-sounds");
  assert.ok([307, 308].includes(response.status));
  assert.match(response.headers.get("location") ?? "", /\/\?focus=combined-sounds$/i);
});

test("the retired Kana extensions route leads to Dakuten & Handakuten", async () => {
  const response = await request("/stations/kana-extensions");
  assert.ok([307, 308].includes(response.status));
  assert.match(response.headers.get("location") ?? "", /\/stations\/sound-marks$/i);
});

test("server-renders the Vowels introduction", async () => {
  const response = await request("/stations/kana");
  assert.equal(response.status, 200);
  assert.match(response.headers.get("content-type") ?? "", /^text\/html\b/i);

  const html = await response.text();
  assert.match(html, /<h1>Vowels<\/h1>/i);
  assert.match(html, /aria-label="Return to the Ling network map"/i);
  assert.match(html, /aria-label="Station navigation"/i);
  assert.match(html, /aria-label="Return to network map from Vowels"/i);
  assert.equal((html.match(/href="\/\?focus=kana"/gi) ?? []).length, 1);
  assert.match(html, /data-position="kana"/i);
  assert.match(html, /class="station-map-sound"/i);
  assert.match(html, /class="station-map-writing"/i);
  assert.match(html, /data-line="sound"[^>]*>Speech</i);
  assert.match(html, /data-line="writing"[^>]*>Kana</i);
  assert.match(html, /Kana is the collective name for Hiragana and Katakana/i);
  assert.match(html, /used to write how Japanese words sound/i);
  assert.match(html, /Both sets represent the same sounds with different shapes/i);
  assert.match(html, /Hiragana is used for everyday Japanese words and grammar/i);
  assert.match(html, /Katakana is used mainly for borrowed words, foreign names, emphasis, and sound effects/i);
  assert.doesNotMatch(html, /<dl|<dt|<dd/i);
  assert.match(html, /Start with the five vowel sounds.*Tap any Kana to practice it/is);
  assert.doesNotMatch(html, /International Phonetic Alphabet|\bIPA\b/i);
  assert.match(html, /aria-label="The five Japanese vowels in Hiragana and Katakana"/i);
  assert.match(html, /class="hiragana-table kana-vowels-chart"/i);
  assert.equal((html.match(/class="hiragana-button"/gi) ?? []).length, 10);
  assert.match(html, /aria-label="Test All Vowels\. 10 remaining\."/i);
  assert.match(html, /あ.*い.*う.*え.*お.*ア.*イ.*ウ.*エ.*オ/is);
  assert.match(html, />ah<.*>ee<.*>oo<.*>eh<.*>oh</is);
  assert.match(html, /Same sound, two shapes.*Each pair above is pronounced the same way/is);
  assert.doesNotMatch(html, /kana-study-button|kana-study-example-button|kana-pair/i);
  assert.doesNotMatch(html, /Kanji is different|Kanji primarily carries meaning/i);
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

  const extensionsIntroduction = await request(
    "/api/stations/kana-extensions/introduction",
    { method: "POST" },
  );
  assert.equal(extensionsIntroduction.status, 401);
  assert.equal(extensionsIntroduction.headers.get("cache-control"), "private, no-store");
  assert.deepEqual(await extensionsIntroduction.json(), { error: "unauthorized" });

  const extensionsKnowledge = await request("/api/stations/kana-extensions/knowledge");
  assert.equal(extensionsKnowledge.status, 401);
  assert.equal(extensionsKnowledge.headers.get("cache-control"), "private, no-store");
  assert.deepEqual(await extensionsKnowledge.json(), { error: "unauthorized" });

  for (const station of ["sound-marks", "combined-sounds"]) {
    const introduction = await request(
      `/api/stations/${station}/introduction`,
      { method: "POST" },
    );
    assert.equal(introduction.status, 401);
    assert.equal(introduction.headers.get("cache-control"), "private, no-store");
    assert.deepEqual(await introduction.json(), { error: "unauthorized" });

    const stationKnowledge = await request(`/api/stations/${station}/knowledge`);
    assert.equal(stationKnowledge.status, 401);
    assert.equal(stationKnowledge.headers.get("cache-control"), "private, no-store");
    assert.deepEqual(await stationKnowledge.json(), { error: "unauthorized" });
  }

  const knowledge = await request("/api/stations/hiragana/knowledge");
  assert.equal(knowledge.status, 401);
  assert.equal(knowledge.headers.get("cache-control"), "private, no-store");
  assert.deepEqual(await knowledge.json(), { error: "unauthorized" });

  const knowledgeUpdate = await request(
    "/api/stations/hiragana/knowledge",
    {
      body: JSON.stringify({ kana: "あ", known: true }),
      headers: { "content-type": "application/json" },
      method: "PUT",
    },
  );
  assert.equal(knowledgeUpdate.status, 401);
  assert.equal(knowledgeUpdate.headers.get("cache-control"), "private, no-store");
  assert.deepEqual(await knowledgeUpdate.json(), { error: "unauthorized" });

  const bulkKnowledgeUpdate = await request(
    "/api/stations/hiragana/knowledge",
    {
      body: JSON.stringify({ known: true }),
      headers: { "Content-Type": "application/json" },
      method: "PATCH",
    },
  );
  assert.equal(bulkKnowledgeUpdate.status, 401);
  assert.equal(bulkKnowledgeUpdate.headers.get("cache-control"), "private, no-store");
  assert.deepEqual(await bulkKnowledgeUpdate.json(), { error: "unauthorized" });

  const availability = await request("/api/stations/availability");
  assert.equal(availability.status, 401);
  assert.equal(availability.headers.get("cache-control"), "private, no-store");
  assert.deepEqual(await availability.json(), { error: "unauthorized" });
});
