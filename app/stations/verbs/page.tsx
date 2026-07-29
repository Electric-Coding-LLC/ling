import { StationTopbar } from "../station-topbar";
import { VocabularyGuide } from "../vocabulary-guide";

export const dynamic = "force-dynamic";

export default function VerbsPage() {
  return (
    <main className="shell station-shell">
      <StationTopbar current="Verbs" mapPosition="verbs" />
      <div className="station-page station-page-vocabulary station-page-verbs">
        <VocabularyGuide stationId="verbs" />
      </div>
    </main>
  );
}
