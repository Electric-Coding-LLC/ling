export const BASIC_HIRAGANA = [
  "あ", "い", "う", "え", "お",
  "か", "き", "く", "け", "こ",
  "さ", "し", "す", "せ", "そ",
  "た", "ち", "つ", "て", "と",
  "な", "に", "ぬ", "ね", "の",
  "は", "ひ", "ふ", "へ", "ほ",
  "ま", "み", "む", "め", "も",
  "や", "ゆ", "よ",
  "ら", "り", "る", "れ", "ろ",
  "わ", "を", "ん",
] as const;

export type BasicHiragana = (typeof BASIC_HIRAGANA)[number];

const BASIC_HIRAGANA_SET = new Set<string>(BASIC_HIRAGANA);

export function isBasicHiragana(value: unknown): value is BasicHiragana {
  return typeof value === "string" && BASIC_HIRAGANA_SET.has(value);
}
