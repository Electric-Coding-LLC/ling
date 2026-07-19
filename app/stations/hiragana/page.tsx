import { StationTopbar } from "../station-topbar";
import { HiraganaGuide } from "./hiragana-guide";

export default function HiraganaPage() {
  return (
    <main className="shell station-shell">
      <StationTopbar current="Hiragana" mapPosition="hiragana" />
      <div className="station-page station-page-hiragana">
        <header className="station-heading">
          <div aria-label="Lines" className="station-memberships">
            <span className="station-membership station-membership-sound" data-line="sound">
              Sound
            </span>
            <span className="station-membership station-membership-script" data-line="script">
              Script
            </span>
          </div>
          <h1>Hiragana</h1>
        </header>
        <HiraganaGuide />
      </div>
    </main>
  );
}
