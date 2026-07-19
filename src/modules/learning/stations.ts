export const STATION_IDS = ["hiragana", "katakana", "mora-timing"] as const;

export type StationId = (typeof STATION_IDS)[number];

export const STATION_PREREQUISITES: Partial<
  Record<StationId, readonly StationId[]>
> = {
  katakana: ["hiragana"],
  "mora-timing": ["hiragana"],
};

export function isStationId(value: string): value is StationId {
  return STATION_IDS.some((stationId) => stationId === value);
}

export function isStationAvailable(
  stationId: StationId,
  introducedStations: readonly StationId[],
): boolean {
  const prerequisites = STATION_PREREQUISITES[stationId] ?? [];
  return prerequisites.every((prerequisite) =>
    introducedStations.includes(prerequisite),
  );
}
