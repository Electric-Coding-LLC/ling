import { redirect } from "next/navigation";
import { isStationAvailableToCurrentUser } from "../../station-availability";
import { StationTopbar } from "../station-topbar";
import { KatakanaGuide } from "./katakana-guide";

export const dynamic = "force-dynamic";

export default async function KatakanaPage() {
  if (!(await isStationAvailableToCurrentUser("katakana"))) {
    redirect("/?focus=katakana");
  }

  return (
    <main className="shell station-shell">
      <StationTopbar current="Katakana" mapPosition="katakana" />
      <div className="station-page station-page-katakana">
        <KatakanaGuide />
      </div>
    </main>
  );
}
