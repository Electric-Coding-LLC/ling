"use client";

import Link from "next/link";
import { useEffect, useRef, useState, useSyncExternalStore } from "react";
import type { KeyboardEvent, PointerEvent } from "react";
import {
  isCompletableNetworkPlaceId,
  isNetworkPlaceId,
  NETWORK_LOCATION_EVENT,
  NETWORK_LOCATION_STORAGE_KEY,
  type NetworkPlaceId,
} from "@/src/modules/learning/network";
import { LingWordmark } from "./brand";
import { LoadingScreen } from "./loading-screen";
import { NavigationLink, useRouteReady } from "./navigation-feedback";
import { NetworkStationSymbol, type NetworkStationKind } from "./network-visuals";

export type StationFocus = NetworkPlaceId;

type CategoryFocus = "japan" | "sound" | "vocabulary" | "writing";
type LinkedStationFocus = Exclude<StationFocus, CategoryFocus>;
type StationDirection = "ArrowDown" | "ArrowLeft" | "ArrowRight" | "ArrowUp";
type LineRole = "foundation" | "sound" | "travel" | "vocabulary" | "writing";
type NetworkPoint = { x: number; y: number };
type KeyboardTravel = { from: StationFocus; id: number; to: StationFocus };

const DESKTOP_VIEW_WIDTH = 1500;
const MOBILE_VIEW_WIDTH = 520;
const NETWORK_ROW_GAP = 180;
const NETWORK_COLUMN_GAP = 180;
const VOCABULARY_COLUMN_GAP = 110;
const CATEGORY_ROW_GAP = NETWORK_ROW_GAP * 1.5;
const DESKTOP_SPINE_X = (DESKTOP_VIEW_WIDTH - NETWORK_COLUMN_GAP) / 2;
const MOBILE_SPINE_X = MOBILE_VIEW_WIDTH / 2;
const FOUNDATIONS_TITLE_Y = 76;
const ROOT_Y = FOUNDATIONS_TITLE_Y + 53;
const JAPAN_BRANCH_HALF_SPAN = 160;
const WRITING_BRANCH_HALF_SPAN = 70;
const NETWORK_BOTTOM_PADDING = 150;
const MOBILE_CONTENT_WIDTH = MOBILE_VIEW_WIDTH + VOCABULARY_COLUMN_GAP * 7;
const ROMAJI_Y = ROOT_Y + NETWORK_ROW_GAP;
const JAPAN_Y = ROMAJI_Y + NETWORK_ROW_GAP;
const SOUND_Y = JAPAN_Y + JAPAN_BRANCH_HALF_SPAN + NETWORK_ROW_GAP;
const WRITING_Y = SOUND_Y + CATEGORY_ROW_GAP;
const VOCABULARY_Y = WRITING_Y + CATEGORY_ROW_GAP;
const NETWORK_VIEW_HEIGHT = VOCABULARY_Y + NETWORK_BOTTOM_PADDING;
const NETWORK_TRAVEL_DURATION_MS = 320;

const ROUTABLE_STATION_HREFS: Record<LinkedStationFocus, string> = {
  japanese: "/stations/japanese",
  romaji: "/stations/romaji",
  introductions: "/stations/introductions",
  navigation: "/stations/navigation",
  food: "/stations/food",
  shopping: "/stations/shopping",
  help: "/stations/help",
  vowels: "/stations/vowels",
  mora: "/stations/mora-timing",
  pitch: "/stations/pitch-accent",
  kana: "/stations/kana",
  hiragana: "/stations/hiragana",
  kanji: "/stations/kanji",
  katakana: "/stations/katakana",
  marks: "/stations/sound-marks",
  combined: "/stations/combined-sounds",
  pointing: "/stations/pointing",
  people: "/stations/people",
  needs: "/stations/needs",
  movement: "/stations/movement",
  time: "/stations/time",
  actions: "/stations/actions",
  descriptions: "/stations/descriptions",
};

const STATION_LABELS: Record<StationFocus, string> = {
  japanese: "Japanese",
  romaji: "Rōmaji",
  japan: "Japan",
  introductions: "Introductions",
  navigation: "Navigation",
  food: "Food",
  shopping: "Shopping",
  help: "Help",
  sound: "Sound",
  vowels: "Vowels",
  mora: "Mora",
  pitch: "Pitch",
  writing: "Writing",
  kana: "Kana",
  hiragana: "Hiragana",
  kanji: "Kanji",
  katakana: "Katakana",
  marks: "Dakuten & Handakuten",
  combined: "Yōon",
  vocabulary: "Vocabulary",
  pointing: "Pointing",
  people: "People",
  needs: "Needs",
  movement: "Movement",
  time: "Time",
  actions: "Actions",
  descriptions: "Descriptions",
};

const STATION_NEIGHBORS: Record<
  StationFocus,
  Partial<Record<StationDirection, StationFocus>>
> = {
  japanese: { ArrowDown: "romaji" },
  romaji: { ArrowDown: "japan", ArrowUp: "japanese" },
  japan: { ArrowDown: "sound", ArrowRight: "food", ArrowUp: "romaji" },
  introductions: { ArrowDown: "navigation", ArrowLeft: "japan" },
  navigation: { ArrowDown: "food", ArrowLeft: "japan", ArrowUp: "introductions" },
  food: { ArrowDown: "shopping", ArrowLeft: "japan", ArrowUp: "navigation" },
  shopping: { ArrowDown: "help", ArrowLeft: "japan", ArrowUp: "food" },
  help: { ArrowLeft: "japan", ArrowUp: "shopping" },
  sound: { ArrowDown: "writing", ArrowRight: "vowels", ArrowUp: "japan" },
  vowels: { ArrowLeft: "sound", ArrowRight: "mora" },
  mora: { ArrowLeft: "vowels", ArrowRight: "pitch" },
  pitch: { ArrowLeft: "mora" },
  writing: { ArrowDown: "vocabulary", ArrowRight: "kana", ArrowUp: "sound" },
  kana: { ArrowDown: "katakana", ArrowLeft: "writing", ArrowRight: "hiragana", ArrowUp: "hiragana" },
  hiragana: { ArrowDown: "kana", ArrowLeft: "kana", ArrowRight: "kanji" },
  kanji: { ArrowDown: "marks", ArrowLeft: "hiragana" },
  katakana: { ArrowLeft: "kana", ArrowRight: "marks" },
  marks: { ArrowDown: "katakana", ArrowLeft: "hiragana", ArrowRight: "combined", ArrowUp: "kanji" },
  combined: { ArrowLeft: "marks" },
  vocabulary: { ArrowRight: "pointing", ArrowUp: "writing" },
  pointing: { ArrowLeft: "vocabulary", ArrowRight: "people" },
  people: { ArrowLeft: "pointing", ArrowRight: "needs" },
  needs: { ArrowLeft: "people", ArrowRight: "movement" },
  movement: { ArrowLeft: "needs", ArrowRight: "time" },
  time: { ArrowLeft: "movement", ArrowRight: "actions" },
  actions: { ArrowLeft: "time", ArrowRight: "descriptions" },
  descriptions: { ArrowLeft: "actions" },
};

const NETWORK_ROUTE_EDGES: readonly (readonly [StationFocus, StationFocus])[] = [
  ["japanese", "romaji"],
  ["romaji", "japan"],
  ["japan", "sound"],
  ["sound", "writing"],
  ["writing", "vocabulary"],
  ["japan", "introductions"],
  ["japan", "navigation"],
  ["japan", "food"],
  ["japan", "shopping"],
  ["japan", "help"],
  ["sound", "vowels"],
  ["vowels", "mora"],
  ["mora", "pitch"],
  ["writing", "kana"],
  ["kana", "hiragana"],
  ["hiragana", "kanji"],
  ["kana", "katakana"],
  ["kanji", "marks"],
  ["katakana", "marks"],
  ["marks", "combined"],
  ["vocabulary", "pointing"],
  ["pointing", "people"],
  ["people", "needs"],
  ["needs", "movement"],
  ["movement", "time"],
  ["time", "actions"],
  ["actions", "descriptions"],
];

const ROUNDED_WRITING_EDGES = new Set([
  "hiragana:kana",
  "kana:katakana",
  "katakana:marks",
]);

function routeEdgeKey(first: StationFocus, second: StationFocus) {
  return [first, second].sort().join(":");
}

function findNetworkRoute(from: StationFocus, to: StationFocus) {
  const routes: StationFocus[][] = [[from]];
  const visited = new Set<StationFocus>([from]);

  while (routes.length > 0) {
    const route = routes.shift();
    if (!route) break;
    const current = route.at(-1);
    if (!current) continue;
    if (current === to) return route;

    for (const [first, second] of NETWORK_ROUTE_EDGES) {
      const neighbor = first === current ? second : second === current ? first : null;
      if (!neighbor || visited.has(neighbor)) continue;
      visited.add(neighbor);
      routes.push([...route, neighbor]);
    }
  }

  throw new Error(`Missing network route from ${from} to ${to}`);
}

function roundedWritingCommands(
  from: StationFocus,
  to: StationFocus,
  positions: Record<StationFocus, NetworkPoint>,
) {
  const fromPoint = positions[from];
  const toPoint = positions[to];
  const fromIsBranch = fromPoint.y !== WRITING_Y;
  const branch = fromIsBranch ? fromPoint : toPoint;
  const convergence = fromIsBranch ? toPoint : fromPoint;
  const direction = Math.sign(convergence.y - branch.y);
  const horizontalDirection = Math.sign(convergence.x - branch.x);
  const radius = Math.min(16, Math.abs(convergence.y - branch.y) / 2);
  const beforeConvergenceX = convergence.x - horizontalDirection * radius;

  if (fromIsBranch) {
    return [
      `H${beforeConvergenceX}`,
      `Q${convergence.x} ${branch.y} ${convergence.x} ${branch.y + direction * radius}`,
      `V${convergence.y}`,
    ].join("");
  }

  return [
    `V${branch.y + direction * radius}`,
    `Q${convergence.x} ${branch.y} ${beforeConvergenceX} ${branch.y}`,
    `H${branch.x}`,
  ].join("");
}

function getKeyboardTravelPath(
  from: StationFocus,
  to: StationFocus,
  positions: Record<StationFocus, NetworkPoint>,
) {
  const route = findNetworkRoute(from, to);
  const start = positions[route[0]];
  let d = `M${start.x} ${start.y}`;

  for (let index = 1; index < route.length; index += 1) {
    const previous = route[index - 1];
    const current = route[index];
    d += ROUNDED_WRITING_EDGES.has(routeEdgeKey(previous, current))
      ? roundedWritingCommands(previous, current, positions)
      : `L${positions[current].x} ${positions[current].y}`;
  }

  return d;
}

type NetworkViewProps = {
  activeFocus: StationFocus;
  completedPlaces: ReadonlySet<StationFocus>;
  keyboardTravel: KeyboardTravel | null;
  mobile?: boolean;
  onLinePointerLeave: () => void;
  onStationActivate: (focus: StationFocus) => void;
  onStationFocus: (focus: StationFocus) => void;
  onTooltipPointerMove: (event: PointerEvent<Element>, label: string) => void;
  selectedFocus: StationFocus;
  statusLoaded: boolean;
  visitedPlaces: ReadonlySet<StationFocus>;
};

function normalizeStationFocus(focus: string | null): StationFocus | null {
  if (focus === "visit") return "japan";
  if (focus === "pitch-accent") return "pitch";
  if (focus === "mora-timing") return "mora";
  if (focus === "sound-marks" || focus === "kana-extensions") return "marks";
  if (focus === "combined-sounds") return "combined";
  if (focus === "words") return "pointing";
  return isNetworkPlaceId(focus) ? focus : null;
}

function readStoredStationFocus(): StationFocus | null {
  return normalizeStationFocus(localStorage.getItem(NETWORK_LOCATION_STORAGE_KEY));
}

function getStoredStationFocus(): StationFocus {
  return readStoredStationFocus() ?? "japanese";
}

function getServerStationFocus(): StationFocus {
  return "japanese";
}

function subscribeToStoredStationFocus(onStoreChange: () => void) {
  window.addEventListener("storage", onStoreChange);
  window.addEventListener(NETWORK_LOCATION_EVENT, onStoreChange);
  return () => {
    window.removeEventListener("storage", onStoreChange);
    window.removeEventListener(NETWORK_LOCATION_EVENT, onStoreChange);
  };
}

function LinkedStation({
  active,
  backlightId,
  completed,
  focus,
  hideLabel = false,
  kind,
  labelLines,
  labelPlacement = "above",
  onActivate,
  onFocus,
  onPointerLeave,
  selected,
  visited,
  x,
  y,
}: {
  active: boolean;
  backlightId: string;
  completed: boolean;
  focus: LinkedStationFocus;
  hideLabel?: boolean;
  kind: NetworkStationKind;
  labelLines?: readonly string[];
  labelPlacement?: "above" | "below" | "below-right" | "left" | "right";
  onActivate: () => void;
  onFocus: () => void;
  onPointerLeave: () => void;
  selected: boolean;
  visited: boolean;
  x: number;
  y: number;
}) {
  const label = STATION_LABELS[focus];
  const interchange = kind === "interchange"
    || kind === "travel-interchange"
    || kind === "sound-vocabulary-interchange";
  const labelBeside = labelPlacement === "left" || labelPlacement === "right";
  const labelOnLeft = labelPlacement === "left";
  const labelBelow = labelPlacement === "below" || labelPlacement === "below-right";
  const labelBelowRight = labelPlacement === "below-right";
  const labelX = labelOnLeft ? -34 : labelBeside ? 27 : labelBelowRight ? 24 : 0;
  const labelY = labelBeside
    ? 0
    : labelBelow
      ? interchange ? 48 : 37
      : interchange ? -48 : -37;
  const backlightKind = kind === "travel-interchange"
    ? "travel-junction"
    : interchange
      ? "junction"
      : kind;

  return (
    <NavigationLink
      aria-label={`Open ${label}${completed ? ". Complete." : ""}`}
      className="network-station-link"
      data-active={active || undefined}
      data-complete={completed || undefined}
      data-network-focus={focus}
      data-visited={visited}
      href={ROUTABLE_STATION_HREFS[focus]}
      loadingStation={label}
      navigationDelayMs={selected ? 0 : NETWORK_TRAVEL_DURATION_MS}
      onClick={onActivate}
      onNavigationCommit={onFocus}
      onFocus={(event) => {
        if (event.currentTarget.matches(":focus-visible")) onFocus();
      }}
      onPointerLeave={onPointerLeave}
      prefetch
    >
      <g
        className="network-station"
        data-station={focus === "mora"
          ? "mora-timing"
          : focus === "pitch"
            ? "pitch-accent"
            : focus === "marks"
              ? "sound-marks"
              : focus === "combined"
                ? "combined-sounds"
                : focus}
        data-station-kind={interchange
          ? "interchange"
          : kind === "local"
            ? "local"
            : "single-line"}
        transform={`translate(${x} ${y})`}
      >
        <circle
          className="network-station-backlight"
          fill={`url(#${backlightId}-${backlightKind})`}
          mask={interchange ? `url(#${backlightId}-mask)` : undefined}
          r={interchange ? 76 : 58}
        />
        {hideLabel ? null : (
          <text
            className={`network-station-label network-station-label-${labelPlacement}`}
            dominantBaseline={labelBeside ? "middle" : undefined}
            textAnchor={labelOnLeft ? "end" : labelBeside ? "start" : "middle"}
            x={labelX}
            y={labelY}
          >
            {labelLines
              ? labelLines.map((line, index) => (
                  <tspan
                    key={line}
                    x={labelX}
                    dy={index === 0 ? "-0.55em" : "1.1em"}
                  >
                    {line}
                  </tspan>
                ))
              : label}
          </text>
        )}
        <NetworkStationSymbol completed={completed} kind={kind} />
        <circle className="network-station-hit" r="48" />
      </g>
    </NavigationLink>
  );
}

function RoutePath({
  d,
  label,
  line,
  onLinePointerLeave,
  onTooltipPointerMove,
}: {
  d: string;
  label: string;
  line: LineRole;
  onLinePointerLeave: () => void;
  onTooltipPointerMove: (event: PointerEvent<Element>, label: string) => void;
}) {
  return (
    <g
      className="network-line-target"
      data-tooltip={label}
      onPointerLeave={onLinePointerLeave}
      onPointerMove={(event) => onTooltipPointerMove(event, label)}
    >
      <path
        aria-label={label}
        className={`network-line network-line-${line}`}
        d={d}
      />
      <path className="network-line-hit" d={d} />
    </g>
  );
}

function roundedConvergingPath({
  endX,
  endY,
  radius = 16,
  startX,
  startY,
}: {
  endX: number;
  endY: number;
  radius?: number;
  startX: number;
  startY: number;
}) {
  const direction = Math.sign(endY - startY);
  const horizontalDirection = Math.sign(endX - startX);
  const cornerRadius = Math.min(radius, Math.abs(endY - startY) / 2);
  const beforeEndX = endX - horizontalDirection * cornerRadius;

  return [
    `M${startX} ${startY}`,
    `H${beforeEndX}`,
    `Q${endX} ${startY} ${endX} ${startY + direction * cornerRadius}`,
    `V${endY}`,
  ].join("");
}

function KeyboardTravelBeam({ d, id }: { d: string; id: number }) {
  return (
    <g aria-hidden="true" className="network-keyboard-travel" key={id}>
      <path
        className="network-keyboard-travel-beam network-keyboard-travel-beam-contrast"
        d={d}
        pathLength="100"
      />
      <path
        className="network-keyboard-travel-beam network-keyboard-travel-beam-core"
        d={d}
        pathLength="100"
      />
    </g>
  );
}

function CategoryStation({
  active,
  backlightId,
  focus,
  label,
  line,
  href,
  onActivate,
  onFocus,
  selected,
  spineX,
  visited,
  y,
}: {
  active: boolean;
  backlightId: string;
  focus: CategoryFocus;
  label: string;
  line: Exclude<LineRole, "foundation">;
  href?: string;
  onActivate: () => void;
  onFocus: () => void;
  selected: boolean;
  spineX: number;
  visited: boolean;
  y: number;
}) {
  const station = (
    <g
      aria-label={`${label} station`}
      className="network-category-station"
      data-category-station={line}
      data-network-focus={href ? undefined : focus}
      data-station={href ? focus : undefined}
      data-station-kind={href ? "single-line" : undefined}
      onFocus={href ? undefined : onFocus}
      tabIndex={href ? undefined : -1}
      transform={`translate(${spineX} ${y})`}
    >
      <circle
        className="network-station-backlight"
        fill={`url(#${backlightId}-${line})`}
        r="58"
      />
      <NetworkStationSymbol kind={line} />
      <text
        className="network-station-label network-station-label-left"
        dominantBaseline="middle"
        textAnchor="end"
        x="-34"
        y="0"
      >
        {label}
      </text>
      {href ? <circle className="network-station-hit" r="48" /> : null}
    </g>
  );

  if (!href) return station;

  return (
    <NavigationLink
      aria-label={`Open ${label}`}
      className="network-station-link"
      data-active={active || undefined}
      data-network-focus={focus}
      data-visited={visited}
      href={href}
      loadingStation={label}
      navigationDelayMs={selected ? 0 : NETWORK_TRAVEL_DURATION_MS}
      onClick={onActivate}
      onNavigationCommit={onFocus}
      onFocus={(event) => {
        if (event.currentTarget.matches(":focus-visible")) onFocus();
      }}
      prefetch
    >
      {station}
    </NavigationLink>
  );
}

function NetworkView({
  activeFocus,
  completedPlaces,
  keyboardTravel,
  mobile = false,
  onLinePointerLeave,
  onStationActivate,
  onStationFocus,
  onTooltipPointerMove,
  selectedFocus,
  statusLoaded,
  visitedPlaces,
}: NetworkViewProps) {
  const width = mobile ? MOBILE_CONTENT_WIDTH : DESKTOP_VIEW_WIDTH;
  const spineX = mobile ? MOBILE_SPINE_X : DESKTOP_SPINE_X;
  const depthOneX = spineX + NETWORK_COLUMN_GAP;
  const depthTwoX = depthOneX + NETWORK_COLUMN_GAP;
  const depthThreeX = depthTwoX + NETWORK_COLUMN_GAP;
  const depthFourX = depthThreeX + NETWORK_COLUMN_GAP;
  const vocabularyDepthOneX = spineX + VOCABULARY_COLUMN_GAP;
  const vocabularyDepthTwoX = vocabularyDepthOneX + VOCABULARY_COLUMN_GAP;
  const vocabularyDepthThreeX = vocabularyDepthTwoX + VOCABULARY_COLUMN_GAP;
  const vocabularyDepthFourX = vocabularyDepthThreeX + VOCABULARY_COLUMN_GAP;
  const vocabularyDepthFiveX = vocabularyDepthFourX + VOCABULARY_COLUMN_GAP;
  const vocabularyDepthSixX = vocabularyDepthFiveX + VOCABULARY_COLUMN_GAP;
  const vocabularyDepthSevenX = vocabularyDepthSixX + VOCABULARY_COLUMN_GAP;
  const view = mobile ? "mobile" : "desktop";
  const backlightId = `${view}-station-backlight`;

  const japanPeerYs = mobile
    ? [
        JAPAN_Y - JAPAN_BRANCH_HALF_SPAN,
        JAPAN_Y - JAPAN_BRANCH_HALF_SPAN / 2,
        JAPAN_Y,
        JAPAN_Y + JAPAN_BRANCH_HALF_SPAN / 2,
        JAPAN_Y + JAPAN_BRANCH_HALF_SPAN,
      ] as const
    : [JAPAN_Y - 128, JAPAN_Y - 64, JAPAN_Y, JAPAN_Y + 64, JAPAN_Y + 128] as const;
  const writingUpperY = WRITING_Y - WRITING_BRANCH_HALF_SPAN;
  const writingLowerY = WRITING_Y + WRITING_BRANCH_HALF_SPAN;
  const japanStationX = depthOneX;
  const stationPositions: Record<StationFocus, NetworkPoint> = {
    japanese: { x: spineX, y: ROOT_Y },
    romaji: { x: spineX, y: ROMAJI_Y },
    japan: { x: spineX, y: JAPAN_Y },
    introductions: { x: japanStationX, y: japanPeerYs[0] },
    navigation: { x: japanStationX, y: japanPeerYs[1] },
    food: { x: japanStationX, y: japanPeerYs[2] },
    shopping: { x: japanStationX, y: japanPeerYs[3] },
    help: { x: japanStationX, y: japanPeerYs[4] },
    sound: { x: spineX, y: SOUND_Y },
    vowels: { x: depthOneX, y: SOUND_Y },
    mora: { x: depthTwoX, y: SOUND_Y },
    pitch: { x: depthThreeX, y: SOUND_Y },
    writing: { x: spineX, y: WRITING_Y },
    kana: { x: depthOneX, y: WRITING_Y },
    hiragana: { x: depthTwoX, y: writingUpperY },
    kanji: { x: depthThreeX, y: writingUpperY },
    katakana: { x: depthTwoX, y: writingLowerY },
    marks: { x: depthThreeX, y: WRITING_Y },
    combined: { x: depthFourX, y: WRITING_Y },
    vocabulary: { x: spineX, y: VOCABULARY_Y },
    pointing: { x: vocabularyDepthOneX, y: VOCABULARY_Y },
    people: { x: vocabularyDepthTwoX, y: VOCABULARY_Y },
    needs: { x: vocabularyDepthThreeX, y: VOCABULARY_Y },
    movement: { x: vocabularyDepthFourX, y: VOCABULARY_Y },
    time: { x: vocabularyDepthFiveX, y: VOCABULARY_Y },
    actions: { x: vocabularyDepthSixX, y: VOCABULARY_Y },
    descriptions: { x: vocabularyDepthSevenX, y: VOCABULARY_Y },
  };
  const keyboardTravelPath = keyboardTravel
    ? getKeyboardTravelPath(keyboardTravel.from, keyboardTravel.to, stationPositions)
    : null;
  const placeIsVisited = (focus: StationFocus) =>
    !statusLoaded || activeFocus === focus || visitedPlaces.has(focus);
  const linkedStatus = (focus: LinkedStationFocus) => ({
    active: activeFocus === focus,
    completed: completedPlaces.has(focus),
    selected: selectedFocus === focus,
    visited: placeIsVisited(focus),
  });
  const categoryStatus = (focus: CategoryFocus) => ({
    active: activeFocus === focus,
    selected: selectedFocus === focus,
    visited: placeIsVisited(focus),
  });

  const network = (
    <>
      <RoutePath
        d={`M${spineX} ${ROOT_Y + 30}V${VOCABULARY_Y}`}
        label="Foundations"
        line="foundation"
        onLinePointerLeave={onLinePointerLeave}
        onTooltipPointerMove={onTooltipPointerMove}
      />
      {japanPeerYs.map((peerY) => (
        <RoutePath
          d={`M${spineX} ${JAPAN_Y}L${japanStationX} ${peerY}`}
          key={peerY}
          label="Japan"
          line="travel"
          onLinePointerLeave={onLinePointerLeave}
          onTooltipPointerMove={onTooltipPointerMove}
        />
      ))}
      <RoutePath
        d={`M${spineX} ${SOUND_Y}H${depthThreeX}`}
        label="Sound"
        line="sound"
        onLinePointerLeave={onLinePointerLeave}
        onTooltipPointerMove={onTooltipPointerMove}
      />
      <RoutePath
        d={`M${spineX} ${WRITING_Y}H${depthOneX}`}
        label="Writing"
        line="writing"
        onLinePointerLeave={onLinePointerLeave}
        onTooltipPointerMove={onTooltipPointerMove}
      />
      <RoutePath
        d={roundedConvergingPath({
          endX: depthOneX,
          endY: WRITING_Y,
          startX: depthTwoX,
          startY: writingUpperY,
        })}
        label="Writing"
        line="writing"
        onLinePointerLeave={onLinePointerLeave}
        onTooltipPointerMove={onTooltipPointerMove}
      />
      <RoutePath
        d={roundedConvergingPath({
          endX: depthOneX,
          endY: WRITING_Y,
          startX: depthTwoX,
          startY: writingLowerY,
        })}
        label="Writing"
        line="writing"
        onLinePointerLeave={onLinePointerLeave}
        onTooltipPointerMove={onTooltipPointerMove}
      />
      <RoutePath
        d={`M${depthThreeX} ${writingUpperY}V${WRITING_Y}`}
        label="Writing"
        line="writing"
        onLinePointerLeave={onLinePointerLeave}
        onTooltipPointerMove={onTooltipPointerMove}
      />
      <RoutePath
        d={roundedConvergingPath({
          endX: depthThreeX,
          endY: WRITING_Y,
          startX: depthTwoX,
          startY: writingLowerY,
        })}
        label="Writing"
        line="writing"
        onLinePointerLeave={onLinePointerLeave}
        onTooltipPointerMove={onTooltipPointerMove}
      />
      <RoutePath
        d={`M${depthThreeX} ${WRITING_Y}H${depthFourX}`}
        label="Writing"
        line="writing"
        onLinePointerLeave={onLinePointerLeave}
        onTooltipPointerMove={onTooltipPointerMove}
      />
      <RoutePath
        d={`M${depthTwoX} ${writingUpperY}H${depthThreeX}`}
        label="Writing"
        line="writing"
        onLinePointerLeave={onLinePointerLeave}
        onTooltipPointerMove={onTooltipPointerMove}
      />
      <RoutePath
        d={`M${spineX} ${VOCABULARY_Y}H${vocabularyDepthSevenX}`}
        label="Vocabulary"
        line="vocabulary"
        onLinePointerLeave={onLinePointerLeave}
        onTooltipPointerMove={onTooltipPointerMove}
      />

      {keyboardTravel && keyboardTravelPath ? (
        <KeyboardTravelBeam
          d={keyboardTravelPath}
          id={keyboardTravel.id}
          key={keyboardTravel.id}
        />
      ) : null}

      <text
        className="network-station-label network-foundation-title"
        textAnchor="middle"
        x={spineX}
        y={FOUNDATIONS_TITLE_Y}
      >
        Foundations
      </text>
      <CategoryStation {...categoryStatus("japan")} backlightId={backlightId} focus="japan" label="Japan" line="travel" onActivate={() => onStationActivate("japan")} onFocus={() => onStationFocus("japan")} href="/stations/japan" spineX={spineX} y={JAPAN_Y} />
      <CategoryStation {...categoryStatus("sound")} backlightId={backlightId} focus="sound" label="Sound" line="sound" onActivate={() => onStationActivate("sound")} onFocus={() => onStationFocus("sound")} href="/stations/sound" spineX={spineX} y={SOUND_Y} />
      <CategoryStation {...categoryStatus("writing")} backlightId={backlightId} focus="writing" label="Writing" line="writing" onActivate={() => onStationActivate("writing")} onFocus={() => onStationFocus("writing")} href="/stations/writing" spineX={spineX} y={WRITING_Y} />
      <CategoryStation {...categoryStatus("vocabulary")} backlightId={backlightId} focus="vocabulary" label="Vocabulary" line="vocabulary" onActivate={() => onStationActivate("vocabulary")} onFocus={() => onStationFocus("vocabulary")} href="/stations/vocabulary" spineX={spineX} y={VOCABULARY_Y} />

      <LinkedStation {...linkedStatus("japanese")} backlightId={backlightId} focus="japanese" hideLabel kind="interchange" labelPlacement="left" onActivate={() => onStationActivate("japanese")} onFocus={() => onStationFocus("japanese")} onPointerLeave={onLinePointerLeave} x={spineX} y={ROOT_Y} />
      <LinkedStation {...linkedStatus("romaji")} backlightId={backlightId} focus="romaji" kind="foundation" labelPlacement="left" onActivate={() => onStationActivate("romaji")} onFocus={() => onStationFocus("romaji")} onPointerLeave={onLinePointerLeave} x={spineX} y={ROMAJI_Y} />

      <LinkedStation {...linkedStatus("introductions")} backlightId={backlightId} focus="introductions" kind="travel" labelPlacement="right" onActivate={() => onStationActivate("introductions")} onFocus={() => onStationFocus("introductions")} onPointerLeave={onLinePointerLeave} x={japanStationX} y={japanPeerYs[0]} />
      <LinkedStation {...linkedStatus("navigation")} backlightId={backlightId} focus="navigation" kind="travel" labelPlacement="right" onActivate={() => onStationActivate("navigation")} onFocus={() => onStationFocus("navigation")} onPointerLeave={onLinePointerLeave} x={japanStationX} y={japanPeerYs[1]} />
      <LinkedStation {...linkedStatus("food")} backlightId={backlightId} focus="food" kind="travel" labelPlacement="right" onActivate={() => onStationActivate("food")} onFocus={() => onStationFocus("food")} onPointerLeave={onLinePointerLeave} x={japanStationX} y={japanPeerYs[2]} />
      <LinkedStation {...linkedStatus("shopping")} backlightId={backlightId} focus="shopping" kind="travel" labelPlacement="right" onActivate={() => onStationActivate("shopping")} onFocus={() => onStationFocus("shopping")} onPointerLeave={onLinePointerLeave} x={japanStationX} y={japanPeerYs[3]} />
      <LinkedStation {...linkedStatus("help")} backlightId={backlightId} focus="help" kind="travel" labelPlacement="right" onActivate={() => onStationActivate("help")} onFocus={() => onStationFocus("help")} onPointerLeave={onLinePointerLeave} x={japanStationX} y={japanPeerYs[4]} />

      <LinkedStation {...linkedStatus("vowels")} backlightId={backlightId} focus="vowels" kind="sound" labelPlacement="above" onActivate={() => onStationActivate("vowels")} onFocus={() => onStationFocus("vowels")} onPointerLeave={onLinePointerLeave} x={depthOneX} y={SOUND_Y} />
      <LinkedStation {...linkedStatus("mora")} backlightId={backlightId} focus="mora" kind="sound" labelPlacement="above" onActivate={() => onStationActivate("mora")} onFocus={() => onStationFocus("mora")} onPointerLeave={onLinePointerLeave} x={depthTwoX} y={SOUND_Y} />
      <LinkedStation {...linkedStatus("pitch")} backlightId={backlightId} focus="pitch" kind="sound" labelPlacement="above" onActivate={() => onStationActivate("pitch")} onFocus={() => onStationFocus("pitch")} onPointerLeave={onLinePointerLeave} x={depthThreeX} y={SOUND_Y} />

      <LinkedStation {...linkedStatus("kana")} backlightId={backlightId} focus="kana" kind="writing" labelPlacement="right" onActivate={() => onStationActivate("kana")} onFocus={() => onStationFocus("kana")} onPointerLeave={onLinePointerLeave} x={depthOneX} y={WRITING_Y} />
      <LinkedStation {...linkedStatus("hiragana")} backlightId={backlightId} focus="hiragana" kind="writing" labelPlacement="above" onActivate={() => onStationActivate("hiragana")} onFocus={() => onStationFocus("hiragana")} onPointerLeave={onLinePointerLeave} x={depthTwoX} y={writingUpperY} />
      <LinkedStation {...linkedStatus("kanji")} backlightId={backlightId} focus="kanji" kind="writing" labelPlacement="above" onActivate={() => onStationActivate("kanji")} onFocus={() => onStationFocus("kanji")} onPointerLeave={onLinePointerLeave} x={depthThreeX} y={writingUpperY} />
      <LinkedStation {...linkedStatus("katakana")} backlightId={backlightId} focus="katakana" kind="writing" labelPlacement="below" onActivate={() => onStationActivate("katakana")} onFocus={() => onStationFocus("katakana")} onPointerLeave={onLinePointerLeave} x={depthTwoX} y={writingLowerY} />
      <LinkedStation {...linkedStatus("marks")} backlightId={backlightId} focus="marks" kind="writing" labelLines={["Dakuten &", "Handakuten"]} labelPlacement="left" onActivate={() => onStationActivate("marks")} onFocus={() => onStationFocus("marks")} onPointerLeave={onLinePointerLeave} x={depthThreeX} y={WRITING_Y} />
      <LinkedStation {...linkedStatus("combined")} backlightId={backlightId} focus="combined" kind="writing" labelPlacement="below" onActivate={() => onStationActivate("combined")} onFocus={() => onStationFocus("combined")} onPointerLeave={onLinePointerLeave} x={depthFourX} y={WRITING_Y} />

      <LinkedStation {...linkedStatus("pointing")} backlightId={backlightId} focus="pointing" kind="vocabulary" labelPlacement="above" onActivate={() => onStationActivate("pointing")} onFocus={() => onStationFocus("pointing")} onPointerLeave={onLinePointerLeave} x={vocabularyDepthOneX} y={VOCABULARY_Y} />
      <LinkedStation {...linkedStatus("people")} backlightId={backlightId} focus="people" kind="vocabulary" labelPlacement="above" onActivate={() => onStationActivate("people")} onFocus={() => onStationFocus("people")} onPointerLeave={onLinePointerLeave} x={vocabularyDepthTwoX} y={VOCABULARY_Y} />
      <LinkedStation {...linkedStatus("needs")} backlightId={backlightId} focus="needs" kind="vocabulary" labelPlacement="above" onActivate={() => onStationActivate("needs")} onFocus={() => onStationFocus("needs")} onPointerLeave={onLinePointerLeave} x={vocabularyDepthThreeX} y={VOCABULARY_Y} />
      <LinkedStation {...linkedStatus("movement")} backlightId={backlightId} focus="movement" kind="vocabulary" labelPlacement="above" onActivate={() => onStationActivate("movement")} onFocus={() => onStationFocus("movement")} onPointerLeave={onLinePointerLeave} x={vocabularyDepthFourX} y={VOCABULARY_Y} />
      <LinkedStation {...linkedStatus("time")} backlightId={backlightId} focus="time" kind="vocabulary" labelPlacement="above" onActivate={() => onStationActivate("time")} onFocus={() => onStationFocus("time")} onPointerLeave={onLinePointerLeave} x={vocabularyDepthFiveX} y={VOCABULARY_Y} />
      <LinkedStation {...linkedStatus("actions")} backlightId={backlightId} focus="actions" kind="vocabulary" labelPlacement="above" onActivate={() => onStationActivate("actions")} onFocus={() => onStationFocus("actions")} onPointerLeave={onLinePointerLeave} x={vocabularyDepthSixX} y={VOCABULARY_Y} />
      <LinkedStation {...linkedStatus("descriptions")} backlightId={backlightId} focus="descriptions" kind="vocabulary" labelPlacement="above" onActivate={() => onStationActivate("descriptions")} onFocus={() => onStationFocus("descriptions")} onPointerLeave={onLinePointerLeave} x={vocabularyDepthSevenX} y={VOCABULARY_Y} />
    </>
  );

  return (
    <svg
      aria-describedby={`${view}-network-description`}
      aria-label="Foundations learning network"
      className={`network-map network-map-${view}`}
      data-network-view={view}
      role="img"
      style={mobile
        ? { width: `${(MOBILE_CONTENT_WIDTH / MOBILE_VIEW_WIDTH) * 100}%` }
        : undefined}
      viewBox={`0 0 ${width} ${NETWORK_VIEW_HEIGHT}`}
    >
      <defs>
        {(["foundation", "travel", "sound", "writing", "vocabulary", "local"] as const).map((kind) => (
          <radialGradient id={`${backlightId}-${kind}`} key={kind}>
            <stop offset="0" stopColor={`var(--${kind === "local" ? "muted" : kind === "foundation" ? "foreground" : kind})`} stopOpacity="0.42" />
            <stop offset="1" stopColor={`var(--${kind === "local" ? "muted" : kind === "foundation" ? "foreground" : kind})`} stopOpacity="0" />
          </radialGradient>
        ))}
        <radialGradient id={`${backlightId}-travel-junction`}>
          <stop offset="0" stopColor="var(--travel)" stopOpacity="0.46" />
          <stop offset="1" stopColor="var(--travel)" stopOpacity="0" />
        </radialGradient>
        <radialGradient id={`${backlightId}-junction`}>
          <stop offset="0" stopColor="var(--foreground)" stopOpacity="0.34" />
          <stop offset="1" stopColor="var(--foreground)" stopOpacity="0" />
        </radialGradient>
        <radialGradient id={`${backlightId}-falloff`}>
          <stop offset="0" stopColor="white" stopOpacity="0.72" />
          <stop offset="0.5" stopColor="white" stopOpacity="0.34" />
          <stop offset="1" stopColor="white" stopOpacity="0" />
        </radialGradient>
        <mask height="160" id={`${backlightId}-mask`} maskUnits="userSpaceOnUse" width="160" x="-80" y="-80">
          <circle fill={`url(#${backlightId}-falloff)`} r="80" />
        </mask>
      </defs>
      <desc id={`${view}-network-description`}>
        Scroll down the Foundations spine to move through Japan, Sound, Writing, and Vocabulary. Move right along a line to go deeper.
      </desc>
      {network}
    </svg>
  );
}

function activateStationLink(stationLink: SVGAElement) {
  stationLink.dispatchEvent(
    new MouseEvent("click", { bubbles: true, cancelable: true, view: window }),
  );
}

type NetworkStatus = {
  completed: StationFocus[];
  visited: StationFocus[];
};

export function NetworkMap({
  initialStationFocus,
}: {
  initialStationFocus?: StationFocus;
}) {
  const routeReady = useRouteReady();
  const storedStationFocus = useSyncExternalStore(
    subscribeToStoredStationFocus,
    getStoredStationFocus,
    getServerStationFocus,
  );
  const [selectedStationFocus, setSelectedStationFocus] = useState<StationFocus | null>(
    initialStationFocus ?? null,
  );
  const stationFocus = selectedStationFocus ?? storedStationFocus;
  const [tooltip, setTooltip] = useState<{ label: string; x: number; y: number } | null>(null);
  const [keyboardTravel, setKeyboardTravel] = useState<KeyboardTravel | null>(null);
  const [networkStatus, setNetworkStatus] = useState<NetworkStatus | null>(null);
  const keyboardTravelId = useRef(0);
  const keyboardScrollPending = useRef(false);
  const desktopViewport = useRef<HTMLDivElement>(null);
  const mobileViewport = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const focus = normalizeStationFocus(
      new URLSearchParams(window.location.search).get("focus"),
    );
    if (!focus) return;
    localStorage.setItem(NETWORK_LOCATION_STORAGE_KEY, focus);
    window.dispatchEvent(new Event(NETWORK_LOCATION_EVENT));
  }, []);

  useEffect(() => {
    const controller = new AbortController();

    void fetch("/api/network/places", {
      cache: "no-store",
      signal: controller.signal,
    })
      .then(async (response) => {
        if (!response.ok) throw new Error("Network status could not load");
        return response.json() as Promise<{ completed?: unknown; visited?: unknown }>;
      })
      .then((payload) => {
        if (!Array.isArray(payload.completed) || !Array.isArray(payload.visited)) {
          throw new Error("Network status is invalid");
        }
        const completed = payload.completed.filter(isCompletableNetworkPlaceId);
        const visited = payload.visited.filter(isNetworkPlaceId);
        if (
          completed.length !== payload.completed.length
          || visited.length !== payload.visited.length
        ) {
          throw new Error("Network status is invalid");
        }
        setNetworkStatus({ completed, visited });
      })
      .catch(() => {
        if (!controller.signal.aborted) setNetworkStatus(null);
      });

    return () => controller.abort();
  }, []);

  useEffect(() => {
    routeReady();
  }, [routeReady]);

  useEffect(() => {
    if (!keyboardTravel) return;
    const timeout = window.setTimeout(() => {
      setKeyboardTravel((current) => current?.id === keyboardTravel.id ? null : current);
    }, 360);
    return () => window.clearTimeout(timeout);
  }, [keyboardTravel]);

  useEffect(() => {
    if (document.activeElement !== document.body) return;
    const viewport = window.matchMedia("(max-width: 600px)").matches
      ? mobileViewport.current
      : desktopViewport.current;
    viewport?.focus({ preventScroll: true });
  }, []);

  useEffect(() => {
    const viewport = window.matchMedia("(max-width: 600px)").matches
      ? mobileViewport.current
      : desktopViewport.current;
    if (!viewport) return;
    const target = getStationTarget(viewport, stationFocus);
    const smoothKeyboardScroll = keyboardScrollPending.current
      && !window.matchMedia("(prefers-reduced-motion: reduce)").matches;
    keyboardScrollPending.current = false;

    target.scrollIntoView({
      behavior: smoothKeyboardScroll ? "smooth" : "auto",
      block: "center",
      inline: "center",
    });
  }, [stationFocus]);

  function selectStation(focus: StationFocus) {
    setSelectedStationFocus(focus);
  }

  function showCurrentLocation() {
    const viewport = window.matchMedia("(max-width: 600px)").matches
      ? mobileViewport.current
      : desktopViewport.current;
    if (!viewport) return;

    setKeyboardTravel(null);
    keyboardScrollPending.current = stationFocus !== storedStationFocus;
    setSelectedStationFocus(storedStationFocus);
    if (stationFocus !== storedStationFocus) return;

    getStationTarget(viewport, storedStationFocus).scrollIntoView({
      behavior: window.matchMedia("(prefers-reduced-motion: reduce)").matches
        ? "auto"
        : "smooth",
      block: "center",
      inline: "center",
    });
  }

  function startStationTravel(focus: StationFocus) {
    if (focus === stationFocus) return;
    keyboardTravelId.current += 1;
    setKeyboardTravel({ from: stationFocus, id: keyboardTravelId.current, to: focus });
  }

  function getStationTarget(container: HTMLDivElement, focus: StationFocus) {
    const target = container.querySelector<SVGElement>(
      `[data-network-focus="${focus}"]`,
    );
    if (!target) throw new Error(`Missing keyboard target for station: ${focus}`);
    return target;
  }

  function moveSelection(
    event: KeyboardEvent<HTMLDivElement>,
    focus: StationFocus,
  ) {
    keyboardScrollPending.current = true;
    startStationTravel(focus);
    selectStation(focus);
    if (event.currentTarget === mobileViewport.current) {
      getStationTarget(event.currentTarget, focus).focus({ preventScroll: true });
    }
  }

  function onKeyDown(event: KeyboardEvent<HTMLDivElement>) {
    const direction = event.key;
    if (
      direction === "ArrowDown"
      || direction === "ArrowLeft"
      || direction === "ArrowRight"
      || direction === "ArrowUp"
    ) {
      event.preventDefault();
      const nextFocus = STATION_NEIGHBORS[stationFocus][direction];
      if (nextFocus) moveSelection(event, nextFocus);
      return;
    }

    if (event.key !== "Enter" && event.key !== " ") return;
    const focusedStationTarget = event.currentTarget.querySelector<SVGElement>(
      "[data-network-focus]:focus",
    );
    if (event.target !== event.currentTarget && !focusedStationTarget) return;
    event.preventDefault();
    const selectedTarget = focusedStationTarget
      ?? getStationTarget(event.currentTarget, stationFocus);
    if (selectedTarget instanceof SVGAElement) activateStationLink(selectedTarget);
  }

  function onTooltipPointerMove(event: PointerEvent<Element>, label: string) {
    if (event.pointerType !== "mouse") return;
    setTooltip({
      label,
      x: Math.min(event.clientX + 12, document.documentElement.clientWidth - 150),
      y: Math.min(event.clientY + 12, document.documentElement.clientHeight - 44),
    });
  }

  const sharedViewProps = {
    activeFocus: stationFocus,
    completedPlaces: new Set<StationFocus>(networkStatus?.completed ?? []),
    keyboardTravel,
    onLinePointerLeave: () => setTooltip(null),
    onStationActivate: startStationTravel,
    onStationFocus: selectStation,
    onTooltipPointerMove,
    selectedFocus: stationFocus,
    statusLoaded: networkStatus !== null,
    visitedPlaces: new Set<StationFocus>(networkStatus?.visited ?? []),
  };
  const stationAnnouncement = `${STATION_LABELS[stationFocus]} selected`;
  const currentLocationLabel = `Show current location: ${STATION_LABELS[storedStationFocus]}`;

  return (
    <>
      <header className="topbar network-topbar">
        <Link aria-label="Ling home" className="brand-link" href="/">
          <LingWordmark className="wordmark" />
        </Link>
        <div className="network-utilities">
          <span className="hiragana-test-trigger-wrap">
            <button
              aria-describedby="network-location-tooltip"
              aria-label={currentLocationLabel}
              className="network-location-button"
              onClick={showCurrentLocation}
              type="button"
            >
              <svg aria-hidden="true" viewBox="0 0 24 24">
                <circle cx="12" cy="12" r="7" />
                <path d="M12 1.5V5M12 19v3.5M1.5 12H5M19 12h3.5" />
                <circle className="network-location-target-dot" cx="12" cy="12" r="1.75" />
              </svg>
            </button>
            <span className="network-tooltip hiragana-test-tooltip" id="network-location-tooltip" role="tooltip">
              Current location
            </span>
          </span>
          <span className="hiragana-test-trigger-wrap">
            <NavigationLink
              aria-describedby="network-help-tooltip"
              aria-label="About Ling"
              className="network-help-link"
              href="/welcome"
            >
              <svg aria-hidden="true" viewBox="0 0 24 24">
                <circle cx="12" cy="12" r="9" />
                <path d="M9.75 9a2.35 2.35 0 0 1 4.5 1c0 1.75-2.25 1.9-2.25 3.5" />
                <circle className="network-help-dot" cx="12" cy="17" r="0.75" />
              </svg>
            </NavigationLink>
            <span className="network-tooltip hiragana-test-tooltip" id="network-help-tooltip" role="tooltip">
              About Ling
            </span>
          </span>
        </div>
      </header>
      <section className="network-home" aria-labelledby="network-title">
        <h1 className="sr-only" id="network-title">
          Japanese mastery network
        </h1>
        <LoadingScreen boot overlay />
        <div className="network-views">
          <div
            aria-label="Explore the network with the arrow keys"
            className="network-desktop-viewport"
            data-desktop-focus={stationFocus}
            onKeyDown={onKeyDown}
            onPointerDown={(event) => {
              if (event.target instanceof Element && event.target.closest("a")) return;
              event.currentTarget.focus({ preventScroll: true });
            }}
            ref={desktopViewport}
            role="group"
            tabIndex={0}
          >
            <NetworkView {...sharedViewProps} />
            <span aria-live="polite" className="sr-only">{stationAnnouncement}</span>
          </div>
          <div
            aria-label="Pan across the network or explore with the arrow keys"
            className="network-mobile-viewport"
            data-mobile-station-focus={stationFocus}
            onKeyDown={onKeyDown}
            ref={mobileViewport}
            role="group"
            tabIndex={0}
          >
            <NetworkView {...sharedViewProps} mobile />
            <span aria-live="polite" className="sr-only">{stationAnnouncement}</span>
          </div>
        </div>
        {tooltip ? (
          <span className="network-tooltip" role="tooltip" style={{ left: tooltip.x, top: tooltip.y }}>
            {tooltip.label}
          </span>
        ) : null}
      </section>
    </>
  );
}
