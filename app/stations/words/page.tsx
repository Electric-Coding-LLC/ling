import { StationTopbar } from "../station-topbar";
import { VocabularyGuide } from "../vocabulary-guide";

export const dynamic = "force-dynamic";

export default function WordsPage() {
  return (
    <main className="shell station-shell">
      <StationTopbar current="Words" mapPosition="words" />
      <div className="station-page station-page-vocabulary station-page-words">
        <VocabularyGuide />
      </div>
    </main>
  );
}
