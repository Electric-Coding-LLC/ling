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
  readonly word: string;
};

export type VocabularyStation = {
  readonly description: string;
  readonly items: readonly VocabularyItem[];
  readonly name: string;
};

export const VOCABULARY_STATIONS = {
  words: {
    description: "Learn the meaning and sound before studying what the voice does inside them.",
    items: [
      { audio: "/audio/ja-pitch-ame-candy.wav", id: "ame-candy", meaning: "candy", word: "あめ" },
      { audio: "/audio/ja-pitch-ame-rain.wav", id: "ame-rain", meaning: "rain", word: "あめ" },
      { audio: "/audio/ja-sakana.wav", id: "sakana", meaning: "fish", word: "さかな" },
      { audio: "/audio/ja-neko.wav", id: "neko", meaning: "cat", word: "ねこ" },
      { audio: "/audio/ja-pitch-tamago.wav", id: "tamago", meaning: "egg", word: "たまご" },
      { audio: "/audio/ja-pitch-onigiri.wav", id: "onigiri", meaning: "rice ball", word: "おにぎり" },
      { audio: "/audio/ja-katakana-pan.wav", id: "pan", meaning: "bread", word: "パン" },
      { audio: "/audio/ja-yoon-hiragana-sha.wav", id: "shashin", meaning: "photograph", word: "しゃしん" },
      { audio: "/audio/ja-yoon-hiragana-kyo.wav", id: "kyou", meaning: "today", word: "きょう" },
      { audio: "/audio/ja-kitte.wav", id: "kitte", meaning: "stamp", word: "きって" },
      { audio: "/audio/ja-katakana-robotto.wav", id: "robotto", meaning: "robot", word: "ロボット" },
      { audio: "/audio/ja-keeki.wav", id: "keeki", meaning: "cake", word: "ケーキ" },
      { audio: "/audio/ja-katakana-suupu.wav", id: "suupu", meaning: "soup", word: "スープ" },
    ],
    name: "Words",
  },
  nouns: {
    description: "Nouns name people, places, things, and ideas. Start with concrete words you can recognize without a sentence around them.",
    items: [
      { audio: "/audio/ja-yama.wav", id: "yama", meaning: "mountain", word: "やま" },
      { audio: "/audio/ja-umi.wav", id: "umi", meaning: "sea", word: "うみ" },
      { audio: "/audio/ja-hana.wav", id: "hana", meaning: "flower", word: "はな" },
      { audio: "/audio/ja-tori.wav", id: "tori", meaning: "bird", word: "とり" },
      { audio: "/audio/ja-fune.wav", id: "fune", meaning: "boat", word: "ふね" },
      { audio: "/audio/ja-eki.wav", id: "eki", meaning: "station", word: "えき" },
      { audio: "/audio/ja-heya.wav", id: "heya", meaning: "room", word: "へや" },
      { audio: "/audio/ja-kaban.wav", id: "kaban", meaning: "bag", word: "かばん" },
    ],
    name: "Nouns",
  },
  verbs: {
    description: "Verbs express actions and events. These are shown in their plain dictionary form—the form used to identify the verb.",
    items: [
      { audio: "/audio/ja-vocab-iku.wav", id: "iku", meaning: "to go", word: "いく" },
      { audio: "/audio/ja-vocab-kuru.wav", id: "kuru", meaning: "to come", word: "くる" },
      { audio: "/audio/ja-vocab-miru.wav", id: "miru", meaning: "to see", word: "みる" },
      { audio: "/audio/ja-kiku.wav", id: "kiku", meaning: "to listen / ask", word: "きく" },
      { audio: "/audio/ja-vocab-yomu.wav", id: "yomu", meaning: "to read", word: "よむ" },
      { audio: "/audio/ja-nomu.wav", id: "nomu", meaning: "to drink", word: "のむ" },
      { audio: "/audio/ja-vocab-taberu.wav", id: "taberu", meaning: "to eat", word: "たべる" },
      { audio: "/audio/ja-vocab-hanasu.wav", id: "hanasu", meaning: "to speak", word: "はなす" },
    ],
    name: "Verbs",
  },
  adjectives: {
    description: "Japanese has two main adjective groups. The label matters because each group connects to a noun and changes form differently.",
    items: [
      { audio: "/audio/ja-vocab-ookii.wav", group: "い-adjective", id: "ookii", meaning: "big", word: "おおきい" },
      { audio: "/audio/ja-vocab-chiisai.wav", group: "い-adjective", id: "chiisai", meaning: "small", word: "ちいさい" },
      { audio: "/audio/ja-vocab-atsui.wav", group: "い-adjective", id: "atsui", meaning: "hot", word: "あつい" },
      { audio: "/audio/ja-vocab-samui.wav", group: "い-adjective", id: "samui", meaning: "cold", word: "さむい" },
      { audio: "/audio/ja-vocab-yasui.wav", group: "い-adjective", id: "yasui", meaning: "inexpensive", word: "やすい" },
      { audio: "/audio/ja-vocab-oishii.wav", group: "い-adjective", id: "oishii", meaning: "delicious", word: "おいしい" },
      { audio: "/audio/ja-vocab-shizuka.wav", group: "な-adjective", id: "shizuka", meaning: "quiet", word: "しずか" },
      { audio: "/audio/ja-vocab-kirei.wav", group: "な-adjective", id: "kirei", meaning: "clean / beautiful", word: "きれい" },
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
