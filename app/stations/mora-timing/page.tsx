import { StationTopbar } from "../station-topbar";
import { MoraTimingGuide } from "./mora-timing-guide";

export const dynamic = "force-dynamic";

export default function MoraTimingPage() {
  return (
    <main className="shell station-shell">
      <StationTopbar current="Mora" networkFocus="mora" />
      <div className="station-page station-page-mora">
        <MoraTimingGuide />
      </div>
    </main>
  );
}
