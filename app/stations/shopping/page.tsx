import { TRAVEL_PHRASES } from "../../../src/modules/travel";
import { StationTopbar } from "../station-topbar";
import { TravelStation } from "../travel-station";

export default function ShoppingPage() {
  return (
    <main className="shell station-shell">
      <StationTopbar current="Shopping" mapPosition="shopping" />
      <div className="station-page station-page-travel">
        <TravelStation
          intro={["Use these to ask about price, choose an item, find another option, or confirm payment. Tap any phrase to hear it."]}
          items={TRAVEL_PHRASES.shopping}
          title="Shopping"
        />
      </div>
    </main>
  );
}
