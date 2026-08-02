"use client";

import { useEffect } from "react";
import {
  NETWORK_LOCATION_EVENT,
  NETWORK_LOCATION_STORAGE_KEY,
  type NetworkPlaceId,
} from "@/src/modules/learning/network";

export function StationVisitRecorder({ placeId }: { placeId: NetworkPlaceId }) {
  useEffect(() => {
    localStorage.setItem(NETWORK_LOCATION_STORAGE_KEY, placeId);
    window.dispatchEvent(new Event(NETWORK_LOCATION_EVENT));

    void fetch("/api/network/places", {
      body: JSON.stringify({ placeId }),
      headers: { "Content-Type": "application/json" },
      method: "POST",
    });
  }, [placeId]);

  return null;
}
