export const STATION_IDS = [
  "vowels",
  "hiragana",
  "characters",
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
] as const;

export type StationId = (typeof STATION_IDS)[number];

export function isStationId(value: string): value is StationId {
  return STATION_IDS.some((stationId) => stationId === value);
}
