import { TRAVEL_PHRASES } from "../../../src/modules/travel";
import { StationTopbar } from "../station-topbar";
import { TravelStation } from "../travel-station";

const JAPAN_STARTER_PHRASE_IDS = [
  "sumimasen",
  "arigatou-gozaimasu",
  "onegaishimasu",
] as const;

const JAPAN_STARTER_PHRASES = JAPAN_STARTER_PHRASE_IDS.map((id) => {
  const phrase = TRAVEL_PHRASES.greetings.find((candidate) => candidate.id === id);
  if (!phrase) {
    throw new Error(`Missing Japan starter phrase: ${id}`);
  }
  return phrase;
});

export default function JapanPage() {
  return (
    <main className="shell station-shell">
      <StationTopbar current="Japan" mapPosition="japan" />
      <div className="station-page station-page-travel station-page-japan">
        <TravelStation
          intro={[
            <section
              aria-label="Introduction to Japan"
              className="japan-orientation"
              key="japan-orientation"
            >
              <div className="japan-orientation-lead">
                <p>
                  Japan is a mountainous island country where dense, energetic
                  cities sit close to quiet neighborhoods, farming communities,
                  forests, and coastlines.
                </p>
                <p>
                  Daily life often feels organized and considerate:
                  transportation is dependable, public spaces follow clear
                  rhythms, and people pay attention to timing, noise, queues,
                  and the needs of others.
                </p>
                <p>
                  Japan is not culturally uniform. Each region has its own food,
                  dialect, climate, customs, and pace. For a visitor, it can
                  feel easy to navigate on the surface while becoming richer
                  the more closely you observe, listen, and communicate.
                </p>
              </div>
              <section
                aria-labelledby="japan-learning-title"
                className="japan-learning"
              >
                <h2 id="japan-learning-title">Start small</h2>
                <p>
                  You do not need to learn everything before a first trip. Start
                  with these three expressions and tap each one to hear how it
                  sounds.
                </p>
              </section>
            </section>,
          ]}
          items={JAPAN_STARTER_PHRASES}
          showPronunciation
          title="Japan"
        />
      </div>
    </main>
  );
}
