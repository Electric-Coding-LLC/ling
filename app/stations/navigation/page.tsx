import { TRAVEL_PHRASES } from "../../../src/modules/travel";
import { StationTopbar } from "../station-topbar";
import { TravelStation } from "../travel-station";

export default function NavigationPage() {
  return (
    <main className="shell station-shell">
      <StationTopbar current="Navigation" networkFocus="navigation" />
      <div className="station-page station-page-travel station-page-navigation">
        <TravelStation
          items={TRAVEL_PHRASES.navigation}
          review
          showPronunciation
          title="Navigation"
        />
      </div>
    </main>
  );
}
