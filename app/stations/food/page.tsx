import { TRAVEL_PHRASES } from "../../../src/modules/travel";
import { StationTopbar } from "../station-topbar";
import { TravelStation } from "../travel-station";

export default function FoodPage() {
  return (
    <main className="shell station-shell">
      <StationTopbar current="Food" mapPosition="food" />
      <div className="station-page station-page-travel">
        <TravelStation
          intro={["Use these to point, ask a simple question, order water, or request the bill. Tap any phrase to hear it."]}
          items={TRAVEL_PHRASES.food}
          title="Food"
        />
      </div>
    </main>
  );
}
