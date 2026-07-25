import { TRAVEL_ORIENTATION } from "../../../src/modules/travel";
import { StationTopbar } from "../station-topbar";
import { TravelStation } from "../travel-station";

export default function JapanesePage() {
  return (
    <main className="shell station-shell">
      <StationTopbar current="Japanese" mapPosition="japanese" />
      <div className="station-page station-page-travel">
        <TravelStation
          intro={[
            "Ling maps Japanese as a network. Lines connect related parts of the language, and stations are places to listen, learn, and revisit.",
            "Start wherever is useful. The map can grow with you.",
          ]}
          items={[TRAVEL_ORIENTATION.japanese]}
          title="Japanese"
        />
      </div>
    </main>
  );
}
