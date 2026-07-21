"use client";

import { useEffect } from "react";

const HYDRATION_MARK = "ling:hydrated";

export function BootReady() {
  useEffect(() => {
    performance.clearMarks(HYDRATION_MARK);
    performance.mark(HYDRATION_MARK);
  }, []);

  return null;
}
