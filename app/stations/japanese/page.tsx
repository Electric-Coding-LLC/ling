import { StationTopbar } from "../station-topbar";
import { TravelStation } from "../travel-station";
import { FoundationLineTour } from "../foundation-line-tour";

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
                whole language before you begin. Japanese becomes easier to
                understand when its sound, writing, words, and sentence
                structure are studied as connected systems.
              </p>
              <p>
                The Foundations spine separates those systems long enough to
                show what each one contributes. Together they form the base for
                understanding and producing complete Japanese.
              </p>
              <FoundationLineTour tourId="foundations" />
            </section>,
          ]}
          lines={["Foundations"]}
          title="Japanese"
        />
      </div>
    </main>
  );
}
