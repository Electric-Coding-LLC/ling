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
  assert.match(source, /NETWORK_LINE_NODE_OFFSET\s*=\s*18/);
  assert.match(source, /NETWORK_INTERCHANGE_NODE_OFFSET\s*=\s*31/);
  assert.match(source, /DESKTOP_KANA_X\s*=\s*250/);
  assert.match(source, /DESKTOP_MORA_X\s*=\s*DESKTOP_KANA_X \+ NETWORK_SEGMENT_LENGTH/);
  assert.match(source, /MOBILE_KANA_X\s*=\s*NETWORK_SEGMENT_LENGTH/);
  assert.match(source, /MOBILE_MORA_X\s*=\s*MOBILE_KANA_X \+ NETWORK_SEGMENT_LENGTH/);
  assert.match(source, /MOBILE_VIEW_WIDTH\s*=\s*MOBILE_MORA_X/);
  assert.match(source, /NETWORK_VIEW_HEIGHT\s*=\s*810/);
  assert.match(source, /SOUND_Y\s*=\s*180/);
  assert.match(source, /HIRAGANA_Y\s*=\s*SOUND_Y \+ NETWORK_SEGMENT_LENGTH/);
  assert.match(source, /KATAKANA_Y\s*=\s*HIRAGANA_Y \+ NETWORK_SEGMENT_LENGTH/);
  assert.match(source, /KANA_EXTENSIONS_Y\s*=\s*KATAKANA_Y \+ NETWORK_SEGMENT_LENGTH/);
  assert.match(source, /viewBox=\{`0 0 \$\{width\} \$\{NETWORK_VIEW_HEIGHT\}`\}/);
  assert.equal((source.match(/x2=\{moraX - NETWORK_LINE_NODE_OFFSET\}/g) ?? []).length, 2);
  assert.equal((source.match(/x1=\{kanaX \+ kanaLineOffset\}/g) ?? []).length, 2);
  assert.match(source, /data-line="sound"[\s\S]*?dominantBaseline="middle"[\s\S]*?textAnchor="end"[\s\S]*?x=\{kanaX - 48\}[\s\S]*?y=\{SOUND_Y\}/);
  assert.match(source, /data-line="writing"[\s\S]*?x=\{kanaX - 20\}[\s\S]*?y=\{WRITING_LABEL_Y\}/);
  assert.equal((source.match(/y1=\{SOUND_Y \+ NETWORK_INTERCHANGE_NODE_OFFSET\}/g) ?? []).length, 2);
  assert.equal((source.match(/y2=\{HIRAGANA_Y - NETWORK_LINE_NODE_OFFSET\}/g) ?? []).length, 2);
  assert.equal((source.match(/y1=\{HIRAGANA_Y \+ NETWORK_LINE_NODE_OFFSET\}/g) ?? []).length, 2);
  assert.equal((source.match(/y2=\{KATAKANA_Y - NETWORK_LINE_NODE_OFFSET\}/g) ?? []).length, 2);
  assert.equal((source.match(/y1=\{KATAKANA_Y \+ NETWORK_LINE_NODE_OFFSET\}/g) ?? []).length, 2);
  assert.equal((source.match(/y2=\{KANA_EXTENSIONS_Y - NETWORK_LINE_NODE_OFFSET\}/g) ?? []).length, 2);
  assert.doesNotMatch(source, /<line\b(?=[^>]*x1="0")/);
  assert.doesNotMatch(source, /x2=\{mobile \? 720 : 1000\}/);
  assert.match(source, /data-line="sound"/);
  assert.match(source, /kana:\s*"\/stations\/kana"/);
  assert.match(source, /mora:\s*"\/stations\/mora-timing"/);
  assert.match(source, /hiragana:\s*"\/stations\/hiragana"/);
  assert.match(source, /katakana:\s*"\/stations\/katakana"/);
  assert.match(source, /extensions:\s*"\/stations\/kana-extensions"/);
  assert.doesNotMatch(source, /vowels:\s*"\/stations\/vowels"/);
  assert.match(source, /LinkedStation[^>]*href=\{ROUTABLE_STATION_HREFS\.mora\}/);
  assert.match(source, /LinkedStation[^>]*href=\{ROUTABLE_STATION_HREFS\.kana\}/);
  assert.match(source, /LinkedStation[^>]*href=\{ROUTABLE_STATION_HREFS\.hiragana\}/);
  assert.match(source, /LinkedStation[^>]*href=\{ROUTABLE_STATION_HREFS\.katakana\}/);
  assert.match(source, /LinkedStation[^>]*href=\{ROUTABLE_STATION_HREFS\.extensions\}/);
  assert.match(source, /label="Katakana"\s*labelPlacement="right"/);
  assert.match(source, /label="Kana extensions"\s*labelPlacement="right"/);
  assert.doesNotMatch(source, /import Link from "next\/link"/);
  assert.doesNotMatch(source, /import \{ useRouter \} from "next\/navigation"/);
  assert.match(source, /import \{ NavigationLink, useRouteReady \} from "\.\/navigation-feedback"/);
  assert.doesNotMatch(source, /import \{ LoadingScreen \} from "\.\/loading-screen"/);
  assert.match(source, /<NavigationLink[\s\S]*className="network-station-link"[\s\S]*loadingStation=\{label\}[\s\S]*prefetch/);
  assert.doesNotMatch(source, /onClick=\{onOpen\}/);
  assert.doesNotMatch(source, /<a[^>]*className="network-station-link"/);
  assert.match(source, /MOBILE_SWIPE_THRESHOLD\s*=\s*40/);
  assert.match(source, /STATION_FOCUS_STORAGE_KEY\s*=\s*"ling:network-station-focus"/);
  assert.match(source, /useSyncExternalStore\(\s*subscribeToStoredStationFocus,\s*getStoredStationFocus,\s*getServerStationFocus/s);
  assert.match(source, /localStorage\.setItem\(STATION_FOCUS_STORAGE_KEY, focus\)/);
  assert.match(source, /window\.dispatchEvent\(new Event\(STATION_FOCUS_EVENT\)\)/);
  assert.match(source, /window\.addEventListener\("storage", onStoreChange\)/);
  assert.match(source, /new URLSearchParams\(window\.location\.search\)\.get\("focus"\)/);
  assert.match(source, /storeStationFocus\(focus\)/);
  assert.match(source, /const requestedStationFocus = selectedStationFocus \?\? storedStationFocus/);
  assert.match(source, /const mobileFocus: MobileFocus = stationFocus/);
  assert.doesNotMatch(source, /const \[(?:desktopFocus|mobileStationFocus),/);
  assert.match(page, /dynamic = "force-static"/);
  assert.match(page, /<NetworkMap \/>/);
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
  assert.match(source, /type MobileFocus = "kana" \| "hiragana" \| "katakana" \| "extensions" \| "mora"/);
  assert.match(source, /kana:\s*\{ ArrowDown: "hiragana", ArrowRight: "mora" \}/);
  assert.match(source, /hiragana:\s*\{ ArrowDown: "katakana", ArrowUp: "kana" \}/);
  assert.match(source, /katakana:\s*\{ ArrowDown: "extensions", ArrowUp: "hiragana" \}/);
  assert.match(source, /extensions:\s*\{ ArrowUp: "katakana" \}/);
  assert.match(source, /mora:\s*\{ ArrowLeft: "kana" \}/);
  assert.equal((source.match(/STATION_NEIGHBORS\[stationFocus\]\[direction\]/g) ?? []).length, 2);
  assert.doesNotMatch(source, /function openStation\(focus: StationFocus\)/);
  assert.doesNotMatch(source, /router\.push/);
  assert.doesNotMatch(source, /openingStation|setOpeningStation/);
  assert.doesNotMatch(source, /<LoadingScreen overlay/);
  assert.doesNotMatch(source, /onKeyDown=\{mobile \? undefined : onDesktopKeyDown\}/);
  assert.equal((source.match(/"\.network-station-link:focus"/g) ?? []).length, 1);
  assert.match(source, /getStationTarget\(event\.currentTarget, nextFocus\)\.focus\(\)/);
  assert.match(source, /data-mobile-station-focus=\{stationFocus\}/);
  assert.doesNotMatch(source, /tabIndex=\{-1\}/);
  assert.match(source, /activateStationLink\(getStationTarget\(event\.currentTarget, stationFocus\)\)/);
  assert.doesNotMatch(source, /network-station-focus-ring/);
  assert.match(source, /const backlightId = `\$\{view\}-station-backlight`/);
  assert.equal((source.match(/className="network-station-backlight"/g) ?? []).length, 1);
  assert.match(source, /fill=\{`url\(#\$\{backlightId\}-\$\{interchange \? "junction" : kind\}\)`\}/);
  assert.match(source, /stopColor="#db4e3a"/);
  assert.match(source, /stopColor="#4c689c"/);
  assert.match(source, /network-interchange-outer/);
  assert.match(source, /network-interchange-inner/);
  assert.doesNotMatch(source, /stopColor="#f2f1eb" stopOpacity="0\.38"/);
  assert.match(source, /event\.target\s*!==\s*event\.currentTarget\s*&&\s*!focusedStationLink/);
  assert.match(source, /event\.key\s*===\s*"Enter"\s*\|\|\s*event\.key\s*===\s*" "/);
  assert.match(source, /container: HTMLDivElement/);
  assert.match(source, /querySelector<SVGAElement>/);
  assert.match(source, /stationLink\.dispatchEvent\(/);
  assert.match(source, /new MouseEvent\("click", \{ bubbles: true, cancelable: true, view: window \}\)/);
  assert.doesNotMatch(source, /window\.location\.assign/);
  assert.match(styles, /\.network-mobile-track-mora\s*\{[^}]*translateX\(-50%\)/s);
  assert.match(styles, /\.network-desktop-viewport:focus\s*\{[^}]*outline:\s*none/s);
  assert.match(styles, /data-desktop-focus="mora"[\s\S]*data-desktop-focus="extensions"[\s\S]*data-desktop-focus="katakana"[\s\S]*data-desktop-focus="hiragana"[\s\S]*data-desktop-focus="kana"/);
  assert.doesNotMatch(styles, /data-desktop-focus="vowels"/);
  assert.match(styles, /\.network-mobile-viewport:focus-visible\s*\{[^}]*outline:\s*none/s);
  assert.match(
    styles,
    /data-mobile-station-focus="mora"[\s\S]*data-mobile-station-focus="extensions"[\s\S]*data-mobile-station-focus="katakana"[\s\S]*data-mobile-station-focus="hiragana"[\s\S]*data-mobile-station-focus="kana"/,
  );
  assert.doesNotMatch(styles, /data-mobile-station-focus="vowels"/);
  assert.doesNotMatch(styles, /\.network-mobile-viewport:focus-visible\s*\{[^}]*outline:\s*2px/s);
  assert.match(styles, /\.network-station-link:focus-visible\s*\{[^}]*outline:\s*none/s);
  assert.match(styles, /\.network-station-backlight\s*\{[^}]*opacity:\s*0[^}]*transition:\s*opacity 160ms ease/s);
  assert.match(styles, /\.network-station-link:hover \.network-station-backlight\s*\{[^}]*opacity:\s*0\.55/s);
  assert.match(styles, /\.network-station-link:focus-visible \.network-station-backlight/);
  assert.match(styles, /\.network-line-writing\s*\{[^}]*stroke:\s*var\(--writing\)/s);
  assert.match(styles, /\.network-single-station-outer-writing\s*\{[^}]*stroke:\s*var\(--writing\)/s);
  assert.doesNotMatch(styles, /network-(?:line-hit-|line-|station-)unavailable|aria-disabled/);
  assert.doesNotMatch(styles, /\.network-station-focus/);
  assert.doesNotMatch(styles, /drop-shadow\(/);
});

test("station map glyphs reflect each station's network position", async () => {
  const source = await readFile(new URL("app/stations/station-topbar.tsx", root), "utf8");
  const kanaGlyph = source.slice(
    source.indexOf('if (position === "kana")'),
    source.indexOf('if (position === "hiragana")'),
  );

  assert.match(kanaGlyph, /station-map-writing[\s\S]*station-map-interchange/);
  assert.doesNotMatch(kanaGlyph, /station-map-sound/);
  assert.match(source, /position === "hiragana"[\s\S]*station-map-writing/);
  assert.match(source, /position === "katakana"[\s\S]*station-map-writing/);
  assert.match(source, /position === "kana-extensions"[\s\S]*data-terminal="true"[\s\S]*station-map-writing/);
});

test("the Writing stations reveal in order from account-scoped completion", async () => {
  const source = await readFile(new URL("app/network-map.tsx", root), "utf8");
  const page = await readFile(new URL("app/page.tsx", root), "utf8");
  const moraPage = await readFile(new URL("app/stations/mora-timing/page.tsx", root), "utf8");
  const katakanaPage = await readFile(new URL("app/stations/katakana/page.tsx", root), "utf8");
  const extensionsPage = await readFile(new URL("app/stations/kana-extensions/page.tsx", root), "utf8");
  const extensionsApi = await readFile(new URL("app/api/stations/kana-extensions/introduction/route.ts", root), "utf8");
  const kana = await readFile(new URL("app/stations/kana/kana-guide.tsx", root), "utf8");
  const hiragana = await readFile(new URL("app/stations/hiragana/hiragana-guide.tsx", root), "utf8");
  const kanaApi = await readFile(new URL("app/api/stations/kana/introduction/route.ts", root), "utf8");
  const availabilityApi = await readFile(
    new URL("app/api/stations/availability/route.ts", root),
    "utf8",
  );
  const api = await readFile(new URL("app/api/stations/hiragana/introduction/route.ts", root), "utf8");
  const stations = await readFile(new URL("src/modules/learning/stations.ts", root), "utf8");
  const repository = await readFile(new URL("src/modules/learning/repository.ts", root), "utf8");
  const schema = await readFile(new URL("db/schema.ts", root), "utf8");

  assert.match(stations, /hiragana: \["kana"\]/);
  assert.match(stations, /katakana: \["hiragana"\]/);
  assert.match(stations, /"kana-extensions": \["katakana"\]/);
  assert.match(stations, /"mora-timing": \["kana-extensions"\]/);
  assert.match(stations, /prerequisites\.every/);
  assert.match(schema, /stationIntroductions = sqliteTable\(\s*"station_introductions"/s);
  assert.match(schema, /primaryKey\(\{ columns: \[table\.userId, table\.stationId\] \}\)/);
  assert.match(repository, /where\(eq\(stationIntroductions\.userId, userId\)\)/);
  assert.match(repository, /const completedStations = await listCompletedStations\(userId\)/);
  assert.match(repository, /if \(!isStationAvailable\(stationId, completedStations\)\) return false/);
  assert.match(repository, /knownHiragana\.length === BASIC_HIRAGANA\.length/);
  assert.match(repository, /knownKatakana\.length === BASIC_KATAKANA\.length/);
  assert.match(repository, /onConflictDoNothing\(\)/);
  assert.match(kanaApi, /recordStationIntroduction\(user\.id, "kana"\)/);
  assert.match(kanaApi, /\{ available: \["hiragana"\] \}/);
  assert.match(api, /recordStationIntroduction\(user\.id, "hiragana"\)/);
  assert.match(api, /error: "station_unavailable"/);
  assert.match(api, /status: 403/);
  assert.match(api, /\{ available: \[\] \}/);
  assert.match(page, /dynamic = "force-static"/);
  assert.match(page, /<NetworkMap \/>/);
  assert.doesNotMatch(page, /Promise\.all|isStationAvailableToCurrentUser|getStationAvailabilityForCurrentUser/);
  assert.match(source, /fetch\("\/api\/stations\/availability"/);
  assert.match(source, /setAvailabilityStatus\("ready"\);\s*routeReady\(\)/);
  assert.match(source, /if \(!controller\.signal\.aborted\) setAvailabilityStatus\("error"\)/);
  assert.doesNotMatch(source, /\.catch\(\(\) => undefined\)/);
  assert.match(source, /<NetworkLoadError onRetry=\{retryAvailability\} \/>/);
  assert.match(source, />\s*Try again\s*</);
  assert.match(source, /new URLSearchParams\(window\.location\.search\)/);
  assert.match(availabilityApi, /getStationAvailabilityForCurrentUser\(\)/);
  assert.match(availabilityApi, /STATION_IDS\.filter/);
  assert.match(availabilityApi, /private, no-store/);
  assert.match(moraPage, /redirect\("\/\?focus=mora-timing"\)/);
  assert.match(katakanaPage, /redirect\("\/\?focus=katakana"\)/);
  assert.match(extensionsPage, /redirect\("\/\?focus=kana-extensions"\)/);
  assert.match(extensionsApi, /recordStationIntroduction\(user\.id, "kana-extensions"\)/);
  assert.match(extensionsApi, /\{ available: \["mora-timing"\] \}/);
  assert.match(hiragana, /fetch\("\/api\/stations\/hiragana\/introduction"/);
  assert.match(kana, /fetch\("\/api\/stations\/kana\/introduction"/);
  assert.match(hiragana, /useEffect\(\(\) => \{/);
  assert.doesNotMatch(hiragana, /Continue to Mora timing|station-next/);
  assert.match(source, /\{hiraganaAvailable \? \([\s\S]*?className="network-line-target"/);
  assert.match(source, /focus === "hiragana" && hiraganaAvailable/);
  assert.match(source, /focus === "katakana" && katakanaAvailable/);
  assert.match(source, /focus === "extensions" && kanaExtensionsAvailable/);
  assert.match(source, /nextFocus && isStationVisible\([\s\S]*?nextFocus,[\s\S]*?hiraganaAvailable,[\s\S]*?katakanaAvailable,[\s\S]*?kanaExtensionsAvailable,[\s\S]*?moraTimingAvailable/);
  assert.doesNotMatch(source, /MORA_UNAVAILABLE_REASON|network-line-unavailable|unavailableReason|aria-disabled/);
  assert.doesNotMatch(source, /After Hiragana|network-station-dependency/);
  assert.doesNotMatch(hiragana, /score|streak|timer|progress meter/i);
});

test("Kana extensions teach shared writing patterns with private, persistent checks", async () => {
  const source = await readFile(
    new URL("app/stations/kana-extensions/kana-extensions-guide.tsx", root),
    "utf8",
  );
  const page = await readFile(new URL("app/stations/kana-extensions/page.tsx", root), "utf8");
  const knowledgeApi = await readFile(
    new URL("app/api/stations/kana-extensions/knowledge/route.ts", root),
    "utf8",
  );
  const repository = await readFile(new URL("src/modules/learning/repository.ts", root), "utf8");
  const schema = await readFile(new URL("db/schema.ts", root), "utf8");
  const domain = await readFile(
    new URL("src/modules/learning/kana-extensions.ts", root),
    "utf8",
  );
  const styles = await readFile(new URL("app/styles/stations.css", root), "utf8");
  const audioPaths = [
    ...source.matchAll(/(?:audio|exampleAudio): "(\/audio\/ja-[^"]+\.wav)"/g),
  ].map((match) => match[1]);

  assert.match(page, /isStationAvailableToCurrentUser\("kana-extensions"\)/);
  assert.match(page, /<StationTopbar current="Kana extensions" mapPosition="kana-extensions" \/>/);
  assert.match(source, /fetch\("\/api\/stations\/kana-extensions\/introduction"/);
  assert.match(source, /fetch\("\/api\/stations\/kana-extensions\/knowledge"/);
  assert.match(source, /title: "Sound marks"/);
  assert.match(source, /title: "Small combinations"/);
  assert.match(source, /title: "Timing signs"/);
  assert.match(source, /Dakuten \(゛\) voices a consonant/);
  assert.match(source, /handakuten \(゜\)/);
  assert.match(source, /small ゃ, ゅ, or ょ/);
  assert.match(source, /Small っ and ッ hold the next consonant/);
  assert.match(source, /Katakana ー holds the vowel/);
  assert.equal((domain.match(/"(?:dakuten|handakuten|small|long)-[a-z]+"/g) ?? []).length, 12);
  assert.match(source, /aria-labelledby="kana-extension-test-title"/);
  assert.match(source, /aria-labelledby="kana-extension-complete-title"/);
  assert.match(source, /aria-labelledby="kana-extension-reset-title"/);
  assert.match(source, /This marks all 12 extension patterns as complete/);
  assert.match(source, /Mora timing stays available because you have already explored this station/);
  assert.match(schema, /kanaExtensionKnowledge = sqliteTable\(\s*"kana_extension_knowledge"/s);
  assert.match(repository, /listKnownKanaExtensionPatterns/);
  assert.match(repository, /setKanaExtensionPatternKnown/);
  assert.match(repository, /setAllKanaExtensionPatternsKnown/);
  assert.match(knowledgeApi, /export async function GET/);
  assert.match(knowledgeApi, /export async function PUT/);
  assert.match(knowledgeApi, /export async function PATCH/);
  assert.match(knowledgeApi, /isKanaExtensionPatternId\(candidate\.patternId\)/);
  assert.match(knowledgeApi, /private, no-store/);
  assert.match(styles, /\.kana-extension-table\s*\{[^}]*table-layout:\s*fixed/s);
  assert.match(styles, /\.kana-extension-pair-known,[\s\S]*color:\s*var\(--known\)/s);
  assert.equal(new Set(audioPaths).size, 22);
  assert.doesNotMatch(source, /romaji|score|streak|timer|progress meter/i);

  for (const audioPath of new Set(audioPaths)) {
    const audio = await readFile(new URL(`public${audioPath}`, root));
    assert.equal(audio.subarray(0, 4).toString("ascii"), "RIFF");
    assert.equal(audio.subarray(8, 12).toString("ascii"), "WAVE");
    assert.ok(wavDuration(audio) >= 0.1, `${audioPath} should not be clipped too short`);
  }
});

test("the Mora timing station teaches equal beats with bundled audio", async () => {
  const source = await readFile(new URL("app/stations/mora-timing/mora-timing-guide.tsx", root), "utf8");
  const styles = await readFile(new URL("app/styles/stations.css", root), "utf8");
  const wordAudioPaths = [...source.matchAll(/wordAudio: "(\/audio\/ja-[^"]+\.wav)"/g)].map((match) => match[1]);
  const moraAudioPaths = [...source.matchAll(/\{ audio: "(\/audio\/ja-[^"]+\.wav)", text: "[^"]+" \}/g)].map((match) => match[1]);

  assert.deepEqual(wordAudioPaths, [
    "/audio/ja-inu.wav",
    "/audio/ja-asa.wav",
    "/audio/ja-okaasan.wav",
    "/audio/ja-hon.wav",
  ]);
  assert.equal(moraAudioPaths.length, 11);
  assert.match(source, /text: "い"/);
  assert.match(source, /text: "さ"/);
  assert.match(source, /text: "お"/);
  assert.match(source, /text: "ん"/);
  assert.match(source, /aria-label=\{`Play timing unit \$\{mora\.text\}`\}/);
  assert.match(source, /onClick=\{\(\) => playAudio\(mora\.audio\)\}/);
  assert.match(source, /Japanese words are spoken in even rhythmic beats/);
  assert.match(source, /Linguists call each beat a mora/);
  assert.match(source, /It is not exactly the same as an English syllable/);
  assert.match(source, /Why the count matters/);
  assert.match(styles, /\.mora-rows\s*\{[^}]*border-top:\s*1px solid var\(--line\)/s);
  assert.match(styles, /\.mora-row-heading,[\s\S]*\.mora-row-timing\s*\{[^}]*display:\s*flex[^}]*justify-content:\s*space-between/s);
  assert.match(styles, /\.mora-word-button\s*\{[^}]*white-space:\s*nowrap/s);
  assert.match(styles, /\.mora-divider\s*\{[^}]*color:\s*var\(--muted\)/s);
  assert.doesNotMatch(styles, /\.mora-part-button\s*\{[^}]*border-bottom|\.mora-part-button:hover\s*\{[^}]*border-bottom/s);
  assert.doesNotMatch(source, /<table|<thead|<th|<td/);
  assert.doesNotMatch(source, /box|mora-beat/);
  assert.doesNotMatch(styles, /\.mora-beat|rgb\(219 78 58/);
  assert.doesNotMatch(source, /[っゃゅょ]|gakkou|kyo|がっこう|きょう/);
  assert.doesNotMatch(source, /score|streak|timer|progress/i);

  for (const audioPath of new Set([...wordAudioPaths, ...moraAudioPaths])) {
    const audio = await readFile(new URL(`public${audioPath}`, root));
    assert.equal(audio.subarray(0, 4).toString("ascii"), "RIFF");
    assert.equal(audio.subarray(8, 12).toString("ascii"), "WAVE");
    assert.ok(wavDuration(audio) >= 0.1, `${audioPath} should not be clipped too short`);
  }
});

test("the Kana station introduces both writing systems through the five vowels", async () => {
  const source = await readFile(new URL("app/stations/kana/kana-guide.tsx", root), "utf8");
  const page = await readFile(new URL("app/stations/kana/page.tsx", root), "utf8");
  const api = await readFile(new URL("app/api/stations/kana/introduction/route.ts", root), "utf8");
  const styles = await readFile(new URL("app/styles/stations.css", root), "utf8");
  const hiragana = [...source.matchAll(/hiragana: "([^"]+)"/g)].map((match) => match[1]);
  const katakana = [...source.matchAll(/katakana: "([^"]+)"/g)].map((match) => match[1]);
  const audioPaths = [...source.matchAll(/(?:audio|exampleAudio): "(\/audio\/ja-[^"]+\.wav)"/g)].map((match) => match[1]);

  assert.deepEqual(hiragana, ["あ", "い", "う", "え", "お"]);
  assert.deepEqual(katakana, ["ア", "イ", "ウ", "エ", "オ"]);
  assert.equal(audioPaths.length, 10);
  assert.equal(new Set(audioPaths).size, 10);
  assert.match(page, /dynamic = "force-static"/);
  assert.match(page, /data-line="sound"/);
  assert.match(page, /data-line="writing"/);
  assert.match(source, /Kana is the collective name for Hiragana and Katakana/);
  assert.match(source, /used to write how Japanese words sound/);
  assert.match(source, /Both sets represent the same sounds with different shapes/);
  assert.match(source, /Hiragana is used for everyday Japanese words and grammar/);
  assert.match(source, /Katakana is used mainly for borrowed words, foreign names, emphasis, and sound effects/);
  assert.match(source, /className="kana-table-intro"/);
  assert.match(source, /Kanji primarily carries meaning and can have multiple readings/);
  assert.match(source, /aria-label="The five Japanese vowels in Hiragana and Katakana"/);
  assert.match(source, /fetch\("\/api\/stations\/kana\/introduction"/);
  assert.match(api, /recordStationIntroduction\(user\.id, "kana"\)/);
  assert.match(styles, /\.kana-vowels-table \.kana-pair\s*\{[^}]*white-space:\s*nowrap/s);
  assert.match(styles, /\.kana-intro\s*\{[^}]*display:\s*grid[^}]*gap:\s*0\.65rem/s);
  assert.doesNotMatch(source, /<dl|<dt|<dd/);

  for (const audioPath of audioPaths) {
    const audio = await readFile(new URL(`public${audioPath}`, root));
    assert.equal(audio.subarray(0, 4).toString("ascii"), "RIFF");
    assert.equal(audio.subarray(8, 12).toString("ascii"), "WAVE");
    assert.ok(wavDuration(audio) >= 0.1, `${audioPath} should not be clipped too short`);
  }
});

test("the Hiragana station provides the complete basic chart with bundled audio", async () => {
  const source = await readFile(new URL("app/stations/hiragana/hiragana-guide.tsx", root), "utf8");
  const knowledgeApi = await readFile(
    new URL("app/api/stations/hiragana/knowledge/route.ts", root),
    "utf8",
  );
  const hiraganaDomain = await readFile(
    new URL("src/modules/learning/hiragana.ts", root),
    "utf8",
  );
  const repository = await readFile(new URL("src/modules/learning/repository.ts", root), "utf8");
  const schema = await readFile(new URL("db/schema.ts", root), "utf8");
  const styles = await readFile(new URL("app/styles/stations.css", root), "utf8");
  const characters = [...source.matchAll(/character: "([^"]+)"/g)].map((match) => match[1]);
  const audioPaths = [...source.matchAll(/audio: "(\/audio\/ja-[^"]+\.wav)"/g)].map((match) => match[1]);
  const exampleAudioPaths = [...source.matchAll(/exampleAudio: "(\/audio\/ja-[^"]+\.wav)"/g)].map((match) => match[1]);

  assert.equal(characters.length, 46);
  assert.equal(new Set(characters).size, 46);
  assert.equal(audioPaths.length, 46);
  assert.match(source, /aria-label="The 46 basic hiragana"/);
  assert.match(source, /Hiragana is the everyday Kana system/);
  assert.match(source, /five vowel sounds you already know/);
  assert.match(source, /Learning them lets you sound out written Japanese/);
  assert.match(source, /HIRAGANA_VOWEL_SOUNDS = \["ah", "ee", "oo", "eh", "oh"\]/);
  assert.match(source, /aria-label=\{`Column of sounds ending in \$\{sound\}`\}/);
  assert.doesNotMatch(source, /[あいうえお]段/);
  assert.match(source, /title: "The vowel row"/);
  assert.match(source, /title: "The K row"/);
  assert.match(source, /title: "The S row"/);
  assert.match(source, /title: "The T row"/);
  assert.match(source, /title: "The N row"/);
  assert.match(source, /title: "The H row"/);
  assert.match(source, /title: "The M row"/);
  assert.match(source, /title: "The Y row"/);
  assert.match(source, /title: "The R row"/);
  assert.match(source, /id: "hiragana-w-row"[\s\S]*title: "The W row"/);
  assert.match(source, /id: "hiragana-final-n"[\s\S]*title: "ん"/);
  assert.doesNotMatch(source, /title: "The W row and ん"/);
  assert.doesNotMatch(source, /The next five sounds|Start with the first ten/);
  assert.match(source, /English spellings are approximate; follow the audio/);
  assert.match(source, /english: "ah".*english: "ee".*english: "oo".*english: "eh".*english: "oh"/s);
  assert.match(source, /english: "kah".*english: "kee".*english: "koo".*english: "keh".*english: "koh"/s);
  assert.match(source, /あさ.*いぬ.*うみ.*えき.*おと/s);
  assert.match(source, /かさ.*きく.*くち.*けさ.*こえ/s);
  assert.match(source, /preload="none"/);
  assert.match(styles, /\.hiragana-table\s*\{[^}]*table-layout:\s*fixed/s);
  assert.match(styles, /\.hiragana-intro\s*\{[^}]*display:\s*grid[^}]*gap:\s*0\.65rem/s);
  assert.match(styles, /\.hiragana-button\s*\{[^}]*font-size:\s*1\.65rem/s);
  assert.match(styles, /\.kana-study-table\s*\{[^}]*table-layout:\s*fixed/s);
  assert.match(styles, /\.kana-study-button\s*\{[^}]*justify-content:\s*center/s);
  assert.match(source, /className="station-heading-row"/);
  assert.match(source, /data-line="writing"/);
  assert.match(source, /renderTestButton\("All Hiragana", ALL_HIRAGANA_TEST_ENTRIES\)/);
  assert.match(source, /renderTestButton\(group\.title, group\.entries\)/);
  assert.match(source, /const remainingCount = total - knownCount/);
  assert.match(source, /remainingCount === 0 \? \([\s\S]*className="hiragana-test-complete-icon"/);
  assert.match(source, /data-complete=\{remainingCount === 0 \? "true" : undefined\}/);
  assert.match(source, /`Test \$\{title\}\. Complete\.`/);
  assert.match(source, /`Test \$\{title\}\. \$\{remainingCount\} remaining\.`/);
  assert.match(source, /className="network-tooltip hiragana-test-tooltip"/);
  assert.doesNotMatch(source, /title=\{testLabel\}/);
  assert.match(source, /const \[expandedGroups, setExpandedGroups\] = useState<Set<string>>\(\(\) => new Set\(\)\)/);
  assert.match(source, /aria-controls=\{`\$\{group\.id\}-content`\}/);
  assert.match(source, /aria-expanded=\{expanded\}/);
  assert.match(source, /hidden=\{!expanded\}/);
  assert.match(source, /toggleStudyGroup\(group\.id\)/);
  assert.match(source, /aria-label="Station options"/);
  assert.match(source, /<div className="station-heading-actions">[\s\S]*<details className="station-options"[\s\S]*renderTestButton\("All Hiragana"/);
  assert.match(source, /<circle cx="4" cy="10" r="1\.5" \/>/);
  assert.match(source, /document\.addEventListener\("pointerdown", dismissStationOptions\)/);
  assert.match(source, /event\.key !== "Escape"/);
  assert.match(source, /aria-label="Close station options"/);
  assert.match(source, /onClick=\{closeStationOptions\}/);
  assert.doesNotMatch(source, /station-options-menu-header/);
  assert.doesNotMatch(source, /<span>Station options<\/span>/);
  assert.match(source, />I know this<\/span>/);
  assert.match(source, />Reset station<\/span>/);
  assert.match(source, /method: "PATCH"/);
  assert.match(source, /onClick=\{openCompleteDialog\}/);
  assert.match(source, /setAllKnowledge\(true\)/);
  assert.match(source, /setAllKnowledge\(false\)/);
  assert.match(source, /aria-labelledby="hiragana-complete-title"/);
  assert.match(source, /This marks all 46 Hiragana as complete and unlocks Katakana/);
  assert.match(source, /aria-labelledby="hiragana-reset-title"/);
  assert.match(source, /Later stations will stay hidden until Hiragana is complete again/);
  assert.match(source, /bulkKnowledgeAction === "complete" \? "Completing…" : "Complete"/);
  assert.match(source, /bulkKnowledgeAction === "reset" \? "Resetting…" : "Reset"/);
  assert.equal((source.match(/className="hiragana-test-answer hiragana-test-answer-no"/g) ?? []).length, 3);
  assert.equal((source.match(/className="hiragana-test-answer hiragana-test-answer-yes"/g) ?? []).length, 2);
  assert.match(source, /className="hiragana-test-answer station-confirm-reset"/);
  assert.equal((source.match(/className="hiragana-test-actions"/g) ?? []).length, 3);
  assert.match(source, /--hiragana-test-progress/);
  assert.match(styles, /\.station-options-menu\s*\{[^}]*position:\s*absolute[^}]*top:\s*0[^}]*right:\s*0[^}]*background:\s*var\(--surface\)[^}]*transform-origin:\s*top right/s);
  assert.match(styles, /\.station-options summary\s*\{[^}]*width:\s*2\.5rem[^}]*border:\s*0[^}]*background:\s*transparent/s);
  assert.match(styles, /\.station-options summary svg\s*\{[^}]*width:\s*1\.25rem/s);
  assert.match(styles, /\.station-options-close\s*\{[^}]*position:\s*absolute[^}]*top:\s*0\.35rem[^}]*right:\s*0\.35rem[^}]*width:\s*2rem[^}]*height:\s*2rem/s);
  assert.match(styles, /\.station-options-close \+ \.station-options-action\s*\{[^}]*padding-right:\s*2\.75rem/s);
  assert.match(styles, /\.station-options-action:hover\s*\{[^}]*opacity:\s*1[^}]*\}/s);
  assert.doesNotMatch(styles, /\.station-options-action:hover\s*\{[^}]*background:/s);
  assert.doesNotMatch(source, /station-options-reset/);
  assert.doesNotMatch(styles, /\.station-options-reset/);
  assert.doesNotMatch(styles, /\.station-options summary:hover,\s*\.station-options\[open\] summary\s*\{[^}]*border-color:/s);
  assert.match(styles, /\.station-confirm-dialog::backdrop/);
  assert.doesNotMatch(styles, /\.station-confirm-(?:actions|action-icon|cancel|complete)\b/);
  assert.match(styles, /\.station-confirm-modal \.hiragana-test-actions\s*\{[^}]*display:\s*flex[^}]*justify-content:\s*flex-end[^}]*gap:\s*0\.625rem/s);
  assert.match(styles, /\.station-confirm-modal \.hiragana-test-answer\s*\{[^}]*min-height:\s*2\.75rem[^}]*padding:\s*0\.55rem 0\.85rem/s);
  assert.match(styles, /\.hiragana-test-answer\.station-confirm-reset\s*\{[^}]*background:\s*var\(--sound\)/s);
  assert.match(styles, /\.hiragana-study-group-toggle\[aria-expanded="true"\] \.hiragana-study-group-chevron/);
  assert.match(styles, /\.hiragana-test-trigger-wrap:hover \.hiragana-test-tooltip/);
  assert.match(styles, /\.hiragana-test-trigger:focus-visible \+ \.hiragana-test-tooltip/);
  assert.match(styles, /\.hiragana-test-trigger::before\s*\{[^}]*background:\s*conic-gradient\([^}]*var\(--hiragana-test-progress\)/s);
  assert.match(styles, /\.hiragana-test-trigger\s*\{[^}]*width:\s*2\.5rem[^}]*height:\s*2\.5rem/s);
  assert.match(styles, /\.hiragana-test-trigger::before\s*\{[^}]*inset:\s*0\.1875rem/s);
  assert.match(styles, /\.hiragana-test-trigger::after\s*\{[^}]*inset:\s*calc\(0\.1875rem \+ 3px\)/s);
  assert.match(styles, /\.hiragana-test-trigger\[data-complete="true"\]::before\s*\{[^}]*background:\s*var\(--known\)/s);
  assert.match(styles, /\.hiragana-test-complete-icon\s*\{[^}]*width:\s*1\.125rem[^}]*color:\s*var\(--known\)[^}]*stroke-width:\s*2\.5/s);
  assert.doesNotMatch(source, /Test row|hiragana-test-icon/);
  assert.match(source, /<dialog[\s\S]*aria-labelledby="hiragana-test-title"/);
  assert.doesNotMatch(source, /<p>Test<\/p>/);
  assert.match(source, /aria-label="Close test"[\s\S]*?<span aria-hidden="true">×<\/span>/);
  assert.match(styles, /\.hiragana-test-close\s*\{[^}]*border-radius:\s*50%[^}]*appearance:\s*none/s);
  assert.match(styles, /\.hiragana-test-close:focus-visible\s*\{[^}]*outline:\s*none[^}]*box-shadow:/s);
  assert.doesNotMatch(source, />\s*Not yet\s*</);
  assert.match(source, /<span>No<\/span>/);
  assert.match(source, /<span>Yes<\/span>/);
  assert.equal((source.match(/className="hiragana-test-answer-icon"/g) ?? []).length, 6);
  assert.match(styles, /\.hiragana-test-answer-icon\s*\{[^}]*stroke:\s*currentcolor/s);
  assert.match(styles, /\.hiragana-test-answer-no:hover\s*\{[^}]*border-color:\s*rgb\(242 241 235 \/ 0\.24\)[^}]*background:\s*rgb\(242 241 235 \/ 0\.06\)/s);
  assert.match(source, /Say the sound, then tap the Kana to hear it and reveal the pronunciation/);
  assert.match(source, /setPronunciationRevealed\(true\)/);
  assert.match(source, /className="hiragana-test-pronunciation"[\s\S]*pronunciationRevealed \? activeCard\.english/);
  assert.match(source, /english: "nn"[^\n]*kana: "ん"/);
  assert.doesNotMatch(source, />English sound</);
  assert.match(source, /data-playing=\{audioPlaying \? "true" : undefined\}/);
  assert.match(source, /onPlaying=\{\(\) => setAudioPlaying\(true\)\}/);
  assert.match(styles, /\.hiragana-test-card\[data-playing="true"\][^}]*border-color:\s*var\(--sound\)/s);
  assert.match(styles, /@keyframes hiragana-test-sound-pulse/);
  assert.match(source, /data-known=\{isKnown \? "true" : undefined\}/);
  assert.match(source, /kana-study-button-known/);
  assert.match(source, /renderStudyKana\(entry\)/);
  assert.match(source, /HIRAGANA_TEST_ENTRY_BY_KANA/);
  assert.match(source, /onClick=\{\(\) => openTest\("Hiragana", \[testEntry\]\)\}/);
  assert.match(source, /onClick=\{\(\) => openTest\("Hiragana", \[entry\]\)\}/);
  assert.doesNotMatch(
    source.slice(source.indexOf("function renderKana"), source.indexOf("function renderStudyKana")),
    /playAudio/,
  );
  assert.match(source, /fetch\("\/api\/stations\/hiragana\/knowledge"/);
  assert.match(styles, /\.hiragana-button-known[\s\S]*\.kana-study-button-known[\s\S]*color:\s*var\(--known\)/);
  assert.doesNotMatch(styles, /\.hiragana-button-known::after|content:\s*"✓"/);
  assert.match(styles, /\.hiragana-test-dialog::backdrop/);
  assert.match(schema, /hiraganaKnowledge = sqliteTable\(\s*"hiragana_knowledge"/s);
  assert.match(schema, /primaryKey\(\{ columns: \[table\.userId, table\.kana\] \}\)/);
  assert.match(repository, /listKnownHiragana/);
  assert.match(repository, /setHiraganaKnown/);
  assert.match(repository, /onConflictDoUpdate/);
  assert.match(repository, /delete\(hiraganaKnowledge\)/);
  assert.match(knowledgeApi, /export async function GET/);
  assert.match(knowledgeApi, /export async function PUT/);
  assert.match(knowledgeApi, /export async function PATCH/);
  assert.match(knowledgeApi, /setAllHiraganaKnown\(user\.id, body\.known\)/);
  assert.match(knowledgeApi, /body\.known \? BASIC_HIRAGANA : \[\]/);
  assert.match(knowledgeApi, /isBasicHiragana\(candidate\.kana\)/);
  assert.match(repository, /setAllHiraganaKnown/);
  assert.match(repository, /HIRAGANA_KNOWLEDGE_ROWS_PER_STATEMENT = 30/);
  assert.match(repository, /BASIC_HIRAGANA\.slice\([\s\S]*start \+ HIRAGANA_KNOWLEDGE_ROWS_PER_STATEMENT/);
  assert.match(repository, /await db\.batch\(\[firstStatement, \.\.\.remainingStatements\]\)/);
  assert.doesNotMatch(repository, /\.values\(BASIC_HIRAGANA\.map/);
  assert.match(repository, /delete\(hiraganaKnowledge\)[\s\S]*eq\(hiraganaKnowledge\.userId, userId\)/);
  assert.match(knowledgeApi, /private, no-store/);
  assert.match(hiraganaDomain, /BASIC_HIRAGANA = \[/);
  assert.equal((hiraganaDomain.match(/"[ぁ-ん]"/g) ?? []).length, 46);
  assert.doesNotMatch(source, /romaji|score|streak|timer/i);

  assert.equal(exampleAudioPaths.length, 46);
  assert.equal(new Set(exampleAudioPaths).size, 46);
  for (const audioPath of [...audioPaths, ...exampleAudioPaths]) {
    const audio = await readFile(new URL(`public${audioPath}`, root));
    assert.equal(audio.subarray(0, 4).toString("ascii"), "RIFF");
    assert.equal(audio.subarray(8, 12).toString("ascii"), "WAVE");
    assert.ok(wavDuration(audio) >= 0.1, `${audioPath} should not be clipped too short`);
  }
});

test("the Katakana station pairs all 46 basic forms with known Hiragana sounds", async () => {
  const source = await readFile(new URL("app/stations/katakana/katakana-guide.tsx", root), "utf8");
  const page = await readFile(new URL("app/stations/katakana/page.tsx", root), "utf8");
  const api = await readFile(new URL("app/api/stations/katakana/introduction/route.ts", root), "utf8");
  const knowledgeApi = await readFile(new URL("app/api/stations/katakana/knowledge/route.ts", root), "utf8");
  const repository = await readFile(new URL("src/modules/learning/repository.ts", root), "utf8");
  const schema = await readFile(new URL("db/schema.ts", root), "utf8");
  const katakanaDomain = await readFile(new URL("src/modules/learning/katakana.ts", root), "utf8");
  const styles = await readFile(new URL("app/styles/stations.css", root), "utf8");
  const katakana = [...source.matchAll(/katakana: "([^"]+)"/g)].map((match) => match[1]);
  const hiragana = [...source.matchAll(/hiragana: "([^"]+)"/g)].map((match) => match[1]);
  const audioPaths = [...source.matchAll(/audio: "(\/audio\/ja-[^"]+\.wav)"/g)].map((match) => match[1]);

  assert.equal(katakana.length, 46);
  assert.equal(new Set(katakana).size, 46);
  assert.equal(hiragana.length, 46);
  assert.equal(new Set(hiragana).size, 46);
  assert.equal(audioPaths.length, 46);
  assert.match(page, /isStationAvailableToCurrentUser\("katakana"\)/);
  assert.match(source, /data-line="writing"/);
  assert.match(api, /recordStationIntroduction\(user\.id, "katakana"\)/);
  assert.match(api, /error: "station_unavailable"/);
  assert.match(api, /status: 403/);
  assert.match(source, /Katakana is the second Kana system/);
  assert.match(source, /different shapes for the same sound/);
  assert.match(source, /Hiragana developed from flowing, cursive forms of Chinese characters/);
  assert.match(source, /Katakana developed from selected pieces of those characters/);
  assert.match(source, /Hiragana looks rounded while Katakana looks more angular/);
  assert.ok(
    source.indexOf("Why do they look different?") > source.indexOf("<table"),
    "the character-origin explanation should follow the chart",
  );
  assert.match(source, /borrowed words, foreign names, emphasis, and sound effects/);
  assert.match(source, /aria-label="The 46 basic Katakana paired with Hiragana"/);
  assert.match(source, /fetch\("\/api\/stations\/katakana\/introduction"/);
  assert.match(source, /className="katakana-character"/);
  assert.match(source, /className="katakana-match"/);
  assert.match(styles, /\.katakana-table\s*\{[^}]*table-layout:\s*fixed/s);
  assert.match(styles, /\.katakana-button\s*\{[^}]*flex-direction:\s*column/s);
  assert.match(source, /renderTestButton\("All Katakana", ALL_KATAKANA_TEST_ENTRIES\)/);
  assert.match(source, /title: "The vowel row"/);
  assert.match(source, /title: "The W row"/);
  assert.match(source, /title: "ン"/);
  assert.doesNotMatch(source, /The W row and ン/);
  assert.match(source, /aria-expanded=\{expanded\}/);
  assert.match(source, /hidden=\{!expanded\}/);
  assert.match(source, /className="kana-study-table katakana-study-table"/);
  assert.match(source, /<th scope="col">Katakana<\/th>/);
  assert.match(source, /<th scope="col">Hiragana<\/th>/);
  assert.match(source, /<th scope="col">Sound<\/th>/);
  assert.match(source, /aria-labelledby="katakana-test-title"/);
  assert.match(source, /Say the sound, then tap the Katakana to hear it and reveal the pronunciation/);
  assert.match(source, /pronunciationRevealed \? activeCard\.sound/);
  assert.match(source, /data-playing=\{audioPlaying \? "true" : undefined\}/);
  assert.match(source, /<span>No<\/span>/);
  assert.match(source, /<span>Yes<\/span>/);
  assert.match(source, /aria-labelledby="katakana-complete-title"/);
  assert.match(source, /aria-labelledby="katakana-reset-title"/);
  assert.match(source, /fetch\("\/api\/stations\/katakana\/knowledge"/);
  assert.match(source, /data-known=\{isKnown \? "true" : undefined\}/);
  assert.match(source, /onClick=\{\(\) => openTest\("Katakana", \[kana\]\)\}/);
  assert.match(source, /onClick=\{\(\) => openTest\("Katakana", \[entry\]\)\}/);
  assert.doesNotMatch(
    source.slice(source.indexOf("function renderKatakana"), source.indexOf("function renderStudyKatakana")),
    /playAudio/,
  );
  assert.match(styles, /\.kana-study-button-known[\s\S]*color:\s*var\(--known\)/);
  assert.match(styles, /\.katakana-button-known,[\s\S]*\.katakana-button-known:hover\s*\{[^}]*color:\s*var\(--known\)/s);
  assert.ok(
    styles.indexOf(".katakana-button-known") > styles.indexOf(".katakana-button:hover"),
    "known Katakana chart styling must follow the base hover rule in the cascade",
  );
  assert.match(schema, /katakanaKnowledge = sqliteTable\(\s*"katakana_knowledge"/s);
  assert.match(repository, /listKnownKatakana/);
  assert.match(repository, /setKatakanaKnown/);
  assert.match(repository, /setAllKatakanaKnown/);
  assert.match(repository, /KATAKANA_KNOWLEDGE_ROWS_PER_STATEMENT = 30/);
  assert.match(repository, /BASIC_KATAKANA\.slice\([\s\S]*start \+ KATAKANA_KNOWLEDGE_ROWS_PER_STATEMENT/);
  assert.match(knowledgeApi, /export async function GET/);
  assert.match(knowledgeApi, /export async function PUT/);
  assert.match(knowledgeApi, /export async function PATCH/);
  assert.match(knowledgeApi, /setAllKatakanaKnown\(user\.id, body\.known\)/);
  assert.match(knowledgeApi, /body\.known \? BASIC_KATAKANA : \[\]/);
  assert.match(knowledgeApi, /private, no-store/);
  assert.equal((katakanaDomain.match(/"[ァ-ン]"/g) ?? []).length, 46);
  assert.doesNotMatch(source, /romaji|score|streak|timer/i);

  for (const audioPath of audioPaths) {
    const audio = await readFile(new URL(`public${audioPath}`, root));
    assert.equal(audio.subarray(0, 4).toString("ascii"), "RIFF");
    assert.equal(audio.subarray(8, 12).toString("ascii"), "WAVE");
    assert.ok(wavDuration(audio) >= 0.1, `${audioPath} should not be clipped too short`);
  }
});
