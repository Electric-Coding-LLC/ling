import { StationTopbar } from "../station-topbar";
import { CombinedSoundsGuide } from "../kana-extensions/kana-extensions-guide";

export const dynamic = "force-dynamic";

export default function CombinedSoundsPage() {
  return (
    <main className="shell station-shell">
      <StationTopbar current="Yōon" mapPosition="combined-sounds" />
      <div className="station-page station-page-kana-patterns">
        <CombinedSoundsGuide />
      </div>
    </main>
  );
}
