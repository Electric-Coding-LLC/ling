"use client";

import Link from "next/link";
import { useRouter } from "next/navigation";
import { useEffect, useRef, useState, useSyncExternalStore } from "react";
import type { KeyboardEvent, PointerEvent } from "react";

type MobileFocus = "hiragana" | "katakana" | "mora";
export type StationFocus = MobileFocus;
type StationDirection = "ArrowDown" | "ArrowLeft" | "ArrowRight" | "ArrowUp";

// A station-to-station edge uses one visual unit unless its meaning requires otherwise.
const NETWORK_SEGMENT_LENGTH = 180;
const NETWORK_LINE_NODE_OFFSET = 18;
const NETWORK_INTERCHANGE_NODE_OFFSET = 31;
const DESKTOP_HIRAGANA_X = 250;
const DESKTOP_MORA_X = DESKTOP_HIRAGANA_X + NETWORK_SEGMENT_LENGTH;
const MOBILE_HIRAGANA_X = NETWORK_SEGMENT_LENGTH;
const MOBILE_MORA_X = MOBILE_HIRAGANA_X + NETWORK_SEGMENT_LENGTH;
const MOBILE_VIEW_WIDTH = MOBILE_MORA_X;
const NETWORK_VIEW_HEIGHT = 440;
const KATAKANA_Y = 80;
const SOUND_Y = KATAKANA_Y + NETWORK_SEGMENT_LENGTH;
const SCRIPT_LABEL_Y = KATAKANA_Y + NETWORK_SEGMENT_LENGTH / 2;
const MOBILE_SWIPE_THRESHOLD = 40;
const STATION_FOCUS_STORAGE_KEY = "ling:network-station-focus";
const STATION_FOCUS_EVENT = "ling:network-station-focus-change";
const ROUTABLE_STATION_HREFS = {
  hiragana: "/stations/hiragana",
  katakana: "/stations/katakana",
  mora: "/stations/mora-timing",
} as const;
const STATION_LABELS: Record<StationFocus, string> = {
  hiragana: "Hiragana",
  katakana: "Katakana",
  mora: "Mora timing",
};
const STATION_NEIGHBORS: Record<
  StationFocus,
  Partial<Record<StationDirection, StationFocus>>
> = {
  hiragana: { ArrowRight: "mora", ArrowUp: "katakana" },
  katakana: { ArrowDown: "hiragana" },
  mora: { ArrowLeft: "hiragana" },
};

type NetworkViewProps = {
  mobile?: boolean;
  mobileFocus?: MobileFocus;
  katakanaAvailable: boolean;
  moraTimingAvailable: boolean;
  onLinePointerLeave: () => void;
  onStationFocus: (focus: StationFocus) => void;
  onTooltipPointerMove: (event: PointerEvent<Element>, label: string) => void;
};

function readStoredStationFocus(): StationFocus | null {
  const storedFocus = localStorage.getItem(STATION_FOCUS_STORAGE_KEY);
  return storedFocus === "mora" || storedFocus === "katakana" || storedFocus === "hiragana"
    ? storedFocus
    : null;
}

function getStoredStationFocus(): StationFocus {
  return readStoredStationFocus() ?? "hiragana";
}

function getServerStationFocus(): StationFocus {
  return "hiragana";
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

function isStationVisible(
  focus: StationFocus,
  katakanaAvailable: boolean,
  moraTimingAvailable: boolean,
) {
  return focus === "hiragana"
    || (focus === "katakana" && katakanaAvailable)
    || (focus === "mora" && moraTimingAvailable);
}

function LinkedStation({
  backlightId,
  kind,
  label,
  href,
  onFocus,
  onPointerLeave,
  slug,
  x,
  y = SOUND_Y,
}: {
  backlightId: string;
  kind: "interchange" | "script" | "sound";
  label: string;
  href: string;
  onFocus: () => void;
  onPointerLeave: () => void;
  slug: string;
  x: number;
  y?: number;
}) {
  const interchange = kind === "interchange";
  const station = (
    <g
      className="network-station"
      data-station={slug}
      data-station-kind={interchange ? "interchange" : "single-line"}
      transform={`translate(${x} ${y})`}
    >
      <circle
        className="network-station-backlight"
        fill={`url(#${backlightId}-${interchange ? "junction" : kind})`}
        mask={interchange ? `url(#${backlightId}-mask)` : undefined}
        r={interchange ? 76 : 58}
      />
      <text className="network-station-label" y={interchange ? -48 : -36}>
        {label}
      </text>
      {interchange ? (
        <>
          <circle className="network-interchange-outer" r="28" />
          <circle className="network-interchange-inner" r="16" />
        </>
      ) : (
        <>
          <circle className={`network-single-station-outer network-single-station-outer-${kind}`} r="15" />
          <circle className="network-single-station-inner" r="7" />
        </>
      )}
      <circle className="network-station-hit" r="48" />
    </g>
  );

  return (
    <Link
      aria-label={`Open ${label}`}
      className="network-station-link"
      href={href}
      onFocus={onFocus}
      onPointerLeave={onPointerLeave}
      prefetch
    >
      {station}
    </Link>
  );
}

function NetworkView({
  mobile = false,
  mobileFocus = "hiragana",
  katakanaAvailable,
  moraTimingAvailable,
  onLinePointerLeave,
  onStationFocus,
  onTooltipPointerMove,
}: NetworkViewProps) {
  const width = mobile ? MOBILE_VIEW_WIDTH : 1000;
  const hiraganaX = mobile ? MOBILE_HIRAGANA_X : DESKTOP_HIRAGANA_X;
  const moraX = mobile ? MOBILE_MORA_X : DESKTOP_MORA_X;
  const view = mobile ? "mobile" : "desktop";
  const backlightId = `${view}-station-backlight`;
  const hiraganaLineOffset = katakanaAvailable
    ? NETWORK_INTERCHANGE_NODE_OFFSET
    : NETWORK_LINE_NODE_OFFSET;

  const network = (
    <>
      <text
        className="network-line-label network-line-label-sound"
        data-line="sound"
        dominantBaseline="middle"
        textAnchor="end"
        x={hiraganaX - 48}
        y={SOUND_Y}
      >
        SOUND
      </text>
      {moraTimingAvailable ? (
        <g className="network-line-target">
          <line
            aria-label="Sound line"
            className="network-line-hit"
            data-tooltip="Sound line"
            onPointerEnter={(event) => onTooltipPointerMove(event, "Sound line")}
            onPointerLeave={onLinePointerLeave}
            onPointerMove={(event) => onTooltipPointerMove(event, "Sound line")}
            pointerEvents="stroke"
            stroke="transparent"
            strokeWidth="24"
            x1={hiraganaX + hiraganaLineOffset}
            x2={moraX - NETWORK_LINE_NODE_OFFSET}
            y1={SOUND_Y}
            y2={SOUND_Y}
          />
          <line
            aria-hidden="true"
            className="network-line network-line-sound"
            pointerEvents="none"
            x1={hiraganaX + hiraganaLineOffset}
            x2={moraX - NETWORK_LINE_NODE_OFFSET}
            y1={SOUND_Y}
            y2={SOUND_Y}
          />
        </g>
      ) : null}
      {katakanaAvailable ? (
        <>
          <text
            className="network-line-label network-line-label-script"
            data-line="script"
            dominantBaseline="middle"
            textAnchor="end"
            x={hiraganaX - 48}
            y={SCRIPT_LABEL_Y}
          >
            SCRIPT
          </text>
          <g className="network-line-target">
            <line
              aria-label="Script line"
              className="network-line-hit"
              data-tooltip="Script line"
              onPointerEnter={(event) => onTooltipPointerMove(event, "Script line")}
              onPointerLeave={onLinePointerLeave}
              onPointerMove={(event) => onTooltipPointerMove(event, "Script line")}
              pointerEvents="stroke"
              stroke="transparent"
              strokeWidth="24"
              x1={hiraganaX}
              x2={hiraganaX}
              y1={KATAKANA_Y + NETWORK_LINE_NODE_OFFSET}
              y2={SOUND_Y - NETWORK_INTERCHANGE_NODE_OFFSET}
            />
            <line
              aria-hidden="true"
              className="network-line network-line-script"
              pointerEvents="none"
              x1={hiraganaX}
              x2={hiraganaX}
              y1={KATAKANA_Y + NETWORK_LINE_NODE_OFFSET}
              y2={SOUND_Y - NETWORK_INTERCHANGE_NODE_OFFSET}
            />
          </g>
        </>
      ) : null}
      <LinkedStation backlightId={backlightId} href={ROUTABLE_STATION_HREFS.hiragana} kind={katakanaAvailable ? "interchange" : "sound"} label="Hiragana" onFocus={() => onStationFocus("hiragana")} onPointerLeave={onLinePointerLeave} slug="hiragana" x={hiraganaX} />
      {katakanaAvailable ? (
        <LinkedStation
          backlightId={backlightId}
          href={ROUTABLE_STATION_HREFS.katakana}
          kind="script"
          label="Katakana"
          onFocus={() => onStationFocus("katakana")}
          onPointerLeave={onLinePointerLeave}
          slug="katakana"
          x={hiraganaX}
          y={KATAKANA_Y}
        />
      ) : null}
      {moraTimingAvailable ? (
        <LinkedStation
          backlightId={backlightId}
          href={ROUTABLE_STATION_HREFS.mora}
          kind="sound"
          label="Mora timing"
          onFocus={() => onStationFocus("mora")}
          onPointerLeave={onLinePointerLeave}
          slug="mora-timing"
          x={moraX}
        />
      ) : null}
    </>
  );

  return (
    <svg
      aria-describedby={`${view}-network-description`}
      aria-label={katakanaAvailable ? "Sound and Script network" : "Sound network"}
      className={`network-map network-map-${view}`}
      data-network-view={view}
      role="img"
      viewBox={`0 0 ${width} ${NETWORK_VIEW_HEIGHT}`}
    >
      <defs>
        <radialGradient id={`${backlightId}-sound`}>
          <stop offset="0" stopColor="#db4e3a" stopOpacity="0.42" />
          <stop offset="0.48" stopColor="#db4e3a" stopOpacity="0.2" />
          <stop offset="1" stopColor="#db4e3a" stopOpacity="0" />
        </radialGradient>
        <radialGradient id={`${backlightId}-script`}>
          <stop offset="0" stopColor="#4c689c" stopOpacity="0.46" />
          <stop offset="0.48" stopColor="#4c689c" stopOpacity="0.22" />
          <stop offset="1" stopColor="#4c689c" stopOpacity="0" />
        </radialGradient>
        <linearGradient id={`${backlightId}-junction`} x1="0" x2="0" y1="0" y2="1">
          <stop offset="0" stopColor="#4c689c" stopOpacity="0.76" />
          <stop offset="0.48" stopColor="#4c689c" stopOpacity="0.68" />
          <stop offset="0.52" stopColor="#db4e3a" stopOpacity="0.64" />
          <stop offset="1" stopColor="#db4e3a" stopOpacity="0.72" />
        </linearGradient>
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
        {katakanaAvailable
          ? "Hiragana connects the Sound line to Mora timing and the Script line to Katakana."
          : "Hiragana is the first explored station on the Sound line."}
      </desc>
      {mobile ? (
        <g className={`network-mobile-track network-mobile-track-${mobileFocus}`}>{network}</g>
      ) : (
        network
      )}
    </svg>
  );
}

export function NetworkMap({
  initialStationFocus,
  katakanaAvailable,
  moraTimingAvailable,
}: {
  initialStationFocus?: StationFocus;
  katakanaAvailable: boolean;
  moraTimingAvailable: boolean;
}) {
  const router = useRouter();
  const storedStationFocus = useSyncExternalStore(
    subscribeToStoredStationFocus,
    getStoredStationFocus,
    getServerStationFocus,
  );
  const [selectedStationFocus, setSelectedStationFocus] = useState<StationFocus | null>(
    initialStationFocus ?? null,
  );
  const requestedStationFocus = selectedStationFocus ?? storedStationFocus;
  const stationFocus = isStationVisible(
    requestedStationFocus,
    katakanaAvailable,
    moraTimingAvailable,
  )
    ? requestedStationFocus
    : "hiragana";
  const mobileFocus: MobileFocus = stationFocus;
  const [tooltip, setTooltip] = useState<{ label: string; x: number; y: number } | null>(null);
  const desktopViewport = useRef<HTMLDivElement>(null);
  const mobileViewport = useRef<HTMLDivElement>(null);
  const pointerStart = useRef<{ id: number; x: number } | null>(null);
  const dragged = useRef(false);

  useEffect(() => {
    if (initialStationFocus && isStationVisible(
      initialStationFocus,
      katakanaAvailable,
      moraTimingAvailable,
    )) {
      storeStationFocus(initialStationFocus);
    }
  }, [initialStationFocus, katakanaAvailable, moraTimingAvailable]);

  useEffect(() => {
    if (document.activeElement !== document.body) return;

    const viewport = window.matchMedia("(max-width: 600px)").matches
      ? mobileViewport.current
      : desktopViewport.current;
    viewport?.focus({ preventScroll: true });
  }, []);

  function selectStation(focus: StationFocus) {
    setSelectedStationFocus(focus);
    storeStationFocus(focus);
  }

  function openStation(focus: StationFocus) {
    router.push(ROUTABLE_STATION_HREFS[focus]);
  }

  const stationAnnouncement = `${STATION_LABELS[stationFocus]} selected`;

  function onPointerDown(event: PointerEvent<HTMLDivElement>) {
    if (event.pointerType === "mouse" && event.button !== 0) return;
    dragged.current = false;
    pointerStart.current = { id: event.pointerId, x: event.clientX };
  }

  function onPointerMove(event: PointerEvent<HTMLDivElement>) {
    const start = pointerStart.current;
    if (!start || start.id !== event.pointerId || dragged.current) return;
    if (Math.abs(event.clientX - start.x) < MOBILE_SWIPE_THRESHOLD) return;

    dragged.current = true;
    event.currentTarget.setPointerCapture(event.pointerId);
  }

  function onPointerUp(event: PointerEvent<HTMLDivElement>) {
    const start = pointerStart.current;
    if (!start || start.id !== event.pointerId) return;

    const distance = event.clientX - start.x;
    if (dragged.current) {
      if (distance <= -MOBILE_SWIPE_THRESHOLD && moraTimingAvailable) {
        selectStation("mora");
      }
      if (distance >= MOBILE_SWIPE_THRESHOLD) {
        selectStation("hiragana");
      }
    }

    pointerStart.current = null;
    if (event.currentTarget.hasPointerCapture(event.pointerId)) {
      event.currentTarget.releasePointerCapture(event.pointerId);
    }
  }

  function onPointerCancel(event: PointerEvent<HTMLDivElement>) {
    pointerStart.current = null;
    dragged.current = false;
    if (event.currentTarget.hasPointerCapture(event.pointerId)) {
      event.currentTarget.releasePointerCapture(event.pointerId);
    }
  }

  function onTooltipPointerMove(event: PointerEvent<Element>, label: string) {
    if (event.pointerType !== "mouse") return;
    const maxX = document.documentElement.clientWidth - 112;
    const maxY = document.documentElement.clientHeight - 44;
    setTooltip({
      label,
      x: Math.min(event.clientX + 12, maxX),
      y: Math.min(event.clientY + 12, maxY),
    });
  }

  function getStationTarget(
    container: HTMLDivElement,
    focus: StationFocus,
  ) {
    const target = container.querySelector<SVGElement>(
      `a[href="${ROUTABLE_STATION_HREFS[focus]}"]`,
    );
    if (!target) throw new Error(`Missing keyboard target for station: ${focus}`);
    return target;
  }

  function onDesktopKeyDown(event: KeyboardEvent<HTMLDivElement>) {
    if (event.target !== event.currentTarget) return;

    const direction = event.key;
    if (
      direction === "ArrowDown" ||
      direction === "ArrowLeft" ||
      direction === "ArrowRight" ||
      direction === "ArrowUp"
    ) {
      event.preventDefault();
      const nextFocus = STATION_NEIGHBORS[stationFocus][direction];
      if (nextFocus && isStationVisible(
        nextFocus,
        katakanaAvailable,
        moraTimingAvailable,
      )) {
        selectStation(nextFocus);
      }
      return;
    }

    if (event.key !== "Enter" && event.key !== " ") return;

    event.preventDefault();
    openStation(stationFocus);
  }

  function onDesktopPointerDown(event: PointerEvent<HTMLDivElement>) {
    if (event.target instanceof Element && event.target.closest("a")) return;
    event.currentTarget.focus({ preventScroll: true });
  }

  function onMobileKeyDown(event: KeyboardEvent<HTMLDivElement>) {
    const direction = event.key;
    if (
      direction === "ArrowDown" ||
      direction === "ArrowLeft" ||
      direction === "ArrowRight" ||
      direction === "ArrowUp"
    ) {
      event.preventDefault();
      const nextFocus = STATION_NEIGHBORS[stationFocus][direction];
      if (!nextFocus || !isStationVisible(
        nextFocus,
        katakanaAvailable,
        moraTimingAvailable,
      )) return;

      selectStation(nextFocus);
      getStationTarget(event.currentTarget, nextFocus).focus();
      return;
    }

    if (event.key === "Enter" || event.key === " ") {
      const focusedStationLink = event.currentTarget.querySelector<SVGAElement>(
        ".network-station-link:focus",
      );
      if (event.target !== event.currentTarget && !focusedStationLink) return;

      event.preventDefault();
      const stationLink =
        focusedStationLink ?? getStationTarget(event.currentTarget, stationFocus);
      if (!(stationLink instanceof SVGAElement)) return;
      router.push(stationLink.href.baseVal);
    }
  }

  return (
    <div className="network-views">
      <div
        aria-label="Explore the network with the arrow keys"
        className="network-desktop-viewport"
        data-desktop-focus={stationFocus}
        onKeyDown={onDesktopKeyDown}
        onPointerDown={onDesktopPointerDown}
        ref={desktopViewport}
        role="group"
        tabIndex={0}
      >
        <NetworkView
          katakanaAvailable={katakanaAvailable}
          moraTimingAvailable={moraTimingAvailable}
          onLinePointerLeave={() => setTooltip(null)}
          onStationFocus={selectStation}
          onTooltipPointerMove={onTooltipPointerMove}
        />
        <span aria-live="polite" className="sr-only">
          {stationAnnouncement}
        </span>
      </div>
      <div
        aria-label="Explore the network with the arrow keys"
        className="network-mobile-viewport"
        data-mobile-focus={mobileFocus}
        data-mobile-station-focus={stationFocus}
        onClickCapture={(event) => {
          if (!dragged.current) return;
          event.preventDefault();
          event.stopPropagation();
          dragged.current = false;
        }}
        onKeyDown={onMobileKeyDown}
        onPointerCancel={onPointerCancel}
        onPointerDown={onPointerDown}
        onPointerMove={onPointerMove}
        onPointerUp={onPointerUp}
        ref={mobileViewport}
        role="group"
        tabIndex={0}
      >
        <NetworkView
          katakanaAvailable={katakanaAvailable}
          mobile
          mobileFocus={mobileFocus}
          moraTimingAvailable={moraTimingAvailable}
          onLinePointerLeave={() => setTooltip(null)}
          onStationFocus={selectStation}
          onTooltipPointerMove={onTooltipPointerMove}
        />
        <span aria-live="polite" className="sr-only">
          {stationAnnouncement}
        </span>
      </div>
      {tooltip ? (
        <span className="network-tooltip" role="tooltip" style={{ left: tooltip.x, top: tooltip.y }}>
          {tooltip.label}
        </span>
      ) : null}
    </div>
  );
}
