import { LingWordmark } from "../brand";
import { NavigationLink } from "../navigation-feedback";

type NetworkPosition = "kana" | "hiragana" | "katakana" | "kana-extensions" | "mora-timing";

function NetworkGlyph({ position }: { position: NetworkPosition }) {
  if (position === "kana") {
    return (
      <svg
        aria-hidden="true"
        data-position={position}
        viewBox="0 0 40 24"
      >
        <path className="station-map-writing" d="M20 8v14" />
        <circle className="station-map-current station-map-interchange" cx="20" cy="8" r="5" />
      </svg>
    );
  }

  if (position === "hiragana") {
    return (
      <svg
        aria-hidden="true"
        data-position={position}
        viewBox="0 0 40 24"
      >
        <path className="station-map-writing" d="M20 2v20" />
        <circle className="station-map-current" cx="20" cy="12" r="4" />
      </svg>
    );
  }

  if (position === "katakana") {
    return (
      <svg
        aria-hidden="true"
        data-position={position}
        viewBox="0 0 40 24"
      >
        <path className="station-map-writing" d="M20 2v20" />
        <circle className="station-map-current" cx="20" cy="12" r="4" />
      </svg>
    );
  }

  if (position === "kana-extensions") {
    return (
      <svg
        aria-hidden="true"
        data-position={position}
        data-terminal="true"
        viewBox="0 0 40 24"
      >
        <path className="station-map-writing" d="M20 2v17" />
        <circle className="station-map-current" cx="20" cy="19" r="4" />
      </svg>
    );
  }

  return (
    <svg
      aria-hidden="true"
      data-position={position}
      data-terminal="true"
      viewBox="0 0 40 24"
    >
      <path className="station-map-sound" d="M2 12h30" />
      <circle className="station-map-current" cx="32" cy="12" r="4" />
    </svg>
  );
}

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
        href="/"
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
