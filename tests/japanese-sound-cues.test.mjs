import assert from "node:assert/strict";
import { readFile } from "node:fs/promises";
import test from "node:test";
import {
  getJapaneseMoraSoundCues,
  getJapaneseSoundCue,
  getJapaneseWordSoundCue,
  JAPANESE_VOWEL_SOUND_CUES,
  JAPANESE_YOON_VOWEL_SOUND_CUES,
  splitJapaneseMorae,
} from "../src/modules/learning/japanese-sound-cues.ts";

test("Japanese pronunciation uses simple sound cues across Kana families", () => {
  assert.deepEqual(JAPANESE_VOWEL_SOUND_CUES, ["ah", "ee", "oo", "eh", "oh"]);
  assert.deepEqual(JAPANESE_YOON_VOWEL_SOUND_CUES, ["ah", "oo", "oh"]);

  assert.equal(getJapaneseSoundCue("か"), "kah");
  assert.equal(getJapaneseSoundCue("し"), "shee");
  assert.equal(getJapaneseSoundCue("つ"), "tsoo");
  assert.equal(getJapaneseSoundCue("ふ"), "foo");
  assert.equal(getJapaneseSoundCue("ら"), "rah");
  assert.equal(getJapaneseSoundCue("ん"), "nn");

  assert.equal(getJapaneseSoundCue("ガ"), "gah");
  assert.equal(getJapaneseSoundCue("じ"), "jee");
  assert.equal(getJapaneseSoundCue("ぢ"), "jee");
  assert.equal(getJapaneseSoundCue("ず"), "zoo");
  assert.equal(getJapaneseSoundCue("づ"), "zoo");

  assert.equal(getJapaneseSoundCue("きゃ"), "kyah");
  assert.equal(getJapaneseSoundCue("シュ"), "shoo");
  assert.equal(getJapaneseSoundCue("ちょ"), "choh");
  assert.equal(getJapaneseSoundCue("リュ"), "ryoo");
});

test("Japanese example words use readable sound units", () => {
  assert.equal(getJapaneseWordSoundCue("つき"), "tsoo kee");
  assert.equal(getJapaneseWordSoundCue("きょう"), "kyoh oo");
  assert.equal(getJapaneseWordSoundCue("きって"), "keet-teh");
  assert.equal(getJapaneseWordSoundCue("ロボット"), "roh boht-toh");
  assert.equal(getJapaneseWordSoundCue("ケーキ"), "keh— kee");
  assert.equal(getJapaneseWordSoundCue("ショコラ"), "shoh koh rah");
  assert.equal(getJapaneseWordSoundCue("パン"), "pah nn");
  assert.equal(getJapaneseWordSoundCue("ピャッ"), "pyah’");
  assert.doesNotMatch(getJapaneseWordSoundCue("イメージ"), /·/);
});

test("Japanese example words split into visible mora beats", () => {
  assert.deepEqual(splitJapaneseMorae("アニメ"), ["ア", "ニ", "メ"]);
  assert.deepEqual(splitJapaneseMorae("きょう"), ["きょ", "う"]);
  assert.deepEqual(splitJapaneseMorae("ショップ"), ["ショ", "ッ", "プ"]);
  assert.deepEqual(splitJapaneseMorae("ケーキ"), ["ケ", "ー", "キ"]);
});

test("Japanese sound cues align with visible mora beats", () => {
  assert.deepEqual(getJapaneseMoraSoundCues("いぬ"), ["ee", "noo"]);
  assert.deepEqual(getJapaneseMoraSoundCues("きょう"), ["kyoh", "oo"]);
  assert.deepEqual(getJapaneseMoraSoundCues("きって"), ["kee", "t-", "teh"]);
  assert.deepEqual(getJapaneseMoraSoundCues("ロボット"), ["roh", "boh", "t-", "toh"]);
  assert.deepEqual(getJapaneseMoraSoundCues("ケーキ"), ["keh", "—", "kee"]);
  assert.deepEqual(getJapaneseMoraSoundCues("ピャッ"), ["pyah", "’"]);
});

test("Japanese pronunciation rejects Kana without an approved sound cue", () => {
  assert.throws(() => getJapaneseSoundCue("ゔ"), /Missing sound cue/);
});

test("example vocabulary introduces no writing concepts ahead of its station", async () => {
  const kanaSource = await readFile(
    new URL("../app/stations/kana/kana-guide.tsx", import.meta.url),
    "utf8",
  );
  const katakanaSource = await readFile(
    new URL("../app/stations/katakana/katakana-guide.tsx", import.meta.url),
    "utf8",
  );
  const extensionSource = await readFile(
    new URL("../app/stations/kana-extensions/kana-extensions-guide.tsx", import.meta.url),
    "utf8",
  );
  const soundMarkBlock = sourceBlock(
    extensionSource,
    "const SOUND_MARK_FLASHCARDS",
    "const SOUND_MARK_FLASHCARD_BY_KANA",
  );
  const combinedSoundBlock = sourceBlock(
    extensionSource,
    "const COMBINED_SOUND_FLASHCARDS",
    "const COMBINED_SOUND_FLASHCARD_BY_KANA",
  );
  const prematureInBasicKatakana = /[ーッァィゥェォャュョヮヵヶガギグゲゴザジズゼゾダヂヅデドバビブベボパピプペポヴ]/;
  const prematureInSoundMarks = /[ーっッゃゅょャュョぁぃぅぇぉァィゥェォ]/;
  const prematureInCombinedSounds = /[ーっッぁぃぅぇぉァィゥェォ]/;

  const kanaExamples = exampleCards(kanaSource, "kana")
    .filter(({ example }) => /[ァ-ン]/.test(example));
  const katakanaExamples = exampleCards(katakanaSource, "katakana");
  const soundMarkExamples = exampleCards(soundMarkBlock, "kana");
  const combinedSoundExamples = exampleCards(combinedSoundBlock, "kana");

  for (const { example } of [...kanaExamples, ...katakanaExamples]) {
    assert.doesNotMatch(
      example,
      prematureInBasicKatakana,
      `${example} uses a concept taught after basic Katakana`,
    );
  }
  for (const { example } of soundMarkExamples) {
    assert.doesNotMatch(
      example,
      prematureInSoundMarks,
      `${example} uses a concept taught after Sound Marks`,
    );
  }
  for (const { example } of combinedSoundExamples) {
    assert.doesNotMatch(
      example,
      prematureInCombinedSounds,
      `${example} uses a concept taught after Yōon`,
    );
  }

  for (const { example, target } of [
    ...kanaExamples,
    ...katakanaExamples,
    ...soundMarkExamples,
    ...combinedSoundExamples,
  ]) {
    assert.ok(example.includes(target), `${example} should contain its target ${target}`);
  }
});

test("every station flashcard and example has an approved sound cue", async () => {
  const sources = await Promise.all([
    readFile(new URL("../app/stations/kana/kana-guide.tsx", import.meta.url), "utf8"),
    readFile(new URL("../app/stations/hiragana/hiragana-guide.tsx", import.meta.url), "utf8"),
    readFile(new URL("../app/stations/katakana/katakana-guide.tsx", import.meta.url), "utf8"),
    readFile(new URL("../app/stations/kana-extensions/kana-extensions-guide.tsx", import.meta.url), "utf8"),
  ]);
  const kana = sources.flatMap((source) => [
    ...source.matchAll(/\bkana: "([ぁ-んァ-ン]{1,2})"/g),
    ...source.matchAll(/\bkatakana: "([ァ-ン]{1,2})"/g),
  ]).map((match) => match[1]);
  const examples = sources.flatMap((source) => (
    [...source.matchAll(/\bexample: "([^"]+)"/g)].map((match) => match[1])
  ));

  assert.ok(kana.length > 200);
  for (const characters of new Set(kana)) {
    assert.doesNotThrow(
      () => getJapaneseSoundCue(characters),
      `expected a sound cue for ${characters}`,
    );
  }

  assert.ok(examples.length > 200);
  for (const example of new Set(examples)) {
    assert.doesNotThrow(
      () => getJapaneseWordSoundCue(example),
      `expected a word sound cue for ${example}`,
    );
  }
});

function exampleCards(source, targetField) {
  return [...source.matchAll(/\{([^{}]*\bexample: "[^"]+"[^{}]*)\}/g)]
    .map((match) => {
      const example = /\bexample: "([^"]+)"/.exec(match[1])?.[1];
      const target = new RegExp(`\\b${targetField}: "([^"]+)"`).exec(match[1])?.[1];
      return example && target ? { example, target } : null;
    })
    .filter(Boolean);
}

function sourceBlock(source, start, end) {
  return source.slice(source.indexOf(start), source.indexOf(end));
}
