import assert from "node:assert/strict";
import { readFile } from "node:fs/promises";
import { fileURLToPath } from "node:url";
import { GRAMMAR_STATIONS } from "../src/modules/learning/grammar.ts";

const root = new URL("../", import.meta.url);
const EXPECTED_SAMPLE_RATE = 22_050;

function parsePcmWave(buffer) {
  assert.equal(buffer.toString("ascii", 0, 4), "RIFF");
  assert.equal(buffer.toString("ascii", 8, 12), "WAVE");

  let bitsPerSample = 0;
  let channels = 0;
  let dataOffset = 0;
  let dataSize = 0;
  let format = 0;
  let sampleRate = 0;

  for (let offset = 12; offset + 8 <= buffer.length;) {
    const chunkId = buffer.toString("ascii", offset, offset + 4);
    const chunkSize = buffer.readUInt32LE(offset + 4);
    const chunkStart = offset + 8;

    if (chunkId === "fmt ") {
      format = buffer.readUInt16LE(chunkStart);
      channels = buffer.readUInt16LE(chunkStart + 2);
      sampleRate = buffer.readUInt32LE(chunkStart + 4);
      bitsPerSample = buffer.readUInt16LE(chunkStart + 14);
    } else if (chunkId === "data") {
      dataOffset = chunkStart;
      dataSize = chunkSize;
      break;
    }

    offset = chunkStart + chunkSize + (chunkSize % 2);
  }

  assert.equal(format, 1, "audio must be PCM");
  assert.equal(channels, 1, "audio must be mono");
  assert.equal(sampleRate, EXPECTED_SAMPLE_RATE);
  assert.equal(bitsPerSample, 16);
  assert.ok(dataOffset > 0 && dataSize > 0, "audio must contain PCM data");

  let peak = 0;
  for (let offset = dataOffset; offset < dataOffset + dataSize; offset += 2) {
    peak = Math.max(peak, Math.abs(buffer.readInt16LE(offset)));
  }
  assert.ok(peak > 500, "audio must contain audible speech");

  return dataSize / (sampleRate * channels * bitsPerSample / 8);
}

const stationsWithAudio = GRAMMAR_STATIONS.filter((station) =>
  station.items.some((item) => item.audio),
);
for (const station of stationsWithAudio) {
  assert.ok(
    station.items.every((item) => item.audio),
    `${station.name} must define audio for every sentence or none of them`,
  );
}

const items = stationsWithAudio.flatMap((station) => station.items);
assert.equal(items.length, 3, "Statements should contain three playable sentences");
assert.equal(
  new Set(items.map((item) => item.audio)).size,
  items.length,
  "Grammar audio paths must be unique",
);

const report = [];
for (const item of items) {
  assert.ok(item.audio);
  const file = new URL(`public${item.audio}`, root);
  const duration = parsePcmWave(await readFile(file));
  assert.ok(duration >= 0.5 && duration <= 5, `${item.audio} duration is invalid`);
  report.push({
    duration: Number(duration.toFixed(3)),
    file: fileURLToPath(file),
    japanese: item.japanese,
  });
}

console.table(report);
