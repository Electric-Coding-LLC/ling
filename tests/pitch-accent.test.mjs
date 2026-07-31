import assert from "node:assert/strict";
import { readFile } from "node:fs/promises";
import test from "node:test";
import {
  getPitchLevels,
  PITCH_ACCENT_ITEMS,
  PITCH_ACCENT_ITEM_IDS,
  PITCH_ACCENT_SOURCE_URL,
} from "../src/modules/learning/pitch-accent.ts";

const root = new URL("../", import.meta.url);

test("Pitch levels are derived from a standard accent drop", () => {
  assert.deepEqual(getPitchLevels(3, 0), ["low", "high", "high"]);
  assert.deepEqual(getPitchLevels(3, 1), ["high", "low", "low"]);
  assert.deepEqual(getPitchLevels(4, 2), ["low", "high", "low", "low"]);
  assert.deepEqual(getPitchLevels(3, 3), ["low", "high", "high"]);
  assert.throws(() => getPitchLevels(2, 3), /does not fit/);
});

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

test("Pitch content keeps one verified contour and bundled asset per word", async () => {
  assert.equal(PITCH_ACCENT_ITEMS.length, 6);
  assert.equal(PITCH_ACCENT_ITEM_IDS.length, 6);
  assert.equal(new Set(PITCH_ACCENT_ITEM_IDS).size, 6);
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

test("Pitch is listening-first, mora-aligned, compact, and privately persisted", async () => {
  const guide = await readFile(
    new URL("app/stations/pitch-accent/pitch-accent-guide.tsx", root),
    "utf8",
  );
  const contour = await readFile(
    new URL("app/stations/pitch-contour.tsx", root),
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

  assert.match(guide, /<h1>Pitch<\/h1>/);
  assert.match(guide, /Japanese words move between low and high pitch/);
  assert.match(guide, /Pitch can stay high/);
  assert.match(guide, /Pitch can fall early/);
  assert.match(guide, /Pitch can fall later/);
  assert.match(guide, /<PitchContour[\s\S]*morae=\{item\.morae\}[\s\S]*pitch=\{item\.pitch\}/);
  assert.match(contour, /className="pitch-contour"[\s\S]*role="img"/);
  assert.match(contour, /<polyline points=\{points\} \/>/);
  assert.match(contour, /pitch\.map\(\(level, index\) =>/);
  assert.match(contour, /className="pitch-contour-morae"/);
  assert.doesNotMatch(guide, /pitch-example-word|pitch-review-word/);
  assert.match(guide, /className="pitch-example"[\s\S]*className="pitch-example-meaning"[\s\S]*<PitchContour/);
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

  assert.match(styles, /\.pitch-example-list\s*\{[^}]*display:\s*grid[^}]*gap:\s*0\.75rem/s);
  assert.doesNotMatch(styles, /\.pitch-example-list\s*\{[^}]*grid-template-columns:/s);
  assert.match(styles, /\.pitch-example\s*\{[^}]*position:\s*relative[^}]*display:\s*grid[^}]*width:\s*100%[^}]*align-content:\s*center[^}]*justify-items:\s*start[^}]*padding:\s*1rem 2\.75rem 1rem 1rem[^}]*border:\s*0[^}]*background:\s*transparent[^}]*text-align:\s*left/s);
  assert.match(styles, /\.romaji-rule-example,\s*\.station-page-mora \.mora-example,\s*\.station-page-pitch-accent \.pitch-example,[\s\S]*\{[^}]*border-radius:\s*0\.55rem[^}]*background:\s*color-mix\(in srgb, var\(--foreground\) 4%, transparent\)/s);
  assert.match(styles, /\.station-page-pitch-accent \.pitch-example\s*\{[^}]*min-height:\s*6\.25rem[^}]*border:\s*0/s);
  assert.match(styles, /\.pitch-example\[data-playing="true"\]\s*\{[^}]*background:\s*color-mix\(in srgb, var\(--audio\) 8%, transparent\)[^}]*box-shadow:\s*inset 0 0 0 1px var\(--audio\)/s);
  assert.match(styles, /@media \(hover: hover\) and \(pointer: fine\)[\s\S]*\.station-page-pitch-accent \.pitch-example:hover:not\(\[data-playing="true"\]\)\s*\{[^}]*background:\s*color-mix\(in srgb, var\(--foreground\) 7%, transparent\)/s);
  assert.match(styles, /\.station-practice-list\s*\{[^}]*grid-template-columns:\s*repeat\(2, minmax\(0, 1fr\)\)/s);
  assert.match(styles, /\.station-practice-word\s*\{[^}]*border:\s*0/s);
  assert.doesNotMatch(styles, /\.station-practice-word\s*\{[^}]*border-bottom:/s);
  assert.match(styles, /\.station-practice-word:hover\s*\{[^}]*color:\s*var\(--muted\)/s);
  assert.doesNotMatch(styles, /\.station-practice-word:hover\s*\{[^}]*background:/s);
  assert.match(styles, /\.pitch-contour-point\[data-active="true"\]\s*\{[^}]*fill:\s*var\(--audio\)/s);
  assert.doesNotMatch(mobileStyles, /\.pitch-example-list\s*\{/s);
  assert.doesNotMatch(mobileStyles, /\.pitch-example\s*\{/s);

  assert.doesNotMatch(page, /isStationAvailableToCurrentUser|redirect\(/);
  assert.match(page, /StationTopbar current="Pitch" mapPosition="pitch-accent"/);
  assert.match(introductionApi, /recordStationIntroduction\(user\.id, "pitch-accent"\)/);
  assert.match(introductionApi, /private, no-store/);
  assert.match(knowledgeApi, /export async function GET/);
  assert.match(knowledgeApi, /export async function PUT/);
  assert.match(knowledgeApi, /export async function PATCH/);
  assert.match(knowledgeApi, /isPitchAccentItemId\(candidate\.itemId\)/);
  assert.match(knowledgeApi, /setAllPitchAccentItemsKnown\(user\.id, body\.known\)/);
  assert.match(knowledgeApi, /private, no-store/);
});
