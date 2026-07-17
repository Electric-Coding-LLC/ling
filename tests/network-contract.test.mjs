import assert from "node:assert/strict";
import { readFile } from "node:fs/promises";
import test from "node:test";

const root = new URL("../", import.meta.url);

test("the network keeps the approved desktop and mobile geography", async () => {
  const source = await readFile(new URL("app/network-map.tsx", root), "utf8");
  const styles = await readFile(new URL("app/globals.css", root), "utf8");

  assert.match(source, /DESKTOP_VOWELS_X\s*=\s*250/);
  assert.match(source, /DESKTOP_MORA_X\s*=\s*750/);
  assert.match(source, /MOBILE_VIEW_WIDTH\s*=\s*360/);
  assert.match(source, /MOBILE_VOWELS_X\s*=\s*180/);
  assert.match(source, /MOBILE_MORA_X\s*=\s*MOBILE_VIEW_WIDTH/);
  assert.match(source, /SCRIPT_END_Y\s*=\s*HIRAGANA_Y/);
  assert.equal((source.match(/x2=\{moraX\}/g) ?? []).length, 2);
  assert.doesNotMatch(source, /x2=\{mobile \? 720 : 1000\}/);
  assert.match(source, /data-line="sound"/);
  assert.match(source, /data-line="script"[^>]*x=\{vowelsX - 24\}/);
  assert.match(source, /mora:\s*"\/stations\/mora-timing"/);
  assert.match(source, /LinkedStation href=\{MOBILE_STATION_HREFS\.mora\}/);
  assert.match(source, /MOBILE_SWIPE_THRESHOLD\s*=\s*40/);
  assert.match(source, /onPointerDown/);
  assert.match(source, /onPointerMove/);
  assert.match(source, /onPointerUp/);
  assert.match(source, /Math\.abs\(event\.clientX - start\.x\) < MOBILE_SWIPE_THRESHOLD/);
  assert.match(source, /dragged\.current = true;\s*event\.currentTarget\.setPointerCapture/s);
  const pointerDown = source.match(/function onPointerDown[\s\S]*?(?=\n  function onPointerMove)/)?.[0];
  assert.ok(pointerDown, "onPointerDown should be defined before onPointerMove");
  assert.doesNotMatch(pointerDown, /setPointerCapture/);
  assert.match(source, /function onDesktopKeyDown\(event: KeyboardEvent<SVGSVGElement>\)/);
  assert.match(source, /onKeyDown=\{mobile \? undefined : onDesktopKeyDown\}/);
  assert.match(source, /tabIndex=\{mobile \? undefined : 0\}/);
  assert.match(source, /event\.key === "ArrowLeft" \? "vowels" : "mora"/);
  assert.equal((source.match(/"\.network-station-link:focus"/g) ?? []).length, 2);
  assert.equal((source.match(/getStationLink\(event\.currentTarget, "vowels"\)\.focus\(\)/g) ?? []).length, 1);
  assert.equal((source.match(/getStationLink\(event\.currentTarget, "mora"\)\.focus\(\)/g) ?? []).length, 1);
  assert.match(source, /event\.target\s*!==\s*event\.currentTarget\s*&&\s*!focusedStationLink/);
  assert.match(source, /event\.key\s*===\s*"Enter"\s*\|\|\s*event\.key\s*===\s*" "/);
  assert.match(source, /container: HTMLDivElement \| SVGSVGElement/);
  assert.match(source, /querySelector<SVGAElement>/);
  assert.equal((source.match(/window\.location\.assign\(stationLink\.href\.baseVal\)/g) ?? []).length, 2);
  assert.match(styles, /\.network-mobile-track-mora\s*\{[^}]*translateX\(-50%\)/s);
  assert.match(styles, /\.network-mobile-viewport:focus-visible\s*\{[^}]*outline:\s*none/s);
  assert.match(
    styles,
    /\.network-mobile-viewport:focus-visible[\s\S]*\.network-mobile-track-vowels[\s\S]*\.network-mobile-track-mora/,
  );
  assert.doesNotMatch(styles, /\.network-mobile-viewport:focus-visible\s*\{[^}]*outline:\s*2px/s);
  assert.match(styles, /\.network-station-link:focus-visible\s*\{[^}]*outline:\s*none/s);
  assert.match(styles, /\.network-station-link:focus-visible \.network-interchange-outer/);
  assert.match(styles, /\.guide-button:hover\s*\{[^}]*background:\s*rgb\(242 241 235 \/ 0\.06\)/s);
  assert.match(styles, /\.guide-button-primary:hover\s*\{[^}]*background:\s*#deddd7/s);
  assert.doesNotMatch(styles, /\.guide-button-primary:hover\s*\{[^}]*(?:var\(--sound\)|box-shadow|transform)/s);
});

test("the Vowels sequence uses the bundled pronunciation asset", async () => {
  const source = await readFile(new URL("app/stations/vowels/vowels-guide.tsx", root), "utf8");
  const audio = await readFile(new URL("public/audio/ja-a.wav", root));

  assert.match(source, /\/audio\/ja-a\.wav/);
  assert.equal(audio.subarray(0, 4).toString("ascii"), "RIFF");
  assert.equal(audio.subarray(8, 12).toString("ascii"), "WAVE");
  assert.ok(audio.length > 9_000, "pronunciation asset should contain audio samples");
});
