"use client";

import type { CSSProperties } from "react";
import { useEffect, useRef, useState } from "react";
import type { KanaExtensionPatternId } from "@/src/modules/learning/kana-extensions";

type ExtensionEntry = {
  readonly audio: string;
  readonly cue: string;
  readonly example: string;
  readonly exampleAudio: string;
  readonly hiragana: string;
  readonly id: KanaExtensionPatternId;
  readonly katakana: string;
  readonly translation: string;
};

type ExtensionGroup = {
  readonly description: string;
  readonly entries: readonly ExtensionEntry[];
  readonly id: string;
  readonly referenceRows: readonly {
    readonly hiragana: string;
    readonly katakana: string;
    readonly label: string;
  }[];
  readonly title: string;
};

const KANA_EXTENSION_GROUPS: readonly ExtensionGroup[] = [
  {
    description: "Two short marks change an existing row. Dakuten (゛) voices a consonant; handakuten (゜) turns the H row into the P row.",
    entries: [
      { audio: "/audio/ja-ga.wav", cue: "gah", example: "がくせい", exampleAudio: "/audio/ja-gakusei.wav", hiragana: "が", id: "dakuten-k", katakana: "ガ", translation: "student" },
      { audio: "/audio/ja-za.wav", cue: "zah", example: "かざん", exampleAudio: "/audio/ja-kazan.wav", hiragana: "ざ", id: "dakuten-s", katakana: "ザ", translation: "volcano" },
      { audio: "/audio/ja-da.wav", cue: "dah", example: "くだもの", exampleAudio: "/audio/ja-kudamono.wav", hiragana: "だ", id: "dakuten-t", katakana: "ダ", translation: "fruit" },
      { audio: "/audio/ja-ba.wav", cue: "bah", example: "かばん", exampleAudio: "/audio/ja-kaban.wav", hiragana: "ば", id: "dakuten-h", katakana: "バ", translation: "bag" },
      { audio: "/audio/ja-pa.wav", cue: "pah", example: "ぱん", exampleAudio: "/audio/ja-pan.wav", hiragana: "ぱ", id: "handakuten-h", katakana: "パ", translation: "bread" },
    ],
    id: "kana-extension-sound-marks",
    referenceRows: [
      { hiragana: "が ぎ ぐ げ ご", katakana: "ガ ギ グ ゲ ゴ", label: "K → G" },
      { hiragana: "ざ じ ず ぜ ぞ", katakana: "ザ ジ ズ ゼ ゾ", label: "S → Z" },
      { hiragana: "だ ぢ づ で ど", katakana: "ダ ヂ ヅ デ ド", label: "T → D" },
      { hiragana: "ば び ぶ べ ぼ", katakana: "バ ビ ブ ベ ボ", label: "H → B" },
      { hiragana: "ぱ ぴ ぷ ぺ ぽ", katakana: "パ ピ プ ペ ポ", label: "H → P" },
    ],
    title: "Sound marks",
  },
  {
    description: "A small ゃ, ゅ, or ょ combines with an I-column kana into one blended sound. Katakana uses the matching small ャ, ュ, and ョ.",
    entries: [
      { audio: "/audio/ja-kya.wav", cue: "kyah", example: "きゃく", exampleAudio: "/audio/ja-kyaku.wav", hiragana: "きゃ", id: "small-kya", katakana: "キャ", translation: "guest" },
      { audio: "/audio/ja-shu.wav", cue: "shoo", example: "しゅみ", exampleAudio: "/audio/ja-shumi.wav", hiragana: "しゅ", id: "small-shu", katakana: "シュ", translation: "hobby" },
      { audio: "/audio/ja-cho.wav", cue: "choh", example: "ちょきん", exampleAudio: "/audio/ja-chokin.wav", hiragana: "ちょ", id: "small-cho", katakana: "チョ", translation: "savings" },
      { audio: "/audio/ja-nyu.wav", cue: "nyoo", example: "にゅうがく", exampleAudio: "/audio/ja-nyuugaku.wav", hiragana: "にゅ", id: "small-nyu", katakana: "ニュ", translation: "school admission" },
      { audio: "/audio/ja-ryo.wav", cue: "ryoh", example: "りょこう", exampleAudio: "/audio/ja-ryokou.wav", hiragana: "りょ", id: "small-ryo", katakana: "リョ", translation: "travel" },
    ],
    id: "kana-extension-small-combinations",
    referenceRows: [
      { hiragana: "きゃ きゅ きょ", katakana: "キャ キュ キョ", label: "K" },
      { hiragana: "しゃ しゅ しょ", katakana: "シャ シュ ショ", label: "S" },
      { hiragana: "ちゃ ちゅ ちょ", katakana: "チャ チュ チョ", label: "T" },
      { hiragana: "にゃ にゅ にょ", katakana: "ニャ ニュ ニョ", label: "N" },
      { hiragana: "ひゃ ひゅ ひょ", katakana: "ヒャ ヒュ ヒョ", label: "H" },
      { hiragana: "みゃ みゅ みょ", katakana: "ミャ ミュ ミョ", label: "M" },
      { hiragana: "りゃ りゅ りょ", katakana: "リャ リュ リョ", label: "R" },
      { hiragana: "ぎゃ ぎゅ ぎょ", katakana: "ギャ ギュ ギョ", label: "G" },
      { hiragana: "じゃ じゅ じょ", katakana: "ジャ ジュ ジョ", label: "J" },
      { hiragana: "びゃ びゅ びょ", katakana: "ビャ ビュ ビョ", label: "B" },
      { hiragana: "ぴゃ ぴゅ ぴょ", katakana: "ピャ ピュ ピョ", label: "P" },
    ],
    title: "Small combinations",
  },
  {
    description: "Small っ and ッ hold the next consonant for one beat. Katakana ー holds the vowel before it; Hiragana usually writes the extra vowel directly.",
    entries: [
      { audio: "/audio/ja-kitte.wav", cue: "hold the next consonant", example: "きって", exampleAudio: "/audio/ja-kitte.wav", hiragana: "っ", id: "small-tsu", katakana: "ッ", translation: "stamp" },
      { audio: "/audio/ja-keeki.wav", cue: "hold the vowel", example: "ケーキ", exampleAudio: "/audio/ja-keeki.wav", hiragana: "おう", id: "long-vowel", katakana: "ー", translation: "cake" },
    ],
    id: "kana-extension-timing-signs",
    referenceRows: [],
    title: "Timing signs",
  },
];

const ALL_EXTENSION_ENTRIES = KANA_EXTENSION_GROUPS.flatMap((group) => group.entries);
const EXTENSION_ENTRY_IDS: ReadonlySet<string> = new Set(
  ALL_EXTENSION_ENTRIES.map((entry) => entry.id),
);

type ExtensionTest = {
  cards: ExtensionEntry[];
  title: string;
};

export function KanaExtensionsGuide() {
  const audioRef = useRef<HTMLAudioElement | null>(null);
  const completeDialogRef = useRef<HTMLDialogElement | null>(null);
  const dialogRef = useRef<HTMLDialogElement | null>(null);
  const resetDialogRef = useRef<HTMLDialogElement | null>(null);
  const stationOptionsRef = useRef<HTMLDetailsElement | null>(null);
  const [activeTest, setActiveTest] = useState<ExtensionTest | null>(null);
  const [audioError, setAudioError] = useState(false);
  const [audioPlaying, setAudioPlaying] = useState(false);
  const [bulkKnowledgeAction, setBulkKnowledgeAction] = useState<"complete" | "reset" | null>(null);
  const [expandedGroups, setExpandedGroups] = useState<Set<string>>(() => new Set());
  const [knowledgeError, setKnowledgeError] = useState(false);
  const [knownPatterns, setKnownPatterns] = useState<Set<KanaExtensionPatternId>>(() => new Set());
  const [pronunciationRevealed, setPronunciationRevealed] = useState(false);
  const [testIndex, setTestIndex] = useState(0);
  const activeCard = activeTest?.cards[testIndex] ?? null;
  const allPatternsKnown = knownPatterns.size === ALL_EXTENSION_ENTRIES.length;
  const hasProgress = knownPatterns.size > 0;

  useEffect(() => {
    const controller = new AbortController();
    void fetch("/api/stations/kana-extensions/introduction", { method: "POST" });

    void fetch("/api/stations/kana-extensions/knowledge", {
      cache: "no-store",
      signal: controller.signal,
    })
      .then(async (response) => {
        if (!response.ok) throw new Error("Knowledge could not load");
        return response.json() as Promise<{ known?: unknown }>;
      })
      .then((payload) => {
        if (!Array.isArray(payload.known)) throw new Error("Knowledge is invalid");
        setKnownPatterns(new Set(
          payload.known.filter(
            (patternId): patternId is KanaExtensionPatternId => (
              typeof patternId === "string" && EXTENSION_ENTRY_IDS.has(patternId)
            ),
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

  function openTest(title: string, entries: readonly ExtensionEntry[]) {
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
    void playAudio(activeCard.audio);
  }

  function answerCard(known: boolean) {
    if (!activeCard || !activeTest) return;

    stopAudio();
    setPronunciationRevealed(false);
    const patternId = activeCard.id;
    const wasKnown = knownPatterns.has(patternId);
    updateKnownState(patternId, known);
    setKnowledgeError(false);

    void fetch("/api/stations/kana-extensions/knowledge", {
      body: JSON.stringify({ patternId, known }),
      headers: { "Content-Type": "application/json" },
      method: "PUT",
    }).then((response) => {
      if (!response.ok) throw new Error("Knowledge could not save");
    }).catch(() => {
      updateKnownState(patternId, wasKnown);
      setKnowledgeError(true);
    });

    if (testIndex + 1 >= activeTest.cards.length) closeTest();
    else setTestIndex((current) => current + 1);
  }

  function updateKnownState(patternId: KanaExtensionPatternId, known: boolean) {
    setKnownPatterns((current) => {
      const next = new Set(current);
      if (known) next.add(patternId);
      else next.delete(patternId);
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
      const response = await fetch("/api/stations/kana-extensions/knowledge", {
        body: JSON.stringify({ known }),
        headers: { "Content-Type": "application/json" },
        method: "PATCH",
      });
      if (!response.ok) throw new Error("Knowledge could not save");

      const payload = await response.json() as { known?: unknown };
      if (!Array.isArray(payload.known)) throw new Error("Knowledge is invalid");
      const nextKnown = payload.known.filter(
        (patternId): patternId is KanaExtensionPatternId => (
          typeof patternId === "string" && EXTENSION_ENTRY_IDS.has(patternId)
        ),
      );
      if (nextKnown.length !== payload.known.length) throw new Error("Knowledge is invalid");

      setKnownPatterns(new Set(nextKnown));
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

  function renderTestButton(
    title: string,
    entries: readonly ExtensionEntry[],
  ) {
    const knownCount = entries.filter((entry) => knownPatterns.has(entry.id)).length;
    const remainingCount = entries.length - knownCount;
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
          style={{ "--hiragana-test-progress": `${knownCount / entries.length}turn` } as CSSProperties}
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
        <span className="network-tooltip hiragana-test-tooltip">{testLabel}</span>
      </span>
    );
  }

  function renderPair(entry: ExtensionEntry) {
    const isKnown = knownPatterns.has(entry.id);
    return (
      <button
        aria-label={`Study ${entry.hiragana} and ${entry.katakana}${isKnown ? ", marked known" : ""}`}
        className={`kana-extension-pair${isKnown ? " kana-extension-pair-known" : ""}`}
        data-known={isKnown ? "true" : undefined}
        onClick={() => openTest("Kana extensions", [entry])}
        type="button"
      >
        <span lang="ja">{entry.hiragana}</span>
        <span aria-hidden="true" className="kana-extension-pair-divider">／</span>
        <span lang="ja">{entry.katakana}</span>
      </button>
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
                <button aria-label="Close station options" className="station-options-close" onClick={closeStationOptions} type="button">
                  <svg aria-hidden="true" viewBox="0 0 16 16">
                    <path d="m4 4 8 8M12 4l-8 8" />
                  </svg>
                </button>
                {!allPatternsKnown ? (
                  <button
                    className="station-options-action"
                    disabled={bulkKnowledgeAction !== null}
                    onClick={() => {
                      closeStationOptions();
                      completeDialogRef.current?.showModal();
                    }}
                    type="button"
                  >
                    <svg aria-hidden="true" viewBox="0 0 16 16"><path d="m3 8.5 3 3 7-7" /></svg>
                    <span>I know this</span>
                  </button>
                ) : null}
                {hasProgress ? (
                  <button
                    className="station-options-action"
                    disabled={bulkKnowledgeAction !== null}
                    onClick={() => {
                      closeStationOptions();
                      resetDialogRef.current?.showModal();
                    }}
                    type="button"
                  >
                    <svg aria-hidden="true" viewBox="0 0 16 16"><path d="M12.5 5.5A5 5 0 1 0 13 10" /><path d="M12.5 2.5v3h-3" /></svg>
                    <span>Reset station</span>
                  </button>
                ) : null}
              </div>
            </details>
            {renderTestButton("All Kana extensions", ALL_EXTENSION_ENTRIES)}
          </div>
        </div>
        <h1>Kana extensions</h1>
      </header>

      <section className="kana-extensions-guide">
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
        <div className="station-intro kana-extensions-intro">
          <p><strong>The 46 basic Kana are a starting set, not a sound limit.</strong> Small marks and small Kana reshape forms you already know into more Japanese sounds.</p>
          <p>Hiragana and Katakana use the same extension patterns. Learn the change once, then connect its two written shapes.</p>
        </div>

        {audioError ? <p className="station-audio-error" role="alert">Audio could not play. Try again.</p> : null}
        {knowledgeError ? <p className="station-knowledge-error" role="alert">Your Kana extension progress could not sync. Try again.</p> : null}

        <section aria-labelledby="kana-extension-groups-title" className="hiragana-groups kana-extension-groups">
          <header className="hiragana-groups-heading">
            <h2 id="kana-extension-groups-title">Change the familiar forms</h2>
            <p>Open one pattern at a time. Tap a Kana pair to test it, or tap an example word to hear the pattern in context.</p>
          </header>

          {KANA_EXTENSION_GROUPS.map((group) => {
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
                      <svg aria-hidden="true" className="hiragana-study-group-chevron" viewBox="0 0 16 16"><path d="m3 6 5 5 5-5" /></svg>
                    </button>
                  </h3>
                  {renderTestButton(group.title, group.entries)}
                </div>
                <div className="hiragana-study-group-content" hidden={!expanded} id={`${group.id}-content`}>
                  <p>{group.description}</p>
                  {group.referenceRows.length > 0 ? (
                    <div aria-label={`${group.title} reference`} className="kana-extension-reference" role="list">
                      {group.referenceRows.map((row) => (
                        <div className="kana-extension-reference-row" key={row.label} role="listitem">
                          <span className="kana-extension-reference-label">{row.label}</span>
                          <span lang="ja">{row.hiragana}</span>
                          <span lang="ja">{row.katakana}</span>
                        </div>
                      ))}
                    </div>
                  ) : null}
                  <table aria-label={`${group.title} examples`} className="kana-extension-table">
                    <thead>
                      <tr>
                        <th scope="col">Kana</th>
                        <th scope="col">Cue</th>
                        <th scope="col">Example</th>
                        <th scope="col">Translation</th>
                      </tr>
                    </thead>
                    <tbody>
                      {group.entries.map((entry) => (
                        <tr key={entry.id}>
                          <td>{renderPair(entry)}</td>
                          <td className="kana-extension-cue">{entry.cue}</td>
                          <td>
                            <button aria-label={`Play example word ${entry.example}`} className="kana-extension-example" onClick={() => void playAudio(entry.exampleAudio)} type="button">
                              <span lang="ja">{entry.example}</span>
                            </button>
                          </td>
                          <td className="kana-extension-translation">{entry.translation}</td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              </section>
            );
          })}
        </section>

        {activeTest && activeCard ? (
          <dialog
            aria-labelledby="kana-extension-test-title"
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
                <h2 id="kana-extension-test-title">{activeTest.title}</h2>
                <button aria-label="Close test" className="hiragana-test-close" onClick={closeTest} type="button"><span aria-hidden="true">×</span></button>
              </header>
              <button
                aria-label={`Play ${activeCard.hiragana} and ${activeCard.katakana} and reveal the cue`}
                className="hiragana-test-card kana-extension-test-card"
                data-playing={audioPlaying ? "true" : undefined}
                onClick={revealPronunciation}
                type="button"
              >
                <span aria-hidden="true" className="hiragana-test-playing-indicator"><span /><span /><span /></span>
                <span className="hiragana-test-card-kana kana-extension-test-pair" lang="ja">{activeCard.hiragana} <span aria-hidden="true">／</span> {activeCard.katakana}</span>
                <span aria-hidden="true" className="hiragana-test-pronunciation">{pronunciationRevealed ? activeCard.cue : "\u00a0"}</span>
              </button>
              <span aria-live="polite" className="sr-only">{pronunciationRevealed ? activeCard.cue : ""}</span>
              <p className="hiragana-test-instruction">Say the sound or rule, then tap the pair to hear it and reveal the cue.</p>
              <div className="hiragana-test-actions">
                <button className="hiragana-test-answer hiragana-test-answer-no" onClick={() => answerCard(false)} type="button"><svg aria-hidden="true" className="hiragana-test-answer-icon" viewBox="0 0 16 16"><path d="m4 4 8 8M12 4l-8 8" /></svg><span>No</span></button>
                <button className="hiragana-test-answer hiragana-test-answer-yes" onClick={() => answerCard(true)} type="button"><svg aria-hidden="true" className="hiragana-test-answer-icon" viewBox="0 0 16 16"><path d="m3 8.5 3 3 7-7" /></svg><span>Yes</span></button>
              </div>
            </div>
          </dialog>
        ) : null}

        <dialog aria-labelledby="kana-extension-complete-title" className="station-confirm-dialog" onCancel={(event) => { event.preventDefault(); completeDialogRef.current?.close(); }} ref={completeDialogRef}>
          <div className="station-confirm-modal">
            <h2 id="kana-extension-complete-title">Mark Kana extensions complete?</h2>
            <p>This marks all 12 extension patterns as complete.</p>
            <div className="hiragana-test-actions">
              <button className="hiragana-test-answer hiragana-test-answer-no" disabled={bulkKnowledgeAction !== null} onClick={() => completeDialogRef.current?.close()} type="button"><svg aria-hidden="true" className="hiragana-test-answer-icon" viewBox="0 0 16 16"><path d="m4 4 8 8M12 4l-8 8" /></svg><span>Cancel</span></button>
              <button className="hiragana-test-answer hiragana-test-answer-yes" disabled={bulkKnowledgeAction !== null} onClick={() => void setAllKnowledge(true)} type="button"><svg aria-hidden="true" className="hiragana-test-answer-icon" viewBox="0 0 16 16"><path d="m3 8.5 3 3 7-7" /></svg><span>{bulkKnowledgeAction === "complete" ? "Completing…" : "Complete"}</span></button>
            </div>
          </div>
        </dialog>

        <dialog aria-labelledby="kana-extension-reset-title" className="station-confirm-dialog" onCancel={(event) => { event.preventDefault(); resetDialogRef.current?.close(); }} ref={resetDialogRef}>
          <div className="station-confirm-modal">
            <h2 id="kana-extension-reset-title">Reset Kana extensions?</h2>
            <p>This marks all 12 extension patterns as incomplete. Mora timing stays available because you have already explored this station.</p>
            <div className="hiragana-test-actions">
              <button className="hiragana-test-answer hiragana-test-answer-no" disabled={bulkKnowledgeAction !== null} onClick={() => resetDialogRef.current?.close()} type="button"><svg aria-hidden="true" className="hiragana-test-answer-icon" viewBox="0 0 16 16"><path d="m4 4 8 8M12 4l-8 8" /></svg><span>Cancel</span></button>
              <button className="hiragana-test-answer station-confirm-reset" disabled={bulkKnowledgeAction !== null} onClick={() => void setAllKnowledge(false)} type="button"><svg aria-hidden="true" className="hiragana-test-answer-icon" viewBox="0 0 16 16"><path d="M12.5 5.5A5 5 0 1 0 13 10" /><path d="M12.5 2.5v3h-3" /></svg><span>{bulkKnowledgeAction === "reset" ? "Resetting…" : "Reset"}</span></button>
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
