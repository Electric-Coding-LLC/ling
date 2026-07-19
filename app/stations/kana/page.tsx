import { StationTopbar } from "../station-topbar";
import { KanaGuide } from "./kana-guide";

export default function KanaPage() {
  return (
    <main className="shell station-shell">
      <StationTopbar current="Kana" mapPosition="kana" />
      <div className="station-page station-page-kana">
        <header className="station-heading">
          <div aria-label="Lines" className="station-memberships">
            <span className="station-membership station-membership-sound" data-line="sound">
              Sound
            </span>
            <span className="station-membership station-membership-writing" data-line="writing">
              Writing
            </span>
          </div>
          <h1>Kana</h1>
        </header>
        <KanaGuide />
      </div>
    </main>
  );
}
