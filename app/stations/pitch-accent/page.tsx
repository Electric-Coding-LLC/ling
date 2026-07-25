import { redirect } from "next/navigation";
import { isStationAvailableToCurrentUser } from "../../station-availability";
import { StationTopbar } from "../station-topbar";
import { PitchAccentGuide } from "./pitch-accent-guide";

export const dynamic = "force-dynamic";

export default async function PitchAccentPage() {
  if (!(await isStationAvailableToCurrentUser("pitch-accent"))) {
    redirect("/?focus=pitch-accent");
  }

  return (
    <main className="shell station-shell">
      <StationTopbar current="Pitch Accent" mapPosition="pitch-accent" />
      <div className="station-page station-page-pitch-accent">
        <PitchAccentGuide />
      </div>
    </main>
  );
}
