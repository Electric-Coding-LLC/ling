export type NetworkStationKind =
  | "foundation"
  | "interchange"
  | "local"
  | "sound"
  | "sound-vocabulary-interchange"
  | "travel"
  | "travel-interchange"
  | "vocabulary"
  | "writing";

export function NetworkStationSymbol({ kind }: { kind: NetworkStationKind }) {
  const interchange = kind === "interchange"
    || kind === "travel-interchange"
    || kind === "sound-vocabulary-interchange";

  if (interchange) {
    return (
      <>
        <circle className="network-interchange-outer" r="28" />
        <circle
          className={`network-interchange-inner network-interchange-inner-${kind}`}
          r="16"
        />
      </>
    );
  }

  return (
    <>
      <circle className={`network-single-station-outer network-single-station-outer-${kind}`} r="15" />
      <circle
        className={`network-single-station-inner network-single-station-inner-${kind}`}
        r="7"
      />
    </>
  );
}
