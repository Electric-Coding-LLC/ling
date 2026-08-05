import { getVocabularyStation, type VocabularyStationId } from "@/src/modules/learning/vocabulary";
import { StationTopbar } from "./station-topbar";
import { VocabularyGuide } from "./vocabulary-guide";

export function VocabularyStationPage({ stationId }: { readonly stationId: VocabularyStationId }) {
  const station = getVocabularyStation(stationId);
  return (
    <main className="shell station-shell">
      <StationTopbar current={station.name} networkFocus={station.id} />
      <div className={`station-page station-page-vocabulary station-page-${station.id}`}>
        <VocabularyGuide station={station} />
      </div>
    </main>
  );
}
