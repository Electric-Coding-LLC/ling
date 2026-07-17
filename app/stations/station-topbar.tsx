import Link from "next/link";
import { LingWordmark } from "../brand";

type NetworkPosition = "vowels" | "mora-timing";

function NetworkGlyph({ position }: { position: NetworkPosition }) {
  const isVowels = position === "vowels";

  return (
    <svg
      aria-hidden="true"
      data-position={position}
      data-terminal={isVowels ? undefined : "true"}
      viewBox="0 0 40 24"
    >
      <path className="station-map-sound" d={isVowels ? "M2 8h36" : "M2 12h30"} />
      {isVowels ? <path className="station-map-script" d="M20 8v14" /> : null}
      <circle className="station-map-current" cx={isVowels ? 20 : 32} cy={isVowels ? 8 : 12} r="4" />
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
