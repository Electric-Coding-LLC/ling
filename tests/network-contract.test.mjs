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

test("the network uses a vertical Foundations spine with horizontal depth", async () => {
  const source = await readFile(new URL("app/network-map.tsx", root), "utf8");
  const visuals = await readFile(new URL("app/network-visuals.tsx", root), "utf8");
  const page = await readFile(new URL("app/page.tsx", root), "utf8");
  const styles = await readFile(new URL("app/styles/network.css", root), "utf8");
  const stationStyles = await readFile(new URL("app/styles/stations.css", root), "utf8");
  const foundation = await readFile(
    new URL("app/styles/foundation.css", root),
    "utf8",
  );

  assert.match(source, /NETWORK_ROW_GAP\s*=\s*180/);
  assert.match(source, /NETWORK_COLUMN_GAP\s*=\s*180/);
  assert.doesNotMatch(source, /BRANCH_TURN_OFFSET/);
  assert.match(source, /JAPAN_BRANCH_HALF_SPAN\s*=\s*160/);
  assert.match(source, /WRITING_BRANCH_HALF_SPAN\s*=\s*70/);
  assert.match(source, /NETWORK_BOTTOM_PADDING\s*=\s*150/);
  assert.match(source, /DESKTOP_VIEW_WIDTH\s*=\s*1500/);
  assert.match(source, /NETWORK_MAX_DEPTH\s*=\s*8/);
  assert.match(
    source,
    /DESKTOP_CONTENT_WIDTH\s*=\s*DESKTOP_SPINE_X\s*\+ NETWORK_COLUMN_GAP \* NETWORK_MAX_DEPTH\s*\+ DESKTOP_VIEW_WIDTH \/ 2/,
  );
  assert.match(
    source,
    /MOBILE_CONTENT_WIDTH\s*=\s*MOBILE_SPINE_X\s*\+ NETWORK_COLUMN_GAP \* NETWORK_MAX_DEPTH\s*\+ MOBILE_VIEW_WIDTH \/ 2/,
  );
  assert.doesNotMatch(source, /VOCABULARY_COLUMN_GAP/);
  assert.match(source, /DESKTOP_SPINE_X\s*=\s*\(DESKTOP_VIEW_WIDTH - NETWORK_COLUMN_GAP\) \/ 2/);
  assert.match(source, /MOBILE_SPINE_X\s*=\s*MOBILE_VIEW_WIDTH \/ 2/);
  assert.match(source, /ROMAJI_Y\s*=\s*ROOT_Y \+ NETWORK_ROW_GAP/);
  assert.match(source, /FOUNDATIONS_TITLE_Y\s*=\s*76/);
  assert.match(source, /ROOT_Y\s*=\s*FOUNDATIONS_TITLE_Y \+ 53/);
  assert.match(source, /JAPAN_Y\s*=\s*ROMAJI_Y \+ NETWORK_ROW_GAP/);
  assert.match(source, /SOUND_Y\s*=\s*JAPAN_Y \+ JAPAN_BRANCH_HALF_SPAN \+ NETWORK_ROW_GAP/);
  assert.match(source, /CATEGORY_ROW_GAP\s*=\s*NETWORK_ROW_GAP \* 1\.5/);
  assert.match(source, /KANA_Y\s*=\s*SOUND_Y \+ CATEGORY_ROW_GAP/);
  assert.match(source, /KANJI_Y\s*=\s*KANA_Y \+ CATEGORY_ROW_GAP/);
  assert.match(source, /VOCABULARY_Y\s*=\s*KANJI_Y \+ CATEGORY_ROW_GAP/);
  assert.match(source, /GRAMMAR_Y\s*=\s*VOCABULARY_Y \+ CATEGORY_ROW_GAP/);
  assert.match(source, /NETWORK_VIEW_HEIGHT\s*=\s*GRAMMAR_Y \+ NETWORK_BOTTOM_PADDING/);
  assert.match(source, /const depthOneX = spineX \+ NETWORK_COLUMN_GAP/);
  assert.match(source, /const depthTwoX = depthOneX \+ NETWORK_COLUMN_GAP/);
  assert.match(source, /const depthThreeX = depthTwoX \+ NETWORK_COLUMN_GAP/);
  assert.match(source, /Foundations learning network/);
  assert.match(source, /Scroll down the Foundations spine/);
  assert.match(source, /d=\{`M\$\{spineX\} \$\{ROOT_Y \+ 30\}V\$\{GRAMMAR_Y\}`\}/);
  assert.match(source, /label="Foundations"[\s\S]*line="foundation"/);
  assert.match(
    source,
    /d=\{`M\$\{spineX\} \$\{VOCABULARY_Y\}H\$\{vocabularyDepthSevenX\}`\}[\s\S]*label="Vocabulary"[\s\S]*d=\{`M\$\{spineX\} \$\{GRAMMAR_Y\}H\$\{grammarDepthEightX\}`\}[\s\S]*label="Grammar"[\s\S]*d=\{`M\$\{spineX\} \$\{ROOT_Y \+ 30\}V\$\{GRAMMAR_Y\}`\}[\s\S]*label="Foundations"[\s\S]*\{keyboardTravel/,
    "the Foundations spine should paint above route overlaps and below station feedback",
  );

  for (const [focus, label, line] of [
    ["japan", "Japan", "travel"],
    ["sound", "Sound", "sound"],
    ["kana", "Kana", "writing"],
    ["kanji", "Kanji", "kanji"],
    ["vocabulary", "Vocabulary", "vocabulary"],
    ["grammar", "Grammar", "grammar"],
  ]) {
    assert.match(
      source,
      new RegExp(`<CategoryStation \\{\\.\\.\\.categoryStatus\\("${focus}"\\)\\} backlightId=\\{backlightId\\} focus="${focus}" label="${label}" line="${line}"[^\\n]*href="/stations/${focus}"`),
    );
  }
  assert.match(source, /data-category-station=\{line\}/);
  assert.match(
    source,
    /data-network-focus=\{href \? undefined : focus\}[\s\S]*onFocus=\{href \? undefined : onFocus\}[\s\S]*tabIndex=\{href \? undefined : -1\}/,
  );
  assert.match(source, /fill=\{`url\(#\$\{backlightId\}-\$\{line\}\)`\}[\s\S]*r="58"/);
  assert.match(source, /<NetworkStationSymbol completed=\{completed\} kind=\{line\} \/>/);
  assert.match(source, /className="network-station-label network-station-label-left"/);
  assert.match(source, /textAnchor="end"[\s\S]*x="-34"[\s\S]*\{label\}/);
  assert.match(
    source,
    /className="network-station-label network-foundation-title"[\s\S]*textAnchor="middle"[\s\S]*x=\{spineX\}[\s\S]*y=\{FOUNDATIONS_TITLE_Y\}[\s\S]*Foundations/,
  );
  assert.doesNotMatch(source, /network-category-junction|<rect/);
  assert.doesNotMatch(source, /network-line-label/);

  assert.match(source, /\{japanPeerYs\.map\(\(peerY\) =>/);
  assert.match(
    source,
    /const japanPeerYs = mobile[\s\S]*JAPAN_Y - JAPAN_BRANCH_HALF_SPAN,[\s\S]*JAPAN_Y \+ JAPAN_BRANCH_HALF_SPAN,[\s\S]*: \[JAPAN_Y - 128, JAPAN_Y - 64, JAPAN_Y, JAPAN_Y \+ 64, JAPAN_Y \+ 128\] as const/,
  );
  assert.match(source, /const writingUpperY = KANA_Y - WRITING_BRANCH_HALF_SPAN/);
  assert.match(source, /const writingLowerY = KANA_Y \+ WRITING_BRANCH_HALF_SPAN/);
  assert.doesNotMatch(source, /writingFinalUpperY|writingFinalLowerY|mergeX/);
  assert.match(source, /d=\{`M\$\{spineX\} \$\{KANA_Y\}L\$\{depthOneX\} \$\{writingUpperY\}`\}/);
  assert.match(source, /d=\{`M\$\{spineX\} \$\{KANA_Y\}L\$\{depthOneX\} \$\{writingLowerY\}`\}/);
  assert.match(source, /d=\{`M\$\{depthOneX\} \$\{writingUpperY\}L\$\{depthTwoX\} \$\{KANA_Y\}`\}/);
  assert.match(source, /d=\{`M\$\{depthOneX\} \$\{writingLowerY\}L\$\{depthTwoX\} \$\{KANA_Y\}`\}/);
  assert.doesNotMatch(source, /roundedConvergingPath/);
  assert.match(source, /d=\{`M\$\{depthTwoX\} \$\{KANA_Y\}H\$\{depthThreeX\}`\}/);
  assert.match(source, /d=\{`M\$\{spineX\} \$\{KANJI_Y\}H\$\{depthThreeX\}`\}/);
  assert.match(source, /focus="hiragana"[\s\S]*x=\{depthOneX\} y=\{writingUpperY\}/);
  assert.match(source, /focus="katakana"[\s\S]*x=\{depthOneX\} y=\{writingLowerY\}/);
  assert.match(source, /focus="marks"[\s\S]*x=\{depthTwoX\} y=\{KANA_Y\}/);
  assert.match(source, /focus="combined"[\s\S]*x=\{depthThreeX\} y=\{KANA_Y\}/);
  assert.match(source, /focus="characters"[\s\S]*x=\{depthOneX\} y=\{KANJI_Y\}/);
  assert.match(source, /focus="compounds"[\s\S]*x=\{depthTwoX\} y=\{KANJI_Y\}/);
  assert.match(source, /focus="endings"[\s\S]*x=\{depthThreeX\} y=\{KANJI_Y\}/);
  assert.match(source, /const japanStationX = depthOneX/);
  assert.match(source, /d=\{`M\$\{spineX\} \$\{JAPAN_Y\}L\$\{japanStationX\} \$\{peerY\}`\}/);
  assert.doesNotMatch(source, /roundedBranchPath|writingForkX/);
  assert.doesNotMatch(source, /roundedHubRoutePath|japanTurnX/);
  assert.doesNotMatch(source, /Japan territory|Sound territory|Kana territory|Kanji territory|Vocabulary territory/);
  assert.doesNotMatch(source, /<title>Foundations<\/title>/);
  assert.doesNotMatch(source, /japanForkX|japanBranchStartX|outerRoute/);
  assert.match(
    source,
    /style=\{\{[\s\S]*width: `\$\{\([\s\S]*width \/ \(mobile \? MOBILE_VIEW_WIDTH : DESKTOP_VIEW_WIDTH\)[\s\S]*\) \* 100\}%`/,
  );
  assert.match(source, /className=\{`network-line network-line-\$\{line\}`\}/);
  assert.match(styles, /\.network-line\s*\{[^}]*stroke-width:\s*6[^}]*stroke-linecap:\s*round[^}]*stroke-linejoin:\s*round/s);
  assert.match(styles, /\.network-line\s*\{[^}]*vector-effect:\s*non-scaling-stroke/s);
  assert.match(styles, /\.network-line-foundation\s*\{[^}]*stroke:\s*var\(--foreground\)[^}]*stroke-width:\s*6/s);
  assert.match(styles, /\.network-station-label\s*\{[^}]*font-size:\s*20px/s);
  assert.match(
    styles,
    /\.network-foundation-title\s*\{[^}]*font-size:\s*24px[^}]*font-weight:\s*600/s,
  );
  assert.match(styles, /@media \(max-width: 600px\)[\s\S]*\.network-station-label\s*\{[^}]*font-size:\s*18px/s);
  assert.match(
    styles,
    /@media \(max-width: 600px\)[\s\S]*\.network-foundation-title\s*\{[^}]*font-size:\s*22px/s,
  );
  assert.match(
    styles,
    /@media \(max-width: 600px\)[\s\S]*\.network-map-mobile \.network-single-station-outer,[\s\S]*?\.network-map-mobile \.network-single-station-inner\s*\{[^}]*r:\s*16px/s,
  );
  assert.match(visuals, /network-interchange-inner/);
  assert.match(visuals, /network-single-station-inner/);
  assert.match(
    styles,
    /@media \(max-width: 600px\)[\s\S]*\.network-map-mobile \.network-interchange-outer,[\s\S]*?\.network-map-mobile \.network-interchange-inner\s*\{[^}]*r:\s*20px/s,
  );
  assert.match(styles, /\.network-interchange-outer\s*\{[^}]*fill:\s*var\(--surface\)[^}]*stroke-width:\s*22/s);
  assert.match(styles, /\.network-single-station-outer\s*\{[^}]*fill:\s*var\(--surface\)[^}]*stroke-width:\s*22/s);
  assert.match(
    styles,
    /\.network-interchange-outer,[\s\S]*?\.network-single-station-inner\s*\{[^}]*vector-effect:\s*non-scaling-stroke/s,
  );
  for (const line of ["sound", "writing", "kanji", "vocabulary", "grammar", "travel"]) {
    assert.match(
      styles,
      new RegExp(`\\.network-single-station-outer-${line}\\s*\\{[^}]*stroke:\\s*var\\(--${line}\\)`),
    );
  }
  for (const line of ["sound", "writing", "kanji", "vocabulary", "grammar", "travel"]) {
    assert.match(
      styles,
      new RegExp(`\\.network-single-station-inner-${line}[\\s\\S]*?--network-station-inner-color:\\s*var\\(--${line}\\)`),
    );
  }
  assert.match(
    styles,
    /\.network-single-station-inner\s*\{[^}]*fill:\s*var\(--network-station-inner-color\)[^}]*stroke:\s*var\(--surface\)[^}]*stroke-width:\s*11[^}]*paint-order:\s*stroke fill/s,
  );
  assert.match(
    styles,
    /@media \(max-width: 600px\)[\s\S]*\.network-map-mobile \.network-station-label-left\s*\{[^}]*transform:\s*translateX\(-6px\)[\s\S]*\.network-map-mobile \.network-station-label-right\s*\{[^}]*transform:\s*translateX\(9px\)[\s\S]*\.network-map-mobile \.network-station-label-above\s*\{[^}]*transform:\s*translateY\(-6px\)[\s\S]*\.network-map-mobile \.network-station-label-below\s*\{[^}]*transform:\s*translateY\(17px\)[\s\S]*\.network-map-mobile \.network-station-label-below-right\s*\{[^}]*transform:\s*translate\(9px, 17px\)/s,
  );
  assert.doesNotMatch(styles, /\[data-station="sound-marks"\] \.network-station-label-above/);
  assert.match(
    styles,
    /\.network-topbar\s*\{[^}]*position:\s*sticky[^}]*z-index:\s*20[^}]*top:\s*0[^}]*background:\s*var\(--surface\)/s,
  );
  assert.match(styles, /\.network-home\s*\{[^}]*overflow-x:\s*clip/s);
  assert.doesNotMatch(styles, /\.network-home\s*\{[^}]*overflow:\s*hidden/s);

  assert.match(source, /focus="japanese" hideLabel kind="interchange" labelPlacement="left"/);
  assert.match(source, /focus="romaji" kind="foundation" labelPlacement="left"/);
  assert.match(source, /focus="pointing" kind="vocabulary"/);
  assert.match(source, /focus="descriptions" kind="vocabulary"/);
  assert.match(source, /focus="statements" kind="grammar"/);
  assert.match(source, /focus="adjectives" kind="grammar"/);
  assert.match(source, /type CategoryFocus = "grammar" \| "japan" \| "kana" \| "kanji" \| "sound" \| "vocabulary"/);
  assert.match(source, /type LinkedStationFocus = Exclude<StationFocus, CategoryFocus>/);
  assert.match(source, /ROUTABLE_STATION_HREFS: Record<LinkedStationFocus, string>/);
  assert.match(source, /if \(focus === "visit"\) return "japan"/);
  assert.match(source, /if \(focus === "writing"\) return "kana"/);
  assert.match(source, /return isNetworkPlaceId\(focus\) \? focus : null/);
  assert.match(
    source,
    /<CategoryStation[\s\S]*focus="japan"[\s\S]*href="\/stations\/japan"/,
  );
  assert.match(
    source,
    /\{href \? <circle className="network-station-hit" r="48" \/> : null\}/,
  );
  assert.equal(
    (source.match(/<circle className="network-station-hit" r="48" \/>/g) ?? []).length,
    2,
  );
  assert.match(styles, /\.network-station-hit\s*\{[^}]*fill:\s*transparent/s);

  for (const [focus, href] of Object.entries({
    japanese: "/stations/japanese",
    romaji: "/stations/romaji",
    introductions: "/stations/introductions",
    navigation: "/stations/navigation",
    food: "/stations/food",
    shopping: "/stations/shopping",
    help: "/stations/help",
    vowels: "/stations/vowels",
    mora: "/stations/mora-timing",
    pitch: "/stations/pitch-accent",
    hiragana: "/stations/hiragana",
    katakana: "/stations/katakana",
    marks: "/stations/sound-marks",
    combined: "/stations/combined-sounds",
    characters: "/stations/characters",
    compounds: "/stations/compounds",
    endings: "/stations/endings",
    pointing: "/stations/pointing",
    people: "/stations/people",
    needs: "/stations/needs",
    movement: "/stations/movement",
    time: "/stations/time",
    actions: "/stations/actions",
    descriptions: "/stations/descriptions",
    statements: "/stations/statements",
    questions: "/stations/questions",
    possession: "/stations/possession",
    existence: "/stations/existence",
    verbs: "/stations/verbs",
    tense: "/stations/tense",
    negation: "/stations/negation",
    adjectives: "/stations/adjectives",
  })) {
    assert.match(source, new RegExp(`${focus}:\\s*"${href}"`));
    assert.match(source, new RegExp(`focus="${focus}"`));
  }

  assert.doesNotMatch(source, /focus="nouns"|label="Phrasing"/);
  assert.match(source, /japanese:\s*\{ ArrowDown: "romaji" \}/);
  assert.match(source, /romaji:\s*\{ ArrowDown: "japan", ArrowUp: "japanese" \}/);
  assert.match(source, /japan:\s*\{ ArrowDown: "sound", ArrowRight: "food", ArrowUp: "romaji" \}/);
  assert.match(source, /help:\s*\{ ArrowLeft: "japan", ArrowUp: "shopping" \}/);
  assert.match(source, /sound:\s*\{ ArrowDown: "kana", ArrowRight: "vowels", ArrowUp: "japan" \}/);
  assert.match(source, /vowels:\s*\{ ArrowLeft: "sound", ArrowRight: "mora" \}/);
  assert.match(source, /mora:\s*\{ ArrowLeft: "vowels", ArrowRight: "pitch" \}/);
  assert.match(source, /pitch:\s*\{ ArrowLeft: "mora" \}/);
  assert.match(source, /kana:\s*\{ ArrowDown: "kanji", ArrowRight: "hiragana", ArrowUp: "sound" \}/);
  assert.match(source, /hiragana:\s*\{ ArrowDown: "katakana", ArrowLeft: "kana", ArrowRight: "marks" \}/);
  assert.match(source, /kanji:\s*\{ ArrowDown: "vocabulary", ArrowRight: "characters", ArrowUp: "kana" \}/);
  assert.match(source, /characters:\s*\{ ArrowLeft: "kanji", ArrowRight: "compounds", ArrowUp: "katakana" \}/);
  assert.match(source, /compounds:\s*\{ ArrowLeft: "characters", ArrowRight: "endings", ArrowUp: "marks" \}/);
  assert.match(source, /endings:\s*\{ ArrowLeft: "compounds", ArrowUp: "marks" \}/);
  assert.match(source, /katakana:\s*\{ ArrowDown: "characters", ArrowLeft: "kana", ArrowRight: "marks", ArrowUp: "hiragana" \}/);
  assert.match(source, /marks:\s*\{ ArrowDown: "compounds", ArrowLeft: "hiragana", ArrowRight: "combined", ArrowUp: "hiragana" \}/);
  assert.match(source, /combined:\s*\{ ArrowDown: "endings", ArrowLeft: "marks" \}/);
  assert.match(source, /vocabulary:\s*\{ ArrowDown: "grammar", ArrowRight: "pointing", ArrowUp: "kanji" \}/);
  assert.match(source, /pointing:\s*\{ ArrowDown: "statements", ArrowLeft: "vocabulary", ArrowRight: "people" \}/);
  assert.match(source, /descriptions:\s*\{ ArrowDown: "negation", ArrowLeft: "actions" \}/);
  assert.match(source, /grammar:\s*\{ ArrowRight: "statements", ArrowUp: "vocabulary" \}/);
  assert.match(source, /statements:\s*\{ ArrowLeft: "grammar", ArrowRight: "questions", ArrowUp: "pointing" \}/);
  assert.match(source, /adjectives:\s*\{ ArrowLeft: "negation" \}/);
  assert.match(
    styles,
    /\.network-desktop-viewport\s*\{[^}]*overflow-x:\s*auto[^}]*overflow-y:\s*clip[^}]*overscroll-behavior-x:\s*contain[^}]*scrollbar-width:\s*none/s,
  );
  assert.match(styles, /\.network-desktop-viewport::\-webkit-scrollbar\s*\{[^}]*display:\s*none/s);
  assert.match(
    styles,
    /\.network-mobile-viewport\s*\{[^}]*overflow-x:\s*auto[^}]*overflow-y:\s*clip[^}]*overscroll-behavior-x:\s*contain[^}]*scrollbar-width:\s*none[^}]*touch-action:\s*pan-x pan-y/s,
  );
  assert.match(styles, /\.network-mobile-viewport::\-webkit-scrollbar\s*\{[^}]*display:\s*none/s);
  assert.doesNotMatch(
    source,
    /MOBILE_SWIPE_THRESHOLD|pointerStart|dragged|function onPointer(?:Down|Move|Up|Cancel)|onPointer(?:Down|Move|Up|Cancel)=\{onPointer/,
  );
  assert.doesNotMatch(styles, /network-mobile-track|translateX\(-(?:28|60|95)%\)/);
  assert.match(
    source,
    /const keyboardScrollPending = useRef\(false\)/,
  );
  assert.match(
    source,
    /smoothKeyboardScroll = keyboardScrollPending\.current[\s\S]*prefers-reduced-motion: reduce[\s\S]*keyboardScrollPending\.current = false[\s\S]*target\.scrollIntoView\(\{[\s\S]*behavior:\s*smoothKeyboardScroll \? "smooth" : "auto"[\s\S]*block:\s*"center"[\s\S]*inline:\s*"center"/,
  );
  assert.match(
    source,
    /function moveSelection\([\s\S]*keyboardScrollPending\.current = true[\s\S]*startStationTravel\(focus\)/,
  );
  assert.match(source, /focus\(\{ preventScroll: true \}\)/);
  assert.match(source, /NETWORK_LOCATION_STORAGE_KEY/);
  assert.match(source, /useSyncExternalStore\(\s*subscribeToStoredStationFocus,\s*getStoredStationFocus,\s*getServerStationFocus/s);
  assert.match(source, /new URLSearchParams\(window\.location\.search\)\.get\("focus"\)/);
  assert.match(source, /function onKeyDown\(event: KeyboardEvent<HTMLDivElement>\)/);
  assert.match(source, /const NETWORK_ROUTE_EDGES:[\s\S]*\["japanese", "romaji"\][\s\S]*\["sound", "kana"\][\s\S]*\["kana", "kanji"\][\s\S]*\["kanji", "vocabulary"\][\s\S]*\["kana", "hiragana"\][\s\S]*\["kana", "katakana"\][\s\S]*\["hiragana", "marks"\][\s\S]*\["katakana", "marks"\][\s\S]*\["kanji", "characters"\][\s\S]*\["characters", "compounds"\][\s\S]*\["compounds", "endings"\][\s\S]*\["vocabulary", "pointing"\][\s\S]*\["actions", "descriptions"\][\s\S]*\["vocabulary", "grammar"\][\s\S]*\["grammar", "statements"\][\s\S]*\["negation", "adjectives"\]/);
  assert.doesNotMatch(source, /\["(?:hiragana|katakana)", "kanji"\]|\["kanji", "marks"\]/);
  assert.match(source, /function findNetworkRoute\(from: StationFocus, to: StationFocus\)/);
  assert.doesNotMatch(source, /ROUNDED_WRITING_EDGES|roundedWritingCommands/);
  assert.match(source, /function getKeyboardTravelPath\([\s\S]*findNetworkRoute\(from, to\)[\s\S]*d \+= `L\$\{positions\[current\]\.x\} \$\{positions\[current\]\.y\}`/);
  assert.match(source, /const NETWORK_TRAVEL_DURATION_MS = 320/);
  assert.match(source, /function startStationTravel\(focus: StationFocus\)[\s\S]*if \(focus === stationFocus\) return[\s\S]*setKeyboardTravel\(\{ from: stationFocus, id: keyboardTravelId\.current, to: focus \}\)/);
  assert.doesNotMatch(source, /function activateStation\(/);
  assert.match(source, /setTimeout\([\s\S]*360\);/);
  assert.match(source, /<KeyboardTravelCapsule[\s\S]*d=\{keyboardTravelPath\}[\s\S]*id=\{keyboardTravel\.id\}/);
  assert.match(source, /new MouseEvent\("click", \{ bubbles: true, cancelable: true, view: window \}\)/);
  assert.equal((source.match(/aria-label="Explore the network with the arrow keys"/g) ?? []).length, 1);
  assert.match(source, /aria-label="Pan across the network or explore with the arrow keys"/);
  assert.match(source, /document\.activeElement !== document\.body/);
  assert.match(source, /window\.matchMedia\("\(max-width: 600px\)"\)\.matches/);
  assert.match(source, /`\[data-network-focus="\$\{focus\}"\]`/);
  assert.match(source, /"\[data-network-focus\]:focus"/);
  assert.match(source, /selectedTarget instanceof SVGAElement/);
  assert.match(source, /<NavigationLink[\s\S]*className="network-station-link"[\s\S]*href=\{ROUTABLE_STATION_HREFS\[focus\]\}[\s\S]*loadingStation=\{label\}[\s\S]*prefetch/);
  assert.equal((source.match(/navigationDelayMs=\{selected \? 0 : NETWORK_TRAVEL_DURATION_MS\}/g) ?? []).length, 2);
  assert.equal((source.match(/onClick=\{onActivate\}/g) ?? []).length, 2);
  assert.equal((source.match(/onNavigationCommit=\{onFocus\}/g) ?? []).length, 2);
  assert.equal((source.match(/event\.currentTarget\.matches\(":focus-visible"\)/g) ?? []).length, 2);
  assert.doesNotMatch(source, /<NavigationLink[\s\S]{0,420}className="network-station-link"[\s\S]{0,420}onFocus=\{onFocus\}/);
  assert.equal((source.match(/data-active=\{active \|\| undefined\}/g) ?? []).length, 2);
  assert.match(source, /const sharedViewProps = \{\s*activeFocus: stationFocus,[\s\S]*onStationActivate: startStationTravel/);
  assert.match(source, /selectedFocus: stationFocus/);
  assert.match(
    styles,
    /\.network-station-link\[data-active="true"\]\s*:is\([\s\S]*\.network-interchange-inner,[\s\S]*\.network-single-station-inner[\s\S]*animation:\s*network-station-inner-pulse 2s ease-in-out infinite/,
  );
  assert.doesNotMatch(styles, /\.network-station-link\[data-visited="false"\]\s*\{[^}]*opacity:/s);
  assert.match(
    styles,
    /\.network-station-link\[data-visited="false"\]\s*:is\([\s\S]*\.network-interchange-inner,[\s\S]*\.network-single-station-inner[\s\S]*fill:\s*color-mix\(in srgb, var\(--network-station-inner-color\) 45%, var\(--surface\)\)/,
  );
  assert.doesNotMatch(
    styles,
    /\.network-station-link\[data-visited="false"\]\s*:is\([\s\S]*?\)\s*\{[^}]*stroke:/,
  );
  assert.match(
    styles,
    /\.network-station-link\[data-visited="false"\]:is\(:hover, :focus-visible\)\s*:is\([\s\S]*fill:\s*var\(--network-station-inner-color\)/,
  );
  assert.match(source, /fetch\("\/api\/network\/places"/);
  assert.match(source, /const currentLocationLabel = `Show current location: \$\{STATION_LABELS\[storedStationFocus\]\}`/);
  assert.match(source, /aria-describedby="network-location-tooltip"[\s\S]*aria-label=\{currentLocationLabel\}/);
  assert.match(source, /function showCurrentLocation\(\)[\s\S]*scrollIntoView\(\{[\s\S]*inline:\s*"center"/);
  assert.match(source, /className="network-utilities"[\s\S]*className="network-location-button"[\s\S]*className="network-help-link"/);
  assert.match(source, /<circle cx="12" cy="12" r="7" \/>[\s\S]*network-location-target-dot/);
  assert.match(source, /className="network-tooltip hiragana-test-tooltip" id="network-location-tooltip" role="tooltip"/);
  assert.match(source, /id="network-location-tooltip" role="tooltip">\s*Current location/);
  assert.match(source, /aria-describedby="network-help-tooltip"[\s\S]*aria-label="About Ling"/);
  assert.match(source, /className="network-tooltip hiragana-test-tooltip" id="network-help-tooltip" role="tooltip"/);
  assert.doesNotMatch(source, /title="(?:Show current location|About Ling)"/);
  assert.doesNotMatch(source, /network-location-controls/);
  assert.doesNotMatch(styles, /\.network-location-controls/);
  assert.match(styles, /\.network-utilities\s*\{[^}]*display:\s*flex[^}]*gap:\s*0[^}]*margin-inline-end:\s*-0\.5rem/s);
  assert.doesNotMatch(styles, /\.network-location-button\s*\{[^}]*position:\s*fixed/s);
  assert.match(
    styles,
    /\.network-location-button\s*\{[^}]*width:\s*2\.75rem[^}]*height:\s*2\.75rem[^}]*border:\s*0[^}]*color:\s*var\(--foreground\)[^}]*background:\s*transparent/s,
  );
  assert.match(styles, /\.network-help-link\s*\{[^}]*color:\s*var\(--foreground\)/s);
  for (const control of ["help-link", "location-button"]) {
    assert.doesNotMatch(styles, new RegExp(`\\.network-${control}\\s*\\{[^}]*opacity:`));
    assert.match(styles, new RegExp(`\\.network-${control}:hover svg\\s*\\{[^}]*transform:\\s*scale\\(1\\.08\\)`));
  }
  assert.doesNotMatch(styles, /\.network-location-button\s*\{[^}]*border-radius:\s*50%/s);
  assert.match(styles, /\.network-location-button:focus-visible\s*\{[^}]*z-index:\s*1[^}]*outline:\s*2px solid var\(--foreground\)/s);
  assert.match(
    stationStyles,
    /\.network-utilities \.hiragana-test-tooltip\s*\{[^}]*top:\s*calc\(100% \+ 0\.25rem\)[^}]*right:\s*auto[^}]*left:\s*50%[^}]*transform:\s*translate\(-50%, -0\.25rem\)/s,
  );
  assert.match(
    stationStyles,
    /\.network-utilities \.hiragana-test-trigger-wrap:hover \.hiragana-test-tooltip\s*\{[^}]*transform:\s*translate\(-50%, 0\)/s,
  );
  assert.match(
    stationStyles,
    /\.network-utilities \.hiragana-test-trigger-wrap > :is\(button, a\):focus-visible \+ \.hiragana-test-tooltip\s*\{[^}]*transform:\s*translate\(-50%, 0\)/s,
  );
  assert.match(styles, /@keyframes network-station-inner-pulse[\s\S]*0%, 100%\s*\{[^}]*fill:\s*color-mix\(in srgb, var\(--network-station-inner-color\) 45%, var\(--surface\)\)[\s\S]*50%\s*\{[^}]*fill:\s*var\(--network-station-inner-color\)/);
  assert.match(styles, /\.network-station-link\[data-active="true"\] \.network-station-complete-icon\s*\{[^}]*animation:\s*network-station-complete-icon-pulse 2s ease-in-out infinite/s);
  assert.match(source, /function KeyboardTravelCapsule\([\s\S]*motionRef\.current\?\.beginElement\(\)[\s\S]*<animateMotion[\s\S]*begin="indefinite"[\s\S]*dur=\{`\$\{NETWORK_TRAVEL_DURATION_MS\}ms`\}[\s\S]*path=\{d\}[\s\S]*ref=\{motionRef\}[\s\S]*rotate="auto"/);
  assert.match(styles, /\.network-keyboard-travel-beam\s*\{[^}]*stroke-linecap:\s*round[^}]*vector-effect:\s*non-scaling-stroke/s);
  assert.match(styles, /\.network-keyboard-travel-beam-contrast\s*\{[^}]*drop-shadow\(0 0 4px rgb\(242 241 235 \/ 0\.9\)\)[^}]*stroke-width:\s*12/s);
  assert.match(styles, /\.network-keyboard-travel-beam-core\s*\{[^}]*stroke:\s*var\(--surface\)[^}]*stroke-width:\s*4/s);
  assert.doesNotMatch(styles, /stroke-dasharray|stroke-dashoffset|@keyframes network-keyboard-travel/);
  assert.match(source, /<KeyboardTravelCapsule[\s\S]*network-foundation-title/);
  assert.doesNotMatch(styles, /\.network-station-link:focus-visible[\s\S]{0,180}stroke-width/);
  assert.match(
    styles,
    /@media \(prefers-reduced-motion: reduce\)[\s\S]*\.network-station-link\[data-active="true"\][\s\S]*animation:\s*none[^}]*opacity:\s*1/,
  );
  assert.match(
    styles,
    /@media \(prefers-reduced-motion: reduce\)[\s\S]*\.network-keyboard-travel\s*\{[^}]*display:\s*none/,
  );
  assert.doesNotMatch(styles, /data-(?:desktop-focus|mobile-station-focus)=[^\n]*[\s\S]{0,120}network-station-backlight/);
  assert.doesNotMatch(source, /aria-disabled="true"|data-available=|\/api\/stations\/availability/);

  assert.match(foundation, /--sound:\s*#4c689c/);
  assert.match(foundation, /--audio:\s*#db4e3a/);
  assert.match(foundation, /--travel:\s*#ff2b23/);
  assert.match(foundation, /--writing:\s*#d6aa36/);
  assert.match(foundation, /--kanji:\s*#d87532/);
  assert.match(foundation, /--vocabulary:\s*#4f8f83/);
  assert.match(foundation, /--grammar:\s*#997bb8/);
  assert.match(page, /dynamic = "force-static"/);
  assert.match(page, /<NetworkMap \/>/);
});

test("station and Welcome pages share one plain, focused return to the map", async () => {
  const source = await readFile(new URL("app/network-visuals.tsx", root), "utf8");
  const mapIcon = await readFile(new URL("app/map-icon.tsx", root), "utf8");
  const topbar = await readFile(new URL("app/stations/station-topbar.tsx", root), "utf8");
  const shellStyles = await readFile(new URL("app/styles/shell.css", root), "utf8");
  const welcome = await readFile(new URL("app/welcome/page.tsx", root), "utf8");
  const networkMap = await readFile(new URL("app/network-map.tsx", root), "utf8");
  const styles = await readFile(new URL("app/styles/network.css", root), "utf8");

  assert.match(topbar, /import type \{ NetworkPlaceId \} from "@\/src\/modules\/learning\/network"/);
  assert.match(topbar, /<StationVisitRecorder placeId=\{networkFocus\} \/>/);
  assert.match(topbar, /className="topbar-map-link"/);
  assert.match(welcome, /className="topbar-map-link"/);
  assert.match(topbar, /<MapIcon \/>/);
  assert.match(welcome, /<MapIcon \/>/);
  assert.match(topbar, /href=\{`\/\?focus=\$\{networkFocus\}`\}/);
  assert.match(topbar, /aria-label=\{`Return to map from \$\{current\}`\}/);
  assert.match(mapIcon, /<svg aria-hidden="true" viewBox="0 0 24 24">/);
  assert.match(shellStyles, /\.topbar-map-link\s*\{[^}]*color:\s*var\(--foreground\)/s);
  assert.doesNotMatch(shellStyles, /\.topbar-map-link(?:\s*|:hover)\s*\{[^}]*var\(--travel\)/s);
  assert.doesNotMatch(topbar, /NetworkGlyph|>←|>Map</);
  assert.doesNotMatch(welcome, />Back to map|M13 8H3/);
  assert.doesNotMatch(source, /NetworkGlyph|network-glyph-model/);
  assert.match(networkMap, /<NetworkStationSymbol completed=\{completed\} kind=\{kind\} \/>/);
  assert.match(networkMap, /<NetworkStationSymbol completed=\{completed\} kind=\{line\} \/>/);
  assert.match(source, /<circle className="network-interchange-outer" r="20" \/>/);
  assert.match(source, /network-interchange-inner-\$\{kind\}`\}[\s\S]*r="20"/);
  assert.match(source, /network-interchange-inner-\$\{kind\}`\}/);
  assert.match(source, /network-single-station-outer-\$\{kind\}`\} r="9"/);
  assert.match(source, /network-single-station-inner-\$\{kind\}`\}[\s\S]*r="9"/);
  assert.match(source, /network-single-station-inner-\$\{kind\}`\}/);
  assert.match(source, /className=\{`network-station-complete-icon/);
  assert.match(styles, /\.network-station-complete-icon\s*\{[^}]*stroke-width:\s*6/s);
  assert.match(styles, /\.network-station-complete-icon\s*\{[^}]*vector-effect:\s*non-scaling-stroke/s);
  assert.match(source, /d="m-5 1 3 3 7-7"/);
  assert.doesNotMatch(source, /LingMarkStrokes|network-brand-station|<rect/);
});

test("every mapped station is visible and directly accessible without completion", async () => {
  const source = await readFile(new URL("app/network-map.tsx", root), "utf8");
  const page = await readFile(new URL("app/page.tsx", root), "utf8");
  const learningStationSlugs = [
    "hiragana",
    "katakana",
    "sound-marks",
    "combined-sounds",
    "kanji",
    "characters",
    "pointing",
    "people",
    "needs",
    "movement",
    "time",
    "actions",
    "descriptions",
    "mora-timing",
    "pitch-accent",
  ];
  const stationPages = await Promise.all(
    learningStationSlugs.map((station) =>
      readFile(new URL(`app/stations/${station}/page.tsx`, root), "utf8"),
    ),
  );
  const legacyExtensionsPage = await readFile(new URL("app/stations/kana-extensions/page.tsx", root), "utf8");
  const soundMarksApi = await readFile(new URL("app/api/stations/sound-marks/introduction/route.ts", root), "utf8");
  const combinedSoundsApi = await readFile(new URL("app/api/stations/combined-sounds/introduction/route.ts", root), "utf8");
  const vowels = await readFile(new URL("app/stations/vowels/vowels-guide.tsx", root), "utf8");
  const hiragana = await readFile(new URL("app/stations/hiragana/hiragana-guide.tsx", root), "utf8");
  const vowelsApi = await readFile(new URL("app/api/stations/vowels/introduction/route.ts", root), "utf8");
  const api = await readFile(new URL("app/api/stations/hiragana/introduction/route.ts", root), "utf8");
  const stations = await readFile(new URL("src/modules/learning/stations.ts", root), "utf8");
  const repository = await readFile(new URL("src/modules/learning/repository.ts", root), "utf8");
  const schema = await readFile(new URL("db/schema.ts", root), "utf8");
  const network = await readFile(new URL("src/modules/learning/network.ts", root), "utf8");
  const networkApi = await readFile(new URL("app/api/network/places/route.ts", root), "utf8");
  const visitRecorder = await readFile(new URL("app/stations/station-visit-recorder.tsx", root), "utf8");

  assert.doesNotMatch(stations, /PREREQUISITE|isStationAvailable|retainPrerequisite/);
  assert.match(schema, /stationIntroductions = sqliteTable\(\s*"station_introductions"/s);
  assert.match(schema, /primaryKey\(\{ columns: \[table\.userId, table\.stationId\] \}\)/);
  assert.match(repository, /where\(eq\(stationIntroductions\.userId, userId\)\)/);
  assert.match(schema, /networkPlaceVisits = sqliteTable\(\s*"network_place_visits"/s);
  assert.match(repository, /BASIC_HIRAGANA\.every\(\(kana\) => knownHiragana\.includes\(kana\)\)/);
  assert.match(repository, /BASIC_KATAKANA\.every\(\(kana\) => knownKatakana\.includes\(kana\)\)/);
  assert.match(repository, /ROMAJI_KANA\.every\(\(kana\) => knownRomaji\.includes\(kana\)\)/);
  assert.match(repository, /VOWEL_HIRAGANA\.every\(\(kana\) => knownHiragana\.includes\(kana\)\)/);
  assert.match(repository, /SOUND_MARK_PATTERN_IDS\.every\(\(patternId\) =>/);
  assert.match(repository, /COMBINED_SOUND_PATTERN_IDS\.every\(\(patternId\) =>/);
  assert.match(repository, /PITCH_ACCENT_ITEM_IDS\.every\(\(itemId\) =>/);
  assert.match(repository, /getVocabularyItemIds\(stationId\)\.every\(\(itemId\) =>/);
  assert.match(repository, /return completed/);
  assert.match(repository, /onConflictDoNothing\(\)/);
  assert.match(vowelsApi, /recordStationIntroduction\(user\.id, "vowels"\)/);
  assert.match(vowelsApi, /\{ recorded: true \}/);
  assert.match(repository, /if \(row\.stationId === "words"\) return "pointing"/);
  assert.match(network, /COMPLETABLE_NETWORK_PLACE_IDS = \[[\s\S]*"romaji"[\s\S]*"pointing"[\s\S]*"descriptions"[\s\S]*"statements"[\s\S]*"adjectives"/);
  assert.match(networkApi, /listVisitedNetworkPlaces\(user\.id\)/);
  assert.match(networkApi, /listCompletedNetworkPlaces\(user\.id\)/);
  assert.match(networkApi, /Array\.from\(new Set\(\[\.\.\.visited, \.\.\.completed\]\)\)/);
  assert.match(networkApi, /isNetworkPlaceId/);
  assert.match(networkApi, /private, no-store/);
  assert.match(visitRecorder, /localStorage\.setItem\(NETWORK_LOCATION_STORAGE_KEY, placeId\)/);
  assert.match(visitRecorder, /fetch\("\/api\/network\/places"/);
  assert.match(api, /recordStationIntroduction\(user\.id, "hiragana"\)/);
  assert.match(api, /\{ recorded: true \}/);
  assert.doesNotMatch(api, /station_unavailable|status: 403/);
  assert.match(page, /dynamic = "force-static"/);
  assert.match(page, /<NetworkMap \/>/);
  assert.doesNotMatch(source, /\/api\/stations\/availability|NetworkLoadError|AvailabilityStatus/);
  assert.doesNotMatch(source, /Available\s*=\s*(?:true|false)/);
  assert.match(source, /useEffect\(\(\) => \{\s*routeReady\(\);\s*\}, \[routeReady\]\)/);
  assert.match(source, /new URLSearchParams\(window\.location\.search\)/);
  for (const [index, station] of learningStationSlugs.entries()) {
    assert.doesNotMatch(
      stationPages[index],
      /redirect\(|isStationAvailableToCurrentUser|getStationAvailabilityForCurrentUser/,
      `${station} should be directly accessible`,
    );
  }
  assert.match(legacyExtensionsPage, /redirect\("\/stations\/sound-marks"\)/);
  assert.match(soundMarksApi, /recordStationIntroduction\(user\.id, "sound-marks"\)/);
  assert.match(soundMarksApi, /\{ recorded: true \}/);
  assert.match(combinedSoundsApi, /recordStationIntroduction\(user\.id, "combined-sounds"\)/);
  assert.match(combinedSoundsApi, /\{ recorded: true \}/);
  assert.match(hiragana, /fetch\("\/api\/stations\/hiragana\/introduction"/);
  assert.match(vowels, /fetch\("\/api\/stations\/vowels\/introduction"/);
  assert.match(hiragana, /useEffect\(\(\) => \{/);
  assert.doesNotMatch(hiragana, /Continue to Mora timing|station-next/);
  assert.doesNotMatch(source, /MORA_UNAVAILABLE_REASON|network-line-unavailable|unavailableReason|aria-disabled/);
  assert.doesNotMatch(source, /After Hiragana|network-station-dependency|station_unavailable/);
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

  assert.doesNotMatch(soundMarksPage, /isStationAvailableToCurrentUser|redirect\(/);
  assert.match(soundMarksPage, /<StationTopbar current="Dakuten & Handakuten" networkFocus="marks" \/>/);
  assert.match(soundMarksPage, /<SoundMarksGuide \/>/);
  assert.doesNotMatch(combinedSoundsPage, /isStationAvailableToCurrentUser|redirect\(/);
  assert.match(combinedSoundsPage, /<StationTopbar current="Yōon" networkFocus="combined" \/>/);
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
  assert.match(source, /Dakuten and handakuten are marks added to Kana\./);
  assert.doesNotMatch(source, /Kana you already know/);
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
  assert.match(source, /This marks all \{allEntries\.length\} patterns in this station as complete\./);
  assert.match(source, /Your station access will not change\./);
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
    "/audio/ja-neko.wav",
    "/audio/ja-sakana.wav",
    "/audio/ja-katakana-pan.wav",
    "/audio/ja-yoon-hiragana-sha.wav",
    "/audio/ja-yoon-hiragana-kyo.wav",
    "/audio/ja-yoon-hiragana-sha.wav",
    "/audio/ja-kitte.wav",
    "/audio/ja-katakana-robotto.wav",
    "/audio/ja-keeki.wav",
    "/audio/ja-katakana-suupu.wav",
  ]);
  assert.equal(reviewWords.length, 9);
  assert.equal(reviewMeanings.length, 9);
  assert.equal(reviewAudioPaths.length, 9);
  assert.equal(reviewMoraBreakdowns.length, 9);
  for (const { morae, word } of reviewMoraBreakdowns) {
    assert.equal(morae.join(""), word, `${word} must render from its declared morae`);
  }
  assert.equal(teachingWords.length, 10);
  assert.equal(new Set([...teachingWords, ...reviewWords]).size, 9);
  assert.deepEqual(new Set(reviewWords), new Set(teachingWords));
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
  assert.match(source, /announcement=\{breakdownRevealed[\s\S]*?getJapaneseWordRomaji\(activeCard\.word\)[\s\S]*?activeCard\.morae\.length/);
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
  assert.match(source, /Test Mora\. \$\{remainingCount\} remaining\./);
  assert.match(source, /<StationOptions/);
  assert.match(source, /stationName="Mora"/);
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
  assert.match(source, /<button[\s\S]*?aria-label=\{`Play \$\{example\.word\}`\}[\s\S]*?className="mora-example"[\s\S]*?onClick=\{\(\) => void playAudio\(example\.wordAudio[\s\S]*?<span className="mora-meaning">[\s\S]*?<span className="mora-example-timing">[\s\S]*?<MoraBeats[\s\S]*?<MoraPronunciation[\s\S]*?<MoraAudioIndicator \/>/);
  assert.doesNotMatch(source, /className="mora-beats-button"/);
  assert.doesNotMatch(source, /className="mora-word"/);
  assert.doesNotMatch(source.slice(source.indexOf('className="mora-example-list"'), source.indexOf("{audioError ?")), /className="mora-count"/);
  assert.doesNotMatch(source, /widestMoraLength|--mora-beat-width/);
  assert.match(styles, /\.mora-concepts\s*\{[^}]*display:\s*grid[^}]*width:\s*min\(100%, 38rem\)[^}]*gap:\s*2rem/s);
  assert.doesNotMatch(styles, /\.mora-concepts\s*\{[^}]*border-top:/s);
  assert.match(styles, /\.mora-example-list\s*\{[^}]*display:\s*grid[^}]*gap:\s*0\.75rem/s);
  assert.doesNotMatch(styles, /\.mora-example-list\s*\{[^}]*grid-template-columns:/s);
  assert.doesNotMatch(styles, /\.mora-example-list\s*\{[^}]*(?:border|border-radius):/s);
  assert.doesNotMatch(styles, /\.mora-example \+ \.mora-example\s*\{[^}]*border-top:/s);
  assert.doesNotMatch(styles, /\.mora-concept\s*\{[^}]*border-bottom:/s);
  assert.doesNotMatch(styles, /\.mora-concept:last-child/);
  assert.match(styles, /\.mora-concept-heading\s*\{[^}]*margin-bottom:\s*0\.875rem/s);
  assert.match(styles, /\.station-page-mora \.mora-example,\s*\.station-page-pitch-accent \.pitch-example\s*\{[^}]*min-height:\s*6\.25rem[^}]*border:\s*0/s);
  assert.match(styles, /\.mora-example\s*\{[^}]*position:\s*relative[^}]*display:\s*grid[^}]*width:\s*100%[^}]*align-content:\s*center[^}]*justify-items:\s*start[^}]*padding:\s*1rem 2\.75rem 1rem 1rem[^}]*border:\s*0[^}]*background:\s*transparent[^}]*cursor:\s*pointer[^}]*text-align:\s*left/s);
  assert.match(styles, /\.romaji-rule-example,\s*\.station-page-mora \.mora-example,[\s\S]*\{[^}]*border-radius:\s*0\.55rem[^}]*background:\s*color-mix\(in srgb, var\(--foreground\) 4%, transparent\)/s);
  assert.match(styles, /\.mora-example:only-child\s*\{[^}]*width:\s*100%/s);
  assert.match(styles, /\.mora-example-timing\s*\{[^}]*position:\s*relative[^}]*display:\s*inline-grid[^}]*place-items:\s*center/s);
  assert.match(styles, /\.mora-audio-indicator\s*\{[^}]*position:\s*absolute[^}]*top:\s*1rem[^}]*right:\s*1rem/s);
  assert.match(styles, /\.mora-beats\s*\{[^}]*display:\s*inline-flex[^}]*align-items:\s*baseline[^}]*gap:\s*0\.35rem/s);
  assert.doesNotMatch(styles, /\.mora-beats\s*\{[^}]*justify-self:/s);
  assert.doesNotMatch(styles, /\.mora-beat\s*\{[^}]*(?:width|height|border|background):/s);
  assert.doesNotMatch(styles, /\.mora-beat \+ \.mora-beat|\.mora-beat:(?:first|last|only)-child/);
  assert.match(styles, /\.mora-beat\[data-active="true"\]\s*\{[^}]*color:\s*var\(--audio\)/s);
  assert.doesNotMatch(styles, /\.mora-beat\[data-active="true"\]\s*\{[^}]*(?:background|border-color|box-shadow|transform):/s);
  assert.match(styles, /\.mora-review-word-beat\[data-active="true"\]\s*\{[^}]*color:\s*var\(--audio\)/s);
  assert.doesNotMatch(styles, /\.mora-review-word-beat\[data-active="true"\]\s*\{[^}]*(?:background|border-color|box-shadow|transform):/s);
  assert.match(source, /getJapaneseMoraRomaji\(word\)/);
  assert.match(source, /className="mora-pronunciation-beat"[\s\S]*data-active=\{activeBeatIndex === index \? "true" : undefined\}/);
  assert.match(styles, /\.mora-pronunciation\s*\{[^}]*display:\s*inline-flex[^}]*font-size:\s*0\.8rem/s);
  assert.doesNotMatch(styles, /\.mora-pronunciation\s*\{[^}]*gap:/s);
  assert.match(source, /aria-label=\{`Rōmaji: \$\{getJapaneseWordRomaji\(word\)\}`\}/);
  assert.doesNotMatch(source, /getJapaneseMoraSoundCue|getJapaneseWordSoundCue|data-connected/);
  assert.doesNotMatch(styles, /\.mora-pronunciation-beat \+ \.mora-pronunciation-beat/);
  assert.match(styles, /\.mora-pronunciation-beat\[data-active="true"\]\s*\{[^}]*color:\s*var\(--audio\)/s);
  assert.match(styles, /@media \(hover: hover\) and \(pointer: fine\)[\s\S]*\.station-page-mora \.mora-example:hover:not\(\[data-playing="true"\]\)\s*\{[^}]*background:\s*color-mix\(in srgb, var\(--foreground\) 7%, transparent\)/s);
  assert.match(styles, /\.mora-example\[data-playing="true"\]\s*\{[^}]*background:\s*color-mix\(in srgb, var\(--audio\) 8%, transparent\)[^}]*box-shadow:\s*inset 0 0 0 1px var\(--audio\)/s);
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
  assert.match(source, /data-line="sound"[^>]*>Sound</);
  assert.match(kanaPage, /Kana is the collective name for Hiragana and Katakana/);
  assert.match(kanaPage, /used to write how Japanese words\s+sound/);
  assert.match(kanaPage, /Both sets represent the same sounds with different shapes/);
  assert.match(kanaPage, /Hiragana is used for everyday Japanese words and grammar/);
  assert.match(kanaPage, /Katakana is used mainly for borrowed words, foreign names/);
  assert.match(kanaPage, /href="\/stations\/vowels"/);
  assert.match(kanaPage, /Both scripts use the five sounds introduced at/);
  assert.match(kanaPage, /on the Sound line/);
  assert.doesNotMatch(kanaPage, /Begin with the five shared sounds/);
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
  assert.doesNotMatch(stationOptions, /aria-label="Close station options"/);
  for (const guide of guides) {
    assert.doesNotMatch(guide, /aria-label="Close station options"/);
  }
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

  assert.equal(characters.length, 46);
  assert.equal(new Set(characters).size, 46);
  assert.equal(audioPaths.length, 46);
  assert.match(source, /aria-label="The 46 basic hiragana"/);
  assert.match(source, /Hiragana is the everyday Kana system/);
  assert.match(source, /five shared vowel sounds/);
  assert.doesNotMatch(source, /vowel sounds you already know/);
  assert.match(source, /Learning them lets you sound out written Japanese/);
  assert.match(source, /JAPANESE_ROMAJI_VOWELS\.map\(\(sound\) =>/);
  assert.match(source, /aria-label=\{`Column of sounds ending in \$\{sound\}`\}/);
  assert.doesNotMatch(source, /[あいうえお]段/);
  assert.doesNotMatch(source, /The next five sounds|Start with the first ten/);
  assert.doesNotMatch(source, /Hear them in words|hiragana-groups|hiragana-study-group/);
  assert.doesNotMatch(source, /\benglish: "/);
  assert.match(source, /preload="none"/);
  assert.match(styles, /\.hiragana-table\s*\{[^}]*table-layout:\s*fixed/s);
  assert.match(styles, /\.hiragana-intro\s*\{[^}]*display:\s*grid[^}]*gap:\s*0\.65rem/s);
  assert.match(styles, /\.hiragana-button\s*\{[^}]*font-size:\s*1\.65rem/s);
  assert.match(source, /className="station-heading-row"/);
  assert.match(source, /data-line="kana"/);
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
  assert.doesNotMatch(source, /aria-label="Close station options"/);
  assert.doesNotMatch(source, /station-options-menu-header/);
  assert.doesNotMatch(source, /<span>Station options<\/span>/);
  assert.match(source, />I know this<\/span>/);
  assert.match(source, />Reset station<\/span>/);
  assert.match(source, /method: "PATCH"/);
  assert.match(source, /onClick=\{openCompleteDialog\}/);
  assert.match(source, /setAllKnowledge\(true\)/);
  assert.match(source, /setAllKnowledge\(false\)/);
  assert.match(source, /aria-labelledby="hiragana-complete-title"/);
  assert.match(source, /This marks all 46 Hiragana as complete\./);
  assert.match(source, /aria-labelledby="hiragana-reset-title"/);
  assert.match(source, /Your station access will not change\./);
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
  assert.doesNotMatch(styles, /\.station-options-close/);
  assert.match(styles, /\.station-options-action:hover\s*\{[^}]*opacity:\s*1[^}]*\}/s);
  assert.doesNotMatch(styles, /\.station-options-action:hover\s*\{[^}]*background:/s);
  assert.doesNotMatch(source, /station-options-reset/);
  assert.doesNotMatch(styles, /\.station-options-reset/);
  assert.doesNotMatch(styles, /\.station-options summary:hover,\s*\.station-options\[open\] summary\s*\{[^}]*border-color:/s);
  assert.match(styles, /\.station-confirm-dialog::backdrop/);
  assert.doesNotMatch(styles, /\.station-confirm-(?:actions|action-icon|cancel|complete)\b/);
  assert.match(styles, /\.station-confirm-modal \.hiragana-test-actions\s*\{[^}]*display:\s*flex[^}]*justify-content:\s*flex-end[^}]*gap:\s*0\.625rem/s);
  assert.match(styles, /\.station-confirm-modal \.hiragana-test-answer\s*\{[^}]*min-height:\s*2\.75rem[^}]*padding:\s*0\.55rem 0\.85rem/s);
  assert.match(styles, /\.hiragana-test-answer\.station-confirm-reset\s*\{[^}]*background:\s*var\(--audio\)/s);
  assert.match(styles, /\.hiragana-test-trigger-wrap:hover \.hiragana-test-tooltip/);
  assert.match(styles, /\.hiragana-test-trigger-wrap > :is\(button, a\):focus-visible \+ \.hiragana-test-tooltip/);
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
  assert.match(styles, /\.hiragana-test-answer-no\s*\{[^}]*border-color:\s*var\(--audio\)[^}]*color:\s*var\(--foreground\)[^}]*background:\s*transparent/s);
  assert.match(styles, /\.hiragana-test-answer-no \.hiragana-test-answer-icon,\s*\.hiragana-test-answer-no \.hiragana-test-swipe-icon\s*\{[^}]*color:\s*var\(--audio\)/s);
  assert.match(styles, /\.hiragana-test-answer-no:hover\s*\{[^}]*border-color:\s*var\(--audio\)[^}]*background:\s*color-mix\(in srgb, var\(--audio\) 8%, transparent\)/s);
  assert.doesNotMatch(source, /Say the sound/);
  assert.doesNotMatch(styles, /\.hiragana-test-instruction/);
  assert.match(source, /setPronunciationRevealed\(true\)/);
  assert.match(source, /<KanaFlashcardContent/);
  assert.match(source, /pronunciation=\{getJapaneseRomaji\(activeCard\.kana\)\}/);
  assert.match(source, /pronunciationPlaying=\{activeAudioIndex === 0\}/);
  assert.match(source, /revealed=\{pronunciationRevealed\}/);
  assert.doesNotMatch(source, /example:|exampleAudio:|translation:|Example:|function playExample|onPlayExample/);
  assert.match(flashcardReview, /revealed \? \([\s\S]*className="hiragana-test-example-word"[\s\S]*exampleMorae\.map[\s\S]*className="hiragana-test-example-beat"[\s\S]*className="hiragana-test-example-pronunciation"[\s\S]*examplePronunciationUnits\.map[\s\S]*className="hiragana-test-example-pronunciation-beat"[\s\S]*className="hiragana-test-example-translation"[\s\S]*\{translation\}[\s\S]*\) : \(/);
  assert.match(flashcardReview, /className="hiragana-test-answer-slot"[\s\S]*<FlashcardCountdown onComplete=\{onReveal\} \/>/);
  assert.match(flashcardReview, /aria-label=\{activationLabel\}[\s\S]*onClick=\{handleCardClick\}/);
  assert.doesNotMatch(flashcardReview, /onPlayKana/);
  assert.match(flashcardReview, /aria-label=\{`Play example word \$\{example\}`\}[\s\S]*onClick=\{onPlayExample\}/);
  assert.match(source, /kana: FINAL_HIRAGANA\.character, kanaAudio: FINAL_HIRAGANA\.audio/);
  assert.doesNotMatch(source, />English sound</);
  assert.match(source, /playing=\{audioPlaying\}/);
  assert.match(flashcardReview, /data-playing=\{playing \? "true" : undefined\}/);
  assert.match(source, /onEnded=\{handleAudioEnded\}/);
  assert.match(source, /onError=\{handleAudioError\}/);
  assert.match(styles, /\.hiragana-test-card\[data-playing="true"\][^}]*border-color:\s*var\(--audio\)/s);
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

  for (const audioPath of audioPaths) {
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
  assert.doesNotMatch(page, /isStationAvailableToCurrentUser|redirect\(/);
  assert.match(source, /data-line="kana"/);
  assert.match(api, /recordStationIntroduction\(user\.id, "katakana"\)/);
  assert.match(api, /\{ recorded: true \}/);
  assert.doesNotMatch(api, /station_unavailable|status: 403/);
  assert.match(source, /Katakana writes the same basic Japanese sounds as Hiragana with a different set of shapes/);
  assert.match(source, /Each Katakana has a Hiragana match/);
  assert.match(source, /ア.*sounds like.*あ.*カ.*sounds like.*か/);
  assert.match(source, /Japanese uses both because they do different jobs in writing/);
  assert.match(source, /Hiragana is used for many Japanese words and for grammar/);
  assert.match(source, /Katakana is mainly used for words borrowed from other languages, foreign names, and sound effects/);
  assert.ok(
    source.indexOf("Katakana writes the same basic") < source.indexOf("Japanese uses both"),
    "the station should introduce Katakana before explaining why Japanese uses both systems",
  );
  assert.doesNotMatch(source, /sounds you learned|Since you already know/);
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
  assert.match(source, /<KanaFlashcardContent/);
  assert.match(source, /pronunciationPlaying=\{activeAudioIndex === 0\}/);
  assert.match(source, /playAudio\(\{ index: 0, src: activeCard\.audio \}\)/);
  assert.match(source, /onActivate=\{activateCard\}/);
  assert.match(source, /onReveal=\{activateCard\}/);
  assert.match(source, /pronunciation=\{getJapaneseRomaji\(activeCard\.katakana\)\}/);
  assert.doesNotMatch(source, /\bsound: "/);
  assert.doesNotMatch(source, /example:|exampleAudio:|translation:|Example:|function playExample|onPlayExample/);
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

  for (const audioPath of audioPaths) {
    const audio = await readFile(new URL(`public${audioPath}`, root));
    assert.equal(audio.subarray(0, 4).toString("ascii"), "RIFF");
    assert.equal(audio.subarray(8, 12).toString("ascii"), "WAVE");
    assert.ok(wavDuration(audio) >= 0.1, `${audioPath} should not be clipped too short`);
  }
});
