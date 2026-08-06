import { getKanjiStation, type KanjiStationId } from "@/src/modules/learning/kanji";
import { KanjiGuide } from "./kanji/kanji-guide";
import { StationTopbar } from "./station-topbar";

export function KanjiStationPage({ stationId }: { readonly stationId: KanjiStationId }) {
  const station = getKanjiStation(stationId);
  return (
    <main className="shell station-shell">
      <StationTopbar current={station.name} networkFocus={station.id} />
      <div className={`station-page station-page-vocabulary station-page-kanji station-page-${station.id}`}>
        <KanjiGuide station={station} />
      </div>
    </main>
  );
}
