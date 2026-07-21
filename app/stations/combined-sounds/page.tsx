import { redirect } from "next/navigation";
import { isStationAvailableToCurrentUser } from "../../station-availability";
import { StationTopbar } from "../station-topbar";
import { CombinedSoundsGuide } from "../kana-extensions/kana-extensions-guide";

export const dynamic = "force-dynamic";

export default async function CombinedSoundsPage() {
  if (!(await isStationAvailableToCurrentUser("combined-sounds"))) {
    redirect("/?focus=combined-sounds");
  }

  return (
    <main className="shell station-shell">
      <StationTopbar current="Yōon" mapPosition="combined-sounds" />
      <div className="station-page station-page-kana-patterns">
        <CombinedSoundsGuide />
      </div>
    </main>
  );
}
