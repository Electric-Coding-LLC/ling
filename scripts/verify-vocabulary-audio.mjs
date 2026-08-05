import assert from "node:assert/strict";
import { readFile } from "node:fs/promises";
import { fileURLToPath } from "node:url";
import { PRONUNCIATION_VOCABULARY_ITEMS } from "../src/modules/learning/vocabulary.ts";

const root = new URL("../", import.meta.url);
const EXPECTED_SAMPLE_RATE = 22_050;
const MINIMUM_PITCH_SEPARATION_HZ = 8;
const MAXIMUM_HEIBAN_DECLINATION_HZ = 4;
const REQUIRED_HEIBAN_RISE_ITEMS = new Set(["iku", "koko", "watashi"]);

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

  const samples = new Float64Array(dataSize / 2);
  for (let index = 0; index < samples.length; index += 1) {
    samples[index] = buffer.readInt16LE(dataOffset + index * 2) / 32_768;
  }
  return { sampleRate, samples };
}

function getPitchTrace({ sampleRate, samples }) {
  const windowSize = Math.round(sampleRate * 0.04);
  const hopSize = Math.round(sampleRate * 0.01);
  const minimumLag = Math.floor(sampleRate / 350);
  const maximumLag = Math.ceil(sampleRate / 90);
  const trace = [];

  for (let offset = 0; offset + windowSize < samples.length; offset += hopSize) {
    let energy = 0;
    for (let index = 0; index < windowSize; index += 1) {
      energy += samples[offset + index] ** 2;
    }
    if (Math.sqrt(energy / windowSize) < 0.015) continue;

    let bestCorrelation = -1;
    let bestLag = 0;
    for (let lag = minimumLag; lag <= maximumLag; lag += 1) {
      let cross = 0;
      let leftEnergy = 0;
      let rightEnergy = 0;
      for (let index = 0; index < windowSize - lag; index += 1) {
        const left = samples[offset + index];
        const right = samples[offset + index + lag];
        cross += left * right;
        leftEnergy += left * left;
        rightEnergy += right * right;
      }
      const correlation = cross / Math.sqrt(leftEnergy * rightEnergy || 1);
      if (correlation > bestCorrelation) {
        bestCorrelation = correlation;
        bestLag = lag;
      }
    }
    if (bestCorrelation > 0.45) trace.push(sampleRate / bestLag);
  }
  return trace;
}

function median(values) {
  const sorted = [...values].sort((left, right) => left - right);
  return sorted[Math.floor(sorted.length / 2)];
}

function endpointMedian(trace, fromStart) {
  const count = Math.min(3, trace.length);
  return median(fromStart ? trace.slice(0, count) : trace.slice(-count));
}

function verifyPitchShape(item, trace) {
  assert.ok(trace.length >= 4, `${item.id} must expose a readable pitch trace`);
  const first = endpointMedian(trace, true);
  const last = endpointMedian(trace, false);

  if (item.pitchAccent === 0) {
    if (REQUIRED_HEIBAN_RISE_ITEMS.has(item.id)) {
      const peak = Math.max(...trace.slice(1));
      assert.ok(
        peak - first >= MINIMUM_PITCH_SEPARATION_HZ,
        `${item.id} must retain its verified heiban rise`,
      );
    }
    assert.ok(
      last - first >= -MAXIMUM_HEIBAN_DECLINATION_HZ,
      `${item.id} must not add an accented word-final fall to its heiban contour`,
    );
  } else if (item.pitchAccent === 1) {
    assert.ok(
      first - last >= MINIMUM_PITCH_SEPARATION_HZ,
      `${item.id} must fall after its first mora`,
    );
  } else {
    const peak = Math.max(...trace.slice(1));
    assert.ok(
      peak - first >= MINIMUM_PITCH_SEPARATION_HZ,
      `${item.id} must rise before its later pitch fall`,
    );
    assert.ok(
      peak - last >= MINIMUM_PITCH_SEPARATION_HZ,
      `${item.id} must fall after its accent nucleus`,
    );
  }

  return { first: Math.round(first), last: Math.round(last) };
}

const report = [];
for (const item of PRONUNCIATION_VOCABULARY_ITEMS) {
  const file = new URL(`public${item.audio}`, root);
  const wave = parsePcmWave(await readFile(file));
  const duration = wave.samples.length / wave.sampleRate;
  assert.ok(duration >= 0.2 && duration <= 1.5, `${item.id} duration is invalid`);
  const endpoints = verifyPitchShape(item, getPitchTrace(wave));
  report.push({
    accent: item.pitchAccent,
    duration: Number(duration.toFixed(3)),
    file: fileURLToPath(file),
    firstHz: endpoints.first,
    item: item.id,
    lastHz: endpoints.last,
  });
}

console.table(report);
