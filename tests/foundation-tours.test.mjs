import assert from "node:assert/strict";
import { readFile } from "node:fs/promises";
import test from "node:test";
import {
  FOUNDATION_TOURS,
  getFoundationTour,
} from "../src/modules/learning/foundation-tours.ts";
import { GRAMMAR_STATION_IDS } from "../src/modules/learning/grammar.ts";
import { KANJI_STATION_IDS } from "../src/modules/learning/kanji.ts";
import { VOCABULARY_STATION_IDS } from "../src/modules/learning/vocabulary.ts";

const root = new URL("../", import.meta.url);

test("every Foundation gateway teaches every current station on its branch", () => {
  assert.deepEqual(
    FOUNDATION_TOURS.foundations.stations.map(({ id }) => id),
    ["romaji", "japan", "sound", "kana", "kanji", "vocabulary", "grammar"],
  );
  assert.deepEqual(
    FOUNDATION_TOURS.japan.stations.map(({ id }) => id),
    ["introductions", "navigation", "food", "shopping", "help"],
  );
  assert.deepEqual(
    FOUNDATION_TOURS.sound.stations.map(({ id }) => id),
    ["vowels", "mora", "pitch"],
  );
  assert.deepEqual(
    FOUNDATION_TOURS.kana.stations.map(({ id }) => id),
    ["hiragana", "katakana", "marks", "combined"],
  );
  assert.deepEqual(
    FOUNDATION_TOURS.kanji.stations.map(({ id }) => id),
    KANJI_STATION_IDS.slice(1),
  );
  assert.deepEqual(
    FOUNDATION_TOURS.vocabulary.stations.map(({ id }) => id),
    VOCABULARY_STATION_IDS,
  );
  assert.deepEqual(
    FOUNDATION_TOURS.grammar.stations.map(({ id }) => id),
    GRAMMAR_STATION_IDS,
  );

  for (const [tourId, tour] of Object.entries(FOUNDATION_TOURS)) {
    assert.ok(tour.heading.length > 0, `${tourId} needs a teaching heading`);
    for (const station of tour.stations) {
      assert.equal(station.href, `/stations/${station.id === "mora"
        ? "mora-timing"
        : station.id === "pitch"
          ? "pitch-accent"
          : station.id === "marks"
            ? "sound-marks"
            : station.id === "combined"
              ? "combined-sounds"
              : station.id}`);
      assert.ok(station.description.length >= 60, `${tourId}/${station.id} needs a useful teaching summary`);
      assert.doesNotMatch(
        station.description,
        /\b(?:Ling keeps|tap|click|begin with|continue through|directly accessible|completion ladder)\b/i,
      );
    }
  }

  assert.equal(getFoundationTour("sound"), FOUNDATION_TOURS.sound);

  for (const station of FOUNDATION_TOURS.japan.stations) {
    const japaneseExamples = station.description.match(/[\p{Script=Hiragana}\p{Script=Han}]+/gu) ?? [];
    assert.ok(japaneseExamples.length > 0, `japan/${station.id} needs a Japanese example`);
    assert.match(
      station.description,
      /[a-zōū'? ]+ \([\p{Script=Hiragana}\p{Script=Han}]+\)/iu,
      `japan/${station.id} must introduce its first Japanese example through readable Rōmaji`,
    );
  }
});

test("the shared branch tour is a restrained linked teaching list", async () => {
  const component = await readFile(new URL("app/stations/foundation-line-tour.tsx", root), "utf8");
  const introduction = await readFile(new URL("app/stations/foundation-line-introduction.tsx", root), "utf8");
  const japan = await readFile(new URL("app/stations/japan/page.tsx", root), "utf8");
  const japanese = await readFile(new URL("app/stations/japanese/page.tsx", root), "utf8");
  const kana = await readFile(new URL("app/stations/kana/page.tsx", root), "utf8");
  const kanji = await readFile(new URL("app/stations/kanji/kanji-guide.tsx", root), "utf8");
  const styles = await readFile(new URL("app/styles/stations.css", root), "utf8");

  assert.match(component, /getFoundationTour\(tourId\)/);
  assert.match(component, /className="foundation-line-tour"/);
  assert.match(component, /className="foundation-line-tour-stop"/);
  assert.match(component, /<NavigationLink href=\{station\.href\} loadingStation=\{station\.name\}>/);
  assert.match(styles, /\.foundation-line-tour\s*\{[^}]*width:\s*min\(100%, 38rem\)/s);
  assert.match(styles, /\.foundation-line-tour-stop p\s*\{[^}]*color:\s*var\(--muted\)[^}]*line-height:\s*1\.55/s);
  assert.doesNotMatch(styles, /\.foundation-line-tour-stop\s*\{[^}]*border|\.foundation-line-tour-stop\s*\{[^}]*background/s);
  assert.match(introduction, /<FoundationLineTour tourId=\{line\} \/>/);
  assert.match(japanese, /<FoundationLineTour tourId="foundations" \/>/);
  assert.match(japan, /<FoundationLineTour tourId="japan" \/>/);
  assert.match(kana, /<FoundationLineTour tourId="kana" \/>/);
  assert.match(kanji, /station\.id === "kanji" \? <FoundationLineTour tourId="kanji" \/> : null/);
});
