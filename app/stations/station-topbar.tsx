import { LingWordmark } from "../brand";
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
        title="Ling map"
      >
        <LingWordmark className="wordmark" />
      </NavigationLink>
      <nav aria-label="Station navigation" className="station-nav">
        <NavigationLink
          aria-label={`Return to map from ${current}`}
          className="station-network-link"
          href={`/?focus=${networkFocus}`}
          title="Map"
        >
          <span aria-hidden="true" className="station-map-chevron" />
          Map
        </NavigationLink>
      </nav>
    </header>
  );
}
