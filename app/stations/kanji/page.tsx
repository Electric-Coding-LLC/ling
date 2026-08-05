import { StationTopbar } from "../station-topbar";
import { KanjiGuide } from "./kanji-guide";

export const dynamic = "force-dynamic";

export default function KanjiPage() {
  return (
    <main className="shell station-shell">
      <StationTopbar current="Kanji" networkFocus="kanji" />
      <div className="station-page station-page-kanji">
        <KanjiGuide />
      </div>
    </main>
  );
}
