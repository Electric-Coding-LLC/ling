export const BASIC_KATAKANA = [
  "ア", "イ", "ウ", "エ", "オ",
  "カ", "キ", "ク", "ケ", "コ",
  "サ", "シ", "ス", "セ", "ソ",
  "タ", "チ", "ツ", "テ", "ト",
  "ナ", "ニ", "ヌ", "ネ", "ノ",
  "ハ", "ヒ", "フ", "ヘ", "ホ",
  "マ", "ミ", "ム", "メ", "モ",
  "ヤ", "ユ", "ヨ",
  "ラ", "リ", "ル", "レ", "ロ",
  "ワ", "ヲ", "ン",
] as const;

export type BasicKatakana = (typeof BASIC_KATAKANA)[number];

const BASIC_KATAKANA_SET = new Set<string>(BASIC_KATAKANA);

export function isBasicKatakana(value: unknown): value is BasicKatakana {
  return typeof value === "string" && BASIC_KATAKANA_SET.has(value);
}
