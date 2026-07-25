import { LingWordmark } from "../brand";
import { NavigationLink } from "../navigation-feedback";

type NetworkPosition =
  | "combined-sounds"
  | "food"
  | "greetings"
  | "hiragana"
  | "japan"
  | "japanese"
  | "kana"
  | "katakana"
  | "mora-timing"
  | "navigation"
  | "pitch-accent"
  | "shopping"
  | "sound-marks";

function NetworkGlyph({ position }: { position: NetworkPosition }) {
  if (position === "japanese") {
    return (
      <svg aria-hidden="true" data-position={position} viewBox="0 0 40 24">
        <path className="station-map-travel" d="M14 8v14" />
        <path className="station-map-sound" d="M14 8h20" />
        <circle className="station-map-current station-map-interchange" cx="14" cy="8" r="5" />
      </svg>
    );
  }

  if (
    position === "japan"
    || position === "greetings"
    || position === "navigation"
    || position === "food"
  ) {
    return (
      <svg aria-hidden="true" data-position={position} viewBox="0 0 40 24">
        <path className="station-map-travel" d="M20 2v20" />
        <circle className="station-map-current" cx="20" cy="12" r="4" />
      </svg>
    );
  }

  if (position === "shopping") {
    return (
      <svg
        aria-hidden="true"
        data-position={position}
        data-terminal="true"
        viewBox="0 0 40 24"
      >
        <path className="station-map-travel" d="M20 2v17" />
        <circle className="station-map-current" cx="20" cy="19" r="4" />
      </svg>
    );
  }

  if (position === "kana") {
    return (
      <svg
        aria-hidden="true"
        data-position={position}
        viewBox="0 0 40 24"
      >
        <path className="station-map-sound" d="M6 8h28" />
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

  if (position === "katakana" || position === "sound-marks") {
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

  if (position === "combined-sounds") {
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
