import { StationTopbar } from "../station-topbar";
import { KatakanaGuide } from "./katakana-guide";

export const dynamic = "force-dynamic";

export default function KatakanaPage() {
  return (
    <main className="shell station-shell">
      <StationTopbar current="Katakana" mapPosition="katakana" />
      <div className="station-page station-page-katakana">
        <KatakanaGuide />
      </div>
    </main>
  );
}
