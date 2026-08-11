export type FoundationTourId =
  | "foundations"
  | "grammar"
  | "japan"
  | "kana"
  | "kanji"
  | "sound"
  | "vocabulary";

export type FoundationTourStation = {
  readonly description: string;
  readonly href: `/stations/${string}`;
  readonly id: string;
  readonly name: string;
};

export type FoundationTour = {
  readonly heading: string;
  readonly stations: readonly FoundationTourStation[];
};

export const FOUNDATION_TOURS: Readonly<Record<FoundationTourId, FoundationTour>> = {
  foundations: {
    heading: "The foundations of Japanese",
    stations: [
      {
        description: "Rōmaji writes Japanese sounds with Latin letters. It helps you pronounce an unfamiliar name or phrase while you learn to read Japanese writing itself.",
        href: "/stations/romaji",
        id: "romaji",
        name: "Rōmaji",
      },
      {
        description: "Japan gives the language its social and practical setting, from meeting someone to finding food, transport, shopping, and help.",
        href: "/stations/japan",
        id: "japan",
        name: "Japan",
      },
      {
        description: "Sound teaches the vowels, rhythm, and pitch patterns that help an adult learner understand natural speech and be understood clearly.",
        href: "/stations/sound",
        id: "sound",
        name: "Sound",
      },
      {
        description: "Kana teaches the two phonetic scripts needed to read names, menus, signs, messages, and the grammatical endings attached to words.",
        href: "/stations/kana",
        id: "kana",
        name: "Kana",
      },
      {
        description: "Kanji teaches meaning-bearing characters through complete words you can recognize in places, schedules, forms, messages, and everyday reading.",
        href: "/stations/kanji",
        id: "kanji",
        name: "Kanji",
      },
      {
        description: "Vocabulary builds the words needed to identify people and places, meet immediate needs, make plans, compare options, and act independently.",
        href: "/stations/vocabulary",
        id: "vocabulary",
        name: "Vocabulary",
      },
      {
        description: "Grammar connects those words so you can explain who you are, ask useful questions, describe a situation, and say what happened or needs to happen.",
        href: "/stations/grammar",
        id: "grammar",
        name: "Grammar",
      },
    ],
  },
  japan: {
    heading: "Japanese for a first visit",
    stations: [
      {
        description: "A polite first meeting often opens with hajimemashite (はじめまして), “nice to meet you.” Give your name with desu (です), polite “is,” then close with yoroshiku onegaishimasu (よろしくお願いします), a request for goodwill.",
        href: "/stations/introductions",
        id: "introductions",
        name: "Introductions",
      },
      {
        description: "Doko (どこ) asks “where?” while nanban (何番) asks “what number?” Short confirmation questions help you verify a train, destination, or transfer before moving on.",
        href: "/stations/navigation",
        id: "navigation",
        name: "Navigation",
      },
      {
        description: "A restaurant exchange moves from party size or a reservation to ordering with onegaishimasu (お願いします), “please,” checking ingredients, asking for the bill, and thanking someone for the meal.",
        href: "/stations/food",
        id: "food",
        name: "Food",
      },
      {
        description: "Ikura desu ka? (いくらですか) asks “how much?” Arimasu ka? (ありますか) asks whether an option is available, and kudasai (ください), “please give me,” selects an item.",
        href: "/stations/shopping",
        id: "shopping",
        name: "Shopping",
      },
      {
        description: "Tasukete kudasai (助けてください) means “please help me.” Other phrases identify illness or pain, call emergency services, report a lost passport, or find an English speaker.",
        href: "/stations/help",
        id: "help",
        name: "Help",
      },
    ],
  },
  sound: {
    heading: "Three parts of Japanese pronunciation",
    stations: [
      {
        description: "Japanese is built around five stable vowel sounds: あ, い, う, え, and お. They remain recognizable wherever they appear in a word.",
        href: "/stations/vowels",
        id: "vowels",
        name: "Vowels",
      },
      {
        description: "Japanese rhythm is counted in morae. Each mora takes one beat, including a small っ, a final ん, or the second half of a long vowel.",
        href: "/stations/mora-timing",
        id: "mora",
        name: "Mora",
      },
      {
        description: "A Japanese word carries a high-low pitch pattern across its morae. Hearing that contour helps a familiar word sound recognizable in speech.",
        href: "/stations/pitch-accent",
        id: "pitch",
        name: "Pitch",
      },
    ],
  },
  kana: {
    heading: "How the Kana system grows",
    stations: [
      {
        description: "Hiragana writes the basic Japanese sound set and appears throughout native words, particles, and grammatical endings.",
        href: "/stations/hiragana",
        id: "hiragana",
        name: "Hiragana",
      },
      {
        description: "Katakana represents the same basic sounds with a second set of shapes, used especially for borrowed words, foreign names, emphasis, and sound effects.",
        href: "/stations/katakana",
        id: "katakana",
        name: "Katakana",
      },
      {
        description: "Dakuten and Handakuten change a Kana's consonant sound: か becomes が, さ becomes ざ, and は can become ば or ぱ.",
        href: "/stations/sound-marks",
        id: "marks",
        name: "Dakuten & Handakuten",
      },
      {
        description: "Yōon combines an i-row Kana with a small ゃ, ゅ, or ょ to make one mora, as in きょ or its Katakana match キョ.",
        href: "/stations/combined-sounds",
        id: "combined",
        name: "Yōon",
      },
    ],
  },
  kanji: {
    heading: "How Kanji form words",
    stations: [
      {
        description: "Some Kanji can write a complete word by themselves. Learn the written word with its reading and meaning, as in 水 for みず, rather than memorizing a character in isolation.",
        href: "/stations/characters",
        id: "characters",
        name: "Characters",
      },
      {
        description: "Compounds join two or more Kanji into one word. Learn the combination and its reading together, as in 電車 rather than as two isolated characters.",
        href: "/stations/compounds",
        id: "compounds",
        name: "Compounds",
      },
      {
        description: "Endings pair a Kanji core with Kana, as in 食べる or 大きい. The Kanji carries the recognizable meaning while the Kana can carry grammatical change.",
        href: "/stations/endings",
        id: "endings",
        name: "Endings",
      },
    ],
  },
  vocabulary: {
    heading: "A practical core vocabulary",
    stations: [
      {
        description: "Pointing words let you identify an item, confirm a place, and ask where something is. Japanese distinguishes what is near you, near the listener, and away from both.",
        href: "/stations/pointing",
        id: "pointing",
        name: "Pointing",
      },
      {
        description: "Adult conversations identify people by name, relationship, and role. 私 refers to you; 友達, 家族, 先生, and 子ども help you talk about people in your life.",
        href: "/stations/people",
        id: "people",
        name: "People",
      },
      {
        description: "Immediate needs come first: finding a restroom, asking for water or food, and naming what you need even before a complete sentence is familiar.",
        href: "/stations/needs",
        id: "needs",
        name: "Needs",
      },
      {
        description: "Movement supports independent travel. 行く means “to go”; 駅, 電車, 地下鉄, バス, 車, and タクシー help you name where and how you are moving.",
        href: "/stations/movement",
        id: "movement",
        name: "Movement",
      },
      {
        description: "Time words help you discuss plans and schedules: 今 is now, 今日 is today, 明日 is tomorrow, and 昨日 is yesterday. 朝, 昼, and 夜 divide the day.",
        href: "/stations/time",
        id: "time",
        name: "Time",
      },
      {
        description: "Actions such as eating, drinking, listening, speaking, buying, going, and waiting let you describe what you do and respond to everyday situations.",
        href: "/stations/actions",
        id: "actions",
        name: "Actions",
      },
      {
        description: "Descriptions help you compare options and conditions. 大きい, 小さい, 暑い, 寒い, 高い, and 安い cover size, temperature, and price.",
        href: "/stations/descriptions",
        id: "descriptions",
        name: "Descriptions",
      },
    ],
  },
  grammar: {
    heading: "The first sentence tools",
    stations: [
      {
        description: "Statements use は to tell the listener what you are talking about and です to finish a neutral, respectful thought about identity, work, or plans.",
        href: "/stations/statements",
        id: "statements",
        name: "Statements",
      },
      {
        description: "Questions confirm arrangements with か and ask for useful details with words such as 何時, 誰, and どこ.",
        href: "/stations/questions",
        id: "questions",
        name: "Questions",
      },
      {
        description: "Possession uses の to connect a reservation, card, role, or schedule to its owner, organization, or event.",
        href: "/stations/possession",
        id: "possession",
        name: "Possession",
      },
      {
        description: "Existence uses あります to find objects and services and います to find people, with short markers showing what is available and where.",
        href: "/stations/existence",
        id: "existence",
        name: "Existence",
      },
      {
        description: "Verbs use polite ます endings to describe adult actions such as drinking, waiting, going to work, and speaking in a meeting.",
        href: "/stations/verbs",
        id: "verbs",
        name: "Verbs",
      },
      {
        description: "Tense helps you discuss plans and report what happened. Japanese nonpast covers present and future; ました places a polite action in the past.",
        href: "/stations/tense",
        id: "tense",
        name: "Tense",
      },
      {
        description: "Negation lets you correct an assumption, state a preference, or say an action did not happen by changing the sentence ending.",
        href: "/stations/negation",
        id: "negation",
        name: "Negation",
      },
      {
        description: "Adjectives help compare places and options. い-adjectives keep their final い, while な-adjectives add な directly before the thing described.",
        href: "/stations/adjectives",
        id: "adjectives",
        name: "Adjectives",
      },
    ],
  },
};

export function getFoundationTour(id: FoundationTourId): FoundationTour {
  return FOUNDATION_TOURS[id];
}
