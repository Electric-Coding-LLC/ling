export const NETWORK_PLACE_IDS = [
  "japanese",
  "romaji",
  "japan",
  "introductions",
  "navigation",
  "food",
  "shopping",
  "help",
  "sound",
  "vowels",
  "mora",
  "pitch",
  "writing",
  "kana",
  "hiragana",
  "katakana",
  "marks",
  "combined",
  "vocabulary",
  "words",
] as const;

export type NetworkPlaceId = (typeof NETWORK_PLACE_IDS)[number];

export const COMPLETABLE_NETWORK_PLACE_IDS = [
  "romaji",
  "vowels",
  "mora",
  "pitch",
  "hiragana",
  "katakana",
  "marks",
  "combined",
  "words",
] as const satisfies readonly NetworkPlaceId[];

export type CompletableNetworkPlaceId =
  (typeof COMPLETABLE_NETWORK_PLACE_IDS)[number];

export const NETWORK_LOCATION_STORAGE_KEY = "ling:network-station-focus";
export const NETWORK_LOCATION_EVENT = "ling:network-station-focus-change";

export function isNetworkPlaceId(value: unknown): value is NetworkPlaceId {
  return typeof value === "string"
    && NETWORK_PLACE_IDS.some((placeId) => placeId === value);
}

export function isCompletableNetworkPlaceId(
  value: unknown,
): value is CompletableNetworkPlaceId {
  return typeof value === "string"
    && COMPLETABLE_NETWORK_PLACE_IDS.some((placeId) => placeId === value);
}
