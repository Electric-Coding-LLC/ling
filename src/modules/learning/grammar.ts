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
  readonly spokenParts?: readonly GrammarSpokenPart[];
};

export type GrammarSpokenPart = {
  readonly japanese: string;
  readonly reading: string;
  /** Vocabulary entry this surface form comes from when grammar changes the word. */
  readonly vocabularyId?: string;
};

export type GrammarLessonPart = {
  readonly japanese: string;
  readonly label: string;
};

export type GrammarLessonExample = {
  readonly explanation: string;
  readonly heading: string;
  readonly itemIndex: number;
};

export type GrammarLesson = {
  readonly examples: readonly GrammarLessonExample[];
  readonly explanation: string;
  readonly heading: string;
  readonly moreExplanation: string;
  readonly moreHeading: string;
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
      "A basic polite Japanese statement can follow this pattern: [topic] は [information] です.",
      "は marks the topic—the person, thing, or time the sentence is about. The words after は give information about that topic.",
    ],
    id: "statements",
    items: [
      {
        audio: "/audio/ja-grammar-watashi-wa-sensei-desu.wav",
        id: "watashi-wa-sensei-desu",
        japanese: "私は先生です。",
        meaning: "I am a teacher.",
        note: "私は marks 私 as the topic. 先生です identifies the speaker as a teacher.",
        pattern: "私は … = As for me …",
        spokenParts: [
          { japanese: "私", reading: "わたし" },
          { japanese: "は", reading: "わ" },
          { japanese: "先生", reading: "せんせい" },
          { japanese: "です", reading: "です" },
        ],
      },
      {
        audio: "/audio/ja-grammar-kore-wa-mizu-desu.wav",
        id: "kore-wa-mizu-desu",
        japanese: "これは水です。",
        meaning: "This is water.",
        note: "これは marks これ, “this,” as the topic. 水です identifies it as water.",
        pattern: "これは … = As for this …",
        spokenParts: [
          { japanese: "これ", reading: "これ" },
          { japanese: "は", reading: "わ" },
          { japanese: "水", reading: "みず" },
          { japanese: "です", reading: "です" },
        ],
      },
      {
        audio: "/audio/ja-grammar-watashi-mo-sensei-desu.wav",
        id: "watashi-mo-sensei-desu",
        japanese: "私も先生です。",
        meaning: "I am also a teacher.",
        note: "も replaces は to include the speaker: someone else is a teacher, and the speaker is too.",
        pattern: "私も … = As for me, too …",
        spokenParts: [
          { japanese: "私", reading: "わたし" },
          { japanese: "も", reading: "も" },
          { japanese: "先生", reading: "せんせい" },
          { japanese: "です", reading: "です" },
        ],
      },
      {
        audio: "/audio/ja-grammar-sore-wa-koohii-desu.wav",
        id: "sore-wa-koohii-desu",
        japanese: "それはコーヒーです。",
        meaning: "That is coffee.",
        note: "それ refers to something near the listener. は marks it as the topic.",
        pattern: "それは … = As for that …",
        spokenParts: [
          { japanese: "それ", reading: "それ" },
          { japanese: "は", reading: "わ" },
          { japanese: "コーヒー", reading: "コーヒー" },
          { japanese: "です", reading: "です" },
        ],
      },
      {
        audio: "/audio/ja-grammar-are-wa-ocha-desu.wav",
        id: "are-wa-ocha-desu",
        japanese: "あれはお茶です。",
        meaning: "That over there is tea.",
        note: "あれ refers to something away from both speaker and listener. は marks it as the topic.",
        pattern: "あれは … = As for that over there …",
        spokenParts: [
          { japanese: "あれ", reading: "あれ" },
          { japanese: "は", reading: "わ" },
          { japanese: "お茶", reading: "おちゃ" },
          { japanese: "です", reading: "です" },
        ],
      },
      {
        audio: "/audio/ja-grammar-koko-wa-eki-desu.wav",
        id: "koko-wa-eki-desu",
        japanese: "ここは駅です。",
        meaning: "This is the station.",
        note: "ここ means “here.” ここは makes this place the topic, and 駅です identifies it as the station.",
        pattern: "ここは … = As for here …",
        spokenParts: [
          { japanese: "ここ", reading: "ここ" },
          { japanese: "は", reading: "わ" },
          { japanese: "駅", reading: "えき" },
          { japanese: "です", reading: "です" },
        ],
      },
      {
        audio: "/audio/ja-grammar-soko-wa-toire-desu.wav",
        id: "soko-wa-toire-desu",
        japanese: "そこはトイレです。",
        meaning: "That is the restroom.",
        note: "そこ means “there,” near the listener. そこは makes that place the topic.",
        pattern: "そこは … = As for there …",
        spokenParts: [
          { japanese: "そこ", reading: "そこ" },
          { japanese: "は", reading: "わ" },
          { japanese: "トイレ", reading: "トイレ" },
          { japanese: "です", reading: "です" },
        ],
      },
      {
        audio: "/audio/ja-grammar-kore-mo-mizu-desu.wav",
        id: "kore-mo-mizu-desu",
        japanese: "これも水です。",
        meaning: "This is also water.",
        note: "も replaces は: another thing is water, and this is water too.",
        pattern: "これも … = As for this, too …",
        spokenParts: [
          { japanese: "これ", reading: "これ" },
          { japanese: "も", reading: "も" },
          { japanese: "水", reading: "みず" },
          { japanese: "です", reading: "です" },
        ],
      },
    ],
    lesson: {
      examples: [
        {
          explanation: "私は先生です means “I am a teacher.” The sentence names 私 as the topic and identifies that person as a teacher.",
          heading: "The basic pattern",
          itemIndex: 0,
        },
        {
          explanation: "In これは水です, これ (“this”) is the topic. 水です identifies it as water.",
          heading: "The topic can be a thing",
          itemIndex: 1,
        },
        {
          explanation: "も replaces は when the topic is included as well. 私も先生です means “I am also a teacher.”",
          heading: "Use も for “also”",
          itemIndex: 2,
        },
      ],
      explanation: "In 私は先生です, each part has a specific job.",
      heading: "How the sentence is built",
      moreExplanation: "These statements use the same structure with words from earlier stations.",
      moreHeading: "More statements",
      parts: [
        { japanese: "私", label: "私 means “I” or “me.” It is the topic of this sentence." },
        { japanese: "は", label: "は marks 私 as the topic. When は is used as the topic marker, it is pronounced wa." },
        { japanese: "先生", label: "先生 is the information given about the topic: the speaker is a teacher." },
        { japanese: "です", label: "です puts the statement in the polite form. It often corresponds to “am,” “is,” or “are” in English, but it is not an exact equivalent of the English verb “to be.”" },
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
      "A yes-or-no question adds か to the end of a polite statement. これは水です becomes これは水ですか: “Is this water?”",
      "A question word asks for missing information. どこ means “where” and replaces the information about a place.",
    ],
    id: "questions",
    items: [
      {
        audio: "/audio/ja-grammar-kore-wa-mizu-desu-ka.wav",
        id: "kore-wa-mizu-desu-ka",
        japanese: "これは水ですか。",
        meaning: "Is this water?",
        note: "か turns これは水です into a yes-or-no question.",
        pattern: "Statement + か",
        spokenParts: [
          { japanese: "これ", reading: "これ" },
          { japanese: "は", reading: "わ" },
          { japanese: "水", reading: "みず" },
          { japanese: "です", reading: "です" },
          { japanese: "か", reading: "か" },
        ],
      },
      {
        audio: "/audio/ja-grammar-sore-mo-mizu-desu-ka.wav",
        id: "sore-mo-mizu-desu-ka",
        japanese: "それも水ですか。",
        meaning: "Is that also water?",
        note: "も still means “also”; か turns the whole sentence into a question.",
        pattern: "Statement with も + か",
        spokenParts: [
          { japanese: "それ", reading: "それ" },
          { japanese: "も", reading: "も" },
          { japanese: "水", reading: "みず" },
          { japanese: "です", reading: "です" },
          { japanese: "か", reading: "か" },
        ],
      },
      {
        audio: "/audio/ja-grammar-toire-wa-doko-desu-ka.wav",
        id: "toire-wa-doko-desu-ka",
        japanese: "トイレはどこですか。",
        meaning: "Where is the restroom?",
        note: "どこ asks for the location of the restroom.",
        pattern: "Place は どこですか",
        spokenParts: [
          { japanese: "トイレ", reading: "トイレ" },
          { japanese: "は", reading: "わ" },
          { japanese: "どこ", reading: "どこ" },
          { japanese: "です", reading: "です" },
          { japanese: "か", reading: "か" },
        ],
      },
      {
        audio: "/audio/ja-grammar-sore-wa-koohii-desu-ka.wav",
        id: "sore-wa-koohii-desu-ka",
        japanese: "それはコーヒーですか。",
        meaning: "Is that coffee?",
        note: "か asks whether the statement それはコーヒーです is true.",
        pattern: "Statement + か",
        spokenParts: [
          { japanese: "それ", reading: "それ" },
          { japanese: "は", reading: "わ" },
          { japanese: "コーヒー", reading: "コーヒー" },
          { japanese: "です", reading: "です" },
          { japanese: "か", reading: "か" },
        ],
      },
      {
        audio: "/audio/ja-grammar-are-wa-ocha-desu-ka.wav",
        id: "are-wa-ocha-desu-ka",
        japanese: "あれはお茶ですか。",
        meaning: "Is that over there tea?",
        note: "か asks whether the distant thing is tea.",
        pattern: "Statement + か",
        spokenParts: [
          { japanese: "あれ", reading: "あれ" },
          { japanese: "は", reading: "わ" },
          { japanese: "お茶", reading: "おちゃ" },
          { japanese: "です", reading: "です" },
          { japanese: "か", reading: "か" },
        ],
      },
      {
        audio: "/audio/ja-grammar-koko-wa-eki-desu-ka.wav",
        id: "koko-wa-eki-desu-ka",
        japanese: "ここは駅ですか。",
        meaning: "Is this the station?",
        note: "か asks whether this place is the station.",
        pattern: "Statement + か",
        spokenParts: [
          { japanese: "ここ", reading: "ここ" },
          { japanese: "は", reading: "わ" },
          { japanese: "駅", reading: "えき" },
          { japanese: "です", reading: "です" },
          { japanese: "か", reading: "か" },
        ],
      },
      {
        audio: "/audio/ja-grammar-eki-wa-doko-desu-ka.wav",
        id: "eki-wa-doko-desu-ka",
        japanese: "駅はどこですか。",
        meaning: "Where is the station?",
        note: "どこ asks for the station’s location.",
        pattern: "Place は どこですか",
        spokenParts: [
          { japanese: "駅", reading: "えき" },
          { japanese: "は", reading: "わ" },
          { japanese: "どこ", reading: "どこ" },
          { japanese: "です", reading: "です" },
          { japanese: "か", reading: "か" },
        ],
      },
      {
        audio: "/audio/ja-grammar-sensei-wa-doko-desu-ka.wav",
        id: "sensei-wa-doko-desu-ka",
        japanese: "先生はどこですか。",
        meaning: "Where is the teacher?",
        note: "どこ asks for the teacher’s location.",
        pattern: "Person は どこですか",
        spokenParts: [
          { japanese: "先生", reading: "せんせい" },
          { japanese: "は", reading: "わ" },
          { japanese: "どこ", reading: "どこ" },
          { japanese: "です", reading: "です" },
          { japanese: "か", reading: "か" },
        ],
      },
    ],
    lesson: {
      examples: [
        {
          explanation: "これは水ですか means “Is this water?” The statement stays intact and か makes it a question.",
          heading: "Add か to ask yes or no",
          itemIndex: 0,
        },
        {
          explanation: "それも水ですか means “Is that also water?” も keeps its earlier meaning; か makes the result a question.",
          heading: "Earlier grammar still works",
          itemIndex: 1,
        },
        {
          explanation: "トイレはどこですか means “Where is the restroom?” どこ asks for the missing place.",
          heading: "Ask where with どこ",
          itemIndex: 2,
        },
      ],
      explanation: "In これは水ですか, か changes a complete statement into a yes-or-no question.",
      heading: "How the question is built",
      moreExplanation: "These questions use the same structure with words from earlier stations.",
      moreHeading: "More questions",
      parts: [
        { japanese: "これ", label: "これ means “this.” It is the topic of the question." },
        { japanese: "は", label: "は marks これ as the topic. It is pronounced wa here." },
        { japanese: "水", label: "水 means “water.” This is the information being checked." },
        { japanese: "です", label: "です keeps the sentence in the polite form." },
        { japanese: "か", label: "か marks the sentence as a yes-or-no question." },
      ],
    },
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
      "の connects one noun to another. In [owner] の [thing], the first noun identifies who the second noun belongs to or is associated with.",
      "私の名前 means “my name”: 私 identifies the owner, の makes the connection, and 名前 is the thing being identified.",
    ],
    id: "possession",
    items: [
      {
        audio: "/audio/ja-grammar-kore-wa-watashi-no-namae-desu.wav",
        id: "kore-wa-watashi-no-namae-desu",
        japanese: "これは私の名前です。",
        meaning: "This is my name.",
        note: "私の名前 is one noun phrase meaning “my name.”",
        pattern: "これは [owner] の [thing] です",
        spokenParts: [
          { japanese: "これ", reading: "これ" },
          { japanese: "は", reading: "わ" },
          { japanese: "私", reading: "わたし" },
          { japanese: "の", reading: "の" },
          { japanese: "名前", reading: "なまえ" },
          { japanese: "です", reading: "です" },
        ],
      },
      {
        audio: "/audio/ja-grammar-sore-wa-sensei-no-koohii-desu.wav",
        id: "sore-wa-sensei-no-koohii-desu",
        japanese: "それは先生のコーヒーです。",
        meaning: "That is the teacher's coffee.",
        note: "先生のコーヒー identifies the coffee as belonging to the teacher.",
        pattern: "それは [owner] の [thing] です",
        spokenParts: [
          { japanese: "それ", reading: "それ" },
          { japanese: "は", reading: "わ" },
          { japanese: "先生", reading: "せんせい" },
          { japanese: "の", reading: "の" },
          { japanese: "コーヒー", reading: "コーヒー" },
          { japanese: "です", reading: "です" },
        ],
      },
      {
        audio: "/audio/ja-grammar-are-wa-tomodachi-no-kuruma-desu.wav",
        id: "are-wa-tomodachi-no-kuruma-desu",
        japanese: "あれは友達の車です。",
        meaning: "That over there is my friend's car.",
        note: "友達の車 works as one noun phrase meaning “my friend’s car.”",
        pattern: "あれは [owner] の [thing] です",
        spokenParts: [
          { japanese: "あれ", reading: "あれ" },
          { japanese: "は", reading: "わ" },
          { japanese: "友達", reading: "ともだち" },
          { japanese: "の", reading: "の" },
          { japanese: "車", reading: "くるま" },
          { japanese: "です", reading: "です" },
        ],
      },
      {
        audio: "/audio/ja-grammar-kore-wa-watashi-no-mizu-desu.wav",
        id: "kore-wa-watashi-no-mizu-desu",
        japanese: "これは私の水です。",
        meaning: "This is my water.",
        note: "私の水 identifies the water as belonging to the speaker.",
        pattern: "これは [owner] の [thing] です",
        spokenParts: [
          { japanese: "これ", reading: "これ" },
          { japanese: "は", reading: "わ" },
          { japanese: "私", reading: "わたし" },
          { japanese: "の", reading: "の" },
          { japanese: "水", reading: "みず" },
          { japanese: "です", reading: "です" },
        ],
      },
      {
        audio: "/audio/ja-grammar-sore-wa-sensei-no-namae-desu.wav",
        id: "sore-wa-sensei-no-namae-desu",
        japanese: "それは先生の名前です。",
        meaning: "That is the teacher's name.",
        note: "先生の名前 means “the teacher’s name.”",
        pattern: "それは [owner] の [thing] です",
        spokenParts: [
          { japanese: "それ", reading: "それ" },
          { japanese: "は", reading: "わ" },
          { japanese: "先生", reading: "せんせい" },
          { japanese: "の", reading: "の" },
          { japanese: "名前", reading: "なまえ" },
          { japanese: "です", reading: "です" },
        ],
      },
      {
        audio: "/audio/ja-grammar-are-wa-kazoku-no-kuruma-desu.wav",
        id: "are-wa-kazoku-no-kuruma-desu",
        japanese: "あれは家族の車です。",
        meaning: "That over there is my family's car.",
        note: "家族の車 means “my family’s car.”",
        pattern: "あれは [owner] の [thing] です",
        spokenParts: [
          { japanese: "あれ", reading: "あれ" },
          { japanese: "は", reading: "わ" },
          { japanese: "家族", reading: "かぞく" },
          { japanese: "の", reading: "の" },
          { japanese: "車", reading: "くるま" },
          { japanese: "です", reading: "です" },
        ],
      },
      {
        audio: "/audio/ja-grammar-kore-wa-tomodachi-no-ocha-desu.wav",
        id: "kore-wa-tomodachi-no-ocha-desu",
        japanese: "これは友達のお茶です。",
        meaning: "This is my friend's tea.",
        note: "友達のお茶 means “my friend’s tea.”",
        pattern: "これは [owner] の [thing] です",
        spokenParts: [
          { japanese: "これ", reading: "これ" },
          { japanese: "は", reading: "わ" },
          { japanese: "友達", reading: "ともだち" },
          { japanese: "の", reading: "の" },
          { japanese: "お茶", reading: "おちゃ" },
          { japanese: "です", reading: "です" },
        ],
      },
      {
        audio: "/audio/ja-grammar-sore-wa-watashi-no-koohii-desu.wav",
        id: "sore-wa-watashi-no-koohii-desu",
        japanese: "それは私のコーヒーです。",
        meaning: "That is my coffee.",
        note: "私のコーヒー identifies the coffee as belonging to the speaker.",
        pattern: "それは [owner] の [thing] です",
        spokenParts: [
          { japanese: "それ", reading: "それ" },
          { japanese: "は", reading: "わ" },
          { japanese: "私", reading: "わたし" },
          { japanese: "の", reading: "の" },
          { japanese: "コーヒー", reading: "コーヒー" },
          { japanese: "です", reading: "です" },
        ],
      },
    ],
    lesson: {
      examples: [
        {
          explanation: "これは私の名前です means “This is my name.” 私の名前 is one noun phrase: “my name.”",
          heading: "Connect an owner with の",
          itemIndex: 0,
        },
        {
          explanation: "それは先生のコーヒーです means “That is the teacher’s coffee.” The noun before の identifies the owner.",
          heading: "The owner can be another person",
          itemIndex: 1,
        },
        {
          explanation: "友達の車 works as a single unit meaning “my friend’s car.” It fits into the statement pattern you already know.",
          heading: "The connected nouns form one phrase",
          itemIndex: 2,
        },
      ],
      explanation: "In 私の名前, の connects the owner 私 to the thing 名前. The entire phrase works as one noun.",
      heading: "How the noun phrase is built",
      moreExplanation: "Each example combines familiar nouns with の.",
      moreHeading: "More noun connections",
      parts: [
        { japanese: "これ", label: "これ means “this.” It is the topic of the sentence." },
        { japanese: "は", label: "は marks これ as the topic. It is pronounced wa here." },
        { japanese: "私", label: "私 means “I” or “me.” Here it identifies the owner." },
        { japanese: "の", label: "の connects the owner 私 to the noun 名前." },
        { japanese: "名前", label: "名前 means “name.” 私の名前 together means “my name.”" },
        { japanese: "です", label: "です keeps the statement in the polite form." },
      ],
    },
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
      "Existence sentences say that someone or something is in a place. Use あります for things and います for people.",
      "Put に after the place and が after the thing or person that exists: [place] に [thing or person] が あります／います.",
    ],
    id: "existence",
    items: [
      {
        audio: "/audio/ja-grammar-koko-ni-mizu-ga-arimasu.wav",
        id: "koko-ni-mizu-ga-arimasu",
        japanese: "ここに水があります。",
        meaning: "There is water here.",
        note: "あります is used because 水 is a thing.",
        pattern: "Place に Thing が あります",
        spokenParts: [
          { japanese: "ここ", reading: "ここ" },
          { japanese: "に", reading: "に" },
          { japanese: "水", reading: "みず" },
          { japanese: "が", reading: "が" },
          { japanese: "あります", reading: "あります" },
        ],
      },
      {
        audio: "/audio/ja-grammar-koko-ni-sensei-ga-imasu.wav",
        id: "koko-ni-sensei-ga-imasu",
        japanese: "ここに先生がいます。",
        meaning: "The teacher is here.",
        note: "います is used because 先生 is a person.",
        pattern: "Place に Person が います",
        spokenParts: [
          { japanese: "ここ", reading: "ここ" },
          { japanese: "に", reading: "に" },
          { japanese: "先生", reading: "せんせい" },
          { japanese: "が", reading: "が" },
          { japanese: "います", reading: "います" },
        ],
      },
      {
        audio: "/audio/ja-grammar-soko-ni-toire-ga-arimasu.wav",
        id: "soko-ni-toire-ga-arimasu",
        japanese: "そこにトイレがあります。",
        meaning: "There is a restroom there.",
        note: "に marks そこ as the place. が marks トイレ as what exists there.",
        pattern: "Place に Thing が あります",
        spokenParts: [
          { japanese: "そこ", reading: "そこ" },
          { japanese: "に", reading: "に" },
          { japanese: "トイレ", reading: "トイレ" },
          { japanese: "が", reading: "が" },
          { japanese: "あります", reading: "あります" },
        ],
      },
      {
        audio: "/audio/ja-grammar-asoko-ni-eki-ga-arimasu.wav",
        id: "asoko-ni-eki-ga-arimasu",
        japanese: "あそこに駅があります。",
        meaning: "There is a station over there.",
        note: "あります is used because 駅 is a place, not a person.",
        pattern: "Place に Thing が あります",
        spokenParts: [
          { japanese: "あそこ", reading: "あそこ" },
          { japanese: "に", reading: "に" },
          { japanese: "駅", reading: "えき" },
          { japanese: "が", reading: "が" },
          { japanese: "あります", reading: "あります" },
        ],
      },
      {
        audio: "/audio/ja-grammar-koko-ni-tomodachi-ga-imasu.wav",
        id: "koko-ni-tomodachi-ga-imasu",
        japanese: "ここに友達がいます。",
        meaning: "My friend is here.",
        note: "います is used because 友達 is a person.",
        pattern: "Place に Person が います",
        spokenParts: [
          { japanese: "ここ", reading: "ここ" },
          { japanese: "に", reading: "に" },
          { japanese: "友達", reading: "ともだち" },
          { japanese: "が", reading: "が" },
          { japanese: "います", reading: "います" },
        ],
      },
      {
        audio: "/audio/ja-grammar-soko-ni-kazoku-ga-imasu.wav",
        id: "soko-ni-kazoku-ga-imasu",
        japanese: "そこに家族がいます。",
        meaning: "My family is there.",
        note: "います is used because 家族 refers to people.",
        pattern: "Place に Person が います",
        spokenParts: [
          { japanese: "そこ", reading: "そこ" },
          { japanese: "に", reading: "に" },
          { japanese: "家族", reading: "かぞく" },
          { japanese: "が", reading: "が" },
          { japanese: "います", reading: "います" },
        ],
      },
      {
        audio: "/audio/ja-grammar-asoko-ni-kuruma-ga-arimasu.wav",
        id: "asoko-ni-kuruma-ga-arimasu",
        japanese: "あそこに車があります。",
        meaning: "There is a car over there.",
        note: "あります is used because 車 is a thing.",
        pattern: "Place に Thing が あります",
        spokenParts: [
          { japanese: "あそこ", reading: "あそこ" },
          { japanese: "に", reading: "に" },
          { japanese: "車", reading: "くるま" },
          { japanese: "が", reading: "が" },
          { japanese: "あります", reading: "あります" },
        ],
      },
      {
        audio: "/audio/ja-grammar-koko-ni-kodomo-ga-imasu.wav",
        id: "koko-ni-kodomo-ga-imasu",
        japanese: "ここに子どもがいます。",
        meaning: "There is a child here.",
        note: "います is used because 子ども is a person.",
        pattern: "Place に Person が います",
        spokenParts: [
          { japanese: "ここ", reading: "ここ" },
          { japanese: "に", reading: "に" },
          { japanese: "子ども", reading: "こども" },
          { japanese: "が", reading: "が" },
          { japanese: "います", reading: "います" },
        ],
      },
    ],
    lesson: {
      examples: [
        {
          explanation: "ここに水があります means “There is water here.” Use あります when the thing in the place is not a person or animal.",
          heading: "Use あります for things",
          itemIndex: 0,
        },
        {
          explanation: "ここに先生がいます means “The teacher is here.” Use います for people and animals.",
          heading: "Use います for people",
          itemIndex: 1,
        },
        {
          explanation: "そこにトイレがあります means “There is a restroom there.” The sentence begins with the place, followed by に.",
          heading: "Put the place first",
          itemIndex: 2,
        },
      ],
      explanation: "The existence sentence starts with ここ, the place. に marks that place, が marks 水 as what exists, and あります says that it is there.",
      heading: "How the existence sentence is built",
      moreExplanation: "The same structure works with the places, people, and things you already know.",
      moreHeading: "More existence sentences",
      parts: [
        { japanese: "ここ", label: "ここ means “here.” It names the place." },
        { japanese: "に", label: "に marks ここ as the place where something exists." },
        { japanese: "水", label: "水 means “water.” It is the thing in that place." },
        { japanese: "が", label: "が marks 水 as what exists." },
        { japanese: "あります", label: "あります says that a thing exists or is present." },
      ],
    },
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
      "A polite action sentence ends its verb with ます. The action words are familiar; only their polite sentence form is new.",
      "A particle shows each word’s job: を marks what the action affects, で marks where it happens, and に marks the destination or person addressed.",
    ],
    id: "verbs",
    items: [
      {
        audio: "/audio/ja-grammar-watashi-wa-mizu-o-nomimasu.wav",
        id: "watashi-wa-mizu-o-nomimasu",
        japanese: "私は水を飲みます。",
        meaning: "I drink water.",
        note: "飲む changes to the polite form 飲みます. を marks 水 as what is drunk.",
        pattern: "Person は Thing を Verb-ます",
        spokenParts: [
          { japanese: "私", reading: "わたし" },
          { japanese: "は", reading: "わ" },
          { japanese: "水", reading: "みず" },
          { japanese: "を", reading: "お" },
          { japanese: "飲みます", reading: "のみます", vocabularyId: "nomu" },
        ],
      },
      {
        audio: "/audio/ja-grammar-watashi-wa-eki-ni-ikimasu.wav",
        id: "watashi-wa-eki-ni-ikimasu",
        japanese: "私は駅に行きます。",
        meaning: "I go to the station.",
        note: "行く changes to 行きます. に marks 駅 as the destination.",
        pattern: "Person は Place に Verb-ます",
        spokenParts: [
          { japanese: "私", reading: "わたし" },
          { japanese: "は", reading: "わ" },
          { japanese: "駅", reading: "えき" },
          { japanese: "に", reading: "に" },
          { japanese: "行きます", reading: "いきます", vocabularyId: "iku" },
        ],
      },
      {
        audio: "/audio/ja-grammar-watashi-wa-eki-de-machimasu.wav",
        id: "watashi-wa-eki-de-machimasu",
        japanese: "私は駅で待ちます。",
        meaning: "I wait at the station.",
        note: "待つ changes to 待ちます. で marks 駅 as where the action happens.",
        pattern: "Person は Place で Verb-ます",
        spokenParts: [
          { japanese: "私", reading: "わたし" },
          { japanese: "は", reading: "わ" },
          { japanese: "駅", reading: "えき" },
          { japanese: "で", reading: "で" },
          { japanese: "待ちます", reading: "まちます", vocabularyId: "matsu" },
        ],
      },
      {
        audio: "/audio/ja-grammar-watashi-wa-koohii-o-nomimasu.wav",
        id: "watashi-wa-koohii-o-nomimasu",
        japanese: "私はコーヒーを飲みます。",
        meaning: "I drink coffee.",
        note: "を marks コーヒー as what is drunk.",
        pattern: "Person は Thing を Verb-ます",
        spokenParts: [
          { japanese: "私", reading: "わたし" },
          { japanese: "は", reading: "わ" },
          { japanese: "コーヒー", reading: "コーヒー" },
          { japanese: "を", reading: "お" },
          { japanese: "飲みます", reading: "のみます", vocabularyId: "nomu" },
        ],
      },
      {
        audio: "/audio/ja-grammar-watashi-wa-gohan-o-tabemasu.wav",
        id: "watashi-wa-gohan-o-tabemasu",
        japanese: "私はご飯を食べます。",
        meaning: "I eat rice.",
        note: "食べる changes to 食べます. を marks ご飯 as what is eaten.",
        pattern: "Person は Thing を Verb-ます",
        spokenParts: [
          { japanese: "私", reading: "わたし" },
          { japanese: "は", reading: "わ" },
          { japanese: "ご飯", reading: "ごはん" },
          { japanese: "を", reading: "お" },
          { japanese: "食べます", reading: "たべます", vocabularyId: "taberu" },
        ],
      },
      {
        audio: "/audio/ja-grammar-watashi-wa-densha-o-mimasu.wav",
        id: "watashi-wa-densha-o-mimasu",
        japanese: "私は電車を見ます。",
        meaning: "I see the train.",
        note: "見る changes to 見ます. を marks 電車 as what is seen.",
        pattern: "Person は Thing を Verb-ます",
        spokenParts: [
          { japanese: "私", reading: "わたし" },
          { japanese: "は", reading: "わ" },
          { japanese: "電車", reading: "でんしゃ" },
          { japanese: "を", reading: "お" },
          { japanese: "見ます", reading: "みます", vocabularyId: "miru" },
        ],
      },
      {
        audio: "/audio/ja-grammar-watashi-wa-sensei-ni-kikimasu.wav",
        id: "watashi-wa-sensei-ni-kikimasu",
        japanese: "私は先生に聞きます。",
        meaning: "I ask the teacher.",
        note: "聞く changes to 聞きます. に marks 先生 as the person being asked.",
        pattern: "Person は Person に Verb-ます",
        spokenParts: [
          { japanese: "私", reading: "わたし" },
          { japanese: "は", reading: "わ" },
          { japanese: "先生", reading: "せんせい" },
          { japanese: "に", reading: "に" },
          { japanese: "聞きます", reading: "ききます", vocabularyId: "kiku" },
        ],
      },
      {
        audio: "/audio/ja-grammar-watashi-wa-ocha-o-kaimasu.wav",
        id: "watashi-wa-ocha-o-kaimasu",
        japanese: "私はお茶を買います。",
        meaning: "I buy tea.",
        note: "買う changes to 買います. を marks お茶 as what is bought.",
        pattern: "Person は Thing を Verb-ます",
        spokenParts: [
          { japanese: "私", reading: "わたし" },
          { japanese: "は", reading: "わ" },
          { japanese: "お茶", reading: "おちゃ" },
          { japanese: "を", reading: "お" },
          { japanese: "買います", reading: "かいます", vocabularyId: "kau" },
        ],
      },
    ],
    lesson: {
      examples: [
        {
          explanation: "私は水を飲みます means “I drink water.” 飲む changes to the polite form 飲みます, and を marks what is drunk.",
          heading: "Put the action in polite form",
          itemIndex: 0,
        },
        {
          explanation: "私は駅に行きます means “I go to the station.” に marks 駅 as the destination.",
          heading: "Use に for a destination",
          itemIndex: 1,
        },
        {
          explanation: "私は駅で待ちます means “I wait at the station.” で marks 駅 as the place where waiting happens.",
          heading: "Use で for the action’s location",
          itemIndex: 2,
        },
      ],
      explanation: "The verb 飲む becomes 飲みます in a polite sentence. The particle を marks 水 as the thing affected by that action.",
      heading: "How the action sentence is built",
      moreExplanation: "Each sentence uses a familiar action in its polite ます form.",
      moreHeading: "More action sentences",
      parts: [
        { japanese: "私", label: "私 is the topic: the person doing the action." },
        { japanese: "は", label: "は marks 私 as the topic. It is pronounced wa here." },
        { japanese: "水", label: "水 is the thing affected by the action." },
        { japanese: "を", label: "The particle を marks 水 as the object of the verb. It is pronounced o." },
        { japanese: "飲みます", label: "飲みます is the polite form of the verb 飲む, “to drink.”" },
      ],
    },
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
      "Tense places an action in time. Japanese nonpast covers present and future actions; the time word tells you which meaning applies.",
      "Keep ます for the nonpast. Change it to ました for the past.",
    ],
    id: "tense",
    items: [
      {
        audio: "/audio/ja-grammar-kyou-watashi-wa-eki-ni-ikimasu.wav",
        id: "kyou-watashi-wa-eki-ni-ikimasu",
        japanese: "今日、私は駅に行きます。",
        meaning: "I will go to the station today.",
        note: "今日 places the nonpast verb 行きます in the present day.",
        pattern: "Verb-ます",
        spokenParts: [
          { japanese: "今日、", reading: "きょう", vocabularyId: "kyou" },
          { japanese: "私", reading: "わたし" },
          { japanese: "は", reading: "わ" },
          { japanese: "駅", reading: "えき" },
          { japanese: "に", reading: "に" },
          { japanese: "行きます", reading: "いきます", vocabularyId: "iku" },
        ],
      },
      {
        audio: "/audio/ja-grammar-kinou-watashi-wa-eki-ni-ikimashita.wav",
        id: "kinou-watashi-wa-eki-ni-ikimashita",
        japanese: "昨日、私は駅に行きました。",
        meaning: "I went to the station yesterday.",
        note: "行きました places the action in the past.",
        pattern: "Verb-ました",
        spokenParts: [
          { japanese: "昨日、", reading: "きのう", vocabularyId: "kinou" },
          { japanese: "私", reading: "わたし" },
          { japanese: "は", reading: "わ" },
          { japanese: "駅", reading: "えき" },
          { japanese: "に", reading: "に" },
          { japanese: "行きました", reading: "いきました", vocabularyId: "iku" },
        ],
      },
      {
        audio: "/audio/ja-grammar-ashita-watashi-wa-koohii-o-nomimasu.wav",
        id: "ashita-watashi-wa-koohii-o-nomimasu",
        japanese: "明日、私はコーヒーを飲みます。",
        meaning: "I will drink coffee tomorrow.",
        note: "明日 gives the nonpast verb 飲みます a future meaning.",
        pattern: "Verb-ます",
        spokenParts: [
          { japanese: "明日、", reading: "あした", vocabularyId: "ashita" },
          { japanese: "私", reading: "わたし" },
          { japanese: "は", reading: "わ" },
          { japanese: "コーヒー", reading: "コーヒー" },
          { japanese: "を", reading: "お" },
          { japanese: "飲みます", reading: "のみます", vocabularyId: "nomu" },
        ],
      },
      {
        audio: "/audio/ja-grammar-kinou-watashi-wa-koohii-o-nomimashita.wav",
        id: "kinou-watashi-wa-koohii-o-nomimashita",
        japanese: "昨日、私はコーヒーを飲みました。",
        meaning: "I drank coffee yesterday.",
        note: "飲みました is the past form of 飲みます.",
        pattern: "Verb-ました",
        spokenParts: [
          { japanese: "昨日、", reading: "きのう", vocabularyId: "kinou" },
          { japanese: "私", reading: "わたし" },
          { japanese: "は", reading: "わ" },
          { japanese: "コーヒー", reading: "コーヒー" },
          { japanese: "を", reading: "お" },
          { japanese: "飲みました", reading: "のみました", vocabularyId: "nomu" },
        ],
      },
      {
        audio: "/audio/ja-grammar-kyou-watashi-wa-sensei-ni-kikimasu.wav",
        id: "kyou-watashi-wa-sensei-ni-kikimasu",
        japanese: "今日、私は先生に聞きます。",
        meaning: "I will ask the teacher today.",
        note: "今日 places 聞きます in the present day.",
        pattern: "Verb-ます",
        spokenParts: [
          { japanese: "今日、", reading: "きょう", vocabularyId: "kyou" },
          { japanese: "私", reading: "わたし" },
          { japanese: "は", reading: "わ" },
          { japanese: "先生", reading: "せんせい" },
          { japanese: "に", reading: "に" },
          { japanese: "聞きます", reading: "ききます", vocabularyId: "kiku" },
        ],
      },
      {
        audio: "/audio/ja-grammar-kinou-watashi-wa-sensei-ni-kikimashita.wav",
        id: "kinou-watashi-wa-sensei-ni-kikimashita",
        japanese: "昨日、私は先生に聞きました。",
        meaning: "I asked the teacher yesterday.",
        note: "聞きました places the action in the past.",
        pattern: "Verb-ました",
        spokenParts: [
          { japanese: "昨日、", reading: "きのう", vocabularyId: "kinou" },
          { japanese: "私", reading: "わたし" },
          { japanese: "は", reading: "わ" },
          { japanese: "先生", reading: "せんせい" },
          { japanese: "に", reading: "に" },
          { japanese: "聞きました", reading: "ききました", vocabularyId: "kiku" },
        ],
      },
      {
        audio: "/audio/ja-grammar-ashita-watashi-wa-ocha-o-kaimasu.wav",
        id: "ashita-watashi-wa-ocha-o-kaimasu",
        japanese: "明日、私はお茶を買います。",
        meaning: "I will buy tea tomorrow.",
        note: "明日 gives 買います a future meaning.",
        pattern: "Verb-ます",
        spokenParts: [
          { japanese: "明日、", reading: "あした", vocabularyId: "ashita" },
          { japanese: "私", reading: "わたし" },
          { japanese: "は", reading: "わ" },
          { japanese: "お茶", reading: "おちゃ" },
          { japanese: "を", reading: "お" },
          { japanese: "買います", reading: "かいます", vocabularyId: "kau" },
        ],
      },
      {
        audio: "/audio/ja-grammar-kinou-watashi-wa-ocha-o-kaimashita.wav",
        id: "kinou-watashi-wa-ocha-o-kaimashita",
        japanese: "昨日、私はお茶を買いました。",
        meaning: "I bought tea yesterday.",
        note: "買いました is the past form of 買います.",
        pattern: "Verb-ました",
        spokenParts: [
          { japanese: "昨日、", reading: "きのう", vocabularyId: "kinou" },
          { japanese: "私", reading: "わたし" },
          { japanese: "は", reading: "わ" },
          { japanese: "お茶", reading: "おちゃ" },
          { japanese: "を", reading: "お" },
          { japanese: "買いました", reading: "かいました", vocabularyId: "kau" },
        ],
      },
    ],
    lesson: {
      examples: [
        {
          explanation: "今日、私は駅に行きます uses the nonpast 行きます. 今日 places the action in the present day.",
          heading: "Use ます for nonpast actions",
          itemIndex: 0,
        },
        {
          explanation: "昨日、私は駅に行きました changes ます to ました. That change places the action in the past.",
          heading: "Change ます to ました for the past",
          itemIndex: 1,
        },
        {
          explanation: "明日 makes the nonpast 飲みます clearly future: “I will drink coffee tomorrow.”",
          heading: "Let the time word resolve the meaning",
          itemIndex: 2,
        },
      ],
      explanation: "This tense sentence begins with 今日, then uses the action sentence you already know. 行きます is nonpast; 今日 tells you when it happens.",
      heading: "How the time sentence is built",
      moreExplanation: "Compare ます and ました while the familiar time words make the contrast explicit.",
      moreHeading: "More nonpast and past sentences",
      parts: [
        { japanese: "今日", label: "今日 means “today.” It fixes the action in time." },
        { japanese: "私", label: "私 is the topic: the person doing the action." },
        { japanese: "は", label: "は marks 私 as the topic." },
        { japanese: "駅", label: "駅 is the destination." },
        { japanese: "に", label: "に marks 駅 as the destination." },
        { japanese: "行きます", label: "行きます is the nonpast form of the verb 行く." },
      ],
    },
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
      "Negation changes a sentence from yes to no. A noun sentence uses じゃないです.",
      "A polite verb uses ません in the nonpast and ませんでした in the past. ありません says that a thing is not present.",
    ],
    id: "negation",
    items: [
      {
        audio: "/audio/ja-grammar-kore-wa-mizu-janai-desu.wav",
        id: "kore-wa-mizu-janai-desu",
        japanese: "これは水じゃないです。",
        meaning: "This is not water.",
        note: "じゃないです makes the noun statement 水です negative.",
        pattern: "Thing は Noun じゃないです",
        spokenParts: [
          { japanese: "これ", reading: "これ" },
          { japanese: "は", reading: "わ" },
          { japanese: "水", reading: "みず" },
          { japanese: "じゃないです", reading: "じゃないです" },
        ],
      },
      {
        audio: "/audio/ja-grammar-watashi-wa-koohii-o-nomimasen.wav",
        id: "watashi-wa-koohii-o-nomimasen",
        japanese: "私はコーヒーを飲みません。",
        meaning: "I do not drink coffee.",
        note: "飲みません is the polite nonpast negative of 飲む.",
        pattern: "Verb-ません",
        spokenParts: [
          { japanese: "私", reading: "わたし" },
          { japanese: "は", reading: "わ" },
          { japanese: "コーヒー", reading: "コーヒー" },
          { japanese: "を", reading: "お" },
          { japanese: "飲みません", reading: "のみません", vocabularyId: "nomu" },
        ],
      },
      {
        audio: "/audio/ja-grammar-kinou-watashi-wa-mizu-o-nomimasen-deshita.wav",
        id: "kinou-watashi-wa-mizu-o-nomimasen-deshita",
        japanese: "昨日、私は水を飲みませんでした。",
        meaning: "I did not drink water yesterday.",
        note: "飲みませんでした is the polite past negative of 飲む.",
        pattern: "Verb-ませんでした",
        spokenParts: [
          { japanese: "昨日、", reading: "きのう", vocabularyId: "kinou" },
          { japanese: "私", reading: "わたし" },
          { japanese: "は", reading: "わ" },
          { japanese: "水", reading: "みず" },
          { japanese: "を", reading: "お" },
          { japanese: "飲みませんでした", reading: "のみませんでした", vocabularyId: "nomu" },
        ],
      },
      {
        audio: "/audio/ja-grammar-koko-ni-toire-ga-arimasen.wav",
        id: "koko-ni-toire-ga-arimasen",
        japanese: "ここにトイレがありません。",
        meaning: "There is no restroom here.",
        note: "ありません is the negative form of あります.",
        pattern: "Thing が ありません",
        spokenParts: [
          { japanese: "ここ", reading: "ここ" },
          { japanese: "に", reading: "に" },
          { japanese: "トイレ", reading: "トイレ" },
          { japanese: "が", reading: "が" },
          { japanese: "ありません", reading: "ありません" },
        ],
      },
      {
        audio: "/audio/ja-grammar-sore-wa-ocha-janai-desu.wav",
        id: "sore-wa-ocha-janai-desu",
        japanese: "それはお茶じゃないです。",
        meaning: "That is not tea.",
        note: "じゃないです makes the noun statement お茶です negative.",
        pattern: "Thing は Noun じゃないです",
        spokenParts: [
          { japanese: "それ", reading: "それ" },
          { japanese: "は", reading: "わ" },
          { japanese: "お茶", reading: "おちゃ" },
          { japanese: "じゃないです", reading: "じゃないです" },
        ],
      },
      {
        audio: "/audio/ja-grammar-watashi-wa-ocha-o-kaimasen.wav",
        id: "watashi-wa-ocha-o-kaimasen",
        japanese: "私はお茶を買いません。",
        meaning: "I do not buy tea.",
        note: "買いません is the polite nonpast negative of 買う.",
        pattern: "Verb-ません",
        spokenParts: [
          { japanese: "私", reading: "わたし" },
          { japanese: "は", reading: "わ" },
          { japanese: "お茶", reading: "おちゃ" },
          { japanese: "を", reading: "お" },
          { japanese: "買いません", reading: "かいません", vocabularyId: "kau" },
        ],
      },
      {
        audio: "/audio/ja-grammar-kinou-watashi-wa-eki-ni-ikimasen-deshita.wav",
        id: "kinou-watashi-wa-eki-ni-ikimasen-deshita",
        japanese: "昨日、私は駅に行きませんでした。",
        meaning: "I did not go to the station yesterday.",
        note: "行きませんでした is the polite past negative of 行く.",
        pattern: "Verb-ませんでした",
        spokenParts: [
          { japanese: "昨日、", reading: "きのう", vocabularyId: "kinou" },
          { japanese: "私", reading: "わたし" },
          { japanese: "は", reading: "わ" },
          { japanese: "駅", reading: "えき" },
          { japanese: "に", reading: "に" },
          { japanese: "行きませんでした", reading: "いきませんでした", vocabularyId: "iku" },
        ],
      },
      {
        audio: "/audio/ja-grammar-soko-ni-mizu-ga-arimasen.wav",
        id: "soko-ni-mizu-ga-arimasen",
        japanese: "そこに水がありません。",
        meaning: "There is no water there.",
        note: "ありません says that 水 is not present there.",
        pattern: "Thing が ありません",
        spokenParts: [
          { japanese: "そこ", reading: "そこ" },
          { japanese: "に", reading: "に" },
          { japanese: "水", reading: "みず" },
          { japanese: "が", reading: "が" },
          { japanese: "ありません", reading: "ありません" },
        ],
      },
    ],
    lesson: {
      examples: [
        {
          explanation: "これは水じゃないです changes “This is water” to “This is not water.” Use じゃないです after a noun.",
          heading: "Make a noun statement negative",
          itemIndex: 0,
        },
        {
          explanation: "飲みます becomes 飲みません. This is the polite nonpast negative: “I do not drink coffee.”",
          heading: "Use ません for a nonpast verb",
          itemIndex: 1,
        },
        {
          explanation: "飲みませんでした says the action did not happen in the past. 昨日 makes that time explicit.",
          heading: "Use ませんでした for the past",
          itemIndex: 2,
        },
      ],
      explanation: "Negation leaves the familiar topic and noun in place, then replaces です with じゃないです.",
      heading: "How the negative noun sentence is built",
      moreExplanation: "The remaining examples apply the same negative endings to familiar nouns, actions, and existence sentences.",
      moreHeading: "More negative sentences",
      parts: [
        { japanese: "これ", label: "これ means “this.” It is the topic." },
        { japanese: "は", label: "は marks これ as the topic." },
        { japanese: "水", label: "水 is the noun being denied." },
        { japanese: "じゃないです", label: "じゃないです is the polite spoken negation of a noun statement." },
      ],
    },
    name: "Negation",
    terms: [
      {
        definition: "Changing a sentence so it says something is not true or does not happen.",
        term: "negation",
      },
    ],
  },
  {
    description: [
      "An adjective describes the topic. Every descriptive word you already know in this course is an い-adjective.",
      "In a polite statement, put the い-adjective directly before です: [topic] は [い-adjective] です.",
    ],
    id: "adjectives",
    items: [
      {
        audio: "/audio/ja-grammar-kore-wa-ookii-desu.wav",
        id: "kore-wa-ookii-desu",
        japanese: "これは大きいです。",
        meaning: "This is big.",
        note: "大きい describes the topic これ.",
        pattern: "Thing は い-adjective です",
        spokenParts: [
          { japanese: "これ", reading: "これ" },
          { japanese: "は", reading: "わ" },
          { japanese: "大きい", reading: "おおきい" },
          { japanese: "です", reading: "です" },
        ],
      },
      {
        audio: "/audio/ja-grammar-sore-wa-chiisai-desu.wav",
        id: "sore-wa-chiisai-desu",
        japanese: "それは小さいです。",
        meaning: "That is small.",
        note: "小さい describes the topic それ.",
        pattern: "Thing は い-adjective です",
        spokenParts: [
          { japanese: "それ", reading: "それ" },
          { japanese: "は", reading: "わ" },
          { japanese: "小さい", reading: "ちいさい" },
          { japanese: "です", reading: "です" },
        ],
      },
      {
        audio: "/audio/ja-grammar-kyou-wa-atsui-desu.wav",
        id: "kyou-wa-atsui-desu",
        japanese: "今日は暑いです。",
        meaning: "It is hot today.",
        note: "暑い describes 今日 as hot.",
        pattern: "Time は い-adjective です",
        spokenParts: [
          { japanese: "今日", reading: "きょう" },
          { japanese: "は", reading: "わ" },
          { japanese: "暑い", reading: "あつい" },
          { japanese: "です", reading: "です" },
        ],
      },
      {
        audio: "/audio/ja-grammar-kyou-wa-samui-desu.wav",
        id: "kyou-wa-samui-desu",
        japanese: "今日は寒いです。",
        meaning: "It is cold today.",
        note: "寒い describes 今日 as cold.",
        pattern: "Time は い-adjective です",
        spokenParts: [
          { japanese: "今日", reading: "きょう" },
          { japanese: "は", reading: "わ" },
          { japanese: "寒い", reading: "さむい" },
          { japanese: "です", reading: "です" },
        ],
      },
      {
        audio: "/audio/ja-grammar-kore-wa-takai-desu.wav",
        id: "kore-wa-takai-desu",
        japanese: "これは高いです。",
        meaning: "This is expensive.",
        note: "高い describes the topic これ as expensive.",
        pattern: "Thing は い-adjective です",
        spokenParts: [
          { japanese: "これ", reading: "これ" },
          { japanese: "は", reading: "わ" },
          { japanese: "高い", reading: "たかい" },
          { japanese: "です", reading: "です" },
        ],
      },
      {
        audio: "/audio/ja-grammar-sore-wa-yasui-desu.wav",
        id: "sore-wa-yasui-desu",
        japanese: "それは安いです。",
        meaning: "That is inexpensive.",
        note: "安い describes the topic それ as inexpensive.",
        pattern: "Thing は い-adjective です",
        spokenParts: [
          { japanese: "それ", reading: "それ" },
          { japanese: "は", reading: "わ" },
          { japanese: "安い", reading: "やすい" },
          { japanese: "です", reading: "です" },
        ],
      },
      {
        audio: "/audio/ja-grammar-kore-wa-ii-desu.wav",
        id: "kore-wa-ii-desu",
        japanese: "これはいいです。",
        meaning: "This is good.",
        note: "いい describes the topic これ as good.",
        pattern: "Thing は い-adjective です",
        spokenParts: [
          { japanese: "これ", reading: "これ" },
          { japanese: "は", reading: "わ" },
          { japanese: "いい", reading: "いい" },
          { japanese: "です", reading: "です" },
        ],
      },
      {
        audio: "/audio/ja-grammar-are-wa-ookii-desu.wav",
        id: "are-wa-ookii-desu",
        japanese: "あれは大きいです。",
        meaning: "That over there is big.",
        note: "大きい describes the topic あれ.",
        pattern: "Thing は い-adjective です",
        spokenParts: [
          { japanese: "あれ", reading: "あれ" },
          { japanese: "は", reading: "わ" },
          { japanese: "大きい", reading: "おおきい" },
          { japanese: "です", reading: "です" },
        ],
      },
    ],
    lesson: {
      examples: [
        {
          explanation: "これは大きいです means “This is big.” Put the describing word 大きい directly before です.",
          heading: "Put the adjective before です",
          itemIndex: 0,
        },
        {
          explanation: "それは小さいです keeps the same sentence frame and changes only the topic and description.",
          heading: "Describe the topic after は",
          itemIndex: 1,
        },
        {
          explanation: "今日は暑いです means “It is hot today.” A time word can be the topic just like a thing or person.",
          heading: "A time can be the topic",
          itemIndex: 2,
        },
      ],
      explanation: "The adjective 大きい gives information about the topic これ. Because it is an い-adjective, it can sit directly before です.",
      heading: "How the adjective sentence is built",
      moreExplanation: "Each sentence uses one of the descriptive words you already learned.",
      moreHeading: "More adjective sentences",
      parts: [
        { japanese: "これ", label: "これ means “this.” It is the topic." },
        { japanese: "は", label: "は marks これ as the topic." },
        { japanese: "大きい", label: "大きい means “big.” It is an い-adjective describing the topic." },
        { japanese: "です", label: "です keeps the adjective statement polite." },
      ],
    },
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
