import { StationTopbar } from "../station-topbar";
import { TravelStation } from "../travel-station";

export default function JapanesePage() {
  return (
    <main className="shell station-shell">
      <StationTopbar current="Japanese" networkFocus="japanese" />
      <div className="station-page station-page-travel station-page-japanese">
        <TravelStation
          intro={[
            <section
              aria-label="Introduction to Japanese"
              className="japanese-orientation"
              key="japanese-orientation"
            >
              <p className="japanese-orientation-lead">
                Welcome to Japanese on Ling. You do not need to understand the
                whole language before you begin. Ling lets you enter Japanese
                one connected idea at a time and return as those ideas become
                clearer.
              </p>
              <div className="japanese-lines">
                <section className="japanese-line">
                  <h2>Foundations</h2>
                  <p>
                    The Foundations line is the organizing spine of Ling&apos;s
                    Japanese network. It connects the broad parts of the
                    language and gives their branches a shared starting point,
                    so you can see how what you are learning fits into the
                    whole.
                  </p>
                </section>
                <section className="japanese-line">
                  <h2>How to use the line</h2>
                  <p>
                    It is a map, not a lesson order or completion ladder. Open
                    any station that feels useful, move along a connection when
                    you want more depth, and return to the spine whenever you
                    need to reorient.
                  </p>
                </section>
              </div>
            </section>,
          ]}
          lines={["Foundations"]}
          title="Japanese"
        />
      </div>
    </main>
  );
}
