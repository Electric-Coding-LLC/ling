export const STATION_IDS = [
  "kana",
  "hiragana",
  "katakana",
  "kana-extensions",
  "mora-timing",
] as const;

export type StationId = (typeof STATION_IDS)[number];

export const STATION_PREREQUISITES: Partial<
  Record<StationId, readonly StationId[]>
> = {
  hiragana: ["kana"],
  katakana: ["hiragana"],
  "kana-extensions": ["katakana"],
  "mora-timing": ["kana-extensions"],
};

export function isStationId(value: string): value is StationId {
  return STATION_IDS.some((stationId) => stationId === value);
}

export function isStationAvailable(
  stationId: StationId,
  completedStations: readonly StationId[],
): boolean {
  const prerequisites = STATION_PREREQUISITES[stationId] ?? [];
  return prerequisites.every((prerequisite) =>
    completedStations.includes(prerequisite),
  );
}
