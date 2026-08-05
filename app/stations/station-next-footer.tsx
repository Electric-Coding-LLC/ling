"use client";

import { usePathname } from "next/navigation";
import { NavigationLink } from "../navigation-feedback";

type StationLine = "foundation" | "sound" | "travel" | "vocabulary" | "writing";

type NextStation = {
  readonly href: string;
  readonly label: string;
  readonly line: StationLine;
};

const NEXT_STATIONS: Readonly<Record<string, NextStation>> = {
  "/stations/japanese": { href: "/stations/romaji", label: "Rōmaji", line: "foundation" },
  "/stations/romaji": { href: "/stations/japan", label: "Japan", line: "travel" },
  "/stations/japan": { href: "/stations/introductions", label: "Introductions", line: "travel" },
  "/stations/introductions": { href: "/stations/navigation", label: "Navigation", line: "travel" },
  "/stations/navigation": { href: "/stations/food", label: "Food", line: "travel" },
  "/stations/food": { href: "/stations/shopping", label: "Shopping", line: "travel" },
  "/stations/shopping": { href: "/stations/help", label: "Help", line: "travel" },
  "/stations/help": { href: "/stations/sound", label: "Sound", line: "sound" },
  "/stations/sound": { href: "/stations/vowels", label: "Vowels", line: "sound" },
  "/stations/vowels": { href: "/stations/mora-timing", label: "Mora", line: "sound" },
  "/stations/mora-timing": { href: "/stations/pitch-accent", label: "Pitch", line: "sound" },
  "/stations/pitch-accent": { href: "/stations/writing", label: "Writing", line: "writing" },
  "/stations/writing": { href: "/stations/kana", label: "Kana", line: "writing" },
  "/stations/kana": { href: "/stations/hiragana", label: "Hiragana", line: "writing" },
  "/stations/hiragana": { href: "/stations/kanji", label: "Kanji", line: "writing" },
  "/stations/kanji": { href: "/stations/katakana", label: "Katakana", line: "writing" },
  "/stations/katakana": { href: "/stations/sound-marks", label: "Dakuten & Handakuten", line: "writing" },
  "/stations/sound-marks": { href: "/stations/combined-sounds", label: "Yōon", line: "writing" },
  "/stations/combined-sounds": { href: "/stations/vocabulary", label: "Vocabulary", line: "vocabulary" },
  "/stations/vocabulary": { href: "/stations/pointing", label: "Pointing", line: "vocabulary" },
  "/stations/pointing": { href: "/stations/people", label: "People", line: "vocabulary" },
  "/stations/people": { href: "/stations/needs", label: "Needs", line: "vocabulary" },
  "/stations/needs": { href: "/stations/movement", label: "Movement", line: "vocabulary" },
  "/stations/movement": { href: "/stations/time", label: "Time", line: "vocabulary" },
  "/stations/time": { href: "/stations/actions", label: "Actions", line: "vocabulary" },
  "/stations/actions": { href: "/stations/descriptions", label: "Descriptions", line: "vocabulary" },
};

function NextArrowIcon() {
  return (
    <svg
      aria-hidden="true"
      className="station-next-arrow"
      viewBox="0 0 24 24"
    >
      <path d="M4 12h16m-6-6 6 6-6 6" />
    </svg>
  );
}

export function StationNextFooter() {
  const pathname = usePathname();

  if (pathname === "/stations/descriptions") {
    return (
      <footer aria-label="Station navigation" className="station-next-footer">
        <NavigationLink
          className="station-next-link"
          href="/?focus=descriptions"
          loadingMap
        >
          <span>Return to map</span>
          <NextArrowIcon />
        </NavigationLink>
      </footer>
    );
  }

  const nextStation = NEXT_STATIONS[pathname];
  if (!nextStation) return null;

  return (
    <footer aria-label="Station navigation" className="station-next-footer">
      <NavigationLink
        aria-label={`Next station: ${nextStation.label}`}
        className={`station-next-link station-next-link-${nextStation.line}`}
        href={nextStation.href}
        loadingStation={nextStation.label}
      >
        <span className="station-next-copy">
          <span>Next station:</span>
          <span className="station-next-name">{nextStation.label}</span>
        </span>
        <NextArrowIcon />
      </NavigationLink>
    </footer>
  );
}
