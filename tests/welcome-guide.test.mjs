import assert from "node:assert/strict";
import { readFile } from "node:fs/promises";
import test from "node:test";
import {
  dismissWelcome,
  getBrowserWelcomeStorage,
  hasDismissedWelcome,
  WELCOME_DISMISSED_STORAGE_KEY,
} from "../src/modules/welcome.ts";

const root = new URL("../", import.meta.url);

test("the Welcome dismissal is versioned, persistent, and safe without browser storage", () => {
  const values = new Map();
  const storage = {
    getItem(key) {
      return values.get(key) ?? null;
    },
    setItem(key, value) {
      values.set(key, value);
    },
  };

  assert.equal(WELCOME_DISMISSED_STORAGE_KEY, "ling:welcome-guide:dismissed:v1");
  assert.equal(getBrowserWelcomeStorage(), null);
  assert.equal(hasDismissedWelcome(storage), false);
  assert.equal(dismissWelcome(storage), true);
  assert.equal(hasDismissedWelcome(storage), true);

  const unavailableStorage = {
    getItem() {
      throw new Error("Storage unavailable");
    },
    setItem() {
      throw new Error("Storage unavailable");
    },
  };
  assert.equal(hasDismissedWelcome(unavailableStorage), null);
  assert.equal(dismissWelcome(unavailableStorage), false);
});

test("first visit, dismissal, and permanent map help stay outside station progress", async () => {
  const [home, networkStyles, welcomeStyles, guard, link, guide, welcomePage, stations] = await Promise.all([
    readFile(new URL("app/page.tsx", root), "utf8"),
    readFile(new URL("app/styles/network.css", root), "utf8"),
    readFile(new URL("app/styles/welcome.css", root), "utf8"),
    readFile(new URL("app/first-visit-welcome.tsx", root), "utf8"),
    readFile(new URL("app/welcome/welcome-map-link.tsx", root), "utf8"),
    readFile(new URL("app/welcome/welcome-guide.tsx", root), "utf8"),
    readFile(new URL("app/welcome/page.tsx", root), "utf8"),
    readFile(new URL("src/modules/learning/stations.ts", root), "utf8"),
  ]);

  assert.match(home, /<FirstVisitWelcome \/>/);
  assert.match(home, /href="\/welcome"/);
  assert.match(home, /aria-label="About Ling"/);
  assert.match(home, /title="About Ling"/);
  assert.match(home, /className="network-help-link"/);
  assert.doesNotMatch(home, /network-welcome-entry|A quick guide to the network/);
  assert.match(networkStyles, /\.network-help-link \{[\s\S]*width: 2\.75rem;[\s\S]*height: 2\.75rem;[\s\S]*margin-inline-end: -0\.5rem;/);
  assert.doesNotMatch(networkStyles, /\.network-welcome-(?:entry|link|copy|affordance)/);
  assert.match(welcomeStyles, /\.welcome-cue-visual \{[\s\S]*--welcome-cue-size: 2rem;/);
  assert.match(welcomeStyles, /\.welcome-cue-map svg,[\s\S]*\.welcome-cue-station,[\s\S]*\.welcome-cues \.welcome-cue-progress,[\s\S]*\.welcome-cue-review \{[\s\S]*width: var\(--welcome-cue-size\);[\s\S]*height: var\(--welcome-cue-size\);/);
  assert.match(guard, /if \(!storage\) return/);
  assert.match(guard, /if \(dismissed === false\) router\.replace\("\/welcome"\)/);
  assert.match(link, /dismissWelcome\(storage\)/);
  assert.match(link, /href="\/"/);
  assert.match(welcomePage, /<WelcomeMapLink/);
  assert.match(guide, /import \{ MapIcon \} from "\.\.\/map-icon"/);
  assert.match(guide, /className="welcome-cue-map">[\s\S]*?<MapIcon \/>/);
  assert.doesNotMatch(guide, /← Map/);
  assert.doesNotMatch(guide, /NetworkGlyph|corner glyph/);
  assert.match(guide, /className="welcome-cue-station" viewBox="-18 -18 36 36"/);
  assert.match(guide, /<NetworkStationSymbol kind="sound" \/>/);
  assert.doesNotMatch(guide, /kind="(?:travel-)?interchange"/);
  assert.match(guide, /hiragana-test-trigger welcome-cue-progress/);
  assert.match(guide, /welcome-cue-review-card[\s\S]*?welcome-cue-review-kana/);
  assert.match(guide, /welcome-cue-review-no[\s\S]*?welcome-cue-review-yes/);
  assert.doesNotMatch(guide, /welcome-cue-flashcard/);
  assert.doesNotMatch(stations, /welcome/i);
  assert.doesNotMatch(guard + link, /fetch\(|\/api\/|identity|auth/i);
});
