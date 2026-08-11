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
  readonly audio?: string;
  readonly id: string;
  readonly japanese: string;
  readonly meaning: string;
  readonly note: string;
  readonly pattern: string;
};

export type GrammarLessonPart = {
  readonly japanese: string;
  readonly label: string;
};

export type GrammarLesson = {
  readonly explanation: string;
  readonly heading: string;
  readonly parts: readonly GrammarLessonPart[];
};

export type GrammarTerm = {
  readonly definition: string;
  readonly term: string;
};

export type GrammarStation = {
  readonly description: readonly string[];
  readonly id: GrammarStationId;
  readonly items: readonly GrammarItem[];
  readonly lesson?: GrammarLesson;
  readonly name: string;
  readonly terms?: readonly GrammarTerm[];
};

export const GRAMMAR_STATIONS: readonly GrammarStation[] = [
  {
    description: [
      "Japanese often begins by telling you what the sentence is about. 私は is like saying “As for me…”",
      "Listen to 私はクリスです first. Then we’ll see how the rest of the sentence tells us something about me.",
    ],
    id: "statements",
    items: [
      {
        audio: "/audio/ja-grammar-watashi-wa-kurisu-desu.wav",
        id: "watashi-wa-kurisu-desu",
        japanese: "私はクリスです。",
        meaning: "I am Chris.",
        note: "私は is like saying “As for me…” クリスです tells us “I’m Chris.”",
        pattern: "私は … = As for me …",
      },
      {
        audio: "/audio/ja-grammar-kyou-wa-kaigi-desu.wav",
        id: "kyou-wa-kaigi-desu",
        japanese: "今日は会議です。",
        meaning: "I have a meeting today.",
        note: "今日は is like saying “As for today…” 会議です tells us there is a meeting.",
        pattern: "今日は … = As for today …",
      },
      {
        audio: "/audio/ja-grammar-watashi-mo-ryokousha-desu.wav",
        id: "watashi-mo-ryokousha-desu",
        japanese: "私も旅行者です。",
        meaning: "I am also a traveler.",
        note: "私も is like saying “As for me, too…” 旅行者です tells us “I’m a traveler.”",
        pattern: "私も … = As for me, too …",
      },
      {
        audio: "/audio/ja-grammar-watashi-wa-kaishain-desu.wav",
        id: "watashi-wa-kaishain-desu",
        japanese: "私は会社員です。",
        meaning: "I am an office worker.",
        note: "私は is like saying “As for me…” 会社員です tells us “I’m an office worker.”",
        pattern: "私は … = As for me …",
      },
      {
        audio: "/audio/ja-grammar-yoyaku-wa-sanji-desu.wav",
        id: "yoyaku-wa-sanji-desu",
        japanese: "予約は三時です。",
        meaning: "The reservation is at three.",
        note: "予約は tells us the reservation is what we’re discussing. 三時です gives its time.",
        pattern: "予約は … = As for the reservation …",
      },
      {
        audio: "/audio/ja-grammar-ashita-wa-yasumi-desu.wav",
        id: "ashita-wa-yasumi-desu",
        japanese: "明日は休みです。",
        meaning: "Tomorrow is my day off.",
        note: "明日は is like saying “As for tomorrow…” 休みです tells us it is a day off.",
        pattern: "明日は … = As for tomorrow …",
      },
      {
        audio: "/audio/ja-grammar-kurisu-mo-kaishain-desu.wav",
        id: "kurisu-mo-kaishain-desu",
        japanese: "クリスも会社員です。",
        meaning: "Chris is also an office worker.",
        note: "クリスも is like saying “As for Chris, too…” 会社員です tells us Chris is an office worker.",
        pattern: "クリスも … = As for Chris, too …",
      },
      {
        audio: "/audio/ja-grammar-ashita-mo-kaigi-desu.wav",
        id: "ashita-mo-kaigi-desu",
        japanese: "明日も会議です。",
        meaning: "I also have a meeting tomorrow.",
        note: "明日も is like saying “As for tomorrow, too…” 会議です tells us there is a meeting.",
        pattern: "明日も … = As for tomorrow, too …",
      },
    ],
    lesson: {
      explanation: "は tells you that the word before it is what we’re talking about. 私は is like saying “As for me…” The rest tells us something about me.",
      heading: "Now, let’s take it apart",
      parts: [
        { japanese: "私", label: "私 means “I” or “me.” Here, I’m talking about myself." },
        { japanese: "は", label: "は tells us that 私 is what I’m talking about. Together, 私は is like “As for me…” It is written は but pronounced wa here." },
        { japanese: "クリス", label: "Now I say something about myself: I’m Chris." },
        { japanese: "です", label: "This finishes the sentence in the polite form." },
      ],
    },
    name: "Statements",
    terms: [
      {
        definition: "The neutral, respectful style you can use with people you do not know well. です gives these sentences that tone.",
        term: "polite form",
      },
    ],
  },
  {
    description: [
      "Japanese questions help you confirm arrangements and ask for the detail you need. A yes-or-no question ends with か.",
      "A question word asks for the missing detail: 何時 asks what time, どこ asks where, and 誰 asks who.",
    ],
    id: "questions",
    items: [
      {
        id: "kaigi-wa-sanji-desu-ka",
        japanese: "会議は三時ですか。",
        meaning: "Is the meeting at three?",
        note: "か turns the statement 会議は三時です into a yes-or-no question.",
        pattern: "Statement + か",
      },
      {
        id: "yoyaku-wa-nanji-desu-ka",
        japanese: "予約は何時ですか。",
        meaning: "What time is the reservation?",
        note: "何時 asks for a time.",
        pattern: "Arrangement は 何時ですか",
      },
      {
        id: "hoteru-wa-doko-desu-ka",
        japanese: "ホテルはどこですか。",
        meaning: "Where is the hotel?",
        note: "どこ asks for a place.",
        pattern: "Place は どこですか",
      },
      {
        id: "tantousha-wa-dare-desu-ka",
        japanese: "担当者は誰ですか。",
        meaning: "Who is the person in charge?",
        note: "誰 asks for a person’s identity.",
        pattern: "Person は 誰ですか",
      },
    ],
    name: "Questions",
    terms: [
      {
        definition: "A question that can be answered with yes or no.",
        term: "yes-or-no question",
      },
      {
        definition: "A word such as what, who, or where that asks for the missing part of an answer.",
        term: "question word",
      },
    ],
  },
  {
    description: [
      "の connects one noun to another so you can describe ownership, organizations, roles, and schedules.",
      "Read from the second noun outward: 私の予約 is the reservation connected to me—my reservation.",
    ],
    id: "possession",
    items: [
      {
        id: "kore-wa-watashi-no-yoyaku-desu",
        japanese: "これは私の予約です。",
        meaning: "This is my reservation.",
        note: "私の connects “me” to 予約, making “my reservation.”",
        pattern: "Owner の Thing",
      },
      {
        id: "kore-wa-kaisha-no-kaado-desu",
        japanese: "これは会社のカードです。",
        meaning: "This is the company card.",
        note: "会社の connects the card to the company.",
        pattern: "Organization の Thing",
      },
      {
        id: "ano-hito-wa-hoteru-no-sutaffu-desu",
        japanese: "あの人はホテルのスタッフです。",
        meaning: "That person is a member of the hotel staff.",
        note: "ホテルの connects the person’s role to the hotel.",
        pattern: "Organization の Role",
      },
      {
        id: "kaigi-no-jikan-wa-sanji-desu",
        japanese: "会議の時間は三時です。",
        meaning: "The meeting time is three.",
        note: "会議の connects the time to the meeting.",
        pattern: "Event の Time",
      },
    ],
    name: "Possession",
    terms: [
      {
        definition: "A word that names a person, place, thing, or idea.",
        term: "noun",
      },
    ],
  },
  {
    description: [
      "Use あります to find an object or service, and います to find a person. This is called existence: establishing what is available in a place.",
      "に marks the place. が marks the object or person you are looking for.",
    ],
    id: "existence",
    items: [
      {
        id: "kono-chikaku-ni-eetiiemu-ga-arimasu",
        japanese: "この近くにATMがあります。",
        meaning: "There is an ATM nearby.",
        note: "に marks この近く as the place; あります is used for the ATM.",
        pattern: "Place に Thing が あります",
      },
      {
        id: "robii-ni-sutaffu-ga-imasu",
        japanese: "ロビーにスタッフがいます。",
        meaning: "There is a staff member in the lobby.",
        note: "います is used because the person in the lobby is living.",
        pattern: "Place に Person が います",
      },
      {
        id: "kaigishitsu-ni-isu-ga-arimasu",
        japanese: "会議室に椅子があります。",
        meaning: "There are chairs in the meeting room.",
        note: "あります is used because chairs are objects.",
        pattern: "Place に Thing が あります",
      },
      {
        id: "hoteru-ni-resutoran-ga-arimasu-ka",
        japanese: "ホテルにレストランがありますか。",
        meaning: "Is there a restaurant in the hotel?",
        note: "か turns the existence statement into a question.",
        pattern: "Place に Thing が ありますか",
      },
    ],
    name: "Existence",
    terms: [
      {
        definition: "Saying that someone or something is present or can be found somewhere.",
        term: "existence",
      },
    ],
  },
  {
    description: [
      "A polite action sentence ends its verb with ます. These examples describe drinking, waiting, going to work, and speaking in a meeting.",
      "A particle shows each word’s job: を marks what the action affects, で marks where it happens, and に marks where someone is going.",
    ],
    id: "verbs",
    items: [
      {
        id: "watashi-wa-koohii-o-nomimasu",
        japanese: "私はコーヒーを飲みます。",
        meaning: "I drink coffee.",
        note: "を marks コーヒー as the thing being drunk.",
        pattern: "Person は Thing を Verb-ます",
      },
      {
        id: "eki-de-takushii-o-machimasu",
        japanese: "駅でタクシーを待ちます。",
        meaning: "I wait for a taxi at the station.",
        note: "で marks 駅 as the place where the waiting happens.",
        pattern: "Place で Thing を Verb-ます",
      },
      {
        id: "ashita-kaisha-ni-ikimasu",
        japanese: "明日、会社に行きます。",
        meaning: "I will go to work tomorrow.",
        note: "に marks 会社 as the destination.",
        pattern: "Destination に 行きます",
      },
      {
        id: "kaigi-de-nihongo-o-hanashimasu",
        japanese: "会議で日本語を話します。",
        meaning: "I speak Japanese in the meeting.",
        note: "で marks 会議 as where the speaking happens; を marks 日本語 as the language spoken.",
        pattern: "Place で Language を Verb-ます",
      },
    ],
    name: "Verbs",
    terms: [
      {
        definition: "A word that describes an action or state, such as drink, wait, or go.",
        term: "verb",
      },
      {
        definition: "A short marker placed after a word to show the job that word has in the sentence.",
        term: "particle",
      },
    ],
  },
  {
    description: [
      "Tense helps you talk about plans and report what already happened. Japanese nonpast covers present, repeated, and future actions.",
      "Time words and context tell you which meaning is intended. For polite verbs, ます changes to ました for the past.",
    ],
    id: "tense",
    items: [
      {
        id: "kyou-hoteru-ni-ikimasu",
        japanese: "今日、ホテルに行きます。",
        meaning: "I will go to the hotel today.",
        note: "行きます is nonpast; 今日 and context give it a future reading here.",
        pattern: "Verb-ます",
      },
      {
        id: "kinou-kaisha-ni-ikimashita",
        japanese: "昨日、会社に行きました。",
        meaning: "I went to work yesterday.",
        note: "行きました places the action in the past.",
        pattern: "Verb-ました",
      },
      {
        id: "sutaffu-ni-kikimashita",
        japanese: "スタッフに聞きました。",
        meaning: "I asked a staff member.",
        note: "聞きました is the polite past of 聞きます; に marks the person asked.",
        pattern: "Person に Verb-ました",
      },
      {
        id: "ashita-tomodachi-ni-aimasu",
        japanese: "明日、友達に会います。",
        meaning: "I will meet a friend tomorrow.",
        note: "会います is nonpast; 明日 gives it a future meaning here.",
        pattern: "Time + Person に Verb-ます",
      },
    ],
    name: "Tense",
    terms: [
      {
        definition: "The form of a verb that helps show when something happens.",
        term: "tense",
      },
      {
        definition: "The Japanese verb form used for present, repeated, and future actions. Context tells you which meaning is intended.",
        term: "nonpast",
      },
      {
        definition: "A verb form that says the action happened earlier.",
        term: "past",
      },
    ],
  },
  {
    description: [
      "Negation lets you correct an assumption, state a preference, or say that something did not happen.",
      "A noun sentence can use じゃないです. A polite verb uses ません in the nonpast and ませんでした in the past.",
    ],
    id: "negation",
    items: [
      {
        id: "watashi-wa-kaishain-janai-desu",
        japanese: "私は会社員じゃないです。",
        meaning: "I am not an office worker.",
        note: "じゃないです is a common polite spoken negative for a noun sentence.",
        pattern: "Person は Role じゃないです",
      },
      {
        id: "koohii-wa-nomimasen",
        japanese: "コーヒーは飲みません。",
        meaning: "I do not drink coffee.",
        note: "ません is the polite nonpast negative of a verb.",
        pattern: "Verb-ません",
      },
      {
        id: "kinou-wa-hatarakimasen-deshita",
        japanese: "昨日は働きませんでした。",
        meaning: "I did not work yesterday.",
        note: "ませんでした is the polite past negative of a verb.",
        pattern: "Verb-ませんでした",
      },
      {
        id: "kyou-wa-kaigi-ga-arimasen",
        japanese: "今日は会議がありません。",
        meaning: "There is no meeting today.",
        note: "ありません is the negative form of あります: the meeting does not exist today.",
        pattern: "Thing が ありません",
      },
    ],
    name: "Negation",
    terms: [
      {
        definition: "Changing a sentence so it says something is not true or does not happen.",
        term: "negation",
      },
      {
        definition: "A word that names a person, place, thing, or idea.",
        term: "noun",
      },
      {
        definition: "A word that describes an action or state.",
        term: "verb",
      },
      {
        definition: "The Japanese verb form used for present, repeated, and future actions.",
        term: "nonpast",
      },
      {
        definition: "A verb form that says the action happened earlier.",
        term: "past",
      },
    ],
  },
  {
    description: [
      "An adjective helps you compare places and options. Japanese has two main patterns: an い-adjective and a な-adjective.",
      "Both can finish a polite statement with です. When either comes directly before a noun, its form changes.",
    ],
    id: "adjectives",
    items: [
      {
        id: "kono-hoteru-wa-takai-desu",
        japanese: "このホテルは高いです。",
        meaning: "This hotel is expensive.",
        note: "高い is an い-adjective that tells us the hotel is expensive.",
        pattern: "Thing は い-adjective です",
      },
      {
        id: "kono-resutoran-wa-shizuka-desu",
        japanese: "このレストランは静かです。",
        meaning: "This restaurant is quiet.",
        note: "静か is a な-adjective that tells us the restaurant is quiet; no な appears here.",
        pattern: "Thing は な-adjective です",
      },
      {
        id: "yasui-hoteru-desu",
        japanese: "安いホテルです。",
        meaning: "It is an inexpensive hotel.",
        note: "An い-adjective keeps its final い directly before a noun.",
        pattern: "い-adjective + Noun",
      },
      {
        id: "shizuka-na-heya-desu",
        japanese: "静かな部屋です。",
        meaning: "It is a quiet room.",
        note: "A な-adjective adds な directly before a noun.",
        pattern: "な-adjective + な + Noun",
      },
    ],
    name: "Adjectives",
    terms: [
      {
        definition: "A word that describes a person, place, thing, or idea, such as big or quiet.",
        term: "adjective",
      },
      {
        definition: "An adjective whose dictionary form ends in い, such as 大きい.",
        term: "い-adjective",
      },
      {
        definition: "An adjective that uses な when it comes directly before a noun, such as 静かな部屋.",
        term: "な-adjective",
      },
      {
        definition: "A word that names a person, place, thing, or idea.",
        term: "noun",
      },
    ],
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
