export const VOCABULARY_REVIEW_DIRECTIONS = [
  "meaning-to-japanese",
  "japanese-to-meaning",
] as const;

export type VocabularyReviewDirection =
  (typeof VOCABULARY_REVIEW_DIRECTIONS)[number];

export type VocabularyKnowledge = {
  readonly direction: VocabularyReviewDirection;
  readonly itemId: string;
};

export type VocabularyItem = {
  readonly audio: `/audio/${string}.wav`;
  readonly id: string;
  readonly meaning: string;
  /** Standard Tokyo accent drop after this mora; 0 means no drop. */
  readonly pitchAccent: number;
  readonly word: string;
};

export type VocabularyStation = {
  readonly description: string;
  readonly items: readonly VocabularyItem[];
  readonly name: string;
};

export const WORDS_STATION = {
  description: "Start with words for finding your way, identifying people and things, and meeting immediate needs.",
  items: [
    { audio: "/audio/ja-vocab-kore.wav", id: "kore", meaning: "this", pitchAccent: 0, word: "これ" },
    { audio: "/audio/ja-vocab-koko.wav", id: "koko", meaning: "here", pitchAccent: 0, word: "ここ" },
    { audio: "/audio/ja-vocab-doko.wav", id: "doko", meaning: "where", pitchAccent: 1, word: "どこ" },
    { audio: "/audio/ja-vocab-nani.wav", id: "nani", meaning: "what", pitchAccent: 1, word: "なに" },
    { audio: "/audio/ja-vocab-watashi.wav", id: "watashi", meaning: "I / me", pitchAccent: 0, word: "わたし" },
    { audio: "/audio/ja-vocab-namae.wav", id: "namae", meaning: "name", pitchAccent: 0, word: "なまえ" },
    { audio: "/audio/ja-hito.wav", id: "hito", meaning: "person", pitchAccent: 0, word: "ひと" },
    { audio: "/audio/ja-vocab-mizu.wav", id: "mizu", meaning: "water", pitchAccent: 0, word: "みず" },
    { audio: "/audio/ja-vocab-tabemono.wav", id: "tabemono", meaning: "food", pitchAccent: 2, word: "たべもの" },
    { audio: "/audio/ja-vocab-toire.wav", id: "toire", meaning: "toilet", pitchAccent: 1, word: "トイレ" },
    { audio: "/audio/ja-eki.wav", id: "eki", meaning: "station", pitchAccent: 1, word: "えき" },
    { audio: "/audio/ja-marks-densha.wav", id: "densha", meaning: "train", pitchAccent: 0, word: "でんしゃ" },
    { audio: "/audio/ja-vocab-iku.wav", id: "iku", meaning: "to go", pitchAccent: 0, word: "いく" },
    { audio: "/audio/ja-vocab-ima.wav", id: "ima", meaning: "now", pitchAccent: 1, word: "いま" },
    { audio: "/audio/ja-yoon-hiragana-kyo.wav", id: "kyou", meaning: "today", pitchAccent: 1, word: "きょう" },
  ],
  name: "Words",
} as const satisfies VocabularyStation;

export function isVocabularyItemId(value: unknown): value is string {
  return typeof value === "string"
    && WORDS_STATION.items.some((item) => item.id === value);
}

export function isVocabularyReviewDirection(
  value: unknown,
): value is VocabularyReviewDirection {
  return typeof value === "string"
    && VOCABULARY_REVIEW_DIRECTIONS.some((direction) => direction === value);
}

export function isVocabularyKnowledge(
  value: unknown,
): value is VocabularyKnowledge {
  if (!value || typeof value !== "object") return false;
  const candidate = value as { direction?: unknown; itemId?: unknown };
  return isVocabularyItemId(candidate.itemId)
    && isVocabularyReviewDirection(candidate.direction);
}

export function getVocabularyItemIds(): string[] {
  return WORDS_STATION.items.map((item) => item.id);
}
