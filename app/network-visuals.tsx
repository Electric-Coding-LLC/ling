import {
  NETWORK_GLYPH_DEFINITIONS,
  NETWORK_GLYPH_RADII,
  NETWORK_GLYPH_TOPOLOGIES,
  NETWORK_GLYPH_VIEWBOX,
  type NetworkGlyphLineRole,
  type NetworkGlyphPoint,
  type NetworkPosition,
} from "./network-glyph-model";

export type { NetworkPosition } from "./network-glyph-model";

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

export function NetworkGlyph({ position }: { position: NetworkPosition }) {
  const definition = NETWORK_GLYPH_DEFINITIONS[position];
  const geometry = NETWORK_GLYPH_TOPOLOGIES[definition.topology];
  const [currentX, currentY] = geometry.current;

  return (
    <svg
      aria-hidden="true"
      data-position={position}
      data-terminal={geometry.terminal ? "true" : undefined}
      viewBox={NETWORK_GLYPH_VIEWBOX}
    >
      {geometry.paths.map((path, index) => (
        <path
          className={lineClassName(definition.lines, path.role)}
          d={pathData(path.points)}
          key={`${path.role}-${index}`}
        />
      ))}
      <circle
        className={`station-map-current${geometry.interchange ? " station-map-interchange" : ""}`}
        cx={currentX}
        cy={currentY}
        r={geometry.interchange ? NETWORK_GLYPH_RADII.interchange : NETWORK_GLYPH_RADII.station}
      />
    </svg>
  );
}

function lineClassName(
  lines: Readonly<Partial<Record<NetworkGlyphLineRole, string>>>,
  role: NetworkGlyphLineRole,
) {
  const className = lines[role];
  if (!className) throw new Error(`Network glyph is missing its ${role} line`);
  return className;
}

function pathData(points: readonly NetworkGlyphPoint[]) {
  return points
    .map(([x, y], index) => `${index === 0 ? "M" : "L"}${x} ${y}`)
    .join("");
}

export function NetworkStationSymbol({ kind }: { kind: NetworkStationKind }) {
  const interchange = kind === "interchange"
    || kind === "travel-interchange"
    || kind === "sound-vocabulary-interchange";

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
