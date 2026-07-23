export const VOWEL_HIRAGANA = ["あ", "い", "う", "え", "お"] as const;
export const VOWEL_KATAKANA = ["ア", "イ", "ウ", "エ", "オ"] as const;
export const VOWEL_KANA = [...VOWEL_HIRAGANA, ...VOWEL_KATAKANA] as const;

export type VowelKana = (typeof VOWEL_KANA)[number];

export function isVowelKana(value: unknown): value is VowelKana {
  return typeof value === "string"
    && VOWEL_KANA.some((kana) => kana === value);
}
