import assert from "node:assert/strict";
import { readFile } from "node:fs/promises";
import test from "node:test";
import {
  BASIC_ROMAJI_KANA,
  COMBINED_ROMAJI_KANA,
  FINAL_ROMAJI,
  ROMAJI_COLUMN_HEADINGS,
  ROMAJI_COMBINED_ROWS,
  ROMAJI_KANA,
  ROMAJI_ROWS,
  ROMAJI_RULES,
} from "../src/modules/romaji.ts";
import {
  JAPAN_STARTER_PHRASES,
  TRAVEL_ORIENTATION,
  TRAVEL_PHRASES,
} from "../src/modules/travel.ts";

const root = new URL("../", import.meta.url);

function getWaveDuration(audio) {
  let byteRate = 0;
  let dataSize = 0;

  assert.equal(audio.toString("ascii", 0, 4), "RIFF");
  assert.equal(audio.toString("ascii", 8, 12), "WAVE");

  for (let offset = 12; offset + 8 <= audio.length;) {
    const chunkId = audio.toString("ascii", offset, offset + 4);
    const chunkSize = audio.readUInt32LE(offset + 4);
    const chunkStart = offset + 8;
    if (chunkId === "fmt ") {
      assert.equal(audio.readUInt16LE(chunkStart), 1);
      assert.equal(audio.readUInt16LE(chunkStart + 2), 1);
      assert.equal(audio.readUInt32LE(chunkStart + 4), 22_050);
      assert.equal(audio.readUInt16LE(chunkStart + 14), 16);
      byteRate = audio.readUInt32LE(chunkStart + 8);
    }
    if (chunkId === "data") dataSize = chunkSize;
    offset = chunkStart + chunkSize + (chunkSize % 2);
  }

  assert.ok(byteRate > 0);
  assert.ok(dataSize > 0);
  return dataSize / byteRate;
}

test("the Japan line keeps a compact, source-noted Japanese-first manifest", () => {
  assert.deepEqual(Object.keys(TRAVEL_PHRASES).sort(), [
    "food",
    "help",
    "introductions",
    "navigation",
    "shopping",
  ]);

  const expectedLengths = {
    food: 8,
    help: 8,
    introductions: 8,
    navigation: 6,
    shopping: 8,
  };

  for (const [station, phrases] of Object.entries(TRAVEL_PHRASES)) {
    assert.equal(phrases.length, expectedLengths[station]);
    for (const phrase of phrases) {
      assert.match(phrase.japanese, /[\u3000-\u9fff]/u);
      assert.ok(phrase.meaning.length > 0);
      assert.ok(phrase.source.length > 0);
      assert.match(phrase.audio, /^\/audio\/ja-travel-[a-z-]+\.wav$/);
      assert.match(phrase.romaji, /[A-Za-z]/);
      assert.equal(phrase.soundCue, undefined);
      if (phrase.japaneseSegments) {
        assert.equal(phrase.japaneseSegments.join(""), phrase.japanese);
      }
    }
  }

  assert.equal(JAPAN_STARTER_PHRASES.length, 3);
  assert.deepEqual(
    JAPAN_STARTER_PHRASES.map(({ romaji }) => romaji),
    [
      "Sumimasen",
      "Arigatō gozaimasu",
      "Onegaishimasu",
    ],
  );
  assert.ok(JAPAN_STARTER_PHRASES.every((phrase) => !("soundCue" in phrase)));
  assert.deepEqual(
    TRAVEL_PHRASES.introductions.map(({ japanese }) => japanese),
    [
      "はじめまして、クリスです",
      "よろしくお願いします",
      "ご出身は？",
      "アメリカから来ました",
      "日本語、できますか？",
      "はい、少しできます",
      "英語、できますか？",
      "はい、できます",
    ],
  );
  assert.deepEqual(
    TRAVEL_PHRASES.introductions.map(({ romaji }) => romaji),
    [
      "Hajimemashite, Kurisu desu.",
      "Yoroshiku onegaishimasu.",
      "Goshusshin wa?",
      "Amerika kara kimashita.",
      "Nihongo, dekimasu ka?",
      "Hai, sukoshi dekimasu.",
      "Eigo, dekimasu ka?",
      "Hai, dekimasu.",
    ],
  );
  assert.deepEqual(
    TRAVEL_PHRASES.navigation.map(({ japanese }) => japanese),
    [
      "トイレはどこですか？",
      "何番線ですか？",
      "ここまでお願いします",
      "この電車で合っていますか？",
      "どこで乗り換えますか？",
      "何番出口ですか？",
    ],
  );
  assert.deepEqual(
    TRAVEL_PHRASES.food.map(({ japanese }) => japanese),
    [
      "二人です",
      "予約しています",
      "おすすめは何ですか？",
      "これをお願いします",
      "お水をお願いします",
      "卵は入っていますか？",
      "お会計、お願いします",
      "ごちそうさまでした",
    ],
  );
  assert.deepEqual(
    TRAVEL_PHRASES.shopping.map(({ japanese }) => japanese),
    [
      "これ、いくらですか？",
      "これをください",
      "ほかの色、ありますか？",
      "ほかのサイズ、ありますか？",
      "試着してもいいですか？",
      "カードは使えますか？",
      "免税できますか？",
      "袋をお願いします",
    ],
  );
  assert.deepEqual(
    TRAVEL_PHRASES.help.map(({ japanese }) => japanese),
    [
      "助けてください",
      "気分が悪いです",
      "ここが痛いです",
      "救急車を呼んでください",
      "警察を呼んでください",
      "病院はどこですか？",
      "パスポートをなくしました",
      "英語を話せる人はいますか？",
    ],
  );
  assert.equal(
    new Set([
      ...JAPAN_STARTER_PHRASES,
      ...TRAVEL_PHRASES.introductions,
    ].map(({ id }) => id)).size,
    JAPAN_STARTER_PHRASES.length + TRAVEL_PHRASES.introductions.length,
  );
  assert.equal(TRAVEL_ORIENTATION.japanese.japanese, "日本語");
  assert.equal(TRAVEL_ORIENTATION.japan.japanese, "日本");
});

test("Rōmaji mirrors the Kana chart and tests each hidden reading", async () => {
  assert.deepEqual(ROMAJI_COLUMN_HEADINGS, ["ah", "ee", "oo", "eh", "oh"]);
  assert.equal(BASIC_ROMAJI_KANA.length, 46);
  assert.equal(COMBINED_ROMAJI_KANA.length, 33);
  assert.equal(ROMAJI_KANA.length, 79);
  assert.equal(ROMAJI_ROWS.length, 10);
  assert.equal(ROMAJI_ROWS.flat().filter(Boolean).length, 45);
  assert.equal(ROMAJI_COMBINED_ROWS.length, 11);
  assert.equal(ROMAJI_COMBINED_ROWS.flat().filter(Boolean).length, 33);
  assert.deepEqual(
    ROMAJI_ROWS.flat().filter(Boolean).map(({ romaji }) => romaji),
    ["a", "i", "u", "e", "o", "ka", "ki", "ku", "ke", "ko", "sa", "shi", "su", "se", "so", "ta", "chi", "tsu", "te", "to", "na", "ni", "nu", "ne", "no", "ha", "hi", "fu", "he", "ho", "ma", "mi", "mu", "me", "mo", "ya", "yu", "yo", "ra", "ri", "ru", "re", "ro", "wa", "o"],
  );
  assert.deepEqual(FINAL_ROMAJI, {
    audio: "/audio/ja-n.wav",
    kana: "ん",
    romaji: "n",
  });
  assert.deepEqual(
    ROMAJI_COMBINED_ROWS.flat().filter(Boolean).map(({ romaji }) => romaji),
    [
      "kya", "kyu", "kyo",
      "sha", "shu", "sho",
      "cha", "chu", "cho",
      "nya", "nyu", "nyo",
      "hya", "hyu", "hyo",
      "mya", "myu", "myo",
      "rya", "ryu", "ryo",
      "gya", "gyu", "gyo",
      "ja", "ju", "jo",
      "bya", "byu", "byo",
      "pya", "pyu", "pyo",
    ],
  );
  assert.equal(ROMAJI_RULES.length, 5);
  assert.deepEqual(
    ROMAJI_RULES.map(({ id }) => id),
    [
      "double-consonants",
      "long-vowels",
      "n-apostrophe",
      "vowel-apostrophe",
      "particles",
    ],
  );
  assert.doesNotMatch(
    JSON.stringify({
      combinedRows: ROMAJI_COMBINED_ROWS,
      rows: ROMAJI_ROWS,
      rules: ROMAJI_RULES,
    }),
    /·/,
  );
  for (const entry of [
    ...ROMAJI_ROWS.flat().filter(Boolean),
    FINAL_ROMAJI,
    ...ROMAJI_COMBINED_ROWS.flat().filter(Boolean),
  ]) {
    const audio = await readFile(new URL(`public${entry.audio}`, root));
    const duration = getWaveDuration(audio);
    assert.ok(duration >= 0.05 && duration <= 2, `${entry.audio} is a short playable sound`);
  }
  for (const example of ROMAJI_RULES.flatMap(({ examples }) => examples)) {
    const audio = await readFile(new URL(`public${example.audio}`, root));
    const duration = getWaveDuration(audio);
    assert.ok(
      duration >= 0.05 && duration <= 2,
      `${example.audio} is a short playable convention example`,
    );
  }

  const page = await readFile(
    new URL("app/stations/romaji/page.tsx", root),
    "utf8",
  );
  const guide = await readFile(
    new URL("app/stations/romaji/romaji-guide.tsx", root),
    "utf8",
  );
  const knowledgeApi = await readFile(
    new URL("app/api/stations/romaji/knowledge/route.ts", root),
    "utf8",
  );
  const repository = await readFile(
    new URL("src/modules/learning/repository.ts", root),
    "utf8",
  );
  const schema = await readFile(new URL("db/schema.ts", root), "utf8");
  const styles = await readFile(new URL("app/styles/stations.css", root), "utf8");
  assert.match(page, /networkFocus="romaji"/);
  assert.match(page, /columnHeadings=\{ROMAJI_COLUMN_HEADINGS\}/);
  assert.match(page, /combinedRows=\{ROMAJI_COMBINED_ROWS\}/);
  assert.match(page, /finalEntry=\{FINAL_ROMAJI\}/);
  assert.match(page, /rows=\{ROMAJI_ROWS\}/);
  assert.match(page, /rules=\{ROMAJI_RULES\}/);
  assert.match(guide, /useFlashcardAudio\(\)/);
  assert.match(guide, /className="hiragana-table romaji-chart"/);
  assert.match(guide, /aria-label="The 46 basic Rōmaji readings"/);
  assert.match(guide, /aria-label="The 33 combined Rōmaji readings"/);
  assert.match(guide, /<h2 id="romaji-combined-title">Combined sounds<\/h2>/);
  assert.match(guide, /<FlashcardReview/);
  assert.match(guide, /<FlashcardCountdown onComplete=\{activateCard\} \/>/);
  assert.match(guide, /<StationOptions/);
  assert.match(guide, /renderTestButton\(\)/);
  assert.match(guide, /openTest\("Rōmaji", \[entry\]\)/);
  assert.match(guide, /onClick=\{\(\) => openTest\("Rōmaji", allEntries\)\}/);
  assert.match(guide, /answerRevealed \? \(/);
  assert.match(guide, /playAudio\(\{ index: 0, src: activeCard\.audio \}\)/);
  assert.match(guide, /getJapaneseSoundCue\(activeCard\.kana\)/);
  assert.match(guide, /fetch\("\/api\/stations\/romaji\/knowledge"/);
  assert.match(guide, /data-known=\{isKnown \? "true" : undefined\}/);
  assert.match(guide, /className="romaji-rules-list"/);
  assert.match(guide, /\{example\.romaji\}/);
  assert.match(guide, /aria-label=\{`Play pronunciation for \$\{example\.romaji\}`\}/);
  assert.match(guide, /src:\s*example\.audio/);
  assert.match(guide, /className="romaji-rule-audio-indicator"/);
  assert.doesNotMatch(guide, /romaji-rule-focus/);
  assert.doesNotMatch(guide, /className="romaji-chart-kana"/);
  assert.match(
    guide,
    /function renderEntry\(entry: RomajiEntry\)[\s\S]*?<span>\{entry\.romaji\}<\/span>[\s\S]*?<\/button>/,
  );
  assert.doesNotMatch(
    guide.match(/function renderEntry[\s\S]*?\n  }\n\n  return \(/)?.[0] ?? "",
    /entry\.kana\}<\/span>/,
  );
  assert.doesNotMatch(guide, /romaji-rule-kana|lang="ja"/);
  assert.match(styles, /\.romaji-test-prompt\s*\{[^}]*font-size:/s);
  assert.match(styles, /\.romaji-test-answer-cue\s*\{[^}]*font-size:/s);
  assert.match(
    styles,
    /\.hiragana-button\.romaji-button\s*\{[^}]*font-family:\s*"Hiragino Sans", "Yu Gothic", sans-serif[^}]*font-size:\s*1\.5rem[^}]*font-weight:\s*400[^}]*letter-spacing:\s*-0\.015em/s,
  );
  assert.doesNotMatch(guide, />Japanese sound</);
  assert.match(
    styles,
    /\.romaji-rule\s*\{[^}]*display:\s*grid[^}]*gap:\s*0\.75rem[^}]*\}/s,
  );
  assert.match(
    styles,
    /\.romaji-rule-example\[data-playing="true"\] \.romaji-rule-audio-indicator span\s*\{[^}]*animation:\s*hiragana-test-sound-pulse/s,
  );
  assert.match(
    styles,
    /\.romaji-rule-example\[data-playing="true"\]\s*\{[^}]*color:\s*var\(--audio\)[^}]*box-shadow:\s*inset 0 0 0 1px var\(--audio\)/s,
  );
  assert.match(
    styles,
    /@media \(hover: hover\) and \(pointer: fine\)[\s\S]*\.romaji-rule-example:hover:not\(\[data-playing="true"\]\)\s*\{[^}]*background:\s*color-mix\(in srgb, var\(--foreground\) 7%, transparent\)/s,
  );
  assert.doesNotMatch(
    styles.match(/\.romaji-rule\s*\{[^}]*\}/s)?.[0] ?? "",
    /border|background|padding|border-radius/,
  );
  assert.match(schema, /romajiKnowledge = sqliteTable\(\s*"romaji_knowledge"/s);
  assert.match(repository, /listKnownRomajiKana/);
  assert.match(repository, /setRomajiKanaKnown/);
  assert.match(repository, /setAllRomajiKanaKnown/);
  assert.match(knowledgeApi, /export async function GET/);
  assert.match(knowledgeApi, /export async function PUT/);
  assert.match(knowledgeApi, /export async function PATCH/);
  assert.match(knowledgeApi, /body\.known \? ROMAJI_KANA : \[\]/);
  assert.match(knowledgeApi, /private, no-store/);
  assert.doesNotMatch(guide, /score|streak/i);
});

test("the Japan line uses one immediate-feedback reference surface without progression", async () => {
  const component = await readFile(
    new URL("app/stations/travel-station.tsx", root),
    "utf8",
  );
  const styles = await readFile(
    new URL("app/styles/stations.css", root),
    "utf8",
  );
  const stations = ["japanese", "japan", "introductions", "navigation", "food", "shopping", "help"];

  assert.match(component, /useFlashcardAudio\(\)/);
  assert.match(component, /onClick=\{\(\) => playAudio\(\{\s*index,\s*src: item\.audio/);
  assert.match(component, /const framedCards = framed \|\| showPronunciation/);
  assert.match(component, /data-framed=\{framedCards \? "true" : undefined\}/);
  assert.match(component, /data-playing=\{playing\}/);
  assert.match(component, /<JapanesePhrase\s+className="travel-reference-japanese"/);
  assert.match(component, /className="travel-reference-meaning"/);
  assert.doesNotMatch(component, /speaker|className="travel-reference-speaker"|data-speaker=/);
  assert.match(component, /review\?: boolean/);
  assert.match(component, /<FlashcardCountdown onComplete=\{revealReviewCard\} \/>/);
  assert.match(component, /<FlashcardReview/);
  assert.match(component, /Reveal answer for \$\{activeReviewCard\.meaning\}/);
  assert.match(component, /className="travel-test-prompt"/);
  assert.match(component, /className="travel-test-japanese"\s+item=\{activeReviewCard\}/);
  assert.match(component, /<wbr \/>/);
  assert.match(component, /className="travel-japanese-segment"/);
  assert.match(component, /className="travel-test-romaji"/);
  assert.match(component, /playAudio\(\{ index: items\.length, src: activeReviewCard\.audio \}\)/);
  assert.match(component, /Rōmaji is required for \$\{item\.japanese\}/);
  assert.match(component, /Rōmaji: \$\{item\.romaji\}/);
  assert.match(component, /className="travel-reference-romaji"/);
  assert.doesNotMatch(component, /showSoundCues|soundCue|travel-reference-sound-cue/);
  assert.doesNotMatch(component, /splitJapaneseMorae|pronunciationBeats|activeBeatIndex/);
  assert.match(
    component,
    /\{meaningFirst \? \(\s*<span className="travel-reference-meaning">\{item\.meaning\}<\/span>[\s\S]*?<JapanesePhrase\s+className="travel-reference-japanese"/,
  );
  assert.match(
    component,
    /\{!meaningFirst \? \(\s*<span className="travel-reference-meaning">\{item\.meaning\}<\/span>/,
  );
  assert.match(component, /<audio[\s\S]*onEnded=\{handleAudioEnded\}[\s\S]*onError=\{handleAudioError\}/);
  assert.doesNotMatch(component, /fetch\(|score|streak|known|\/api\/stations\/introductions/i);
  assert.match(
    styles,
    /\.travel-reference-item:not\(\[data-framed="true"\]\):hover\s*\.travel-reference-japanese\s*\{[^}]*color:\s*var\(--muted\)/s,
  );
  assert.doesNotMatch(
    styles,
    /\.travel-reference-item:hover\s*\.travel-reference-japanese/,
  );
  assert.match(
    styles,
    /\.travel-reference-item\[data-framed="true"\] \.travel-audio-indicator\s*\{[^}]*top:\s*1rem[^}]*right:\s*1rem[^}]*transform:\s*none/s,
  );
  assert.match(
    styles,
    /\.travel-reference-item\[data-framed="true"\]\[data-playing="true"\]\s*\{[^}]*border-color:\s*var\(--audio\)[^}]*background:\s*color-mix\(in srgb, var\(--audio\) 8%, transparent\)[^}]*box-shadow:\s*inset 0 0 0 2px var\(--audio\)/s,
  );
  assert.match(
    styles,
    /\.travel-audio-indicator\s*\{[^}]*color:\s*var\(--audio\)/s,
  );
  assert.match(
    styles,
    /\.romaji-rule-example,\s*\.station-page-mora \.mora-example,\s*\.station-page-pitch-accent \.pitch-example,\s*\.station-page-japan \.travel-reference-item\[data-framed="true"\],\s*\.station-page-introductions \.travel-reference-item\[data-framed="true"\],\s*\.station-page-navigation \.travel-reference-item\[data-framed="true"\],\s*\.station-page-food \.travel-reference-item\[data-framed="true"\],\s*\.station-page-shopping \.travel-reference-item\[data-framed="true"\],\s*\.station-page-help \.travel-reference-item\[data-framed="true"\]\s*\{[^}]*border-radius:\s*0\.55rem[^}]*background:\s*color-mix\(in srgb, var\(--foreground\) 4%, transparent\)/s,
  );
  assert.match(
    styles,
    /\.station-page-japan \.travel-reference-item\[data-framed="true"\],\s*\.station-page-introductions \.travel-reference-item\[data-framed="true"\],\s*\.station-page-navigation \.travel-reference-item\[data-framed="true"\],\s*\.station-page-food \.travel-reference-item\[data-framed="true"\],\s*\.station-page-shopping \.travel-reference-item\[data-framed="true"\],\s*\.station-page-help \.travel-reference-item\[data-framed="true"\],\s*\.station-page-mora \.mora-example,\s*\.station-page-pitch-accent \.pitch-example\s*\{[^}]*min-height:\s*6\.25rem[^}]*border:\s*0/s,
  );
  assert.match(
    styles,
    /\.station-page-japan\s*\.travel-reference-item\[data-framed="true"\]:hover:not\(\[data-playing="true"\]\),\s*\.station-page-introductions\s*\.travel-reference-item\[data-framed="true"\]:hover:not\(\[data-playing="true"\]\),\s*\.station-page-navigation\s*\.travel-reference-item\[data-framed="true"\]:hover:not\(\[data-playing="true"\]\),\s*\.station-page-food\s*\.travel-reference-item\[data-framed="true"\]:hover:not\(\[data-playing="true"\]\),\s*\.station-page-shopping\s*\.travel-reference-item\[data-framed="true"\]:hover:not\(\[data-playing="true"\]\),\s*\.station-page-help\s*\.travel-reference-item\[data-framed="true"\]:hover:not\(\[data-playing="true"\]\)\s*\{[^}]*background:\s*color-mix\(in srgb, var\(--foreground\) 7%, transparent\)/s,
  );

  for (const station of stations) {
    const page = await readFile(
      new URL(`app/stations/${station}/page.tsx`, root),
      "utf8",
    );
    const loading = await readFile(
      new URL(`app/stations/${station}/loading.tsx`, root),
      "utf8",
    );
    assert.match(page, new RegExp(`networkFocus="${station}"`));
    assert.match(page, /<TravelStation/);
    assert.doesNotMatch(
      page,
      /redirect\(|isStationAvailable|recordStationIntroduction|stationIntroductions|knowledge/,
    );
    if (station === "japanese") {
      assert.doesNotMatch(page, /items=\{/);
    } else {
      assert.match(page, /items=\{(?:TRAVEL_PHRASES\.|JAPAN_STARTER_PHRASES\})/);
    }
    if (["japan", "introductions", "navigation", "food", "shopping", "help"].includes(station)) {
      assert.match(page, /showPronunciation/);
    } else {
      assert.doesNotMatch(page, /showPronunciation/);
    }
    if (station === "japan") {
      assert.match(page, /<TravelStation\s+framed/);
      assert.match(page, /meaningFirst=\{false\}/);
    } else {
      assert.doesNotMatch(page, /meaningFirst=/);
    }
    assert.doesNotMatch(page, /showSoundCues/);
    if (["introductions", "navigation", "food", "shopping", "help"].includes(station)) {
      assert.match(page, /\breview\b/);
    } else {
      assert.doesNotMatch(page, /\breview\b/);
    }
    assert.match(loading, /<LoadingScreen station=/);
  }
});

test("every Japan line transcript has a playable bundled PCM asset", async () => {
  const items = [
    TRAVEL_ORIENTATION.japanese,
    TRAVEL_ORIENTATION.japan,
    ...JAPAN_STARTER_PHRASES,
    ...Object.values(TRAVEL_PHRASES).flat(),
  ];
  assert.equal(items.length, 43);
  assert.equal(new Set(items.map(({ audio }) => audio)).size, items.length);

  for (const item of items) {
    const audio = await readFile(new URL(`public${item.audio}`, root));
    const duration = getWaveDuration(audio);
    assert.ok(duration >= 0.2 && duration <= 5, `${item.audio} has a valid duration`);
  }
});
