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
  const foundation = await readFile(
    new URL("app/styles/foundation.css", root),
    "utf8",
  );

  assert.match(source, /DESKTOP_JAPANESE_X\s*=\s*250/);
  assert.match(source, /NETWORK_JUNCTION_SEGMENT_LENGTH\s*=\s*220/);
  assert.match(source, /DESKTOP_KANA_X\s*=\s*DESKTOP_JAPANESE_X \+ NETWORK_JUNCTION_SEGMENT_LENGTH/);
  assert.match(source, /MOBILE_JAPANESE_X\s*=\s*140/);
  assert.match(source, /MOBILE_KANA_X\s*=\s*MOBILE_JAPANESE_X \+ NETWORK_JUNCTION_SEGMENT_LENGTH/);
  assert.match(source, /NETWORK_VIEW_HEIGHT\s*=\s*1390/);
  assert.match(source, /data-line=\{line\}/);
  assert.match(source, /aria-label="Speech line"[\s\S]*className="network-line network-line-sound"[\s\S]*x1=\{japaneseX \+ NETWORK_INTERCHANGE_NODE_OFFSET\}[\s\S]*x2=\{kanaX - kanaLineOffset\}/);
  assert.doesNotMatch(source, /network-line-connection|Japanese network connection/);
  assert.match(source, /className="network-line network-line-travel"/);
  assert.match(source, /\[japaneseX, SOUND_Y, romajiX, ROMAJI_Y\]/);
  assert.match(source, /\[romajiX, ROMAJI_Y, japaneseX, VISIT_Y\]/);
  assert.match(source, /\[SOUND_Y, VISIT_Y\][\s\S]*aria-label="Japan line"[\s\S]*className="network-line network-line-travel"/);
  assert.match(source, /\[japaneseX, SOUND_Y, romajiX, ROMAJI_Y\][\s\S]*aria-label="Local connection"[\s\S]*className="network-line network-line-local"/);
  assert.match(source, /aria-label="Local connection"[\s\S]*x1=\{romajiX\}[\s\S]*x2=\{kanaX\}[\s\S]*y1=\{ROMAJI_Y\}[\s\S]*y2=\{SOUND_Y\}/);
  assert.match(source, /data-line="sound"[\s\S]*textAnchor="end"[\s\S]*x=\{japaneseX - 48\}[\s\S]*y=\{SOUND_Y\}/);
  assert.match(source, /VERTICAL_LINE_LABEL_Y\s*=\s*72/);
  assert.match(source, /VERTICAL_LINE_LABEL_STEP\s*=\s*12/);
  assert.match(source, /function VerticalLineLabel\([\s\S]*Array\.from\(label\.toUpperCase\(\)\)\.map\([\s\S]*x=\{x\}[\s\S]*y=\{firstLetterY \+ index \* VERTICAL_LINE_LABEL_STEP\}/);
  assert.match(source, /<VerticalLineLabel label="Japan" line="travel" x=\{japaneseX\} \/>/);
  assert.match(source, /<VerticalLineLabel label="Script" line="writing" x=\{kanaX\} \/>/);
  assert.match(source, /kind="travel-interchange"[\s\S]*label="Japanese"/);
  assert.match(source, /kind="local"[\s\S]*label="Rōmaji"[\s\S]*labelPlacement="below-right"/);
  assert.match(source, /kind="interchange" label="Kana"/);
  assert.match(source, /id=\{`\$\{backlightId\}-travel-junction`\}/);

  for (const slug of [
    "japanese",
    "visit",
    "romaji",
    "introductions",
    "navigation",
    "food",
    "shopping",
    "help",
  ]) {
    assert.match(source, new RegExp(`${slug}:\\s*"\\/stations\\/${slug}"`));
  }

  for (const label of [
    "Japanese",
    "Visit",
    "Rōmaji",
    "Introductions",
    "Navigation",
    "Food",
    "Shopping",
    "Help",
  ]) {
    assert.match(source, new RegExp(`label="${label}"`));
  }

  assert.match(source, /getStoredStationFocus\(\): StationFocus \{[\s\S]*\?\? "japanese"/);
  assert.match(source, /getServerStationFocus\(\): StationFocus \{[\s\S]*return "japanese"/);
  assert.match(source, /japanese:\s*\{ ArrowDown: "visit", ArrowRight: "kana" \}/);
  assert.match(source, /visit:\s*\{ ArrowDown: "introductions", ArrowUp: "japanese" \}/);
  assert.match(source, /romaji:\s*\{ ArrowDown: "visit", ArrowRight: "kana", ArrowUp: "japanese" \}/);
  assert.match(source, /introductions:\s*\{ ArrowDown: "navigation", ArrowUp: "visit" \}/);
  assert.match(source, /shopping:\s*\{ ArrowDown: "help", ArrowUp: "food" \}/);
  assert.match(source, /help:\s*\{ ArrowUp: "shopping" \}/);
  assert.match(source, /kana:\s*\{ ArrowDown: "vowels", ArrowLeft: "japanese", ArrowRight: "mora" \}/);
  assert.match(source, /vowels:\s*\{ ArrowDown: "hiragana", ArrowUp: "kana" \}/);
  assert.match(styles, /network-mobile-track-kana[\s\S]*translateX\(-50%\)/);
  assert.match(styles, /network-mobile-track-mora\s*\{[^}]*translateX\(-100%\)/s);
  assert.match(styles, /network-mobile-track-pitch\s*\{[^}]*translateX\(-150%\)/s);
  assert.match(styles, /network-line-travel\s*\{[^}]*stroke:\s*var\(--travel\)/s);
  assert.match(styles, /network-line-writing\s*\{[^}]*stroke:\s*var\(--writing\)/s);
  assert.match(styles, /network-line-local\s*\{[^}]*stroke:\s*var\(--muted\)[^}]*stroke-opacity:\s*0\.72[^}]*stroke-width:\s*3/s);
  assert.match(foundation, /--sound:\s*#db4e3a/);
  assert.match(foundation, /--travel:\s*#4c689c/);
  assert.match(foundation, /--writing:\s*#d6aa36/);

  assert.match(source, /NETWORK_SEGMENT_LENGTH\s*=\s*180/);
  assert.match(source, /NETWORK_LINE_NODE_OFFSET\s*=\s*18/);
  assert.match(source, /NETWORK_INTERCHANGE_NODE_OFFSET\s*=\s*31/);
  assert.match(source, /SOUND_Y\s*=\s*180/);
  assert.match(source, /VISIT_Y\s*=\s*SOUND_Y \+ NETWORK_JUNCTION_SEGMENT_LENGTH/);
  assert.match(source, /const romajiX = \(japaneseX \+ kanaX\) \/ 2/);
  assert.match(source, /ROMAJI_Y\s*=\s*SOUND_Y \+ NETWORK_JUNCTION_SEGMENT_LENGTH \/ 2/);
  assert.match(source, /INTRODUCTIONS_Y\s*=\s*VISIT_Y \+ NETWORK_SEGMENT_LENGTH/);
  assert.match(source, /NAVIGATION_Y\s*=\s*INTRODUCTIONS_Y \+ NETWORK_SEGMENT_LENGTH/);
  assert.match(source, /FOOD_Y\s*=\s*NAVIGATION_Y \+ NETWORK_SEGMENT_LENGTH/);
  assert.match(source, /SHOPPING_Y\s*=\s*FOOD_Y \+ NETWORK_SEGMENT_LENGTH/);
  assert.match(source, /HELP_Y\s*=\s*SHOPPING_Y \+ NETWORK_SEGMENT_LENGTH/);
  assert.match(source, /VOWELS_Y\s*=\s*SOUND_Y \+ NETWORK_JUNCTION_SEGMENT_LENGTH/);
  assert.match(source, /HIRAGANA_Y\s*=\s*VOWELS_Y \+ NETWORK_SEGMENT_LENGTH/);
  assert.match(source, /KATAKANA_Y\s*=\s*HIRAGANA_Y \+ NETWORK_SEGMENT_LENGTH/);
  assert.match(source, /SOUND_MARKS_Y\s*=\s*KATAKANA_Y \+ NETWORK_SEGMENT_LENGTH/);
  assert.match(source, /COMBINED_SOUNDS_Y\s*=\s*SOUND_MARKS_Y \+ NETWORK_SEGMENT_LENGTH/);
  assert.match(source, /viewBox=\{`0 0 \$\{width\} \$\{NETWORK_VIEW_HEIGHT\}`\}/);

  for (const [focus, href] of [
    ["kana", "/stations/kana"],
    ["vowels", "/stations/vowels"],
    ["hiragana", "/stations/hiragana"],
    ["katakana", "/stations/katakana"],
    ["marks", "/stations/sound-marks"],
    ["combined", "/stations/combined-sounds"],
    ["mora", "/stations/mora-timing"],
    ["pitch", "/stations/pitch-accent"],
  ]) {
    assert.match(source, new RegExp(`${focus}:\\s*"${href}"`));
  }

  assert.match(source, /import \{ NavigationLink, useRouteReady \} from "\.\/navigation-feedback"/);
  assert.doesNotMatch(source, /import Link from "next\/link"|import \{ useRouter \} from "next\/navigation"/);
  assert.match(source, /<NavigationLink[\s\S]*className="network-station-link"[\s\S]*href=\{href\}[\s\S]*prefetch/);
  assert.doesNotMatch(source, /loadingStation=\{label\}/);
  assert.doesNotMatch(source, /window\.location\.assign|<a[^>]*className="network-station-link"/);

  assert.match(source, /MOBILE_SWIPE_THRESHOLD\s*=\s*40/);
  assert.match(source, /onPointerDown/);
  assert.match(source, /onPointerMove/);
  assert.match(source, /onPointerUp/);
  assert.match(source, /Math\.abs\(event\.clientX - start\.x\) < MOBILE_SWIPE_THRESHOLD/);
  assert.match(source, /dragged\.current = true;\s*event\.currentTarget\.setPointerCapture/s);
  assert.match(source, /isTravelFocus\(stationFocus\)[\s\S]*selectStation\("kana"\)/);
  assert.match(source, /stationFocus === "pitch"[\s\S]*selectStation\("mora"\)/);
  assert.match(source, /!isTravelFocus\(stationFocus\)[\s\S]*selectStation\("japanese"\)/);

  assert.match(source, /STATION_FOCUS_STORAGE_KEY\s*=\s*"ling:network-station-focus"/);
  assert.match(source, /useSyncExternalStore\(\s*subscribeToStoredStationFocus,\s*getStoredStationFocus,\s*getServerStationFocus/s);
  assert.match(source, /localStorage\.setItem\(STATION_FOCUS_STORAGE_KEY, focus\)/);
  assert.match(source, /window\.dispatchEvent\(new Event\(STATION_FOCUS_EVENT\)\)/);
  assert.match(source, /window\.addEventListener\("storage", onStoreChange\)/);
  assert.match(source, /new URLSearchParams\(window\.location\.search\)\.get\("focus"\)/);
  assert.match(source, /storedFocus === "japan"\) return "visit"/);
  assert.match(source, /requestedFocus === "japan"[\s\S]*\? "visit"/);
  assert.match(source, /const requestedStationFocus = selectedStationFocus \?\? storedStationFocus/);
  assert.match(source, /const mobileFocus: MobileFocus = stationFocus/);

  assert.match(source, /hiragana:\s*\{ ArrowDown: "katakana", ArrowUp: "vowels" \}/);
  assert.match(source, /katakana:\s*\{ ArrowDown: "marks", ArrowUp: "hiragana" \}/);
  assert.match(source, /marks:\s*\{ ArrowDown: "combined", ArrowUp: "katakana" \}/);
  assert.match(source, /combined:\s*\{ ArrowUp: "marks" \}/);
  assert.match(source, /mora:\s*\{ ArrowLeft: "kana", ArrowRight: "pitch" \}/);
  assert.match(source, /pitch:\s*\{ ArrowLeft: "mora" \}/);
  assert.equal((source.match(/STATION_NEIGHBORS\[stationFocus\]\[direction\]/g) ?? []).length, 2);
  assert.match(source, /function onDesktopKeyDown\(event: KeyboardEvent<HTMLDivElement>\)/);
  assert.match(source, /function onMobileKeyDown\(event: KeyboardEvent<HTMLDivElement>\)/);
  assert.match(source, /getStationTarget\(event\.currentTarget, nextFocus\)\.focus\(\)/);
  assert.match(source, /activateStationLink\(getStationTarget\(event\.currentTarget, stationFocus\)\)/);
  assert.match(source, /new MouseEvent\("click", \{ bubbles: true, cancelable: true, view: window \}\)/);

  assert.match(source, /className="network-desktop-viewport"/);
  assert.equal((source.match(/aria-label="Explore the network with the arrow keys"/g) ?? []).length, 2);
  assert.match(source, /data-desktop-focus=\{stationFocus\}/);
  assert.match(source, /data-mobile-station-focus=\{stationFocus\}/);
  assert.match(source, /document\.activeElement !== document\.body/);
  assert.match(source, /window\.matchMedia\("\(max-width: 600px\)"\)\.matches/);
  assert.equal((source.match(/ref=\{(?:desktop|mobile)Viewport\}/g) ?? []).length, 2);
  assert.match(styles, /\.network-station-link:hover \.network-station-backlight\s*\{[^}]*opacity:\s*0\.55/s);
  assert.match(styles, /\.network-station-link:focus-visible \.network-station-backlight/);
  assert.doesNotMatch(styles, /network-(?:line-hit-|line-|station-)unavailable|aria-disabled/);

  assert.match(page, /dynamic = "force-static"/);
  assert.match(page, /<NetworkMap \/>/);
  assert.doesNotMatch(source, /aria-disabled="true"|data-available=/);
});

test("station map glyphs reflect each station's network position", async () => {
  const source = await readFile(new URL("app/network-visuals.tsx", root), "utf8");
  const topbar = await readFile(new URL("app/stations/station-topbar.tsx", root), "utf8");
  const networkMap = await readFile(new URL("app/network-map.tsx", root), "utf8");
  const japaneseGlyph = source.slice(
    source.indexOf('if (position === "japanese")'),
    source.indexOf('if (\n    position === "visit"'),
  );
  const kanaGlyph = source.slice(
    source.indexOf('if (position === "kana")'),
    source.indexOf('if (position === "hiragana")'),
  );

  assert.match(japaneseGlyph, /station-map-travel[\s\S]*station-map-sound[\s\S]*station-map-interchange/);
  assert.match(japaneseGlyph, /d="M14 8v14"[\s\S]*d="M14 8h14"/);
  assert.doesNotMatch(japaneseGlyph, /station-map-connection/);
  assert.match(source, /position === "visit"[\s\S]*position === "food"[\s\S]*station-map-travel/);
  assert.match(source, /position === "romaji"[\s\S]*station-map-local[\s\S]*station-map-current/);
  assert.match(source, /d="M10 2 20 12 10 22M20 12 30 2"/);
  assert.doesNotMatch(source.match(/if \(position === "romaji"\)[\s\S]*?\n  \}/)?.[0] ?? "", /station-map-interchange/);
  assert.match(source, /position === "shopping"[\s\S]*station-map-travel/);
  assert.match(source, /position === "help"[\s\S]*data-terminal="true"[\s\S]*station-map-travel/);
  assert.match(kanaGlyph, /station-map-sound[\s\S]*station-map-writing[\s\S]*station-map-interchange/);
  assert.match(kanaGlyph, /d="M6 8h28"[\s\S]*d="M20 8v14"/);
  assert.match(source, /position === "vowels" \|\| position === "hiragana"[\s\S]*station-map-writing/);
  assert.match(source, /position === "katakana"[\s\S]*station-map-writing/);
  assert.match(source, /position === "katakana" \|\| position === "sound-marks"[\s\S]*station-map-writing/);
  assert.match(source, /position === "combined-sounds"[\s\S]*data-terminal="true"[\s\S]*station-map-writing/);
  assert.match(topbar, /import \{ NetworkGlyph, type NetworkPosition \} from "\.\.\/network-visuals"/);
  assert.match(networkMap, /<NetworkStationSymbol kind=\{kind\} \/>/);
});

test("the Kana stations reveal in order from account-scoped completion", async () => {
  const source = await readFile(new URL("app/network-map.tsx", root), "utf8");
  const page = await readFile(new URL("app/page.tsx", root), "utf8");
  const moraPage = await readFile(new URL("app/stations/mora-timing/page.tsx", root), "utf8");
  const pitchPage = await readFile(new URL("app/stations/pitch-accent/page.tsx", root), "utf8");
  const katakanaPage = await readFile(new URL("app/stations/katakana/page.tsx", root), "utf8");
  const soundMarksPage = await readFile(new URL("app/stations/sound-marks/page.tsx", root), "utf8");
  const combinedSoundsPage = await readFile(new URL("app/stations/combined-sounds/page.tsx", root), "utf8");
  const legacyExtensionsPage = await readFile(new URL("app/stations/kana-extensions/page.tsx", root), "utf8");
  const soundMarksApi = await readFile(new URL("app/api/stations/sound-marks/introduction/route.ts", root), "utf8");
  const combinedSoundsApi = await readFile(new URL("app/api/stations/combined-sounds/introduction/route.ts", root), "utf8");
  const vowels = await readFile(new URL("app/stations/vowels/vowels-guide.tsx", root), "utf8");
  const hiragana = await readFile(new URL("app/stations/hiragana/hiragana-guide.tsx", root), "utf8");
  const vowelsApi = await readFile(new URL("app/api/stations/vowels/introduction/route.ts", root), "utf8");
  const availabilityApi = await readFile(
    new URL("app/api/stations/availability/route.ts", root),
    "utf8",
  );
  const api = await readFile(new URL("app/api/stations/hiragana/introduction/route.ts", root), "utf8");
  const stations = await readFile(new URL("src/modules/learning/stations.ts", root), "utf8");
  const repository = await readFile(new URL("src/modules/learning/repository.ts", root), "utf8");
  const schema = await readFile(new URL("db/schema.ts", root), "utf8");

  assert.match(stations, /hiragana: \["vowels"\]/);
  assert.match(stations, /katakana: \["hiragana"\]/);
  assert.match(stations, /"sound-marks": \["katakana"\]/);
  assert.match(stations, /"combined-sounds": \["sound-marks"\]/);
  assert.match(stations, /"mora-timing": \["combined-sounds"\]/);
  assert.match(stations, /"pitch-accent": \["mora-timing"\]/);
  assert.match(stations, /prerequisites\.every/);
  assert.match(schema, /stationIntroductions = sqliteTable\(\s*"station_introductions"/s);
  assert.match(schema, /primaryKey\(\{ columns: \[table\.userId, table\.stationId\] \}\)/);
  assert.match(repository, /where\(eq\(stationIntroductions\.userId, userId\)\)/);
  assert.match(repository, /const completedStations = await listCompletedStations\(userId\)/);
  assert.match(repository, /if \(!isStationAvailable\(stationId, completedStations\)\) return false/);
  assert.match(repository, /knownHiragana\.length === BASIC_HIRAGANA\.length/);
  assert.match(repository, /knownKatakana\.length === BASIC_KATAKANA\.length/);
  assert.match(repository, /SOUND_MARK_PATTERN_IDS\.every\(\(patternId\) =>/);
  assert.match(repository, /COMBINED_SOUND_PATTERN_IDS\.every\(\(patternId\) =>/);
  assert.match(repository, /PITCH_ACCENT_ITEM_IDS\.every\(\(itemId\) =>/);
  assert.match(repository, /retainPrerequisiteCompleteStations\(independentlyCompleted\)/);
  assert.match(repository, /onConflictDoNothing\(\)/);
  assert.match(vowelsApi, /recordStationIntroduction\(user\.id, "vowels"\)/);
  assert.match(vowelsApi, /\{ available: \["hiragana"\] \}/);
  assert.match(repository, /row\.stationId === "kana" \? "vowels" : row\.stationId/);
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
  assert.match(pitchPage, /redirect\("\/\?focus=pitch-accent"\)/);
  assert.match(katakanaPage, /redirect\("\/\?focus=katakana"\)/);
  assert.match(soundMarksPage, /redirect\("\/\?focus=sound-marks"\)/);
  assert.match(combinedSoundsPage, /redirect\("\/\?focus=combined-sounds"\)/);
  assert.match(legacyExtensionsPage, /redirect\("\/stations\/sound-marks"\)/);
  assert.match(soundMarksApi, /recordStationIntroduction\(user\.id, "sound-marks"\)/);
  assert.match(soundMarksApi, /\{ available: \[\] \}/);
  assert.match(combinedSoundsApi, /recordStationIntroduction\(user\.id, "combined-sounds"\)/);
  assert.match(combinedSoundsApi, /\{ available: \[\] \}/);
  assert.match(hiragana, /fetch\("\/api\/stations\/hiragana\/introduction"/);
  assert.match(vowels, /fetch\("\/api\/stations\/vowels\/introduction"/);
  assert.match(hiragana, /useEffect\(\(\) => \{/);
  assert.doesNotMatch(hiragana, /Continue to Mora timing|station-next/);
  assert.match(source, /\{hiraganaAvailable \? \([\s\S]*?className="network-line-target"/);
  assert.match(source, /focus === "hiragana" && hiraganaAvailable/);
  assert.match(source, /focus === "katakana" && katakanaAvailable/);
  assert.match(source, /focus === "marks" && soundMarksAvailable/);
  assert.match(source, /focus === "combined" && combinedSoundsAvailable/);
  assert.match(source, /focus === "pitch" && pitchAccentAvailable/);
  assert.match(source, /nextFocus && isStationVisible\([\s\S]*?nextFocus,[\s\S]*?hiraganaAvailable,[\s\S]*?katakanaAvailable,[\s\S]*?soundMarksAvailable,[\s\S]*?combinedSoundsAvailable,[\s\S]*?moraTimingAvailable,[\s\S]*?pitchAccentAvailable/);
  assert.doesNotMatch(source, /MORA_UNAVAILABLE_REASON|network-line-unavailable|unavailableReason|aria-disabled/);
  assert.doesNotMatch(source, /After Hiragana|network-station-dependency/);
  assert.doesNotMatch(hiragana, /score|streak|timer|progress meter/i);
});

test("Dakuten & Handakuten and Yōon teach focused patterns with scoped progress", async () => {
  const source = await readFile(
    new URL("app/stations/kana-extensions/kana-extensions-guide.tsx", root),
    "utf8",
  );
  const soundMarksPage = await readFile(new URL("app/stations/sound-marks/page.tsx", root), "utf8");
  const combinedSoundsPage = await readFile(new URL("app/stations/combined-sounds/page.tsx", root), "utf8");
  const soundMarksApi = await readFile(
    new URL("app/api/stations/sound-marks/knowledge/route.ts", root),
    "utf8",
  );
  const combinedSoundsApi = await readFile(
    new URL("app/api/stations/combined-sounds/knowledge/route.ts", root),
    "utf8",
  );
  const knowledgeApi = await readFile(new URL("src/modules/learning/kana-pattern-api.ts", root), "utf8");
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
  const soundMarkFlashcards = source.slice(
    source.indexOf("const SOUND_MARK_FLASHCARDS"),
    source.indexOf("const SOUND_MARK_FLASHCARD_BY_KANA"),
  );
  const combinedSoundFlashcards = source.slice(
    source.indexOf("const COMBINED_SOUND_FLASHCARDS"),
    source.indexOf("const COMBINED_SOUND_FLASHCARD_BY_KANA"),
  );

  assert.match(soundMarksPage, /isStationAvailableToCurrentUser\("sound-marks"\)/);
  assert.match(soundMarksPage, /<StationTopbar current="Dakuten & Handakuten" mapPosition="sound-marks" \/>/);
  assert.match(soundMarksPage, /<SoundMarksGuide \/>/);
  assert.match(combinedSoundsPage, /isStationAvailableToCurrentUser\("combined-sounds"\)/);
  assert.match(combinedSoundsPage, /<StationTopbar current="Yōon" mapPosition="combined-sounds" \/>/);
  assert.match(combinedSoundsPage, /<CombinedSoundsGuide \/>/);
  assert.match(source, /fetch\(`\/api\/stations\/\$\{stationSlug\}\/introduction`/);
  assert.match(source, /const knowledgePath = `\/api\/stations\/\$\{stationSlug\}\/knowledge`/);
  assert.match(source, /stationName="Dakuten & Handakuten"/);
  assert.match(source, /stationName="Yōon"/);
  assert.match(source, /flashcards=\{COMBINED_SOUND_FLASHCARDS\}/);
  assert.match(source, /JAPANESE_ROMAJI_VOWELS/);
  assert.match(source, /JAPANESE_ROMAJI_YOON_VOWELS/);
  assert.doesNotMatch(source, /sound-marks-chart-title|All marked sounds/);
  assert.doesNotMatch(source, /The first four rows use dakuten|The last row uses handakuten/);
  assert.match(source, /aria-label="Dakuten and handakuten marks"/);
  assert.match(source, /<span className="sr-only" lang="ja">゛<\/span>[\s\S]*className="kana-extension-mark-glyph"/);
  assert.match(source, /<span className="sr-only" lang="ja">゜<\/span>[\s\S]*<circle cx="24" cy="22" r="9"/);
  assert.match(source, /hiragana: "が", katakana: "ガ"/);
  assert.match(source, /hiragana: "じ", katakana: "ジ"/);
  assert.match(source, /hiragana: "づ", katakana: "ヅ"/);
  assert.match(source, /hiragana: "ぽ", katakana: "ポ"/);
  assert.match(source, /Yōon is a way of writing one sound with two Kana/);
  assert.match(source, /changes the sound of the Kana before it, and the pair is read together/);
  assert.match(source, /き<\/strong> is <span lang="ja-Latn">ki<\/span>/);
  assert.match(source, /きゃ<\/strong> is <span lang="ja-Latn">kya<\/span>—not <span lang="ja-Latn">ki-ya<\/span>/);
  assert.doesNotMatch(source, /Yōon chart|Each row starts with one Kana|kana-extension-small-kana-legend/);
  assert.match(source, /aria-label="All marked Hiragana and Katakana sounds"/);
  assert.match(source, /className="hiragana-table kana-extension-all-sounds-chart"/);
  assert.match(source, /aria-label="All combined Hiragana and Katakana sounds"/);
  assert.doesNotMatch(source, /label="Hiragana"|label="Katakana"/);
  assert.match(source, /MARKED_SOUND_ROWS\.flatMap\(\(row, rowIndex\) =>/);
  assert.match(source, /DUPLICATE_MARKED_KATAKANA = new Set\(\["ベ", "ペ"\]\)/);
  assert.match(source, /rowSpan=\{sharedGlyph \? 2 : undefined\}/);
  assert.match(source, /row\.filter\(\(cell\) => !DUPLICATE_MARKED_KATAKANA\.has\(cell\.katakana\)\)/);
  assert.equal((soundMarkFlashcards.match(/\bid: "/g) ?? []).length, 48);
  assert.match(source, /SOUND_MARK_FLASHCARD_BY_KANA\.get\(kana\)/);
  assert.match(source, /<SoundMarksChart renderCard=\{renderCard\} \/>/);
  assert.match(source, /onClick=\{\(\) => openTest\(stationName, \[entry\]\)\}/);
  assert.doesNotMatch(
    source.slice(source.indexOf("function SoundMarksChart"), source.indexOf("function CombinedSoundsChart")),
    /ExtensionSoundChartRows|label="Hiragana"|label="Katakana"|kana-extension-chart-group-heading|<small>/,
  );
  assert.match(source, /COMBINED_SOUND_ROWS\.flatMap\(\(row, rowIndex\) =>/);
  assert.equal((combinedSoundFlashcards.match(/\bid: "/g) ?? []).length, 66);
  assert.match(source, /COMBINED_SOUND_FLASHCARD_BY_KANA\.get\(kana\)/);
  assert.match(source, /<CombinedSoundsChart renderCard=\{renderCard\} \/>/);
  assert.equal((source.match(/className="hiragana-table kana-extension-all-sounds-chart"/g) ?? []).length, 2);
  assert.match(source, /hiragana: "きゃ", katakana: "キャ"/);
  assert.match(source, /hiragana: "しゅ", katakana: "シュ"/);
  assert.match(source, /hiragana: "ちょ", katakana: "チョ"/);
  assert.match(source, /hiragana: "ぴょ", katakana: "ピョ"/);
  assert.doesNotMatch(source, /small-tsu|long-vowel|きって|ケーキ/);
  assert.doesNotMatch(source, /kana-extension-sign-card|kana-extension-sound-change|referenceRows/);
  assert.doesNotMatch(source, /voiced|vibration|vocal cords|consonant|I-column|half-voiced/i);
  assert.doesNotMatch(source, /Hear them in words|Open a group|COMBINED_SOUND_GROUPS|ExtensionGroup/);
  assert.doesNotMatch(source, /Position matters|Size matters|Apply the signs/);
  assert.equal((domain.match(/"(?:dakuten|handakuten|small)-[a-z]+"/g) ?? []).length, 10);
  assert.match(domain, /SOUND_MARK_PATTERN_IDS/);
  assert.match(domain, /COMBINED_SOUND_PATTERN_IDS/);
  assert.doesNotMatch(domain, /small-tsu|long-vowel/);
  assert.match(source, /This marks all \{allEntries\.length\} patterns in this station as complete and unlocks \{nextStation\}/);
  assert.match(source, /Later stations stay hidden until \{stationName\} is complete again/);
  assert.match(source, /<FlashcardReview/);
  assert.match(source, /<FlashcardContent/);
  assert.match(source, /example=\{activeCard\.example\}/);
  assert.match(source, /playAudio\(\{ index: 0, src: activeCard\.audio \}\)/);
  assert.match(source, /function playExample\(\)[\s\S]*splitJapaneseMorae\(activeCard\.example\)\.length[\s\S]*index: 1[\s\S]*activeCard\.exampleAudio/);
  assert.match(source, /onActivate=\{activateCard\}/);
  assert.match(source, /onReveal=\{activateCard\}/);
  assert.match(source, /pronunciation=\{getJapaneseRomaji\(activeCard\.kana\)\}/);
  assert.doesNotMatch(source, /\b(?:cue|sound|english): "/);
  assert.match(source, /translation=\{activeCard\.translation\}/);
  assert.doesNotMatch(source, /Say the sound|reveal the cue/);
  assert.match(schema, /kanaExtensionKnowledge = sqliteTable\(\s*"kana_extension_knowledge"/s);
  assert.match(repository, /listKnownKanaExtensionPatterns/);
  assert.match(repository, /setKanaExtensionPatternKnown/);
  assert.match(repository, /setKanaExtensionPatternsKnown/);
  assert.match(repository, /inArray\(kanaExtensionKnowledge\.patternId, patternIds\)/);
  assert.match(repository, /KANA_EXTENSION_KNOWLEDGE_ROWS_PER_STATEMENT = 30/);
  assert.match(repository, /patternIds\.slice\([\s\S]*KANA_EXTENSION_KNOWLEDGE_ROWS_PER_STATEMENT/);
  assert.match(repository, /db\.batch\(\[firstStatement, \.\.\.remainingStatements\]\)/);
  assert.match(soundMarksApi, /getKanaPatternKnowledge\(SOUND_MARK_PATTERN_IDS\)/);
  assert.match(soundMarksApi, /updateKanaPatternKnowledge\(request, SOUND_MARK_PATTERN_IDS\)/);
  assert.match(combinedSoundsApi, /getKanaPatternKnowledge\(COMBINED_SOUND_PATTERN_IDS\)/);
  assert.match(combinedSoundsApi, /updateAllKanaPatternKnowledge\(request, COMBINED_SOUND_PATTERN_IDS\)/);
  assert.match(knowledgeApi, /isKanaExtensionPatternId\(candidate\.patternId\)/);
  assert.match(knowledgeApi, /patternIds\.includes\(body\.patternId\)/);
  assert.match(knowledgeApi, /private, no-store/);
  assert.match(styles, /\.kana-extension-charts\s*\{[^}]*width:\s*min\(100%, 38rem\)/s);
  assert.match(styles, /\.kana-extension-mark-glyph\s*\{[^}]*width:\s*4\.5rem[^}]*height:\s*4\.5rem/s);
  assert.match(styles, /\.kana-extension-chart-character\s*\{[^}]*font-size:\s*1\.65rem/s);
  assert.match(styles, /@media \(max-width: 600px\)[\s\S]*\.kana-extension-all-sounds-chart \.kana-extension-chart-character\s*\{[^}]*font-size:\s*1\.45rem/s);
  assert.equal(
    audioPaths.length,
    (
      (soundMarkFlashcards.match(/\bid: "/g) ?? []).length
      + (combinedSoundFlashcards.match(/\bid: "/g) ?? []).length
    ) * 2,
  );
  assert.doesNotMatch(source, /getJapaneseSoundCue|getJapaneseWordSoundCue|score|streak|timer|progress meter/i);

  for (const audioPath of new Set(audioPaths)) {
    const audio = await readFile(new URL(`public${audioPath}`, root));
    assert.equal(audio.subarray(0, 4).toString("ascii"), "RIFF");
    assert.equal(audio.subarray(8, 12).toString("ascii"), "WAVE");
    assert.ok(wavDuration(audio) >= 0.1, `${audioPath} should not be clipped too short`);
  }
});

test("the Mora timing station teaches and reviews equal beats with bundled audio", async () => {
  const source = await readFile(new URL("app/stations/mora-timing/mora-timing-guide.tsx", root), "utf8");
  const flashcardReview = await readFile(new URL("app/stations/flashcard-review.tsx", root), "utf8");
  const stationOptions = await readFile(new URL("app/stations/station-options.tsx", root), "utf8");
  const styles = await readFile(new URL("app/styles/stations.css", root), "utf8");
  const schema = await readFile(new URL("db/schema.ts", root), "utf8");
  const repository = await readFile(new URL("src/modules/learning/repository.ts", root), "utf8");
  const domain = await readFile(new URL("src/modules/learning/mora-timing.ts", root), "utf8");
  const introductionApi = await readFile(
    new URL("app/api/stations/mora-timing/introduction/route.ts", root),
    "utf8",
  );
  const knowledgeApi = await readFile(
    new URL("app/api/stations/mora-timing/knowledge/route.ts", root),
    "utf8",
  );
  const teachingSource = source.slice(
    source.indexOf("const MORA_CONCEPTS"),
    source.indexOf("const MORA_REVIEW_CARDS"),
  );
  const reviewSource = source.slice(
    source.indexOf("const MORA_REVIEW_CARDS"),
    source.indexOf("export function MoraTimingGuide"),
  );
  const practiceSource = source.slice(
    source.indexOf('<section aria-labelledby="mora-practice-title"'),
    source.indexOf("{audioError ?"),
  );
  const teachingWords = [...teachingSource.matchAll(/word: "([^"]+)"/g)].map((match) => match[1]);
  const reviewWords = [...reviewSource.matchAll(/word: "([^"]+)"/g)].map((match) => match[1]);
  const reviewIds = [...reviewSource.matchAll(/id: "([^"]+)"/g)].map((match) => match[1]);
  const reviewMeanings = [...reviewSource.matchAll(/meaning: "([^"]+)"/g)].map((match) => match[1]);
  const reviewMoraBreakdowns = [...reviewSource.matchAll(
    /morae: \[([^\]]+)\], word: "([^"]+)"/g,
  )].map((match) => ({
    morae: [...match[1].matchAll(/"([^"]+)"/g)].map((moraMatch) => moraMatch[1]),
    word: match[2],
  }));
  const domainIds = [...domain.matchAll(/^  "([a-z-]+)",$/gm)].map((match) => match[1]);
  const teachingAudioPaths = [...teachingSource.matchAll(/wordAudio: "(\/audio\/ja-[^"]+\.wav)"/g)].map((match) => match[1]);
  const reviewAudioPaths = [...reviewSource.matchAll(/wordAudio: "(\/audio\/ja-[^"]+\.wav)"/g)].map((match) => match[1]);

  assert.deepEqual(teachingAudioPaths, [
    "/audio/ja-inu.wav",
    "/audio/ja-asa.wav",
    "/audio/ja-hon.wav",
    "/audio/ja-katakana-wain.wav",
    "/audio/ja-yoon-hiragana-kyo.wav",
    "/audio/ja-kyaku.wav",
    "/audio/ja-kitte.wav",
    "/audio/ja-katakana-robotto.wav",
    "/audio/ja-keeki.wav",
    "/audio/ja-katakana-chiizu.wav",
  ]);
  assert.equal(reviewWords.length, 10);
  assert.equal(reviewMeanings.length, 10);
  assert.equal(reviewAudioPaths.length, 10);
  assert.equal(reviewMoraBreakdowns.length, 10);
  for (const { morae, word } of reviewMoraBreakdowns) {
    assert.equal(morae.join(""), word, `${word} must render from its declared morae`);
  }
  assert.equal(teachingWords.length, 10);
  assert.equal(new Set([...teachingWords, ...reviewWords]).size, 20);
  assert.match(teachingSource, /title: "One Kana, one beat"/);
  assert.match(teachingSource, /title: "ん has its own beat"/);
  assert.match(teachingSource, /title: "Yōon is one beat"/);
  assert.match(teachingSource, /title: "Small っ holds a silent beat"/);
  assert.match(teachingSource, /title: "ー extends the sound"/);
  assert.ok(source.indexOf('className="mora-concept-heading"') < source.indexOf('className="mora-example-list"'));
  assert.match(teachingSource, /morae: \["きょ", "う"\]/);
  assert.match(teachingSource, /Small っ or ッ holds a silent beat/);
  assert.match(teachingSource, /prolonged sound mark ー, used mainly in Katakana/);
  assert.doesNotMatch(source, /Count the beats\. The answer appears after four seconds|The test checks recognition, not pronunciation|Did you count it correctly|mark whether your count was right|mora-notes/);
  assert.doesNotMatch(source, /className="mora-review-(?:prompt|rule|meaning)"/);
  assert.doesNotMatch(source, /className="mora-review-count"/);
  assert.doesNotMatch(reviewSource, /\brule:/);
  assert.match(source, /className="mora-review-card-content"[\s\S]*?aria-label=\{activeCard\.word\}[\s\S]*?className="mora-review-word"[\s\S]*?activeCard\.morae\.map\(\(mora, index\) =>[\s\S]*?className="mora-review-word-beat"[\s\S]*?data-active=\{activeReviewBeatIndex === index \? "true" : undefined\}[\s\S]*?className="mora-review-answer-slot"[\s\S]*?className="mora-review-answer"[\s\S]*?<MoraPronunciation[\s\S]*?className="mora-review-translation"[\s\S]*?\{activeCard\.meaning\}/);
  assert.doesNotMatch(styles, /\.mora-review-translation:not\(\[data-revealed="true"\]\)/);
  assert.match(source, /announcement=\{breakdownRevealed[\s\S]*?getJapaneseWordSoundCue\(activeCard\.word\)[\s\S]*?activeCard\.morae\.length/);
  assert.match(source, /className="mora-review-answer-slot"[\s\S]*?<MoraPronunciation[\s\S]*?word=\{activeCard\.word\}[\s\S]*?\/>/);
  assert.doesNotMatch(source, /className="mora-review-answer-slot"[\s\S]{0,400}?<MoraBeats/);
  assert.match(source, /<FlashcardReview/);
  assert.match(source, /function activateReviewCard\(\)[\s\S]*setBreakdownRevealed\(true\)[\s\S]*playAudio\(activeCard\.wordAudio/);
  assert.match(source, /onActivate=\{activateReviewCard\}/);
  assert.match(source, /<FlashcardCountdown onComplete=\{activateReviewCard\} \/>/);
  assert.doesNotMatch(source, /className="mora-review-word"[\s\S]{0,160}onClick=/);
  assert.match(flashcardReview, /FLASHCARD_REVEAL_DELAY_SECONDS = 4/);
  assert.match(flashcardReview, /window\.setTimeout\(\(\) => \{[\s\S]*?onCompleteRef\.current\(\);[\s\S]*?\}, FLASHCARD_REVEAL_DELAY_MS\)/);
  assert.match(flashcardReview, /role="timer"[\s\S]*?flashcard-countdown-progress[\s\S]*?\{secondsRemaining\}/);
  assert.doesNotMatch(source, /Show timing for \$\{activeCard\.word\}|>\s*Answer\s*</);
  assert.match(styles, /\.flashcard-countdown\s*\{[^}]*width:\s*2\.5rem[^}]*height:\s*2\.5rem[^}]*color:\s*var\(--muted\)/s);
  assert.match(styles, /\.flashcard-countdown-progress\s*\{[^}]*animation:\s*flashcard-countdown-fill var\(--flashcard-countdown-duration\) linear forwards[^}]*stroke:\s*var\(--known\)[^}]*stroke-dashoffset:\s*1/s);
  assert.match(source, /className="hiragana-test-trigger"/);
  assert.match(source, /Test Mora Timing\. \$\{remainingCount\} remaining\./);
  assert.match(source, /<StationOptions/);
  assert.match(source, /stationName="Mora Timing"/);
  assert.match(source, /onSetComplete=\{setAllKnowledge\}/);
  assert.match(source, /method: "PATCH"/);
  assert.match(stationOptions, /<summary aria-label="Station options">/);
  assert.match(stationOptions, />I know this<\/span>/);
  assert.match(stationOptions, />Reset station<\/span>/);
  assert.match(source, /fetch\("\/api\/stations\/mora-timing\/introduction"/);
  assert.match(source, /fetch\("\/api\/stations\/mora-timing\/knowledge"/);
  assert.match(source, /audio\.currentTime \/ audio\.duration/);
  assert.match(source, /window\.requestAnimationFrame\(updateActiveBeat\)/);
  assert.match(source, /const activeReviewBeatIndex = audioPlaying && playingWord === activeCard\?\.word[\s\S]*?\? activeBeatIndex[\s\S]*?: null/);
  assert.match(source, /data-active=\{activeBeatIndex === index \? "true" : undefined\}/);
  assert.match(source, /<MoraAudioIndicator \/>/);
  assert.match(source, /<button[\s\S]*?aria-label=\{`Play \$\{example\.word\}`\}[\s\S]*?className="mora-example"[\s\S]*?onClick=\{\(\) => void playAudio\(example\.wordAudio[\s\S]*?<span className="mora-example-timing">[\s\S]*?<MoraBeats[\s\S]*?<MoraAudioIndicator \/>[\s\S]*?<MoraPronunciation[\s\S]*?<span className="mora-meaning">/);
  assert.doesNotMatch(source, /className="mora-beats-button"/);
  assert.doesNotMatch(source, /className="mora-word"/);
  assert.doesNotMatch(source.slice(source.indexOf('className="mora-example-list"'), source.indexOf("{audioError ?")), /className="mora-count"/);
  assert.doesNotMatch(source, /widestMoraLength|--mora-beat-width/);
  assert.match(styles, /\.mora-concepts\s*\{[^}]*display:\s*grid[^}]*width:\s*min\(100%, 38rem\)[^}]*gap:\s*2rem/s);
  assert.doesNotMatch(styles, /\.mora-concepts\s*\{[^}]*border-top:/s);
  assert.match(styles, /\.mora-example-list\s*\{[^}]*display:\s*grid[^}]*grid-template-columns:\s*repeat\(2, minmax\(0, 1fr\)\)[^}]*gap:\s*0\.75rem/s);
  assert.doesNotMatch(styles, /\.mora-example-list\s*\{[^}]*(?:border|border-radius):/s);
  assert.doesNotMatch(styles, /\.mora-example \+ \.mora-example\s*\{[^}]*border-top:/s);
  assert.doesNotMatch(styles, /\.mora-concept\s*\{[^}]*border-bottom:/s);
  assert.doesNotMatch(styles, /\.mora-concept:last-child/);
  assert.match(styles, /\.mora-concept-heading\s*\{[^}]*margin-bottom:\s*0\.875rem/s);
  assert.match(styles, /\.mora-example\s*\{[^}]*width:\s*100%[^}]*min-height:\s*6\.75rem[^}]*align-items:\s*center[^}]*border:\s*1px solid var\(--line\)[^}]*border-radius:\s*1rem[^}]*cursor:\s*pointer[^}]*text-align:\s*center/s);
  assert.match(styles, /\.mora-example:only-child\s*\{[^}]*width:\s*calc\(\(100% - 0\.75rem\) \/ 2\)[^}]*grid-column:\s*1 \/ -1[^}]*justify-self:\s*center/s);
  assert.match(styles, /\.mora-example-timing\s*\{[^}]*position:\s*relative[^}]*display:\s*inline-grid[^}]*place-items:\s*center/s);
  assert.match(styles, /\.mora-audio-indicator\s*\{[^}]*position:\s*absolute[^}]*left:\s*calc\(100% \+ 0\.5rem\)/s);
  assert.match(styles, /\.mora-beats\s*\{[^}]*display:\s*inline-flex[^}]*align-items:\s*baseline[^}]*gap:\s*0\.35rem/s);
  assert.doesNotMatch(styles, /\.mora-beats\s*\{[^}]*justify-self:/s);
  assert.doesNotMatch(styles, /\.mora-beat\s*\{[^}]*(?:width|height|border|background):/s);
  assert.doesNotMatch(styles, /\.mora-beat \+ \.mora-beat|\.mora-beat:(?:first|last|only)-child/);
  assert.match(styles, /\.mora-beat\[data-active="true"\]\s*\{[^}]*color:\s*var\(--sound\)/s);
  assert.doesNotMatch(styles, /\.mora-beat\[data-active="true"\]\s*\{[^}]*(?:background|border-color|box-shadow|transform):/s);
  assert.match(styles, /\.mora-review-word-beat\[data-active="true"\]\s*\{[^}]*color:\s*var\(--sound\)/s);
  assert.doesNotMatch(styles, /\.mora-review-word-beat\[data-active="true"\]\s*\{[^}]*(?:background|border-color|box-shadow|transform):/s);
  assert.match(source, /getJapaneseMoraSoundCues\(word\)/);
  assert.match(source, /className="mora-pronunciation-beat"[\s\S]*data-active=\{activeBeatIndex === index \? "true" : undefined\}/);
  assert.match(styles, /\.mora-pronunciation\s*\{[^}]*display:\s*inline-flex[^}]*font-size:\s*0\.75rem/s);
  assert.doesNotMatch(styles, /\.mora-pronunciation\s*\{[^}]*gap:/s);
  assert.match(source, /getJapaneseMoraSoundCueSeparator\(morae, index\) === ""/);
  assert.match(source, /aria-label=\{getJapaneseWordSoundCue\(word\)\}/);
  assert.match(source, /data-connected=\{connected \? "true" : undefined\}/);
  assert.match(styles, /\.mora-pronunciation-beat \+ \.mora-pronunciation-beat:not\(\[data-connected="true"\]\)\s*\{[^}]*margin-left:\s*0\.35rem/s);
  assert.match(styles, /\.mora-pronunciation-beat\[data-active="true"\]\s*\{[^}]*color:\s*var\(--sound\)/s);
  assert.match(styles, /@media \(hover: hover\) and \(pointer: fine\)[\s\S]*\.mora-example:hover\s*\{[^}]*border-color:\s*rgb\(242 241 235 \/ 0\.22\)[^}]*background:\s*color-mix\(in srgb, var\(--surface\) 97%, var\(--foreground\)\)/s);
  assert.match(styles, /\.mora-review-answer-slot\s*\{[^}]*min-height:\s*3\.5rem/s);
  assert.doesNotMatch(styles, /\.mora-review-answer-slot \.mora-pronunciation\s*\{/);
  assert.match(styles, /\.mora-review-answer\s*\{[^}]*display:\s*flex[^}]*flex-direction:\s*column[^}]*gap:\s*0\.35rem/s);
  assert.match(source, /aria-labelledby="mora-practice-title" className="station-practice"[\s\S]*?<header className="mora-concept-heading">[\s\S]*?<h2 id="mora-practice-title">Practice words<\/h2>/);
  assert.doesNotMatch(styles, /\.mora-practice-heading/);
  assert.doesNotMatch(source, /These 10 words appear in the test|Learned words turn green/);
  assert.doesNotMatch(practiceSource, /mora-practice-progress|remainingCount|Complete\./);
  assert.match(styles, /\.station-practice\s*\{[^}]*width:\s*min\(100%, 38rem\)[^}]*margin-top:\s*2rem/s);
  assert.doesNotMatch(styles, /\.station-practice\s*\{[^}]*border-top:/s);
  assert.match(source, /MORA_REVIEW_CARDS\.map\(\(card\) =>[\s\S]*?knownReviews\.has\(card\.id\)[\s\S]*?aria-label=\{`Study \$\{card\.word\}\$\{isKnown \? ", marked known" : ""\}`\}[\s\S]*?onClick=\{\(\) => openReview\(\[card\]\)\}/);
  assert.match(practiceSource, /className="station-practice-word"[\s\S]*?<span lang="ja">\{card\.word\}<\/span>/);
  assert.doesNotMatch(practiceSource, /<MoraBeats|<MoraPronunciation|card\.meaning/);
  assert.match(styles, /\.station-practice-list\s*\{[^}]*grid-template-columns:\s*repeat\(2, minmax\(0, 1fr\)\)[^}]*column-gap:\s*0\.75rem[^}]*row-gap:\s*0\.25rem/s);
  assert.match(styles, /\.station-practice-word\s*\{[^}]*min-height:\s*3\.75rem[^}]*border:\s*0[^}]*font-size:\s*1\.35rem/s);
  assert.doesNotMatch(styles, /\.station-practice-word\s*\{[^}]*border-bottom:/s);
  assert.match(styles, /\.station-practice-word\[data-known="true"\]\s*\{[^}]*color:\s*var\(--known\)/s);
  assert.match(styles, /\.station-practice-word:hover\s*\{[^}]*color:\s*var\(--muted\)/s);
  assert.match(styles, /\.station-membership::before\s*\{[^}]*background:\s*currentColor[^}]*content:\s*""/s);
  assert.match(styles, /\.mora-example\[data-playing="true"\] \.mora-audio-indicator span\s*\{[^}]*animation:\s*hiragana-test-sound-pulse/s);
  assert.doesNotMatch(styles, /@media \(max-width: 600px\)[\s\S]*\.mora-example-list\s*\{/s);
  assert.match(schema, /moraTimingKnowledge = sqliteTable\(\s*"mora_timing_knowledge"/s);
  assert.match(repository, /listKnownMoraTimingReviews/);
  assert.match(repository, /setMoraTimingReviewKnown/);
  assert.match(repository, /setAllMoraTimingReviewsKnown/);
  assert.match(repository, /MORA_TIMING_REVIEW_IDS\.map\(\(reviewId\) =>/);
  assert.match(repository, /MORA_TIMING_REVIEW_IDS\.every\(\(reviewId\) =>/);
  assert.match(domain, /MORA_TIMING_REVIEW_IDS/);
  assert.deepEqual(reviewIds, domainIds);
  assert.match(introductionApi, /recordStationIntroduction\(user\.id, "mora-timing"\)/);
  assert.match(knowledgeApi, /isMoraTimingReviewId\(candidate\.reviewId\)/);
  assert.match(knowledgeApi, /export async function PATCH/);
  assert.match(knowledgeApi, /setAllMoraTimingReviewsKnown\(user\.id, body\.known\)/);
  assert.match(knowledgeApi, /body\.known \? MORA_TIMING_REVIEW_IDS : \[\]/);
  assert.match(knowledgeApi, /private, no-store/);
  assert.doesNotMatch(source, /microphone|speech evaluation|score|streak/i);

  for (const audioPath of new Set([...teachingAudioPaths, ...reviewAudioPaths])) {
    const audio = await readFile(new URL(`public${audioPath}`, root));
    assert.equal(audio.subarray(0, 4).toString("ascii"), "RIFF");
    assert.equal(audio.subarray(8, 12).toString("ascii"), "WAVE");
    assert.ok(wavDuration(audio) >= 0.1, `${audioPath} should not be clipped too short`);
  }
});

test("the Vowels station introduces both scripts through the five shared sounds", async () => {
  const source = await readFile(new URL("app/stations/vowels/vowels-guide.tsx", root), "utf8");
  const page = await readFile(new URL("app/stations/vowels/page.tsx", root), "utf8");
  const kanaPage = await readFile(new URL("app/stations/kana/page.tsx", root), "utf8");
  const api = await readFile(new URL("app/api/stations/vowels/introduction/route.ts", root), "utf8");
  const knowledgeApi = await readFile(
    new URL("app/api/stations/vowels/knowledge/route.ts", root),
    "utf8",
  );
  const repository = await readFile(new URL("src/modules/learning/repository.ts", root), "utf8");
  const vowels = await readFile(new URL("src/modules/learning/vowels.ts", root), "utf8");
  const styles = await readFile(new URL("app/styles/stations.css", root), "utf8");
  const vowelCards = source.slice(
    source.indexOf("const VOWEL_CARDS"),
    source.indexOf("const VOWEL_ROWS"),
  );
  const kana = [...vowelCards.matchAll(/kana: "([^"]+)"/g)].map((match) => match[1]);
  const scripts = [...vowelCards.matchAll(/script: "([^"]+)"/g)].map((match) => match[1]);
  const audioPaths = [...source.matchAll(/(?:audio|exampleAudio): "(\/audio\/ja-[^"]+\.wav)"/g)].map((match) => match[1]);

  assert.deepEqual(kana, ["あ", "い", "う", "え", "お", "ア", "イ", "ウ", "エ", "オ"]);
  assert.deepEqual(scripts, [
    "hiragana", "hiragana", "hiragana", "hiragana", "hiragana",
    "katakana", "katakana", "katakana", "katakana", "katakana",
  ]);
  assert.equal(audioPaths.length, 20);
  assert.equal(new Set(audioPaths).size, 15);
  assert.match(page, /dynamic = "force-static"/);
  assert.match(source, /data-line="writing"/);
  assert.match(kanaPage, /Kana is the collective name for Hiragana and Katakana/);
  assert.match(kanaPage, /used to write how Japanese words\s+sound/);
  assert.match(kanaPage, /Both sets represent the same sounds with different shapes/);
  assert.match(kanaPage, /Hiragana is used for everyday Japanese words and grammar/);
  assert.match(kanaPage, /Katakana is used mainly for borrowed words, foreign names/);
  assert.match(kanaPage, /href="\/stations\/vowels"/);
  assert.match(source, /Japanese Kana are built around five vowel sounds/);
  assert.match(source, /className="kana-table-intro"/);
  assert.doesNotMatch(`${source}${kanaPage}`, /Kanji is different|Kanji primarily carries meaning/);
  assert.match(source, /aria-label="The five Japanese vowels in Hiragana and Katakana"/);
  assert.match(source, /JAPANESE_ROMAJI_VOWELS\.map\(\(sound\) =>/);
  assert.doesNotMatch(source, /International Phonetic Alphabet|\bIPA\b/);
  assert.match(source, /className="hiragana-table kana-vowels-chart"/);
  assert.match(source, /VOWEL_ROWS\.map\(\(row\) =>/);
  assert.match(source, /onClick=\{\(\) => openTest\("Vowels", \[entry\]\)\}/);
  assert.match(source, /Test All Vowels\. \$\{remainingCount\} remaining\./);
  assert.match(source, /<StationOptions/);
  assert.match(source, /stationName="Vowels"/);
  assert.match(source, /onSetComplete=\{setAllKnowledge\}/);
  assert.match(source, /fetch\("\/api\/stations\/vowels\/knowledge"/);
  assert.match(source, /method: "PATCH"/);
  assert.match(source, /<FlashcardReview/);
  assert.match(source, /activeCard\.example/);
  assert.match(source, /activeCard\.translation/);
  assert.match(source, /fetch\("\/api\/stations\/vowels\/introduction"/);
  assert.match(source, /fetch\("\/api\/stations\/hiragana\/knowledge"/);
  assert.match(source, /fetch\("\/api\/stations\/katakana\/knowledge"/);
  assert.match(source, /fetch\(`\/api\/stations\/\$\{script\}\/knowledge`/);
  assert.match(source, /method: "PUT"/);
  assert.match(api, /recordStationIntroduction\(user\.id, "vowels"\)/);
  assert.match(knowledgeApi, /export async function PATCH/);
  assert.match(knowledgeApi, /setAllVowelsKnown\(user\.id, body\.known\)/);
  assert.match(knowledgeApi, /body\.known \? VOWEL_KANA : \[\]/);
  assert.match(knowledgeApi, /private, no-store/);
  assert.match(repository, /setAllVowelsKnown/);
  assert.match(repository, /inArray\(hiraganaKnowledge\.kana, VOWEL_HIRAGANA\)/);
  assert.match(repository, /inArray\(katakanaKnowledge\.kana, VOWEL_KATAKANA\)/);
  assert.match(vowels, /VOWEL_HIRAGANA = \["あ", "い", "う", "え", "お"\]/);
  assert.match(vowels, /VOWEL_KATAKANA = \["ア", "イ", "ウ", "エ", "オ"\]/);
  assert.match(styles, /\.hiragana-table\s*\{[^}]*width:\s*min\(100%, 32rem\)/s);
  assert.match(styles, /\.kana-intro\s*\{[^}]*display:\s*grid[^}]*gap:\s*0\.65rem/s);
  assert.doesNotMatch(source, /kana-study-table|kana-study-button|kana-pair/);
  assert.doesNotMatch(source, /<dl|<dt|<dd/);

  for (const audioPath of new Set(audioPaths)) {
    const audio = await readFile(new URL(`public${audioPath}`, root));
    assert.equal(audio.subarray(0, 4).toString("ascii"), "RIFF");
    assert.equal(audio.subarray(8, 12).toString("ascii"), "WAVE");
    assert.ok(wavDuration(audio) >= 0.1, `${audioPath} should not be clipped too short`);
  }
});

test("every station with tracked progress exposes the standard options menu", async () => {
  const stationOptions = await readFile(
    new URL("app/stations/station-options.tsx", root),
    "utf8",
  );
  const guides = await Promise.all([
    "app/stations/vowels/vowels-guide.tsx",
    "app/stations/hiragana/hiragana-guide.tsx",
    "app/stations/katakana/katakana-guide.tsx",
    "app/stations/kana-extensions/kana-extensions-guide.tsx",
    "app/stations/mora-timing/mora-timing-guide.tsx",
    "app/stations/pitch-accent/pitch-accent-guide.tsx",
  ].map((path) => readFile(new URL(path, root), "utf8")));

  for (const guide of guides) {
    assert.match(guide, /<StationOptions|<details className="station-options"/);
  }

  assert.match(stationOptions, /document\.addEventListener\("pointerdown", dismissStationOptions\)/);
  assert.match(stationOptions, /event\.key !== "Escape"/);
  assert.match(stationOptions, /aria-label="Close station options"/);
  assert.match(stationOptions, /Mark \{stationName\} complete\?/);
  assert.match(stationOptions, /Reset \{stationName\}\?/);
  assert.match(stationOptions, /await onSetComplete\(complete\)/);
});

test("the Hiragana station provides the complete basic chart with bundled audio", async () => {
  const source = await readFile(new URL("app/stations/hiragana/hiragana-guide.tsx", root), "utf8");
  const flashcardReview = await readFile(
    new URL("app/stations/flashcard-review.tsx", root),
    "utf8",
  );
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
  assert.match(source, /JAPANESE_ROMAJI_VOWELS\.map\(\(sound\) =>/);
  assert.match(source, /aria-label=\{`Column of sounds ending in \$\{sound\}`\}/);
  assert.doesNotMatch(source, /[あいうえお]段/);
  assert.doesNotMatch(source, /The next five sounds|Start with the first ten/);
  assert.doesNotMatch(source, /Hear them in words|hiragana-groups|hiragana-study-group/);
  assert.doesNotMatch(source, /\benglish: "/);
  assert.match(source, /あさ.*いぬ.*うみ.*えき.*おと/s);
  assert.match(source, /かさ.*きく.*くち.*けさ.*こえ/s);
  assert.match(source, /preload="none"/);
  assert.match(styles, /\.hiragana-table\s*\{[^}]*table-layout:\s*fixed/s);
  assert.match(styles, /\.hiragana-intro\s*\{[^}]*display:\s*grid[^}]*gap:\s*0\.65rem/s);
  assert.match(styles, /\.hiragana-button\s*\{[^}]*font-size:\s*1\.65rem/s);
  assert.match(source, /className="station-heading-row"/);
  assert.match(source, /data-line="writing"/);
  assert.match(source, /renderTestButton\("Hiragana", ALL_HIRAGANA_TEST_ENTRIES\)/);
  assert.match(source, /const remainingCount = total - knownCount/);
  assert.match(source, /remainingCount === 0 \? \([\s\S]*className="hiragana-test-complete-icon"/);
  assert.match(source, /data-complete=\{remainingCount === 0 \? "true" : undefined\}/);
  assert.match(source, /`Test \$\{title\}\. Complete\.`/);
  assert.match(source, /`Test \$\{title\}\. \$\{remainingCount\} remaining\.`/);
  assert.match(source, /className="network-tooltip hiragana-test-tooltip"/);
  assert.doesNotMatch(source, /title=\{testLabel\}/);
  assert.doesNotMatch(source, /expandedGroups|toggleStudyGroup|renderStudyKana/);
  assert.match(source, /aria-label="Station options"/);
  assert.match(source, /<div className="station-heading-actions">[\s\S]*<details className="station-options"[\s\S]*renderTestButton\("Hiragana"/);
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
  assert.equal((source.match(/className="hiragana-test-answer hiragana-test-answer-no"/g) ?? []).length, 2);
  assert.equal((source.match(/className="hiragana-test-answer hiragana-test-answer-yes"/g) ?? []).length, 1);
  assert.match(flashcardReview, /className="hiragana-test-answer hiragana-test-answer-no"/);
  assert.match(flashcardReview, /className="hiragana-test-answer hiragana-test-answer-yes"/);
  assert.match(source, /className="hiragana-test-answer station-confirm-reset"/);
  assert.equal((source.match(/className="hiragana-test-actions"/g) ?? []).length, 2);
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
  assert.match(styles, /\.hiragana-test-close\s*\{[^}]*width:\s*2rem[^}]*height:\s*2rem[^}]*border-radius:\s*50%[^}]*appearance:\s*none/s);
  assert.match(styles, /\.hiragana-test-close::before\s*\{[^}]*inset:\s*-0\.375rem[^}]*content:\s*""/s);
  assert.match(styles, /\.hiragana-test-close:focus-visible\s*\{[^}]*outline:\s*none[^}]*box-shadow:/s);
  assert.match(flashcardReview, /<span>Not Yet<\/span>/);
  assert.match(flashcardReview, /<span>Good<\/span>/);
  assert.equal((source.match(/className="hiragana-test-answer-icon"/g) ?? []).length, 4);
  assert.equal((flashcardReview.match(/className="hiragana-test-answer-icon"/g) ?? []).length, 2);
  assert.match(styles, /\.hiragana-test-answer-icon\s*\{[^}]*stroke:\s*currentcolor/s);
  assert.match(styles, /\.hiragana-test-answer-yes \.hiragana-test-answer-icon\s*\{[^}]*width:\s*1\.125rem[^}]*height:\s*1\.125rem[^}]*stroke-width:\s*2\.5/s);
  assert.match(styles, /\.hiragana-test-answer-no\s*\{[^}]*border-color:\s*var\(--sound\)[^}]*color:\s*var\(--foreground\)[^}]*background:\s*transparent/s);
  assert.match(styles, /\.hiragana-test-answer-no \.hiragana-test-answer-icon,\s*\.hiragana-test-answer-no \.hiragana-test-swipe-icon\s*\{[^}]*color:\s*var\(--sound\)/s);
  assert.match(styles, /\.hiragana-test-answer-no:hover\s*\{[^}]*border-color:\s*var\(--sound\)[^}]*background:\s*color-mix\(in srgb, var\(--sound\) 8%, transparent\)/s);
  assert.doesNotMatch(source, /Say the sound/);
  assert.doesNotMatch(styles, /\.hiragana-test-instruction/);
  assert.match(source, /setPronunciationRevealed\(true\)/);
  assert.match(source, /<FlashcardContent/);
  assert.match(source, /pronunciation=\{getJapaneseRomaji\(activeCard\.kana\)\}/);
  assert.match(source, /examplePronunciation=\{getJapaneseWordRomaji\(activeCard\.example\)\}/);
  assert.match(source, /revealed=\{pronunciationRevealed\}/);
  assert.match(source, /activeCard\.exampleAudio/);
  assert.match(flashcardReview, /revealed \? \([\s\S]*className="hiragana-test-example-word"[\s\S]*exampleMorae\.map[\s\S]*className="hiragana-test-example-beat"[\s\S]*className="hiragana-test-example-pronunciation"[\s\S]*examplePronunciationUnits\.map[\s\S]*className="hiragana-test-example-pronunciation-beat"[\s\S]*className="hiragana-test-example-translation"[\s\S]*\{translation\}[\s\S]*\) : \(/);
  assert.match(flashcardReview, /className="hiragana-test-answer-slot"[\s\S]*<FlashcardCountdown onComplete=\{onReveal\} \/>/);
  assert.match(flashcardReview, /aria-label=\{activationLabel\}[\s\S]*onClick=\{handleCardClick\}/);
  assert.doesNotMatch(flashcardReview, /onPlayKana/);
  assert.match(flashcardReview, /aria-label=\{`Play example word \$\{example\}`\}[\s\S]*onClick=\{onPlayExample\}/);
  assert.match(source, /kana: "ん"[^\n]*kanaAudio: "\/audio\/ja-n\.wav"/);
  assert.doesNotMatch(source, />English sound</);
  assert.match(source, /playing=\{audioPlaying\}/);
  assert.match(flashcardReview, /data-playing=\{playing \? "true" : undefined\}/);
  assert.match(source, /onEnded=\{handleAudioEnded\}/);
  assert.match(source, /onError=\{handleAudioError\}/);
  assert.match(styles, /\.hiragana-test-card\[data-playing="true"\][^}]*border-color:\s*var\(--sound\)/s);
  assert.match(styles, /@keyframes hiragana-test-sound-pulse/);
  assert.match(source, /data-known=\{isKnown \? "true" : undefined\}/);
  assert.match(source, /HIRAGANA_TEST_ENTRY_BY_KANA/);
  assert.match(source, /onClick=\{\(\) => openTest\("Hiragana", \[testEntry\]\)\}/);
  assert.doesNotMatch(source, /onClick=\{\(\) => openTest\("Hiragana", \[entry\]\)\}/);
  assert.match(source, /fetch\("\/api\/stations\/hiragana\/knowledge"/);
  assert.match(styles, /\.hiragana-button-known[\s\S]*color:\s*var\(--known\)/);
  assert.match(styles, /\.hiragana-test-card-with-example \.hiragana-test-reveal\s*\{[^}]*flex-direction:\s*column/s);
  assert.doesNotMatch(styles, /\.hiragana-test-card-with-example \.hiragana-test-reveal\s*\{[^}]*position:/s);
  assert.match(styles, /\.hiragana-test-card-with-example\s*\{[^}]*min-height:\s*16rem/s);
  assert.match(styles, /\.hiragana-test-example\s*\{[^}]*width:\s*fit-content[^}]*min-width:\s*2\.75rem[^}]*flex-direction:\s*column/s);
  assert.match(styles, /\.hiragana-test-answer-slot\s*\{[^}]*height:\s*4\.5rem[^}]*place-items:\s*center/s);
  assert.match(styles, /\.hiragana-test-example-pronunciation\s*\{[^}]*color:[^}]*font-size:\s*0\.75rem/s);
  assert.doesNotMatch(styles, /\.hiragana-test-example-reveal/);
  assert.match(styles, /\.hiragana-test-card-with-example \.hiragana-test-reveal\s*\{[^}]*width:\s*fit-content[^}]*align-self:\s*center/s);
  assert.doesNotMatch(styles, /\.hiragana-test-example\s*\{[^}]*border-top:/s);
  assert.doesNotMatch(styles, /\.hiragana-test-reveal:hover|\.hiragana-test-example:hover/);
  assert.match(styles, /\.hiragana-test-pronunciation:not\(\[data-revealed="true"\]\)\s*\{[^}]*visibility:\s*hidden/s);
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
  assert.doesNotMatch(source, /getJapaneseSoundCue|getJapaneseWordSoundCue|score|streak|timer/i);

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
  const exampleAudioPaths = [...source.matchAll(/exampleAudio: "(\/audio\/ja-[^"]+\.wav)"/g)].map((match) => match[1]);

  assert.equal(katakana.length, 46);
  assert.equal(new Set(katakana).size, 46);
  assert.equal(hiragana.length, 46);
  assert.equal(new Set(hiragana).size, 46);
  assert.equal(audioPaths.length, 46);
  assert.equal(exampleAudioPaths.length, 46);
  assert.match(page, /isStationAvailableToCurrentUser\("katakana"\)/);
  assert.match(source, /data-line="writing"/);
  assert.match(api, /recordStationIntroduction\(user\.id, "katakana"\)/);
  assert.match(api, /error: "station_unavailable"/);
  assert.match(api, /status: 403/);
  assert.match(source, /Katakana is another way to write the sounds you learned in Hiragana/);
  assert.match(source, /Each Katakana has a Hiragana match/);
  assert.match(source, /ア.*sounds like.*あ.*カ.*sounds like.*か/);
  assert.match(source, /Japanese uses both because they do different jobs in writing/);
  assert.match(source, /Hiragana is used for many Japanese words and for grammar/);
  assert.match(source, /Katakana is mainly used for words borrowed from other languages, foreign names, and sound effects/);
  assert.ok(
    source.indexOf("Katakana is another way") < source.indexOf("Japanese uses both"),
    "the station should introduce Katakana before explaining why Japanese uses both systems",
  );
  assert.doesNotMatch(source, /Same sounds, different shapes|Why do they look different|This is the base chart/);
  assert.doesNotMatch(source, /station-notes/);
  assert.match(source, /aria-label="The 46 basic Katakana"/);
  assert.match(source, /fetch\("\/api\/stations\/katakana\/introduction"/);
  assert.match(source, /JAPANESE_ROMAJI_VOWELS\.map\(\(sound\) =>/);
  assert.match(source, /aria-label=\{`Column of sounds ending in \$\{sound\}`\}/);
  assert.match(source, /className="hiragana-table katakana-table"/);
  assert.match(source, /className=\{`hiragana-button katakana-button/);
  assert.doesNotMatch(source, /katakana-character|katakana-match/);
  assert.doesNotMatch(source, /Its Hiragana match and approximate sound spelling appear underneath/);
  assert.match(source, /renderTestButton\("Katakana", ALL_KATAKANA_TEST_ENTRIES\)/);
  assert.match(source, /KATAKANA_ROWS\.flatMap\(\(row\) => row\.filter\(isKanaEntry\)\)/);
  assert.doesNotMatch(source, /Connect the shapes|KATAKANA_STUDY_GROUPS|KATAKANA_GROUP_DEFINITIONS/);
  assert.doesNotMatch(source, /expandedGroups|toggleStudyGroup|renderStudyKatakana/);
  assert.doesNotMatch(source, /katakana-study-table|katakana-study-match/);
  assert.match(source, /aria-labelledby="katakana-test-title"/);
  assert.doesNotMatch(source, /Say the sound/);
  assert.match(source, /<FlashcardReview/);
  assert.match(source, /<FlashcardContent/);
  assert.match(source, /example=\{activeCard\.example\}/);
  assert.match(source, /examplePronunciation=\{getJapaneseWordRomaji\(activeCard\.example\)\}/);
  assert.match(source, /playAudio\(\{ index: 0, src: activeCard\.audio \}\)/);
  assert.match(source, /function playExample\(\)[\s\S]*splitJapaneseMorae\(activeCard\.example\)\.length[\s\S]*index: 1[\s\S]*activeCard\.exampleAudio/);
  assert.match(source, /onActivate=\{activateCard\}/);
  assert.match(source, /onReveal=\{activateCard\}/);
  assert.match(source, /pronunciation=\{getJapaneseRomaji\(activeCard\.katakana\)\}/);
  assert.doesNotMatch(source, /\bsound: "/);
  assert.match(source, /translation=\{activeCard\.translation\}/);
  assert.match(source, /Example: \$\{activeCard\.example\}, \$\{getJapaneseWordRomaji\(activeCard\.example\)\}, \$\{activeCard\.translation\}/);
  assert.match(source, /example: "アニメ"[\s\S]*translation: "anime"/);
  assert.match(source, /example: "ケア"[\s\S]*translation: "care"/);
  assert.match(source, /example: "ワイン"[\s\S]*translation: "wine"/);
  assert.match(source, /playing=\{audioPlaying\}/);
  assert.match(source, /aria-labelledby="katakana-complete-title"/);
  assert.match(source, /aria-labelledby="katakana-reset-title"/);
  assert.match(source, /fetch\("\/api\/stations\/katakana\/knowledge"/);
  assert.match(source, /data-known=\{isKnown \? "true" : undefined\}/);
  assert.match(source, /onClick=\{\(\) => openTest\("Katakana", \[kana\]\)\}/);
  assert.doesNotMatch(source, /onClick=\{\(\) => openTest\("Katakana", \[entry\]\)\}/);
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
  assert.doesNotMatch(source, /getJapaneseSoundCue|getJapaneseWordSoundCue|score|streak|timer/i);

  for (const audioPath of [...audioPaths, ...exampleAudioPaths]) {
    const audio = await readFile(new URL(`public${audioPath}`, root));
    assert.equal(audio.subarray(0, 4).toString("ascii"), "RIFF");
    assert.equal(audio.subarray(8, 12).toString("ascii"), "WAVE");
    assert.ok(wavDuration(audio) >= 0.1, `${audioPath} should not be clipped too short`);
  }
});
