"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import {
  createContext,
  useCallback,
  useContext,
  useState,
  type ComponentProps,
  type MouseEvent,
  type ReactNode,
} from "react";
import { flushSync } from "react-dom";
import { LoadingScreen } from "./loading-screen";

type PendingNavigation = { station?: string } | null;

const NavigationFeedbackContext = createContext<
  ((station?: string) => void) | null
>(null);

export function NavigationFeedbackProvider({ children }: { children: ReactNode }) {
  const pathname = usePathname();

  return (
    <NavigationFeedbackBoundary key={pathname}>
      {children}
    </NavigationFeedbackBoundary>
  );
}

function NavigationFeedbackBoundary({ children }: { children: ReactNode }) {
  const [pending, setPending] = useState<PendingNavigation>(null);
  const beginNavigation = useCallback(
    (station?: string) => setPending({ station }),
    [],
  );

  return (
    <NavigationFeedbackContext value={beginNavigation}>
      {children}
      {pending ? <LoadingScreen overlay station={pending.station} /> : null}
    </NavigationFeedbackContext>
  );
}

export function NavigationLink({
  loadingStation,
  onClick,
  target,
  ...props
}: ComponentProps<typeof Link> & { loadingStation?: string }) {
  const beginNavigation = useContext(NavigationFeedbackContext);
  if (!beginNavigation) {
    throw new Error("NavigationLink must be rendered inside NavigationFeedbackProvider");
  }
  const startNavigation = beginNavigation;

  function handleClick(event: MouseEvent<HTMLAnchorElement>) {
    onClick?.(event);
    if (
      event.defaultPrevented ||
      event.button !== 0 ||
      event.metaKey ||
      event.ctrlKey ||
      event.shiftKey ||
      event.altKey ||
      (target && target !== "_self")
    ) {
      return;
    }

    flushSync(() => startNavigation(loadingStation));
  }

  return (
    <Link
      {...props}
      onClick={handleClick}
      target={target}
    />
  );
}
