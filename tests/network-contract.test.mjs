import assert from "node:assert/strict";
import { readFile } from "node:fs/promises";
import test from "node:test";

const root = new URL("../", import.meta.url);

function wavDuration(audio) {
  let byteRate;
  let dataSize;

  for (let offset = 12; offset + 8 <= audio.length;) {
    const chunkId = audio.subarray(offset, offset + 4).toString("ascii");
    const chunkSize = audio.readUInt32LE(offset + 4);
    const chunkStart = offset + 8;

    if (chunkId === "fmt ") byteRate = audio.readUInt32LE(chunkStart + 8);
    if (chunkId === "data") dataSize = chunkSize;
    offset = chunkStart + chunkSize + (chunkSize % 2);
  }

  assert.ok(byteRate, "pronunciation asset should declare a byte rate");
  assert.ok(dataSize, "pronunciation asset should contain audio samples");
  return dataSize / byteRate;
}

test("the network keeps the approved desktop and mobile geography", async () => {
  const source = await readFile(new URL("app/network-map.tsx", root), "utf8");
  const page = await readFile(new URL("app/page.tsx", root), "utf8");
  const styles = await readFile(new URL("app/styles/network.css", root), "utf8");

  assert.match(source, /NETWORK_SEGMENT_LENGTH\s*=\s*180/);
  assert.match(source, /DESKTOP_VOWELS_X\s*=\s*250/);
  assert.match(source, /DESKTOP_MORA_X\s*=\s*DESKTOP_VOWELS_X \+ NETWORK_SEGMENT_LENGTH/);
  assert.match(source, /MOBILE_VOWELS_X\s*=\s*NETWORK_SEGMENT_LENGTH/);
  assert.match(source, /MOBILE_MORA_X\s*=\s*MOBILE_VOWELS_X \+ NETWORK_SEGMENT_LENGTH/);
  assert.match(source, /MOBILE_VIEW_WIDTH\s*=\s*MOBILE_MORA_X/);
  assert.match(source, /HIRAGANA_Y\s*=\s*SOUND_Y \+ NETWORK_SEGMENT_LENGTH/);
  assert.match(source, /SCRIPT_END_Y\s*=\s*HIRAGANA_Y/);
  assert.match(source, /SCRIPT_LABEL_Y\s*=\s*SOUND_Y \+ NETWORK_SEGMENT_LENGTH \/ 2 \+ 6/);
  assert.equal((source.match(/x2=\{moraX\}/g) ?? []).length, 2);
  assert.doesNotMatch(source, /x2=\{mobile \? 720 : 1000\}/);
  assert.match(source, /data-line="sound"/);
  assert.match(source, /data-line="script"[^>]*x=\{vowelsX - 24\}[^>]*y=\{SCRIPT_LABEL_Y\}/);
  assert.match(source, /mora:\s*"\/stations\/mora-timing"/);
  assert.match(source, /LinkedStation[^>]*href=\{ROUTABLE_STATION_HREFS\.mora\}/);
  assert.match(source, /import Link from "next\/link"/);
  assert.match(source, /import \{ useRouter \} from "next\/navigation"/);
  assert.match(source, /<Link[^>]*className="network-station-link"[^>]*prefetch>/);
  assert.doesNotMatch(source, /<a[^>]*className="network-station-link"/);
  assert.match(source, /MOBILE_SWIPE_THRESHOLD\s*=\s*40/);
  assert.match(source, /STATION_FOCUS_STORAGE_KEY\s*=\s*"ling:network-station-focus"/);
  assert.match(source, /useSyncExternalStore\(\s*subscribeToStoredStationFocus,\s*getStoredStationFocus,\s*getServerStationFocus/s);
  assert.match(source, /localStorage\.setItem\(STATION_FOCUS_STORAGE_KEY, focus\)/);
  assert.match(source, /window\.dispatchEvent\(new Event\(STATION_FOCUS_EVENT\)\)/);
  assert.match(source, /window\.addEventListener\("storage", onStoreChange\)/);
  assert.match(source, /if \(initialMobileFocus\) storeStationFocus\(initialMobileFocus\)/);
  assert.match(source, /const stationFocus = selectedStationFocus \?\? storedStationFocus/);
  assert.match(source, /const mobileFocus: MobileFocus = stationFocus === "mora" \? "mora" : "vowels"/);
  assert.doesNotMatch(source, /const \[(?:desktopFocus|mobileStationFocus),/);
  assert.match(page, /focus === "mora-timing" \? "mora" : focus === "vowels" \? "vowels" : undefined/);
  assert.match(source, /onPointerDown/);
  assert.match(source, /onPointerMove/);
  assert.match(source, /onPointerUp/);
  assert.match(source, /Math\.abs\(event\.clientX - start\.x\) < MOBILE_SWIPE_THRESHOLD/);
  assert.match(source, /dragged\.current = true;\s*event\.currentTarget\.setPointerCapture/s);
  const pointerDown = source.match(/function onPointerDown[\s\S]*?(?=\n  function onPointerMove)/)?.[0];
  assert.ok(pointerDown, "onPointerDown should be defined before onPointerMove");
  assert.doesNotMatch(pointerDown, /setPointerCapture/);
  assert.match(source, /function onDesktopKeyDown\(event: KeyboardEvent<HTMLDivElement>\)/);
  assert.match(source, /className="network-desktop-viewport"/);
  assert.equal((source.match(/aria-label="Explore the network with the arrow keys"/g) ?? []).length, 2);
  assert.match(source, /data-desktop-focus=\{stationFocus\}/);
  assert.match(source, /onKeyDown=\{onDesktopKeyDown\}/);
  assert.match(source, /onPointerDown=\{onDesktopPointerDown\}/);
  assert.match(source, /event\.currentTarget\.focus\(\{ preventScroll: true \}\)/);
  assert.match(source, /useEffect\(\(\) => \{/);
  assert.match(source, /document\.activeElement !== document\.body/);
  assert.match(source, /window\.matchMedia\("\(max-width: 600px\)"\)\.matches/);
  assert.equal((source.match(/ref=\{(?:desktop|mobile)Viewport\}/g) ?? []).length, 2);
  assert.match(source, /viewport\?\.focus\(\{ preventScroll: true \}\)/);
  assert.match(source, /event\.target !== event\.currentTarget/);
  assert.match(source, /type StationFocus = MobileFocus \| "hiragana"/);
  assert.match(source, /hiragana:\s*\{ ArrowUp: "vowels" \}/);
  assert.match(source, /vowels:\s*\{ ArrowDown: "hiragana", ArrowRight: "mora" \}/);
  assert.equal((source.match(/STATION_NEIGHBORS\[stationFocus\]\[direction\]/g) ?? []).length, 2);
  assert.match(source, /router\.push\(ROUTABLE_STATION_HREFS\[stationFocus\]\)/);
  assert.doesNotMatch(source, /onKeyDown=\{mobile \? undefined : onDesktopKeyDown\}/);
  assert.equal((source.match(/"\.network-station-link:focus"/g) ?? []).length, 1);
  assert.match(source, /getStationTarget\(event\.currentTarget, nextFocus\)\.focus\(\)/);
  assert.match(source, /data-mobile-station-focus=\{stationFocus\}/);
  assert.match(source, /tabIndex=\{-1\}/);
  assert.match(source, /aria-label="Hiragana station"/);
  assert.doesNotMatch(source, /network-station-focus-ring/);
  assert.match(source, /const backlightId = `\$\{view\}-station-backlight`/);
  assert.equal((source.match(/className="network-station-backlight"/g) ?? []).length, 2);
  assert.match(source, /<linearGradient id=\{`\$\{backlightId\}-junction`\}/);
  assert.match(source, /<mask[\s\S]*id=\{`\$\{backlightId\}-mask`\}/);
  assert.match(source, /fill=\{`url\(#\$\{backlightId\}-\$\{interchange \? "junction" : line\}\)`\}/);
  assert.match(source, /stopColor="#db4e3a"/);
  assert.match(source, /stopColor="#4c689c"/);
  assert.doesNotMatch(source, /stopColor="#f2f1eb" stopOpacity="0\.38"/);
  assert.match(source, /event\.target\s*!==\s*event\.currentTarget\s*&&\s*!focusedStationLink/);
  assert.match(source, /event\.key\s*===\s*"Enter"\s*\|\|\s*event\.key\s*===\s*" "/);
  assert.match(source, /container: HTMLDivElement/);
  assert.match(source, /querySelector<SVGAElement>/);
  assert.equal((source.match(/router\.push\(stationLink\.href\.baseVal\)/g) ?? []).length, 1);
  assert.doesNotMatch(source, /window\.location\.assign/);
  assert.match(styles, /\.network-mobile-track-mora\s*\{[^}]*translateX\(-50%\)/s);
  assert.match(styles, /\.network-desktop-viewport:focus\s*\{[^}]*outline:\s*none/s);
  assert.match(styles, /data-desktop-focus="vowels"[\s\S]*data-desktop-focus="mora"[\s\S]*data-desktop-focus="hiragana"/);
  assert.match(styles, /\.network-mobile-viewport:focus-visible\s*\{[^}]*outline:\s*none/s);
  assert.match(
    styles,
    /data-mobile-station-focus="vowels"[\s\S]*data-mobile-station-focus="mora"[\s\S]*data-mobile-station-focus="hiragana"/,
  );
  assert.doesNotMatch(styles, /\.network-mobile-viewport:focus-visible\s*\{[^}]*outline:\s*2px/s);
  assert.match(styles, /\.network-station-link:focus-visible\s*\{[^}]*outline:\s*none/s);
  assert.match(styles, /\.network-station-backlight\s*\{[^}]*opacity:\s*0[^}]*transition:\s*opacity 160ms ease/s);
  assert.match(styles, /\.network-station-link:hover \.network-station-backlight\s*\{[^}]*opacity:\s*0\.55/s);
  assert.match(styles, /\.network-station-link:focus-visible \.network-station-backlight/);
  assert.match(styles, /\.network-station-focus:focus-visible \.network-station-backlight/);
  assert.doesNotMatch(styles, /drop-shadow\(/);
});

test("the Vowels station uses bundled pronunciation assets", async () => {
  const source = await readFile(new URL("app/stations/vowels/vowels-guide.tsx", root), "utf8");
  const styles = await readFile(new URL("app/styles/stations.css", root), "utf8");
  const isolatedVowelAssets = await Promise.all(
    ["a", "i", "u", "e", "o"].map((vowel) =>
      readFile(new URL(`public/audio/ja-${vowel}.wav`, root)),
    ),
  );
  const exampleWordAssets = await Promise.all(
    ["asa", "inu", "umi", "eki", "oto"].map((word) =>
      readFile(new URL(`public/audio/ja-${word}.wav`, root)),
    ),
  );

  for (const vowel of ["a", "i", "u", "e", "o"]) {
    assert.match(source, new RegExp(`audio: "\\/audio\\/ja-${vowel}\\.wav"`));
  }
  for (const word of ["asa", "inu", "umi", "eki", "oto"]) {
    assert.match(source, new RegExp(`exampleAudio: "\\/audio\\/ja-${word}\\.wav"`));
  }
  assert.match(source, /VOWELS\.map/);
  assert.doesNotMatch(source, /role="tablist"|aria-selected|ArrowRight|ArrowLeft/);
  assert.doesNotMatch(source, /playbackRate|preservesPitch/);
  assert.match(styles, /\.station-page-vowels \.station-heading\s*\{[^}]*margin-bottom:\s*1\.25rem/s);
  assert.match(styles, /\.vowels-intro\s*\{[^}]*margin:\s*0 0 2rem/s);
  assert.match(
    styles,
    /\.vowels-col-kana,[\s\S]*\.vowels-col-english,[\s\S]*\.vowels-col-example\s*\{[^}]*width:\s*25%/,
  );
  assert.match(styles, /\.vowels-col-translation\s*\{[^}]*width:\s*25%/);
  assert.match(styles, /\.vowels-table th\s*\{[^}]*text-align:\s*center/s);
  assert.match(styles, /\.vowel-row-wrap td\s*\{[^}]*text-align:\s*center/s);
  assert.match(styles, /\.vowel-audio-button\s*\{[^}]*justify-content:\s*center/s);
  for (const audio of [...isolatedVowelAssets, ...exampleWordAssets]) {
    assert.equal(audio.subarray(0, 4).toString("ascii"), "RIFF");
    assert.equal(audio.subarray(8, 12).toString("ascii"), "WAVE");
  }
  for (const audio of isolatedVowelAssets) {
    assert.ok(wavDuration(audio) >= 0.14, "isolated vowel should not be clipped too short");
  }
  for (const audio of exampleWordAssets) {
    assert.ok(wavDuration(audio) >= 0.28, "example word should not be clipped too short");
  }
});
