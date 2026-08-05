export const VOCABULARY_REVIEW_DIRECTIONS = [
  "meaning-to-japanese",
  "japanese-to-meaning",
] as const;

export const VOCABULARY_STATION_IDS = [
  "pointing",
  "people",
  "needs",
  "movement",
  "time",
  "actions",
  "descriptions",
] as const;

export type VocabularyReviewDirection =
  (typeof VOCABULARY_REVIEW_DIRECTIONS)[number];

export type VocabularyStationId = (typeof VOCABULARY_STATION_IDS)[number];

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
  /** Kana used for pronunciation, mora timing, and Rōmaji. */
  readonly reading: string;
  /** The form learners encounter in Japanese, including Kanji where appropriate. */
  readonly word: string;
};

export type VocabularyStation = {
  readonly description: string;
  readonly id: VocabularyStationId;
  readonly items: readonly VocabularyItem[];
  readonly name: string;
};

export const VOCABULARY_STATIONS: readonly VocabularyStation[] = [
  {
    description: "Locate things, ask what something is, and point out where it is.",
    id: "pointing",
    items: [
      { audio: "/audio/ja-vocab-kore.wav", id: "kore", meaning: "this", pitchAccent: 0, reading: "これ", word: "これ" },
      { audio: "/audio/ja-vocab-sore.wav", id: "sore", meaning: "that", pitchAccent: 0, reading: "それ", word: "それ" },
      { audio: "/audio/ja-vocab-are.wav", id: "are", meaning: "that over there", pitchAccent: 0, reading: "あれ", word: "あれ" },
      { audio: "/audio/ja-vocab-koko.wav", id: "koko", meaning: "here", pitchAccent: 0, reading: "ここ", word: "ここ" },
      { audio: "/audio/ja-vocab-soko.wav", id: "soko", meaning: "there", pitchAccent: 0, reading: "そこ", word: "そこ" },
      { audio: "/audio/ja-vocab-asoko.wav", id: "asoko", meaning: "over there", pitchAccent: 0, reading: "あそこ", word: "あそこ" },
      { audio: "/audio/ja-vocab-doko.wav", id: "doko", meaning: "where", pitchAccent: 1, reading: "どこ", word: "どこ" },
      { audio: "/audio/ja-vocab-nani.wav", id: "nani", meaning: "what", pitchAccent: 1, reading: "なに", word: "なに" },
    ],
    name: "Pointing",
  },
  {
    description: "Refer to yourself and the people you are most likely to talk about.",
    id: "people",
    items: [
      { audio: "/audio/ja-vocab-watashi.wav", id: "watashi", meaning: "I / me", pitchAccent: 0, reading: "わたし", word: "私" },
      { audio: "/audio/ja-vocab-namae.wav", id: "namae", meaning: "name", pitchAccent: 0, reading: "なまえ", word: "名前" },
      { audio: "/audio/ja-hito.wav", id: "hito", meaning: "person", pitchAccent: 0, reading: "ひと", word: "人" },
      { audio: "/audio/ja-vocab-tomodachi.wav", id: "tomodachi", meaning: "friend", pitchAccent: 0, reading: "ともだち", word: "友達" },
      { audio: "/audio/ja-vocab-kazoku.wav", id: "kazoku", meaning: "family", pitchAccent: 1, reading: "かぞく", word: "家族" },
      { audio: "/audio/ja-vocab-sensei.wav", id: "sensei", meaning: "teacher", pitchAccent: 3, reading: "せんせい", word: "先生" },
      { audio: "/audio/ja-vocab-kodomo.wav", id: "kodomo", meaning: "child", pitchAccent: 0, reading: "こども", word: "子ども" },
    ],
    name: "People",
  },
  {
    description: "Name immediate needs and everyday things you may ask for.",
    id: "needs",
    items: [
      { audio: "/audio/ja-vocab-mizu.wav", id: "mizu", meaning: "water", pitchAccent: 0, reading: "みず", word: "水" },
      { audio: "/audio/ja-vocab-tabemono.wav", id: "tabemono", meaning: "food", pitchAccent: 2, reading: "たべもの", word: "食べ物" },
      { audio: "/audio/ja-vocab-toire.wav", id: "toire", meaning: "toilet", pitchAccent: 1, reading: "トイレ", word: "トイレ" },
      { audio: "/audio/ja-vocab-ocha.wav", id: "ocha", meaning: "tea", pitchAccent: 0, reading: "おちゃ", word: "お茶" },
      { audio: "/audio/ja-vocab-koohii.wav", id: "koohii", meaning: "coffee", pitchAccent: 3, reading: "コーヒー", word: "コーヒー" },
      { audio: "/audio/ja-katakana-pan.wav", id: "pan", meaning: "bread", pitchAccent: 1, reading: "パン", word: "パン" },
      { audio: "/audio/ja-marks-gohan.wav", id: "gohan", meaning: "rice / meal", pitchAccent: 1, reading: "ごはん", word: "ご飯" },
    ],
    name: "Needs",
  },
  {
    description: "Talk about going somewhere and the transport that gets you there.",
    id: "movement",
    items: [
      { audio: "/audio/ja-eki.wav", id: "eki", meaning: "station", pitchAccent: 1, reading: "えき", word: "駅" },
      { audio: "/audio/ja-marks-densha.wav", id: "densha", meaning: "train", pitchAccent: 0, reading: "でんしゃ", word: "電車" },
      { audio: "/audio/ja-vocab-iku.wav", id: "iku", meaning: "to go", pitchAccent: 0, reading: "いく", word: "行く" },
      { audio: "/audio/ja-marks-basu.wav", id: "basu", meaning: "bus", pitchAccent: 1, reading: "バス", word: "バス" },
      { audio: "/audio/ja-vocab-kuruma.wav", id: "kuruma", meaning: "car", pitchAccent: 0, reading: "くるま", word: "車" },
      { audio: "/audio/ja-katakana-takushii.wav", id: "takushii", meaning: "taxi", pitchAccent: 1, reading: "タクシー", word: "タクシー" },
      { audio: "/audio/ja-vocab-chikatetsu.wav", id: "chikatetsu", meaning: "subway", pitchAccent: 0, reading: "ちかてつ", word: "地下鉄" },
    ],
    name: "Movement",
  },
  {
    description: "Place events in the present, the day, and the surrounding days.",
    id: "time",
    items: [
      { audio: "/audio/ja-vocab-ima.wav", id: "ima", meaning: "now", pitchAccent: 1, reading: "いま", word: "今" },
      { audio: "/audio/ja-yoon-hiragana-kyo.wav", id: "kyou", meaning: "today", pitchAccent: 1, reading: "きょう", word: "今日" },
      { audio: "/audio/ja-vocab-ashita.wav", id: "ashita", meaning: "tomorrow", pitchAccent: 3, reading: "あした", word: "明日" },
      { audio: "/audio/ja-vocab-kinou.wav", id: "kinou", meaning: "yesterday", pitchAccent: 2, reading: "きのう", word: "昨日" },
      { audio: "/audio/ja-asa.wav", id: "asa", meaning: "morning", pitchAccent: 1, reading: "あさ", word: "朝" },
      { audio: "/audio/ja-vocab-hiru.wav", id: "hiru", meaning: "daytime / noon", pitchAccent: 2, reading: "ひる", word: "昼" },
      { audio: "/audio/ja-yoru.wav", id: "yoru", meaning: "night", pitchAccent: 1, reading: "よる", word: "夜" },
      { audio: "/audio/ja-marks-jikan.wav", id: "jikan", meaning: "time", pitchAccent: 0, reading: "じかん", word: "時間" },
    ],
    name: "Time",
  },
  {
    description: "Recognize common actions that make simple requests and statements possible.",
    id: "actions",
    items: [
      { audio: "/audio/ja-vocab-taberu.wav", id: "taberu", meaning: "to eat", pitchAccent: 2, reading: "たべる", word: "食べる" },
      { audio: "/audio/ja-vocab-nomu.wav", id: "nomu", meaning: "to drink", pitchAccent: 1, reading: "のむ", word: "飲む" },
      { audio: "/audio/ja-vocab-miru.wav", id: "miru", meaning: "to see / watch", pitchAccent: 1, reading: "みる", word: "見る" },
      { audio: "/audio/ja-vocab-kiku.wav", id: "kiku", meaning: "to listen / ask", pitchAccent: 0, reading: "きく", word: "聞く" },
      { audio: "/audio/ja-vocab-hanasu.wav", id: "hanasu", meaning: "to speak", pitchAccent: 2, reading: "はなす", word: "話す" },
      { audio: "/audio/ja-vocab-kau.wav", id: "kau", meaning: "to buy", pitchAccent: 0, reading: "かう", word: "買う" },
      { audio: "/audio/ja-vocab-matsu.wav", id: "matsu", meaning: "to wait", pitchAccent: 1, reading: "まつ", word: "待つ" },
    ],
    name: "Actions",
  },
  {
    description: "Describe basic qualities, conditions, and prices.",
    id: "descriptions",
    items: [
      { audio: "/audio/ja-vocab-ii.wav", id: "ii", meaning: "good", pitchAccent: 1, reading: "いい", word: "いい" },
      { audio: "/audio/ja-vocab-ookii.wav", id: "ookii", meaning: "big", pitchAccent: 3, reading: "おおきい", word: "大きい" },
      { audio: "/audio/ja-vocab-chiisai.wav", id: "chiisai", meaning: "small", pitchAccent: 3, reading: "ちいさい", word: "小さい" },
      { audio: "/audio/ja-vocab-atsui.wav", id: "atsui", meaning: "hot", pitchAccent: 2, reading: "あつい", word: "暑い" },
      { audio: "/audio/ja-vocab-samui.wav", id: "samui", meaning: "cold", pitchAccent: 2, reading: "さむい", word: "寒い" },
      { audio: "/audio/ja-vocab-takai.wav", id: "takai", meaning: "expensive / high", pitchAccent: 2, reading: "たかい", word: "高い" },
      { audio: "/audio/ja-vocab-yasui.wav", id: "yasui", meaning: "inexpensive", pitchAccent: 2, reading: "やすい", word: "安い" },
    ],
    name: "Descriptions",
  },
] as const;

/** The original Words corpus remains the pronunciation regression set. */
export const PRONUNCIATION_VOCABULARY_ITEMS = [
  "kore", "koko", "doko", "nani", "watashi", "namae", "hito", "mizu",
  "tabemono", "toire", "eki", "densha", "iku", "ima", "kyou",
].map((id) => getVocabularyItem(id));

export function getVocabularyStation(id: VocabularyStationId): VocabularyStation {
  const station = VOCABULARY_STATIONS.find((candidate) => candidate.id === id);
  if (!station) throw new Error(`Unknown vocabulary station: ${id}`);
  return station;
}

export function getVocabularyItem(id: string): VocabularyItem {
  const item = VOCABULARY_STATIONS.flatMap((station) => station.items)
    .find((candidate) => candidate.id === id);
  if (!item) throw new Error(`Unknown vocabulary item: ${id}`);
  return item;
}

export function isVocabularyStationId(value: unknown): value is VocabularyStationId {
  return typeof value === "string"
    && VOCABULARY_STATION_IDS.some((stationId) => stationId === value);
}

export function isVocabularyItemId(value: unknown): value is string {
  return typeof value === "string"
    && VOCABULARY_STATIONS.some((station) =>
      station.items.some((item) => item.id === value),
    );
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

export function getVocabularyItemIds(stationId?: VocabularyStationId): string[] {
  const stations = stationId
    ? [getVocabularyStation(stationId)]
    : VOCABULARY_STATIONS;
  return stations.flatMap((station) => station.items.map((item) => item.id));
}
