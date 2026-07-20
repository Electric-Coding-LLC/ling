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
        <header className="station-heading">
          <div aria-label="Lines" className="station-memberships">
            <span className="station-membership station-membership-writing" data-line="writing">
              Writing
            </span>
          </div>
          <h1>Katakana</h1>
        </header>
        <KatakanaGuide />
      </div>
    </main>
  );
}
