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
                Japanese is the language spoken by most people in Japan and by
                communities around the world. It has its own sounds, grammar,
                and ways of expressing politeness, and it is written with
                hiragana, katakana, and kanji.
              </p>
              <dl className="japanese-paths-list">
                <div>
                  <dt>hiragana</dt>
                  <dd>
                    the phonetic script used for grammar and many Japanese
                    words.{" "}
                    <span className="japanese-script-example" lang="ja">
                      ありがとう
                    </span>
                  </dd>
                </div>
                <div>
                  <dt>katakana</dt>
                  <dd>
                    the phonetic script most often used for borrowed words and
                    names.{" "}
                    <span className="japanese-script-example" lang="ja">
                      ホテル
                    </span>
                  </dd>
                </div>
                <div>
                  <dt>kanji</dt>
                  <dd>
                    characters that carry meaning.{" "}
                    <span className="japanese-script-example" lang="ja">
                      日本
                    </span>
                  </dd>
                </div>
              </dl>
              <p>
                Rōmaji uses the Roman alphabet to represent Japanese sounds. It
                is useful in some contexts, while hiragana, katakana, and kanji
                are the main writing systems used in Japanese.
              </p>
              <p>
                Visiting Japan? Start with{" "}
                <NavigationLink
                  href="/stations/romaji"
                >
                  Rōmaji
                </NavigationLink>{" "}
                on the Japan line, then use it to read the phrases that follow.
              </p>
            </section>,
          ]}
          title="Japanese"
        />
      </div>
    </main>
  );
}
