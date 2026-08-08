import assert from "node:assert/strict";
import { execFile as execFileCallback } from "node:child_process";
import { access, mkdtemp, rm } from "node:fs/promises";
import { tmpdir } from "node:os";
import { join } from "node:path";
import { promisify } from "node:util";
import { GRAMMAR_STATIONS } from "../src/modules/learning/grammar.ts";

const execFile = promisify(execFileCallback);
const root = new URL("../", import.meta.url);
const SAMPLE_RATE = 22_050;
const SPEECH_RATE = 175;
const force = process.argv.includes("--force");

assert.equal(process.platform, "darwin", "Kyoko audio generation requires macOS");

const stationsWithAudio = GRAMMAR_STATIONS.filter((station) =>
  station.items.some((item) => item.audio),
);
for (const station of stationsWithAudio) {
  assert.ok(
    station.items.every((item) => item.audio),
    `${station.name} must define audio for every sentence or none of them`,
  );
}

const temporaryDirectory = await mkdtemp(join(tmpdir(), "ling-grammar-audio-"));

try {
  for (const item of stationsWithAudio.flatMap((station) => station.items)) {
    assert.ok(item.audio);
    const destination = new URL(`public${item.audio}`, root);
    if (!force) {
      try {
        await access(destination);
        continue;
      } catch {
        // Generate only missing assets so previously auditioned speech is preserved.
      }
    }

    const aiff = join(temporaryDirectory, `${item.id}.aiff`);
    await execFile("/usr/bin/say", [
      "-v",
      "Kyoko",
      "-r",
      String(SPEECH_RATE),
      "-o",
      aiff,
      item.japanese,
    ]);
    await execFile("/usr/bin/afconvert", [
      "-f",
      "WAVE",
      "-d",
      `LEI16@${SAMPLE_RATE}`,
      aiff,
      destination.pathname,
    ]);
    console.log(`${item.japanese} -> ${destination.pathname}`);
  }
} finally {
  await rm(temporaryDirectory, { force: true, recursive: true });
}
