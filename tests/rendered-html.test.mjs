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

function escapeRegExp(value) {
  return value.replace(/[.*+?^${}()|[\]\\]/g, "\\$&");
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
  assert.match(html, /data-brand="ling-wordmark"/i);
  assert.doesNotMatch(html, /<img[^>]+ling-wordmark\.svg/i);
  assert.match(html, /<p class="loading-kicker">Loading<\/p>/i);
  assert.doesNotMatch(html, /<p class="loading-title">Ling<\/p>/i);
  assert.doesNotMatch(html, /data-ling-ready=/i);
  assert.match(html, /data-line="travel"[^>]*>Japan</i);
  assert.match(html, /data-line="sound"[^>]*>Speech</i);
  assert.doesNotMatch(html, /data-line="writing"[^>]*>Kana</i);
  assert.match(html, /data-network-view="desktop"/i);
  assert.match(html, /class="network-desktop-viewport"[^>]*tabindex="0"/i);
  assert.doesNotMatch(html, /class="network-map network-map-desktop"[^>]*tabindex=/i);
  assert.match(html, /data-network-view="mobile"/i);
  assert.match(html, /aria-label="Japanese, Japan, and Speech network"/i);
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
    "visit",
    "romaji",
    "introductions",
    "navigation",
    "food",
    "shopping",
    "help",
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
  assert.match(html, /Japanese opens the network and begins the Japan and Speech lines/i);
  assert.match(html, /Vowels follows Japanese on the Speech line/i);
  assert.doesNotMatch(html, /After Vowels/i);
  assert.match(html, /aria-label="Ling"[^>]*role="img"/i);
  assert.doesNotMatch(html, /aria-label="Ready"/i);
  assert.doesNotMatch(html, /Your site is taking shape|Codex is working|react-loading-skeleton/i);
});

test("station documents do not render the map boot overlay", async () => {
  const response = await request("/stations/visit");
  assert.equal(response.status, 200);

  const html = await response.text();
  assert.doesNotMatch(html, /class="loading-shell loading-shell-overlay loading-shell-boot"/i);
  assert.match(html, /<h1>Visit<\/h1>/);
});

test("the retired Japan station route leads to Visit", async () => {
  const response = await request("/stations/japan");
  assert.ok([307, 308].includes(response.status));
  assert.match(response.headers.get("location") ?? "", /\/stations\/visit$/i);
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

test("the eight Japan line stations are always available without progression", async () => {
  for (const station of [
    "japanese",
    "visit",
    "romaji",
    "introductions",
    "navigation",
    "food",
    "shopping",
    "help",
  ]) {
    const response = await request(`/stations/${station}`);
    assert.equal(response.status, 200);
    assert.equal(response.headers.get("cache-control"), "private, no-store");
    const html = await response.text();
    const title = station === "japanese"
      ? "Japanese"
      : station === "romaji"
        ? "Rōmaji"
        : station[0].toUpperCase() + station.slice(1);
    assert.match(html, new RegExp(`<h1>${title}</h1>`, "i"));
    assert.match(html, /station-membership station-membership-travel/);
    assert.match(html, /station-membership station-membership-travel">Japan<\/span>/);
    if (station === "japanese" || station === "visit") {
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
        assert.match(html, /<a href="\/stations\/romaji">Rōmaji<\/a>/);
        assert.match(html, /on the Japan line, then use it to read the phrases that follow\./);
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
        for (const [japanese, meaning, soundCue] of [
          ["すみません", "Excuse me / I’m sorry", "soo mee mah seh nn"],
          ["ありがとうございます", "Thank you", "ah ree gah toh oo goh zah ee mah s"],
          ["お願いします", "Please", "oh neh gah ee shee mah s"],
        ]) {
          const label = `${japanese}: ${meaning}${/[.!?]$/.test(meaning) ? "" : "."} Pronunciation: ${soundCue}. Play audio`;
          assert.match(
            html,
            new RegExp(`aria-label="${escapeRegExp(label)}"`),
          );
          assert.match(html, new RegExp(`>${escapeRegExp(soundCue)}<`));
        }
        assert.match(html, /data-sound-cue="true"/);
        assert.doesNotMatch(html, /data-pronunciation="true"/);
        assert.doesNotMatch(
          html,
          /The Japan line is a small, always-available reference|You will meet kanji, kana, and romaji/,
        );
      }
    } else if (station !== "romaji") {
      assert.match(html, /travel-reference/);
    }
    if (station === "romaji") {
      assert.match(html, /station-page station-page-travel station-page-romaji/);
      assert.match(html, /aria-label="The 46 basic Rōmaji readings"/);
      assert.match(html, /aria-label="The 33 combined Rōmaji readings"/);
      assert.match(html, /class="hiragana-table romaji-chart"/);
      for (const sound of ["ah", "ee", "oo", "eh", "oh"]) {
        assert.match(html, new RegExp(`>${sound}<`));
      }
      assert.match(html, /Rōmaji writes Japanese sounds with the Roman alphabet\./);
      assert.doesNotMatch(
        html,
        /The chart follows|shows only the Rōmaji|Tap one to say|reveal and hear/,
      );
      assert.match(html, /aria-label="Test Rōmaji\. 79 remaining\."/);
      assert.match(html, /aria-label="Study shi"/);
      assert.match(html, /aria-label="Study kya"/);
      assert.match(html, /aria-label="Study sho"/);
      assert.match(html, /aria-label="Study pyo"/);
      assert.doesNotMatch(html, /class="romaji-chart-kana"/);
      for (const romaji of [
        "shi",
        "chi",
        "tsu",
        "fu",
        "kya",
        "shu",
        "cho",
        "pyo",
        "kitte",
        "zasshi",
        "Tōkyō",
        "Toukyou",
        "tan'i",
        "kin'en",
        "kouta",
        "ko'uta",
        "wa",
        "e",
        "o",
      ]) {
        const renderedRomaji = romaji.replaceAll("'", "&#x27;");
        assert.match(html, new RegExp(`>${escapeRegExp(renderedRomaji)}<`));
      }
      assert.match(html, /Double consonants take an extra beat/);
      assert.match(html, /Pause before tt; hold the ss sound slightly longer\./);
      assert.match(html, /A macron is the line over a vowel/);
      assert.match(html, /It marks a long vowel\. Tōkyō and Toukyou are pronounced the same\./);
      assert.match(html, /An apostrophe separates n from a vowel or y/);
      assert.match(html, /It prevents the n from joining the sound that follows\./);
      assert.match(html, /An apostrophe can keep vowels separate/);
      assert.match(html, /Kouta can read as a long vowel; ko'uta keeps o and u separate\./);
      assert.match(html, /Particles use wa, e, and o/);
      assert.match(html, /These three are written the way they are pronounced\./);
      assert.doesNotMatch(html, /class="romaji-rule-kana"|>きって<|>とうきょう</);
      assert.doesNotMatch(html, /·/);
    }
    if (station === "introductions") {
      assert.match(
        html,
        /station-page station-page-travel station-page-introductions/,
      );
      assert.match(html, /data-pronunciation="true"/);
      assert.match(html, /aria-label="Test Introductions\. 8 cards\."/);
      assert.doesNotMatch(html, /station-intro travel-intro/);
      assert.doesNotMatch(
        html,
        /Chris introduces himself|Tap each line|hear the (?:conversation|exchange)/,
      );
      for (const [japanese, meaning, romaji] of [
        ["はじめまして、クリスです", "Nice to meet you. I’m Chris.", "Hajimemashite, Kurisu desu."],
        ["よろしくお願いします", "It’s a pleasure to meet you.", "Yoroshiku onegaishimasu."],
        ["ご出身は？", "Where are you from?", "Goshusshin wa?"],
        ["アメリカから来ました", "I’m from the United States.", "Amerika kara kimashita."],
        ["日本語、できますか？", "Do you speak Japanese?", "Nihongo, dekimasu ka?"],
        ["はい、少しできます", "Yes, a little.", "Hai, sukoshi dekimasu."],
        ["英語、できますか？", "Do you speak English?", "Eigo, dekimasu ka?"],
        ["はい、できます", "Yes, I do.", "Hai, dekimasu."],
      ]) {
        const label = `${japanese}: ${meaning}${/[.!?]$/.test(meaning) ? "" : "."} Rōmaji: ${romaji}${/[.!?]$/.test(romaji) ? "" : "."} Play audio`;
        assert.match(
          html,
          new RegExp(`aria-label="${escapeRegExp(label)}"`),
        );
      }
      assert.doesNotMatch(html, /goh shoosh-shee|hah jee meh|Pronunciation:/);
      assert.doesNotMatch(html, /data-sound-cue="true"/);
      assert.doesNotMatch(html, /travel-reference-speaker|data-speaker=/);
      assert.doesNotMatch(
        html,
        /どちらからですか|おはようございます|こんにちは|こんばんは|すみません|ありがとうございます/,
      );
    }
    if (station === "navigation") {
      assert.match(
        html,
        /station-page station-page-travel station-page-navigation/,
      );
      assert.match(html, /aria-label="Test Navigation\. 6 cards\."/);
      assert.match(html, /トイレはどこですか？/);
      assert.match(html, /この電車で合っていますか？/);
      assert.match(html, /どこで乗り換えますか？/);
      assert.match(html, /何番出口ですか？/);
      assert.doesNotMatch(
        html,
        /駅はどこですか|今、どこですか|駅まで、どうやって行きますか|左に曲がってください|右に曲がってください|まっすぐ行ってください/,
      );
      assert.doesNotMatch(html, /station-intro travel-intro/);
    }
    if (station === "food") {
      assert.match(
        html,
        /station-page station-page-travel station-page-food/,
      );
      assert.match(html, /aria-label="Test Food\. 8 cards\."/);
      assert.match(html, /二人です/);
      assert.match(html, /予約しています/);
      assert.match(html, /お水をお願いします/);
      assert.match(html, /卵は入っていますか？/);
      assert.match(html, /ごちそうさまでした/);
      assert.doesNotMatch(html, /水、お願いします|これは何ですか？|肉は入っていますか？/);
      assert.doesNotMatch(html, /station-intro travel-intro/);
    }
    if (station === "shopping") {
      assert.match(
        html,
        /station-page station-page-travel station-page-shopping/,
      );
      assert.match(html, /aria-label="Test Shopping\. 8 cards\."/);
      assert.match(html, /ほかのサイズ、ありますか？/);
      assert.match(html, /免税できますか？/);
      assert.match(html, /袋をお願いします/);
      assert.doesNotMatch(html, /もうちょっと大きいの、ありますか？/);
      assert.doesNotMatch(html, /station-intro travel-intro/);
    }
    if (station === "help") {
      assert.match(
        html,
        /station-page station-page-travel station-page-help/,
      );
      assert.match(html, /aria-label="Test Help\. 8 cards\."/);
      assert.match(html, /助けてください/);
      assert.match(html, /救急車を呼んでください/);
      assert.match(html, /警察を呼んでください/);
      assert.match(html, /英語を話せる人はいますか？/);
      assert.doesNotMatch(html, /station-intro travel-intro/);
    }
    if (station === "romaji") {
      assert.doesNotMatch(html, /data-(?:score|streak)=|class="[^"]*(?:score|streak)[^"]*"/i);
    } else {
      assert.doesNotMatch(html, /station-options|data-(?:score|streak)=|class="[^"]*(?:review|score|streak)[^"]*"/i);
    }
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

  const romajiKnowledge = await request("/api/stations/romaji/knowledge");
  assert.equal(romajiKnowledge.status, 401);
  assert.equal(romajiKnowledge.headers.get("cache-control"), "private, no-store");
  assert.deepEqual(await romajiKnowledge.json(), { error: "unauthorized" });

  const romajiKnowledgeUpdate = await request(
    "/api/stations/romaji/knowledge",
    {
      body: JSON.stringify({ kana: "あ", known: true }),
      headers: { "Content-Type": "application/json" },
      method: "PUT",
    },
  );
  assert.equal(romajiKnowledgeUpdate.status, 401);
  assert.equal(
    romajiKnowledgeUpdate.headers.get("cache-control"),
    "private, no-store",
  );
  assert.deepEqual(await romajiKnowledgeUpdate.json(), { error: "unauthorized" });

  for (const station of ["kana", "romaji", "mora-timing", "pitch-accent"]) {
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
