import { NavigationLink } from "../../navigation-feedback";
import { StationTopbar } from "../station-topbar";
import { TravelStation } from "../travel-station";

export default function JapanesePage() {
  return (
    <main className="shell station-shell">
      <StationTopbar current="Japanese" mapPosition="japanese" />
      <div className="station-page station-page-travel station-page-japanese">
        <TravelStation
          intro={[
            <section
              aria-label="Introduction to Japanese"
              className="japanese-orientation"
              key="japanese-orientation"
            >
              <p className="japanese-orientation-lead">
                Japanese is the starting point of Ling&apos;s Foundations
                network.{" "}
                <NavigationLink
                  href="/stations/romaji"
                  loadingStation="Rōmaji"
                >
                  Rōmaji
                </NavigationLink>{" "}
                is an optional reading bridge on the spine. Japan, Sound,
                Writing, and Vocabulary branch from Foundations.
              </p>
              <div className="japanese-lines">
                <section className="japanese-line">
                  <h2>Japan</h2>
                  <p>
                    Practical Japanese for introductions, getting around,
                    food, shopping, and asking for help.
                  </p>
                </section>
                <section className="japanese-line">
                  <h2>Sound</h2>
                  <p>
                    Vowels, mora timing, and pitch—how Japanese is heard and
                    spoken.
                  </p>
                </section>
                <section className="japanese-line">
                  <h2>Writing</h2>
                  <p>
                    Kana and the sound patterns used to read and write
                    Japanese.
                  </p>
                </section>
                <section className="japanese-line">
                  <h2>Vocabulary</h2>
                  <p>
                    Words studied through meaning, pronunciation, and recall.
                  </p>
                </section>
              </div>
            </section>,
          ]}
          line="Foundations"
          title="Japanese"
        />
      </div>
    </main>
  );
}
