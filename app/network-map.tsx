"use client";

import { useEffect, useRef, useState, useSyncExternalStore } from "react";
import type { KeyboardEvent, PointerEvent } from "react";
import { LingWordmark } from "./brand";
import { NavigationLink, useRouteReady } from "./navigation-feedback";

type MobileFocus = "kana" | "hiragana" | "katakana" | "extensions" | "mora";
export type StationFocus = MobileFocus;
type StationDirection = "ArrowDown" | "ArrowLeft" | "ArrowRight" | "ArrowUp";
type AvailabilityStatus = "error" | "loading" | "ready";

// A station-to-station edge uses one visual unit unless its meaning requires otherwise.
const NETWORK_SEGMENT_LENGTH = 180;
const NETWORK_LINE_NODE_OFFSET = 18;
const NETWORK_INTERCHANGE_NODE_OFFSET = 31;
const DESKTOP_KANA_X = 250;
const DESKTOP_MORA_X = DESKTOP_KANA_X + NETWORK_SEGMENT_LENGTH;
const MOBILE_KANA_X = NETWORK_SEGMENT_LENGTH;
const MOBILE_MORA_X = MOBILE_KANA_X + NETWORK_SEGMENT_LENGTH;
const MOBILE_VIEW_WIDTH = MOBILE_MORA_X;
const NETWORK_VIEW_HEIGHT = 810;
const SOUND_Y = 180;
const HIRAGANA_Y = SOUND_Y + NETWORK_SEGMENT_LENGTH;
const KATAKANA_Y = HIRAGANA_Y + NETWORK_SEGMENT_LENGTH;
const KANA_EXTENSIONS_Y = KATAKANA_Y + NETWORK_SEGMENT_LENGTH;
const WRITING_LABEL_Y = SOUND_Y + NETWORK_SEGMENT_LENGTH / 2;
const MOBILE_SWIPE_THRESHOLD = 40;
const STATION_FOCUS_STORAGE_KEY = "ling:network-station-focus";
const STATION_FOCUS_EVENT = "ling:network-station-focus-change";
const INITIAL_AVAILABILITY = {
  hiragana: false,
  katakana: false,
  extensions: false,
  mora: false,
} as const;
const ROUTABLE_STATION_HREFS = {
  kana: "/stations/kana",
  hiragana: "/stations/hiragana",
  katakana: "/stations/katakana",
  extensions: "/stations/kana-extensions",
  mora: "/stations/mora-timing",
} as const;
const STATION_LABELS: Record<StationFocus, string> = {
  kana: "Kana",
  hiragana: "Hiragana",
  katakana: "Katakana",
  extensions: "Kana extensions",
  mora: "Mora timing",
};
const STATION_NEIGHBORS: Record<
  StationFocus,
  Partial<Record<StationDirection, StationFocus>>
> = {
  kana: { ArrowDown: "hiragana", ArrowRight: "mora" },
  hiragana: { ArrowDown: "katakana", ArrowUp: "kana" },
  katakana: { ArrowDown: "extensions", ArrowUp: "hiragana" },
  extensions: { ArrowUp: "katakana" },
  mora: { ArrowLeft: "kana" },
};

function NetworkLoadError({ onRetry }: { onRetry: () => void }) {
  return (
    <div
      aria-live="assertive"
      className="loading-shell loading-shell-overlay network-load-error"
      role="alert"
    >
      <div className="loading-lockup">
        <LingWordmark className="loading-wordmark" />
        <p className="loading-kicker">Network unavailable</p>
        <p className="network-load-error-message">
          Ling couldn&apos;t load your network.
        </p>
        <button className="network-load-retry" onClick={onRetry} type="button">
          Try again
        </button>
      </div>
    </div>
  );
}

type NetworkViewProps = {
  mobile?: boolean;
  mobileFocus?: MobileFocus;
  hiraganaAvailable: boolean;
  katakanaAvailable: boolean;
  kanaExtensionsAvailable: boolean;
  moraTimingAvailable: boolean;
  onLinePointerLeave: () => void;
  onStationFocus: (focus: StationFocus) => void;
  onTooltipPointerMove: (event: PointerEvent<Element>, label: string) => void;
};

function readStoredStationFocus(): StationFocus | null {
  const storedFocus = localStorage.getItem(STATION_FOCUS_STORAGE_KEY);
  return storedFocus === "mora" || storedFocus === "extensions" || storedFocus === "katakana" || storedFocus === "hiragana" || storedFocus === "kana"
    ? storedFocus
    : null;
}

function getStoredStationFocus(): StationFocus {
  return readStoredStationFocus() ?? "kana";
}

function getServerStationFocus(): StationFocus {
  return "kana";
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
  hiraganaAvailable: boolean,
  katakanaAvailable: boolean,
  kanaExtensionsAvailable: boolean,
  moraTimingAvailable: boolean,
) {
  return focus === "kana"
    || (focus === "hiragana" && hiraganaAvailable)
    || (focus === "katakana" && katakanaAvailable)
    || (focus === "extensions" && kanaExtensionsAvailable)
    || (focus === "mora" && moraTimingAvailable);
}

function LinkedStation({
  backlightId,
  kind,
  label,
  labelPlacement = "above",
  href,
  onFocus,
  onPointerLeave,
  slug,
  x,
  y = SOUND_Y,
}: {
  backlightId: string;
  kind: "interchange" | "sound" | "writing";
  label: string;
  labelPlacement?: "above" | "right";
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
      <text
        className={`network-station-label network-station-label-${labelPlacement}`}
        dominantBaseline={labelPlacement === "right" ? "middle" : undefined}
        textAnchor={labelPlacement === "right" ? "start" : "middle"}
        x={labelPlacement === "right" ? 26 : 0}
        y={labelPlacement === "right" ? 0 : interchange ? -48 : -36}
      >
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
    <NavigationLink
      aria-label={`Open ${label}`}
      className="network-station-link"
      href={href}
      loadingStation={label}
      onFocus={onFocus}
      onPointerLeave={onPointerLeave}
      prefetch
    >
      {station}
    </NavigationLink>
  );
}

function NetworkView({
  mobile = false,
  mobileFocus = "kana",
  hiraganaAvailable,
  katakanaAvailable,
  kanaExtensionsAvailable,
  moraTimingAvailable,
  onLinePointerLeave,
  onStationFocus,
  onTooltipPointerMove,
}: NetworkViewProps) {
  const width = mobile ? MOBILE_VIEW_WIDTH : 1000;
  const kanaX = mobile ? MOBILE_KANA_X : DESKTOP_KANA_X;
  const moraX = mobile ? MOBILE_MORA_X : DESKTOP_MORA_X;
  const view = mobile ? "mobile" : "desktop";
  const backlightId = `${view}-station-backlight`;
  const kanaLineOffset = hiraganaAvailable
    ? NETWORK_INTERCHANGE_NODE_OFFSET
    : NETWORK_LINE_NODE_OFFSET;

  const network = (
    <>
      <text
        className="network-line-label network-line-label-sound"
        data-line="sound"
        dominantBaseline="middle"
        textAnchor="end"
        x={kanaX - 48}
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
            x1={kanaX + kanaLineOffset}
            x2={moraX - NETWORK_LINE_NODE_OFFSET}
            y1={SOUND_Y}
            y2={SOUND_Y}
          />
          <line
            aria-hidden="true"
            className="network-line network-line-sound"
            pointerEvents="none"
            x1={kanaX + kanaLineOffset}
            x2={moraX - NETWORK_LINE_NODE_OFFSET}
            y1={SOUND_Y}
            y2={SOUND_Y}
          />
        </g>
      ) : null}
      {hiraganaAvailable ? (
        <>
          <text
            className="network-line-label network-line-label-writing"
            data-line="writing"
            dominantBaseline="middle"
            textAnchor="end"
            x={kanaX - 20}
            y={WRITING_LABEL_Y}
          >
            WRITING
          </text>
          <g className="network-line-target">
            <line
              aria-label="Writing line"
              className="network-line-hit"
              data-tooltip="Writing line"
              onPointerEnter={(event) => onTooltipPointerMove(event, "Writing line")}
              onPointerLeave={onLinePointerLeave}
              onPointerMove={(event) => onTooltipPointerMove(event, "Writing line")}
              pointerEvents="stroke"
              stroke="transparent"
              strokeWidth="24"
              x1={kanaX}
              x2={kanaX}
              y1={SOUND_Y + NETWORK_INTERCHANGE_NODE_OFFSET}
              y2={HIRAGANA_Y - NETWORK_LINE_NODE_OFFSET}
            />
            <line
              aria-hidden="true"
              className="network-line network-line-writing"
              pointerEvents="none"
              x1={kanaX}
              x2={kanaX}
              y1={SOUND_Y + NETWORK_INTERCHANGE_NODE_OFFSET}
              y2={HIRAGANA_Y - NETWORK_LINE_NODE_OFFSET}
            />
          </g>
          {katakanaAvailable ? (
            <g className="network-line-target">
              <line
                aria-label="Writing line"
                className="network-line-hit"
                data-tooltip="Writing line"
                onPointerEnter={(event) => onTooltipPointerMove(event, "Writing line")}
                onPointerLeave={onLinePointerLeave}
                onPointerMove={(event) => onTooltipPointerMove(event, "Writing line")}
                pointerEvents="stroke"
                stroke="transparent"
                strokeWidth="24"
                x1={kanaX}
                x2={kanaX}
                y1={HIRAGANA_Y + NETWORK_LINE_NODE_OFFSET}
                y2={KATAKANA_Y - NETWORK_LINE_NODE_OFFSET}
              />
              <line
                aria-hidden="true"
                className="network-line network-line-writing"
                pointerEvents="none"
                x1={kanaX}
                x2={kanaX}
                y1={HIRAGANA_Y + NETWORK_LINE_NODE_OFFSET}
                y2={KATAKANA_Y - NETWORK_LINE_NODE_OFFSET}
              />
            </g>
          ) : null}
          {kanaExtensionsAvailable ? (
            <g className="network-line-target">
              <line
                aria-label="Writing line"
                className="network-line-hit"
                data-tooltip="Writing line"
                onPointerEnter={(event) => onTooltipPointerMove(event, "Writing line")}
                onPointerLeave={onLinePointerLeave}
                onPointerMove={(event) => onTooltipPointerMove(event, "Writing line")}
                pointerEvents="stroke"
                stroke="transparent"
                strokeWidth="24"
                x1={kanaX}
                x2={kanaX}
                y1={KATAKANA_Y + NETWORK_LINE_NODE_OFFSET}
                y2={KANA_EXTENSIONS_Y - NETWORK_LINE_NODE_OFFSET}
              />
              <line
                aria-hidden="true"
                className="network-line network-line-writing"
                pointerEvents="none"
                x1={kanaX}
                x2={kanaX}
                y1={KATAKANA_Y + NETWORK_LINE_NODE_OFFSET}
                y2={KANA_EXTENSIONS_Y - NETWORK_LINE_NODE_OFFSET}
              />
            </g>
          ) : null}
        </>
      ) : null}
      <LinkedStation backlightId={backlightId} href={ROUTABLE_STATION_HREFS.kana} kind={hiraganaAvailable ? "interchange" : "sound"} label="Kana" onFocus={() => onStationFocus("kana")} onPointerLeave={onLinePointerLeave} slug="kana" x={kanaX} />
      {hiraganaAvailable ? (
        <LinkedStation
          backlightId={backlightId}
          href={ROUTABLE_STATION_HREFS.hiragana}
          kind="writing"
          label="Hiragana"
          labelPlacement="right"
          onFocus={() => onStationFocus("hiragana")}
          onPointerLeave={onLinePointerLeave}
          slug="hiragana"
          x={kanaX}
          y={HIRAGANA_Y}
        />
      ) : null}
      {katakanaAvailable ? (
        <LinkedStation
          backlightId={backlightId}
          href={ROUTABLE_STATION_HREFS.katakana}
          kind="writing"
          label="Katakana"
          labelPlacement="right"
          onFocus={() => onStationFocus("katakana")}
          onPointerLeave={onLinePointerLeave}
          slug="katakana"
          x={kanaX}
          y={KATAKANA_Y}
        />
      ) : null}
      {kanaExtensionsAvailable ? (
        <LinkedStation
          backlightId={backlightId}
          href={ROUTABLE_STATION_HREFS.extensions}
          kind="writing"
          label="Kana extensions"
          labelPlacement="right"
          onFocus={() => onStationFocus("extensions")}
          onPointerLeave={onLinePointerLeave}
          slug="kana-extensions"
          x={kanaX}
          y={KANA_EXTENSIONS_Y}
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
      aria-label={hiraganaAvailable ? "Sound and Writing network" : "Sound network"}
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
        <radialGradient id={`${backlightId}-writing`}>
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
        <mask height="160" id={`${backlightId}-mask`} maskUnits="userSpaceOnUse" width="160" x="-80" y="-80">
          <circle fill={`url(#${backlightId}-falloff)`} r="80" />
        </mask>
      </defs>
      <desc id={`${view}-network-description`}>
        {hiraganaAvailable
          ? "Kana connects the Sound and Writing lines. Hiragana, Katakana, and Kana extensions follow Kana on the Writing line."
          : "Kana is the first station on the Sound line."}
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
  hiraganaAvailable: initialHiraganaAvailable = false,
  katakanaAvailable: initialKatakanaAvailable = false,
  kanaExtensionsAvailable: initialKanaExtensionsAvailable = false,
  moraTimingAvailable: initialMoraTimingAvailable = false,
}: {
  initialStationFocus?: StationFocus;
  hiraganaAvailable?: boolean;
  katakanaAvailable?: boolean;
  kanaExtensionsAvailable?: boolean;
  moraTimingAvailable?: boolean;
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
  const [availability, setAvailability] = useState(() => ({
    ...INITIAL_AVAILABILITY,
    hiragana: initialHiraganaAvailable,
    katakana: initialKatakanaAvailable,
    extensions: initialKanaExtensionsAvailable,
    mora: initialMoraTimingAvailable,
  }));
  const [availabilityAttempt, setAvailabilityAttempt] = useState(0);
  const [availabilityStatus, setAvailabilityStatus] =
    useState<AvailabilityStatus>("loading");
  const hiraganaAvailable = availability.hiragana;
  const katakanaAvailable = availability.katakana;
  const kanaExtensionsAvailable = availability.extensions;
  const moraTimingAvailable = availability.mora;
  const requestedStationFocus = selectedStationFocus ?? storedStationFocus;
  const stationFocus = isStationVisible(
    requestedStationFocus,
    hiraganaAvailable,
    katakanaAvailable,
    kanaExtensionsAvailable,
    moraTimingAvailable,
  )
    ? requestedStationFocus
    : "kana";
  const mobileFocus: MobileFocus = stationFocus;
  const [tooltip, setTooltip] = useState<{ label: string; x: number; y: number } | null>(null);
  const desktopViewport = useRef<HTMLDivElement>(null);
  const mobileViewport = useRef<HTMLDivElement>(null);
  const pointerStart = useRef<{ id: number; x: number } | null>(null);
  const dragged = useRef(false);

  useEffect(() => {
    const requestedFocus = new URLSearchParams(window.location.search).get("focus");
    const focus = requestedFocus === "mora-timing"
      ? "mora"
      : requestedFocus === "kana-extensions"
        ? "extensions"
      : requestedFocus === "vowels"
        ? "kana"
        : requestedFocus;
    if (
      focus === "kana"
      || focus === "hiragana"
      || focus === "katakana"
      || focus === "extensions"
      || focus === "mora"
    ) {
      storeStationFocus(focus);
    }
  }, []);

  useEffect(() => {
    const controller = new AbortController();
    void fetch("/api/stations/availability", {
      cache: "no-store",
      signal: controller.signal,
    })
      .then(async (response) => {
        if (!response.ok) throw new Error("Station availability could not load");
        return response.json() as Promise<{ available?: unknown }>;
      })
      .then((payload) => {
        if (!Array.isArray(payload.available)) {
          throw new Error("Station availability is invalid");
        }
        setAvailability({
          hiragana: payload.available.includes("hiragana"),
          katakana: payload.available.includes("katakana"),
          extensions: payload.available.includes("kana-extensions"),
          mora: payload.available.includes("mora-timing"),
        });
        setAvailabilityStatus("ready");
        routeReady();
      })
      .catch(() => {
        if (!controller.signal.aborted) setAvailabilityStatus("error");
      });

    return () => controller.abort();
  }, [availabilityAttempt, routeReady]);

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

  function retryAvailability() {
    setAvailabilityStatus("loading");
    setAvailabilityAttempt((current) => current + 1);
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
        selectStation("kana");
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
        hiraganaAvailable,
        katakanaAvailable,
        kanaExtensionsAvailable,
        moraTimingAvailable,
      )) {
        selectStation(nextFocus);
      }
      return;
    }

    if (event.key !== "Enter" && event.key !== " ") return;

    event.preventDefault();
    activateStationLink(getStationTarget(event.currentTarget, stationFocus));
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
        hiraganaAvailable,
        katakanaAvailable,
        kanaExtensionsAvailable,
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
      activateStationLink(stationLink);
    }
  }

  function activateStationLink(stationLink: SVGElement) {
    stationLink.dispatchEvent(
      new MouseEvent("click", { bubbles: true, cancelable: true, view: window }),
    );
  }

  return (
    <div className="network-views">
      {availabilityStatus === "error" ? (
        <NetworkLoadError onRetry={retryAvailability} />
      ) : null}
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
          hiraganaAvailable={hiraganaAvailable}
          katakanaAvailable={katakanaAvailable}
          kanaExtensionsAvailable={kanaExtensionsAvailable}
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
          hiraganaAvailable={hiraganaAvailable}
          katakanaAvailable={katakanaAvailable}
          kanaExtensionsAvailable={kanaExtensionsAvailable}
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
