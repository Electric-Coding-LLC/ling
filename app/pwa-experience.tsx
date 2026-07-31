"use client";

import { useEffect, useRef, useState } from "react";

const LAST_BUILD_STORAGE_KEY = "ling:last-running-build";
const PULL_REFRESH_THRESHOLD = 96;
const PULL_RESISTANCE = 0.5;
const MAX_PULL_DISTANCE = 64;

type UpdateNotice = "available" | "updated" | null;

type NavigatorWithStandalone = Navigator & {
  readonly standalone?: boolean;
};

function isInstalledApp() {
  return window.matchMedia("(display-mode: standalone)").matches
    || (navigator as NavigatorWithStandalone).standalone === true;
}

function readLastBuild() {
  try {
    return window.localStorage.getItem(LAST_BUILD_STORAGE_KEY);
  } catch {
    return null;
  }
}

function rememberBuild(build: string) {
  try {
    window.localStorage.setItem(LAST_BUILD_STORAGE_KEY, build);
  } catch {
    // Version feedback is optional when storage is unavailable.
  }
}

export function PwaExperience({
  build,
  version,
}: {
  build: string;
  version: string;
}) {
  const pullStartRef = useRef<{ x: number; y: number; active: boolean } | null>(null);
  const rawPullDistanceRef = useRef(0);
  const refreshingRef = useRef(false);
  const [pullDistance, setPullDistance] = useState(0);
  const [pullReady, setPullReady] = useState(false);
  const [refreshing, setRefreshing] = useState(false);
  const [updateNotice, setUpdateNotice] = useState<UpdateNotice>(null);

  useEffect(() => {
    if (!isInstalledApp()) return;

    function resetPull() {
      pullStartRef.current = null;
      rawPullDistanceRef.current = 0;
      setPullDistance(0);
      setPullReady(false);
    }

    function onTouchStart(event: TouchEvent) {
      if (event.touches.length !== 1 || window.scrollY > 0 || refreshingRef.current) {
        resetPull();
        return;
      }

      const touch = event.touches[0];
      pullStartRef.current = { x: touch.clientX, y: touch.clientY, active: false };
    }

    function onTouchMove(event: TouchEvent) {
      const start = pullStartRef.current;
      const touch = event.touches[0];
      if (!start || !touch || refreshingRef.current) return;

      const distanceX = touch.clientX - start.x;
      const distanceY = touch.clientY - start.y;
      if (distanceY <= 0) {
        resetPull();
        return;
      }

      if (!start.active) {
        if (distanceY < 8 || Math.abs(distanceX) >= distanceY) return;
        start.active = true;
      }

      event.preventDefault();
      rawPullDistanceRef.current = distanceY;
      setPullDistance(Math.min(distanceY * PULL_RESISTANCE, MAX_PULL_DISTANCE));
      setPullReady(distanceY >= PULL_REFRESH_THRESHOLD);
    }

    function onTouchEnd() {
      if (rawPullDistanceRef.current < PULL_REFRESH_THRESHOLD) {
        resetPull();
        return;
      }

      refreshingRef.current = true;
      setRefreshing(true);
      setPullDistance(MAX_PULL_DISTANCE);
      window.setTimeout(() => window.location.reload(), 120);
    }

    window.addEventListener("touchstart", onTouchStart, { passive: true });
    window.addEventListener("touchmove", onTouchMove, { passive: false });
    window.addEventListener("touchend", onTouchEnd, { passive: true });
    window.addEventListener("touchcancel", resetPull, { passive: true });

    return () => {
      window.removeEventListener("touchstart", onTouchStart);
      window.removeEventListener("touchmove", onTouchMove);
      window.removeEventListener("touchend", onTouchEnd);
      window.removeEventListener("touchcancel", resetPull);
    };
  }, []);

  useEffect(() => {
    const previousBuild = readLastBuild();
    let updatedNoticeTimeout: number | undefined;
    if (build !== "development" && previousBuild && previousBuild !== build) {
      updatedNoticeTimeout = window.setTimeout(() => setUpdateNotice("updated"), 0);
    }
    rememberBuild(build);

    async function checkForUpdate() {
      try {
        const response = await fetch("/api/pwa/version", {
          cache: "no-store",
          headers: { accept: "application/json" },
        });
        if (!response.ok) return;

        const current = await response.json() as { build?: unknown };
        if (
          typeof current.build === "string"
          && current.build !== "development"
          && current.build !== build
        ) {
          setUpdateNotice("available");
        }
      } catch {
        // Update checks should never interrupt use of the app.
      }
    }

    function checkWhenVisible() {
      if (document.visibilityState === "visible") void checkForUpdate();
    }

    void checkForUpdate();
    window.addEventListener("focus", checkForUpdate);
    document.addEventListener("visibilitychange", checkWhenVisible);
    return () => {
      if (updatedNoticeTimeout !== undefined) {
        window.clearTimeout(updatedNoticeTimeout);
      }
      window.removeEventListener("focus", checkForUpdate);
      document.removeEventListener("visibilitychange", checkWhenVisible);
    };
  }, [build]);

  useEffect(() => {
    if (updateNotice !== "updated") return;
    const timeout = window.setTimeout(() => setUpdateNotice(null), 5000);
    return () => window.clearTimeout(timeout);
  }, [updateNotice]);

  const pullLabel = refreshing
    ? "Refreshing"
    : pullReady
      ? "Release to refresh"
      : "Pull to refresh";

  return (
    <>
      <div
        aria-hidden="true"
        className="pwa-pull-indicator"
        data-visible={pullDistance > 0 || refreshing ? "true" : undefined}
        style={{ transform: `translate(-50%, ${pullDistance - MAX_PULL_DISTANCE}px)` }}
      >
        <span className="pwa-pull-arrow" data-ready={pullReady ? "true" : undefined}>
          {refreshing ? "···" : "↓"}
        </span>
        <span>{pullLabel}</span>
      </div>
      <span aria-live="polite" className="sr-only" role="status">
        {refreshing ? "Refreshing Ling" : ""}
      </span>

      {updateNotice ? (
        <div aria-live="polite" className="pwa-update-toast" role="status">
          <span>
            {updateNotice === "available"
              ? "A Ling update is ready"
              : `Ling updated · ${version}`}
          </span>
          {updateNotice === "available" ? (
            <button onClick={() => window.location.reload()} type="button">
              Reload
            </button>
          ) : null}
          <button
            aria-label="Dismiss update notice"
            className="pwa-update-dismiss"
            onClick={() => setUpdateNotice(null)}
            type="button"
          >
            ×
          </button>
        </div>
      ) : null}
    </>
  );
}
