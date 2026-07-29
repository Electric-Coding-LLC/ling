import { StationTopbar } from "../station-topbar";
import { VocabularyGuide } from "../vocabulary-guide";

export const dynamic = "force-dynamic";

export default function NounsPage() {
  return (
    <main className="shell station-shell">
      <StationTopbar current="Nouns" mapPosition="nouns" />
      <div className="station-page station-page-vocabulary station-page-nouns">
        <VocabularyGuide stationId="nouns" />
      </div>
    </main>
  );
}
