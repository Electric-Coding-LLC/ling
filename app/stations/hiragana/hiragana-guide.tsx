"use client";

import type { CSSProperties } from "react";
import { useEffect, useRef, useState } from "react";

const HIRAGANA_ROWS = [
  [
    { audio: "/audio/ja-a.wav", character: "あ" },
    { audio: "/audio/ja-i.wav", character: "い" },
    { audio: "/audio/ja-u.wav", character: "う" },
    { audio: "/audio/ja-e.wav", character: "え" },
    { audio: "/audio/ja-o.wav", character: "お" },
  ],
  [
    { audio: "/audio/ja-ka.wav", character: "か" },
    { audio: "/audio/ja-ki.wav", character: "き" },
    { audio: "/audio/ja-ku.wav", character: "く" },
    { audio: "/audio/ja-ke.wav", character: "け" },
    { audio: "/audio/ja-ko.wav", character: "こ" },
  ],
  [
    { audio: "/audio/ja-sa.wav", character: "さ" },
    { audio: "/audio/ja-shi.wav", character: "し" },
    { audio: "/audio/ja-su.wav", character: "す" },
    { audio: "/audio/ja-se.wav", character: "せ" },
    { audio: "/audio/ja-so.wav", character: "そ" },
  ],
  [
    { audio: "/audio/ja-ta.wav", character: "た" },
    { audio: "/audio/ja-chi.wav", character: "ち" },
    { audio: "/audio/ja-tsu.wav", character: "つ" },
    { audio: "/audio/ja-te.wav", character: "て" },
    { audio: "/audio/ja-to.wav", character: "と" },
  ],
  [
    { audio: "/audio/ja-na.wav", character: "な" },
    { audio: "/audio/ja-ni.wav", character: "に" },
    { audio: "/audio/ja-nu.wav", character: "ぬ" },
    { audio: "/audio/ja-ne.wav", character: "ね" },
    { audio: "/audio/ja-no.wav", character: "の" },
  ],
  [
    { audio: "/audio/ja-ha.wav", character: "は" },
    { audio: "/audio/ja-hi.wav", character: "ひ" },
    { audio: "/audio/ja-fu.wav", character: "ふ" },
    { audio: "/audio/ja-he.wav", character: "へ" },
    { audio: "/audio/ja-ho.wav", character: "ほ" },
  ],
  [
    { audio: "/audio/ja-ma.wav", character: "ま" },
    { audio: "/audio/ja-mi.wav", character: "み" },
    { audio: "/audio/ja-mu.wav", character: "む" },
    { audio: "/audio/ja-me.wav", character: "め" },
    { audio: "/audio/ja-mo.wav", character: "も" },
  ],
  [
    { audio: "/audio/ja-ya.wav", character: "や" },
    null,
    { audio: "/audio/ja-yu.wav", character: "ゆ" },
    null,
    { audio: "/audio/ja-yo.wav", character: "よ" },
  ],
  [
    { audio: "/audio/ja-ra.wav", character: "ら" },
    { audio: "/audio/ja-ri.wav", character: "り" },
    { audio: "/audio/ja-ru.wav", character: "る" },
    { audio: "/audio/ja-re.wav", character: "れ" },
    { audio: "/audio/ja-ro.wav", character: "ろ" },
  ],
  [
    { audio: "/audio/ja-wa.wav", character: "わ" },
    null,
    null,
    null,
    { audio: "/audio/ja-wo.wav", character: "を" },
  ],
] as const;

const FINAL_HIRAGANA = { audio: "/audio/ja-n.wav", character: "ん" } as const;
const HIRAGANA_VOWEL_SOUNDS = ["ah", "ee", "oo", "eh", "oh"] as const;
const HIRAGANA_STUDY_GROUPS = [
  {
    description: "These five clear, steady vowel sounds anchor every row that follows.",
    entries: [
      { english: "ah", example: "あさ", exampleAudio: "/audio/ja-asa.wav", kana: "あ", kanaAudio: "/audio/ja-a.wav", translation: "morning" },
      { english: "ee", example: "いぬ", exampleAudio: "/audio/ja-inu.wav", kana: "い", kanaAudio: "/audio/ja-i.wav", translation: "dog" },
      { english: "oo", example: "うみ", exampleAudio: "/audio/ja-umi.wav", kana: "う", kanaAudio: "/audio/ja-u.wav", translation: "sea" },
      { english: "eh", example: "えき", exampleAudio: "/audio/ja-eki.wav", kana: "え", kanaAudio: "/audio/ja-e.wav", translation: "station" },
      { english: "oh", example: "おと", exampleAudio: "/audio/ja-oto.wav", kana: "お", kanaAudio: "/audio/ja-o.wav", translation: "sound" },
    ],
    id: "hiragana-vowels",
    title: "The vowel row",
  },
  {
    description: "The K row pairs a short k sound with each of the five vowels.",
    entries: [
      { english: "kah", example: "かさ", exampleAudio: "/audio/ja-kasa.wav", kana: "か", kanaAudio: "/audio/ja-ka.wav", translation: "umbrella" },
      { english: "kee", example: "きく", exampleAudio: "/audio/ja-kiku.wav", kana: "き", kanaAudio: "/audio/ja-ki.wav", translation: "listen" },
      { english: "koo", example: "くち", exampleAudio: "/audio/ja-kuchi.wav", kana: "く", kanaAudio: "/audio/ja-ku.wav", translation: "mouth" },
      { english: "keh", example: "けさ", exampleAudio: "/audio/ja-kesa.wav", kana: "け", kanaAudio: "/audio/ja-ke.wav", translation: "this morning" },
      { english: "koh", example: "こえ", exampleAudio: "/audio/ja-koe.wav", kana: "こ", kanaAudio: "/audio/ja-ko.wav", translation: "voice" },
    ],
    id: "hiragana-k-row",
    title: "The K row",
  },
  {
    description: "The S row follows the vowel pattern, but し sounds closer to shee than see.",
    entries: [
      { english: "sah", example: "さかな", exampleAudio: "/audio/ja-sakana.wav", kana: "さ", kanaAudio: "/audio/ja-sa.wav", translation: "fish" },
      { english: "shee", example: "しお", exampleAudio: "/audio/ja-shio.wav", kana: "し", kanaAudio: "/audio/ja-shi.wav", translation: "salt" },
      { english: "soo", example: "すし", exampleAudio: "/audio/ja-sushi.wav", kana: "す", kanaAudio: "/audio/ja-su.wav", translation: "sushi" },
      { english: "seh", example: "せかい", exampleAudio: "/audio/ja-sekai.wav", kana: "せ", kanaAudio: "/audio/ja-se.wav", translation: "world" },
      { english: "soh", example: "そと", exampleAudio: "/audio/ja-soto.wav", kana: "そ", kanaAudio: "/audio/ja-so.wav", translation: "outside" },
    ],
    id: "hiragana-s-row",
    title: "The S row",
  },
  {
    description: "The T row includes two changes: ち sounds like chee and つ sounds like tsoo.",
    entries: [
      { english: "tah", example: "たこ", exampleAudio: "/audio/ja-tako.wav", kana: "た", kanaAudio: "/audio/ja-ta.wav", translation: "octopus" },
      { english: "chee", example: "ちち", exampleAudio: "/audio/ja-chichi.wav", kana: "ち", kanaAudio: "/audio/ja-chi.wav", translation: "father" },
      { english: "tsoo", example: "つき", exampleAudio: "/audio/ja-tsuki.wav", kana: "つ", kanaAudio: "/audio/ja-tsu.wav", translation: "moon" },
      { english: "teh", example: "て", exampleAudio: "/audio/ja-te.wav", kana: "て", kanaAudio: "/audio/ja-te.wav", translation: "hand" },
      { english: "toh", example: "とり", exampleAudio: "/audio/ja-tori.wav", kana: "と", kanaAudio: "/audio/ja-to.wav", translation: "bird" },
    ],
    id: "hiragana-t-row",
    title: "The T row",
  },
  {
    description: "The N row pairs an n sound with each vowel without a major sound change.",
    entries: [
      { english: "nah", example: "なつ", exampleAudio: "/audio/ja-natsu.wav", kana: "な", kanaAudio: "/audio/ja-na.wav", translation: "summer" },
      { english: "nee", example: "にく", exampleAudio: "/audio/ja-niku.wav", kana: "に", kanaAudio: "/audio/ja-ni.wav", translation: "meat" },
      { english: "noo", example: "ぬの", exampleAudio: "/audio/ja-nuno.wav", kana: "ぬ", kanaAudio: "/audio/ja-nu.wav", translation: "cloth" },
      { english: "neh", example: "ねこ", exampleAudio: "/audio/ja-neko.wav", kana: "ね", kanaAudio: "/audio/ja-ne.wav", translation: "cat" },
      { english: "noh", example: "のむ", exampleAudio: "/audio/ja-nomu.wav", kana: "の", kanaAudio: "/audio/ja-no.wav", translation: "drink" },
    ],
    id: "hiragana-n-row",
    title: "The N row",
  },
  {
    description: "The H row follows the pattern, but ふ begins with a soft breath closer to foo.",
    entries: [
      { english: "hah", example: "はな", exampleAudio: "/audio/ja-hana.wav", kana: "は", kanaAudio: "/audio/ja-ha.wav", translation: "flower" },
      { english: "hee", example: "ひと", exampleAudio: "/audio/ja-hito.wav", kana: "ひ", kanaAudio: "/audio/ja-hi.wav", translation: "person" },
      { english: "foo", example: "ふね", exampleAudio: "/audio/ja-fune.wav", kana: "ふ", kanaAudio: "/audio/ja-fu.wav", translation: "boat" },
      { english: "heh", example: "へや", exampleAudio: "/audio/ja-heya.wav", kana: "へ", kanaAudio: "/audio/ja-he.wav", translation: "room" },
      { english: "hoh", example: "ほし", exampleAudio: "/audio/ja-hoshi.wav", kana: "ほ", kanaAudio: "/audio/ja-ho.wav", translation: "star" },
    ],
    id: "hiragana-h-row",
    title: "The H row",
  },
  {
    description: "The M row pairs an m sound with each of the five vowels.",
    entries: [
      { english: "mah", example: "まめ", exampleAudio: "/audio/ja-mame.wav", kana: "ま", kanaAudio: "/audio/ja-ma.wav", translation: "bean" },
      { english: "mee", example: "みみ", exampleAudio: "/audio/ja-mimi.wav", kana: "み", kanaAudio: "/audio/ja-mi.wav", translation: "ear" },
      { english: "moo", example: "むし", exampleAudio: "/audio/ja-mushi.wav", kana: "む", kanaAudio: "/audio/ja-mu.wav", translation: "insect" },
      { english: "meh", example: "め", exampleAudio: "/audio/ja-me.wav", kana: "め", kanaAudio: "/audio/ja-me.wav", translation: "eye" },
      { english: "moh", example: "もも", exampleAudio: "/audio/ja-momo.wav", kana: "も", kanaAudio: "/audio/ja-mo.wav", translation: "peach" },
    ],
    id: "hiragana-m-row",
    title: "The M row",
  },
  {
    description: "The Y row has only three modern basic kana: や, ゆ, and よ.",
    entries: [
      { english: "yah", example: "やま", exampleAudio: "/audio/ja-yama.wav", kana: "や", kanaAudio: "/audio/ja-ya.wav", translation: "mountain" },
      { english: "yoo", example: "ゆき", exampleAudio: "/audio/ja-yuki.wav", kana: "ゆ", kanaAudio: "/audio/ja-yu.wav", translation: "snow" },
      { english: "yoh", example: "よる", exampleAudio: "/audio/ja-yoru.wav", kana: "よ", kanaAudio: "/audio/ja-yo.wav", translation: "night" },
    ],
    id: "hiragana-y-row",
    title: "The Y row",
  },
  {
    description: "The R row uses a quick tongue tap between an English r and l; follow the audio closely.",
    entries: [
      { english: "rah", example: "らいねん", exampleAudio: "/audio/ja-rainen.wav", kana: "ら", kanaAudio: "/audio/ja-ra.wav", translation: "next year" },
      { english: "ree", example: "りす", exampleAudio: "/audio/ja-risu.wav", kana: "り", kanaAudio: "/audio/ja-ri.wav", translation: "squirrel" },
      { english: "roo", example: "るす", exampleAudio: "/audio/ja-rusu.wav", kana: "る", kanaAudio: "/audio/ja-ru.wav", translation: "away" },
      { english: "reh", example: "れきし", exampleAudio: "/audio/ja-rekishi.wav", kana: "れ", kanaAudio: "/audio/ja-re.wav", translation: "history" },
      { english: "roh", example: "ろく", exampleAudio: "/audio/ja-roku.wav", kana: "ろ", kanaAudio: "/audio/ja-ro.wav", translation: "six" },
    ],
    id: "hiragana-r-row",
    title: "The R row",
  },
  {
    description: "The W row keeps わ and を. を sounds like お and usually marks an object. ん closes a beat without a following vowel.",
    entries: [
      { english: "wah", example: "わに", exampleAudio: "/audio/ja-wani.wav", kana: "わ", kanaAudio: "/audio/ja-wa.wav", translation: "crocodile" },
      { english: "oh", example: "これを", exampleAudio: "/audio/ja-kore-o.wav", kana: "を", kanaAudio: "/audio/ja-wo.wav", translation: "this (object)" },
      { english: "nn", example: "ほん", exampleAudio: "/audio/ja-hon.wav", kana: "ん", kanaAudio: "/audio/ja-n.wav", translation: "book" },
    ],
    id: "hiragana-w-row",
    title: "The W row and ん",
  },
] as const;

type HiraganaTestEntry = {
  readonly english: string;
  readonly kana: string;
  readonly kanaAudio: string;
};

type HiraganaTest = {
  cards: HiraganaTestEntry[];
  title: string;
};

const ALL_HIRAGANA_TEST_ENTRIES = HIRAGANA_STUDY_GROUPS.reduce<HiraganaTestEntry[]>(
  (entries, group) => [...entries, ...group.entries],
  [],
);
const HIRAGANA_TEST_ENTRY_BY_KANA = new Map(
  ALL_HIRAGANA_TEST_ENTRIES.map((entry) => [entry.kana, entry]),
);
const BASIC_HIRAGANA_SET = new Set(
  ALL_HIRAGANA_TEST_ENTRIES.map((entry) => entry.kana),
);

export function HiraganaGuide() {
  const audioRef = useRef<HTMLAudioElement | null>(null);
  const completeDialogRef = useRef<HTMLDialogElement | null>(null);
  const dialogRef = useRef<HTMLDialogElement | null>(null);
  const resetDialogRef = useRef<HTMLDialogElement | null>(null);
  const stationOptionsRef = useRef<HTMLDetailsElement | null>(null);
  const [audioError, setAudioError] = useState(false);
  const [bulkKnowledgeAction, setBulkKnowledgeAction] = useState<"complete" | "reset" | null>(null);
  const [knowledgeError, setKnowledgeError] = useState(false);
  const [knownHiragana, setKnownHiragana] = useState<Set<string>>(() => new Set());
  const [activeTest, setActiveTest] = useState<HiraganaTest | null>(null);
  const [audioPlaying, setAudioPlaying] = useState(false);
  const [expandedGroups, setExpandedGroups] = useState<Set<string>>(() => new Set());
  const [pronunciationRevealed, setPronunciationRevealed] = useState(false);
  const [testIndex, setTestIndex] = useState(0);
  const activeCard = activeTest?.cards[testIndex] ?? null;
  const allHiraganaKnown = knownHiragana.size === ALL_HIRAGANA_TEST_ENTRIES.length;
  const hasHiraganaProgress = knownHiragana.size > 0;

  useEffect(() => {
    const controller = new AbortController();
    void fetch("/api/stations/hiragana/introduction", { method: "POST" });

    void fetch("/api/stations/hiragana/knowledge", {
      cache: "no-store",
      signal: controller.signal,
    })
      .then(async (response) => {
        if (!response.ok) throw new Error("Knowledge could not load");
        return response.json() as Promise<{ known?: unknown }>;
      })
      .then((payload) => {
        if (!Array.isArray(payload.known)) throw new Error("Knowledge is invalid");
        setKnownHiragana(new Set(
          payload.known.filter(
            (kana): kana is string => typeof kana === "string" && BASIC_HIRAGANA_SET.has(kana),
          ),
        ));
      })
      .catch(() => {
        if (!controller.signal.aborted) setKnowledgeError(true);
      });

    return () => controller.abort();
  }, []);

  useEffect(() => {
    const dialog = dialogRef.current;
    if (activeTest && dialog && !dialog.open) dialog.showModal();
  }, [activeTest]);

  useEffect(() => {
    function dismissStationOptions(event: PointerEvent) {
      const stationOptions = stationOptionsRef.current;
      if (
        stationOptions?.open
        && event.target instanceof Node
        && !stationOptions.contains(event.target)
      ) {
        stationOptions.open = false;
      }
    }

    function closeStationOptionsWithEscape(event: KeyboardEvent) {
      const stationOptions = stationOptionsRef.current;
      if (event.key !== "Escape" || !stationOptions?.open) return;

      stationOptions.open = false;
      stationOptions.querySelector<HTMLElement>("summary")?.focus();
    }

    document.addEventListener("pointerdown", dismissStationOptions);
    document.addEventListener("keydown", closeStationOptionsWithEscape);
    return () => {
      document.removeEventListener("pointerdown", dismissStationOptions);
      document.removeEventListener("keydown", closeStationOptionsWithEscape);
    };
  }, []);

  async function playAudio(src: string) {
    setAudioError(false);
    setAudioPlaying(false);
    const audio = audioRef.current;
    if (!audio) {
      setAudioError(true);
      return;
    }

    audio.pause();
    audio.src = src;
    audio.currentTime = 0;
    try {
      await audio.play();
    } catch {
      setAudioError(true);
      setAudioPlaying(false);
    }
  }

  function stopAudio() {
    const audio = audioRef.current;
    if (audio) {
      audio.pause();
      audio.currentTime = 0;
    }
    setAudioPlaying(false);
  }

  function renderKana(kana: { readonly audio: string; readonly character: string }) {
    const testEntry = HIRAGANA_TEST_ENTRY_BY_KANA.get(kana.character);
    if (!testEntry) throw new Error(`Missing flashcard for ${kana.character}`);

    const isKnown = knownHiragana.has(kana.character);
    return (
      <button
        aria-label={`Study ${kana.character}${isKnown ? ", marked known" : ""}`}
        className={`hiragana-button${isKnown ? " hiragana-button-known" : ""}`}
        data-known={isKnown ? "true" : undefined}
        onClick={() => openTest("Hiragana", [testEntry])}
        type="button"
      >
        <span lang="ja">{kana.character}</span>
      </button>
    );
  }

  function renderStudyKana(entry: HiraganaTestEntry) {
    const isKnown = knownHiragana.has(entry.kana);
    return (
      <button
        aria-label={`Study ${entry.kana}${isKnown ? ", marked known" : ""}`}
        className={`kana-study-button kana-study-kana-button${isKnown ? " kana-study-button-known" : ""}`}
        data-known={isKnown ? "true" : undefined}
        onClick={() => openTest("Hiragana", [entry])}
        type="button"
      >
        <span lang="ja">{entry.kana}</span>
      </button>
    );
  }

  function openTest(title: string, entries: readonly HiraganaTestEntry[]) {
    stopAudio();
    setKnowledgeError(false);
    setPronunciationRevealed(false);
    setTestIndex(0);
    setActiveTest({ cards: shuffle(entries), title });
  }

  function closeTest() {
    stopAudio();
    dialogRef.current?.close();
    setActiveTest(null);
    setPronunciationRevealed(false);
    setTestIndex(0);
  }

  function revealPronunciation() {
    if (!activeCard) return;
    setPronunciationRevealed(true);
    void playAudio(activeCard.kanaAudio);
  }

  function answerCard(known: boolean) {
    if (!activeCard || !activeTest) return;

    stopAudio();
    setPronunciationRevealed(false);
    const kana = activeCard.kana;
    const wasKnown = knownHiragana.has(kana);
    updateKnownState(kana, known);
    setKnowledgeError(false);

    void fetch("/api/stations/hiragana/knowledge", {
      body: JSON.stringify({ kana, known }),
      headers: { "Content-Type": "application/json" },
      method: "PUT",
    }).then((response) => {
      if (!response.ok) throw new Error("Knowledge could not save");
    }).catch(() => {
      updateKnownState(kana, wasKnown);
      setKnowledgeError(true);
    });

    if (testIndex + 1 >= activeTest.cards.length) {
      closeTest();
    } else {
      setTestIndex((current) => current + 1);
    }
  }

  function updateKnownState(kana: string, known: boolean) {
    setKnownHiragana((current) => {
      const next = new Set(current);
      if (known) next.add(kana);
      else next.delete(kana);
      return next;
    });
  }

  function toggleStudyGroup(groupId: string) {
    setExpandedGroups((current) => {
      const next = new Set(current);
      if (next.has(groupId)) next.delete(groupId);
      else next.add(groupId);
      return next;
    });
  }

  async function setAllKnowledge(known: boolean) {
    setBulkKnowledgeAction(known ? "complete" : "reset");
    setKnowledgeError(false);

    try {
      const response = await fetch("/api/stations/hiragana/knowledge", {
        body: JSON.stringify({ known }),
        headers: { "Content-Type": "application/json" },
        method: "PATCH",
      });
      if (!response.ok) throw new Error("Knowledge could not save");

      const payload = await response.json() as { known?: unknown };
      if (!Array.isArray(payload.known)) throw new Error("Knowledge is invalid");
      const nextKnown = payload.known.filter(
        (kana): kana is string => typeof kana === "string" && BASIC_HIRAGANA_SET.has(kana),
      );
      if (nextKnown.length !== payload.known.length) throw new Error("Knowledge is invalid");

      setKnownHiragana(new Set(nextKnown));
      closeStationOptions();
      if (known) completeDialogRef.current?.close();
      else resetDialogRef.current?.close();
    } catch {
      setKnowledgeError(true);
    } finally {
      setBulkKnowledgeAction(null);
    }
  }

  function closeStationOptions() {
    if (stationOptionsRef.current) stationOptionsRef.current.open = false;
  }

  function openCompleteDialog() {
    closeStationOptions();
    completeDialogRef.current?.showModal();
  }

  function openResetDialog() {
    closeStationOptions();
    resetDialogRef.current?.showModal();
  }

  function renderTestButton(
    title: string,
    entries: readonly HiraganaTestEntry[],
  ) {
    const knownCount = entries.filter((entry) => knownHiragana.has(entry.kana)).length;
    const total = entries.length;
    const remainingCount = total - knownCount;
    const testLabel = remainingCount === 0
      ? `Test ${title}. Complete.`
      : `Test ${title}. ${remainingCount} remaining.`;

    return (
      <span className="hiragana-test-trigger-wrap">
        <button
          aria-label={testLabel}
          className="hiragana-test-trigger"
          data-complete={remainingCount === 0 ? "true" : undefined}
          onClick={() => openTest(title, entries)}
          style={{ "--hiragana-test-progress": `${knownCount / total}turn` } as CSSProperties}
          type="button"
        >
          <span className="hiragana-test-progress-text">
            {remainingCount === 0 ? (
              <svg aria-hidden="true" className="hiragana-test-complete-icon" viewBox="0 0 16 16">
                <path d="m3 8.5 3 3 7-7" />
              </svg>
            ) : remainingCount}
          </span>
        </button>
        <span className="network-tooltip hiragana-test-tooltip">
          {testLabel}
        </span>
      </span>
    );
  }

  return (
    <>
      <header className="station-heading">
        <div className="station-heading-row">
          <div aria-label="Lines" className="station-memberships">
            <span className="station-membership station-membership-writing" data-line="writing">
              Writing
            </span>
          </div>
          <div className="station-heading-actions">
            <details className="station-options" ref={stationOptionsRef}>
              <summary aria-label="Station options">
                <svg aria-hidden="true" viewBox="0 0 20 20">
                  <circle cx="4" cy="10" r="1.5" />
                  <circle cx="10" cy="10" r="1.5" />
                  <circle cx="16" cy="10" r="1.5" />
                </svg>
              </summary>
              <div aria-label="Station options" className="station-options-menu">
                <button
                  aria-label="Close station options"
                  className="station-options-close"
                  onClick={closeStationOptions}
                  type="button"
                >
                  <svg aria-hidden="true" viewBox="0 0 16 16">
                    <path d="m4 4 8 8M12 4l-8 8" />
                  </svg>
                </button>
                {!allHiraganaKnown ? (
                  <button
                    className="station-options-action"
                    disabled={bulkKnowledgeAction !== null}
                    onClick={openCompleteDialog}
                    type="button"
                  >
                    <svg aria-hidden="true" viewBox="0 0 16 16">
                      <path d="m3 8.5 3 3 7-7" />
                    </svg>
                    <span>I know this</span>
                  </button>
                ) : null}
                {hasHiraganaProgress ? (
                  <button
                    className="station-options-action"
                    disabled={bulkKnowledgeAction !== null}
                    onClick={openResetDialog}
                    type="button"
                  >
                    <svg aria-hidden="true" viewBox="0 0 16 16">
                      <path d="M12.5 5.5A5 5 0 1 0 13 10" />
                      <path d="M12.5 2.5v3h-3" />
                    </svg>
                    <span>Reset station</span>
                  </button>
                ) : null}
              </div>
            </details>
            {renderTestButton("All Hiragana", ALL_HIRAGANA_TEST_ENTRIES)}
          </div>
        </div>
        <h1>Hiragana</h1>
      </header>

      <section className="hiragana-guide">
        <audio
          onEnded={() => setAudioPlaying(false)}
          onError={() => {
            setAudioError(true);
            setAudioPlaying(false);
          }}
          onPause={() => setAudioPlaying(false)}
          onPlaying={() => setAudioPlaying(true)}
          preload="none"
          ref={audioRef}
        />
        <div className="station-intro hiragana-intro">
          <p><strong>Hiragana is the everyday Kana system.</strong> Its rounded characters appear throughout Japanese sentences, for complete words as well as the grammatical parts around them.</p>
          <p>There are 46 basic Hiragana, arranged under the five vowel sounds you already know: あ, い, う, え, お. Learning them lets you sound out written Japanese, even before you know what every word means. Tap any Kana to hear it.</p>
        </div>

      <table aria-label="The 46 basic hiragana" className="hiragana-table">
        <thead>
          <tr>
            {HIRAGANA_VOWEL_SOUNDS.map((sound) => (
              <th aria-label={`Column of sounds ending in ${sound}`} key={sound} scope="col">
                {sound}
              </th>
            ))}
          </tr>
        </thead>
        <tbody>
          {HIRAGANA_ROWS.map((row, rowIndex) => (
            <tr key={rowIndex}>
              {row.map((kana, columnIndex) => (
                <td className={kana ? undefined : "hiragana-empty"} key={columnIndex}>
                  {kana ? renderKana(kana) : null}
                </td>
              ))}
            </tr>
          ))}
          <tr>
            <td className="hiragana-final" colSpan={5}>{renderKana(FINAL_HIRAGANA)}</td>
          </tr>
        </tbody>
      </table>

      {audioError ? <p className="station-audio-error" role="alert">Audio could not play. Try again.</p> : null}
      {knowledgeError ? <p className="station-knowledge-error" role="alert">Your Hiragana progress could not sync. Try again.</p> : null}

      <div className="station-notes">
        <p><strong>Read each row across.</strong> The vowel pattern stays in the same five-column order.</p>
        <p><strong>This is the base chart.</strong> Sound marks and small kana extend these forms without replacing them.</p>
      </div>

      <section aria-labelledby="hiragana-groups-title" className="hiragana-groups">
        <header className="hiragana-groups-heading">
          <h2 id="hiragana-groups-title">Hear them in words</h2>
          <p>Work through one row at a time. Tap a kana or example to hear it. English spellings are approximate; follow the audio.</p>
        </header>

        {HIRAGANA_STUDY_GROUPS.map((group) => {
          const expanded = expandedGroups.has(group.id);
          return (
            <section aria-labelledby={`${group.id}-title`} className="hiragana-study-group" key={group.id}>
              <div className="hiragana-study-group-heading">
                <h3 id={`${group.id}-title`}>
                  <button
                    aria-controls={`${group.id}-content`}
                    aria-expanded={expanded}
                    className="hiragana-study-group-toggle"
                    onClick={() => toggleStudyGroup(group.id)}
                    type="button"
                  >
                    <span>{group.title}</span>
                    <svg aria-hidden="true" className="hiragana-study-group-chevron" viewBox="0 0 16 16">
                      <path d="m3 6 5 5 5-5" />
                    </svg>
                  </button>
                </h3>
                {renderTestButton(group.title, group.entries)}
              </div>
              <div className="hiragana-study-group-content" hidden={!expanded} id={`${group.id}-content`}>
                <p>{group.description}</p>
                <table aria-label={group.title} className="kana-study-table">
                  <colgroup>
                    <col className="kana-study-col-kana" />
                    <col className="kana-study-col-cue" />
                    <col className="kana-study-col-example" />
                    <col className="kana-study-col-translation" />
                  </colgroup>
                  <thead>
                    <tr>
                      <th scope="col">Kana</th>
                      <th scope="col">Sound</th>
                      <th scope="col">Example</th>
                      <th scope="col">Translation</th>
                    </tr>
                  </thead>
                  <tbody>
                    {group.entries.map((entry) => (
                      <tr key={entry.kana}>
                        <td>{renderStudyKana(entry)}</td>
                        <td className="kana-study-cue">{entry.english}</td>
                        <td>
                          <button
                            aria-label={`Play example word ${entry.example}`}
                            className="kana-study-button kana-study-example-button"
                            onClick={() => playAudio(entry.exampleAudio)}
                            type="button"
                          >
                            <span lang="ja">{entry.example}</span>
                          </button>
                        </td>
                        <td className="kana-study-translation">{entry.translation}</td>
                      </tr>
                    ))}
                  </tbody>
                </table>
                {group.id === "hiragana-vowels" ? (
                  <div className="kana-study-notes">
                    <p><strong>One symbol, one steady sound.</strong> English vowels often glide; Japanese vowels stay comparatively clean.</p>
                    <p><strong>Length matters.</strong> Holding a vowel longer can change a word&apos;s meaning.</p>
                  </div>
                ) : null}
              </div>
            </section>
          );
        })}
      </section>

        {activeTest && activeCard ? (
          <dialog
          aria-labelledby="hiragana-test-title"
          className="hiragana-test-dialog"
          onCancel={(event) => {
            event.preventDefault();
            closeTest();
          }}
          onClose={() => setActiveTest(null)}
          ref={dialogRef}
        >
          <div className="hiragana-test-modal">
            <header className="hiragana-test-modal-heading">
              <h2 id="hiragana-test-title">{activeTest.title}</h2>
              <button
                aria-label="Close test"
                className="hiragana-test-close"
                onClick={closeTest}
                type="button"
              >
                <span aria-hidden="true">×</span>
              </button>
            </header>

            <button
              aria-label={`Play ${activeCard.kana} and reveal its pronunciation`}
              className="hiragana-test-card"
              data-playing={audioPlaying ? "true" : undefined}
              onClick={revealPronunciation}
              type="button"
            >
              <span aria-hidden="true" className="hiragana-test-playing-indicator">
                <span />
                <span />
                <span />
              </span>
              <span className="hiragana-test-card-kana" lang="ja">{activeCard.kana}</span>
              <span aria-hidden="true" className="hiragana-test-pronunciation">
                {pronunciationRevealed ? activeCard.english : "\u00a0"}
              </span>
            </button>
            <span aria-live="polite" className="sr-only">
              {pronunciationRevealed ? activeCard.english : ""}
            </span>
            <p className="hiragana-test-instruction">Say the sound, then tap the Kana to hear it and reveal the pronunciation.</p>

            <div className="hiragana-test-actions">
              <button
                className="hiragana-test-answer hiragana-test-answer-no"
                onClick={() => answerCard(false)}
                type="button"
              >
                <svg aria-hidden="true" className="hiragana-test-answer-icon" viewBox="0 0 16 16">
                  <path d="m4 4 8 8M12 4l-8 8" />
                </svg>
                <span>No</span>
              </button>
              <button
                className="hiragana-test-answer hiragana-test-answer-yes"
                onClick={() => answerCard(true)}
                type="button"
              >
                <svg aria-hidden="true" className="hiragana-test-answer-icon" viewBox="0 0 16 16">
                  <path d="m3 8.5 3 3 7-7" />
                </svg>
                <span>Yes</span>
              </button>
            </div>
          </div>
          </dialog>
        ) : null}
        <dialog
          aria-labelledby="hiragana-complete-title"
          className="station-confirm-dialog"
          onCancel={(event) => {
            event.preventDefault();
            completeDialogRef.current?.close();
          }}
          ref={completeDialogRef}
        >
          <div className="station-confirm-modal">
            <h2 id="hiragana-complete-title">Mark Hiragana complete?</h2>
            <p>This marks all 46 Hiragana as complete and unlocks Katakana.</p>
            <div className="hiragana-test-actions">
              <button
                className="hiragana-test-answer hiragana-test-answer-no"
                disabled={bulkKnowledgeAction !== null}
                onClick={() => completeDialogRef.current?.close()}
                type="button"
              >
                <svg aria-hidden="true" className="hiragana-test-answer-icon" viewBox="0 0 16 16">
                  <path d="m4 4 8 8M12 4l-8 8" />
                </svg>
                <span>Cancel</span>
              </button>
              <button
                className="hiragana-test-answer hiragana-test-answer-yes"
                disabled={bulkKnowledgeAction !== null}
                onClick={() => void setAllKnowledge(true)}
                type="button"
              >
                <svg aria-hidden="true" className="hiragana-test-answer-icon" viewBox="0 0 16 16">
                  <path d="m3 8.5 3 3 7-7" />
                </svg>
                <span>{bulkKnowledgeAction === "complete" ? "Completing…" : "Complete"}</span>
              </button>
            </div>
          </div>
        </dialog>
        <dialog
          aria-labelledby="hiragana-reset-title"
          className="station-confirm-dialog"
          onCancel={(event) => {
            event.preventDefault();
            resetDialogRef.current?.close();
          }}
          ref={resetDialogRef}
        >
          <div className="station-confirm-modal">
            <h2 id="hiragana-reset-title">Reset Hiragana?</h2>
            <p>This marks all 46 Hiragana as incomplete. Later stations will stay hidden until Hiragana is complete again.</p>
            <div className="hiragana-test-actions">
              <button
                className="hiragana-test-answer hiragana-test-answer-no"
                disabled={bulkKnowledgeAction !== null}
                onClick={() => resetDialogRef.current?.close()}
                type="button"
              >
                <svg aria-hidden="true" className="hiragana-test-answer-icon" viewBox="0 0 16 16">
                  <path d="m4 4 8 8M12 4l-8 8" />
                </svg>
                <span>Cancel</span>
              </button>
              <button
                className="hiragana-test-answer station-confirm-reset"
                disabled={bulkKnowledgeAction !== null}
                onClick={() => void setAllKnowledge(false)}
                type="button"
              >
                <svg aria-hidden="true" className="hiragana-test-answer-icon" viewBox="0 0 16 16">
                  <path d="M12.5 5.5A5 5 0 1 0 13 10" />
                  <path d="M12.5 2.5v3h-3" />
                </svg>
                <span>{bulkKnowledgeAction === "reset" ? "Resetting…" : "Reset"}</span>
              </button>
            </div>
          </div>
        </dialog>
      </section>
    </>
  );
}

function shuffle<T>(entries: readonly T[]): T[] {
  const shuffled = [...entries];
  for (let index = shuffled.length - 1; index > 0; index -= 1) {
    const replacement = Math.floor(Math.random() * (index + 1));
    [shuffled[index], shuffled[replacement]] = [shuffled[replacement], shuffled[index]];
  }
  return shuffled;
}
