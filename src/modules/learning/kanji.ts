import {
  getVocabularyItem,
  type VocabularyItem,
} from "./vocabulary.ts";

export const KANJI_REVIEW_DIRECTIONS = [
  "writing-to-reading",
  "reading-to-writing",
] as const;

export const KANJI_STATION_IDS = [
  "characters",
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

export type KanjiMemoryNote = {
  readonly cue: string;
  readonly relatedItemId?: string;
};

type KanjiStationDefinition = Omit<KanjiStation, "items"> & {
  readonly itemIds: readonly string[];
};

const CHARACTER_ITEM_IDS = [
  "watashi",
  "hito",
  "mizu",
  "eki",
  "kuruma",
  "ima",
  "asa",
  "hiru",
  "yoru",
] as const;

export const CHARACTER_MEMORY_NOTES: Readonly<
  Record<(typeof CHARACTER_ITEM_IDS)[number], KanjiMemoryNote>
> = {
  watashi: {
    cue: "One traditional explanation joins 禾, grain, with 厶, private: grain kept as one's own became a cue for ‘I’ or ‘private.’",
  },
  hito: {
    cue: "The two strokes preserve the side view of a standing person.",
  },
  mizu: {
    cue: "The center stroke and spreading side strokes come from the shape of flowing water.",
  },
  eki: {
    cue: "The left side is 馬, horse. Earlier stations were relay stops where fresh horses were kept.",
  },
  kuruma: {
    cue: "The character began as the shape of a cart, with its axle and wheels.",
    relatedItemId: "densha",
  },
  ima: {
    cue: "今 appears again in 今日, ‘today.’ Keep the shared time meaning, but learn the whole word's reading: いま becomes part of きょう.",
    relatedItemId: "kyou",
  },
  asa: {
    cue: "Its older structure represents the rising sun: the beginning of the day.",
  },
  hiru: {
    cue: "日, sun, remains visible inside the character; its older structure marks the part of the day when the sun is out.",
  },
  yoru: {
    cue: "An older form joined a person with evening: night as the time a person rests.",
  },
};

const KANJI_STATION_DEFINITIONS: readonly KanjiStationDefinition[] = [
  {
    description: [
      "Kanji carry meaning in written Japanese, but you are learning the word rather than a character by itself.",
      "Learn each written word with its Kana reading. The same character can be read differently in another word.",
    ],
    id: "characters",
    itemIds: CHARACTER_ITEM_IDS,
    name: "Characters",
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

export function getKanjiMemoryNote(itemId: string): KanjiMemoryNote | null {
  return Object.hasOwn(CHARACTER_MEMORY_NOTES, itemId)
    ? CHARACTER_MEMORY_NOTES[itemId as keyof typeof CHARACTER_MEMORY_NOTES]
    : null;
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
