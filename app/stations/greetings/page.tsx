import { TRAVEL_PHRASES } from "../../../src/modules/travel";
import { StationTopbar } from "../station-topbar";
import { TravelStation } from "../travel-station";

export default function GreetingsPage() {
  return (
    <main className="shell station-shell">
      <StationTopbar current="Greetings" mapPosition="greetings" />
      <div className="station-page station-page-travel">
        <TravelStation
          intro={["A few greetings and courtesies can carry the beginning of an interaction. Tap any phrase to hear it."]}
          items={TRAVEL_PHRASES.greetings}
          title="Greetings"
        />
      </div>
    </main>
  );
}
