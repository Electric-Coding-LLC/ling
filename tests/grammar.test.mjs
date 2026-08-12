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
import { getJapaneseMorae } from "../src/modules/romaji.ts";
import { VOCABULARY_STATIONS } from "../src/modules/learning/vocabulary.ts";

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
    assert.equal(station.items.length, 8);
    assert.ok(station.lesson);
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
    assert.ok(station.items.every((item) => item.audio));
    for (const item of station.items) {
      assert.ok(item.japanese.endsWith("。"));
      assert.ok(item.meaning.endsWith(".") || item.meaning.endsWith("?"));
      assert.ok(item.pattern.length > 0);
      assert.ok(item.note.length > 0);
      if (item.audio) {
        assert.ok(item.spokenParts?.length, `${item.id} needs timed spoken parts`);
        assert.equal(
          item.spokenParts.map(({ japanese }) => japanese).join(""),
          item.japanese.slice(0, -1),
          `${item.id} spoken parts must cover the visible sentence`,
        );
        assert.ok(item.spokenParts.every(({ reading }) =>
          getJapaneseMorae(reading).length > 0));
      }
    }
    if (station.lesson) {
      assert.equal(station.lesson.examples.length, 3);
      assert.ok(station.lesson.moreHeading.length > 0);
      assert.ok(station.lesson.moreExplanation.endsWith("."));
      assert.ok(station.lesson.examples.every(({ itemIndex }) =>
        station.items[itemIndex] !== undefined));
    }
  }

  const statements = getGrammarStation("statements");
  assert.match(statements.description.join(" "), /\[topic\] は \[information\] です/);
  assert.match(statements.description.join(" "), /person, thing, or time/);
  assert.match(statements.lesson?.heading ?? "", /sentence is built/);
  const statementParts = new Map(
    statements.lesson?.parts.map(({ japanese, label }) => [japanese, label]),
  );
  assert.deepEqual([...statementParts.keys()], ["私", "は", "先生", "です"]);
  assert.match(statementParts.get("私") ?? "", /topic/);
  assert.match(statementParts.get("は") ?? "", /topic marker.*pronounced wa/);
  assert.match(statementParts.get("先生") ?? "", /speaker is a teacher/);
  assert.match(statementParts.get("です") ?? "", /polite form.*not an exact equivalent/);
  assert.deepEqual(
    statements.items.map(({ audio }) => audio),
    [
      "/audio/ja-grammar-watashi-wa-sensei-desu.wav",
      "/audio/ja-grammar-kore-wa-mizu-desu.wav",
      "/audio/ja-grammar-watashi-mo-sensei-desu.wav",
      "/audio/ja-grammar-sore-wa-koohii-desu.wav",
      "/audio/ja-grammar-are-wa-ocha-desu.wav",
      "/audio/ja-grammar-koko-wa-eki-desu.wav",
      "/audio/ja-grammar-soko-wa-toire-desu.wav",
      "/audio/ja-grammar-kore-mo-mizu-desu.wav",
    ],
  );
  assert.deepEqual(
    statements.items[0]?.spokenParts?.map(({ reading }) =>
      getJapaneseMorae(reading).length),
    [3, 1, 4, 2],
  );
  const learnedVocabulary = new Set(
    VOCABULARY_STATIONS.flatMap((station) =>
      station.items.map(({ word }) => word)),
  );
  const learnedVocabularyById = new Map(
    VOCABULARY_STATIONS.flatMap((station) =>
      station.items.map((item) => [item.id, item])),
  );
  const statementGrammar = new Set(["は", "も", "です"]);
  for (const item of statements.items) {
    for (const part of item.spokenParts ?? []) {
      if (!statementGrammar.has(part.japanese)) {
        assert.ok(
          learnedVocabulary.has(part.japanese),
          `${item.id} uses unintroduced vocabulary: ${part.japanese}`,
        );
      }
    }
  }
  assert.ok(statements.items.every(({ pattern }) => !/\b[AB]\b/.test(pattern)));
  assert.ok(statements.items.every(({ pattern }) => /As for/.test(pattern)));
  assert.deepEqual(statements.terms?.map(({ term }) => term), ["polite form"]);
  const questions = getGrammarStation("questions");
  assert.match(questions.description.join(" "), /adds か to the end/);
  assert.deepEqual(
    questions.lesson?.examples.map(({ heading, itemIndex }) => [heading, itemIndex]),
    [
      ["Add か to ask yes or no", 0],
      ["Earlier grammar still works", 1],
      ["Ask where with どこ", 2],
    ],
  );
  assert.deepEqual(
    questions.items.map(({ audio }) => audio),
    [
      "/audio/ja-grammar-kore-wa-mizu-desu-ka.wav",
      "/audio/ja-grammar-sore-mo-mizu-desu-ka.wav",
      "/audio/ja-grammar-toire-wa-doko-desu-ka.wav",
      "/audio/ja-grammar-sore-wa-koohii-desu-ka.wav",
      "/audio/ja-grammar-are-wa-ocha-desu-ka.wav",
      "/audio/ja-grammar-koko-wa-eki-desu-ka.wav",
      "/audio/ja-grammar-eki-wa-doko-desu-ka.wav",
      "/audio/ja-grammar-sensei-wa-doko-desu-ka.wav",
    ],
  );
  const questionGrammar = new Set(["は", "も", "です", "か"]);
  for (const item of questions.items) {
    for (const part of item.spokenParts ?? []) {
      if (!questionGrammar.has(part.japanese)) {
        assert.ok(
          learnedVocabulary.has(part.japanese),
          `${item.id} uses unintroduced vocabulary: ${part.japanese}`,
        );
      }
    }
  }
  const possession = getGrammarStation("possession");
  assert.match(possession.description.join(" "), /の connects one noun to another/);
  assert.deepEqual(
    possession.lesson?.examples.map(({ heading, itemIndex }) => [heading, itemIndex]),
    [
      ["Connect an owner with の", 0],
      ["The owner can be another person", 1],
      ["The connected nouns form one phrase", 2],
    ],
  );
  assert.deepEqual(
    possession.items.map(({ audio }) => audio),
    [
      "/audio/ja-grammar-kore-wa-watashi-no-namae-desu.wav",
      "/audio/ja-grammar-sore-wa-sensei-no-koohii-desu.wav",
      "/audio/ja-grammar-are-wa-tomodachi-no-kuruma-desu.wav",
      "/audio/ja-grammar-kore-wa-watashi-no-mizu-desu.wav",
      "/audio/ja-grammar-sore-wa-sensei-no-namae-desu.wav",
      "/audio/ja-grammar-are-wa-kazoku-no-kuruma-desu.wav",
      "/audio/ja-grammar-kore-wa-tomodachi-no-ocha-desu.wav",
      "/audio/ja-grammar-sore-wa-watashi-no-koohii-desu.wav",
    ],
  );
  const possessionGrammar = new Set(["は", "の", "です"]);
  for (const item of possession.items) {
    for (const part of item.spokenParts ?? []) {
      if (!possessionGrammar.has(part.japanese)) {
        assert.ok(
          learnedVocabulary.has(part.japanese),
          `${item.id} uses unintroduced vocabulary: ${part.japanese}`,
        );
      }
    }
  }
  const grammarPartsByStation = new Map([
    ["statements", new Set(["は", "も", "です"])],
    ["questions", new Set(["は", "も", "です", "か"])],
    ["possession", new Set(["は", "の", "です"])],
    ["existence", new Set(["に", "が", "あります", "います"])],
    ["verbs", new Set(["は", "を", "で", "に"])],
    ["tense", new Set(["は", "を", "に"])],
    ["negation", new Set(["は", "を", "に", "が", "じゃないです", "ありません"])],
    ["adjectives", new Set(["は", "です"])],
  ]);
  for (const station of GRAMMAR_STATIONS) {
    const grammarParts = grammarPartsByStation.get(station.id);
    assert.ok(grammarParts);
    for (const item of station.items) {
      for (const part of item.spokenParts ?? []) {
        if (part.vocabularyId) {
          assert.ok(
            learnedVocabularyById.has(part.vocabularyId),
            `${item.id} derives ${part.japanese} from unknown vocabulary ${part.vocabularyId}`,
          );
        } else if (!grammarParts.has(part.japanese)) {
          assert.ok(
            learnedVocabulary.has(part.japanese),
            `${item.id} uses unintroduced vocabulary: ${part.japanese}`,
          );
        }
      }
    }
  }
  assert.match(getGrammarStation("existence").description.join(" "), /あります.*います/);
  assert.match(getGrammarStation("verbs").description.join(" "), /を marks.*で marks.*に marks/);
  assert.match(getGrammarStation("tense").description.join(" "), /nonpast covers present.*future/);
  assert.match(getGrammarStation("negation").description.join(" "), /ませんでした/);
  assert.match(getGrammarStation("adjectives").description.join(" "), /already know.*い-adjective/);
  assert.doesNotMatch(getGrammarStation("adjectives").description.join(" "), /な-adjective/);

  assert.equal(
    isGrammarKnowledge({
      direction: "meaning-to-japanese",
      itemId: "watashi-wa-sensei-desu",
    }),
    true,
  );
  assert.equal(
    isGrammarKnowledge({
      direction: "writing-to-reading",
      itemId: "watashi-wa-sensei-desu",
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
  assert.match(guide, /beatCount: grammarItemBeatCount\(item\)/);
  assert.match(guide, /renderSpokenSentence\(item, playing \? activeBeatIndex : null\)/);
  assert.match(guide, /className="grammar-reference-spoken-part"/);
  assert.match(guide, /announcement=\{answerRevealed[\s\S]*?activeCard\.japanese\} \$\{activeCard\.meaning\}`/);
  assert.doesNotMatch(guide, /grammar-review-pattern|grammar-review-note|activeCard\.meaning\} \$\{activeCard\.note/);
  assert.match(guide, /function renderLessonExample\(example: GrammarLessonExample\)/);
  assert.match(guide, /station\.lesson\.heading/);
  assert.match(guide, /station\.lesson\.examples\.slice\(0, 1\)\.map\(renderLessonExample\)/);
  assert.match(guide, /station\.lesson\.examples\.slice\(1\)\.map\(renderLessonExample\)/);
  assert.match(guide, /station\.lesson\.moreHeading/);
  assert.match(guide, /renderGrammarText\(station\.lesson\.moreExplanation\)/);
  assert.match(guide, /station\.items\.slice\(3\)\.map\(\(item\) => renderReferenceItem\(item, false\)\)/);
  assert.doesNotMatch(guide, /openItemReview|grammar-practice|Practice \$\{item\.japanese\}/);
  assert.doesNotMatch(guide, /Let’s|let’s|Now it’s your turn/);
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
  assert.match(guide, /<button[\s\S]*className="grammar-reference-item"[\s\S]*onClick=\{\(\) => playItem\(item\)\}/);
  assert.doesNotMatch(guide, /grammar-reference-audio|grammar-reference-listen/);
  assert.match(guide, /"Reveal answer and play audio"/);
  assert.doesNotMatch(guide, /Reveal and play \$\{activeCard\.japanese\}/);
  assert.match(guide, /<audio[\s\S]*onEnded=\{handleAudioEnded\}[\s\S]*onError=\{handleAudioError\}/);
  assert.doesNotMatch(guide, /getJapaneseWordRomaji/);
  assert.match(styles, /\.grammar-reference-item\[data-playing="true"\]\s*\{[^}]*var\(--audio\)/s);
  assert.match(styles, /\.grammar-reference-spoken-part\[data-active="true"\][\s\S]*color:\s*var\(--audio\)/);
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
