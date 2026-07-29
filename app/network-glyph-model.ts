export type NetworkPosition =
  | "adjectives"
  | "combined-sounds"
  | "food"
  | "help"
  | "introductions"
  | "hiragana"
  | "japanese"
  | "kana"
  | "katakana"
  | "mora-timing"
  | "navigation"
  | "nouns"
  | "pitch-accent"
  | "romaji"
  | "shopping"
  | "sound-marks"
  | "visit"
  | "verbs"
  | "vowels"
  | "words";

export type NetworkGlyphLine =
  | "station-map-local"
  | "station-map-sound"
  | "station-map-travel"
  | "station-map-vocabulary"
  | "station-map-writing";

export type NetworkGlyphLineRole = "branch" | "horizontal" | "main" | "vertical";

export type NetworkGlyphTopology =
  | "branch-interchange"
  | "connector"
  | "corner-interchange"
  | "horizontal-terminal"
  | "horizontal-through"
  | "vertical-terminal"
  | "vertical-through";

export type NetworkGlyphPoint = readonly [x: number, y: number];

export interface NetworkGlyphGeometry {
  readonly current: NetworkGlyphPoint;
  readonly interchange?: true;
  readonly paths: readonly {
    readonly points: readonly NetworkGlyphPoint[];
    readonly role: NetworkGlyphLineRole;
  }[];
  readonly terminal?: true;
}

export interface NetworkGlyphDefinition {
  readonly lines: Partial<Record<NetworkGlyphLineRole, NetworkGlyphLine>>;
  readonly topology: NetworkGlyphTopology;
}

export const NETWORK_GLYPH_VIEWBOX = "0 0 40 30";
export const NETWORK_GLYPH_VISIBLE_SEGMENT_LENGTH = 9;
export const NETWORK_GLYPH_RADII = {
  interchange: 5,
  station: 4,
} as const;

const STATION_ARM_LENGTH =
  NETWORK_GLYPH_VISIBLE_SEGMENT_LENGTH + NETWORK_GLYPH_RADII.station;
const INTERCHANGE_ARM_LENGTH =
  NETWORK_GLYPH_VISIBLE_SEGMENT_LENGTH + NETWORK_GLYPH_RADII.interchange;
const CENTER_X = 20;
const CENTER_Y = 15;
const BRANCH_Y = 8;
const CORNER_X = 14;
const CORNER_Y = 8;
const CONNECTOR_OFFSET = STATION_ARM_LENGTH / Math.SQRT2;

export const NETWORK_GLYPH_TOPOLOGIES: Readonly<
  Record<NetworkGlyphTopology, NetworkGlyphGeometry>
> = {
  "branch-interchange": {
    current: [CENTER_X, BRANCH_Y],
    interchange: true,
    paths: [
      {
        points: [
          [CENTER_X - INTERCHANGE_ARM_LENGTH, BRANCH_Y],
          [CENTER_X + INTERCHANGE_ARM_LENGTH, BRANCH_Y],
        ],
        role: "horizontal",
      },
      {
        points: [
          [CENTER_X, BRANCH_Y],
          [CENTER_X, BRANCH_Y + INTERCHANGE_ARM_LENGTH],
        ],
        role: "branch",
      },
    ],
  },
  connector: {
    current: [CENTER_X, CENTER_Y],
    paths: [
      {
        points: [
          [CENTER_X - CONNECTOR_OFFSET, CENTER_Y - CONNECTOR_OFFSET],
          [CENTER_X, CENTER_Y],
          [CENTER_X - CONNECTOR_OFFSET, CENTER_Y + CONNECTOR_OFFSET],
        ],
        role: "main",
      },
      {
        points: [
          [CENTER_X, CENTER_Y],
          [CENTER_X + CONNECTOR_OFFSET, CENTER_Y - CONNECTOR_OFFSET],
        ],
        role: "main",
      },
    ],
  },
  "corner-interchange": {
    current: [CORNER_X, CORNER_Y],
    interchange: true,
    paths: [
      {
        points: [[CORNER_X, CORNER_Y], [CORNER_X, CORNER_Y + INTERCHANGE_ARM_LENGTH]],
        role: "vertical",
      },
      {
        points: [[CORNER_X, CORNER_Y], [CORNER_X + INTERCHANGE_ARM_LENGTH, CORNER_Y]],
        role: "horizontal",
      },
    ],
  },
  "horizontal-terminal": {
    current: [CENTER_X + STATION_ARM_LENGTH, CENTER_Y],
    paths: [{
      points: [
        [CENTER_X, CENTER_Y],
        [CENTER_X + STATION_ARM_LENGTH, CENTER_Y],
      ],
      role: "main",
    }],
    terminal: true,
  },
  "horizontal-through": {
    current: [CENTER_X, CENTER_Y],
    paths: [{
      points: [
        [CENTER_X - STATION_ARM_LENGTH, CENTER_Y],
        [CENTER_X + STATION_ARM_LENGTH, CENTER_Y],
      ],
      role: "main",
    }],
  },
  "vertical-terminal": {
    current: [CENTER_X, CENTER_Y + STATION_ARM_LENGTH],
    paths: [{
      points: [
        [CENTER_X, CENTER_Y],
        [CENTER_X, CENTER_Y + STATION_ARM_LENGTH],
      ],
      role: "main",
    }],
    terminal: true,
  },
  "vertical-through": {
    current: [CENTER_X, CENTER_Y],
    paths: [{
      points: [
        [CENTER_X, CENTER_Y - STATION_ARM_LENGTH],
        [CENTER_X, CENTER_Y + STATION_ARM_LENGTH],
      ],
      role: "main",
    }],
  },
};

const TRAVEL_TERMINAL: NetworkGlyphDefinition = {
  lines: { main: "station-map-travel" },
  topology: "horizontal-terminal",
};

const VOCABULARY_TERMINAL: NetworkGlyphDefinition = {
  lines: { main: "station-map-vocabulary" },
  topology: "horizontal-terminal",
};

const WRITING_THROUGH: NetworkGlyphDefinition = {
  lines: { main: "station-map-writing" },
  topology: "horizontal-through",
};

export const NETWORK_GLYPH_DEFINITIONS: Readonly<
  Record<NetworkPosition, NetworkGlyphDefinition>
> = {
  adjectives: {
    ...VOCABULARY_TERMINAL,
  },
  "combined-sounds": {
    lines: { main: "station-map-writing" },
    topology: "horizontal-terminal",
  },
  food: TRAVEL_TERMINAL,
  help: TRAVEL_TERMINAL,
  hiragana: WRITING_THROUGH,
  introductions: TRAVEL_TERMINAL,
  japanese: {
    lines: { main: "station-map-travel" },
    topology: "vertical-through",
  },
  kana: {
    ...WRITING_THROUGH,
  },
  katakana: WRITING_THROUGH,
  "mora-timing": {
    lines: { main: "station-map-sound" },
    topology: "horizontal-through",
  },
  navigation: TRAVEL_TERMINAL,
  nouns: VOCABULARY_TERMINAL,
  "pitch-accent": {
    lines: { main: "station-map-sound" },
    topology: "horizontal-terminal",
  },
  romaji: {
    lines: { main: "station-map-local" },
    topology: "vertical-through",
  },
  shopping: TRAVEL_TERMINAL,
  "sound-marks": {
    lines: { main: "station-map-writing" },
    topology: "horizontal-terminal",
  },
  verbs: VOCABULARY_TERMINAL,
  visit: {
    lines: { main: "station-map-travel" },
    topology: "horizontal-through",
  },
  vowels: {
    lines: { main: "station-map-sound" },
    topology: "horizontal-through",
  },
  words: {
    ...VOCABULARY_TERMINAL,
  },
};
