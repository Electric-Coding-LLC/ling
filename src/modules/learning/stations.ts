export const STATION_IDS = [
  "kana",
  "hiragana",
  "katakana",
  "sound-marks",
  "combined-sounds",
  "mora-timing",
] as const;

export type StationId = (typeof STATION_IDS)[number];

export const STATION_PREREQUISITES: Partial<
  Record<StationId, readonly StationId[]>
> = {
  hiragana: ["kana"],
  katakana: ["hiragana"],
  "sound-marks": ["katakana"],
  "combined-sounds": ["sound-marks"],
  "mora-timing": ["combined-sounds"],
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

export function retainPrerequisiteCompleteStations(
  candidates: readonly StationId[],
): StationId[] {
  const completed: StationId[] = [];

  for (const stationId of STATION_IDS) {
    if (
      candidates.includes(stationId)
      && isStationAvailable(stationId, completed)
    ) {
      completed.push(stationId);
    }
  }

  return completed;
}
