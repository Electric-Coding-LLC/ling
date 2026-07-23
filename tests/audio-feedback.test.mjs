import assert from "node:assert/strict";
import { readFile } from "node:fs/promises";
import test from "node:test";

const root = new URL("../", import.meta.url);
const flashcardGuides = [
  "app/stations/kana/kana-guide.tsx",
  "app/stations/hiragana/hiragana-guide.tsx",
  "app/stations/katakana/katakana-guide.tsx",
  "app/stations/kana-extensions/kana-extensions-guide.tsx",
  "app/stations/mora-timing/mora-timing-guide.tsx",
];

test("flashcard audio feedback starts before playback is ready", async () => {
  for (const path of flashcardGuides) {
    const source = await readFile(new URL(path, root), "utf8");
    const playAudio = source.slice(
      source.indexOf("async function playAudio"),
      source.indexOf("function stopAudio"),
    );

    assert.ok(
      playAudio.indexOf("setAudioPlaying(true)") < playAudio.indexOf("await audio.play()"),
      `${path} should show audio feedback before playback is ready`,
    );
    assert.doesNotMatch(
      source,
      /onPause=\{\(\) => setAudioPlaying\(false\)\}/,
      `${path} should not let a replaced clip clear the pending feedback cue`,
    );
  }
});

test("flashcard hover feedback is limited to hover-capable pointers", async () => {
  const styles = await readFile(new URL("app/styles/stations.css", root), "utf8");

  assert.match(
    styles,
    /@media \(hover: hover\) and \(pointer: fine\) \{[\s\S]*?\.hiragana-test-card:hover[\s\S]*?\.hiragana-test-reveal:hover \.hiragana-test-card-kana,[\s\S]*?\.hiragana-test-example:hover \.hiragana-test-example-word[\s\S]*?\n\}/,
  );
  assert.match(
    styles,
    /\.hiragana-test-reveal:focus-visible \.hiragana-test-card-kana,[\s\S]*?\.hiragana-test-example:focus-visible \.hiragana-test-example-word\s*\{[^}]*color:\s*var\(--sound\)/,
  );
});
