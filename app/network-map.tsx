"use client";

import { useEffect, useRef, useState, useSyncExternalStore } from "react";
import type { KeyboardEvent, PointerEvent } from "react";
import { LoadingScreen } from "./loading-screen";
import { NavigationLink, useRouteReady } from "./navigation-feedback";
import { NetworkStationSymbol, type NetworkStationKind } from "./network-visuals";

export type StationFocus =
  | "combined"
  | "food"
  | "help"
  | "hiragana"
  | "introductions"
  | "japan"
  | "japanese"
  | "kana"
  | "katakana"
  | "marks"
  | "mora"
  | "navigation"
  | "pitch"
  | "romaji"
  | "shopping"
  | "sound"
  | "vowels"
  | "vocabulary"
  | "writing"
  | "words";

type CategoryFocus = "japan" | "sound" | "vocabulary" | "writing";
type LinkedStationFocus = Exclude<StationFocus, CategoryFocus>;
type StationDirection = "ArrowDown" | "ArrowLeft" | "ArrowRight" | "ArrowUp";
type LineRole = "foundation" | "sound" | "travel" | "vocabulary" | "writing";

const DESKTOP_VIEW_WIDTH = 1500;
const MOBILE_VIEW_WIDTH = 520;
const NETWORK_ROW_GAP = 180;
const NETWORK_COLUMN_GAP = 180;
const CATEGORY_ROW_GAP = NETWORK_ROW_GAP * 1.5;
const DESKTOP_SPINE_X = (DESKTOP_VIEW_WIDTH - NETWORK_COLUMN_GAP) / 2;
const MOBILE_SPINE_X = MOBILE_VIEW_WIDTH / 2;
const ROOT_Y = 105;
const JAPAN_BRANCH_HALF_SPAN = 160;
const WRITING_BRANCH_HALF_SPAN = 70;
const NETWORK_BOTTOM_PADDING = 150;
const MOBILE_CONTENT_WIDTH = MOBILE_VIEW_WIDTH + NETWORK_COLUMN_GAP * 4;
const ROMAJI_Y = ROOT_Y + NETWORK_ROW_GAP;
const JAPAN_Y = ROMAJI_Y + NETWORK_ROW_GAP;
const SOUND_Y = JAPAN_Y + JAPAN_BRANCH_HALF_SPAN + NETWORK_ROW_GAP;
const WRITING_Y = SOUND_Y + CATEGORY_ROW_GAP;
const VOCABULARY_Y = WRITING_Y + CATEGORY_ROW_GAP;
const NETWORK_VIEW_HEIGHT = VOCABULARY_Y + NETWORK_BOTTOM_PADDING;
const STATION_FOCUS_STORAGE_KEY = "ling:network-station-focus";
const STATION_FOCUS_EVENT = "ling:network-station-focus-change";

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
  katakana: "/stations/katakana",
  marks: "/stations/sound-marks",
  combined: "/stations/combined-sounds",
  words: "/stations/words",
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
  katakana: "Katakana",
  marks: "Dakuten & Handakuten",
  combined: "Yōon",
  vocabulary: "Vocabulary",
  words: "Words",
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
  help: { ArrowDown: "mora", ArrowLeft: "japan", ArrowUp: "shopping" },
  sound: { ArrowDown: "writing", ArrowRight: "vowels", ArrowUp: "japan" },
  vowels: { ArrowDown: "kana", ArrowLeft: "sound", ArrowRight: "mora", ArrowUp: "japan" },
  mora: { ArrowDown: "hiragana", ArrowLeft: "vowels", ArrowRight: "pitch", ArrowUp: "help" },
  pitch: { ArrowDown: "marks", ArrowLeft: "mora" },
  writing: { ArrowDown: "vocabulary", ArrowRight: "kana", ArrowUp: "sound" },
  kana: { ArrowDown: "words", ArrowLeft: "writing", ArrowRight: "hiragana", ArrowUp: "vowels" },
  hiragana: { ArrowDown: "katakana", ArrowLeft: "kana", ArrowRight: "marks", ArrowUp: "mora" },
  katakana: { ArrowDown: "words", ArrowLeft: "kana", ArrowRight: "marks", ArrowUp: "hiragana" },
  marks: { ArrowDown: "words", ArrowLeft: "hiragana", ArrowRight: "combined", ArrowUp: "pitch" },
  combined: { ArrowDown: "words", ArrowLeft: "marks", ArrowUp: "pitch" },
  vocabulary: { ArrowRight: "words", ArrowUp: "writing" },
  words: { ArrowLeft: "vocabulary", ArrowUp: "kana" },
};

type NetworkViewProps = {
  mobile?: boolean;
  onLinePointerLeave: () => void;
  onStationFocus: (focus: StationFocus) => void;
  onTooltipPointerMove: (event: PointerEvent<Element>, label: string) => void;
};

function normalizeStationFocus(focus: string | null): StationFocus | null {
  if (focus === "visit") return "japan";
  if (focus === "pitch-accent") return "pitch";
  if (focus === "mora-timing") return "mora";
  if (focus === "sound-marks" || focus === "kana-extensions") return "marks";
  if (focus === "combined-sounds") return "combined";
  if (focus === "nouns" || focus === "verbs" || focus === "adjectives") return "words";

  return focus && focus in STATION_LABELS
    ? focus as StationFocus
    : null;
}

function readStoredStationFocus(): StationFocus | null {
  return normalizeStationFocus(localStorage.getItem(STATION_FOCUS_STORAGE_KEY));
}

function getStoredStationFocus(): StationFocus {
  return readStoredStationFocus() ?? "japanese";
}

function getServerStationFocus(): StationFocus {
  return "japanese";
}

function subscribeToStoredStationFocus(onStoreChange: () => void) {
  window.addEventListener("storage", onStoreChange);
  window.addEventListener(STATION_FOCUS_EVENT, onStoreChange);
  return () => {
    window.removeEventListener("storage", onStoreChange);
    window.removeEventListener(STATION_FOCUS_EVENT, onStoreChange);
  };
}

function storeStationFocus(focus: StationFocus) {
  localStorage.setItem(STATION_FOCUS_STORAGE_KEY, focus);
  window.dispatchEvent(new Event(STATION_FOCUS_EVENT));
}

function LinkedStation({
  backlightId,
  focus,
  hideLabel = false,
  kind,
  labelLines,
  labelPlacement = "above",
  onFocus,
  onPointerLeave,
  x,
  y,
}: {
  backlightId: string;
  focus: LinkedStationFocus;
  hideLabel?: boolean;
  kind: NetworkStationKind;
  labelLines?: readonly string[];
  labelPlacement?: "above" | "below" | "below-right" | "left" | "right";
  onFocus: () => void;
  onPointerLeave: () => void;
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
      aria-label={`Open ${label}`}
      className="network-station-link"
      data-network-focus={focus}
      href={ROUTABLE_STATION_HREFS[focus]}
      loadingStation={label}
      onFocus={onFocus}
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
        <NetworkStationSymbol kind={kind} />
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

function CategoryStation({
  backlightId,
  focus,
  label,
  line,
  href,
  onFocus,
  spineX,
  y,
}: {
  backlightId: string;
  focus: CategoryFocus;
  label: string;
  line: Exclude<LineRole, "foundation">;
  href?: string;
  onFocus: () => void;
  spineX: number;
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
      data-network-focus={focus}
      href={href}
      loadingStation={label}
      onFocus={onFocus}
      prefetch
    >
      {station}
    </NavigationLink>
  );
}

function NetworkView({
  mobile = false,
  onLinePointerLeave,
  onStationFocus,
  onTooltipPointerMove,
}: NetworkViewProps) {
  const width = mobile ? MOBILE_CONTENT_WIDTH : DESKTOP_VIEW_WIDTH;
  const spineX = mobile ? MOBILE_SPINE_X : DESKTOP_SPINE_X;
  const depthOneX = spineX + NETWORK_COLUMN_GAP;
  const depthTwoX = depthOneX + NETWORK_COLUMN_GAP;
  const depthThreeX = depthTwoX + NETWORK_COLUMN_GAP;
  const depthFourX = depthThreeX + NETWORK_COLUMN_GAP;
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
        d={roundedConvergingPath({
          endX: depthThreeX,
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
        d={`M${spineX} ${VOCABULARY_Y}H${depthOneX}`}
        label="Vocabulary"
        line="vocabulary"
        onLinePointerLeave={onLinePointerLeave}
        onTooltipPointerMove={onTooltipPointerMove}
      />

      <text
        className="network-station-label network-foundation-title"
        textAnchor="middle"
        x={spineX}
        y="52"
      >
        Foundations
      </text>
      <CategoryStation backlightId={backlightId} focus="japan" label="Japan" line="travel" onFocus={() => onStationFocus("japan")} href="/stations/japan" spineX={spineX} y={JAPAN_Y} />
      <CategoryStation backlightId={backlightId} focus="sound" label="Sound" line="sound" onFocus={() => onStationFocus("sound")} spineX={spineX} y={SOUND_Y} />
      <CategoryStation backlightId={backlightId} focus="writing" label="Writing" line="writing" onFocus={() => onStationFocus("writing")} spineX={spineX} y={WRITING_Y} />
      <CategoryStation backlightId={backlightId} focus="vocabulary" label="Vocabulary" line="vocabulary" onFocus={() => onStationFocus("vocabulary")} spineX={spineX} y={VOCABULARY_Y} />

      <LinkedStation backlightId={backlightId} focus="japanese" hideLabel kind="interchange" labelPlacement="left" onFocus={() => onStationFocus("japanese")} onPointerLeave={onLinePointerLeave} x={spineX} y={ROOT_Y} />
      <LinkedStation backlightId={backlightId} focus="romaji" kind="foundation" labelPlacement="left" onFocus={() => onStationFocus("romaji")} onPointerLeave={onLinePointerLeave} x={spineX} y={ROMAJI_Y} />

      <LinkedStation backlightId={backlightId} focus="introductions" kind="travel" labelPlacement="right" onFocus={() => onStationFocus("introductions")} onPointerLeave={onLinePointerLeave} x={japanStationX} y={japanPeerYs[0]} />
      <LinkedStation backlightId={backlightId} focus="navigation" kind="travel" labelPlacement="right" onFocus={() => onStationFocus("navigation")} onPointerLeave={onLinePointerLeave} x={japanStationX} y={japanPeerYs[1]} />
      <LinkedStation backlightId={backlightId} focus="food" kind="travel" labelPlacement="right" onFocus={() => onStationFocus("food")} onPointerLeave={onLinePointerLeave} x={japanStationX} y={japanPeerYs[2]} />
      <LinkedStation backlightId={backlightId} focus="shopping" kind="travel" labelPlacement="right" onFocus={() => onStationFocus("shopping")} onPointerLeave={onLinePointerLeave} x={japanStationX} y={japanPeerYs[3]} />
      <LinkedStation backlightId={backlightId} focus="help" kind="travel" labelPlacement="right" onFocus={() => onStationFocus("help")} onPointerLeave={onLinePointerLeave} x={japanStationX} y={japanPeerYs[4]} />

      <LinkedStation backlightId={backlightId} focus="vowels" kind="sound" labelPlacement="above" onFocus={() => onStationFocus("vowels")} onPointerLeave={onLinePointerLeave} x={depthOneX} y={SOUND_Y} />
      <LinkedStation backlightId={backlightId} focus="mora" kind="sound" labelPlacement="above" onFocus={() => onStationFocus("mora")} onPointerLeave={onLinePointerLeave} x={depthTwoX} y={SOUND_Y} />
      <LinkedStation backlightId={backlightId} focus="pitch" kind="sound" labelPlacement="above" onFocus={() => onStationFocus("pitch")} onPointerLeave={onLinePointerLeave} x={depthThreeX} y={SOUND_Y} />

      <LinkedStation backlightId={backlightId} focus="kana" kind="writing" labelPlacement="right" onFocus={() => onStationFocus("kana")} onPointerLeave={onLinePointerLeave} x={depthOneX} y={WRITING_Y} />
      <LinkedStation backlightId={backlightId} focus="hiragana" kind="writing" labelPlacement="above" onFocus={() => onStationFocus("hiragana")} onPointerLeave={onLinePointerLeave} x={depthTwoX} y={writingUpperY} />
      <LinkedStation backlightId={backlightId} focus="katakana" kind="writing" labelPlacement="below" onFocus={() => onStationFocus("katakana")} onPointerLeave={onLinePointerLeave} x={depthTwoX} y={writingLowerY} />
      <LinkedStation backlightId={backlightId} focus="marks" kind="writing" labelLines={["Dakuten &", "Handakuten"]} labelPlacement="left" onFocus={() => onStationFocus("marks")} onPointerLeave={onLinePointerLeave} x={depthThreeX} y={WRITING_Y} />
      <LinkedStation backlightId={backlightId} focus="combined" kind="writing" labelPlacement="below" onFocus={() => onStationFocus("combined")} onPointerLeave={onLinePointerLeave} x={depthFourX} y={WRITING_Y} />

      <LinkedStation backlightId={backlightId} focus="words" kind="vocabulary" labelPlacement="above" onFocus={() => onStationFocus("words")} onPointerLeave={onLinePointerLeave} x={depthOneX} y={VOCABULARY_Y} />
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
  const desktopViewport = useRef<HTMLDivElement>(null);
  const mobileViewport = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const focus = normalizeStationFocus(
      new URLSearchParams(window.location.search).get("focus"),
    );
    if (focus) storeStationFocus(focus);
  }, []);

  useEffect(() => {
    routeReady();
  }, [routeReady]);

  useEffect(() => {
    if (document.activeElement !== document.body) return;
    const viewport = window.matchMedia("(max-width: 600px)").matches
      ? mobileViewport.current
      : desktopViewport.current;
    viewport?.focus({ preventScroll: true });
  }, []);

  useEffect(() => {
    const viewport = mobileViewport.current;
    if (!viewport || !window.matchMedia("(max-width: 600px)").matches) return;
    const target = getStationTarget(viewport, stationFocus);
    const viewportBounds = viewport.getBoundingClientRect();
    const targetBounds = target.getBoundingClientRect();
    const targetCenter = viewport.scrollLeft
      + targetBounds.left
      - viewportBounds.left
      + targetBounds.width / 2;
    viewport.scrollTo({
      behavior: "auto",
      left: Math.max(0, targetCenter - viewport.clientWidth / 2),
    });
  }, [stationFocus]);

  function selectStation(focus: StationFocus) {
    setSelectedStationFocus(focus);
    storeStationFocus(focus);
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
    onLinePointerLeave: () => setTooltip(null),
    onStationFocus: selectStation,
    onTooltipPointerMove,
  };
  const stationAnnouncement = `${STATION_LABELS[stationFocus]} selected`;

  return (
    <>
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
    </>
  );
}
