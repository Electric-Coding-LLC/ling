import assert from "node:assert/strict";
import { readFile } from "node:fs/promises";
import test from "node:test";

const root = new URL("../", import.meta.url);
const guidePaths = [
  "app/stations/kana/kana-guide.tsx",
  "app/stations/hiragana/hiragana-guide.tsx",
  "app/stations/katakana/katakana-guide.tsx",
  "app/stations/kana-extensions/kana-extensions-guide.tsx",
];

test("flashcards share directional touch gestures and answer transitions", async () => {
  const review = await readFile(new URL("app/stations/flashcard-review.tsx", root), "utf8");
  const styles = await readFile(new URL("app/styles/stations.css", root), "utf8");

  assert.match(review, /SWIPE_THRESHOLD_PX = 64/);
  assert.match(review, /beginAnswer\(deltaX > 0, deltaX > 0 \? "right" : "left"\)/);
  assert.match(review, /direction: ExitDirection = known \? "right" : "left"/);
  assert.match(review, /setMotion\(direction === "right" \? "exit-right" : "exit-left"\)/);
  assert.match(review, /dragX < 0\)\s*\? "no"/);
  assert.match(review, /dragX > 0\)\s*\? "yes"/);
  assert.match(review, /window\.matchMedia\("\(prefers-reduced-motion: reduce\)"\)/);
  assert.match(review, /onClick=\{\(\) => beginAnswer\(false\)\}/);
  assert.match(review, /onClick=\{\(\) => beginAnswer\(true\)\}/);
  assert.ok(
    review.indexOf("<span>Not yet</span>") < review.indexOf("<span>Got it!</span>"),
    "the fallback button order should match Not-yet-left and Got-it-right swipes",
  );
  assert.match(styles, /\.hiragana-test-card-gesture\s*\{[^}]*touch-action:\s*pan-y/s);
  assert.match(styles, /data-motion="exit-left"[\s\S]*translate3d\(calc\(-100vw - 2rem\)/);
  assert.match(styles, /data-motion="exit-right"[\s\S]*translate3d\(calc\(100vw \+ 2rem\)/);
  assert.match(styles, /@keyframes hiragana-test-card-enter/);
  assert.match(styles, /@media \(max-width: 600px\), \(hover: none\) and \(pointer: coarse\) \{[\s\S]*\.hiragana-test-answer\s*\{[^}]*min-height:\s*2\.75rem[^}]*font-size:\s*0\.875rem[\s\S]*\.hiragana-test-answer-yes\s*\{[^}]*color:\s*var\(--known\)[^}]*background:\s*transparent/s);
  assert.match(styles, /@media \(max-width: 600px\), \(hover: none\) and \(pointer: coarse\) \{[\s\S]*\.hiragana-test-answer-no\s*\{[^}]*color:\s*var\(--sound\)/s);
  assert.match(review, /className="hiragana-test-actions hiragana-test-review-actions"/);
  assert.match(review, /className="hiragana-test-swipe-icon"[\s\S]*M13 8H3m4-4L3 8l4 4[\s\S]*<span>Not yet<\/span>/);
  assert.match(review, /<span>Got it!<\/span>[\s\S]*className="hiragana-test-swipe-icon"[\s\S]*M3 8h10m-4-4 4 4-4 4/);
  assert.match(styles, /\.hiragana-test-swipe-icon\s*\{[^}]*display:\s*none[^}]*stroke:\s*currentcolor/s);
  assert.match(styles, /\.hiragana-test-review-actions \.hiragana-test-answer-icon\s*\{[^}]*display:\s*none[^}]*\}[\s\S]*\.hiragana-test-review-actions \.hiragana-test-swipe-icon\s*\{[^}]*display:\s*block/s);
  assert.match(review, /revealed \? \([\s\S]*className="hiragana-test-example"[\s\S]*\) : \([\s\S]*<FlashcardCountdown onComplete=\{onReveal\} \/>/);
  assert.match(review, /className="hiragana-test-answer-slot"/);
  assert.match(review, /FLASHCARD_REVEAL_DELAY_SECONDS = 4/);
  assert.match(review, /window\.setTimeout\(\(\) => \{[\s\S]*onCompleteRef\.current\(\);[\s\S]*\}, FLASHCARD_REVEAL_DELAY_MS\)/);
  assert.match(review, /role="timer"[\s\S]*className="flashcard-countdown-progress"[\s\S]*\{secondsRemaining\}/);
  assert.doesNotMatch(review, /Show answer for \$\{kana\}|>\s*Answer\s*<\/button>/);
  assert.match(review, /<div[\s\S]*className="hiragana-test-card[\s\S]*<button[\s\S]*aria-label=\{activationLabel\}[\s\S]*className="hiragana-test-card-activation"[\s\S]*onClick=\{handleCardClick\}/);
  assert.match(review, /function handleCardClick[\s\S]*onActivate\(\)/);
  assert.doesNotMatch(review, /onPlayKana/);
  assert.match(review, /aria-label=\{`Play example word \$\{example\}`\}[\s\S]*onClick=\{onPlayExample\}/);
  assert.match(review, /className="hiragana-test-example-word"[\s\S]*exampleMorae\.map[\s\S]*className="hiragana-test-example-beat"[\s\S]*className="hiragana-test-example-pronunciation"[\s\S]*examplePronunciationUnits\.map[\s\S]*className="hiragana-test-example-pronunciation-beat"[\s\S]*className="hiragana-test-example-translation"/);
  assert.match(styles, /\.flashcard-countdown\s*\{[^}]*width:\s*2\.5rem[^}]*height:\s*2\.5rem[^}]*color:\s*var\(--muted\)/s);
  assert.match(styles, /\.flashcard-countdown-progress\s*\{[^}]*animation:\s*flashcard-countdown-fill var\(--flashcard-countdown-duration\) linear forwards[^}]*stroke:\s*var\(--known\)[^}]*stroke-dashoffset:\s*1/s);
  assert.doesNotMatch(styles, /\.hiragana-test-example-reveal/);

  for (const path of guidePaths) {
    const guide = await readFile(new URL(path, root), "utf8");
    assert.match(guide, /import \{ FlashcardContent, FlashcardReview \} from "\.\.\/flashcard-review"/);
    assert.match(guide, /<FlashcardReview[\s\S]*activationLabel=\{pronunciationRevealed[\s\S]*onActivate=\{activateCard\}[\s\S]*onAnswer=\{answerCard\}[\s\S]*playing=\{audioPlaying\}/);
    assert.match(guide, /examplePronunciation=\{getJapaneseWordSoundCue\(activeCard\.example\)\}/);
    assert.match(guide, /function activateCard\(\)[\s\S]*setPronunciationRevealed\(true\)[\s\S]*playAudio\(\{ index: 0, src: activeCard\.(?:audio|kanaAudio) \}\)/);
    assert.match(guide, /function playExample\(\)[\s\S]*splitJapaneseMorae\(activeCard\.example\)\.length[\s\S]*index: 1[\s\S]*activeCard\.exampleAudio/);
    assert.match(guide, /<FlashcardContent[\s\S]*activeExampleBeatIndex=\{activeBeatIndex\}[\s\S]*onPlayExample=\{playExample\}[\s\S]*onReveal=\{activateCard\}[\s\S]*revealed=\{pronunciationRevealed\}/);
    assert.match(guide, /<audio[\s\S]*onEnded=\{handleAudioEnded\}[\s\S]*onError=\{handleAudioError\}/);
  }
});
