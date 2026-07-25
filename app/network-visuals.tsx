export type NetworkPosition =
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

export type NetworkStationKind =
  | "interchange"
  | "sound"
  | "travel"
  | "travel-interchange"
  | "writing";

export function NetworkGlyph({ position }: { position: NetworkPosition }) {
  if (position === "japanese") {
    return (
      <svg aria-hidden="true" data-position={position} viewBox="0 0 40 24">
        <path className="station-map-travel" d="M14 8v14" />
        <path className="station-map-sound" d="M14 8h14" />
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
      <svg aria-hidden="true" data-position={position} viewBox="0 0 40 24">
        <path className="station-map-sound" d="M6 8h28" />
        <path className="station-map-writing" d="M20 8v14" />
        <circle className="station-map-current station-map-interchange" cx="20" cy="8" r="5" />
      </svg>
    );
  }

  if (position === "hiragana") {
    return (
      <svg aria-hidden="true" data-position={position} viewBox="0 0 40 24">
        <path className="station-map-writing" d="M20 2v20" />
        <circle className="station-map-current" cx="20" cy="12" r="4" />
      </svg>
    );
  }

  if (position === "katakana" || position === "sound-marks") {
    return (
      <svg aria-hidden="true" data-position={position} viewBox="0 0 40 24">
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

export function NetworkStationSymbol({ kind }: { kind: NetworkStationKind }) {
  const interchange = kind === "interchange" || kind === "travel-interchange";

  if (interchange) {
    return (
      <>
        <circle className="network-interchange-outer" r="28" />
        <circle className="network-interchange-inner" r="16" />
      </>
    );
  }

  return (
    <>
      <circle className={`network-single-station-outer network-single-station-outer-${kind}`} r="15" />
      <circle className="network-single-station-inner" r="7" />
    </>
  );
}
