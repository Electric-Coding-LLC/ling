export type NetworkStationKind =
  | "foundation"
  | "grammar"
  | "interchange"
  | "kanji"
  | "local"
  | "sound"
  | "sound-vocabulary-interchange"
  | "travel"
  | "travel-interchange"
  | "vocabulary"
  | "writing";

export function NetworkStationSymbol({
  completed = false,
  kind,
}: {
  completed?: boolean;
  kind: NetworkStationKind;
}) {
  const interchange = kind === "interchange"
    || kind === "travel-interchange"
    || kind === "sound-vocabulary-interchange";

  if (interchange) {
    return (
      <>
        <circle className="network-interchange-outer" r="20" />
        <circle
          className={`network-interchange-inner network-interchange-inner-${kind}`}
          r="20"
        />
        {completed ? <StationCompleteIcon interchange /> : null}
      </>
    );
  }

  return (
    <>
      <circle className={`network-single-station-outer network-single-station-outer-${kind}`} r="9" />
      <circle
        className={`network-single-station-inner network-single-station-inner-${kind}`}
        r="9"
      />
      {completed ? <StationCompleteIcon /> : null}
    </>
  );
}

function StationCompleteIcon({ interchange = false }: { interchange?: boolean }) {
  return (
    <path
      aria-hidden="true"
      className={`network-station-complete-icon${interchange ? " network-station-complete-icon-interchange" : ""}`}
      d="m-5 1 3 3 7-7"
    />
  );
}
