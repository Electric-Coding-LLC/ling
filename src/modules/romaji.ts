export const BASIC_ROMAJI_KANA = [
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

export const COMBINED_ROMAJI_KANA = [
  "きゃ", "きゅ", "きょ",
  "しゃ", "しゅ", "しょ",
  "ちゃ", "ちゅ", "ちょ",
  "にゃ", "にゅ", "にょ",
  "ひゃ", "ひゅ", "ひょ",
  "みゃ", "みゅ", "みょ",
  "りゃ", "りゅ", "りょ",
  "ぎゃ", "ぎゅ", "ぎょ",
  "じゃ", "じゅ", "じょ",
  "びゃ", "びゅ", "びょ",
  "ぴゃ", "ぴゅ", "ぴょ",
] as const;

export const ROMAJI_KANA = [
  ...BASIC_ROMAJI_KANA,
  ...COMBINED_ROMAJI_KANA,
] as const;

export type RomajiKana = (typeof ROMAJI_KANA)[number];

const ROMAJI_KANA_SET = new Set<string>(ROMAJI_KANA);

export function isRomajiKana(value: unknown): value is RomajiKana {
  return typeof value === "string" && ROMAJI_KANA_SET.has(value);
}

export type RomajiEntry = {
  readonly audio: `/audio/${string}.wav`;
  readonly kana: RomajiKana;
  readonly romaji: string;
};

export type RomajiRule = {
  readonly examples: readonly {
    readonly audio: `/audio/${string}.wav`;
    readonly romaji: string;
  }[];
  readonly id: string;
  readonly note: string;
  readonly title: string;
};

export const ROMAJI_COLUMN_HEADINGS = ["ah", "ee", "oo", "eh", "oh"] as const;

export const ROMAJI_ROWS: readonly (readonly (RomajiEntry | null)[])[] = [
  [
    { audio: "/audio/ja-a.wav", kana: "あ", romaji: "a" },
    { audio: "/audio/ja-i.wav", kana: "い", romaji: "i" },
    { audio: "/audio/ja-u.wav", kana: "う", romaji: "u" },
    { audio: "/audio/ja-e.wav", kana: "え", romaji: "e" },
    { audio: "/audio/ja-o.wav", kana: "お", romaji: "o" },
  ],
  [
    { audio: "/audio/ja-ka.wav", kana: "か", romaji: "ka" },
    { audio: "/audio/ja-ki.wav", kana: "き", romaji: "ki" },
    { audio: "/audio/ja-ku.wav", kana: "く", romaji: "ku" },
    { audio: "/audio/ja-ke.wav", kana: "け", romaji: "ke" },
    { audio: "/audio/ja-ko.wav", kana: "こ", romaji: "ko" },
  ],
  [
    { audio: "/audio/ja-sa.wav", kana: "さ", romaji: "sa" },
    { audio: "/audio/ja-shi.wav", kana: "し", romaji: "shi" },
    { audio: "/audio/ja-su.wav", kana: "す", romaji: "su" },
    { audio: "/audio/ja-se.wav", kana: "せ", romaji: "se" },
    { audio: "/audio/ja-so.wav", kana: "そ", romaji: "so" },
  ],
  [
    { audio: "/audio/ja-ta.wav", kana: "た", romaji: "ta" },
    { audio: "/audio/ja-chi.wav", kana: "ち", romaji: "chi" },
    { audio: "/audio/ja-tsu.wav", kana: "つ", romaji: "tsu" },
    { audio: "/audio/ja-te.wav", kana: "て", romaji: "te" },
    { audio: "/audio/ja-to.wav", kana: "と", romaji: "to" },
  ],
  [
    { audio: "/audio/ja-na.wav", kana: "な", romaji: "na" },
    { audio: "/audio/ja-ni.wav", kana: "に", romaji: "ni" },
    { audio: "/audio/ja-nu.wav", kana: "ぬ", romaji: "nu" },
    { audio: "/audio/ja-ne.wav", kana: "ね", romaji: "ne" },
    { audio: "/audio/ja-no.wav", kana: "の", romaji: "no" },
  ],
  [
    { audio: "/audio/ja-ha.wav", kana: "は", romaji: "ha" },
    { audio: "/audio/ja-hi.wav", kana: "ひ", romaji: "hi" },
    { audio: "/audio/ja-fu.wav", kana: "ふ", romaji: "fu" },
    { audio: "/audio/ja-he.wav", kana: "へ", romaji: "he" },
    { audio: "/audio/ja-ho.wav", kana: "ほ", romaji: "ho" },
  ],
  [
    { audio: "/audio/ja-ma.wav", kana: "ま", romaji: "ma" },
    { audio: "/audio/ja-mi.wav", kana: "み", romaji: "mi" },
    { audio: "/audio/ja-mu.wav", kana: "む", romaji: "mu" },
    { audio: "/audio/ja-me.wav", kana: "め", romaji: "me" },
    { audio: "/audio/ja-mo.wav", kana: "も", romaji: "mo" },
  ],
  [
    { audio: "/audio/ja-ya.wav", kana: "や", romaji: "ya" },
    null,
    { audio: "/audio/ja-yu.wav", kana: "ゆ", romaji: "yu" },
    null,
    { audio: "/audio/ja-yo.wav", kana: "よ", romaji: "yo" },
  ],
  [
    { audio: "/audio/ja-ra.wav", kana: "ら", romaji: "ra" },
    { audio: "/audio/ja-ri.wav", kana: "り", romaji: "ri" },
    { audio: "/audio/ja-ru.wav", kana: "る", romaji: "ru" },
    { audio: "/audio/ja-re.wav", kana: "れ", romaji: "re" },
    { audio: "/audio/ja-ro.wav", kana: "ろ", romaji: "ro" },
  ],
  [
    { audio: "/audio/ja-wa.wav", kana: "わ", romaji: "wa" },
    null,
    null,
    null,
    { audio: "/audio/ja-wo.wav", kana: "を", romaji: "o" },
  ],
] as const;

export const FINAL_ROMAJI: RomajiEntry = {
  audio: "/audio/ja-n.wav",
  kana: "ん",
  romaji: "n",
};

export const ROMAJI_COMBINED_ROWS: readonly (readonly (RomajiEntry | null)[])[] = [
  [
    { audio: "/audio/ja-yoon-kya.wav", kana: "きゃ", romaji: "kya" },
    null,
    { audio: "/audio/ja-yoon-kyu.wav", kana: "きゅ", romaji: "kyu" },
    null,
    { audio: "/audio/ja-yoon-kyo.wav", kana: "きょ", romaji: "kyo" },
  ],
  [
    { audio: "/audio/ja-yoon-sha.wav", kana: "しゃ", romaji: "sha" },
    null,
    { audio: "/audio/ja-yoon-shu.wav", kana: "しゅ", romaji: "shu" },
    null,
    { audio: "/audio/ja-yoon-sho.wav", kana: "しょ", romaji: "sho" },
  ],
  [
    { audio: "/audio/ja-yoon-cha.wav", kana: "ちゃ", romaji: "cha" },
    null,
    { audio: "/audio/ja-yoon-chu.wav", kana: "ちゅ", romaji: "chu" },
    null,
    { audio: "/audio/ja-yoon-cho.wav", kana: "ちょ", romaji: "cho" },
  ],
  [
    { audio: "/audio/ja-yoon-nya.wav", kana: "にゃ", romaji: "nya" },
    null,
    { audio: "/audio/ja-yoon-nyu.wav", kana: "にゅ", romaji: "nyu" },
    null,
    { audio: "/audio/ja-yoon-nyo.wav", kana: "にょ", romaji: "nyo" },
  ],
  [
    { audio: "/audio/ja-yoon-hya.wav", kana: "ひゃ", romaji: "hya" },
    null,
    { audio: "/audio/ja-yoon-hyu.wav", kana: "ひゅ", romaji: "hyu" },
    null,
    { audio: "/audio/ja-yoon-hyo.wav", kana: "ひょ", romaji: "hyo" },
  ],
  [
    { audio: "/audio/ja-yoon-mya.wav", kana: "みゃ", romaji: "mya" },
    null,
    { audio: "/audio/ja-yoon-myu.wav", kana: "みゅ", romaji: "myu" },
    null,
    { audio: "/audio/ja-yoon-myo.wav", kana: "みょ", romaji: "myo" },
  ],
  [
    { audio: "/audio/ja-yoon-rya.wav", kana: "りゃ", romaji: "rya" },
    null,
    { audio: "/audio/ja-yoon-ryu.wav", kana: "りゅ", romaji: "ryu" },
    null,
    { audio: "/audio/ja-yoon-ryo.wav", kana: "りょ", romaji: "ryo" },
  ],
  [
    { audio: "/audio/ja-yoon-gya.wav", kana: "ぎゃ", romaji: "gya" },
    null,
    { audio: "/audio/ja-yoon-gyu.wav", kana: "ぎゅ", romaji: "gyu" },
    null,
    { audio: "/audio/ja-yoon-gyo.wav", kana: "ぎょ", romaji: "gyo" },
  ],
  [
    { audio: "/audio/ja-yoon-ja.wav", kana: "じゃ", romaji: "ja" },
    null,
    { audio: "/audio/ja-yoon-ju.wav", kana: "じゅ", romaji: "ju" },
    null,
    { audio: "/audio/ja-yoon-jo.wav", kana: "じょ", romaji: "jo" },
  ],
  [
    { audio: "/audio/ja-yoon-bya.wav", kana: "びゃ", romaji: "bya" },
    null,
    { audio: "/audio/ja-yoon-byu.wav", kana: "びゅ", romaji: "byu" },
    null,
    { audio: "/audio/ja-yoon-byo.wav", kana: "びょ", romaji: "byo" },
  ],
  [
    { audio: "/audio/ja-yoon-pya.wav", kana: "ぴゃ", romaji: "pya" },
    null,
    { audio: "/audio/ja-yoon-pyu.wav", kana: "ぴゅ", romaji: "pyu" },
    null,
    { audio: "/audio/ja-yoon-pyo.wav", kana: "ぴょ", romaji: "pyo" },
  ],
] as const;

export const ROMAJI_RULES: readonly RomajiRule[] = [
  {
    id: "double-consonants",
    title: "Double consonants take an extra beat",
    note: "Pause before tt; hold the ss sound slightly longer.",
    examples: [
      { audio: "/audio/ja-kitte.wav", romaji: "kitte" },
      { audio: "/audio/ja-romaji-zasshi.wav", romaji: "zasshi" },
    ],
  },
  {
    id: "long-vowels",
    title: "A macron is the line over a vowel",
    note: "It marks a long vowel. Tōkyō and Toukyou are pronounced the same.",
    examples: [
      { audio: "/audio/ja-romaji-toukyou.wav", romaji: "Tōkyō" },
      { audio: "/audio/ja-romaji-toukyou.wav", romaji: "Toukyou" },
    ],
  },
  {
    id: "n-apostrophe",
    title: "An apostrophe separates n from a vowel or y",
    note: "It prevents the n from joining the sound that follows.",
    examples: [
      { audio: "/audio/ja-romaji-tani.wav", romaji: "tan'i" },
      { audio: "/audio/ja-romaji-kinen.wav", romaji: "kin'en" },
    ],
  },
  {
    id: "vowel-apostrophe",
    title: "An apostrophe can keep vowels separate",
    note: "Kouta can read as a long vowel; ko'uta keeps o and u separate.",
    examples: [
      { audio: "/audio/ja-romaji-kouta-long.wav", romaji: "kouta" },
      { audio: "/audio/ja-romaji-kouta-separated.wav", romaji: "ko'uta" },
    ],
  },
  {
    id: "particles",
    title: "Particles use wa, e, and o",
    note: "These three are written the way they are pronounced.",
    examples: [
      { audio: "/audio/ja-wa.wav", romaji: "wa" },
      { audio: "/audio/ja-e.wav", romaji: "e" },
      { audio: "/audio/ja-o.wav", romaji: "o" },
    ],
  },
] as const;
