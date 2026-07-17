"use client";

import Link from "next/link";
import { useRouter } from "next/navigation";
import { useEffect, useRef, useState, useSyncExternalStore } from "react";
import type { KeyboardEvent, PointerEvent } from "react";

export type MobileFocus = "vowels" | "mora";

type StationFocus = MobileFocus | "hiragana";
type StationDirection = "ArrowDown" | "ArrowLeft" | "ArrowRight" | "ArrowUp";

// A station-to-station edge uses one visual unit unless its meaning requires otherwise.
const NETWORK_SEGMENT_LENGTH = 180;
const DESKTOP_VOWELS_X = 250;
const DESKTOP_MORA_X = DESKTOP_VOWELS_X + NETWORK_SEGMENT_LENGTH;
const MOBILE_VOWELS_X = NETWORK_SEGMENT_LENGTH;
const MOBILE_MORA_X = MOBILE_VOWELS_X + NETWORK_SEGMENT_LENGTH;
const MOBILE_VIEW_WIDTH = MOBILE_MORA_X;
const SOUND_Y = 180;
const HIRAGANA_Y = SOUND_Y + NETWORK_SEGMENT_LENGTH;
const SCRIPT_END_Y = HIRAGANA_Y;
const SCRIPT_LABEL_Y = SOUND_Y + NETWORK_SEGMENT_LENGTH / 2 + 6;
const MOBILE_SWIPE_THRESHOLD = 40;
const STATION_FOCUS_STORAGE_KEY = "ling:network-station-focus";
const STATION_FOCUS_EVENT = "ling:network-station-focus-change";
const ROUTABLE_STATION_HREFS = {
  mora: "/stations/mora-timing",
  vowels: "/stations/vowels",
} as const;
const STATION_LABELS: Record<StationFocus, string> = {
  hiragana: "Hiragana",
  mora: "Mora timing",
  vowels: "Vowels",
};
const STATION_NEIGHBORS: Record<
  StationFocus,
  Partial<Record<StationDirection, StationFocus>>
> = {
  hiragana: { ArrowUp: "vowels" },
  mora: { ArrowLeft: "vowels" },
  vowels: { ArrowDown: "hiragana", ArrowRight: "mora" },
};

type NetworkViewProps = {
  mobile?: boolean;
  mobileFocus?: MobileFocus;
  onLinePointerLeave: () => void;
  onLinePointerMove: (event: PointerEvent<SVGLineElement>, label: string) => void;
  onStationFocus: (focus: MobileFocus) => void;
};

function readStoredStationFocus(): StationFocus | null {
  const storedFocus = localStorage.getItem(STATION_FOCUS_STORAGE_KEY);
  return storedFocus === "vowels" || storedFocus === "mora" || storedFocus === "hiragana"
    ? storedFocus
    : null;
}

function getStoredStationFocus(): StationFocus {
  return readStoredStationFocus() ?? "vowels";
}

function getServerStationFocus(): StationFocus {
  return "vowels";
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
  interchange = false,
  label,
  href,
  line,
  onFocus,
  slug,
  x,
}: {
  backlightId: string;
  interchange?: boolean;
  label: string;
  href: string;
  line: "sound" | "script";
  onFocus: () => void;
  slug: string;
  x: number;
}) {
  const station = (
    <g
      className="network-station"
      data-station={slug}
      data-station-kind={interchange ? "interchange" : "single-line"}
      transform={`translate(${x} ${SOUND_Y})`}
    >
      <circle
        className="network-station-backlight"
        fill={`url(#${backlightId}-${interchange ? "junction" : line})`}
        mask={interchange ? `url(#${backlightId}-mask)` : undefined}
        r={interchange ? 76 : 58}
      />
      <text className="network-station-label" x="0" y={interchange ? -48 : -36}>
        {label}
      </text>
      {interchange ? (
        <>
          <circle className="network-interchange-outer" r="28" />
          <circle className="network-interchange-inner" r="16" />
        </>
      ) : (
        <>
          <circle className={`network-single-station-outer network-single-station-outer-${line}`} r="15" />
          <circle className="network-single-station-inner" r="7" />
        </>
      )}
      <circle className="network-station-hit" r="48" />
    </g>
  );

  return (
    <Link aria-label={`Open ${label}`} className="network-station-link" href={href} onFocus={onFocus} prefetch>
      {station}
    </Link>
  );
}

function NetworkView({
  mobile = false,
  mobileFocus = "vowels",
  onLinePointerLeave,
  onLinePointerMove,
  onStationFocus,
}: NetworkViewProps) {
  const width = mobile ? MOBILE_VIEW_WIDTH : 1000;
  const vowelsX = mobile ? MOBILE_VOWELS_X : DESKTOP_VOWELS_X;
  const moraX = mobile ? MOBILE_MORA_X : DESKTOP_MORA_X;
  const view = mobile ? "mobile" : "desktop";
  const backlightId = `${view}-station-backlight`;

  const network = (
    <>
      <text className="network-line-label network-line-label-sound" data-line="sound" x={mobile ? 24 : 32} y={SOUND_Y - 16}>
        SOUND
      </text>
      <g className="network-line-target">
        <line
          aria-label="Sound line"
          className="network-line-hit"
          data-tooltip="Sound line"
          onPointerEnter={(event) => onLinePointerMove(event, "Sound line")}
          onPointerLeave={onLinePointerLeave}
          onPointerMove={(event) => onLinePointerMove(event, "Sound line")}
          pointerEvents="stroke"
          stroke="transparent"
          strokeWidth="24"
          x1="0"
          x2={moraX}
          y1={SOUND_Y}
          y2={SOUND_Y}
        />
        <line
          aria-hidden="true"
          className="network-line network-line-sound"
          pointerEvents="none"
          x1="0"
          x2={moraX}
          y1={SOUND_Y}
          y2={SOUND_Y}
        />
      </g>
      <g className="network-line-target">
        <line
          aria-label="Script line"
          className="network-line-hit"
          data-tooltip="Script line"
          onPointerEnter={(event) => onLinePointerMove(event, "Script line")}
          onPointerLeave={onLinePointerLeave}
          onPointerMove={(event) => onLinePointerMove(event, "Script line")}
          pointerEvents="stroke"
          stroke="transparent"
          strokeWidth="24"
          x1={vowelsX}
          x2={vowelsX}
          y1={SOUND_Y}
          y2={SCRIPT_END_Y}
        />
        <line
          aria-hidden="true"
          className="network-line network-line-script"
          pointerEvents="none"
          x1={vowelsX}
          x2={vowelsX}
          y1={SOUND_Y}
          y2={SCRIPT_END_Y}
        />
      </g>
      <text className="network-line-label network-line-label-script" data-line="script" x={vowelsX - 24} y={SCRIPT_LABEL_Y}>
        SCRIPT
      </text>
      <LinkedStation backlightId={backlightId} href={ROUTABLE_STATION_HREFS.vowels} interchange label="Vowels" line="sound" onFocus={() => onStationFocus("vowels")} slug="vowels" x={vowelsX} />
      <LinkedStation backlightId={backlightId} href={ROUTABLE_STATION_HREFS.mora} label="Mora timing" line="sound" onFocus={() => onStationFocus("mora")} slug="mora-timing" x={moraX} />
      <g
        aria-label="Hiragana station"
        className="network-station network-station-focus"
        data-station="hiragana"
        data-station-kind="single-line"
        role="img"
        tabIndex={-1}
        transform={`translate(${vowelsX} ${HIRAGANA_Y})`}
      >
        <circle className="network-station-backlight" fill={`url(#${backlightId}-script)`} r="58" />
        <text className="network-station-label network-station-label-side" x="38" y="6">
          Hiragana
        </text>
        <circle className="network-single-station-outer network-single-station-outer-script" r="15" />
        <circle className="network-single-station-inner" r="7" />
      </g>
    </>
  );

  return (
    <svg
      aria-describedby={`${view}-network-description`}
      aria-label="Sound and Script network"
      className={`network-map network-map-${view}`}
      data-network-view={view}
      role="img"
      viewBox={`0 0 ${width} 500`}
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
          <stop offset="0" stopColor="#db4e3a" stopOpacity="0.72" />
          <stop offset="0.48" stopColor="#db4e3a" stopOpacity="0.64" />
          <stop offset="0.52" stopColor="#4c689c" stopOpacity="0.68" />
          <stop offset="1" stopColor="#4c689c" stopOpacity="0.76" />
        </linearGradient>
        <radialGradient id={`${backlightId}-falloff`}>
          <stop offset="0" stopColor="white" stopOpacity="0.72" />
          <stop offset="0.5" stopColor="white" stopOpacity="0.34" />
          <stop offset="1" stopColor="white" stopOpacity="0" />
        </radialGradient>
        <mask
          height="160"
          id={`${backlightId}-mask`}
          maskUnits="userSpaceOnUse"
          width="160"
          x="-80"
          y="-80"
        >
          <circle fill={`url(#${backlightId}-falloff)`} r="80" />
        </mask>
      </defs>
      <desc id={`${view}-network-description`}>
        Vowels connects the Sound line to the Script line. Sound continues to Mora timing, and Script stops at Hiragana.
      </desc>
      {mobile ? (
        <g className={`network-mobile-track network-mobile-track-${mobileFocus}`}>{network}</g>
      ) : (
        network
      )}
    </svg>
  );
}

export function NetworkMap({ initialMobileFocus }: { initialMobileFocus?: MobileFocus }) {
  const router = useRouter();
  const storedStationFocus = useSyncExternalStore(
    subscribeToStoredStationFocus,
    getStoredStationFocus,
    getServerStationFocus,
  );
  const [selectedStationFocus, setSelectedStationFocus] = useState<StationFocus | null>(
    initialMobileFocus ?? null,
  );
  const stationFocus = selectedStationFocus ?? storedStationFocus;
  const mobileFocus: MobileFocus = stationFocus === "mora" ? "mora" : "vowels";
  const [tooltip, setTooltip] = useState<{ label: string; x: number; y: number } | null>(null);
  const desktopViewport = useRef<HTMLDivElement>(null);
  const mobileViewport = useRef<HTMLDivElement>(null);
  const pointerStart = useRef<{ id: number; x: number } | null>(null);
  const dragged = useRef(false);

  useEffect(() => {
    if (initialMobileFocus) storeStationFocus(initialMobileFocus);
  }, [initialMobileFocus]);

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
      if (distance <= -MOBILE_SWIPE_THRESHOLD) {
        selectStation("mora");
      }
      if (distance >= MOBILE_SWIPE_THRESHOLD) {
        selectStation("vowels");
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

  function onLinePointerMove(event: PointerEvent<SVGLineElement>, label: string) {
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
      focus === "hiragana"
        ? '[data-station="hiragana"]'
        : `a[href="${ROUTABLE_STATION_HREFS[focus]}"]`,
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
      if (nextFocus) selectStation(nextFocus);
      return;
    }

    if (event.key !== "Enter" && event.key !== " ") return;

    event.preventDefault();
    if (stationFocus !== "hiragana") {
      router.push(ROUTABLE_STATION_HREFS[stationFocus]);
    }
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
      if (!nextFocus) return;

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
        focusedStationLink ?? getStationTarget(event.currentTarget, mobileFocus);
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
          onLinePointerLeave={() => setTooltip(null)}
          onLinePointerMove={onLinePointerMove}
          onStationFocus={selectStation}
        />
        <span aria-live="polite" className="sr-only">
          {STATION_LABELS[stationFocus]} selected
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
          mobile
          mobileFocus={mobileFocus}
          onLinePointerLeave={() => setTooltip(null)}
          onLinePointerMove={onLinePointerMove}
          onStationFocus={selectStation}
        />
        <span aria-live="polite" className="sr-only">
          {STATION_LABELS[stationFocus]} selected
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
