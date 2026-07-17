"use client";

import { useEffect } from "react";

const LING_CACHE_PREFIX = "ling-shell-";

export function PwaCleanup() {
  useEffect(() => {
    if (process.env.NODE_ENV !== "production") return;

    async function removeLegacyOfflineShell() {
      if ("serviceWorker" in navigator) {
        const registrations = await navigator.serviceWorker.getRegistrations();
        await Promise.all(registrations.map((registration) => registration.unregister()));
      }

      if ("caches" in window) {
        const cacheNames = await caches.keys();
        await Promise.all(
          cacheNames
            .filter((cacheName) => cacheName.startsWith(LING_CACHE_PREFIX))
            .map((cacheName) => caches.delete(cacheName)),
        );
      }
    }

    void removeLegacyOfflineShell().catch((error: unknown) =>
      console.error("Legacy offline shell cleanup failed", error),
    );
  }, []);

  return null;
}
