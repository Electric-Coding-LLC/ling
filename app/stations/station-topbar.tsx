import { LingWordmark } from "../brand";
import { NavigationLink } from "../navigation-feedback";
import { NetworkGlyph, type NetworkPosition } from "../network-visuals";

export function StationTopbar({
  current,
  mapPosition,
}: {
  current: string;
  mapPosition: NetworkPosition;
}) {
  return (
    <header className="topbar station-topbar">
      <NavigationLink
        aria-label="Return to the Ling network map"
        className="brand-link"
        href={`/?focus=${mapPosition}`}
        title="Network map"
      >
        <LingWordmark className="wordmark" />
      </NavigationLink>
      <nav aria-label="Station navigation" className="station-nav">
        <NavigationLink
          aria-label={`Return to network map from ${current}`}
          className="station-map-link"
          href={`/?focus=${mapPosition}`}
          title="Network map"
        >
          <NetworkGlyph position={mapPosition} />
        </NavigationLink>
      </nav>
    </header>
  );
}
