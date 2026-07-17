"use client";

import { useRef, useState } from "react";
import type { KeyboardEvent, PointerEvent } from "react";

const DESKTOP_VOWELS_X = 250;
const DESKTOP_MORA_X = 750;
const MOBILE_VIEW_WIDTH = 360;
const MOBILE_VOWELS_X = 180;
const MOBILE_MORA_X = MOBILE_VIEW_WIDTH;
const SOUND_Y = 180;
const HIRAGANA_Y = 390;
const SCRIPT_END_Y = HIRAGANA_Y;
const MOBILE_SWIPE_THRESHOLD = 40;
const MOBILE_STATION_HREFS = {
  mora: "/stations/mora-timing",
  vowels: "/stations/vowels",
} as const;

export type MobileFocus = "vowels" | "mora";

type NetworkViewProps = {
  mobile?: boolean;
  mobileFocus?: MobileFocus;
  onDesktopKeyDown: (event: KeyboardEvent<SVGSVGElement>) => void;
  onLinePointerLeave: () => void;
  onLinePointerMove: (event: PointerEvent<SVGLineElement>, label: string) => void;
};

function LinkedStation({
  interchange = false,
  label,
  href,
  line,
  slug,
  x,
}: {
  interchange?: boolean;
  label: string;
  href: string;
  line: "sound" | "script";
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
    <a aria-label={`Open ${label}`} className="network-station-link" href={href}>
      {station}
    </a>
  );
}

function NetworkView({
  mobile = false,
  mobileFocus = "vowels",
  onDesktopKeyDown,
  onLinePointerLeave,
  onLinePointerMove,
}: NetworkViewProps) {
  const width = mobile ? MOBILE_VIEW_WIDTH : 1000;
  const vowelsX = mobile ? MOBILE_VOWELS_X : DESKTOP_VOWELS_X;
  const moraX = mobile ? MOBILE_MORA_X : DESKTOP_MORA_X;
  const view = mobile ? "mobile" : "desktop";

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
      <text className="network-line-label network-line-label-script" data-line="script" x={vowelsX - 24} y={300}>
        SCRIPT
      </text>
      <LinkedStation href={MOBILE_STATION_HREFS.vowels} interchange label="Vowels" line="sound" slug="vowels" x={vowelsX} />
      <LinkedStation href={MOBILE_STATION_HREFS.mora} label="Mora timing" line="sound" slug="mora-timing" x={moraX} />
      <g
        className="network-station"
        data-station="hiragana"
        data-station-kind="single-line"
        transform={`translate(${vowelsX} ${HIRAGANA_Y})`}
      >
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
      onKeyDown={mobile ? undefined : onDesktopKeyDown}
      role="img"
      viewBox={`0 0 ${width} 500`}
    >
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

export function NetworkMap({ initialMobileFocus = "vowels" }: { initialMobileFocus?: MobileFocus }) {
  const [mobileFocus, setMobileFocus] = useState<MobileFocus>(initialMobileFocus);
  const [tooltip, setTooltip] = useState<{ label: string; x: number; y: number } | null>(null);
  const pointerStart = useRef<{ id: number; x: number } | null>(null);
  const dragged = useRef(false);

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
      if (distance <= -MOBILE_SWIPE_THRESHOLD) setMobileFocus("mora");
      if (distance >= MOBILE_SWIPE_THRESHOLD) setMobileFocus("vowels");
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

  function getStationLink(
    container: HTMLDivElement | SVGSVGElement,
    focus: MobileFocus,
  ) {
    const stationLink = container.querySelector<SVGAElement>(
      `a[href="${MOBILE_STATION_HREFS[focus]}"]`,
    );
    if (!stationLink) throw new Error(`Missing link for centered station: ${focus}`);
    return stationLink;
  }

  function onDesktopKeyDown(event: KeyboardEvent<SVGSVGElement>) {
    if (event.key === "Enter" || event.key === " ") {
      const stationLink = event.currentTarget.querySelector<SVGAElement>(
        ".network-station-link:focus",
      );
      if (!stationLink) return;

      event.preventDefault();
      window.location.assign(stationLink.href.baseVal);
      return;
    }

    if (event.key !== "ArrowLeft" && event.key !== "ArrowRight") return;

    event.preventDefault();
    getStationLink(
      event.currentTarget,
      event.key === "ArrowLeft" ? "vowels" : "mora",
    ).focus();
  }

  function onMobileKeyDown(event: KeyboardEvent<HTMLDivElement>) {
    if (event.key === "ArrowLeft") {
      event.preventDefault();
      setMobileFocus("vowels");
      getStationLink(event.currentTarget, "vowels").focus();
      return;
    }

    if (event.key === "ArrowRight") {
      event.preventDefault();
      setMobileFocus("mora");
      getStationLink(event.currentTarget, "mora").focus();
      return;
    }

    if (event.key === "Enter" || event.key === " ") {
      const focusedStationLink = event.currentTarget.querySelector<SVGAElement>(
        ".network-station-link:focus",
      );
      if (event.target !== event.currentTarget && !focusedStationLink) return;

      event.preventDefault();
      const stationLink =
        focusedStationLink ?? getStationLink(event.currentTarget, mobileFocus);
      window.location.assign(stationLink.href.baseVal);
    }
  }

  return (
    <div className="network-views">
      <NetworkView
        onDesktopKeyDown={onDesktopKeyDown}
        onLinePointerLeave={() => setTooltip(null)}
        onLinePointerMove={onLinePointerMove}
      />
      <div
        aria-label="Explore the network horizontally"
        className="network-mobile-viewport"
        data-mobile-focus={mobileFocus}
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
        role="group"
        tabIndex={0}
      >
        <NetworkView
          mobile
          mobileFocus={mobileFocus}
          onDesktopKeyDown={onDesktopKeyDown}
          onLinePointerLeave={() => setTooltip(null)}
          onLinePointerMove={onLinePointerMove}
        />
        <span aria-live="polite" className="sr-only">
          {mobileFocus === "vowels" ? "Vowels centered" : "Mora timing centered"}
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
