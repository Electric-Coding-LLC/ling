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
        description: "Rōmaji writes Japanese sounds with Latin letters. It is a reading aid for pronunciation, not a replacement for Japanese writing.",
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
        description: "Sound explains the five vowels, the morae that organize rhythm, and the high-low pitch patterns carried across those beats.",
        href: "/stations/sound",
        id: "sound",
        name: "Sound",
      },
      {
        description: "Kana covers Hiragana and Katakana, the two phonetic scripts used to write Japanese sounds, along with the marks and combinations that extend them.",
        href: "/stations/kana",
        id: "kana",
        name: "Kana",
      },
      {
        description: "Kanji introduces meaning-bearing characters as parts of complete words, including compounds and words completed by Kana endings.",
        href: "/stations/kanji",
        id: "kanji",
        name: "Kanji",
      },
      {
        description: "Vocabulary joins meaning, sound, and writing so that useful words can be recognized and recalled as complete units.",
        href: "/stations/vocabulary",
        id: "vocabulary",
        name: "Vocabulary",
      },
      {
        description: "Grammar shows how particles and sentence endings connect those words into statements, questions, descriptions, and actions.",
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
        description: "Japanese distinguishes what is near the speaker, near the listener, and away from both: これ, それ, あれ. The same distance pattern appears in ここ, そこ, and あそこ.",
        href: "/stations/pointing",
        id: "pointing",
        name: "Pointing",
      },
      {
        description: "Early conversations identify people by name, relationship, or role. 私 refers to yourself; 友達, 家族, 先生, and 子ども place other people in a familiar context.",
        href: "/stations/people",
        id: "people",
        name: "People",
      },
      {
        description: "Concrete nouns make an immediate request possible even before the full sentence is familiar: 水, 食べ物, トイレ, お茶, コーヒー, パン, and ご飯.",
        href: "/stations/needs",
        id: "needs",
        name: "Needs",
      },
      {
        description: "Movement joins 行く, “to go,” with places and transport. 駅 names a place where travel happens; 電車, 地下鉄, バス, 車, and タクシー name ways to travel.",
        href: "/stations/movement",
        id: "movement",
        name: "Movement",
      },
      {
        description: "Time words place an action around the present: 今 is now, 今日 is today, 明日 is tomorrow, and 昨日 is yesterday. 朝, 昼, and 夜 divide the day.",
        href: "/stations/time",
        id: "time",
        name: "Time",
      },
      {
        description: "Japanese verbs name actions such as eating, drinking, seeing, listening, speaking, buying, going, and waiting. Their endings later change to express politeness, tense, and negation.",
        href: "/stations/actions",
        id: "actions",
        name: "Actions",
      },
      {
        description: "Words such as 大きい, 小さい, 暑い, 寒い, 高い, and 安い describe size, temperature, and price. Their shared final い becomes important when they enter a sentence.",
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
        description: "Statements introduce the topic marker は and the polite noun ending です: the basic shape for saying what something is.",
        href: "/stations/statements",
        id: "statements",
        name: "Statements",
      },
      {
        description: "Questions add か or replace missing information with words such as 何, 誰, and どこ.",
        href: "/stations/questions",
        id: "questions",
        name: "Questions",
      },
      {
        description: "Possession uses の to connect two nouns. The first noun can identify an owner, group, type, or other relationship of the second.",
        href: "/stations/possession",
        id: "possession",
        name: "Possession",
      },
      {
        description: "Existence distinguishes あります for objects from います for people and animals, with particles marking what exists and where.",
        href: "/stations/existence",
        id: "existence",
        name: "Existence",
      },
      {
        description: "Verbs introduce polite ます endings and the particles that mark an object, the place of an action, or a destination.",
        href: "/stations/verbs",
        id: "verbs",
        name: "Verbs",
      },
      {
        description: "Tense contrasts Japanese nonpast with past. Context separates present from future, while ました places a polite action in the past.",
        href: "/stations/tense",
        id: "tense",
        name: "Tense",
      },
      {
        description: "Negation changes the sentence ending: noun sentences can use じゃないです, while polite verbs use ません or ませんでした.",
        href: "/stations/negation",
        id: "negation",
        name: "Negation",
      },
      {
        description: "Japanese has two main adjective patterns: い-adjectives keep their final い, while な-adjectives add な directly before a noun.",
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
