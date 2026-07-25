import { TRAVEL_ORIENTATION } from "../../../src/modules/travel";
import { StationTopbar } from "../station-topbar";
import { TravelStation } from "../travel-station";

export default function JapanPage() {
  return (
    <main className="shell station-shell">
      <StationTopbar current="Japan" mapPosition="japan" />
      <div className="station-page station-page-travel">
        <TravelStation
          intro={[
            "The Travel line is a small, always-available reference for using Japanese in Japan.",
            "You will meet kanji, kana, and romaji in the world around you. Ling keeps Japanese writing and listening primary while giving you the English meaning you need.",
          ]}
          items={[TRAVEL_ORIENTATION.japan]}
          title="Japan"
        />
      </div>
    </main>
  );
}
