import assert from "node:assert/strict";
import { execFile as execFileCallback } from "node:child_process";
import {
  mkdtemp,
  readFile,
  rm,
  writeFile,
} from "node:fs/promises";
import { tmpdir } from "node:os";
import { join } from "node:path";
import { promisify } from "node:util";

const execFile = promisify(execFileCallback);
const root = new URL("../", import.meta.url);
const SAMPLE_RATE = 22_050;
const FRAME_SECONDS = 0.005;
const MINIMUM_CLOSURE_SECONDS = 0.02;
const SILENCE_RMS = 0.004;

// A following particle keeps heiban words inside an accent phrase. Cropping at
// its consonant closure preserves the lexical L-H shape without keeping the
// particle. Use a voiced carrier after final high vowels so the carrier does
// not force pedagogically unhelpful devoicing.
const HEIBAN_WORDS_WITH_FINAL_FALL = [
  { file: "ja-vocab-kore.wav", spoken: "これ" },
  { carrier: "で", closureRms: 0.012, file: "ja-vocab-koko.wav", spoken: "ここ" },
  { carrier: "で", closureRms: 0.012, file: "ja-vocab-watashi.wav", spoken: "私" },
  { file: "ja-vocab-namae.wav", spoken: "名前" },
  { file: "ja-vocab-mizu.wav", spoken: "水" },
  { file: "ja-marks-densha.wav", spoken: "電車" },
  { carrier: "が", closureRms: 0.012, file: "ja-vocab-iku.wav", spoken: "行く" },
];

const requestedFiles = new Set(process.argv.slice(2));
const requestedItems = requestedFiles.size === 0
  ? HEIBAN_WORDS_WITH_FINAL_FALL
  : HEIBAN_WORDS_WITH_FINAL_FALL.filter((item) => requestedFiles.has(item.file));
assert.equal(
  requestedItems.length,
  requestedFiles.size === 0 ? HEIBAN_WORDS_WITH_FINAL_FALL.length : requestedFiles.size,
  "unknown vocabulary audio file requested",
);

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

  assert.equal(format, 1, "generated audio must be PCM");
  assert.equal(channels, 1, "generated audio must be mono");
  assert.equal(sampleRate, SAMPLE_RATE);
  assert.equal(bitsPerSample, 16);
  assert.ok(dataOffset > 0 && dataSize > 0, "generated audio needs PCM data");

  const samples = new Int16Array(dataSize / 2);
  for (let index = 0; index < samples.length; index += 1) {
    samples[index] = buffer.readInt16LE(dataOffset + index * 2);
  }
  return samples;
}

function frameRms(samples, start, length) {
  let energy = 0;
  for (let index = start; index < Math.min(start + length, samples.length); index += 1) {
    const sample = samples[index] / 32_768;
    energy += sample * sample;
  }
  return Math.sqrt(energy / length);
}

function findCarrierClosure(samples, silenceRms = SILENCE_RMS) {
  const frameSize = Math.round(SAMPLE_RATE * FRAME_SECONDS);
  const minimumFrames = Math.ceil(MINIMUM_CLOSURE_SECONDS / FRAME_SECONDS);
  const firstFrame = Math.floor(samples.length * 0.4 / frameSize);
  const lastFrame = Math.floor(samples.length * 0.95 / frameSize);
  const quietRuns = [];
  let runStart = null;

  for (let frame = firstFrame; frame <= lastFrame; frame += 1) {
    const quiet = frameRms(samples, frame * frameSize, frameSize) < silenceRms;
    if (quiet && runStart === null) runStart = frame;
    if (!quiet && runStart !== null) {
      if (frame - runStart >= minimumFrames) quietRuns.push([runStart, frame]);
      runStart = null;
    }
  }

  const closure = quietRuns.at(-1);
  assert.ok(closure, "could not find the carrier consonant closure");
  return closure[0] * frameSize;
}

function createWave(samples) {
  const dataSize = samples.length * 2;
  const buffer = Buffer.alloc(44 + dataSize);
  buffer.write("RIFF", 0, "ascii");
  buffer.writeUInt32LE(36 + dataSize, 4);
  buffer.write("WAVEfmt ", 8, "ascii");
  buffer.writeUInt32LE(16, 16);
  buffer.writeUInt16LE(1, 20);
  buffer.writeUInt16LE(1, 22);
  buffer.writeUInt32LE(SAMPLE_RATE, 24);
  buffer.writeUInt32LE(SAMPLE_RATE * 2, 28);
  buffer.writeUInt16LE(2, 32);
  buffer.writeUInt16LE(16, 34);
  buffer.write("data", 36, "ascii");
  buffer.writeUInt32LE(dataSize, 40);
  for (let index = 0; index < samples.length; index += 1) {
    buffer.writeInt16LE(samples[index], 44 + index * 2);
  }
  return buffer;
}

function cropAndFade(samples, end) {
  const cropped = samples.slice(0, end);
  const fadeLength = Math.min(Math.round(SAMPLE_RATE * 0.008), cropped.length);
  for (let offset = 0; offset < fadeLength; offset += 1) {
    const index = cropped.length - fadeLength + offset;
    cropped[index] = Math.round(cropped[index] * (fadeLength - offset) / fadeLength);
  }
  return cropped;
}

assert.equal(process.platform, "darwin", "Kyoko audio generation requires macOS");
const temporaryDirectory = await mkdtemp(join(tmpdir(), "ling-vocabulary-audio-"));

try {
  for (const item of requestedItems) {
    const aiff = join(temporaryDirectory, `${item.file}.aiff`);
    const wave = join(temporaryDirectory, item.file);
    await execFile("/usr/bin/say", [
      "-v",
      "Kyoko",
      "-o",
      aiff,
      `${item.spoken}${item.carrier ?? "と"}`,
    ]);
    await execFile("/usr/bin/afconvert", [
      "-f", "WAVE",
      "-d", `LEI16@${SAMPLE_RATE}`,
      aiff,
      wave,
    ]);

    const samples = parsePcmWave(await readFile(wave));
    const cropped = cropAndFade(
      samples,
      findCarrierClosure(samples, item.closureRms),
    );
    const destination = new URL(`public/audio/${item.file}`, root);
    await writeFile(destination, createWave(cropped));
    console.log(`${item.spoken}: ${(cropped.length / SAMPLE_RATE).toFixed(3)}s -> ${destination.pathname}`);
  }
} finally {
  await rm(temporaryDirectory, { force: true, recursive: true });
}
