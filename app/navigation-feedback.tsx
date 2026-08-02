"use client";

import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";
import {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useLayoutEffect,
  useRef,
  useState,
  type ComponentProps,
  type MouseEvent,
  type ReactNode,
} from "react";
import { flushSync } from "react-dom";
import { LoadingScreen } from "./loading-screen";

type PendingNavigation = {
  departing: boolean;
  id: number;
  returningToMap?: boolean;
  startedAt: number;
  station?: string;
} | null;

type NavigationFeedback = {
  returningToMap?: boolean;
  station?: string;
};

type NavigationFeedbackContextValue = {
  beginNavigation: (feedback?: NavigationFeedback) => void;
  scheduleNavigation: (action: () => void, delayMs: number) => void;
};

const MINIMUM_ROUTE_TRANSITION_MS = 420;
const OVERLAY_EXIT_MS = 180;

const NavigationFeedbackContext = createContext<NavigationFeedbackContextValue | null>(null);
const RouteReadyContext = createContext<(() => void) | null>(null);

export function NavigationFeedbackProvider({ children }: { children: ReactNode }) {
  const pathname = usePathname();
  const [pending, setPending] = useState<PendingNavigation>(null);
  const pendingRef = useRef<PendingNavigation>(null);
  const navigationId = useRef(0);
  const navigationTimeout = useRef<number | null>(null);
  const exitTimeout = useRef<number | null>(null);
  const removalTimeout = useRef<number | null>(null);
  const clearNavigationTimeouts = useCallback(() => {
    if (navigationTimeout.current !== null) window.clearTimeout(navigationTimeout.current);
    if (exitTimeout.current !== null) window.clearTimeout(exitTimeout.current);
    if (removalTimeout.current !== null) window.clearTimeout(removalTimeout.current);
    navigationTimeout.current = null;
    exitTimeout.current = null;
    removalTimeout.current = null;
  }, []);
  const beginNavigation = useCallback(
    (feedback: NavigationFeedback = {}) => {
      clearNavigationTimeouts();
      navigationId.current += 1;
      const nextPending = {
        departing: false,
        id: navigationId.current,
        returningToMap: feedback.returningToMap,
        startedAt: performance.now(),
        station: feedback.station,
      };
      pendingRef.current = nextPending;
      setPending(nextPending);
    },
    [clearNavigationTimeouts],
  );
  const scheduleNavigation = useCallback((action: () => void, delayMs: number) => {
    if (navigationTimeout.current !== null) {
      window.clearTimeout(navigationTimeout.current);
    }
    navigationTimeout.current = window.setTimeout(() => {
      navigationTimeout.current = null;
      action();
    }, delayMs);
  }, []);
  const completeNavigation = useCallback(() => {
    document.documentElement.dataset.lingReady = "true";
    const current = pendingRef.current;
    if (!current || current.departing) return;

    clearNavigationTimeouts();
    const minimumVisibleMs = current.station || current.returningToMap
      ? MINIMUM_ROUTE_TRANSITION_MS
      : 0;
    const remainingMs = Math.max(
      0,
      minimumVisibleMs - (performance.now() - current.startedAt),
    );

    exitTimeout.current = window.setTimeout(() => {
      setPending((value) => {
        if (!value || value.id !== current.id) return value;
        const departing = { ...value, departing: true };
        pendingRef.current = departing;
        return departing;
      });
      removalTimeout.current = window.setTimeout(() => {
        setPending((value) => {
          if (!value || value.id !== current.id) return value;
          pendingRef.current = null;
          return null;
        });
      }, OVERLAY_EXIT_MS);
    }, remainingMs);
  }, [clearNavigationTimeouts]);

  useEffect(() => clearNavigationTimeouts, [clearNavigationTimeouts]);

  return (
    <NavigationFeedbackContext value={{ beginNavigation, scheduleNavigation }}>
      <RouteReadyContext value={completeNavigation}>
        <div className="route-transition-surface" key={pathname}>
          {children}
        </div>
        {pending ? (
          <LoadingScreen
            departing={pending.departing}
            overlay
            returningToMap={pending.returningToMap}
            station={pending.station}
          />
        ) : null}
        <NavigationCompletion onComplete={completeNavigation} />
      </RouteReadyContext>
    </NavigationFeedbackContext>
  );
}

function NavigationCompletion({ onComplete }: { onComplete: () => void }) {
  const pathname = usePathname();

  useLayoutEffect(() => {
    if (pathname === "/") {
      document.documentElement.removeAttribute("data-ling-ready");
    } else {
      document.documentElement.dataset.lingReady = "true";
    }
  }, [pathname]);

  useEffect(() => {
    if (pathname !== "/") onComplete();
  }, [onComplete, pathname]);

  return null;
}

export function useRouteReady() {
  const routeReady = useContext(RouteReadyContext);
  if (!routeReady) {
    throw new Error("useRouteReady must be used inside NavigationFeedbackProvider");
  }

  return routeReady;
}

export function NavigationLink({
  href,
  loadingMap = false,
  loadingStation,
  navigationDelayMs = 0,
  onNavigationCommit,
  onClick,
  replace,
  scroll,
  target,
  ...props
}: ComponentProps<typeof Link> & {
  loadingMap?: boolean;
  loadingStation?: string;
  navigationDelayMs?: number;
  onNavigationCommit?: () => void;
}) {
  const navigationFeedback = useContext(NavigationFeedbackContext);
  const router = useRouter();
  if (!navigationFeedback) {
    throw new Error("NavigationLink must be rendered inside NavigationFeedbackProvider");
  }
  const { beginNavigation, scheduleNavigation } = navigationFeedback;

  function handleClick(event: MouseEvent<HTMLAnchorElement>) {
    onClick?.(event);
    if (
      event.defaultPrevented
      || event.button !== 0
      || event.metaKey
      || event.ctrlKey
      || event.shiftKey
      || event.altKey
      || (target && target !== "_self")
    ) {
      return;
    }

    const controlledNavigation = (loadingMap || loadingStation) && typeof href === "string";
    const performNavigation = () => {
      flushSync(() => {
        onNavigationCommit?.();
        beginNavigation({ returningToMap: loadingMap, station: loadingStation });
      });
      document
        .querySelector(".loading-shell-boot")
        ?.setAttribute("data-ling-departing", "true");

      if (!controlledNavigation) return;
      if (replace) {
        router.replace(href, { scroll });
      } else {
        router.push(href, { scroll });
      }
    };

    if (controlledNavigation && navigationDelayMs > 0) {
      event.preventDefault();
      scheduleNavigation(performNavigation, navigationDelayMs);
      return;
    }

    if (controlledNavigation) event.preventDefault();
    performNavigation();
  }

  return (
    <Link
      {...props}
      href={href}
      onClick={handleClick}
      replace={replace}
      scroll={scroll}
      target={target}
    />
  );
}
