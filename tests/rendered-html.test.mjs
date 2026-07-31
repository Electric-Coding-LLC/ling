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
  for (const [station, line] of [
    ["Japan", "travel"],
    ["Sound", "sound"],
    ["Writing", "writing"],
    ["Vocabulary", "vocabulary"],
  ]) {
    assert.match(
      html,
      new RegExp(`aria-label="${station} station"[^>]*data-category-station="${line}"`, "i"),
    );
    assert.match(html, new RegExp(`>${station}<`, "i"));
  }
  assert.match(
    html,
    /<text[^>]*class="network-station-label network-foundation-title"[^>]*>Foundations<\/text>/i,
  );
  assert.doesNotMatch(html, /<text[^>]*class="network-line-label/i);
  assert.match(html, /data-network-view="desktop"/i);
  assert.match(html, /class="network-desktop-viewport"[^>]*tabindex="0"/i);
  assert.doesNotMatch(html, /class="network-map network-map-desktop"[^>]*tabindex=/i);
  assert.match(html, /data-network-view="mobile"/i);
  assert.match(html, /aria-label="Foundations learning network"/i);
  assert.match(html, /data-tooltip="Foundations"/i);
  assert.match(html, /data-tooltip="Japan"/i);
  assert.match(html, /data-tooltip="Sound"/i);
  assert.match(html, /data-tooltip="Writing"/i);
  assert.match(html, /data-tooltip="Vocabulary"/i);
  assert.doesNotMatch(html, /territory/i);
  assert.doesNotMatch(html, /<title>Foundations<\/title>/i);
  assert.doesNotMatch(html, /<title>(?:Speech|Script) line<\/title>/i);
  assert.doesNotMatch(html, /data-station="kana-extensions"/i);
  for (const station of [
    "japanese",
    "japan",
    "romaji",
    "introductions",
    "navigation",
    "food",
    "shopping",
    "help",
    "sound",
    "writing",
    "vocabulary",
    "kana",
    "vowels",
    "hiragana",
    "katakana",
    "sound-marks",
    "combined-sounds",
    "words",
    "mora-timing",
    "pitch-accent",
  ]) {
    assert.match(html, new RegExp(`data-station="${station}"`, "i"));
    assert.match(html, new RegExp(`href="/stations/${station}"`, "i"));
  }
  assert.match(html, /data-station="japanese"[^>]*data-station-kind="interchange"/i);
  assert.match(html, /data-station="romaji"[^>]*data-station-kind="single-line"/i);
  assert.match(html, /data-station="kana"/i);
  assert.match(html, /data-station="vowels"/i);
  assert.match(html, /data-station="kana"[^>]*data-station-kind="single-line"/i);
  assert.match(html, /data-station="vowels"[^>]*data-station-kind="single-line"/i);
  assert.doesNotMatch(html, /href="\/stations\/kana-extensions"/i);
  assert.doesNotMatch(html, /aria-disabled="true"|data-available=/i);
  assert.doesNotMatch(html, /Learn Hiragana to activate Mora timing/i);
  assert.match(html, /href="\/welcome"/i);
  assert.match(html, /aria-label="About Ling"/i);
  assert.match(html, /class="network-help-link"/i);
  assert.match(html, /title="About Ling"/i);
  assert.doesNotMatch(html, /network-welcome-entry|A quick guide to the network, practice, and progress/i);
  assert.match(html, /Scroll down the Foundations spine to move through Japan, Sound, Writing, and Vocabulary/i);
  assert.match(html, /Move right along a line to go deeper/i);
  assert.doesNotMatch(html, /data-station="(?:nouns|verbs|adjectives)"/i);
  assert.doesNotMatch(html, />KANJI<|>GRAMMAR<|>PHRASING</i);
  assert.doesNotMatch(html, /After Vowels/i);
  assert.match(html, /aria-label="Ling"[^>]*role="img"/i);
  assert.doesNotMatch(html, /aria-label="Ready"/i);
  assert.doesNotMatch(html, /Your site is taking shape|Codex is working|react-loading-skeleton/i);
});

test("the Sound, Writing, and Vocabulary category stations introduce their lines", async () => {
  const introductions = {
    sound: {
      lead: "Japanese pronunciation is built from a small set of clear vowels and a steady rhythm. Those regular beats are called morae, and they shape the timing of every word.",
      support: "Pitch moves within a word as well. Listening for where the voice rises and falls helps speech sound natural and can distinguish words that otherwise sound alike.",
      links: [
        ["/stations/vowels", "Vowels"],
        ["/stations/mora-timing", "Mora Timing"],
        ["/stations/pitch-accent", "Pitch Accent"],
      ],
      title: "Sound",
    },
    writing: {
      lead: "Japanese uses two Kana scripts to represent the same set of sounds. Hiragana carries most Japanese words and grammar; Katakana handles borrowed words, foreign names, emphasis, and sound effects.",
      support: "The basic charts are only the beginning. Dakuten and handakuten change consonants, while small や, ゆ, and よ combine with a preceding Kana to make Yōon sounds such as きゃ, きゅ, and きょ.",
      links: [
        ["/stations/kana", "Kana"],
        ["/stations/hiragana", "Hiragana"],
        ["/stations/katakana", "Katakana"],
        ["/stations/sound-marks", "Dakuten &amp; Handakuten"],
        ["/stations/combined-sounds", "Yōon"],
      ],
      title: "Writing",
    },
    vocabulary: {
      lead: "A useful word is more than a translation. You need to recognize its meaning, writing, and sound together.",
      support: "Ling keeps those parts on one reference surface: the English meaning, Japanese word, Rōmaji, and audio. The same words also appear in Mora Timing and Pitch Accent, so pronunciation stays connected to vocabulary.",
      links: [["/stations/words", "Words"]],
      title: "Vocabulary",
    },
  };

  for (const [station, introduction] of Object.entries(introductions)) {
    const response = await request(`/stations/${station}`);
    assert.equal(response.status, 200);
    const html = await response.text();

    assert.match(html, new RegExp(`<h1>${introduction.title}</h1>`));
    assert.match(
      html,
      new RegExp(`aria-label="Introduction to ${introduction.title}"`),
    );
    assert.match(html, new RegExp(escapeRegExp(introduction.lead)));
    assert.match(html, new RegExp(escapeRegExp(introduction.support)));
    assert.match(
      html,
      new RegExp(`data-line="${station}">${introduction.title}</span>`),
    );
    assert.match(html, /class="foundation-line-orientation"/);
    assert.match(html, /class="foundation-line-orientation-lead"/);
    assert.match(html, /class="foundation-line-learning"/);
    assert.match(html, /<h2 id="(?:sound|writing|vocabulary)-learning-title">Start small<\/h2>/);
    for (const [href, label] of introduction.links) {
      assert.match(
        html,
        new RegExp(`<a href="${escapeRegExp(href)}">${label}</a>`),
      );
    }
  }
});

test("station documents do not render the map boot overlay", async () => {
  const response = await request("/stations/japan");
  assert.equal(response.status, 200);

  const html = await response.text();
  assert.doesNotMatch(html, /class="loading-shell loading-shell-overlay loading-shell-boot"/i);
  assert.match(html, /<h1>Japan<\/h1>/);
});

test("the removed Visit station route is not addressable", async () => {
  const response = await request("/stations/visit");
  assert.equal(response.status, 404);
});

test("server-renders the reusable Welcome to Ling guide outside the station network", async () => {
  const response = await request("/welcome");
  assert.equal(response.status, 200);
  assert.equal(response.headers.get("cache-control"), "private, no-store");

  const html = await response.text();
  assert.match(html, /<h1 id="welcome-title">Welcome to Ling<\/h1>/i);
  assert.match(html, /Ling is a calm, practical place to build Japanese through sounds, words, and useful situations\./i);
  assert.match(html, /Inspired by a transit system, Ling shows the entire network from the start\./i);
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

test("server-renders the complete network without private availability", async () => {
  const response = await request("/?focus=mora-timing");
  assert.equal(response.status, 200);

  const html = await response.text();
  assert.match(html, /data-mobile-station-focus="japanese"/i);
  assert.match(html, /aria-label="Pan across the network or explore with the arrow keys"/i);
  assert.match(html, /data-station="hiragana"/i);
  assert.match(html, /data-station="words"/i);
  assert.doesNotMatch(html, /data-station="(?:nouns|verbs|adjectives)"/i);
  assert.match(html, /data-station="mora-timing"/i);
  assert.match(html, /data-station="pitch-accent"/i);
  assert.doesNotMatch(html, /\/api\/stations\/availability|Network unavailable/i);
});

test("the Foundations and Japan area stations are always available without progression", async () => {
  for (const station of [
    "japanese",
    "japan",
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
    if (station === "japanese" || station === "romaji") {
      assert.match(html, /aria-label="Network line"/);
      assert.match(html, /station-membership station-membership-foundation/);
      assert.match(html, /data-line="foundation">Foundations<\/span>/);
      assert.doesNotMatch(html, /station-membership station-membership-travel/);
      assert.doesNotMatch(html, />Connector<\/span>/);
    } else {
      assert.match(html, /station-membership station-membership-travel/);
      assert.match(html, /data-line="travel">Japan<\/span>/);
    }
    if (station === "japanese" || station === "japan") {
      if (station === "japanese") {
        assert.doesNotMatch(html, /travel-reference/);
        assert.match(html, /station-page station-page-travel station-page-japanese/);
        assert.doesNotMatch(html, /Welcome to Ling|What you’ll see|How Ling works/);
        assert.match(html, /<section(?=[^>]*aria-label="Introduction to Japanese")(?=[^>]*class="japanese-orientation")[^>]*>/);
        assert.match(html, /Japanese is the starting point of Ling(?:&apos;|&#x27;|')s Foundations network\./);
        assert.match(html, /<a href="\/stations\/romaji">Rōmaji<\/a>/);
        assert.match(html, /is an optional reading bridge on the spine\. Japan, Sound, Writing, and Vocabulary branch from Foundations\./);
        assert.match(html, /<div class="japanese-lines">/);
        for (const [line, description] of [
          ["Japan", "Practical Japanese for introductions, getting around, food, shopping, and asking for help."],
          ["Sound", "Vowels, mora timing, and pitch—how Japanese is heard and spoken."],
          ["Writing", "Kana and the sound patterns used to read and write Japanese."],
          ["Vocabulary", "Words studied through meaning, pronunciation, and recall."],
        ]) {
          assert.match(
            html,
            new RegExp(
              `<section class="japanese-line"><h2>${line}</h2><p>${description.replaceAll(".", "\\.")}</p></section>`,
            ),
          );
        }
        assert.doesNotMatch(html, /Choose any station that is useful now|The network shows relationships/);
        assert.doesNotMatch(html, /<dl|<dt|<dd|japanese-territor|japanese-paths-list|japanese-script-example/);
        assert.doesNotMatch(html, /Visiting Japan\?|phrases that follow|Rōmaji uses the Roman alphabet/);
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
        for (const [japanese, meaning, romaji] of [
          ["すみません", "Excuse me / I’m sorry", "Sumimasen"],
          ["ありがとうございます", "Thank you", "Arigatō gozaimasu"],
          ["お願いします", "Please", "Onegaishimasu"],
        ]) {
          const label = `${japanese}: ${meaning}${/[.!?]$/.test(meaning) ? "" : "."} Rōmaji: ${romaji}. Play audio`;
          assert.match(
            html,
            new RegExp(`aria-label="${escapeRegExp(label)}"`),
          );
          assert.match(
            html,
            new RegExp(
              `<span class="travel-reference-japanese" lang="ja"><span class="travel-japanese-segment">${japanese}</span></span><span aria-label="Rōmaji: ${escapeRegExp(romaji)}" class="travel-reference-pronunciation"><span class="travel-reference-romaji">${escapeRegExp(romaji)}</span></span><span class="travel-reference-meaning">${escapeRegExp(meaning)}</span>`,
            ),
          );
        }
        assert.match(html, /data-pronunciation="true"/);
        assert.doesNotMatch(html, /data-sound-cue="true"|soo mee mah|ah ree gah|oh neh gah/);
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
      assert.match(html, /Rōmaji uses the Latin alphabet—the letters A–Z—to represent Japanese sounds\./);
      assert.match(html, /We use it as a bridge, so you can read the sounds in the Kana stations while learning Hiragana and Katakana\./);
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

test("every learning station route is directly accessible", async () => {
  for (const station of [
    "hiragana",
    "katakana",
    "sound-marks",
    "combined-sounds",
    "words",
    "mora-timing",
    "pitch-accent",
  ]) {
    const response = await request(`/stations/${station}`);
    assert.equal(response.status, 200, `${station} should not redirect`);
    assert.equal(response.headers.get("cache-control"), "private, no-store");
  }
});

test("retired parts-of-speech stations and APIs are no longer addressable", async () => {
  for (const station of ["nouns", "verbs", "adjectives"]) {
    const page = await request(`/stations/${station}`);
    assert.equal(page.status, 404);

    const introduction = await request(`/api/stations/${station}/introduction`, {
      method: "POST",
    });
    assert.equal(introduction.status, 404);

    const knowledge = await request(`/api/stations/${station}/knowledge`);
    assert.equal(knowledge.status, 404);
  }
});

test("the retired Kana extensions route leads to Dakuten & Handakuten", async () => {
  const response = await request("/stations/kana-extensions");
  assert.ok([307, 308].includes(response.status));
  assert.match(response.headers.get("location") ?? "", /\/stations\/sound-marks$/i);
});

test("server-renders Kana in the Writing line", async () => {
  const response = await request("/stations/kana");
  assert.equal(response.status, 200);
  const html = await response.text();

  assert.match(html, /<h1>Kana<\/h1>/i);
  assert.match(html, /aria-label="Return to network map from Kana"/i);
  assert.match(html, /data-position="kana"/i);
  assert.match(html, /class="station-map-writing"/i);
  assert.doesNotMatch(html, /data-line="sound"/i);
  assert.match(html, /data-line="writing"[^>]*>Writing</i);
  assert.match(html, /Kana is the collective name for Hiragana and Katakana/i);
  assert.match(html, /href="\/stations\/vowels"[^>]*>Vowels</i);
  assert.doesNotMatch(html, /aria-label="Test All Vowels/i);
});

test("server-renders the Vowels introduction", async () => {
  const response = await request("/stations/vowels");
  assert.equal(response.status, 200);
  assert.match(response.headers.get("content-type") ?? "", /^text\/html\b/i);

  const html = await response.text();
  assert.match(html, /<h1>Vowels<\/h1>/i);
  assert.match(html, /aria-label="Return to the Ling network map"/i);
  assert.match(html, /aria-label="Station navigation"/i);
  assert.match(html, /aria-label="Return to network map from Vowels"/i);
  assert.equal((html.match(/href="\/\?focus=vowels"/gi) ?? []).length, 2);
  assert.match(html, /data-position="vowels"/i);
  assert.match(html, /class="station-map-sound"/i);
  assert.match(html, /data-line="sound"[^>]*>Sound</i);
  assert.match(html, /Japanese Kana are built around five vowel sounds/i);
  assert.match(html, /Hiragana and Katakana write each sound with a different shape/i);
  assert.doesNotMatch(html, /<dl|<dt|<dd/i);
  assert.match(html, /Start with the five vowel sounds.*Tap any Kana to practice it/is);
  assert.doesNotMatch(html, /International Phonetic Alphabet|\bIPA\b/i);
  assert.match(html, /aria-label="The five Japanese vowels in Hiragana and Katakana"/i);
  assert.match(html, /class="hiragana-table kana-vowels-chart"/i);
  assert.equal((html.match(/class="hiragana-button"/gi) ?? []).length, 10);
  assert.match(html, /aria-label="Test All Vowels\. 10 remaining\."/i);
  assert.match(html, /あ.*い.*う.*え.*お.*ア.*イ.*ウ.*エ.*オ/is);
  assert.match(html, />a<.*>i<.*>u<.*>e<.*>o</is);
  assert.doesNotMatch(html, />ah<.*>ee<.*>oo<.*>eh<.*>oh</is);
  assert.match(html, /Same sound, two shapes.*Each pair above is pronounced the same way/is);
  assert.doesNotMatch(html, /kana-study-button|kana-study-example-button|kana-pair/i);
  assert.doesNotMatch(html, /Kanji is different|Kanji primarily carries meaning/i);
  assert.doesNotMatch(html, /score|streak|progress meter/i);
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

  const vowelsIntroduction = await request(
    "/api/stations/vowels/introduction",
    { method: "POST" },
  );
  assert.equal(vowelsIntroduction.status, 401);
  assert.equal(vowelsIntroduction.headers.get("cache-control"), "private, no-store");
  assert.deepEqual(await vowelsIntroduction.json(), { error: "unauthorized" });

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

  for (const station of ["vowels", "romaji", "mora-timing", "pitch-accent"]) {
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

});
