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
  assert.match(html, /data-line="travel"[^>]*>Travel</i);
  assert.match(html, /data-line="sound"[^>]*>Speech</i);
  assert.doesNotMatch(html, /data-line="writing"[^>]*>Kana</i);
  assert.match(html, /data-network-view="desktop"/i);
  assert.match(html, /class="network-desktop-viewport"[^>]*tabindex="0"/i);
  assert.doesNotMatch(html, /class="network-map network-map-desktop"[^>]*tabindex=/i);
  assert.match(html, /data-network-view="mobile"/i);
  assert.match(html, /aria-label="Japanese, Travel, and Speech network"/i);
  assert.match(html, /data-tooltip="Speech line"/i);
  assert.doesNotMatch(html, /data-tooltip="Kana line"/i);
  assert.doesNotMatch(html, /<title>(?:Speech|Kana) line<\/title>/i);
  assert.doesNotMatch(html, /data-station="mora-timing"/i);
  assert.doesNotMatch(html, /data-station="pitch-accent"/i);
  assert.doesNotMatch(html, /data-station="katakana"/i);
  assert.doesNotMatch(html, /data-station="kana-extensions"/i);
  assert.doesNotMatch(html, /data-station="sound-marks"/i);
  assert.doesNotMatch(html, /data-station="combined-sounds"/i);
  assert.doesNotMatch(html, /data-station="hiragana"/i);
  for (const station of [
    "japanese",
    "japan",
    "greetings",
    "navigation",
    "food",
    "shopping",
  ]) {
    assert.match(html, new RegExp(`data-station="${station}"`, "i"));
    assert.match(html, new RegExp(`href="/stations/${station}"`, "i"));
  }
  assert.match(html, /data-station="japanese"[^>]*data-station-kind="interchange"/i);
  assert.match(html, /data-station="kana"/i);
  assert.doesNotMatch(html, /data-station="vowels"/i);
  assert.match(html, /data-station="kana"[^>]*data-station-kind="single-line"/i);
  assert.doesNotMatch(html, /data-station="mora-timing"[^>]*data-station-kind="single-line"/i);
  assert.doesNotMatch(html, /href="\/stations\/mora-timing"/i);
  assert.doesNotMatch(html, /href="\/stations\/pitch-accent"/i);
  assert.doesNotMatch(html, /href="\/stations\/hiragana"/i);
  assert.doesNotMatch(html, /href="\/stations\/kana-extensions"/i);
  assert.doesNotMatch(html, /href="\/stations\/sound-marks"/i);
  assert.doesNotMatch(html, /href="\/stations\/combined-sounds"/i);
  assert.match(html, /href="\/stations\/kana"/i);
  assert.doesNotMatch(html, /aria-disabled="true"|data-available=/i);
  assert.doesNotMatch(html, /Learn Hiragana to activate Mora timing/i);
  assert.match(html, /href="\/welcome"/i);
  assert.match(html, /aria-label="About Ling"/i);
  assert.match(html, /class="network-help-link"/i);
  assert.match(html, /title="About Ling"/i);
  assert.doesNotMatch(html, /network-welcome-entry|A quick guide to the network, practice, and progress/i);
  assert.match(html, /Japanese opens the network and begins the Travel and Speech lines/i);
  assert.match(html, /Vowels follows Japanese on the Speech line/i);
  assert.doesNotMatch(html, /After Vowels/i);
  assert.match(html, /alt="Ling"/i);
  assert.doesNotMatch(html, /aria-label="Ready"/i);
  assert.doesNotMatch(html, /Your site is taking shape|Codex is working|react-loading-skeleton/i);
});

test("server-renders the reusable Welcome to Ling guide outside the station network", async () => {
  const response = await request("/welcome");
  assert.equal(response.status, 200);
  assert.equal(response.headers.get("cache-control"), "private, no-store");

  const html = await response.text();
  assert.match(html, /<h1 id="welcome-title">Welcome to Ling<\/h1>/i);
  assert.match(html, /Ling is a calm, practical place to build Japanese through sounds, words, and useful situations\./i);
  assert.match(html, /Inspired by a transit system, Ling starts with the stations available to you\./i);
  assert.match(html, /<h2 id="welcome-cues-title">How Ling works<\/h2>/i);
  assert.match(html, /<strong>Network<\/strong>/i);
  assert.match(html, /<strong>Stations<\/strong>/i);
  assert.match(html, /<strong>Progress<\/strong>/i);
  assert.match(html, /<strong>Flashcards &amp; checks<\/strong>/i);
  assert.match(html, /data-position="japanese"/i);
  assert.match(html, /class="welcome-cue-station"/i);
  assert.match(html, /class="hiragana-test-trigger welcome-cue-progress"/i);
  assert.match(html, /class="hiragana-test-card welcome-cue-flashcard"/i);
  assert.match(html, /aria-label="Dismiss the Welcome to Ling guide and return to the map"/i);
  assert.match(html, /href="\/"/i);
  assert.doesNotMatch(html, /station-membership|data-station=|station-options/i);
});

test("server-renders the base network before private availability loads", async () => {
  const response = await request("/?focus=mora-timing");
  assert.equal(response.status, 200);

  const html = await response.text();
  assert.match(html, /data-mobile-focus="japanese"/i);
  assert.doesNotMatch(html, /network-mobile-track-mora/i);

  const katakanaResponse = await request("/?focus=katakana");
  assert.equal(katakanaResponse.status, 200);
  const katakanaHtml = await katakanaResponse.text();
  assert.match(katakanaHtml, /data-mobile-focus="japanese"/i);
  assert.doesNotMatch(katakanaHtml, /data-station="katakana"/i);

  const hiraganaResponse = await request("/?focus=hiragana");
  assert.equal(hiraganaResponse.status, 200);
  const hiraganaHtml = await hiraganaResponse.text();
  assert.match(hiraganaHtml, /data-mobile-station-focus="japanese"/i);
  assert.match(hiraganaHtml, /network-mobile-track-japanese/i);

  const marksResponse = await request("/?focus=sound-marks");
  assert.equal(marksResponse.status, 200);
  const marksHtml = await marksResponse.text();
  assert.match(marksHtml, /data-mobile-station-focus="japanese"/i);
  assert.doesNotMatch(marksHtml, /data-station="sound-marks"/i);

  const combinedResponse = await request("/?focus=combined-sounds");
  assert.equal(combinedResponse.status, 200);
  const combinedHtml = await combinedResponse.text();
  assert.match(combinedHtml, /data-mobile-station-focus="japanese"/i);
  assert.doesNotMatch(combinedHtml, /data-station="combined-sounds"/i);

  const pitchResponse = await request("/?focus=pitch-accent");
  assert.equal(pitchResponse.status, 200);
  const pitchHtml = await pitchResponse.text();
  assert.match(pitchHtml, /data-mobile-focus="japanese"/i);
  assert.doesNotMatch(pitchHtml, /data-station="pitch-accent"/i);
});

test("the retired Vowels route leads to Kana", async () => {
  const response = await request("/stations/vowels");
  assert.ok([307, 308].includes(response.status));
  assert.match(response.headers.get("location") ?? "", /\/stations\/kana$/i);
});

test("the six Travel stations are always available without progression", async () => {
  for (const station of [
    "japanese",
    "japan",
    "greetings",
    "navigation",
    "food",
    "shopping",
  ]) {
    const response = await request(`/stations/${station}`);
    assert.equal(response.status, 200);
    assert.equal(response.headers.get("cache-control"), "private, no-store");
    const html = await response.text();
    assert.match(html, new RegExp(`<h1>${station === "japanese" ? "Japanese" : station[0].toUpperCase() + station.slice(1)}</h1>`, "i"));
    assert.match(html, /station-membership station-membership-travel/);
    if (station === "japanese" || station === "japan") {
      if (station === "japanese") {
        assert.doesNotMatch(html, /travel-reference/);
        assert.match(html, /station-page station-page-travel station-page-japanese/);
        assert.doesNotMatch(html, /Welcome to Ling|What you’ll see|How Ling works/);
        assert.match(html, /<section(?=[^>]*aria-label="Introduction to Japanese")(?=[^>]*class="japanese-orientation")[^>]*>/);
        assert.match(html, /Japanese is the language spoken by most people in Japan and by communities around the world\. It has its own sounds, grammar, and ways of expressing politeness, and it is written with hiragana, katakana, and kanji\./);
        assert.match(html, /<dl class="japanese-paths-list">/);
        for (const [script, description, example] of [
          ["hiragana", "the phonetic script used for grammar and many Japanese words.", "ありがとう"],
          ["katakana", "the phonetic script most often used for borrowed words and names.", "ホテル"],
          ["kanji", "characters that carry meaning.", "日本"],
        ]) {
          assert.match(html, new RegExp(`<dt>${script}</dt>`));
          assert.match(
            html,
            new RegExp(
              `<dd>${description.replaceAll(".", "\\.")}<!-- --> <span class="japanese-script-example" lang="ja">${example}</span></dd>`,
            ),
          );
        }
        assert.match(html, /Rōmaji uses the Roman alphabet to represent Japanese sounds\. It is useful in some contexts, while hiragana, katakana, and kanji are the main writing systems used in Japanese\./);
        assert.doesNotMatch(html, /<dt>Rōmaji<\/dt>/i);
        assert.match(html, /Visiting Japan\? Start with/);
        assert.match(html, /<a href="\/stations\/greetings">Greetings<\/a>/);
        assert.match(html, /on the Travel line for useful introductory phrases\./);
        assert.doesNotMatch(html, /As you continue, you’ll encounter:|Sounds, listening, and spoken Japanese|Hiragana, katakana, and written Japanese/);
        assert.doesNotMatch(html, /Sound, writing, and context|Listen for a steady rhythm|日本語のクラス|ありがとうございます/i);
      } else {
        assert.match(html, /aria-label="Introduction to Japan"/);
        assert.match(
          html,
          /Japan is a mountainous island country where dense, energetic cities sit close to quiet neighborhoods, farming communities, forests, and coastlines\.[\s\S]*Japan is not culturally uniform\. Each region has its own food, dialect, climate, customs, and pace\.[\s\S]*becoming richer the more closely you observe, listen, and communicate\./,
        );
        assert.doesNotMatch(html, /Japan is varied\./);
        assert.match(
          html,
          /<div class="japan-orientation-lead"><p>Japan is a mountainous island country[\s\S]*<\/p><p>Daily life often feels organized and considerate:[\s\S]*<\/p><p>Japan is not culturally uniform\. Each region has its own food,[\s\S]*<\/p><\/div>/,
        );
        assert.doesNotMatch(html, /culturally uniform—each region/);
        assert.match(html, /<h2 id="japan-learning-title">Start small<\/h2>/);
        assert.match(
          html,
          /You do not need to learn everything before a first trip\. Start with these three expressions and tap each one to hear how it sounds\./,
        );
        assert.doesNotMatch(html, /Japanese that helps|What to learn/);
        assert.doesNotMatch(
          html,
          /Begin politely|Ask when needed|Listen for what you know|When you get stuck|Read a little at a time/,
        );
        assert.match(html, /class="travel-reference"/);
        for (const [japanese, meaning, pronunciation] of [
          ["すみません", "Excuse me / I’m sorry", "soo mee mah seh nn"],
          ["ありがとうございます", "Thank you", "ah ree gah toh oo goh zah ee mah s"],
          ["お願いします", "Please", "oh neh gah ee shee mah s"],
        ]) {
          assert.match(
            html,
            new RegExp(`aria-label="${japanese}: ${meaning}\\. Pronunciation: ${pronunciation}\\. Play audio"`),
          );
          assert.match(html, new RegExp(`aria-label="${pronunciation}"`));
        }
        assert.match(html, /data-pronunciation="true"/);
        assert.doesNotMatch(
          html,
          /The Travel line is a small, always-available reference|You will meet kanji, kana, and romaji/,
        );
      }
    } else {
      assert.match(html, /travel-reference/);
    }
    assert.doesNotMatch(html, /station-options|data-(?:score|streak)=|class="[^"]*(?:review|score|streak)[^"]*"/i);
  }
});

test("redirects Mora timing until Yōon is complete", async () => {
  const response = await request("/stations/mora-timing");
  assert.ok([307, 308].includes(response.status));
  assert.match(response.headers.get("location") ?? "", /\/\?focus=mora-timing$/i);
});

test("redirects Pitch Accent until Mora Timing is complete", async () => {
  const response = await request("/stations/pitch-accent");
  assert.ok([307, 308].includes(response.status));
  assert.match(response.headers.get("location") ?? "", /\/\?focus=pitch-accent$/i);
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

  for (const station of ["sound-marks", "combined-sounds", "pitch-accent"]) {
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

  for (const station of ["kana", "mora-timing", "pitch-accent"]) {
    const bulkStationKnowledgeUpdate = await request(
      `/api/stations/${station}/knowledge`,
      {
        body: JSON.stringify({ known: true }),
        headers: { "Content-Type": "application/json" },
        method: "PATCH",
      },
    );
    assert.equal(bulkStationKnowledgeUpdate.status, 401);
    assert.equal(
      bulkStationKnowledgeUpdate.headers.get("cache-control"),
      "private, no-store",
    );
    assert.deepEqual(
      await bulkStationKnowledgeUpdate.json(),
      { error: "unauthorized" },
    );
  }

  const availability = await request("/api/stations/availability");
  assert.equal(availability.status, 401);
  assert.equal(availability.headers.get("cache-control"), "private, no-store");
  assert.deepEqual(await availability.json(), { error: "unauthorized" });
});
