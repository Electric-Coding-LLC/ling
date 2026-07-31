import type { ReactElement } from "react";
import { NavigationLink } from "../navigation-feedback";
import { StationTopbar } from "./station-topbar";

type FoundationLine = "sound" | "vocabulary" | "writing";

type LineIntroduction = {
  readonly overview: readonly string[];
  readonly start: ReactElement;
  readonly title: string;
};

const LINE_INTRODUCTIONS: Readonly<Record<FoundationLine, LineIntroduction>> = {
  sound: {
    overview: [
      "Japanese pronunciation is built from a small set of clear vowels and a steady rhythm. Those regular beats are called morae, and they shape the timing of every word.",
      "Pitch moves within a word as well. Listening for where the voice rises and falls helps speech sound natural and can distinguish words that otherwise sound alike.",
    ],
    start: (
      <>
        Begin with{" "}
        <NavigationLink href="/stations/vowels" loadingStation="Vowels">
          Vowels
        </NavigationLink>{" "}
        to establish the five core sounds. Continue to{" "}
        <NavigationLink
          href="/stations/mora-timing"
          loadingStation="Mora Timing"
        >
          Mora Timing
        </NavigationLink>{" "}
        for rhythm, then{" "}
        <NavigationLink
          href="/stations/pitch-accent"
          loadingStation="Pitch Accent"
        >
          Pitch Accent
        </NavigationLink>{" "}
        for the rise and fall across a word.
      </>
    ),
    title: "Sound",
  },
  writing: {
    overview: [
      "Japanese uses two Kana scripts to represent the same set of sounds. Hiragana carries most Japanese words and grammar; Katakana handles borrowed words, foreign names, emphasis, and sound effects.",
      "The basic charts are only the beginning. Dakuten and handakuten change consonants, while small や, ゆ, and よ combine with a preceding Kana to make Yōon sounds such as きゃ, きゅ, and きょ.",
    ],
    start: (
      <>
        Begin with{" "}
        <NavigationLink href="/stations/kana" loadingStation="Kana">
          Kana
        </NavigationLink>{" "}
        for the relationship between the scripts. Then study{" "}
        <NavigationLink href="/stations/hiragana" loadingStation="Hiragana">
          Hiragana
        </NavigationLink>{" "}
        and{" "}
        <NavigationLink href="/stations/katakana" loadingStation="Katakana">
          Katakana
        </NavigationLink>{" "}
        before moving to{" "}
        <NavigationLink
          href="/stations/sound-marks"
          loadingStation="Dakuten & Handakuten"
        >
          Dakuten &amp; Handakuten
        </NavigationLink>{" "}
        and{" "}
        <NavigationLink
          href="/stations/combined-sounds"
          loadingStation="Yōon"
        >
          Yōon
        </NavigationLink>
        .
      </>
    ),
    title: "Writing",
  },
  vocabulary: {
    overview: [
      "A useful word is more than a translation. You need to recognize its meaning, writing, and sound together.",
      "Ling keeps those parts on one reference surface: the English meaning, Japanese word, Rōmaji, and audio. The same words also appear in Mora Timing and Pitch Accent, so pronunciation stays connected to vocabulary.",
    ],
    start: (
      <>
        Begin with{" "}
        <NavigationLink href="/stations/words" loadingStation="Words">
          Words
        </NavigationLink>
        . Tap any entry to hear it, then use the review when you want to
        practice recall.
      </>
    ),
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
        mapPosition={line}
      />
      <div
        className={`station-page station-page-${line} station-page-foundation-line`}
      >
        <header className="station-heading">
          <div className="station-heading-row">
            <div aria-label="Network line" className="station-memberships">
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
          <section
            aria-labelledby={`${line}-learning-title`}
            className="foundation-line-learning"
          >
            <h2 id={`${line}-learning-title`}>Start small</h2>
            <p>{introduction.start}</p>
          </section>
        </section>
      </div>
    </main>
  );
}
