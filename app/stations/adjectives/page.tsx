import { StationTopbar } from "../station-topbar";
import { VocabularyGuide } from "../vocabulary-guide";

export const dynamic = "force-dynamic";

export default function AdjectivesPage() {
  return (
    <main className="shell station-shell">
      <StationTopbar current="Adjectives" mapPosition="adjectives" />
      <div className="station-page station-page-vocabulary station-page-adjectives">
        <VocabularyGuide stationId="adjectives" />
      </div>
    </main>
  );
}
