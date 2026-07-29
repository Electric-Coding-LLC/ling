import { StationTopbar } from "../station-topbar";
import { HiraganaGuide } from "./hiragana-guide";

export const dynamic = "force-dynamic";

export default function HiraganaPage() {
  return (
    <main className="shell station-shell">
      <StationTopbar current="Hiragana" mapPosition="hiragana" />
      <div className="station-page station-page-hiragana">
        <HiraganaGuide />
      </div>
    </main>
  );
}
