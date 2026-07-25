import assert from "node:assert/strict";
import { readFile } from "node:fs/promises";
import test from "node:test";
import {
  TRAVEL_ORIENTATION,
  TRAVEL_PHRASES,
} from "../src/modules/travel.ts";

const root = new URL("../", import.meta.url);

function getWaveDuration(audio) {
  let byteRate = 0;
  let dataSize = 0;

  assert.equal(audio.toString("ascii", 0, 4), "RIFF");
  assert.equal(audio.toString("ascii", 8, 12), "WAVE");

  for (let offset = 12; offset + 8 <= audio.length;) {
    const chunkId = audio.toString("ascii", offset, offset + 4);
    const chunkSize = audio.readUInt32LE(offset + 4);
    const chunkStart = offset + 8;
    if (chunkId === "fmt ") {
      assert.equal(audio.readUInt16LE(chunkStart), 1);
      assert.equal(audio.readUInt16LE(chunkStart + 2), 1);
      assert.equal(audio.readUInt32LE(chunkStart + 4), 22_050);
      assert.equal(audio.readUInt16LE(chunkStart + 14), 16);
      byteRate = audio.readUInt32LE(chunkStart + 8);
    }
    if (chunkId === "data") dataSize = chunkSize;
    offset = chunkStart + chunkSize + (chunkSize % 2);
  }

  assert.ok(byteRate > 0);
  assert.ok(dataSize > 0);
  return dataSize / byteRate;
}

test("Travel keeps a compact, source-noted Japanese-first manifest", () => {
  assert.deepEqual(Object.keys(TRAVEL_PHRASES).sort(), [
    "food",
    "greetings",
    "navigation",
    "shopping",
  ]);

  for (const phrases of Object.values(TRAVEL_PHRASES)) {
    assert.equal(phrases.length, 6);
    for (const phrase of phrases) {
      assert.match(phrase.japanese, /[\u3000-\u9fff]/u);
      assert.ok(phrase.meaning.length > 0);
      assert.ok(phrase.source.length > 0);
      assert.match(phrase.audio, /^\/audio\/ja-travel-[a-z-]+\.wav$/);
      assert.doesNotMatch(JSON.stringify(phrase), /romaji/i);
    }
  }

  assert.equal(TRAVEL_ORIENTATION.japanese.japanese, "日本語");
  assert.equal(TRAVEL_ORIENTATION.japan.japanese, "日本");
});

test("Travel uses one immediate-feedback reference surface without progression", async () => {
  const component = await readFile(
    new URL("app/stations/travel-station.tsx", root),
    "utf8",
  );
  const styles = await readFile(
    new URL("app/styles/stations.css", root),
    "utf8",
  );
  const stations = ["japanese", "japan", "greetings", "navigation", "food", "shopping"];

  assert.match(component, /useFlashcardAudio\(\)/);
  assert.match(
    component,
    /onClick=\{\(\) => playAudio\(\{\s*beatCount:[\s\S]*index,\s*src: item\.audio,\s*\}\)\}/,
  );
  assert.match(component, /data-playing=\{playing\}/);
  assert.match(component, /<span className="travel-reference-japanese" lang="ja">/);
  assert.match(component, /className="travel-reference-meaning"/);
  assert.match(component, /item\.soundCues \?\? getJapaneseMoraSoundCues\(reading\)/);
  assert.match(component, /soundCues\.length !== morae\.length/);
  assert.match(component, /beatCount:\s*showPronunciation \? morae\.length : undefined/);
  assert.match(component, /className="travel-reference-japanese-beat"/);
  assert.match(component, /className="travel-reference-pronunciation-beat"/);
  assert.match(component, /className="travel-reference-pronunciation-tail"/);
  assert.match(component, /pronunciationBeats\.slice\(-2\)/);
  assert.match(component, /key=\{`\$\{item\.japanese\}-mora-\$\{beatIndex\}`\}/);
  assert.match(component, /data-active=\{playing && activeBeatIndex === beatIndex/);
  assert.match(
    component,
    /\{showPronunciation \? \(\s*<span className="travel-reference-meaning">\{item\.meaning\}<\/span>[\s\S]*?<span className="travel-reference-japanese"/,
  );
  assert.match(
    component,
    /\{!showPronunciation \? \(\s*<span className="travel-reference-meaning">\{item\.meaning\}<\/span>/,
  );
  assert.match(component, /<audio[\s\S]*onEnded=\{handleAudioEnded\}[\s\S]*onError=\{handleAudioError\}/);
  assert.doesNotMatch(component, /fetch\(|review|score|streak|progress|known|complete/i);
  assert.match(
    styles,
    /\.travel-reference-item:not\(\[data-pronunciation="true"\]\):hover\s*\.travel-reference-japanese/,
  );
  assert.doesNotMatch(
    styles,
    /\.travel-reference-item:hover\s*\.travel-reference-japanese/,
  );

  for (const station of stations) {
    const page = await readFile(
      new URL(`app/stations/${station}/page.tsx`, root),
      "utf8",
    );
    const loading = await readFile(
      new URL(`app/stations/${station}/loading.tsx`, root),
      "utf8",
    );
    assert.match(page, new RegExp(`mapPosition="${station}"`));
    assert.match(page, /<TravelStation/);
    assert.doesNotMatch(page, /redirect|isStationAvailable|introduction|knowledge/);
    if (station === "japanese") {
      assert.doesNotMatch(page, /items=\{/);
    } else {
      assert.match(page, /items=\{(?:TRAVEL_PHRASES\.|JAPAN_STARTER_PHRASES\})/);
    }
    if (station === "japan") {
      assert.match(page, /showPronunciation/);
    } else {
      assert.doesNotMatch(page, /showPronunciation/);
    }
    assert.match(loading, /<LoadingScreen station=/);
  }
});

test("every Travel transcript has a playable bundled PCM asset", async () => {
  const items = [
    TRAVEL_ORIENTATION.japanese,
    TRAVEL_ORIENTATION.japan,
    ...Object.values(TRAVEL_PHRASES).flat(),
  ];
  assert.equal(items.length, 26);
  assert.equal(new Set(items.map(({ audio }) => audio)).size, items.length);

  for (const item of items) {
    const audio = await readFile(new URL(`public${item.audio}`, root));
    const duration = getWaveDuration(audio);
    assert.ok(duration >= 0.2 && duration <= 5, `${item.audio} has a valid duration`);
  }
});
