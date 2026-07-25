export type TravelPhrase = {
  readonly audio: `/audio/${string}.wav`;
  readonly id: string;
  readonly japanese: string;
  readonly meaning: string;
  readonly note?: string;
  readonly reading?: string;
  readonly soundCues?: readonly string[];
  readonly source: string;
};

export type TravelPhraseStation =
  | "food"
  | "greetings"
  | "navigation"
  | "shopping";

export const TRAVEL_ORIENTATION = {
  japanese: {
    audio: "/audio/ja-travel-nihongo.wav",
    japanese: "日本語",
    meaning: "Japanese",
  },
  japan: {
    audio: "/audio/ja-travel-nihon.wav",
    japanese: "日本",
    meaning: "Japan",
  },
} as const;

export const TRAVEL_PHRASES: Readonly<
  Record<TravelPhraseStation, readonly TravelPhrase[]>
> = {
  greetings: [
    {
      id: "ohayou-gozaimasu",
      japanese: "おはようございます",
      meaning: "Good morning",
      audio: "/audio/ja-travel-ohayou-gozaimasu.wav",
      source: "JNTO Japanese language basics; Irodori Starter L1",
    },
    {
      id: "konnichiwa",
      japanese: "こんにちは",
      meaning: "Hello",
      note: "Most common during the day.",
      audio: "/audio/ja-travel-konnichiwa.wav",
      source: "JNTO Japanese language basics",
    },
    {
      id: "konbanwa",
      japanese: "こんばんは",
      meaning: "Good evening",
      audio: "/audio/ja-travel-konbanwa.wav",
      source: "JNTO Japanese language basics",
    },
    {
      id: "onegaishimasu",
      japanese: "お願いします",
      meaning: "Please",
      note: "Use when making or confirming a request.",
      reading: "おねがいします",
      soundCues: ["oh", "neh", "gah", "ee", "shee", "mah", "s"],
      audio: "/audio/ja-travel-onegaishimasu.wav",
      source: "Irodori Starter request patterns",
    },
    {
      id: "arigatou-gozaimasu",
      japanese: "ありがとうございます",
      meaning: "Thank you",
      note: "Polite and broadly useful.",
      reading: "ありがとうございます",
      soundCues: ["ah", "ree", "gah", "toh", "oo", "goh", "zah", "ee", "mah", "s"],
      audio: "/audio/ja-travel-arigatou-gozaimasu.wav",
      source: "JNTO Japanese language basics",
    },
    {
      id: "sumimasen",
      japanese: "すみません",
      meaning: "Excuse me / I’m sorry",
      note: "Also useful for getting someone’s attention.",
      reading: "すみません",
      audio: "/audio/ja-travel-sumimasen.wav",
      source: "JNTO Japanese language basics and etiquette guidance",
    },
  ],
  navigation: [
    {
      id: "eki-wa-doko-desu-ka",
      japanese: "駅はどこですか？",
      meaning: "Where is the station?",
      audio: "/audio/ja-travel-eki-wa-doko-desu-ka.wav",
      source: "JNTO doko desuka travel pattern",
    },
    {
      id: "kono-densha-wa-toukyou-ni-ikimasu-ka",
      japanese: "この電車は東京に行きますか？",
      meaning: "Does this train go to Tokyo?",
      note: "Replace Tokyo with the destination you need.",
      audio: "/audio/ja-travel-kono-densha-wa-toukyou-ni-ikimasu-ka.wav",
      source: "Irodori Starter L13 vehicle and destination pattern",
    },
    {
      id: "nanban-sen-desu-ka",
      japanese: "何番線ですか？",
      meaning: "Which platform?",
      audio: "/audio/ja-travel-nanban-sen-desu-ka.wav",
      source: "Irodori Starter L13",
    },
    {
      id: "ima-doko-desu-ka",
      japanese: "今、どこですか？",
      meaning: "Where are we now?",
      audio: "/audio/ja-travel-ima-doko-desu-ka.wav",
      source: "Irodori Starter L13",
    },
    {
      id: "koko-made-onegaishimasu",
      japanese: "ここまでお願いします",
      meaning: "To here, please",
      note: "Show a map or address to a taxi driver.",
      audio: "/audio/ja-travel-koko-made-onegaishimasu.wav",
      source: "Irodori destination and request patterns",
    },
    {
      id: "eki-made-douyatte-ikimasu-ka",
      japanese: "駅まで、どうやって行きますか？",
      meaning: "How do I get to the station?",
      audio: "/audio/ja-travel-eki-made-douyatte-ikimasu-ka.wav",
      source: "Irodori Starter L13 route pattern",
    },
  ],
  food: [
    {
      id: "kore-o-onegaishimasu",
      japanese: "これをお願いします",
      meaning: "This, please",
      note: "Point to the item while asking.",
      audio: "/audio/ja-travel-kore-o-onegaishimasu.wav",
      source: "Irodori request patterns",
    },
    {
      id: "osusume-wa-nan-desu-ka",
      japanese: "おすすめは何ですか？",
      meaning: "What do you recommend?",
      audio: "/audio/ja-travel-osusume-wa-nan-desu-ka.wav",
      source: "Irodori restaurant recommendation material",
    },
    {
      id: "mizu-onegaishimasu",
      japanese: "水、お願いします",
      meaning: "Water, please",
      audio: "/audio/ja-travel-mizu-onegaishimasu.wav",
      source: "Irodori Starter L5",
    },
    {
      id: "kore-wa-nan-desu-ka",
      japanese: "これは何ですか？",
      meaning: "What is this?",
      audio: "/audio/ja-travel-kore-wa-nan-desu-ka.wav",
      source: "Irodori meal dialog pattern",
    },
    {
      id: "niku-wa-haitteimasu-ka",
      japanese: "肉は入っていますか？",
      meaning: "Does this contain meat?",
      note: "Ask about one ingredient; it is not a complete allergy explanation.",
      audio: "/audio/ja-travel-niku-wa-haitteimasu-ka.wav",
      source: "Irodori ingredient-check pattern",
    },
    {
      id: "okaikei-onegaishimasu",
      japanese: "お会計、お願いします",
      meaning: "The bill, please",
      audio: "/audio/ja-travel-okaikei-onegaishimasu.wav",
      source: "Irodori restaurant word list",
    },
  ],
  shopping: [
    {
      id: "kore-ikura-desu-ka",
      japanese: "これ、いくらですか？",
      meaning: "How much is this?",
      audio: "/audio/ja-travel-kore-ikura-desu-ka.wav",
      source: "Irodori Starter L16; JNTO Japanese language basics",
    },
    {
      id: "kore-o-kudasai",
      japanese: "これをください",
      meaning: "This, please",
      note: "Use when choosing an item to buy.",
      audio: "/audio/ja-travel-kore-o-kudasai.wav",
      source: "Irodori Starter purchasing pattern",
    },
    {
      id: "hoka-no-iro-arimasu-ka",
      japanese: "ほかの色、ありますか？",
      meaning: "Do you have another color?",
      audio: "/audio/ja-travel-hoka-no-iro-arimasu-ka.wav",
      source: "Irodori Elementary 2 L11",
    },
    {
      id: "mou-chotto-ookii-no-arimasu-ka",
      japanese: "もうちょっと大きいの、ありますか？",
      meaning: "Do you have a slightly larger one?",
      audio: "/audio/ja-travel-mou-chotto-ookii-no-arimasu-ka.wav",
      source: "Irodori Elementary 2 L11",
    },
    {
      id: "shichaku-shite-mo-ii-desu-ka",
      japanese: "試着してもいいですか？",
      meaning: "May I try it on?",
      note: "For clothing.",
      audio: "/audio/ja-travel-shichaku-shite-mo-ii-desu-ka.wav",
      source: "Irodori Elementary 2 L11",
    },
    {
      id: "kaado-wa-tsukaemasu-ka",
      japanese: "カードは使えますか？",
      meaning: "Can I use a card?",
      audio: "/audio/ja-travel-kaado-wa-tsukaemasu-ka.wav",
      source: "Irodori payment contexts",
    },
  ],
};
