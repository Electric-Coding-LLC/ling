"use client";

import type { CSSProperties } from "react";
import { useEffect, useRef, useState } from "react";
import {
  getJapaneseRomaji,
  JAPANESE_ROMAJI_VOWELS,
} from "@/src/modules/romaji";
import { FlashcardReview, KanaFlashcardContent } from "../flashcard-review";
import { useFlashcardAudio } from "../use-flashcard-audio";

type KanaEntry = {
  readonly audio: string;
  readonly hiragana: string;
  readonly katakana: string;
};

const KATAKANA_ROWS: readonly (readonly (KanaEntry | null)[])[] = [
  [
    { audio: "/audio/ja-a.wav", hiragana: "あ", katakana: "ア" },
    { audio: "/audio/ja-i.wav", hiragana: "い", katakana: "イ" },
    { audio: "/audio/ja-u.wav", hiragana: "う", katakana: "ウ" },
    { audio: "/audio/ja-e.wav", hiragana: "え", katakana: "エ" },
    { audio: "/audio/ja-o.wav", hiragana: "お", katakana: "オ" },
  ],
  [
    { audio: "/audio/ja-ka.wav", hiragana: "か", katakana: "カ" },
    { audio: "/audio/ja-ki.wav", hiragana: "き", katakana: "キ" },
    { audio: "/audio/ja-ku.wav", hiragana: "く", katakana: "ク" },
    { audio: "/audio/ja-ke.wav", hiragana: "け", katakana: "ケ" },
    { audio: "/audio/ja-ko.wav", hiragana: "こ", katakana: "コ" },
  ],
  [
    { audio: "/audio/ja-sa.wav", hiragana: "さ", katakana: "サ" },
    { audio: "/audio/ja-shi.wav", hiragana: "し", katakana: "シ" },
    { audio: "/audio/ja-su.wav", hiragana: "す", katakana: "ス" },
    { audio: "/audio/ja-se.wav", hiragana: "せ", katakana: "セ" },
    { audio: "/audio/ja-so.wav", hiragana: "そ", katakana: "ソ" },
  ],
  [
    { audio: "/audio/ja-ta.wav", hiragana: "た", katakana: "タ" },
    { audio: "/audio/ja-chi.wav", hiragana: "ち", katakana: "チ" },
    { audio: "/audio/ja-tsu.wav", hiragana: "つ", katakana: "ツ" },
    { audio: "/audio/ja-te.wav", hiragana: "て", katakana: "テ" },
    { audio: "/audio/ja-to.wav", hiragana: "と", katakana: "ト" },
  ],
  [
    { audio: "/audio/ja-na.wav", hiragana: "な", katakana: "ナ" },
    { audio: "/audio/ja-ni.wav", hiragana: "に", katakana: "ニ" },
    { audio: "/audio/ja-nu.wav", hiragana: "ぬ", katakana: "ヌ" },
    { audio: "/audio/ja-ne.wav", hiragana: "ね", katakana: "ネ" },
    { audio: "/audio/ja-no.wav", hiragana: "の", katakana: "ノ" },
  ],
  [
    { audio: "/audio/ja-ha.wav", hiragana: "は", katakana: "ハ" },
    { audio: "/audio/ja-hi.wav", hiragana: "ひ", katakana: "ヒ" },
    { audio: "/audio/ja-fu.wav", hiragana: "ふ", katakana: "フ" },
    { audio: "/audio/ja-he.wav", hiragana: "へ", katakana: "ヘ" },
    { audio: "/audio/ja-ho.wav", hiragana: "ほ", katakana: "ホ" },
  ],
  [
    { audio: "/audio/ja-ma.wav", hiragana: "ま", katakana: "マ" },
    { audio: "/audio/ja-mi.wav", hiragana: "み", katakana: "ミ" },
    { audio: "/audio/ja-mu.wav", hiragana: "む", katakana: "ム" },
    { audio: "/audio/ja-me.wav", hiragana: "め", katakana: "メ" },
    { audio: "/audio/ja-mo.wav", hiragana: "も", katakana: "モ" },
  ],
  [
    { audio: "/audio/ja-ya.wav", hiragana: "や", katakana: "ヤ" },
    null,
    { audio: "/audio/ja-yu.wav", hiragana: "ゆ", katakana: "ユ" },
    null,
    { audio: "/audio/ja-yo.wav", hiragana: "よ", katakana: "ヨ" },
  ],
  [
    { audio: "/audio/ja-ra.wav", hiragana: "ら", katakana: "ラ" },
    { audio: "/audio/ja-ri.wav", hiragana: "り", katakana: "リ" },
    { audio: "/audio/ja-ru.wav", hiragana: "る", katakana: "ル" },
    { audio: "/audio/ja-re.wav", hiragana: "れ", katakana: "レ" },
    { audio: "/audio/ja-ro.wav", hiragana: "ろ", katakana: "ロ" },
  ],
  [
    { audio: "/audio/ja-wa.wav", hiragana: "わ", katakana: "ワ" },
    null,
    null,
    null,
    { audio: "/audio/ja-wo.wav", hiragana: "を", katakana: "ヲ" },
  ],
];

const FINAL_KATAKANA: KanaEntry = {
  audio: "/audio/ja-n.wav",
  hiragana: "ん",
  katakana: "ン",
};


type KatakanaTest = {
  cards: KanaEntry[];
  title: string;
};

const ALL_KATAKANA_TEST_ENTRIES = [
  ...KATAKANA_ROWS.flatMap((row) => row.filter(isKanaEntry)),
  FINAL_KATAKANA,
];
const BASIC_KATAKANA_SET = new Set(
  ALL_KATAKANA_TEST_ENTRIES.map((entry) => entry.katakana),
);

export function KatakanaGuide() {
  const {
    activeAudioIndex,
    audioError,
    audioPlaying,
    audioRef,
    handleAudioEnded,
    handleAudioError,
    playAudio,
    stopAudio,
  } = useFlashcardAudio();
  const completeDialogRef = useRef<HTMLDialogElement | null>(null);
  const dialogRef = useRef<HTMLDialogElement | null>(null);
  const resetDialogRef = useRef<HTMLDialogElement | null>(null);
  const stationOptionsRef = useRef<HTMLDetailsElement | null>(null);
  const [activeTest, setActiveTest] = useState<KatakanaTest | null>(null);
  const [bulkKnowledgeAction, setBulkKnowledgeAction] = useState<"complete" | "reset" | null>(null);
  const [knowledgeError, setKnowledgeError] = useState(false);
  const [knownKatakana, setKnownKatakana] = useState<Set<string>>(() => new Set());
  const [pronunciationRevealed, setPronunciationRevealed] = useState(false);
  const [testIndex, setTestIndex] = useState(0);
  const activeCard = activeTest?.cards[testIndex] ?? null;
  const allKatakanaKnown = knownKatakana.size === ALL_KATAKANA_TEST_ENTRIES.length;
  const hasKatakanaProgress = knownKatakana.size > 0;

  useEffect(() => {
    const controller = new AbortController();
    void fetch("/api/stations/katakana/introduction", { method: "POST" });

    void fetch("/api/stations/katakana/knowledge", {
      cache: "no-store",
      signal: controller.signal,
    })
      .then(async (response) => {
        if (!response.ok) throw new Error("Knowledge could not load");
        return response.json() as Promise<{ known?: unknown }>;
      })
      .then((payload) => {
        if (!Array.isArray(payload.known)) throw new Error("Knowledge is invalid");
        setKnownKatakana(new Set(
          payload.known.filter(
            (kana): kana is string => typeof kana === "string" && BASIC_KATAKANA_SET.has(kana),
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

  function renderKatakana(kana: KanaEntry) {
    const isKnown = knownKatakana.has(kana.katakana);
    return (
      <button
        aria-label={`Study ${kana.katakana}${isKnown ? ", marked known" : ""}`}
        className={`hiragana-button katakana-button${isKnown ? " katakana-button-known" : ""}`}
        data-known={isKnown ? "true" : undefined}
        onClick={() => openTest("Katakana", [kana])}
        type="button"
      >
        <span lang="ja">{kana.katakana}</span>
      </button>
    );
  }

  function openTest(title: string, entries: readonly KanaEntry[]) {
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

  function activateCard() {
    if (!activeCard) return;
    setPronunciationRevealed(true);
    playAudio({ index: 0, src: activeCard.audio });
  }

  function answerCard(known: boolean) {
    if (!activeCard || !activeTest) return;

    stopAudio();
    setPronunciationRevealed(false);
    const kana = activeCard.katakana;
    const wasKnown = knownKatakana.has(kana);
    updateKnownState(kana, known);
    setKnowledgeError(false);

    void fetch("/api/stations/katakana/knowledge", {
      body: JSON.stringify({ kana, known }),
      headers: { "Content-Type": "application/json" },
      method: "PUT",
    }).then((response) => {
      if (!response.ok) throw new Error("Knowledge could not save");
    }).catch(() => {
      updateKnownState(kana, wasKnown);
      setKnowledgeError(true);
    });

    if (testIndex + 1 >= activeTest.cards.length) closeTest();
    else setTestIndex((current) => current + 1);
  }

  function updateKnownState(kana: string, known: boolean) {
    setKnownKatakana((current) => {
      const next = new Set(current);
      if (known) next.add(kana);
      else next.delete(kana);
      return next;
    });
  }

  async function setAllKnowledge(known: boolean) {
    setBulkKnowledgeAction(known ? "complete" : "reset");
    setKnowledgeError(false);

    try {
      const response = await fetch("/api/stations/katakana/knowledge", {
        body: JSON.stringify({ known }),
        headers: { "Content-Type": "application/json" },
        method: "PATCH",
      });
      if (!response.ok) throw new Error("Knowledge could not save");

      const payload = await response.json() as { known?: unknown };
      if (!Array.isArray(payload.known)) throw new Error("Knowledge is invalid");
      const nextKnown = payload.known.filter(
        (kana): kana is string => typeof kana === "string" && BASIC_KATAKANA_SET.has(kana),
      );
      if (nextKnown.length !== payload.known.length) throw new Error("Knowledge is invalid");

      setKnownKatakana(new Set(nextKnown));
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

  function renderTestButton(title: string, entries: readonly KanaEntry[]) {
    const knownCount = entries.filter((entry) => knownKatakana.has(entry.katakana)).length;
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
                {!allKatakanaKnown ? (
                  <button
                    className="station-options-action"
                    disabled={bulkKnowledgeAction !== null}
                    onClick={() => {
                      closeStationOptions();
                      completeDialogRef.current?.showModal();
                    }}
                    type="button"
                  >
                    <svg aria-hidden="true" viewBox="0 0 16 16">
                      <path d="m3 8.5 3 3 7-7" />
                    </svg>
                    <span>I know this</span>
                  </button>
                ) : null}
                {hasKatakanaProgress ? (
                  <button
                    className="station-options-action"
                    disabled={bulkKnowledgeAction !== null}
                    onClick={() => {
                      closeStationOptions();
                      resetDialogRef.current?.showModal();
                    }}
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
            {renderTestButton("Katakana", ALL_KATAKANA_TEST_ENTRIES)}
          </div>
        </div>
        <h1>Katakana</h1>
      </header>

      <section className="katakana-guide">
        <audio
          onEnded={handleAudioEnded}
          onError={handleAudioError}
          preload="none"
          ref={audioRef}
        />
        <div className="station-intro katakana-intro">
          <p><strong>Katakana is another way to write the sounds you learned in Hiragana.</strong> Each Katakana has a Hiragana match: <span lang="ja">ア</span> sounds like <span lang="ja">あ</span>, <span lang="ja">カ</span> sounds like <span lang="ja">か</span>, and so on.</p>
          <p>Japanese uses both because they do different jobs in writing. Hiragana is used for many Japanese words and for grammar. Katakana is mainly used for words borrowed from other languages, foreign names, and sound effects.</p>
          <p>Since you already know the sounds, you only need to learn the Katakana shapes.</p>
          <p>Tap any Katakana in the chart to practice its sound.</p>
        </div>

        <table aria-label="The 46 basic Katakana" className="hiragana-table katakana-table">
          <thead>
            <tr>
              {JAPANESE_ROMAJI_VOWELS.map((sound) => (
                <th aria-label={`Column of sounds ending in ${sound}`} key={sound} scope="col">
                  {sound}
                </th>
              ))}
            </tr>
          </thead>
          <tbody>
            {KATAKANA_ROWS.map((row, rowIndex) => (
              <tr key={rowIndex}>
                {row.map((kana, columnIndex) => (
                  <td className={kana ? undefined : "katakana-empty"} key={columnIndex}>
                    {kana ? renderKatakana(kana) : null}
                  </td>
                ))}
              </tr>
            ))}
            <tr>
              <td className="katakana-final" colSpan={5}>{renderKatakana(FINAL_KATAKANA)}</td>
            </tr>
          </tbody>
        </table>

        {audioError ? <p className="station-audio-error" role="alert">Audio could not play. Try again.</p> : null}
        {knowledgeError ? <p className="station-knowledge-error" role="alert">Your Katakana progress could not sync. Try again.</p> : null}

        {activeTest && activeCard ? (
          <dialog
            aria-labelledby="katakana-test-title"
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
                <h2 id="katakana-test-title">{activeTest.title}</h2>
                <button aria-label="Close test" className="hiragana-test-close" onClick={closeTest} type="button">
                  <span aria-hidden="true">×</span>
                </button>
              </header>

              <FlashcardReview
                activationLabel={pronunciationRevealed
                  ? `Replay ${activeCard.katakana}`
                  : `Reveal and play ${activeCard.katakana}`}
                announcement={pronunciationRevealed
                  ? getJapaneseRomaji(activeCard.katakana)
                  : ""}
                key={`${testIndex}-${activeCard.katakana}`}
                onActivate={activateCard}
                onAnswer={answerCard}
                playing={audioPlaying}
              >
                <KanaFlashcardContent
                  kana={activeCard.katakana}
                  onReveal={activateCard}
                  pronunciation={getJapaneseRomaji(activeCard.katakana)}
                  pronunciationPlaying={activeAudioIndex === 0}
                  revealed={pronunciationRevealed}
                />
              </FlashcardReview>
            </div>
          </dialog>
        ) : null}

        <dialog
          aria-labelledby="katakana-complete-title"
          className="station-confirm-dialog"
          onCancel={(event) => {
            event.preventDefault();
            completeDialogRef.current?.close();
          }}
          ref={completeDialogRef}
        >
          <div className="station-confirm-modal">
            <h2 id="katakana-complete-title">Mark Katakana complete?</h2>
            <p>This marks all 46 Katakana as complete.</p>
            <div className="hiragana-test-actions">
              <button className="hiragana-test-answer hiragana-test-answer-no" disabled={bulkKnowledgeAction !== null} onClick={() => completeDialogRef.current?.close()} type="button">
                <svg aria-hidden="true" className="hiragana-test-answer-icon" viewBox="0 0 16 16">
                  <path d="m4 4 8 8M12 4l-8 8" />
                </svg>
                <span>Cancel</span>
              </button>
              <button className="hiragana-test-answer hiragana-test-answer-yes" disabled={bulkKnowledgeAction !== null} onClick={() => void setAllKnowledge(true)} type="button">
                <svg aria-hidden="true" className="hiragana-test-answer-icon" viewBox="0 0 16 16">
                  <path d="m3 8.5 3 3 7-7" />
                </svg>
                <span>{bulkKnowledgeAction === "complete" ? "Completing…" : "Complete"}</span>
              </button>
            </div>
          </div>
        </dialog>

        <dialog
          aria-labelledby="katakana-reset-title"
          className="station-confirm-dialog"
          onCancel={(event) => {
            event.preventDefault();
            resetDialogRef.current?.close();
          }}
          ref={resetDialogRef}
        >
          <div className="station-confirm-modal">
            <h2 id="katakana-reset-title">Reset Katakana?</h2>
            <p>This marks all 46 Katakana as incomplete. Your station access will not change.</p>
            <div className="hiragana-test-actions">
              <button className="hiragana-test-answer hiragana-test-answer-no" disabled={bulkKnowledgeAction !== null} onClick={() => resetDialogRef.current?.close()} type="button">
                <svg aria-hidden="true" className="hiragana-test-answer-icon" viewBox="0 0 16 16">
                  <path d="m4 4 8 8M12 4l-8 8" />
                </svg>
                <span>Cancel</span>
              </button>
              <button className="hiragana-test-answer station-confirm-reset" disabled={bulkKnowledgeAction !== null} onClick={() => void setAllKnowledge(false)} type="button">
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

function isKanaEntry(entry: KanaEntry | null): entry is KanaEntry {
  return entry !== null;
}

function shuffle<T>(entries: readonly T[]): T[] {
  const shuffled = [...entries];
  for (let index = shuffled.length - 1; index > 0; index -= 1) {
    const replacement = Math.floor(Math.random() * (index + 1));
    [shuffled[index], shuffled[replacement]] = [shuffled[replacement], shuffled[index]];
  }
  return shuffled;
}
