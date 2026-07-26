"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useLayoutEffect,
  type ComponentProps,
  type ReactNode,
} from "react";

const RouteReadyContext = createContext<(() => void) | null>(null);

export function NavigationFeedbackProvider({ children }: { children: ReactNode }) {
  const pathname = usePathname();
  const completeNavigation = useCallback(() => {
    document.documentElement.dataset.lingReady = "true";
  }, []);

  return (
    <RouteReadyContext value={completeNavigation}>
      <div className="route-transition-surface" key={pathname}>
        {children}
      </div>
      <NavigationCompletion onComplete={completeNavigation} />
    </RouteReadyContext>
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
  onClick,
  target,
  ...props
}: ComponentProps<typeof Link>) {
  return (
    <Link
      {...props}
      onClick={(event) => {
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

        document
          .querySelector(".loading-shell-boot")
          ?.setAttribute("data-ling-departing", "true");
      }}
      target={target}
    />
  );
}
