import assert from "node:assert/strict";
import { readFile } from "node:fs/promises";
import test from "node:test";
import {
  getGrammarItemIds,
  getGrammarStation,
  GRAMMAR_REVIEW_DIRECTIONS,
  GRAMMAR_STATION_IDS,
  GRAMMAR_STATIONS,
  isGrammarKnowledge,
} from "../src/modules/learning/grammar.ts";

const root = new URL("../", import.meta.url);

test("Grammar is an eight-station sentence-system track", () => {
  assert.deepEqual(GRAMMAR_STATION_IDS, [
    "statements",
    "questions",
    "possession",
    "existence",
    "verbs",
    "tense",
    "negation",
    "adjectives",
  ]);
  assert.deepEqual(GRAMMAR_REVIEW_DIRECTIONS, [
    "meaning-to-japanese",
    "japanese-to-meaning",
  ]);

  const allIds = getGrammarItemIds();
  assert.equal(new Set(allIds).size, allIds.length);
  assert.equal(GRAMMAR_STATIONS.length, 8);
  for (const station of GRAMMAR_STATIONS) {
    assert.ok(station.items.length >= 3);
    for (const item of station.items) {
      assert.ok(item.japanese.endsWith("。"));
      assert.ok(item.meaning.endsWith(".") || item.meaning.endsWith("?"));
      assert.ok(item.pattern.length > 0);
      assert.ok(item.note.length > 0);
    }
  }

  assert.match(getGrammarStation("statements").description.join(" "), /marked by は/);
  assert.match(getGrammarStation("questions").description.join(" "), /ends with か/);
  assert.match(getGrammarStation("possession").description.join(" "), /の connects two nouns/);
  assert.match(getGrammarStation("existence").description.join(" "), /あります.*います/);
  assert.match(getGrammarStation("verbs").description.join(" "), /を marks.*で marks.*に can mark/);
  assert.match(getGrammarStation("tense").description.join(" "), /nonpast covers both present and future/);
  assert.match(getGrammarStation("negation").description.join(" "), /ませんでした/);
  assert.match(getGrammarStation("adjectives").description.join(" "), /い-adjectives.*な-adjectives/);

  assert.equal(
    isGrammarKnowledge({
      direction: "meaning-to-japanese",
      itemId: "watashi-wa-kurisu-desu",
    }),
    true,
  );
  assert.equal(
    isGrammarKnowledge({
      direction: "writing-to-reading",
      itemId: "watashi-wa-kurisu-desu",
    }),
    false,
  );
  assert.equal(
    isGrammarKnowledge({ direction: "meaning-to-japanese", itemId: "mizu" }),
    false,
  );
});

test("Grammar stations reuse the established review and persistence contracts", async () => {
  const guide = await readFile(new URL("app/stations/grammar-guide.tsx", root), "utf8");
  const handlers = await readFile(new URL("app/api/stations/grammar-route-handlers.ts", root), "utf8");
  const repository = await readFile(new URL("src/modules/learning/repository.ts", root), "utf8");
  const schema = await readFile(new URL("db/schema.ts", root), "utf8");

  for (const component of [
    "StationOptions",
    "WordReviewDialog",
    "WordReviewLauncher",
    "FlashcardCountdown",
    "FlashcardReview",
  ]) {
    assert.match(guide, new RegExp(`<${component}`));
  }
  assert.match(guide, /English → Japanese/);
  assert.match(guide, /Japanese → English/);
  assert.match(guide, /function revealCard\(\) \{\s*setAnswerRevealed\(true\);\s*\}/);
  assert.match(guide, /onActivate=\{revealCard\}/);
  assert.match(guide, /<FlashcardCountdown onComplete=\{revealCard\} \/>/);
  assert.doesNotMatch(guide, /getJapaneseWordRomaji|useFlashcardAudio|<audio/);
  assert.match(handlers, /getGrammarStation\(stationId\)\.items\.some/);
  assert.match(handlers, /setGrammarItemsKnown\(user\.id, itemIds, body\.known\)/);
  assert.match(handlers, /private, no-store/);
  assert.match(schema, /grammarKnowledge = sqliteTable\(\s*"grammar_knowledge"/s);
  assert.match(repository, /inArray\(grammarKnowledge\.itemId, \[\.\.\.itemIds\]\)/);
  assert.match(repository, /GRAMMAR_REVIEW_DIRECTIONS\.every/);
});

test("Grammar pages and APIs are thin station-scoped adapters", async () => {
  for (const stationId of GRAMMAR_STATION_IDS) {
    const page = await readFile(new URL(`app/stations/${stationId}/page.tsx`, root), "utf8");
    const knowledge = await readFile(
      new URL(`app/api/stations/${stationId}/knowledge/route.ts`, root),
      "utf8",
    );
    const introduction = await readFile(
      new URL(`app/api/stations/${stationId}/introduction/route.ts`, root),
      "utf8",
    );
    assert.match(page, new RegExp(`GrammarStationPage stationId="${stationId}"`));
    assert.match(knowledge, new RegExp(`handleGrammarKnowledgeGet\\("${stationId}"\\)`));
    assert.match(introduction, new RegExp(`handleGrammarIntroduction\\("${stationId}"\\)`));
  }
});
