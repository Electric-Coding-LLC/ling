import { LingWordmark } from "../brand";
import { MapIcon } from "../map-icon";
import { NavigationLink } from "../navigation-feedback";
import type { StationFocus } from "../network-map";

export function StationTopbar({
  current,
  networkFocus,
}: {
  current: string;
  networkFocus: StationFocus;
}) {
  return (
    <header className="topbar station-topbar">
      <NavigationLink
        aria-label="Return to the Ling map"
        className="brand-link"
        href={`/?focus=${networkFocus}`}
        loadingMap
        title="Ling map"
      >
        <LingWordmark className="wordmark" />
      </NavigationLink>
      <nav aria-label="Station navigation" className="station-nav">
        <NavigationLink
          aria-label={`Return to map from ${current}`}
          className="topbar-map-link"
          href={`/?focus=${networkFocus}`}
          loadingMap
          title="Map"
        >
          <MapIcon />
        </NavigationLink>
      </nav>
    </header>
  );
}
