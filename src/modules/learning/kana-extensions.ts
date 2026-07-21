export const KANA_EXTENSION_PATTERN_IDS = [
  "dakuten-k",
  "dakuten-s",
  "dakuten-t",
  "dakuten-h",
  "handakuten-h",
  "small-kya",
  "small-shu",
  "small-cho",
  "small-nyu",
  "small-ryo",
  "small-tsu",
  "long-vowel",
] as const;

export type KanaExtensionPatternId = (typeof KANA_EXTENSION_PATTERN_IDS)[number];

const KANA_EXTENSION_PATTERN_ID_SET = new Set<string>(KANA_EXTENSION_PATTERN_IDS);

export function isKanaExtensionPatternId(
  value: unknown,
): value is KanaExtensionPatternId {
  return typeof value === "string" && KANA_EXTENSION_PATTERN_ID_SET.has(value);
}
