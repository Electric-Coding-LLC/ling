import { redirect } from "next/navigation";
import { isStationAvailableToCurrentUser } from "../../station-availability";
import { StationTopbar } from "../station-topbar";
import { SoundMarksGuide } from "../kana-extensions/kana-extensions-guide";

export const dynamic = "force-dynamic";

export default async function SoundMarksPage() {
  if (!(await isStationAvailableToCurrentUser("sound-marks"))) {
    redirect("/?focus=sound-marks");
  }

  return (
    <main className="shell station-shell">
      <StationTopbar current="Dakuten & Handakuten" mapPosition="sound-marks" />
      <div className="station-page station-page-kana-patterns">
        <SoundMarksGuide />
      </div>
    </main>
  );
}
