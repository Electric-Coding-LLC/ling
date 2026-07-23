import { redirect } from "next/navigation";
import { isStationAvailableToCurrentUser } from "../../station-availability";
import { StationTopbar } from "../station-topbar";
import { MoraTimingGuide } from "./mora-timing-guide";

export const dynamic = "force-dynamic";

export default async function MoraTimingPage() {
  if (!(await isStationAvailableToCurrentUser("mora-timing"))) {
    redirect("/?focus=mora-timing");
  }

  return (
    <main className="shell station-shell">
      <StationTopbar current="Mora timing" mapPosition="mora-timing" />
      <div className="station-page station-page-mora">
        <MoraTimingGuide />
      </div>
    </main>
  );
}
