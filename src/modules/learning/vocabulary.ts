export const VOCABULARY_STATION_IDS = [
  "words",
  "nouns",
  "verbs",
  "adjectives",
] as const;

export type VocabularyStationId = (typeof VOCABULARY_STATION_IDS)[number];

export type VocabularyItem = {
  readonly audio: `/audio/${string}.wav`;
  readonly group?: "い-adjective" | "な-adjective";
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

export const VOCABULARY_STATIONS = {
  words: {
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
      { audio: "/audio/ja-vocab-ima.wav", id: "ima", meaning: "now", pitchAccent: 2, word: "いま" },
      { audio: "/audio/ja-yoon-hiragana-kyo.wav", id: "kyou", meaning: "today", pitchAccent: 1, word: "きょう" },
    ],
    name: "Words",
  },
  nouns: {
    description: "Nouns name people, places, things, and ideas. Start with concrete words you can recognize without a sentence around them.",
    items: [
      { audio: "/audio/ja-yama.wav", id: "yama", meaning: "mountain", pitchAccent: 2, word: "やま" },
      { audio: "/audio/ja-umi.wav", id: "umi", meaning: "sea", pitchAccent: 1, word: "うみ" },
      { audio: "/audio/ja-hana.wav", id: "hana", meaning: "flower", pitchAccent: 2, word: "はな" },
      { audio: "/audio/ja-tori.wav", id: "tori", meaning: "bird", pitchAccent: 0, word: "とり" },
      { audio: "/audio/ja-fune.wav", id: "fune", meaning: "boat", pitchAccent: 1, word: "ふね" },
      { audio: "/audio/ja-eki.wav", id: "eki", meaning: "station", pitchAccent: 1, word: "えき" },
      { audio: "/audio/ja-heya.wav", id: "heya", meaning: "room", pitchAccent: 2, word: "へや" },
      { audio: "/audio/ja-kaban.wav", id: "kaban", meaning: "bag", pitchAccent: 0, word: "かばん" },
    ],
    name: "Nouns",
  },
  verbs: {
    description: "Verbs express actions and events. These are shown in their plain dictionary form—the form used to identify the verb.",
    items: [
      { audio: "/audio/ja-vocab-iku.wav", id: "iku", meaning: "to go", pitchAccent: 0, word: "いく" },
      { audio: "/audio/ja-vocab-kuru.wav", id: "kuru", meaning: "to come", pitchAccent: 1, word: "くる" },
      { audio: "/audio/ja-vocab-miru.wav", id: "miru", meaning: "to see", pitchAccent: 1, word: "みる" },
      { audio: "/audio/ja-kiku.wav", id: "kiku", meaning: "to listen / ask", pitchAccent: 0, word: "きく" },
      { audio: "/audio/ja-vocab-yomu.wav", id: "yomu", meaning: "to read", pitchAccent: 1, word: "よむ" },
      { audio: "/audio/ja-nomu.wav", id: "nomu", meaning: "to drink", pitchAccent: 1, word: "のむ" },
      { audio: "/audio/ja-vocab-taberu.wav", id: "taberu", meaning: "to eat", pitchAccent: 2, word: "たべる" },
      { audio: "/audio/ja-vocab-hanasu.wav", id: "hanasu", meaning: "to speak", pitchAccent: 2, word: "はなす" },
    ],
    name: "Verbs",
  },
  adjectives: {
    description: "Japanese has two main adjective groups. The label matters because each group connects to a noun and changes form differently.",
    items: [
      { audio: "/audio/ja-vocab-ookii.wav", group: "い-adjective", id: "ookii", meaning: "big", pitchAccent: 3, word: "おおきい" },
      { audio: "/audio/ja-vocab-chiisai.wav", group: "い-adjective", id: "chiisai", meaning: "small", pitchAccent: 3, word: "ちいさい" },
      { audio: "/audio/ja-vocab-atsui.wav", group: "い-adjective", id: "atsui", meaning: "hot", pitchAccent: 2, word: "あつい" },
      { audio: "/audio/ja-vocab-samui.wav", group: "い-adjective", id: "samui", meaning: "cold", pitchAccent: 2, word: "さむい" },
      { audio: "/audio/ja-vocab-yasui.wav", group: "い-adjective", id: "yasui", meaning: "inexpensive", pitchAccent: 2, word: "やすい" },
      { audio: "/audio/ja-vocab-oishii.wav", group: "い-adjective", id: "oishii", meaning: "delicious", pitchAccent: 3, word: "おいしい" },
      { audio: "/audio/ja-vocab-shizuka.wav", group: "な-adjective", id: "shizuka", meaning: "quiet", pitchAccent: 1, word: "しずか" },
      { audio: "/audio/ja-vocab-kirei.wav", group: "な-adjective", id: "kirei", meaning: "clean / beautiful", pitchAccent: 1, word: "きれい" },
    ],
    name: "Adjectives",
  },
} as const satisfies Record<VocabularyStationId, VocabularyStation>;

export function isVocabularyStationId(
  value: unknown,
): value is VocabularyStationId {
  return typeof value === "string"
    && VOCABULARY_STATION_IDS.some((stationId) => stationId === value);
}

export function isVocabularyItemId(
  stationId: VocabularyStationId,
  value: unknown,
): value is string {
  return typeof value === "string"
    && VOCABULARY_STATIONS[stationId].items.some((item) => item.id === value);
}

export function getVocabularyItemIds(
  stationId: VocabularyStationId,
): string[] {
  return VOCABULARY_STATIONS[stationId].items.map((item) => item.id);
}
