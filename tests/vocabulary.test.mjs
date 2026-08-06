import assert from "node:assert/strict";
import { readFile } from "node:fs/promises";
import test from "node:test";
import { getJapaneseMorae, getJapaneseWordRomaji } from "../src/modules/romaji.ts";
import { getPitchLevels } from "../src/modules/learning/pitch-accent.ts";
import {
  getVocabularyItemIds,
  getVocabularyStation,
  isVocabularyKnowledge,
  PRONUNCIATION_VOCABULARY_ITEMS,
  VOCABULARY_REVIEW_DIRECTIONS,
  VOCABULARY_STATIONS,
  VOCABULARY_STATION_IDS,
} from "../src/modules/learning/vocabulary.ts";

const root = new URL("../", import.meta.url);

function readWavFormat(audio) {
  let bitsPerSample;
  let channels;
  let data;
  let sampleRate;
  for (let offset = 12; offset + 8 <= audio.length;) {
    const chunkId = audio.subarray(offset, offset + 4).toString("ascii");
    const chunkSize = audio.readUInt32LE(offset + 4);
    const chunkStart = offset + 8;
    if (chunkId === "fmt ") {
      channels = audio.readUInt16LE(chunkStart + 2);
      sampleRate = audio.readUInt32LE(chunkStart + 4);
      bitsPerSample = audio.readUInt16LE(chunkStart + 14);
    }
    if (chunkId === "data") data = audio.subarray(chunkStart, chunkStart + chunkSize);
    offset = chunkStart + chunkSize + (chunkSize % 2);
  }
  return { bitsPerSample, channels, data, sampleRate };
}

test("Vocabulary is ordered into seven practical, one-word stations", () => {
  assert.deepEqual(VOCABULARY_STATION_IDS, [
    "pointing", "people", "needs", "movement", "time", "actions", "descriptions",
  ]);
  assert.deepEqual(VOCABULARY_STATIONS.map((station) => station.name), [
    "Pointing", "People", "Needs", "Movement", "Time", "Actions", "Descriptions",
  ]);
  assert.deepEqual(
    Object.fromEntries(VOCABULARY_STATIONS.map((station) => [
      station.id,
      station.items.map((item) => item.id),
    ])),
    {
      pointing: ["kore", "sore", "are", "koko", "soko", "asoko", "doko", "nani"],
      people: ["watashi", "namae", "hito", "tomodachi", "kazoku", "sensei", "kodomo"],
      needs: ["mizu", "tabemono", "toire", "ocha", "koohii", "pan", "gohan"],
      movement: ["eki", "densha", "iku", "basu", "kuruma", "takushii", "chikatetsu"],
      time: ["ima", "kyou", "ashita", "kinou", "asa", "hiru", "yoru", "jikan"],
      actions: ["taberu", "nomu", "miru", "kiku", "hanasu", "kau", "matsu"],
      descriptions: ["ii", "ookii", "chiisai", "atsui", "samui", "takai", "yasui"],
    },
  );
  const allIds = getVocabularyItemIds();
  assert.equal(new Set(allIds).size, allIds.length);
  assert.deepEqual(VOCABULARY_REVIEW_DIRECTIONS, [
    "meaning-to-japanese", "japanese-to-meaning",
  ]);
  assert.equal(isVocabularyKnowledge({ direction: "japanese-to-meaning", itemId: "kore" }), true);
  assert.equal(isVocabularyKnowledge({ direction: "japanese-to-meaning", itemId: "not-a-word" }), false);
});

test("existing Words progress IDs remain in the expanded curriculum", () => {
  const legacyIds = [
    "kore", "koko", "doko", "nani", "watashi", "namae", "hito", "mizu",
    "tabemono", "toire", "eki", "densha", "iku", "ima", "kyou",
  ];
  assert.deepEqual(PRONUNCIATION_VOCABULARY_ITEMS.map((item) => item.id), legacyIds);
  for (const id of legacyIds) assert.ok(getVocabularyItemIds().includes(id));
});

test("every curriculum item has a valid Kana reading, pitch shape, and bundled PCM audio", async () => {
  for (const station of VOCABULARY_STATIONS) {
    assert.ok(station.description.length > 0);
    for (const item of station.items) {
      const morae = getJapaneseMorae(item.reading);
      assert.ok(getJapaneseWordRomaji(item.reading).length > 0, `${item.id} needs rōmaji`);
      assert.equal(morae.join(""), item.reading, `${item.id} reading must preserve its morae`);
      assert.equal(getPitchLevels(morae.length, item.pitchAccent).length, morae.length);
      const audio = await readFile(new URL(`public${item.audio}`, root));
      assert.equal(audio.subarray(0, 4).toString("ascii"), "RIFF");
      assert.equal(audio.subarray(8, 12).toString("ascii"), "WAVE");
      const format = readWavFormat(audio);
      assert.equal(format.channels, 1, `${item.audio} should be mono`);
      assert.equal(format.sampleRate, 22_050, `${item.audio} should use the authored rate`);
      assert.equal(format.bitsPerSample, 16, `${item.audio} should use PCM16`);
      assert.ok(format.data?.some((sample) => sample !== 0), `${item.audio} should be audible`);
    }
  }
});

test("Kanji-bearing vocabulary keeps display writing separate from pronunciation", () => {
  assert.deepEqual(
    getVocabularyStation("people").items.slice(0, 3).map(({ reading, word }) => ({ reading, word })),
    [
      { reading: "わたし", word: "私" },
      { reading: "なまえ", word: "名前" },
      { reading: "ひと", word: "人" },
    ],
  );
  assert.equal(getVocabularyStation("pointing").items.every((item) => item.word === item.reading), true);
});

test("all vocabulary stations reuse one station-scoped review and persistence surface", async () => {
  const guide = await readFile(new URL("app/stations/vocabulary-guide.tsx", root), "utf8");
  const wordReview = await readFile(new URL("app/stations/word-review.tsx", root), "utf8");
  const styles = await readFile(new URL("app/styles/stations.css", root), "utf8");
  const handlers = await readFile(new URL("app/api/stations/vocabulary-route-handlers.ts", root), "utf8");
  const repository = await readFile(new URL("src/modules/learning/repository.ts", root), "utf8");
  const dynamicKnowledge = await readFile(new URL("app/api/stations/[vocabularyStation]/knowledge/route.ts", root), "utf8");

  assert.match(guide, /VocabularyGuide\(\{ station \}/);
  assert.match(guide, /`\/api\/stations\/\$\{station\.id\}\/introduction`/);
  assert.match(guide, /`\/api\/stations\/\$\{station\.id\}\/knowledge`/);
  assert.match(guide, /getJapaneseMorae\(item\.reading\)/);
  assert.match(guide, /word=\{item\.reading\}/);
  assert.match(guide, /item\.word !== item\.reading/);
  assert.match(guide, /<span className="vocabulary-reference-written"/);
  assert.match(guide, /<FlashcardCountdown/);
  assert.match(guide, /onAnswer=\{answerCard\}/);
  assert.match(guide, /<WordReviewLauncher/);
  assert.match(guide, /<WordReviewDialog/);
  assert.match(guide, /label: "English → Japanese"/);
  assert.match(guide, /label: "Japanese → English"/);
  assert.match(guide, /function activateCard\(\) \{[\s\S]*setAnswerRevealed\(true\);[\s\S]*playItem\(activeCard\);[\s\S]*\}/);
  assert.match(guide, /onActivate=\{activateCard\}/);
  assert.match(guide, /<FlashcardCountdown onComplete=\{activateCard\} \/>/);
  assert.match(wordReview, /export function WordReviewLauncher/);
  assert.match(wordReview, /export function WordReviewDialog/);
  assert.match(wordReview, /className="vocabulary-review-launcher"/);
  assert.match(wordReview, /className="hiragana-test-dialog"/);
  assert.match(wordReview, /event\.key !== "Escape"/);
  assert.match(wordReview, /dialog\.showModal\(\)/);
  assert.match(styles, /\.vocabulary-review-prompt,\s*\.vocabulary-review-meaning\s*\{[^}]*font-size:\s*var\(--vocabulary-review-latin-size\)/s);
  assert.match(styles, /\.vocabulary-review-word\s*\{[^}]*font-family:\s*"Hiragino Sans"[^}]*font-size:\s*var\(--vocabulary-review-japanese-size\)/s);
  assert.match(styles, /\.vocabulary-review-answer \.pitch-contour\s*\{[^}]*--pitch-character-size:\s*var\(--vocabulary-review-japanese-size\)/s);
  assert.match(styles, /\.vocabulary-review-answer \.pitch-contour-word\s*\{[^}]*line-height:\s*1\.2/s);
  assert.match(styles, /\.vocabulary-review-content \.pitch-contour-romaji\s*\{[^}]*color:\s*var\(--muted\)[^}]*font-size:\s*var\(--vocabulary-review-secondary-size\)/s);
  assert.match(styles, /\.vocabulary-review-reading\s*\{[^}]*font-size:\s*var\(--vocabulary-review-secondary-size\)/s);
  assert.match(styles, /\.vocabulary-review-romaji\s*\{[^}]*color:\s*var\(--muted\)[^}]*font-size:\s*var\(--vocabulary-review-secondary-size\)/s);
  assert.match(handlers, /getVocabularyItemIds\(stationId\)/);
  assert.match(handlers, /getVocabularyStation\(stationId\)\.items\.some/);
  assert.match(handlers, /setVocabularyItemsKnown\(user\.id, itemIds, body\.known\)/);
  assert.match(handlers, /private, no-store/);
  assert.match(repository, /inArray\(vocabularyKnowledge\.itemId, \[\.\.\.itemIds\]\)/);
  assert.match(dynamicKnowledge, /isVocabularyStationId/);
  assert.match(styles, /\.vocabulary-reference-list\s*\{[^}]*grid-template-columns:\s*repeat\(auto-fill, minmax\(9\.5rem, 1fr\)\)/s);
  assert.match(styles, /\.vocabulary-reference-written \+ \.pitch-contour/);
});

test("each vocabulary route is a thin direct page and the legacy Words route redirects", async () => {
  for (const stationId of VOCABULARY_STATION_IDS) {
    const page = await readFile(new URL(`app/stations/${stationId}/page.tsx`, root), "utf8");
    assert.match(page, new RegExp(`VocabularyStationPage stationId="${stationId}"`));
    assert.doesNotMatch(page, /prerequisite|available/i);
  }
  const legacyPage = await readFile(new URL("app/stations/words/page.tsx", root), "utf8");
  assert.match(legacyPage, /redirect\("\/stations\/pointing"\)/);
});

test("the optional station footer follows the approved Kanji, vocabulary, and Grammar sequence", async () => {
  const footer = await readFile(new URL("app/stations/station-next-footer.tsx", root), "utf8");
  const styles = await readFile(new URL("app/styles/stations.css", root), "utf8");
  assert.match(footer, /<span className="station-next-copy">\s*Next station: \{nextStation\.label\}\s*<\/span>/s);
  assert.doesNotMatch(styles, /\.station-next-name/);
  for (const [from, to] of [
    ["hiragana", "katakana"],
    ["katakana", "sound-marks"],
    ["sound-marks", "combined-sounds"],
    ["combined-sounds", "kanji"],
    ["kanji", "compounds"],
    ["compounds", "endings"],
    ["endings", "vocabulary"],
  ]) {
    assert.match(footer, new RegExp(`"/stations/${from}": \\{ href: "/stations/${to}"`));
  }
  for (const [from, to] of [
    ["vocabulary", "pointing"],
    ["pointing", "people"],
    ["people", "needs"],
    ["needs", "movement"],
    ["movement", "time"],
    ["time", "actions"],
    ["actions", "descriptions"],
    ["descriptions", "grammar"],
    ["grammar", "statements"],
    ["statements", "questions"],
    ["questions", "possession"],
    ["possession", "existence"],
    ["existence", "verbs"],
    ["verbs", "tense"],
    ["tense", "negation"],
    ["negation", "adjectives"],
  ]) {
    assert.match(footer, new RegExp(`"/stations/${from}": \\{ href: "/stations/${to}"`));
  }
  assert.match(footer, /pathname === "\/stations\/adjectives"/);
  assert.match(footer, /href="\/\?focus=adjectives"/);
});
