import type { ReactElement } from "react";
import { NavigationLink } from "../navigation-feedback";
import { StationTopbar } from "./station-topbar";

type FoundationLine = "sound" | "vocabulary" | "writing";

type LineIntroduction = {
  readonly overview: readonly string[];
  readonly start?: ReactElement;
  readonly startTitle?: string;
  readonly title: string;
};

const LINE_INTRODUCTIONS: Readonly<Record<FoundationLine, LineIntroduction>> = {
  sound: {
    overview: [
      "The Sound line brings together the parts of Japanese pronunciation that shape how a word is heard: its vowel sounds, rhythm, and pitch.",
      "Japanese is built from five core vowels and timed in short beats called morae. Pitch can rise or fall across those beats. Learning to hear all three makes unfamiliar words easier to recognize and repeat.",
    ],
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
        and meet{" "}
        <NavigationLink href="/stations/kanji" loadingStation="Kanji">
          Kanji
        </NavigationLink>{" "}
        through useful words. Explore{" "}
        <NavigationLink href="/stations/katakana" loadingStation="Katakana">
          Katakana
        </NavigationLink>{" "}
        on its own branch for borrowed words and names. Then{" "}
        <NavigationLink
          href="/stations/sound-marks"
          loadingStation="Dakuten & Handakuten"
        >
          Dakuten &amp; Handakuten
        </NavigationLink>{" "}
        and{" "}
        <NavigationLink href="/stations/combined-sounds" loadingStation="Yōon">
          Yōon
        </NavigationLink>{" "}
        extend both Kana systems. You can enter any station directly.
      </>
    ),
    startTitle: "From Kana to combined sounds",
    title: "Writing",
  },
  vocabulary: {
    overview: [
      "A useful word is more than a translation. You need to recognize its meaning, writing, and sound together.",
      "Ling keeps those parts on one reference surface: the English meaning, Japanese word, Kana reading, Rōmaji, and audio. The stations move from pointing and people toward needs, movement, time, actions, and descriptions.",
    ],
    start: (
      <>
        Begin with{" "}
        <NavigationLink href="/stations/pointing" loadingStation="Pointing">
          Pointing
        </NavigationLink>
        , then continue through the line in a useful communicative order. Tap
        any entry to hear it, or use either recall direction. Every station
        remains directly accessible.
      </>
    ),
    startTitle: "A useful order",
    title: "Vocabulary",
  },
};

export function FoundationLineIntroduction({
  line,
  showFoundations = false,
}: {
  line: FoundationLine;
  showFoundations?: boolean;
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
              aria-label={showFoundations ? "Network lines" : "Network line"}
              className="station-memberships"
            >
              {showFoundations ? (
                <span
                  className="station-membership station-membership-foundation"
                  data-line="foundation"
                >
                  Foundations
                </span>
              ) : null}
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
          {introduction.start && introduction.startTitle ? (
            <section
              aria-labelledby={`${line}-learning-title`}
              className="foundation-line-learning"
            >
              <h2 id={`${line}-learning-title`}>{introduction.startTitle}</h2>
              <p>{introduction.start}</p>
            </section>
          ) : null}
        </section>
      </div>
    </main>
  );
}
