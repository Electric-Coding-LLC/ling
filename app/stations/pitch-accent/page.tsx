import { StationTopbar } from "../station-topbar";
import { PitchAccentGuide } from "./pitch-accent-guide";

export const dynamic = "force-dynamic";

export default function PitchAccentPage() {
  return (
    <main className="shell station-shell">
      <StationTopbar current="Pitch" mapPosition="pitch-accent" />
      <div className="station-page station-page-pitch-accent">
        <PitchAccentGuide />
      </div>
    </main>
  );
}
