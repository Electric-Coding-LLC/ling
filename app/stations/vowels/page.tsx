import { StationTopbar } from "../station-topbar";
import { VowelsGuide } from "./vowels-guide";

export const dynamic = "force-static";

export default function VowelsPage() {
  return (
    <main className="shell station-shell">
      <StationTopbar current="Vowels" networkFocus="vowels" />
      <div className="station-page station-page-kana">
        <VowelsGuide />
      </div>
    </main>
  );
}
