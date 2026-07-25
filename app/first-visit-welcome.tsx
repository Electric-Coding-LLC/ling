"use client";

import { useEffect } from "react";
import { useRouter } from "next/navigation";
import {
  getBrowserWelcomeStorage,
  hasDismissedWelcome,
} from "@/src/modules/welcome";

export function FirstVisitWelcome() {
  const router = useRouter();

  useEffect(() => {
    const storage = getBrowserWelcomeStorage();
    if (!storage) return;

    const dismissed = hasDismissedWelcome(storage);
    if (dismissed === false) router.replace("/welcome");
  }, [router]);

  return null;
}
