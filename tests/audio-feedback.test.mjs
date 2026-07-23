import assert from "node:assert/strict";
import { readFile } from "node:fs/promises";
import test from "node:test";

const root = new URL("../", import.meta.url);
const flashcardGuides = [
  "app/stations/kana/kana-guide.tsx",
  "app/stations/hiragana/hiragana-guide.tsx",
  "app/stations/katakana/katakana-guide.tsx",
  "app/stations/kana-extensions/kana-extensions-guide.tsx",
];

test("flashcard audio highlights Kana and manually played example beats", async () => {
  const hook = await readFile(new URL("app/stations/use-flashcard-audio.ts", root), "utf8");

  assert.ok(
    hook.indexOf("setAudioPlaying(true)") < hook.indexOf("void audio.play()"),
    "the shared player should show audio feedback at click intent",
  );
  assert.doesNotMatch(hook, /queuedSources|AUDIO_SEQUENCE_PAUSE|setTimeout/);
  assert.match(hook, /audio\.currentTime \/ audio\.duration/);
  assert.match(hook, /Math\.floor\(progress \* beatCount\)/);
  assert.match(hook, /window\.requestAnimationFrame\(updateActiveBeat\)/);
  assert.match(
    hook,
    /setActiveBeatIndex\(source\.beatCount === undefined \? null : 0\)/,
    "one-beat examples should highlight their only beat while playing",
  );

  for (const path of flashcardGuides) {
    const source = await readFile(new URL(path, root), "utf8");

    assert.match(source, /function activateCard\(\)[\s\S]*playAudio\(\{ index: 0, src: activeCard\.(?:audio|kanaAudio) \}\)/);
    assert.match(source, /function playExample\(\)[\s\S]*beatCount: splitJapaneseMorae\(activeCard\.example\)\.length,[\s\S]*index: 1,[\s\S]*src: activeCard\.exampleAudio/);
    assert.match(source, /onPlayExample=\{playExample\}/);
    assert.match(source, /activeAudio=\{activeAudioIndex === 0[\s\S]*"pronunciation"[\s\S]*activeAudioIndex === 1 \? "example" : null\}/);
    assert.match(source, /activeExampleBeatIndex=\{activeBeatIndex\}/);
    assert.match(source, /onEnded=\{handleAudioEnded\}/);
    assert.match(source, /onError=\{handleAudioError\}/);
    assert.doesNotMatch(
      source,
      /onPause=\{\(\) => setAudioPlaying\(false\)\}/,
      `${path} should not let a replaced clip clear the new feedback cue`,
    );
  }
});

test("flashcard hover feedback is limited to hover-capable pointers", async () => {
  const styles = await readFile(new URL("app/styles/stations.css", root), "utf8");

  assert.match(
    styles,
    /@media \(hover: hover\) and \(pointer: fine\) \{[\s\S]*?\.hiragana-test-card:hover\s*\{[^}]*border-color:/,
  );
  assert.doesNotMatch(styles, /\.hiragana-test-reveal:hover|\.hiragana-test-example:hover/);
  assert.doesNotMatch(styles, /\.hiragana-test-reveal:focus-visible|\.hiragana-test-example:focus-visible/);
  assert.match(styles, /\.hiragana-test-pronunciation\[data-playing="true"\],[\s\S]*\.hiragana-test-example-beat\[data-playing="true"\],[\s\S]*\.hiragana-test-example-pronunciation-beat\[data-playing="true"\][\s\S]*color:\s*var\(--sound\)/);
});
