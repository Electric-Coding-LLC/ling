import assert from "node:assert/strict";
import { readFile } from "node:fs/promises";
import test from "node:test";
import {
  CHARACTER_MEMORY_NOTES,
  getKanjiItemIds,
  getKanjiMemoryNote,
  getKanjiStation,
  isKanjiKnowledge,
  KANJI_REVIEW_DIRECTIONS,
  KANJI_STATION_IDS,
  KANJI_STATIONS,
} from "../src/modules/learning/kanji.ts";
import { COMPLETABLE_NETWORK_PLACE_IDS } from "../src/modules/learning/network.ts";
import { getVocabularyItem } from "../src/modules/learning/vocabulary.ts";

const root = new URL("../", import.meta.url);

test("Kanji is a three-station written-word track backed by canonical Vocabulary items", () => {
  assert.deepEqual(KANJI_STATION_IDS, ["characters", "compounds", "endings"]);
  assert.deepEqual(KANJI_REVIEW_DIRECTIONS, ["writing-to-reading", "reading-to-writing"]);
  assert.deepEqual(
    Object.fromEntries(KANJI_STATIONS.map((station) => [
      station.id,
      station.items.map((item) => item.id),
    ])),
    {
      characters: ["watashi", "hito", "mizu", "eki", "kuruma", "ima", "asa", "hiru", "yoru"],
      compounds: ["namae", "tomodachi", "kazoku", "sensei", "densha", "chikatetsu", "kyou", "ashita", "kinou", "jikan"],
      endings: [
        "tabemono", "iku", "taberu", "nomu", "miru", "kiku", "hanasu", "kau", "matsu",
        "ookii", "chiisai", "atsui", "samui", "takai", "yasui",
      ],
    },
  );
  const allIds = getKanjiItemIds();
  assert.equal(new Set(allIds).size, allIds.length);
  for (const station of KANJI_STATIONS) {
    for (const item of station.items) assert.equal(item, getVocabularyItem(item.id));
  }
  assert.equal(isKanjiKnowledge({ direction: "writing-to-reading", itemId: "mizu" }), true);
  assert.equal(isKanjiKnowledge({ direction: "meaning-to-japanese", itemId: "mizu" }), false);
  assert.equal(isKanjiKnowledge({ direction: "writing-to-reading", itemId: "kore" }), false);
});

test("each Kanji station explains its actual written-word pattern", () => {
  assert.match(
    getKanjiStation("characters").description.join(" "),
    /learning the word rather than a character by itself/,
  );
  assert.match(getKanjiStation("compounds").description.join(" "), /combine to write one word/);
  assert.match(getKanjiStation("endings").description.join(" "), /Kanji core with a Kana ending/);
  for (const station of KANJI_STATIONS) {
    assert.doesNotMatch(station.description.join(" "), /on.?yomi|kun.?yomi|radical|finish Kanji/i);
  }
});

test("Characters has one curated memory cue per word without changing canonical content", () => {
  const characters = getKanjiStation("characters");
  assert.deepEqual(Object.keys(CHARACTER_MEMORY_NOTES), characters.items.map((item) => item.id));

  for (const item of characters.items) {
    const note = getKanjiMemoryNote(item.id);
    assert.ok(note);
    assert.ok(note.cue.length > 30);
    assert.doesNotMatch(note.cue, /on.?yomi|kun.?yomi|radical/i);
    if (note.relatedItemId) {
      const relatedItem = getVocabularyItem(note.relatedItemId);
      assert.ok(relatedItem.word.includes(item.word));
      assert.notEqual(relatedItem, item);
    }
  }

  assert.equal(getKanjiMemoryNote("namae"), null);
  assert.deepEqual(
    Object.fromEntries(Object.entries(CHARACTER_MEMORY_NOTES)
      .filter(([, note]) => note.relatedItemId)
      .map(([itemId, note]) => [itemId, note.relatedItemId])),
    { kuruma: "densha", ima: "kyou" },
  );
});

test("Kanji is an orientation-only category and Characters owns the first review", async () => {
  const categoryPage = await readFile(new URL("app/stations/kanji/page.tsx", root), "utf8");
  const charactersPage = await readFile(new URL("app/stations/characters/page.tsx", root), "utf8");

  assert.match(categoryPage, /<FoundationLineIntroduction line="kanji" \/>/);
  assert.doesNotMatch(categoryPage, /KanjiStationPage|KanjiGuide|knowledge/);
  assert.match(charactersPage, /<KanjiStationPage stationId="characters" \/>/);
  assert.equal(COMPLETABLE_NETWORK_PLACE_IDS.includes("kanji"), false);
  assert.equal(COMPLETABLE_NETWORK_PLACE_IDS.includes("characters"), true);

  for (const endpoint of ["introduction", "knowledge"]) {
    await assert.rejects(
      readFile(new URL(`app/api/stations/kanji/${endpoint}/route.ts`, root), "utf8"),
      { code: "ENOENT" },
    );
  }
});

test("Kanji stations share one scoped review surface with separate persistence", async () => {
  const guide = await readFile(new URL("app/stations/kanji/kanji-guide.tsx", root), "utf8");
  const vocabularyGuide = await readFile(new URL("app/stations/vocabulary-guide.tsx", root), "utf8");
  const wordReview = await readFile(new URL("app/stations/word-review.tsx", root), "utf8");
  const handlers = await readFile(new URL("app/api/stations/kanji-route-handlers.ts", root), "utf8");
  const repository = await readFile(new URL("src/modules/learning/repository.ts", root), "utf8");
  const schema = await readFile(new URL("db/schema.ts", root), "utf8");

  assert.match(guide, /KanjiGuide\(\{ station \}/);
  assert.match(guide, /Writing → Reading/);
  assert.match(guide, /Reading → Writing/);
  assert.match(guide, /function activateCard\(\) \{[\s\S]*setAnswerRevealed\(true\);[\s\S]*playItem\(activeCard\);[\s\S]*\}/);
  assert.match(guide, /onActivate=\{activateCard\}/);
  assert.match(guide, /<FlashcardCountdown onComplete=\{activateCard\} \/>/);
  assert.match(guide, /className="vocabulary-review-word vocabulary-review-prompt-word" lang="ja"/);
  assert.match(guide, /<KanjiMemoryNote item=\{item\} \/>/);
  assert.match(guide, /answerRevealed \? \([\s\S]*<KanjiMemoryNote item=\{activeCard\} \/>/);
  assert.match(guide, /<span className="kanji-memory-label">Memory cue<\/span>/);
  assert.match(guide, /<span className="kanji-memory-related-label">Seen again<\/span>/);
  assert.match(guide, /onAnswer=\{answerCard\}/);
  for (const sharedComponent of ["WordAudioIndicator", "WordReviewDialog", "WordReviewLauncher"]) {
    assert.match(guide, new RegExp(`<${sharedComponent}`));
    assert.match(vocabularyGuide, new RegExp(`<${sharedComponent}`));
    assert.match(wordReview, new RegExp(`export function ${sharedComponent}`));
  }
  assert.match(guide, /`\/api\/stations\/\$\{station\.id\}\/knowledge`/);
  assert.match(handlers, /getKanjiItemIds\(stationId\)/);
  assert.match(handlers, /getKanjiStation\(stationId\)\.items\.some/);
  assert.match(handlers, /setKanjiItemsKnown\(user\.id, itemIds, body\.known\)/);
  assert.match(handlers, /private, no-store/);
  assert.match(schema, /kanjiKnowledge = sqliteTable\(\s*"kanji_knowledge"/s);
  assert.match(repository, /inArray\(kanjiKnowledge\.itemId, \[\.\.\.itemIds\]\)/);
  assert.match(repository, /KANJI_REVIEW_DIRECTIONS\.every/);
  assert.doesNotMatch(repository, /setVocabularyItemKnown\([\s\S]{0,200}Kanji/);
});

test("Characters, Compounds, and Endings are thin direct station pages and APIs", async () => {
  for (const stationId of KANJI_STATION_IDS) {
    const page = await readFile(new URL(`app/stations/${stationId}/page.tsx`, root), "utf8");
    const knowledge = await readFile(new URL(`app/api/stations/${stationId}/knowledge/route.ts`, root), "utf8");
    const introduction = await readFile(new URL(`app/api/stations/${stationId}/introduction/route.ts`, root), "utf8");
    assert.match(page, new RegExp(`KanjiStationPage stationId="${stationId}"`));
    assert.match(knowledge, new RegExp(`handleKanjiKnowledgeGet\\("${stationId}"\\)`));
    assert.match(introduction, new RegExp(`handleKanjiIntroduction\\("${stationId}"\\)`));
  }
});
