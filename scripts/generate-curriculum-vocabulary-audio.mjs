import assert from "node:assert/strict";
import { execFile as execFileCallback } from "node:child_process";
import { access, mkdtemp, rm } from "node:fs/promises";
import { tmpdir } from "node:os";
import { join } from "node:path";
import { promisify } from "node:util";
import { VOCABULARY_STATIONS } from "../src/modules/learning/vocabulary.ts";

const execFile = promisify(execFileCallback);
const root = new URL("../", import.meta.url);
const SAMPLE_RATE = 22_050;

assert.equal(process.platform, "darwin", "Kyoko audio generation requires macOS");
const temporaryDirectory = await mkdtemp(join(tmpdir(), "ling-curriculum-audio-"));

try {
  for (const item of VOCABULARY_STATIONS.flatMap((station) => station.items)) {
    const destination = new URL(`public${item.audio}`, root);
    try {
      await access(destination);
      continue;
    } catch {
      // Generate only missing curriculum assets; reviewed existing audio remains untouched.
    }

    const aiff = join(temporaryDirectory, `${item.id}.aiff`);
    await execFile("/usr/bin/say", ["-v", "Kyoko", "-o", aiff, item.reading]);
    await execFile("/usr/bin/afconvert", [
      "-f", "WAVE",
      "-d", `LEI16@${SAMPLE_RATE}`,
      aiff,
      destination.pathname,
    ]);
    console.log(`${item.word} (${item.reading}) -> ${destination.pathname}`);
  }
} finally {
  await rm(temporaryDirectory, { force: true, recursive: true });
}
