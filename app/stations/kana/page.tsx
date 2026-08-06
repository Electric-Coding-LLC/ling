import { NavigationLink } from "../../navigation-feedback";
import { FoundationLineTour } from "../foundation-line-tour";
import { StationTopbar } from "../station-topbar";

export const dynamic = "force-static";

export default function KanaPage() {
  return (
    <main className="shell station-shell">
      <StationTopbar current="Kana" networkFocus="kana" />
      <div className="station-page station-page-kana">
        <header className="station-heading">
          <div className="station-heading-row">
            <div aria-label="Lines" className="station-memberships">
              <span className="station-membership station-membership-foundation" data-line="foundation">
                Foundations
              </span>
              <span className="station-membership station-membership-writing" data-line="kana">
                Kana
              </span>
            </div>
          </div>
          <h1>Kana</h1>
        </header>

        <section className="kana-guide">
          <div className="station-intro kana-intro">
            <p>
              <strong>Kana is the collective name for Hiragana and Katakana.</strong>{" "}
              They are two sets of characters used to write how Japanese words
              sound. Both sets represent the same sounds with different shapes.
            </p>
            <p>
              Hiragana is used for everyday Japanese words and grammar.
              Katakana is used mainly for borrowed words, foreign names,
              emphasis, and sound effects.
            </p>
          </div>

          <FoundationLineTour tourId="kana" />

          <p className="kana-table-intro">
            Both scripts use the five sounds introduced at{" "}
            <NavigationLink href="/stations/vowels" loadingStation="Vowels">
              Vowels
            </NavigationLink>{" "}
            on the Sound line.
          </p>
        </section>
      </div>
    </main>
  );
}
