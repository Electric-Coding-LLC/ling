export const GRAMMAR_REVIEW_DIRECTIONS = [
  "meaning-to-japanese",
  "japanese-to-meaning",
] as const;

export const GRAMMAR_STATION_IDS = [
  "statements",
  "questions",
  "possession",
  "existence",
  "verbs",
  "tense",
  "negation",
  "adjectives",
] as const;

export type GrammarReviewDirection =
  (typeof GRAMMAR_REVIEW_DIRECTIONS)[number];

export type GrammarStationId = (typeof GRAMMAR_STATION_IDS)[number];

export type GrammarKnowledge = {
  readonly direction: GrammarReviewDirection;
  readonly itemId: string;
};

export type GrammarItem = {
  readonly id: string;
  readonly japanese: string;
  readonly meaning: string;
  readonly note: string;
  readonly pattern: string;
};

export type GrammarStation = {
  readonly description: readonly string[];
  readonly id: GrammarStationId;
  readonly items: readonly GrammarItem[];
  readonly name: string;
};

export const GRAMMAR_STATIONS: readonly GrammarStation[] = [
  {
    description: [
      "Japanese statements often begin with what the sentence is about, marked by は, and finish with the information about it.",
      "For noun sentences, です supplies a polite ending. も can replace は when the new topic is also true of the same description.",
    ],
    id: "statements",
    items: [
      {
        id: "watashi-wa-kurisu-desu",
        japanese: "私はクリスです。",
        meaning: "I am Chris.",
        note: "は marks 私 as the topic; です completes the polite noun sentence.",
        pattern: "A は B です",
      },
      {
        id: "kore-wa-mizu-desu",
        japanese: "これは水です。",
        meaning: "This is water.",
        note: "The same sentence frame identifies a thing.",
        pattern: "A は B です",
      },
      {
        id: "watashi-mo-sensei-desu",
        japanese: "私も先生です。",
        meaning: "I am also a teacher.",
        note: "も replaces は to add the meaning “also.”",
        pattern: "A も B です",
      },
    ],
    name: "Statements",
  },
  {
    description: [
      "A polite yes-or-no question keeps the familiar sentence shape and ends with か.",
      "Question words such as 何, 誰, and どこ occupy the place of the missing information.",
    ],
    id: "questions",
    items: [
      {
        id: "kore-wa-nan-desu-ka",
        japanese: "これは何ですか。",
        meaning: "What is this?",
        note: "何 asks for the missing identity; か marks the sentence as a question.",
        pattern: "A は 何ですか",
      },
      {
        id: "toire-wa-doko-desu-ka",
        japanese: "トイレはどこですか。",
        meaning: "Where is the restroom?",
        note: "どこ asks for a place.",
        pattern: "A は どこですか",
      },
      {
        id: "ano-hito-wa-dare-desu-ka",
        japanese: "あの人は誰ですか。",
        meaning: "Who is that person?",
        note: "誰 asks for a person’s identity.",
        pattern: "A は 誰ですか",
      },
    ],
    name: "Questions",
  },
  {
    description: [
      "の connects two nouns. The first noun identifies the owner, group, type, or other relationship of the second.",
      "Read the pair from the second noun outward: 友達の車 is a car connected to a friend.",
    ],
    id: "possession",
    items: [
      {
        id: "watashi-no-namae-wa-kurisu-desu",
        japanese: "私の名前はクリスです。",
        meaning: "My name is Chris.",
        note: "私の connects “me” to 名前, making “my name.”",
        pattern: "A の B",
      },
      {
        id: "kore-wa-tomodachi-no-kuruma-desu",
        japanese: "これは友達の車です。",
        meaning: "This is a friend’s car.",
        note: "友達の identifies whose car it is.",
        pattern: "A の B",
      },
      {
        id: "ano-hito-wa-nihongo-no-sensei-desu",
        japanese: "あの人は日本語の先生です。",
        meaning: "That person is a Japanese-language teacher.",
        note: "日本語の identifies the subject that the teacher teaches.",
        pattern: "A の B",
      },
    ],
    name: "Possession",
  },
  {
    description: [
      "あります says that an object exists; います does the same for people and animals.",
      "The place is commonly marked by に, while the thing or person that exists is marked by が.",
    ],
    id: "existence",
    items: [
      {
        id: "koko-ni-toire-ga-arimasu",
        japanese: "ここにトイレがあります。",
        meaning: "There is a restroom here.",
        note: "に marks the place; あります is used for an object or place.",
        pattern: "Place に Thing が あります",
      },
      {
        id: "asoko-ni-sensei-ga-imasu",
        japanese: "あそこに先生がいます。",
        meaning: "There is a teacher over there.",
        note: "います is used because the existing thing is a person.",
        pattern: "Place に Person が います",
      },
      {
        id: "mizu-ga-arimasu-ka",
        japanese: "水がありますか。",
        meaning: "Is there any water?",
        note: "The place can be left unstated when it is clear from context.",
        pattern: "Thing が ありますか",
      },
    ],
    name: "Existence",
  },
  {
    description: [
      "Polite action sentences end the verb with ます. Japanese particles show how the surrounding nouns participate in the action.",
      "を marks a direct object, で marks where an action happens, and に can mark a destination.",
    ],
    id: "verbs",
    items: [
      {
        id: "watashi-wa-mizu-o-nomimasu",
        japanese: "私は水を飲みます。",
        meaning: "I drink water.",
        note: "を marks 水 as the thing being drunk.",
        pattern: "A は B を Verb-ます",
      },
      {
        id: "eki-de-tomodachi-o-machimasu",
        japanese: "駅で友達を待ちます。",
        meaning: "I wait for a friend at the station.",
        note: "で marks 駅 as the place where the waiting happens.",
        pattern: "Place で B を Verb-ます",
      },
      {
        id: "ashita-toukyou-ni-ikimasu",
        japanese: "明日、東京に行きます。",
        meaning: "I will go to Tokyo tomorrow.",
        note: "に marks 東京 as the destination.",
        pattern: "Destination に 行きます",
      },
    ],
    name: "Verbs",
  },
  {
    description: [
      "Japanese nonpast covers both present and future readings. Time words and context tell you which one is intended.",
      "For polite verbs, ます changes to ました to place the action in the past.",
    ],
    id: "tense",
    items: [
      {
        id: "kyou-pan-o-tabemasu",
        japanese: "今日、パンを食べます。",
        meaning: "I will eat bread today.",
        note: "食べます is nonpast; 今日 and context give it a future reading here.",
        pattern: "Verb-ます",
      },
      {
        id: "kinou-pan-o-tabemashita",
        japanese: "昨日、パンを食べました。",
        meaning: "I ate bread yesterday.",
        note: "ました marks the action as past.",
        pattern: "Verb-ました",
      },
      {
        id: "sensei-ni-kikimashita",
        japanese: "先生に聞きました。",
        meaning: "I asked the teacher.",
        note: "聞きました is the polite past of 聞きます; に marks the person asked.",
        pattern: "Person に Verb-ました",
      },
    ],
    name: "Tense",
  },
  {
    description: [
      "Negation changes the sentence ending rather than adding a separate word for “not.”",
      "Noun sentences can use じゃないです. Polite verbs use ません in the nonpast and ませんでした in the past.",
    ],
    id: "negation",
    items: [
      {
        id: "watashi-wa-sensei-janai-desu",
        japanese: "私は先生じゃないです。",
        meaning: "I am not a teacher.",
        note: "じゃないです is a common polite spoken negative for a noun sentence.",
        pattern: "A は B じゃないです",
      },
      {
        id: "koohii-wa-nomimasen",
        japanese: "コーヒーは飲みません。",
        meaning: "I do not drink coffee.",
        note: "ません is the polite nonpast negative of a verb.",
        pattern: "Verb-ません",
      },
      {
        id: "kinou-wa-ikimasen-deshita",
        japanese: "昨日は行きませんでした。",
        meaning: "I did not go yesterday.",
        note: "ませんでした is the polite past negative of a verb.",
        pattern: "Verb-ませんでした",
      },
    ],
    name: "Negation",
  },
  {
    description: [
      "Japanese has two main adjective patterns. い-adjectives keep their final い; な-adjectives use な only when they come before a noun.",
      "Both can finish a polite statement with です, but their noun-modifying forms stay different.",
    ],
    id: "adjectives",
    items: [
      {
        id: "kono-kuruma-wa-ookii-desu",
        japanese: "この車は大きいです。",
        meaning: "This car is big.",
        note: "大きい is an い-adjective used as the predicate.",
        pattern: "A は い-adjective です",
      },
      {
        id: "kono-machi-wa-shizuka-desu",
        japanese: "この町は静かです。",
        meaning: "This town is quiet.",
        note: "静か is a な-adjective used as the predicate; no な appears here.",
        pattern: "A は な-adjective です",
      },
      {
        id: "ookii-kuruma-desu",
        japanese: "大きい車です。",
        meaning: "It is a big car.",
        note: "An い-adjective keeps い directly before a noun.",
        pattern: "い-adjective + Noun",
      },
      {
        id: "shizuka-na-machi-desu",
        japanese: "静かな町です。",
        meaning: "It is a quiet town.",
        note: "A な-adjective adds な directly before a noun.",
        pattern: "な-adjective + な + Noun",
      },
    ],
    name: "Adjectives",
  },
] as const;

export function getGrammarStation(id: GrammarStationId): GrammarStation {
  const station = GRAMMAR_STATIONS.find((candidate) => candidate.id === id);
  if (!station) throw new Error(`Unknown Grammar station: ${id}`);
  return station;
}

export function getGrammarItemIds(stationId?: GrammarStationId): string[] {
  const stations = stationId ? [getGrammarStation(stationId)] : GRAMMAR_STATIONS;
  return stations.flatMap((station) => station.items.map((item) => item.id));
}

export function isGrammarStationId(value: unknown): value is GrammarStationId {
  return typeof value === "string"
    && GRAMMAR_STATION_IDS.some((stationId) => stationId === value);
}

export function isGrammarItemId(value: unknown): value is string {
  return typeof value === "string" && getGrammarItemIds().includes(value);
}

export function isGrammarReviewDirection(
  value: unknown,
): value is GrammarReviewDirection {
  return typeof value === "string"
    && GRAMMAR_REVIEW_DIRECTIONS.some((direction) => direction === value);
}

export function isGrammarKnowledge(value: unknown): value is GrammarKnowledge {
  if (!value || typeof value !== "object") return false;
  const candidate = value as { direction?: unknown; itemId?: unknown };
  return isGrammarItemId(candidate.itemId)
    && isGrammarReviewDirection(candidate.direction);
}
