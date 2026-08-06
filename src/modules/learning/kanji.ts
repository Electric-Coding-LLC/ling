import {
  getVocabularyItem,
  type VocabularyItem,
} from "./vocabulary.ts";

export const KANJI_REVIEW_DIRECTIONS = [
  "writing-to-reading",
  "reading-to-writing",
] as const;

export const KANJI_STATION_IDS = [
  "kanji",
  "compounds",
  "endings",
] as const;

export type KanjiReviewDirection =
  (typeof KANJI_REVIEW_DIRECTIONS)[number];

export type KanjiStationId = (typeof KANJI_STATION_IDS)[number];

export type KanjiKnowledge = {
  readonly direction: KanjiReviewDirection;
  readonly itemId: string;
};

export type KanjiStation = {
  readonly description: readonly string[];
  readonly id: KanjiStationId;
  readonly items: readonly VocabularyItem[];
  readonly name: string;
};

type KanjiStationDefinition = Omit<KanjiStation, "items"> & {
  readonly itemIds: readonly string[];
};

const KANJI_STATION_DEFINITIONS: readonly KanjiStationDefinition[] = [
  {
    description: [
      "Kanji carry meaning in written Japanese, but you are learning the word rather than a character by itself.",
      "Learn each written word with its Kana reading. The same character can be read differently in another word.",
    ],
    id: "kanji",
    itemIds: ["watashi", "hito", "mizu", "eki", "kuruma", "ima", "asa", "hiru", "yoru"],
    name: "Kanji",
  },
  {
    description: [
      "Kanji often combine to write one word.",
      "Learn the combination as a complete word rather than trying to assemble its reading from isolated characters.",
    ],
    id: "compounds",
    itemIds: ["namae", "tomodachi", "kazoku", "sensei", "densha", "chikatetsu", "kyou", "ashita", "kinou", "jikan"],
    name: "Compounds",
  },
  {
    description: [
      "Many verbs and adjectives combine a Kanji core with a Kana ending.",
      "Read both parts as one word. Later, grammar can change the Kana ending while the written core stays recognizable.",
    ],
    id: "endings",
    itemIds: [
      "tabemono", "iku", "taberu", "nomu", "miru", "kiku", "hanasu", "kau", "matsu",
      "ookii", "chiisai", "atsui", "samui", "takai", "yasui",
    ],
    name: "Endings",
  },
] as const;

export const KANJI_STATIONS: readonly KanjiStation[] =
  KANJI_STATION_DEFINITIONS.map((station) => ({
    description: station.description,
    id: station.id,
    items: station.itemIds.map(getVocabularyItem),
    name: station.name,
  }));

export function getKanjiStation(id: KanjiStationId): KanjiStation {
  const station = KANJI_STATIONS.find((candidate) => candidate.id === id);
  if (!station) throw new Error(`Unknown Kanji station: ${id}`);
  return station;
}

export function getKanjiItemIds(stationId?: KanjiStationId): string[] {
  const stations = stationId ? [getKanjiStation(stationId)] : KANJI_STATIONS;
  return stations.flatMap((station) => station.items.map((item) => item.id));
}

export function isKanjiStationId(value: unknown): value is KanjiStationId {
  return typeof value === "string"
    && KANJI_STATION_IDS.some((stationId) => stationId === value);
}

export function isKanjiItemId(value: unknown): value is string {
  return typeof value === "string" && getKanjiItemIds().includes(value);
}

export function isKanjiReviewDirection(
  value: unknown,
): value is KanjiReviewDirection {
  return typeof value === "string"
    && KANJI_REVIEW_DIRECTIONS.some((direction) => direction === value);
}

export function isKanjiKnowledge(value: unknown): value is KanjiKnowledge {
  if (!value || typeof value !== "object") return false;
  const candidate = value as { direction?: unknown; itemId?: unknown };
  return isKanjiItemId(candidate.itemId)
    && isKanjiReviewDirection(candidate.direction);
}
