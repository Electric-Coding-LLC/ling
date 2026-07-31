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
          <svg aria-hidden="true" viewBox="0 0 24 24">
            <path d="m3 6 5-2 8 3 5-2v13l-5 2-8-3-5 2V6Z" />
            <path d="M8 4v13M16 7v13" />
          </svg>
        </NavigationLink>
      </nav>
    </header>
  );
}
