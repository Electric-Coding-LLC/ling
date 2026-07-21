import assert from "node:assert/strict";
import test from "node:test";
import {
  retainPrerequisiteCompleteStations,
  STATION_IDS,
} from "../src/modules/learning/stations.ts";

test("station completion follows the prerequisite chain", () => {
  assert.deepEqual(
    retainPrerequisiteCompleteStations(STATION_IDS),
    STATION_IDS,
  );

  assert.deepEqual(
    retainPrerequisiteCompleteStations([
      "mora-timing",
      "combined-sounds",
      "katakana",
      "hiragana",
      "kana",
    ]),
    ["kana", "hiragana", "katakana"],
  );

  assert.deepEqual(
    retainPrerequisiteCompleteStations([
      "mora-timing",
      "combined-sounds",
      "sound-marks",
      "katakana",
      "kana",
    ]),
    ["kana"],
  );
});
