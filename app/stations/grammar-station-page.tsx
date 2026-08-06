import {
  getGrammarStation,
  type GrammarStationId,
} from "@/src/modules/learning/grammar";
import { GrammarGuide } from "./grammar-guide";
import { StationTopbar } from "./station-topbar";

export function GrammarStationPage({
  stationId,
}: {
  readonly stationId: GrammarStationId;
}) {
  const station = getGrammarStation(stationId);
  return (
    <main className="shell station-shell">
      <StationTopbar current={station.name} networkFocus={station.id} />
      <div className={`station-page station-page-grammar station-page-${station.id}`}>
        <GrammarGuide station={station} />
      </div>
    </main>
  );
}
