import { redirect } from "next/navigation";
import { isStationAvailableToCurrentUser } from "../../station-availability";
import { StationTopbar } from "../station-topbar";
import { KanaExtensionsGuide } from "./kana-extensions-guide";

export const dynamic = "force-dynamic";

export default async function KanaExtensionsPage() {
  if (!(await isStationAvailableToCurrentUser("kana-extensions"))) {
    redirect("/?focus=kana-extensions");
  }

  return (
    <main className="shell station-shell">
      <StationTopbar current="Kana extensions" mapPosition="kana-extensions" />
      <div className="station-page station-page-kana-extensions">
        <KanaExtensionsGuide />
      </div>
    </main>
  );
}
