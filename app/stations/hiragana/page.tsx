import { redirect } from "next/navigation";
import { isStationAvailableToCurrentUser } from "../../station-availability";
import { StationTopbar } from "../station-topbar";
import { HiraganaGuide } from "./hiragana-guide";

export const dynamic = "force-dynamic";

export default async function HiraganaPage() {
  if (!(await isStationAvailableToCurrentUser("hiragana"))) {
    redirect("/?focus=hiragana");
  }

  return (
    <main className="shell station-shell">
      <StationTopbar current="Hiragana" mapPosition="hiragana" />
      <div className="station-page station-page-hiragana">
        <HiraganaGuide />
      </div>
    </main>
  );
}
