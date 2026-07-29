export type PitchLevel = "high" | "low";

export type PitchAccentItem = {
  readonly audio: string;
  readonly id: string;
  readonly meaning: string;
  readonly morae: readonly string[];
  readonly pitch: readonly PitchLevel[];
  readonly sourceEntry: string;
  readonly validationShape: "early-fall" | "later-fall" | "sustained-high";
  readonly word: string;
};

export const PITCH_ACCENT_SOURCE_URL =
  "https://www.gavo.t.u-tokyo.ac.jp/ojad/search";

export const PITCH_ACCENT_ITEMS = [
  {
    audio: "/audio/ja-pitch-ame-candy.wav",
    id: "ame-candy",
    meaning: "candy",
    morae: ["あ", "め"],
    pitch: ["low", "high"],
    sourceEntry: "飴",
    validationShape: "sustained-high",
    word: "あめ",
  },
  {
    audio: "/audio/ja-pitch-sakana.wav",
    id: "sakana",
    meaning: "fish",
    morae: ["さ", "か", "な"],
    pitch: ["low", "high", "high"],
    sourceEntry: "魚",
    validationShape: "sustained-high",
    word: "さかな",
  },
  {
    audio: "/audio/ja-pitch-ame-rain.wav",
    id: "ame-rain",
    meaning: "rain",
    morae: ["あ", "め"],
    pitch: ["high", "low"],
    sourceEntry: "雨",
    validationShape: "early-fall",
    word: "あめ",
  },
  {
    audio: "/audio/ja-pitch-neko.wav",
    id: "neko",
    meaning: "cat",
    morae: ["ね", "こ"],
    pitch: ["high", "low"],
    sourceEntry: "猫",
    validationShape: "early-fall",
    word: "ねこ",
  },
  {
    audio: "/audio/ja-pitch-tamago.wav",
    id: "tamago",
    meaning: "egg",
    morae: ["た", "ま", "ご"],
    pitch: ["low", "high", "low"],
    sourceEntry: "卵",
    validationShape: "later-fall",
    word: "たまご",
  },
  {
    audio: "/audio/ja-pitch-onigiri.wav",
    id: "onigiri",
    meaning: "rice ball",
    morae: ["お", "に", "ぎ", "り"],
    pitch: ["low", "high", "low", "low"],
    sourceEntry: "おにぎり",
    validationShape: "later-fall",
    word: "おにぎり",
  },
] as const satisfies readonly PitchAccentItem[];

export const PITCH_ACCENT_ITEM_IDS = PITCH_ACCENT_ITEMS.map(
  (item) => item.id,
);

export type PitchAccentItemId = (typeof PITCH_ACCENT_ITEMS)[number]["id"];

const PITCH_ACCENT_ITEM_ID_SET = new Set<string>(PITCH_ACCENT_ITEM_IDS);

export function isPitchAccentItemId(
  value: unknown,
): value is PitchAccentItemId {
  return typeof value === "string" && PITCH_ACCENT_ITEM_ID_SET.has(value);
}
