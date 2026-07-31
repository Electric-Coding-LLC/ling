"use client";

import type { CSSProperties } from "react";
import { useEffect, useRef, useState } from "react";
import {
  getJapaneseMorae,
  getJapaneseWordRomaji,
} from "@/src/modules/romaji";
import {
  getPitchLevels,
} from "@/src/modules/learning/pitch-accent";
import {
  isVocabularyItemId,
  VOCABULARY_STATIONS,
  type VocabularyItem,
  type VocabularyStation,
  type VocabularyStationId,
} from "@/src/modules/learning/vocabulary";
import { FlashcardCountdown, FlashcardReview } from "./flashcard-review";
import { PitchContour, pitchLabel } from "./pitch-contour";
import { StationOptions } from "./station-options";
import { useFlashcardAudio } from "./use-flashcard-audio";

const VOCABULARY_LINE_LABEL = "Vocabulary";

type VocabularyReviewDirection = "japanese-to-meaning" | "meaning-to-japanese";

type VocabularyReview = {
  readonly cards: readonly VocabularyItem[];
  readonly direction: VocabularyReviewDirection;
};

export function VocabularyGuide({
  stationId,
}: {
  readonly stationId: VocabularyStationId;
}) {
  const station: VocabularyStation = VOCABULARY_STATIONS[stationId];
  const dialogRef = useRef<HTMLDialogElement | null>(null);
  const {
    activeAudioIndex,
    activeBeatIndex,
    audioError,
    audioPlaying,
    audioRef,
    handleAudioEnded,
    handleAudioError,
    playAudio,
    stopAudio,
  } = useFlashcardAudio();
  const [activeReview, setActiveReview] = useState<VocabularyReview | null>(null);
  const [answerRevealed, setAnswerRevealed] = useState(false);
  const [knowledgeError, setKnowledgeError] = useState(false);
  const [knownItems, setKnownItems] = useState<Set<string>>(() => new Set());
  const [reviewIndex, setReviewIndex] = useState(0);
  const reviewLauncherRef = useRef<HTMLDetailsElement | null>(null);
  const activeCard = activeReview?.cards[reviewIndex] ?? null;
  const meaningFirst = activeReview?.direction !== "japanese-to-meaning";
  const activeCardMorae = activeCard ? getJapaneseMorae(activeCard.word) : null;
  const activeCardPitch = activeCardMorae && activeCard
    ? getPitchLevels(activeCardMorae.length, activeCard.pitchAccent)
    : null;
  useEffect(() => {
    const controller = new AbortController();
    void fetch(`/api/stations/${stationId}/introduction`, { method: "POST" });

    void fetch(`/api/stations/${stationId}/knowledge`, {
      cache: "no-store",
      signal: controller.signal,
    })
      .then(async (response) => {
        if (!response.ok) throw new Error("Knowledge could not load");
        return response.json() as Promise<{ known?: unknown }>;
      })
      .then((payload) => {
        if (!Array.isArray(payload.known)) throw new Error("Knowledge is invalid");
        const known = payload.known.filter((value) =>
          isVocabularyItemId(stationId, value),
        );
        if (known.length !== payload.known.length) throw new Error("Knowledge is invalid");
        setKnownItems(new Set(known));
      })
      .catch(() => {
        if (!controller.signal.aborted) setKnowledgeError(true);
      });

    return () => controller.abort();
  }, [stationId]);

  useEffect(() => {
    function dismissReviewLauncher(event: PointerEvent) {
      const launcher = reviewLauncherRef.current;
      if (
        launcher?.open
        && event.target instanceof Node
        && !launcher.contains(event.target)
      ) {
        launcher.open = false;
      }
    }

    function closeReviewLauncherWithEscape(event: KeyboardEvent) {
      const launcher = reviewLauncherRef.current;
      if (event.key !== "Escape" || !launcher?.open) return;

      launcher.open = false;
      launcher.querySelector<HTMLElement>("summary")?.focus();
    }

    document.addEventListener("pointerdown", dismissReviewLauncher);
    document.addEventListener("keydown", closeReviewLauncherWithEscape);
    return () => {
      document.removeEventListener("pointerdown", dismissReviewLauncher);
      document.removeEventListener("keydown", closeReviewLauncherWithEscape);
    };
  }, []);

  useEffect(() => {
    const dialog = dialogRef.current;
    if (activeReview && dialog && !dialog.open) dialog.showModal();
  }, [activeReview]);

  function itemIndex(item: VocabularyItem) {
    return station.items.findIndex((candidate) => candidate.id === item.id);
  }

  function playItem(item: VocabularyItem) {
    playAudio({
      beatCount: getJapaneseMorae(item.word).length,
      index: itemIndex(item),
      src: item.audio,
    });
  }

  function openReview(
    items: readonly VocabularyItem[],
    direction: VocabularyReviewDirection,
  ) {
    if (reviewLauncherRef.current) reviewLauncherRef.current.open = false;
    stopAudio();
    setAnswerRevealed(false);
    setKnowledgeError(false);
    setReviewIndex(0);
    setActiveReview({ cards: shuffle(items), direction });
  }

  function closeReview() {
    stopAudio();
    dialogRef.current?.close();
    setActiveReview(null);
    setAnswerRevealed(false);
    setReviewIndex(0);
  }

  function updateKnownState(itemId: string, known: boolean) {
    setKnownItems((current) => {
      const next = new Set(current);
      if (known) next.add(itemId);
      else next.delete(itemId);
      return next;
    });
  }

  function answerCard(known: boolean) {
    if (!activeCard || !activeReview) return;

    const { id } = activeCard;
    const wasKnown = knownItems.has(id);
    updateKnownState(id, known);
    setKnowledgeError(false);

    void fetch(`/api/stations/${stationId}/knowledge`, {
      body: JSON.stringify({ itemId: id, known }),
      headers: { "Content-Type": "application/json" },
      method: "PUT",
    }).then((response) => {
      if (!response.ok) throw new Error("Knowledge could not save");
    }).catch(() => {
      updateKnownState(id, wasKnown);
      setKnowledgeError(true);
    });

    const nextIndex = reviewIndex + 1;
    if (nextIndex >= activeReview.cards.length) {
      closeReview();
      return;
    }

    stopAudio();
    setAnswerRevealed(false);
    setReviewIndex(nextIndex);
  }

  async function setAllKnowledge(known: boolean) {
    setKnowledgeError(false);
    const response = await fetch(`/api/stations/${stationId}/knowledge`, {
      body: JSON.stringify({ known }),
      headers: { "Content-Type": "application/json" },
      method: "PATCH",
    });
    if (!response.ok) throw new Error("Knowledge could not save");

    const payload = await response.json() as { known?: unknown };
    if (!Array.isArray(payload.known)) throw new Error("Knowledge is invalid");
    const nextKnown = payload.known.filter((value) =>
      isVocabularyItemId(stationId, value),
    );
    if (nextKnown.length !== payload.known.length) throw new Error("Knowledge is invalid");
    setKnownItems(new Set(nextKnown));
  }

  const knownCount = station.items.filter((item) => knownItems.has(item.id)).length;
  const remainingCount = station.items.length - knownCount;
  const reviewLabel = remainingCount === 0
    ? `Review ${station.name}. Complete.`
    : `Review ${station.name}. ${remainingCount} remaining.`;

  return (
    <>
      <header className="station-heading">
        <div className="station-heading-row">
          <div aria-label="Lines" className="station-memberships">
            <span className="station-membership station-membership-vocabulary" data-line="vocabulary">
              {VOCABULARY_LINE_LABEL}
            </span>
          </div>
          <div className="station-heading-actions">
            <StationOptions
              allComplete={remainingCount === 0}
              completeDescription={`This marks all ${station.items.length} ${station.name} words as complete.`}
              hasProgress={knownCount > 0}
              onError={() => setKnowledgeError(true)}
              onSetComplete={setAllKnowledge}
              resetDescription={`This marks all ${station.items.length} ${station.name} words as incomplete.`}
              stationId={stationId}
              stationName={station.name}
            />
            <span className="hiragana-test-trigger-wrap">
              {stationId === "words" ? (
                <details className="vocabulary-review-launcher" ref={reviewLauncherRef}>
                  <summary
                    aria-label={`${reviewLabel} Choose review direction.`}
                    className="hiragana-test-trigger"
                    data-complete={remainingCount === 0 ? "true" : undefined}
                    style={{ "--hiragana-test-progress": `${knownCount / station.items.length}turn` } as CSSProperties}
                  >
                    <span className="hiragana-test-progress-text">{remainingCount === 0 ? "✓" : remainingCount}</span>
                  </summary>
                  <div aria-label="Review direction" className="station-options-menu vocabulary-review-direction-menu">
                    <button
                      className="station-options-action"
                      onClick={() => openReview(station.items, "meaning-to-japanese")}
                      type="button"
                    >
                      English → Japanese
                    </button>
                    <button
                      className="station-options-action"
                      onClick={() => openReview(station.items, "japanese-to-meaning")}
                      type="button"
                    >
                      Japanese → English
                    </button>
                  </div>
                </details>
              ) : (
                <button
                  aria-label={reviewLabel}
                  className="hiragana-test-trigger"
                  data-complete={remainingCount === 0 ? "true" : undefined}
                  onClick={() => openReview(station.items, "meaning-to-japanese")}
                  style={{ "--hiragana-test-progress": `${knownCount / station.items.length}turn` } as CSSProperties}
                  type="button"
                >
                  <span className="hiragana-test-progress-text">{remainingCount === 0 ? "✓" : remainingCount}</span>
                </button>
              )}
              <span className="network-tooltip hiragana-test-tooltip">{reviewLabel}</span>
            </span>
          </div>
        </div>
        <h1>{station.name}</h1>
      </header>

      <section className="vocabulary-guide">
        <audio
          onEnded={handleAudioEnded}
          onError={handleAudioError}
          preload="none"
          ref={audioRef}
        />

        <div className="station-intro vocabulary-intro">
          <p>{station.description}</p>
          <p>Tap a word to hear it.</p>
        </div>

        <div aria-label={`${station.name} reference`} className="vocabulary-reference-list">
          {station.items.map((item) => {
            const playing = audioPlaying && activeAudioIndex === itemIndex(item);
            const morae = getJapaneseMorae(item.word);
            const pitch = getPitchLevels(morae.length, item.pitchAccent);
            return (
              <button
                aria-label={`Play ${item.word}, ${item.meaning}, ${morae.length} ${morae.length === 1 ? "beat" : "beats"}`}
                className="vocabulary-reference-item"
                data-known={knownItems.has(item.id) ? "true" : undefined}
                data-playing={playing ? "true" : undefined}
                key={item.id}
                onClick={() => playItem(item)}
                type="button"
              >
                <span className="vocabulary-reference-meaning">{item.meaning}</span>
                <PitchContour
                  activeMoraIndex={playing ? activeBeatIndex : null}
                  morae={morae}
                  pitch={pitch}
                  showPronunciation
                  word={item.word}
                />
                {item.group ? <span className="vocabulary-reference-group">{item.group}</span> : null}
                <VocabularyAudioIndicator />
              </button>
            );
          })}
        </div>

        {audioError ? <p className="station-audio-error" role="alert">Audio could not play. Try again.</p> : null}
        {knowledgeError ? <p className="station-knowledge-error" role="alert">Your {station.name} progress could not sync. Try again.</p> : null}

        {activeReview && activeCard && activeCardMorae && activeCardPitch ? (
          <dialog
            aria-labelledby={`${stationId}-review-title`}
            className="hiragana-test-dialog"
            onCancel={(event) => {
              event.preventDefault();
              closeReview();
            }}
            onClose={() => setActiveReview(null)}
            ref={dialogRef}
          >
            <div className="hiragana-test-modal">
              <header className="hiragana-test-modal-heading">
                <div>
                  <h2 id={`${stationId}-review-title`}>{station.name}</h2>
                  {stationId === "words" ? (
                    <p className="vocabulary-review-direction-label">
                      {meaningFirst ? "English → Japanese" : "Japanese → English"}
                    </p>
                  ) : null}
                </div>
                <button aria-label="Close flashcards" className="hiragana-test-close" onClick={closeReview} type="button">
                  <span aria-hidden="true">×</span>
                </button>
              </header>
              <FlashcardReview
                activationLabel={meaningFirst && !answerRevealed
                  ? `Recall the Japanese for ${activeCard.meaning}`
                  : `Play ${activeCard.word}`}
                announcement={answerRevealed
                  ? vocabularyAnnouncement(activeCard, meaningFirst)
                  : ""}
                key={`${activeReview.direction}-${reviewIndex}-${activeCard.id}`}
                onActivate={() => {
                  if (!meaningFirst || answerRevealed) playItem(activeCard);
                }}
                onAnswer={answerCard}
                playing={audioPlaying && activeAudioIndex === itemIndex(activeCard)}
              >
                <span className="vocabulary-review-content">
                  {meaningFirst ? (
                    <span className="vocabulary-review-prompt">{activeCard.meaning}</span>
                  ) : (
                    <span className="vocabulary-review-word vocabulary-review-prompt-word" lang="ja">
                      {activeCard.word}
                    </span>
                  )}
                  <span className="vocabulary-review-answer-slot">
                    {answerRevealed ? (
                      <span className="vocabulary-review-answer">
                        {meaningFirst ? (
                          <>
                            <PitchContour
                              activeMoraIndex={audioPlaying && activeAudioIndex === itemIndex(activeCard)
                                ? activeBeatIndex
                                : null}
                              morae={activeCardMorae}
                              pitch={activeCardPitch}
                              showPronunciation
                              word={activeCard.word}
                            />
                            {activeCard.group ? <span className="vocabulary-reference-group">{activeCard.group}</span> : null}
                          </>
                        ) : (
                          <>
                            <span className="vocabulary-review-meaning">{activeCard.meaning}</span>
                            <span className="vocabulary-review-romaji">{getJapaneseWordRomaji(activeCard.word)}</span>
                          </>
                        )}
                      </span>
                    ) : (
                      <FlashcardCountdown onComplete={() => setAnswerRevealed(true)} />
                    )}
                  </span>
                </span>
              </FlashcardReview>
            </div>
          </dialog>
        ) : null}
      </section>
    </>
  );
}

function VocabularyAudioIndicator() {
  return (
    <span aria-hidden="true" className="vocabulary-audio-indicator">
      <span />
      <span />
      <span />
    </span>
  );
}

function vocabularyAnnouncement(item: VocabularyItem, meaningFirst: boolean) {
  const morae = getJapaneseMorae(item.word);
  const pitch = getPitchLevels(morae.length, item.pitchAccent);
  const answer = meaningFirst
    ? `${item.meaning}: ${item.word}, Rōmaji ${getJapaneseWordRomaji(item.word)}`
    : `${item.word}, Rōmaji ${getJapaneseWordRomaji(item.word)}: ${item.meaning}`;
  return `${answer}. ${morae.length} ${morae.length === 1 ? "beat" : "beats"}. ${pitchLabel(pitch)}.`;
}

function shuffle<T>(entries: readonly T[]): T[] {
  const next = [...entries];
  for (let index = next.length - 1; index > 0; index -= 1) {
    const replacement = Math.floor(Math.random() * (index + 1));
    [next[index], next[replacement]] = [next[replacement], next[index]];
  }
  return next;
}
