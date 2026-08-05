export const STATION_IDS = [
  "vowels",
  "hiragana",
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
  "mora-timing",
  "pitch-accent",
] as const;

export type StationId = (typeof STATION_IDS)[number];

export function isStationId(value: string): value is StationId {
  return STATION_IDS.some((stationId) => stationId === value);
}
