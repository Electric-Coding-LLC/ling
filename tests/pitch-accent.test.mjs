import assert from "node:assert/strict";
import { readFile } from "node:fs/promises";
import test from "node:test";
import {
  PITCH_ACCENT_ITEMS,
  PITCH_ACCENT_ITEM_IDS,
  PITCH_ACCENT_SOURCE_URL,
} from "../src/modules/learning/pitch-accent.ts";

const root = new URL("../", import.meta.url);

function wavDuration(audio) {
  let byteRate;
  let dataSize;

  for (let offset = 12; offset + 8 <= audio.length;) {
    const chunkId = audio.subarray(offset, offset + 4).toString("ascii");
    const chunkSize = audio.readUInt32LE(offset + 4);
    const chunkStart = offset + 8;

    if (chunkId === "fmt ") byteRate = audio.readUInt32LE(chunkStart + 8);
    if (chunkId === "data") dataSize = chunkSize;
    offset = chunkStart + chunkSize + (chunkSize % 2);
  }

  assert.ok(byteRate, "pitch asset should declare a byte rate");
  assert.ok(dataSize, "pitch asset should contain audio samples");
  return dataSize / byteRate;
}

test("Pitch Accent content keeps one verified contour and bundled asset per word", async () => {
  assert.equal(PITCH_ACCENT_ITEMS.length, 10);
  assert.equal(PITCH_ACCENT_ITEM_IDS.length, 10);
  assert.equal(new Set(PITCH_ACCENT_ITEM_IDS).size, 10);
  assert.match(PITCH_ACCENT_SOURCE_URL, /^https:\/\/www\.gavo\.t\.u-tokyo\.ac\.jp\/ojad\//);

  const representedShapes = new Set();
  for (const item of PITCH_ACCENT_ITEMS) {
    assert.equal(item.morae.join(""), item.word, `${item.id} must align morae to its word`);
    assert.equal(item.pitch.length, item.morae.length, `${item.id} must align pitch to morae`);
    assert.ok(item.pitch.every((level) => level === "low" || level === "high"));
    assert.ok(item.sourceEntry.length > 0);
    representedShapes.add(item.validationShape);

    const audio = await readFile(new URL(`public${item.audio}`, root));
    assert.equal(audio.subarray(0, 4).toString("ascii"), "RIFF");
    assert.equal(audio.subarray(8, 12).toString("ascii"), "WAVE");
    assert.ok(wavDuration(audio) >= 0.1, `${item.audio} should not be clipped too short`);
  }

  assert.deepEqual(
    [...representedShapes].sort(),
    ["early-fall", "later-fall", "sustained-high"],
  );
});

test("Pitch Accent is listening-first, mora-aligned, compact, and privately persisted", async () => {
  const guide = await readFile(
    new URL("app/stations/pitch-accent/pitch-accent-guide.tsx", root),
    "utf8",
  );
  const styles = await readFile(new URL("app/styles/stations.css", root), "utf8");
  const page = await readFile(new URL("app/stations/pitch-accent/page.tsx", root), "utf8");
  const introductionApi = await readFile(
    new URL("app/api/stations/pitch-accent/introduction/route.ts", root),
    "utf8",
  );
  const knowledgeApi = await readFile(
    new URL("app/api/stations/pitch-accent/knowledge/route.ts", root),
    "utf8",
  );
  const mobileStyles = styles.slice(styles.lastIndexOf("@media (max-width: 600px)"));

  assert.match(guide, /<h1>Pitch Accent<\/h1>/);
  assert.match(guide, /Japanese words move between low and high pitch/);
  assert.match(guide, /Pitch can stay high/);
  assert.match(guide, /Pitch can fall early/);
  assert.match(guide, /Pitch can fall later/);
  assert.match(guide, /<PitchContour[\s\S]*morae=\{item\.morae\}[\s\S]*pitch=\{item\.pitch\}/);
  assert.match(guide, /className="pitch-contour"[\s\S]*role="img"/);
  assert.match(guide, /<polyline points=\{points\} \/>/);
  assert.match(guide, /pitch\.map\(\(level, index\) =>/);
  assert.match(guide, /className="pitch-contour-morae"/);
  assert.doesNotMatch(guide, /pitch-example-word|pitch-review-word/);
  assert.match(guide, /aria-labelledby="pitch-practice-title" className="station-practice"/);
  assert.match(guide, /className="station-practice-word"[\s\S]*<span lang="ja">\{item\.word\}<\/span>/);
  assert.match(guide, /<StationOptions[\s\S]*stationId="pitch-accent"/);
  assert.match(guide, /playItem\(nextCards\[0\]\)/);
  assert.match(guide, /const PITCH_REVEAL_DELAY_MS = 4_000/);
  assert.match(guide, /window\.setTimeout\(\(\) => \{[\s\S]*setAnswerRevealed\(true\);[\s\S]*\}, PITCH_REVEAL_DELAY_MS\)/);
  assert.match(guide, /answerRevealed \? \([\s\S]*<PitchContour[\s\S]*\) : null/);
  assert.doesNotMatch(guide, /FlashcardCountdown|role="timer"|romaji|accent number|score|streak/i);
  assert.match(guide, /fetch\("\/api\/stations\/pitch-accent\/introduction"/);
  assert.match(guide, /fetch\("\/api\/stations\/pitch-accent\/knowledge"/);
  assert.match(guide, /method: "PUT"/);
  assert.match(guide, /method: "PATCH"/);

  assert.match(styles, /\.pitch-example-list\s*\{[^}]*grid-template-columns:\s*repeat\(2, minmax\(0, 1fr\)\)/s);
  assert.match(styles, /\.station-practice-list\s*\{[^}]*grid-template-columns:\s*repeat\(2, minmax\(0, 1fr\)\)/s);
  assert.match(styles, /\.station-practice-word\s*\{[^}]*border:\s*0/s);
  assert.doesNotMatch(styles, /\.station-practice-word\s*\{[^}]*border-bottom:/s);
  assert.match(styles, /\.station-practice-word:hover\s*\{[^}]*color:\s*var\(--muted\)/s);
  assert.doesNotMatch(styles, /\.station-practice-word:hover\s*\{[^}]*background:/s);
  assert.match(styles, /\.pitch-contour-point\[data-active="true"\]\s*\{[^}]*fill:\s*var\(--sound\)/s);
  assert.doesNotMatch(mobileStyles, /\.pitch-example-list\s*\{/s);

  assert.match(page, /isStationAvailableToCurrentUser\("pitch-accent"\)/);
  assert.match(page, /redirect\("\/\?focus=pitch-accent"\)/);
  assert.match(page, /StationTopbar current="Pitch Accent" mapPosition="pitch-accent"/);
  assert.match(introductionApi, /recordStationIntroduction\(user\.id, "pitch-accent"\)/);
  assert.match(introductionApi, /private, no-store/);
  assert.match(knowledgeApi, /export async function GET/);
  assert.match(knowledgeApi, /export async function PUT/);
  assert.match(knowledgeApi, /export async function PATCH/);
  assert.match(knowledgeApi, /isPitchAccentItemId\(candidate\.itemId\)/);
  assert.match(knowledgeApi, /setAllPitchAccentItemsKnown\(user\.id, body\.known\)/);
  assert.match(knowledgeApi, /private, no-store/);
});
