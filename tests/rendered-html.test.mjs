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
  assert.doesNotMatch(html, /data-line="script"[^>]*>Script</i);
  assert.match(html, /data-network-view="desktop"/i);
  assert.match(html, /class="network-desktop-viewport"[^>]*tabindex="0"/i);
  assert.doesNotMatch(html, /class="network-map network-map-desktop"[^>]*tabindex=/i);
  assert.match(html, /data-network-view="mobile"/i);
  assert.match(html, /aria-label="Sound network"/i);
  assert.doesNotMatch(html, /data-tooltip="Sound line"/i);
  assert.doesNotMatch(html, /data-tooltip="Script line"/i);
  assert.doesNotMatch(html, /<title>(?:Sound|Script) line<\/title>/i);
  assert.doesNotMatch(html, /data-station="mora-timing"/i);
  assert.match(html, /data-station="hiragana"/i);
  assert.doesNotMatch(html, /data-station="vowels"/i);
  assert.match(html, /data-station="hiragana"[^>]*data-station-kind="single-line"/i);
  assert.doesNotMatch(html, /data-station="mora-timing"[^>]*data-station-kind="single-line"/i);
  assert.doesNotMatch(html, /href="\/stations\/mora-timing"/i);
  assert.match(html, /href="\/stations\/hiragana"/i);
  assert.doesNotMatch(html, /aria-disabled="true"|data-available=/i);
  assert.doesNotMatch(html, /Learn Hiragana to activate Mora timing/i);
  assert.match(html, /Hiragana is the first explored station on the Sound line/i);
  assert.doesNotMatch(html, /After Hiragana/i);
  assert.match(html, /alt="Ling"/i);
  assert.doesNotMatch(html, /aria-label="Ready"/i);
  assert.doesNotMatch(html, /Your site is taking shape|Codex is working|react-loading-skeleton/i);
});

test("server-renders only station locations the learner has revealed", async () => {
  const response = await request("/?focus=mora-timing");
  assert.equal(response.status, 200);

  const html = await response.text();
  assert.match(html, /data-mobile-focus="hiragana"/i);
  assert.doesNotMatch(html, /network-mobile-track-mora/i);

  const hiraganaResponse = await request("/?focus=hiragana");
  assert.equal(hiraganaResponse.status, 200);
  const hiraganaHtml = await hiraganaResponse.text();
  assert.match(hiraganaHtml, /data-mobile-station-focus="hiragana"/i);
  assert.match(hiraganaHtml, /network-mobile-track-hiragana/i);
});

test("the retired Vowels route leads to Hiragana", async () => {
  const response = await request("/stations/vowels");
  assert.ok([307, 308].includes(response.status));
  assert.match(response.headers.get("location") ?? "", /\/stations\/hiragana$/i);
});

test("redirects Mora timing until Hiragana has been introduced", async () => {
  const response = await request("/stations/mora-timing");
  assert.ok([307, 308].includes(response.status));
  assert.match(response.headers.get("location") ?? "", /\/\?focus=mora-timing$/i);
});

test("server-renders the basic Hiragana reference", async () => {
  const response = await request("/stations/hiragana");
  assert.equal(response.status, 200);
  assert.match(response.headers.get("content-type") ?? "", /^text\/html\b/i);

  const html = await response.text();
  assert.match(html, /Hiragana/i);
  assert.match(html, /aria-label="Return to the Ling network map"/i);
  assert.match(html, /aria-label="Station navigation"/i);
  assert.match(html, /aria-label="Return to network map from Hiragana"/i);
  assert.equal((html.match(/href="\/\?focus=hiragana"/gi) ?? []).length, 1);
  assert.match(html, /data-position="hiragana"/i);
  assert.doesNotMatch(html, /data-terminal="true"/i);
  assert.match(html, /class="station-map-sound"/i);
  assert.doesNotMatch(html, /class="station-map-script"/i);
  assert.match(html, /data-line="sound"[^>]*>Sound</i);
  assert.doesNotMatch(html, /data-line="script"[^>]*>Script</i);
  assert.match(html, /aria-label="The 46 basic hiragana"/i);
  assert.match(html, /aria-label="Column of sounds ending in あ"[^>]*>.*>あ<.*aria-label="Column of sounds ending in い"[^>]*>.*>い<.*aria-label="Column of sounds ending in う"[^>]*>.*>う<.*aria-label="Column of sounds ending in え"[^>]*>.*>え<.*aria-label="Column of sounds ending in お"[^>]*>.*>お</is);
  assert.doesNotMatch(html, /[あいうえお]段/);
  assert.equal((html.match(/class="hiragana-button"/gi) ?? []).length, 46);
  assert.match(html, /Hiragana is the basic sound-writing system of Japanese/i);
  assert.match(html, /Each character represents a spoken sound rather than a meaning/i);
  assert.match(html, /Learning them lets you sound out written Japanese/i);
  assert.match(html, /Play あ/i);
  assert.match(html, /Play ん/i);
  assert.match(html, /Hear them in words/i);
  assert.match(html, /The vowel row/i);
  assert.match(html, /The K row/i);
  assert.match(html, /The S row/i);
  assert.match(html, /The T row/i);
  assert.match(html, /The N row/i);
  assert.match(html, /The H row/i);
  assert.match(html, /The M row/i);
  assert.match(html, /The Y row/i);
  assert.match(html, /The R row/i);
  assert.match(html, /The W row and ん/i);
  assert.doesNotMatch(html, /The next five sounds/i);
  assert.match(html, /<th scope="col">English<\/th>/i);
  assert.doesNotMatch(html, /English cue|>car<|>key<|>coo<|>kept<|>coat</i);
  assert.match(html, />ah<.*>ee<.*>oo<.*>eh<.*>oh</is);
  assert.match(html, />kah<.*>kee<.*>koo<.*>keh<.*>koh</is);
  assert.equal((html.match(/class="kana-study-button kana-study-kana-button"/gi) ?? []).length, 46);
  assert.equal((html.match(/class="kana-study-button kana-study-example-button"/gi) ?? []).length, 46);
  assert.match(html, /あさ.*いぬ.*うみ.*えき.*おと/is);
  assert.match(html, /かさ.*きく.*くち.*けさ.*こえ/is);
  assert.match(html, /morning.*dog.*sea.*station.*sound/is);
  assert.match(html, /umbrella.*listen.*mouth.*this morning.*voice/is);
  assert.match(html, /fish.*salt.*sushi.*world.*outside/is);
  assert.match(html, /mountain.*snow.*night/is);
  assert.match(html, /crocodile.*this \(object\).*book/is);
  assert.doesNotMatch(html, />ka<|>ki<|>ku<|>ke<|>ko</i);
  assert.doesNotMatch(html, /Next on the Sound line|Continue to Mora timing/i);
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
});
