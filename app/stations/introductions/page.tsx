import { TRAVEL_PHRASES } from "../../../src/modules/travel";
import { StationTopbar } from "../station-topbar";
import { TravelStation } from "../travel-station";

export default function IntroductionsPage() {
  return (
    <main className="shell station-shell">
      <StationTopbar current="Introductions" mapPosition="introductions" />
      <div className="station-page station-page-travel station-page-introductions">
        <TravelStation
          items={TRAVEL_PHRASES.introductions}
          review
          showPronunciation
          title="Introductions"
        />
      </div>
    </main>
  );
}
