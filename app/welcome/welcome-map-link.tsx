"use client";

import type { ComponentProps } from "react";
import { NavigationLink } from "../navigation-feedback";
import {
  dismissWelcome,
  getBrowserWelcomeStorage,
} from "@/src/modules/welcome";

export function WelcomeMapLink({
  onClick,
  ...props
}: Omit<ComponentProps<typeof NavigationLink>, "href">) {
  return (
    <NavigationLink
      {...props}
      href="/"
      loadingMap
      onClick={(event) => {
        const storage = getBrowserWelcomeStorage();
        if (storage) dismissWelcome(storage);
        onClick?.(event);
      }}
    />
  );
}
