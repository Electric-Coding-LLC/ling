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
    review.indexOf("<span>Not Yet</span>") < review.indexOf("<span>Good</span>"),
    "the fallback button order should match Not-Yet-left and Good-right swipes",
  );
  assert.match(styles, /\.hiragana-test-card-gesture\s*\{[^}]*touch-action:\s*pan-y/s);
  assert.match(styles, /data-motion="exit-left"[\s\S]*translate3d\(calc\(-100vw - 2rem\)/);
  assert.match(styles, /data-motion="exit-right"[\s\S]*translate3d\(calc\(100vw \+ 2rem\)/);
  assert.match(styles, /@keyframes hiragana-test-card-enter/);
  assert.match(styles, /@media \(max-width: 600px\), \(hover: none\) and \(pointer: coarse\) \{[\s\S]*\.hiragana-test-answer\s*\{[^}]*min-height:\s*2\.75rem[^}]*font-size:\s*0\.875rem[\s\S]*\.hiragana-test-answer-yes\s*\{[^}]*color:\s*var\(--known\)[^}]*background:\s*transparent/s);
  assert.match(styles, /@media \(max-width: 600px\), \(hover: none\) and \(pointer: coarse\) \{[\s\S]*\.hiragana-test-answer-no\s*\{[^}]*color:\s*var\(--sound\)/s);
  assert.match(review, /className="hiragana-test-actions hiragana-test-review-actions"/);
  assert.match(review, /className="hiragana-test-swipe-icon"[\s\S]*M13 8H3m4-4L3 8l4 4[\s\S]*<span>Not Yet<\/span>/);
  assert.match(review, /<span>Good<\/span>[\s\S]*className="hiragana-test-swipe-icon"[\s\S]*M3 8h10m-4-4 4 4-4 4/);
  assert.match(styles, /\.hiragana-test-swipe-icon\s*\{[^}]*display:\s*none[^}]*stroke:\s*currentcolor/s);
  assert.match(styles, /\.hiragana-test-review-actions \.hiragana-test-answer-icon\s*\{[^}]*display:\s*none[^}]*\}[\s\S]*\.hiragana-test-review-actions \.hiragana-test-swipe-icon\s*\{[^}]*display:\s*block/s);
  assert.match(review, /revealed \? \([\s\S]*className="hiragana-test-example"[\s\S]*\) : \([\s\S]*className="hiragana-test-example-reveal"/);
  assert.match(review, /className="hiragana-test-answer-slot"/);
  assert.match(review, /aria-label=\{`Show answer for \$\{kana\}`\}/);
  assert.match(review, />\s*Answer\s*<\/button>/);
  assert.match(review, /onClick=\{onPlayKana\}/);
  assert.match(review, /onClick=\{onPlayExample\}/);
  assert.match(review, /onClick=\{onReveal\}/);

  for (const path of guidePaths) {
    const guide = await readFile(new URL(path, root), "utf8");
    assert.match(guide, /import \{ FlashcardContent, FlashcardReview \} from "\.\.\/flashcard-review"/);
    assert.match(guide, /<FlashcardReview[\s\S]*onAnswer=\{answerCard\}[\s\S]*playing=\{audioPlaying\}/);
    assert.match(guide, /<FlashcardContent[\s\S]*onPlayExample=\{\(\) => void playAudio\(activeCard\.exampleAudio\)\}[\s\S]*onPlayKana=\{playActiveKana\}[\s\S]*onReveal=\{\(\) => setPronunciationRevealed\(true\)\}[\s\S]*revealed=\{pronunciationRevealed\}/);
  }
});
