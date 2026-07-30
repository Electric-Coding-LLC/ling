import { NavigationLink } from "../../navigation-feedback";
import { StationTopbar } from "../station-topbar";

export const dynamic = "force-static";

export default function KanaPage() {
  return (
    <main className="shell station-shell">
      <StationTopbar current="Kana" mapPosition="kana" />
      <div className="station-page station-page-kana">
        <header className="station-heading">
          <div className="station-heading-row">
            <div aria-label="Lines" className="station-memberships">
              <span className="station-membership station-membership-writing" data-line="writing">
                Writing
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

          <p className="kana-table-intro">
            Begin with the five shared sounds at{" "}
            <NavigationLink href="/stations/vowels" loadingStation="Vowels">
              Vowels
            </NavigationLink>.
          </p>
        </section>
      </div>
    </main>
  );
}
