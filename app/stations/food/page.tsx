import { TRAVEL_PHRASES } from "../../../src/modules/travel";
import { StationTopbar } from "../station-topbar";
import { TravelStation } from "../travel-station";

export default function FoodPage() {
  return (
    <main className="shell station-shell">
      <StationTopbar current="Food" mapPosition="food" />
      <div className="station-page station-page-travel station-page-food">
        <TravelStation
          items={TRAVEL_PHRASES.food}
          review
          showPronunciation
          title="Food"
        />
      </div>
    </main>
  );
}
