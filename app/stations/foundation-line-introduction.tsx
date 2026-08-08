import { FoundationLineTour } from "./foundation-line-tour";
import { StationTopbar } from "./station-topbar";

type FoundationLine = "grammar" | "kanji" | "sound" | "vocabulary";

type LineIntroduction = {
  readonly overview: readonly string[];
  readonly title: string;
};

const LINE_INTRODUCTIONS: Readonly<Record<FoundationLine, LineIntroduction>> = {
  grammar: {
    overview: [
      "Japanese grammar connects words by marking their relationships. Particles identify the topic, an owner, an object, a place, or a destination; sentence endings express politeness, tense, and negation.",
      "These first structures are enough to identify things, ask questions, describe relationships, say that something exists, and talk about actions and qualities.",
    ],
    title: "Grammar",
  },
  kanji: {
    overview: [
      "Kanji are meaning-bearing characters used throughout written Japanese. Learn them as parts of complete words, together with each word's Kana reading and sound.",
      "A Kanji may form a word by itself, join other Kanji in a compound, or combine with Kana that completes the word and can carry grammatical change.",
    ],
    title: "Kanji",
  },
  sound: {
    overview: [
      "Japanese pronunciation depends on three things working together: the vowel sounds themselves, the morae that organize rhythm, and the high-low pitch pattern carried across those beats.",
      "Listen for each layer separately at first. Together they explain why two words with familiar sounds can still differ in timing or spoken shape.",
    ],
    title: "Sound",
  },
  vocabulary: {
    overview: [
      "A Japanese word is learned as a complete unit: what it means, how it is written, and how it sounds. A translation alone is not enough if the word cannot be recognized in speech or recalled when it is needed.",
      "This vocabulary begins with the people, objects, places, times, actions, and qualities that support an early conversation.",
    ],
    title: "Vocabulary",
  },
};

export function FoundationLineIntroduction({
  line,
}: {
  line: FoundationLine;
}) {
  const introduction = LINE_INTRODUCTIONS[line];

  return (
    <main className="shell station-shell">
      <StationTopbar
        current={introduction.title}
        networkFocus={line}
      />
      <div
        className={`station-page station-page-${line} station-page-foundation-line`}
      >
        <header className="station-heading">
          <div className="station-heading-row">
            <div
              aria-label="Network lines"
              className="station-memberships"
            >
              <span
                className="station-membership station-membership-foundation"
                data-line="foundation"
              >
                Foundations
              </span>
              <span
                className={`station-membership station-membership-${line}`}
                data-line={line}
              >
                {introduction.title}
              </span>
            </div>
          </div>
          <h1>{introduction.title}</h1>
        </header>

        <section
          aria-label={`Introduction to ${introduction.title}`}
          className="foundation-line-orientation"
        >
          <div className="foundation-line-orientation-lead">
            {introduction.overview.map((paragraph) => (
              <p key={paragraph}>{paragraph}</p>
            ))}
          </div>
          <FoundationLineTour tourId={line} />
        </section>
      </div>
    </main>
  );
}
