import assert from "node:assert/strict";
import { readFile } from "node:fs/promises";
import { fileURLToPath } from "node:url";
import {
  PITCH_ACCENT_ITEMS,
} from "../src/modules/learning/pitch-accent.ts";

const root = new URL("../", import.meta.url);
const EXPECTED_SAMPLE_RATE = 22_050;
const MIN_PITCH_SEPARATION_HZ = 8;

function parsePcmWave(buffer) {
  assert.equal(buffer.toString("ascii", 0, 4), "RIFF");
  assert.equal(buffer.toString("ascii", 8, 12), "WAVE");

  let channels = 0;
  let dataOffset = 0;
  let dataSize = 0;
  let format = 0;
  let sampleRate = 0;
  let bitsPerSample = 0;

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
  const hopSize = Math.round(sampleRate * 0.02);
  const minimumLag = Math.floor(sampleRate / 350);
  const maximumLag = Math.ceil(sampleRate / 90);
  const trace = [];

  for (
    let offset = 0;
    offset + windowSize < samples.length;
    offset += hopSize
  ) {
    let energy = 0;
    for (let index = 0; index < windowSize; index += 1) {
      energy += samples[offset + index] ** 2;
    }
    const rms = Math.sqrt(energy / windowSize);
    if (rms < 0.015) continue;

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

    if (bestCorrelation > 0.45) {
      trace.push({
        hz: sampleRate / bestLag,
        seconds: offset / sampleRate,
      });
    }
  }

  return trace;
}

function median(values) {
  const sorted = [...values].sort((left, right) => left - right);
  return sorted[Math.floor(sorted.length / 2)];
}

function getMoraMedians(trace, moraCount) {
  assert.ok(trace.length >= moraCount, "audio must expose a readable pitch trace");
  const start = trace[0].seconds;
  const end = trace.at(-1).seconds + 0.02;
  const span = end - start;

  return Array.from({ length: moraCount }, (_, index) => {
    const lower = start + span * index / moraCount;
    const upper = start + span * (index + 1) / moraCount;
    const values = trace
      .filter(({ seconds }) => (
        seconds >= lower
        && (index === moraCount - 1 ? seconds <= upper : seconds < upper)
      ))
      .map(({ hz }) => hz);

    assert.ok(values.length > 0, `mora ${index + 1} needs voiced pitch samples`);
    return median(values);
  });
}

function verifyShape(item, medians) {
  const first = medians[0];
  const last = medians.at(-1);
  const peak = Math.max(...medians);
  const peakIndex = medians.indexOf(peak);

  if (item.validationShape === "early-fall") {
    assert.ok(
      first - last >= MIN_PITCH_SEPARATION_HZ,
      `${item.id} must fall after the first mora`,
    );
    return;
  }

  if (item.validationShape === "later-fall") {
    assert.ok(peakIndex > 0, `${item.id} must rise before its pitch fall`);
    assert.ok(
      peak - first >= MIN_PITCH_SEPARATION_HZ,
      `${item.id} must rise into its high section`,
    );
    assert.ok(
      peak - last >= MIN_PITCH_SEPARATION_HZ,
      `${item.id} must fall after its high section`,
    );
    return;
  }

  assert.ok(peakIndex > 0, `${item.id} must rise after its first mora`);
  assert.ok(
    peak - first >= MIN_PITCH_SEPARATION_HZ,
    `${item.id} must expose its low-to-high movement`,
  );
}

const report = [];

for (const item of PITCH_ACCENT_ITEMS) {
  const file = new URL(`public${item.audio}`, root);
  const wave = parsePcmWave(await readFile(file));
  const duration = wave.samples.length / wave.sampleRate;
  assert.ok(duration >= 0.2 && duration <= 1.5, `${item.id} duration is invalid`);

  const medians = getMoraMedians(getPitchTrace(wave), item.morae.length);
  verifyShape(item, medians);
  report.push({
    duration: Number(duration.toFixed(3)),
    file: fileURLToPath(file),
    item: item.id,
    moraPitchHz: medians.map((value) => Math.round(value)),
  });
}

console.table(report);
