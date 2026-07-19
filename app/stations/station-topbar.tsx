import Link from "next/link";
import { LingWordmark } from "../brand";

type NetworkPosition = "hiragana" | "katakana" | "mora-timing";

function NetworkGlyph({ position }: { position: NetworkPosition }) {
  if (position === "hiragana") {
    return (
      <svg
        aria-hidden="true"
        data-position={position}
        viewBox="0 0 40 24"
      >
        <path className="station-map-script" d="M20 2v14" />
        <path className="station-map-sound" d="M20 16h18" />
        <circle className="station-map-current station-map-interchange" cx="20" cy="16" r="5" />
      </svg>
    );
  }

  if (position === "katakana") {
    return (
      <svg
        aria-hidden="true"
        data-position={position}
        data-terminal="true"
        viewBox="0 0 40 24"
      >
        <path className="station-map-script" d="M20 5v17" />
        <circle className="station-map-current" cx="20" cy="5" r="4" />
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
      <Link
        aria-label="Return to the Ling network map"
        className="brand-link"
        href="/"
        title="Network map"
      >
        <LingWordmark className="wordmark" />
      </Link>
      <nav aria-label="Station navigation" className="station-nav">
        <Link
          aria-label={`Return to network map from ${current}`}
          className="station-map-link"
          href={`/?focus=${mapPosition}`}
          title="Network map"
        >
          <NetworkGlyph position={mapPosition} />
        </Link>
      </nav>
    </header>
  );
}
