import { TRAVEL_PHRASES } from "../../../src/modules/travel";
import { StationTopbar } from "../station-topbar";
import { TravelStation } from "../travel-station";

export default function HelpPage() {
  return (
    <main className="shell station-shell">
      <StationTopbar current="Help" mapPosition="help" />
      <div className="station-page station-page-travel station-page-help">
        <TravelStation
          items={TRAVEL_PHRASES.help}
          review
          showPronunciation
          title="Help"
        />
      </div>
    </main>
  );
}
