import { TRAVEL_PHRASES } from "../../../src/modules/travel";
import { StationTopbar } from "../station-topbar";
import { TravelStation } from "../travel-station";

export default function NavigationPage() {
  return (
    <main className="shell station-shell">
      <StationTopbar current="Navigation" mapPosition="navigation" />
      <div className="station-page station-page-travel">
        <TravelStation
          intro={["Use these to find a place, confirm a route, or show someone where you need to go. Tap any phrase to hear it."]}
          items={TRAVEL_PHRASES.navigation}
          title="Navigation"
        />
      </div>
    </main>
  );
}
