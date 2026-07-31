import { TRAVEL_PHRASES } from "../../../src/modules/travel";
import { StationTopbar } from "../station-topbar";
import { TravelStation } from "../travel-station";

export default function ShoppingPage() {
  return (
    <main className="shell station-shell">
      <StationTopbar current="Shopping" networkFocus="shopping" />
      <div className="station-page station-page-travel station-page-shopping">
        <TravelStation
          items={TRAVEL_PHRASES.shopping}
          review
          showPronunciation
          title="Shopping"
        />
      </div>
    </main>
  );
}
