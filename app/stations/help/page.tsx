import { formatAppVersion, getAppVersion } from "../../../src/modules/app-version";
import { TRAVEL_PHRASES } from "../../../src/modules/travel";
import { StationTopbar } from "../station-topbar";
import { TravelStation } from "../travel-station";

export default function HelpPage() {
  const appVersion = getAppVersion();

  return (
    <main className="shell station-shell">
      <StationTopbar current="Help" networkFocus="help" />
      <div className="station-page station-page-travel station-page-help">
        <TravelStation
          items={TRAVEL_PHRASES.help}
          review
          showPronunciation
          title="Help"
        />
        <footer className="help-version">
          Version {formatAppVersion(appVersion)}
        </footer>
      </div>
    </main>
  );
}
