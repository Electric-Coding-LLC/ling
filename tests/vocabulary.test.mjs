import assert from "node:assert/strict";
import { readFile } from "node:fs/promises";
import test from "node:test";
import {
  getJapaneseMorae,
  getJapaneseWordRomaji,
} from "../src/modules/romaji.ts";
import {
  getPitchLevels,
  PITCH_ACCENT_ITEMS,
} from "../src/modules/learning/pitch-accent.ts";
import {
  isVocabularyKnowledge,
  VOCABULARY_REVIEW_DIRECTIONS,
  WORDS_STATION,
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

test("Words contains a distinct, playable set with canonical rōmaji", async () => {
  assert.deepEqual(
    WORDS_STATION.items.map(({ meaning, word }) => ({ meaning, word })),
    [
      { meaning: "this", word: "これ" },
      { meaning: "here", word: "ここ" },
      { meaning: "where", word: "どこ" },
      { meaning: "what", word: "なに" },
      { meaning: "I / me", word: "わたし" },
      { meaning: "name", word: "なまえ" },
      { meaning: "person", word: "ひと" },
      { meaning: "water", word: "みず" },
      { meaning: "food", word: "たべもの" },
      { meaning: "toilet", word: "トイレ" },
      { meaning: "station", word: "えき" },
      { meaning: "train", word: "でんしゃ" },
      { meaning: "to go", word: "いく" },
      { meaning: "now", word: "いま" },
      { meaning: "today", word: "きょう" },
    ],
  );
  assert.equal(
    WORDS_STATION.description,
    "Start with words for finding your way, identifying people and things, and meeting immediate needs.",
  );
  assert.deepEqual(
    VOCABULARY_REVIEW_DIRECTIONS,
    ["meaning-to-japanese", "japanese-to-meaning"],
  );
  assert.equal(isVocabularyKnowledge({
    direction: "japanese-to-meaning",
    itemId: "kore",
  }), true);
  assert.equal(new Set(WORDS_STATION.items.map((item) => item.id)).size, WORDS_STATION.items.length);

  for (const item of WORDS_STATION.items) {
    assert.ok(getJapaneseWordRomaji(item.word).length > 0, `${item.word} needs rōmaji`);
    const morae = getJapaneseMorae(item.word);
    const pitch = getPitchLevels(morae.length, item.pitchAccent);
    assert.equal(morae.join(""), item.word, `${item.word} should preserve its written morae`);
    assert.equal(pitch.length, morae.length, `${item.word} should align pitch to its beats`);
    const audio = await readFile(new URL(`public${item.audio}`, root));
    assert.equal(audio.subarray(0, 4).toString("ascii"), "RIFF");
    assert.equal(audio.subarray(8, 12).toString("ascii"), "WAVE");
    const format = readWavFormat(audio);
    assert.equal(format.channels, 1, `${item.audio} should be mono`);
    assert.equal(format.sampleRate, 22_050, `${item.audio} should use the authored rate`);
    assert.equal(format.bitsPerSample, 16, `${item.audio} should use PCM16`);
    assert.ok(format.data?.some((sample) => sample !== 0), `${item.audio} should be audible`);
  }
});

test("Words stays independent from the pronunciation stations' teaching examples", async () => {
  const starterWords = new Set(
    WORDS_STATION.items.map((item) => `${item.word}:${item.meaning}`),
  );
  assert.ok(PITCH_ACCENT_ITEMS.some(
    (item) => !starterWords.has(`${item.word}:${item.meaning}`),
  ));

  const moraGuide = await readFile(
    new URL("app/stations/mora-timing/mora-timing-guide.tsx", root),
    "utf8",
  );
  const reviewCards = moraGuide.slice(
    moraGuide.indexOf("const MORA_REVIEW_CARDS"),
    moraGuide.indexOf("export function MoraTimingGuide"),
  );
  const moraWords = [
    ...reviewCards.matchAll(/meaning: "([^"]+)"[\s\S]*?word: "([^"]+)"/g),
  ].map((match) => `${match[2]}:${match[1]}`);
  assert.equal(moraWords.length, 9);
  assert.ok(moraWords.some((word) => !starterWords.has(word)));
  assert.ok(!starterWords.has("あめ:candy"));
  assert.ok(!starterWords.has("きって:stamp"));
});

test("Vocab uses the shared reference, flashcard, and private persistence contracts", async () => {
  const guide = await readFile(
    new URL("app/stations/vocabulary-guide.tsx", root),
    "utf8",
  );
  const routeHandlers = await readFile(
    new URL("app/api/stations/vocabulary-route-handlers.ts", root),
    "utf8",
  );
  const repository = await readFile(
    new URL("src/modules/learning/repository.ts", root),
    "utf8",
  );
  const pitchContour = await readFile(
    new URL("app/stations/pitch-contour.tsx", root),
    "utf8",
  );
  const styles = await readFile(new URL("app/styles/stations.css", root), "utf8");

  assert.match(guide, /beatCount: getJapaneseMorae\(item\.word\)\.length/);
  assert.match(guide, /<PitchContour[\s\S]*activeMoraIndex=\{playing \? activeBeatIndex : null\}[\s\S]*showPronunciation/);
  assert.match(guide, /activeMoraIndex=\{audioPlaying && activeAudioIndex === itemIndex\(activeCard\)/);
  assert.match(pitchContour, /className="pitch-contour"[\s\S]*role="img"/);
  assert.match(pitchContour, /const romaji = getJapaneseWordRomaji\(word\)/);
  assert.match(pitchContour, /className="pitch-contour-word"/);
  assert.match(pitchContour, /className="pitch-contour-romaji">\{romaji\}/);
  assert.match(pitchContour, /"--pitch-mora-character-count": moraCharacterWidths\[index\]/);
  assert.match(styles, /flex-grow:\s*var\(--pitch-mora-character-count\)/);
  assert.match(styles, /--pitch-character-size:\s*1\.65rem/);
  assert.match(styles, /width:\s*min\(100%, calc\(var\(--pitch-character-count\) \* var\(--pitch-character-size\)\)\)/);
  assert.doesNotMatch(styles, /--pitch-mora-count/);
  assert.doesNotMatch(pitchContour, /pitch-contour-(?:details|detail-separator|beat-count)/);
  assert.doesNotMatch(pitchContour, /getJapaneseMoraRomaji|romajiMorae/);
  assert.doesNotMatch(styles, /\.pitch-contour-(?:word|romaji)\s*\{[^}]*grid-template-columns:/s);
  assert.doesNotMatch(guide, />Flashcards<\/h2>/);
  assert.doesNotMatch(guide, /Review all \{station\.items\.length\} words/);
  assert.doesNotMatch(styles, /vocabulary-flashcards-start/);
  assert.match(guide, /<FlashcardCountdown/);
  assert.match(guide, /onAnswer=\{answerCard\}/);
  const flashcardReview = await readFile(
    new URL("app/stations/flashcard-review.tsx", root),
    "utf8",
  );
  assert.match(flashcardReview, />Good<\/span>/);
  assert.match(flashcardReview, />Not Yet<\/span>/);
  assert.match(guide, /fetch\("\/api\/stations\/words\/knowledge"/);
  assert.match(routeHandlers, /listWordsKnowledge/);
  assert.match(routeHandlers, /setWordsItemKnown/);
  assert.match(routeHandlers, /setAllWordsItemsKnown/);
  assert.match(routeHandlers, /private, no-store/);
  assert.match(routeHandlers, /isVocabularyReviewDirection/);
  assert.match(repository, /eq\(vocabularyKnowledge\.reviewDirection, direction\)/);
  assert.match(repository, /VOCABULARY_REVIEW_DIRECTIONS\.map\(\(reviewDirection\) => \(\{/);
  assert.match(repository, /VOCABULARY_REVIEW_DIRECTIONS\.every\(\(direction\) =>/);
  assert.match(styles, /\.vocabulary-reference-list\s*\{[^}]*grid-template-columns:\s*repeat\(auto-fill, minmax\(9\.5rem, 1fr\)\)/s);
  assert.match(styles, /\.vocabulary-reference-item\s*\{/);
  assert.match(styles, /\.vocabulary-reference-item\s*\{[^}]*min-height:\s*8\.25rem/s);
  assert.match(styles, /\.vocabulary-reference-item \.pitch-contour\s*\{/);
  assert.match(guide, /<VocabularyAudioIndicator \/>/);
  assert.match(guide, /className="vocabulary-audio-indicator"[\s\S]*?<span \/>[\s\S]*?<span \/>[\s\S]*?<span \/>/);
  assert.match(styles, /\.vocabulary-audio-indicator\s*\{[^}]*top:\s*0\.875rem[^}]*right:\s*0\.875rem[^}]*color:\s*var\(--audio\)[^}]*opacity:\s*0/s);
  assert.match(styles, /\.vocabulary-reference-item\[data-playing="true"\]\s*\{[^}]*background:[^}]*var\(--audio\)[^}]*box-shadow:\s*inset 0 0 0 2px var\(--audio\)/s);
  assert.match(styles, /\.vocabulary-reference-item\[data-playing="true"\] \.vocabulary-audio-indicator\s*\{[^}]*opacity:\s*1/s);
  assert.match(styles, /\.vocabulary-reference-item\[data-playing="true"\] \.vocabulary-audio-indicator span\s*\{[^}]*animation:\s*hiragana-test-sound-pulse/s);
  assert.match(styles, /\.vocabulary-reference-item\[data-playing="true"\]:focus-visible\s*\{[^}]*outline-color:\s*transparent/s);
  assert.match(styles, /\.station-membership-vocabulary\s*\{/);
});

test("Words tracks both review directions independently", async () => {
  const guide = await readFile(
    new URL("app/stations/vocabulary-guide.tsx", root),
    "utf8",
  );
  const styles = await readFile(new URL("app/styles/stations.css", root), "utf8");

  assert.match(guide, /setActiveReview\(\{ cards: shuffle\(items\), direction \}\)/);
  assert.match(guide, /className="vocabulary-review-launcher"/);
  assert.match(guide, /<span>English → Japanese<\/span>/);
  assert.match(guide, /<span>Japanese → English<\/span>/);
  assert.match(guide, /meaningFirst \? "English → Japanese" : "Japanese → English"/);
  assert.match(
    guide,
    /meaningFirst \? \([\s\S]*vocabulary-review-prompt[\s\S]*activeCard\.meaning[\s\S]*vocabulary-review-prompt-word[\s\S]*activeCard\.word/,
  );
  assert.match(
    guide,
    /answerRevealed \? \([\s\S]*meaningFirst \? \([\s\S]*<PitchContour[\s\S]*word=\{activeCard\.word\}[\s\S]*vocabulary-review-meaning[\s\S]*activeCard\.meaning/,
  );
  assert.match(guide, /if \(!meaningFirst \|\| answerRevealed\) playItem\(activeCard\)/);
  assert.match(guide, /const wasKnown = knownItems\[direction\]\.has\(id\)/);
  assert.match(guide, /body: JSON\.stringify\(\{ direction, itemId: id, known \}\)/);
  assert.match(guide, /const totalRecallCount = station\.items\.length \* reviewDirections\.length/);
  assert.match(guide, /remainingRecallCount.*?recalls remaining/s);
  assert.match(guide, /formatDirectionProgress\(station, knownItems, "meaning-to-japanese"\)/);
  assert.match(guide, /formatDirectionProgress\(station, knownItems, "japanese-to-meaning"\)/);
  assert.match(guide, /reviewDirections\.every\(\(direction\) =>[\s\S]*knownItems\[direction\]\.has\(item\.id\)/);
  assert.match(styles, /\.vocabulary-review-direction-menu\s*\{[^}]*top:\s*calc\(100% \+ 0\.5rem\)[^}]*width:\s*16\.5rem/s);
  assert.match(styles, /\.vocabulary-review-direction-progress\s*\{/);
  assert.match(styles, /\.vocabulary-review-launcher\[open\] \+ \.hiragana-test-tooltip\s*\{/);
  assert.match(styles, /\.vocabulary-review-direction-label\s*\{/);
});
