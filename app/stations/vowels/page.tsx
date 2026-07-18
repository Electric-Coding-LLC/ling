import { StationTopbar } from "../station-topbar";
import { VowelsGuide } from "./vowels-guide";

export default function VowelsPage() {
  return (
    <main className="shell station-shell">
      <StationTopbar
        current="Vowels"
        mapPosition="vowels"
      />
      <div className="station-page station-page-vowels">
        <header className="station-heading">
          <div aria-label="Lines" className="station-memberships">
            <span className="station-membership station-membership-sound" data-line="sound">
              Sound
            </span>
            <span className="station-membership station-membership-script" data-line="script">
              Script
            </span>
          </div>
          <h1>Vowels</h1>
        </header>
        <VowelsGuide />
      </div>
    </main>
  );
}
