import { StationTopbar } from "../station-topbar";
import { KanaGuide } from "./kana-guide";

export const dynamic = "force-static";

export default function KanaPage() {
  return (
    <main className="shell station-shell">
      <StationTopbar current="Vowels" mapPosition="kana" />
      <div className="station-page station-page-kana">
        <KanaGuide />
      </div>
    </main>
  );
}
