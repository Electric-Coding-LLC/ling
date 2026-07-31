"use client";

import type { CSSProperties } from "react";
import { useEffect, useRef, useState } from "react";
import {
  getJapaneseRomaji,
  JAPANESE_ROMAJI_VOWELS,
} from "@/src/modules/romaji";
import { FlashcardReview, KanaFlashcardContent } from "../flashcard-review";
import { useFlashcardAudio } from "../use-flashcard-audio";

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

type HiraganaTestEntry = {
  readonly kana: string;
  readonly kanaAudio: string;
};

type HiraganaTest = {
  cards: HiraganaTestEntry[];
  title: string;
};

const ALL_HIRAGANA_TEST_ENTRIES: HiraganaTestEntry[] = [
  ...HIRAGANA_ROWS.flatMap((row) => row.flatMap((entry) => (
    entry ? [{ kana: entry.character, kanaAudio: entry.audio }] : []
  ))),
  { kana: FINAL_HIRAGANA.character, kanaAudio: FINAL_HIRAGANA.audio },
];
const HIRAGANA_TEST_ENTRY_BY_KANA = new Map(
  ALL_HIRAGANA_TEST_ENTRIES.map((entry) => [entry.kana, entry]),
);
const BASIC_HIRAGANA_SET = new Set(
  ALL_HIRAGANA_TEST_ENTRIES.map((entry) => entry.kana),
);

export function HiraganaGuide() {
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
  const [bulkKnowledgeAction, setBulkKnowledgeAction] = useState<"complete" | "reset" | null>(null);
  const [knowledgeError, setKnowledgeError] = useState(false);
  const [knownHiragana, setKnownHiragana] = useState<Set<string>>(() => new Set());
  const [activeTest, setActiveTest] = useState<HiraganaTest | null>(null);
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

  function activateCard() {
    if (!activeCard) return;
    setPronunciationRevealed(true);
    playAudio({ index: 0, src: activeCard.kanaAudio });
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
            {renderTestButton("Hiragana", ALL_HIRAGANA_TEST_ENTRIES)}
          </div>
        </div>
        <h1>Hiragana</h1>
      </header>

      <section className="hiragana-guide">
        <audio
          onEnded={handleAudioEnded}
          onError={handleAudioError}
          preload="none"
          ref={audioRef}
        />
        <div className="station-intro hiragana-intro">
          <p><strong>Hiragana is the everyday Kana system.</strong> Its rounded characters appear throughout Japanese sentences, for complete words as well as the grammatical parts around them.</p>
          <p>There are 46 basic Hiragana, arranged under the five vowel sounds you already know: あ, い, う, え, お. Learning them lets you sound out written Japanese, even before you know what every word means. Tap any Kana in the chart to practice its sound.</p>
        </div>

      <table aria-label="The 46 basic hiragana" className="hiragana-table">
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

            <FlashcardReview
              activationLabel={pronunciationRevealed
                ? `Replay ${activeCard.kana}`
                : `Reveal and play ${activeCard.kana}`}
              announcement={pronunciationRevealed
                ? getJapaneseRomaji(activeCard.kana)
                : ""}
              key={`${testIndex}-${activeCard.kana}`}
              onActivate={activateCard}
              onAnswer={answerCard}
              playing={audioPlaying}
            >
              <KanaFlashcardContent
                kana={activeCard.kana}
                onReveal={activateCard}
                pronunciation={getJapaneseRomaji(activeCard.kana)}
                pronunciationPlaying={activeAudioIndex === 0}
                revealed={pronunciationRevealed}
              />
            </FlashcardReview>
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
            <p>This marks all 46 Hiragana as complete.</p>
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
            <p>This marks all 46 Hiragana as incomplete. Your station access will not change.</p>
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
