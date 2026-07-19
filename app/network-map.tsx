"use client";

import Link from "next/link";
import { useRouter } from "next/navigation";
import { useEffect, useRef, useState, useSyncExternalStore } from "react";
import type { KeyboardEvent, PointerEvent } from "react";

type MobileFocus = "hiragana" | "mora";
export type StationFocus = MobileFocus;
type StationDirection = "ArrowDown" | "ArrowLeft" | "ArrowRight" | "ArrowUp";

// A station-to-station edge uses one visual unit unless its meaning requires otherwise.
const NETWORK_SEGMENT_LENGTH = 180;
const DESKTOP_HIRAGANA_X = 250;
const DESKTOP_MORA_X = DESKTOP_HIRAGANA_X + NETWORK_SEGMENT_LENGTH;
const MOBILE_HIRAGANA_X = NETWORK_SEGMENT_LENGTH;
const MOBILE_MORA_X = MOBILE_HIRAGANA_X + NETWORK_SEGMENT_LENGTH;
const MOBILE_VIEW_WIDTH = MOBILE_MORA_X;
const NETWORK_VIEW_HEIGHT = 360;
const SOUND_Y = 180;
const MOBILE_SWIPE_THRESHOLD = 40;
const STATION_FOCUS_STORAGE_KEY = "ling:network-station-focus";
const STATION_FOCUS_EVENT = "ling:network-station-focus-change";
const MORA_UNAVAILABLE_REASON = "Learn Hiragana to activate Mora timing";
const ROUTABLE_STATION_HREFS = {
  hiragana: "/stations/hiragana",
  mora: "/stations/mora-timing",
} as const;
const STATION_LABELS: Record<StationFocus, string> = {
  hiragana: "Hiragana",
  mora: "Mora timing",
};
const STATION_NEIGHBORS: Record<
  StationFocus,
  Partial<Record<StationDirection, StationFocus>>
> = {
  hiragana: { ArrowRight: "mora" },
  mora: { ArrowLeft: "hiragana" },
};

type NetworkViewProps = {
  mobile?: boolean;
  mobileFocus?: MobileFocus;
  moraTimingAvailable: boolean;
  onLinePointerLeave: () => void;
  onStationFocus: (focus: StationFocus) => void;
  onTooltipPointerMove: (event: PointerEvent<Element>, label: string) => void;
  onUnavailableStation: () => void;
};

function readStoredStationFocus(): StationFocus | null {
  const storedFocus = localStorage.getItem(STATION_FOCUS_STORAGE_KEY);
  return storedFocus === "mora" || storedFocus === "hiragana"
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

function LinkedStation({
  available = true,
  backlightId,
  label,
  href,
  onFocus,
  onPointerLeave,
  onTooltipPointerMove,
  onUnavailable,
  slug,
  unavailableReason,
  x,
  y = SOUND_Y,
}: {
  available?: boolean;
  backlightId: string;
  label: string;
  href: string;
  onFocus: () => void;
  onPointerLeave: () => void;
  onTooltipPointerMove: (event: PointerEvent<Element>, label: string) => void;
  onUnavailable?: () => void;
  slug: string;
  unavailableReason?: string;
  x: number;
  y?: number;
}) {
  const station = (
    <g
      className={`network-station${available ? "" : " network-station-unavailable"}`}
      data-available={available}
      data-station={slug}
      data-station-kind="single-line"
      transform={`translate(${x} ${y})`}
    >
      <circle
        className="network-station-backlight"
        fill={`url(#${backlightId}-sound)`}
        r="58"
      />
      <text className="network-station-label" y="-36">
        {label}
      </text>
      <circle className="network-single-station-outer network-single-station-outer-sound" r="15" />
      <circle className="network-single-station-inner" r="7" />
      <circle className="network-station-hit" r="48" />
    </g>
  );

  return (
    <Link
      aria-disabled={available ? undefined : true}
      aria-label={available ? `Open ${label}` : `${label}, unavailable. ${unavailableReason}`}
      className="network-station-link"
      href={href}
      onClick={(event) => {
        if (available) return;
        event.preventDefault();
        onUnavailable?.();
      }}
      onFocus={onFocus}
      onPointerEnter={(event) => {
        if (!available && unavailableReason) {
          onTooltipPointerMove(event, unavailableReason);
        }
      }}
      onPointerLeave={onPointerLeave}
      onPointerMove={(event) => {
        if (!available && unavailableReason) {
          onTooltipPointerMove(event, unavailableReason);
        }
      }}
      prefetch={available}
    >
      {station}
    </Link>
  );
}

function NetworkView({
  mobile = false,
  mobileFocus = "hiragana",
  moraTimingAvailable,
  onLinePointerLeave,
  onStationFocus,
  onTooltipPointerMove,
  onUnavailableStation,
}: NetworkViewProps) {
  const width = mobile ? MOBILE_VIEW_WIDTH : 1000;
  const hiraganaX = mobile ? MOBILE_HIRAGANA_X : DESKTOP_HIRAGANA_X;
  const moraX = mobile ? MOBILE_MORA_X : DESKTOP_MORA_X;
  const view = mobile ? "mobile" : "desktop";
  const backlightId = `${view}-station-backlight`;

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
      <g className="network-line-target">
        <line
          aria-label={moraTimingAvailable ? "Sound line" : MORA_UNAVAILABLE_REASON}
          className={`network-line-hit${moraTimingAvailable ? "" : " network-line-hit-unavailable"}`}
          data-tooltip={moraTimingAvailable ? "Sound line" : MORA_UNAVAILABLE_REASON}
          onPointerEnter={(event) =>
            onTooltipPointerMove(
              event,
              moraTimingAvailable ? "Sound line" : MORA_UNAVAILABLE_REASON,
            )
          }
          onPointerLeave={onLinePointerLeave}
          onPointerMove={(event) =>
            onTooltipPointerMove(
              event,
              moraTimingAvailable ? "Sound line" : MORA_UNAVAILABLE_REASON,
            )
          }
          pointerEvents="stroke"
          stroke="transparent"
          strokeWidth="24"
          x1={hiraganaX}
          x2={moraX}
          y1={SOUND_Y}
          y2={SOUND_Y}
        />
        <line
          aria-hidden="true"
          className={`network-line network-line-sound${moraTimingAvailable ? "" : " network-line-unavailable"}`}
          pointerEvents="none"
          x1={hiraganaX}
          x2={moraX}
          y1={SOUND_Y}
          y2={SOUND_Y}
        />
      </g>
      <LinkedStation backlightId={backlightId} href={ROUTABLE_STATION_HREFS.hiragana} label="Hiragana" onFocus={() => onStationFocus("hiragana")} onPointerLeave={onLinePointerLeave} onTooltipPointerMove={onTooltipPointerMove} slug="hiragana" x={hiraganaX} />
      <LinkedStation
        available={moraTimingAvailable}
        backlightId={backlightId}
        href={ROUTABLE_STATION_HREFS.mora}
        label="Mora timing"
        onFocus={() => onStationFocus("mora")}
        onPointerLeave={onLinePointerLeave}
        onTooltipPointerMove={onTooltipPointerMove}
        onUnavailable={onUnavailableStation}
        slug="mora-timing"
        unavailableReason={MORA_UNAVAILABLE_REASON}
        x={moraX}
      />
    </>
  );

  return (
    <svg
      aria-describedby={`${view}-network-description`}
      aria-label="Sound network"
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
      </defs>
      <desc id={`${view}-network-description`}>
        Hiragana begins the Sound line, which continues to Mora timing.
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
  moraTimingAvailable,
}: {
  initialStationFocus?: StationFocus;
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
  const stationFocus = selectedStationFocus ?? storedStationFocus;
  const mobileFocus: MobileFocus = stationFocus;
  const [tooltip, setTooltip] = useState<{ label: string; x: number; y: number } | null>(null);
  const desktopViewport = useRef<HTMLDivElement>(null);
  const mobileViewport = useRef<HTMLDivElement>(null);
  const pointerStart = useRef<{ id: number; x: number } | null>(null);
  const dragged = useRef(false);

  useEffect(() => {
    if (initialStationFocus) storeStationFocus(initialStationFocus);
  }, [initialStationFocus]);

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
    if (focus === "mora" && !moraTimingAvailable) return;
    router.push(ROUTABLE_STATION_HREFS[focus]);
  }

  const stationAnnouncement =
    stationFocus === "mora" && !moraTimingAvailable
      ? `Mora timing selected. ${MORA_UNAVAILABLE_REASON}.`
      : `${STATION_LABELS[stationFocus]} selected`;

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
      if (nextFocus) selectStation(nextFocus);
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
        focusedStationLink ?? getStationTarget(event.currentTarget, stationFocus);
      if (!(stationLink instanceof SVGAElement)) return;
      if (stationLink.getAttribute("aria-disabled") === "true") return;
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
          moraTimingAvailable={moraTimingAvailable}
          onLinePointerLeave={() => setTooltip(null)}
          onStationFocus={selectStation}
          onTooltipPointerMove={onTooltipPointerMove}
          onUnavailableStation={() => selectStation("mora")}
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
          mobile
          mobileFocus={mobileFocus}
          moraTimingAvailable={moraTimingAvailable}
          onLinePointerLeave={() => setTooltip(null)}
          onStationFocus={selectStation}
          onTooltipPointerMove={onTooltipPointerMove}
          onUnavailableStation={() => selectStation("mora")}
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
