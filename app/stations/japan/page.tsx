import { JAPAN_STARTER_PHRASES } from "../../../src/modules/travel";
import { FoundationLineTour } from "../foundation-line-tour";
import { StationTopbar } from "../station-topbar";
import { TravelStation } from "../travel-station";

export default function JapanPage() {
  return (
    <main className="shell station-shell">
      <StationTopbar current="Japan" networkFocus="japan" />
      <div className="station-page station-page-travel station-page-japan">
        <TravelStation
          framed
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
                <FoundationLineTour tourId="japan" />
                <h2 id="japan-learning-title">Three useful expressions</h2>
                <p>
                  Listen to three expressions that are useful throughout a first
                  trip: excuse me, thank you, and please.
                </p>
              </section>
            </section>,
          ]}
          items={JAPAN_STARTER_PHRASES}
          lines={["Foundations", "Japan"]}
          meaningFirst={false}
          showPronunciation
          title="Japan"
        />
      </div>
    </main>
  );
}
