import assert from "node:assert/strict";
import test from "node:test";
import {
  isStationId,
  STATION_IDS,
} from "../src/modules/learning/stations.ts";

test("all learning stations are independently addressable", () => {
  assert.deepEqual(STATION_IDS, [
    "vowels",
    "hiragana",
    "kanji",
    "compounds",
    "endings",
    "katakana",
    "sound-marks",
    "combined-sounds",
    "pointing",
    "people",
    "needs",
    "movement",
    "time",
    "actions",
    "descriptions",
    "statements",
    "questions",
    "possession",
    "existence",
    "verbs",
    "tense",
    "negation",
    "adjectives",
    "mora-timing",
    "pitch-accent",
  ]);
  assert.equal(new Set(STATION_IDS).size, STATION_IDS.length);
  for (const stationId of STATION_IDS) assert.equal(isStationId(stationId), true);
  assert.equal(isStationId("not-a-station"), false);
});
