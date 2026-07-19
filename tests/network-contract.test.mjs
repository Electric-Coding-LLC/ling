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
  assert.match(source, /DESKTOP_HIRAGANA_X\s*=\s*250/);
  assert.match(source, /DESKTOP_MORA_X\s*=\s*DESKTOP_HIRAGANA_X \+ NETWORK_SEGMENT_LENGTH/);
  assert.match(source, /MOBILE_HIRAGANA_X\s*=\s*NETWORK_SEGMENT_LENGTH/);
  assert.match(source, /MOBILE_MORA_X\s*=\s*MOBILE_HIRAGANA_X \+ NETWORK_SEGMENT_LENGTH/);
  assert.match(source, /MOBILE_VIEW_WIDTH\s*=\s*MOBILE_MORA_X/);
  assert.match(source, /NETWORK_VIEW_HEIGHT\s*=\s*440/);
  assert.match(source, /SOUND_Y\s*=\s*180/);
  assert.match(source, /KATAKANA_Y\s*=\s*SOUND_Y \+ NETWORK_SEGMENT_LENGTH/);
  assert.match(source, /viewBox=\{`0 0 \$\{width\} \$\{NETWORK_VIEW_HEIGHT\}`\}/);
  assert.equal((source.match(/x2=\{moraX - NETWORK_LINE_NODE_OFFSET\}/g) ?? []).length, 2);
  assert.equal((source.match(/x1=\{hiraganaX \+ hiraganaLineOffset\}/g) ?? []).length, 2);
  assert.match(source, /data-line="sound"[\s\S]*?dominantBaseline="middle"[\s\S]*?textAnchor="end"[\s\S]*?x=\{hiraganaX - 48\}[\s\S]*?y=\{SOUND_Y\}/);
  assert.match(source, /data-line="script"[\s\S]*?x=\{hiraganaX - 48\}[\s\S]*?y=\{SCRIPT_LABEL_Y\}/);
  assert.equal((source.match(/y1=\{SOUND_Y \+ NETWORK_INTERCHANGE_NODE_OFFSET\}/g) ?? []).length, 2);
  assert.equal((source.match(/y2=\{KATAKANA_Y - NETWORK_LINE_NODE_OFFSET\}/g) ?? []).length, 2);
  assert.doesNotMatch(source, /<line\b(?=[^>]*x1="0")/);
  assert.doesNotMatch(source, /x2=\{mobile \? 720 : 1000\}/);
  assert.match(source, /data-line="sound"/);
  assert.match(source, /mora:\s*"\/stations\/mora-timing"/);
  assert.match(source, /hiragana:\s*"\/stations\/hiragana"/);
  assert.match(source, /katakana:\s*"\/stations\/katakana"/);
  assert.doesNotMatch(source, /vowels:\s*"\/stations\/vowels"/);
  assert.match(source, /LinkedStation[^>]*href=\{ROUTABLE_STATION_HREFS\.mora\}/);
  assert.match(source, /LinkedStation[^>]*href=\{ROUTABLE_STATION_HREFS\.hiragana\}/);
  assert.match(source, /LinkedStation[^>]*href=\{ROUTABLE_STATION_HREFS\.katakana\}/);
  assert.match(source, /import Link from "next\/link"/);
  assert.match(source, /import \{ useRouter \} from "next\/navigation"/);
  assert.match(source, /<Link[\s\S]*className="network-station-link"[\s\S]*prefetch/);
  assert.doesNotMatch(source, /<a[^>]*className="network-station-link"/);
  assert.match(source, /MOBILE_SWIPE_THRESHOLD\s*=\s*40/);
  assert.match(source, /STATION_FOCUS_STORAGE_KEY\s*=\s*"ling:network-station-focus"/);
  assert.match(source, /useSyncExternalStore\(\s*subscribeToStoredStationFocus,\s*getStoredStationFocus,\s*getServerStationFocus/s);
  assert.match(source, /localStorage\.setItem\(STATION_FOCUS_STORAGE_KEY, focus\)/);
  assert.match(source, /window\.dispatchEvent\(new Event\(STATION_FOCUS_EVENT\)\)/);
  assert.match(source, /window\.addEventListener\("storage", onStoreChange\)/);
  assert.match(source, /if \(initialStationFocus && isStationVisible\([\s\S]*?storeStationFocus\(initialStationFocus\)/);
  assert.match(source, /const requestedStationFocus = selectedStationFocus \?\? storedStationFocus/);
  assert.match(source, /const mobileFocus: MobileFocus = stationFocus/);
  assert.doesNotMatch(source, /const \[(?:desktopFocus|mobileStationFocus),/);
  assert.match(page, /focus === "hiragana" \|\| focus === "vowels"/);
  assert.match(page, /focus === "katakana"/);
  assert.match(page, /katakanaAvailable=\{katakanaAvailable\}/);
  assert.match(page, /moraTimingAvailable=\{moraTimingAvailable\}/);
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
  assert.match(source, /type MobileFocus = "hiragana" \| "katakana" \| "mora"/);
  assert.match(source, /hiragana:\s*\{ ArrowDown: "katakana", ArrowRight: "mora" \}/);
  assert.match(source, /katakana:\s*\{ ArrowUp: "hiragana" \}/);
  assert.match(source, /mora:\s*\{ ArrowLeft: "hiragana" \}/);
  assert.equal((source.match(/STATION_NEIGHBORS\[stationFocus\]\[direction\]/g) ?? []).length, 2);
  assert.match(source, /function openStation\(focus: StationFocus\)/);
  assert.match(source, /router\.push\(ROUTABLE_STATION_HREFS\[focus\]\)/);
  assert.doesNotMatch(source, /onKeyDown=\{mobile \? undefined : onDesktopKeyDown\}/);
  assert.equal((source.match(/"\.network-station-link:focus"/g) ?? []).length, 1);
  assert.match(source, /getStationTarget\(event\.currentTarget, nextFocus\)\.focus\(\)/);
  assert.match(source, /data-mobile-station-focus=\{stationFocus\}/);
  assert.doesNotMatch(source, /tabIndex=\{-1\}/);
  assert.match(source, /openStation\(stationFocus\)/);
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
  assert.equal((source.match(/router\.push\(stationLink\.href\.baseVal\)/g) ?? []).length, 1);
  assert.doesNotMatch(source, /window\.location\.assign/);
  assert.match(styles, /\.network-mobile-track-mora\s*\{[^}]*translateX\(-50%\)/s);
  assert.match(styles, /\.network-desktop-viewport:focus\s*\{[^}]*outline:\s*none/s);
  assert.match(styles, /data-desktop-focus="mora"[\s\S]*data-desktop-focus="katakana"[\s\S]*data-desktop-focus="hiragana"/);
  assert.doesNotMatch(styles, /data-desktop-focus="vowels"/);
  assert.match(styles, /\.network-mobile-viewport:focus-visible\s*\{[^}]*outline:\s*none/s);
  assert.match(
    styles,
    /data-mobile-station-focus="mora"[\s\S]*data-mobile-station-focus="katakana"[\s\S]*data-mobile-station-focus="hiragana"/,
  );
  assert.doesNotMatch(styles, /data-mobile-station-focus="vowels"/);
  assert.doesNotMatch(styles, /\.network-mobile-viewport:focus-visible\s*\{[^}]*outline:\s*2px/s);
  assert.match(styles, /\.network-station-link:focus-visible\s*\{[^}]*outline:\s*none/s);
  assert.match(styles, /\.network-station-backlight\s*\{[^}]*opacity:\s*0[^}]*transition:\s*opacity 160ms ease/s);
  assert.match(styles, /\.network-station-link:hover \.network-station-backlight\s*\{[^}]*opacity:\s*0\.55/s);
  assert.match(styles, /\.network-station-link:focus-visible \.network-station-backlight/);
  assert.match(styles, /\.network-line-script\s*\{[^}]*stroke:\s*var\(--script\)/s);
  assert.match(styles, /\.network-single-station-outer-script\s*\{[^}]*stroke:\s*var\(--script\)/s);
  assert.doesNotMatch(styles, /network-(?:line-hit-|line-|station-)unavailable|aria-disabled/);
  assert.doesNotMatch(styles, /\.network-station-focus/);
  assert.doesNotMatch(styles, /drop-shadow\(/);
});

test("station map glyphs reflect each station's network position", async () => {
  const source = await readFile(new URL("app/stations/station-topbar.tsx", root), "utf8");

  assert.match(
    source,
    /position === "hiragana"[\s\S]*station-map-script[\s\S]*station-map-sound[\s\S]*station-map-interchange/,
  );
  assert.match(source, /position === "katakana"[\s\S]*data-terminal="true"[\s\S]*station-map-script/);
});

test("the next Sound and Script stations depend on an account-scoped Hiragana introduction", async () => {
  const source = await readFile(new URL("app/network-map.tsx", root), "utf8");
  const page = await readFile(new URL("app/page.tsx", root), "utf8");
  const moraPage = await readFile(new URL("app/stations/mora-timing/page.tsx", root), "utf8");
  const katakanaPage = await readFile(new URL("app/stations/katakana/page.tsx", root), "utf8");
  const hiragana = await readFile(new URL("app/stations/hiragana/hiragana-guide.tsx", root), "utf8");
  const api = await readFile(new URL("app/api/stations/hiragana/introduction/route.ts", root), "utf8");
  const stations = await readFile(new URL("src/modules/learning/stations.ts", root), "utf8");
  const repository = await readFile(new URL("src/modules/learning/repository.ts", root), "utf8");
  const schema = await readFile(new URL("db/schema.ts", root), "utf8");

  assert.match(stations, /"mora-timing": \["hiragana"\]/);
  assert.match(stations, /katakana: \["hiragana"\]/);
  assert.match(stations, /prerequisites\.every/);
  assert.match(schema, /stationIntroductions = sqliteTable\(\s*"station_introductions"/s);
  assert.match(schema, /primaryKey\(\{ columns: \[table\.userId, table\.stationId\] \}\)/);
  assert.match(repository, /where\(eq\(stationIntroductions\.userId, userId\)\)/);
  assert.match(repository, /onConflictDoNothing\(\)/);
  assert.match(api, /recordStationIntroduction\(user\.id, "hiragana"\)/);
  assert.match(api, /\{ available: \["katakana", "mora-timing"\] \}/);
  assert.match(page, /isStationAvailableToCurrentUser\("mora-timing"\)/);
  assert.match(moraPage, /redirect\("\/\?focus=mora-timing"\)/);
  assert.match(katakanaPage, /redirect\("\/\?focus=katakana"\)/);
  assert.match(hiragana, /fetch\("\/api\/stations\/hiragana\/introduction"/);
  assert.match(hiragana, /useEffect\(\(\) => \{/);
  assert.doesNotMatch(hiragana, /Continue to Mora timing|station-next/);
  assert.match(source, /\{moraTimingAvailable \? \([\s\S]*?className="network-line-target"/);
  assert.match(source, /focus === "katakana" && katakanaAvailable/);
  assert.match(source, /nextFocus && isStationVisible\([\s\S]*?nextFocus,[\s\S]*?katakanaAvailable,[\s\S]*?moraTimingAvailable/);
  assert.doesNotMatch(source, /MORA_UNAVAILABLE_REASON|network-line-unavailable|unavailableReason|aria-disabled/);
  assert.doesNotMatch(source, /After Hiragana|network-station-dependency/);
  assert.doesNotMatch(hiragana, /score|streak|timer|progress meter/i);
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

test("the Hiragana station provides the complete basic chart with bundled audio", async () => {
  const source = await readFile(new URL("app/stations/hiragana/hiragana-guide.tsx", root), "utf8");
  const styles = await readFile(new URL("app/styles/stations.css", root), "utf8");
  const characters = [...source.matchAll(/character: "([^"]+)"/g)].map((match) => match[1]);
  const audioPaths = [...source.matchAll(/audio: "(\/audio\/ja-[^"]+\.wav)"/g)].map((match) => match[1]);
  const exampleAudioPaths = [...source.matchAll(/exampleAudio: "(\/audio\/ja-[^"]+\.wav)"/g)].map((match) => match[1]);

  assert.equal(characters.length, 46);
  assert.equal(new Set(characters).size, 46);
  assert.equal(audioPaths.length, 46);
  assert.match(source, /aria-label="The 46 basic hiragana"/);
  assert.match(source, /Hiragana is the basic sound-writing system of Japanese/);
  assert.match(source, /Each character represents a spoken sound rather than a meaning/);
  assert.match(source, /Learning them lets you sound out written Japanese/);
  assert.match(source, /HIRAGANA_VOWEL_COLUMNS = \["あ", "い", "う", "え", "お"\]/);
  assert.match(source, /aria-label=\{`Column of sounds ending in \$\{vowel\}`\}/);
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
  assert.match(source, /title: "The W row and ん"/);
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
  assert.doesNotMatch(source, /romaji|score|streak|timer|progress/i);

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
  assert.match(page, /data-line="script"/);
  assert.match(api, /recordStationIntroduction\(user\.id, "katakana"\)/);
  assert.match(source, /Katakana is the second basic sound-writing system of Japanese/);
  assert.match(source, /same sounds as Hiragana with a more angular set of characters/);
  assert.match(source, /borrowed words, foreign names, emphasis, and sound effects/);
  assert.match(source, /aria-label="The 46 basic Katakana paired with Hiragana"/);
  assert.match(source, /fetch\("\/api\/stations\/katakana\/introduction"/);
  assert.match(source, /className="katakana-character"/);
  assert.match(source, /className="katakana-match"/);
  assert.match(styles, /\.katakana-table\s*\{[^}]*table-layout:\s*fixed/s);
  assert.match(styles, /\.katakana-button\s*\{[^}]*flex-direction:\s*column/s);
  assert.doesNotMatch(source, /score|streak|timer|progress|test/i);

  for (const audioPath of audioPaths) {
    const audio = await readFile(new URL(`public${audioPath}`, root));
    assert.equal(audio.subarray(0, 4).toString("ascii"), "RIFF");
    assert.equal(audio.subarray(8, 12).toString("ascii"), "WAVE");
    assert.ok(wavDuration(audio) >= 0.1, `${audioPath} should not be clipped too short`);
  }
});
