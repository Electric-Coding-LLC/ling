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
    assert.ok(station.terms?.length);
    const teachingCopy = [
      ...station.description,
      station.lesson?.explanation ?? "",
      ...(station.lesson?.parts.map(({ label }) => label) ?? []),
    ].join(" ").toLocaleLowerCase();
    for (const term of station.terms ?? []) {
      assert.ok(term.term.length > 0);
      assert.ok(term.definition.endsWith("."));
      assert.ok(
        teachingCopy.includes(term.term.toLocaleLowerCase()),
        `${station.name} introduces ${term.term} in context`,
      );
    }
    const audioItems = station.items.filter((item) => item.audio);
    assert.ok(
      audioItems.length === 0 || audioItems.length === station.items.length,
      `${station.name} audio must cover the whole station or none of it`,
    );
    for (const item of station.items) {
      assert.ok(item.japanese.endsWith("。"));
      assert.ok(item.meaning.endsWith(".") || item.meaning.endsWith("?"));
      assert.ok(item.pattern.length > 0);
      assert.ok(item.note.length > 0);
    }
  }

  const statements = getGrammarStation("statements");
  assert.match(statements.description.join(" "), /私は is like saying “As for me…”/);
  assert.equal(statements.lesson?.heading, "Now, let’s take it apart");
  assert.deepEqual(
    statements.lesson?.parts.map(({ japanese, label }) => [japanese, label]),
    [
      ["私", "私 means “I” or “me.” Here, I’m talking about myself."],
      ["は", "は tells us that 私 is what I’m talking about. Together, 私は is like “As for me…” It is written は but pronounced wa here."],
      ["クリス", "Now I say something about myself: I’m Chris."],
      ["です", "This finishes the sentence in the polite form."],
    ],
  );
  assert.deepEqual(
    statements.items.map(({ audio }) => audio),
    [
      "/audio/ja-grammar-watashi-wa-kurisu-desu.wav",
      "/audio/ja-grammar-kyou-wa-kaigi-desu.wav",
      "/audio/ja-grammar-watashi-mo-ryokousha-desu.wav",
      "/audio/ja-grammar-watashi-wa-kaishain-desu.wav",
      "/audio/ja-grammar-yoyaku-wa-sanji-desu.wav",
      "/audio/ja-grammar-ashita-wa-yasumi-desu.wav",
      "/audio/ja-grammar-kurisu-mo-kaishain-desu.wav",
      "/audio/ja-grammar-ashita-mo-kaigi-desu.wav",
    ],
  );
  assert.ok(statements.items.every(({ pattern }) => !/\b[AB]\b/.test(pattern)));
  assert.ok(statements.items.every(({ pattern }) => /As for/.test(pattern)));
  assert.deepEqual(statements.terms?.map(({ term }) => term), ["polite form"]);
  assert.match(getGrammarStation("questions").description.join(" "), /ends with か/);
  assert.match(getGrammarStation("possession").description.join(" "), /の connects one noun to another/);
  assert.match(getGrammarStation("existence").description.join(" "), /あります.*います/);
  assert.match(getGrammarStation("verbs").description.join(" "), /を marks.*で marks.*に marks/);
  assert.match(getGrammarStation("tense").description.join(" "), /nonpast covers present.*future/);
  assert.match(getGrammarStation("negation").description.join(" "), /ませんでした/);
  assert.match(getGrammarStation("adjectives").description.join(" "), /い-adjective.*な-adjective/);

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
  const styles = await readFile(new URL("app/styles/stations.css", root), "utf8");

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
  assert.match(guide, /useFlashcardAudio\(\)/);
  assert.match(guide, /function activateCard\(\) \{[\s\S]*setAnswerRevealed\(true\);[\s\S]*playItem\(activeCard\);/);
  assert.match(guide, /onActivate=\{activateCard\}/);
  assert.match(guide, /<FlashcardCountdown onComplete=\{activateCard\} \/>/);
  assert.match(guide, /<WordAudioIndicator \/>/);
  assert.match(guide, /Let’s hear the whole sentence first/);
  assert.match(guide, /station\.lesson\.heading/);
  assert.match(guide, /Now it’s your turn/);
  assert.match(guide, /function GrammarTermTooltip/);
  assert.match(guide, /getBoundingClientRect\(\)/);
  assert.match(guide, /window\.visualViewport/);
  assert.match(guide, /currentVisualViewport\?\.width/);
  assert.match(guide, /currentVisualViewport\?\.offsetLeft/);
  assert.match(guide, /const visible = hovered \|\| open/);
  assert.match(guide, /onFocus=\{\(\) => setOpen\(true\)\}/);
  assert.match(guide, /onMouseEnter=\{\(\) => setHovered\(true\)\}/);
  assert.match(guide, /role="tooltip"/);
  assert.match(guide, /renderGrammarText\(part\.label\)/);
  assert.doesNotMatch(guide, /Grammar terms used in this lesson/);
  assert.match(guide, /openItemReview\(item\)/);
  assert.match(guide, /<button[\s\S]*className="grammar-reference-item"[\s\S]*onClick=\{\(\) => playItem\(item\)\}/);
  assert.doesNotMatch(guide, /grammar-reference-audio|grammar-reference-listen/);
  assert.match(guide, /"Reveal answer and play audio"/);
  assert.doesNotMatch(guide, /Reveal and play \$\{activeCard\.japanese\}/);
  assert.match(guide, /<audio[\s\S]*onEnded=\{handleAudioEnded\}[\s\S]*onError=\{handleAudioError\}/);
  assert.doesNotMatch(guide, /getJapaneseWordRomaji/);
  assert.match(styles, /\.grammar-reference-item\[data-playing="true"\]\s*\{[^}]*var\(--audio\)/s);
  assert.match(styles, /\.grammar-term-definition\s*\{[^}]*position:\s*absolute/s);
  assert.doesNotMatch(styles, /\.grammar-term-definition\s*\{[^}]*position:\s*fixed/s);
  assert.match(styles, /data-placement="above"/);
  assert.doesNotMatch(styles, /grammar-term-trigger:focus \+|grammar-term-tooltip:hover/);
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
