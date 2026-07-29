"use client";

import type { CSSProperties } from "react";
import { useEffect, useRef, useState } from "react";
import {
  isPitchAccentItemId,
  PITCH_ACCENT_ITEMS,
  type PitchAccentItemId,
  type PitchLevel,
} from "@/src/modules/learning/pitch-accent";
import { FlashcardReview } from "../flashcard-review";
import { StationOptions } from "../station-options";
import { useFlashcardAudio } from "../use-flashcard-audio";

type PitchConcept = {
  readonly description: string;
  readonly itemIds: readonly PitchAccentItemId[];
  readonly title: string;
};

type PitchAccentCard = (typeof PITCH_ACCENT_ITEMS)[number];

type PitchReview = {
  readonly cards: readonly PitchAccentCard[];
  readonly title: string;
};

const PITCH_CONCEPTS: readonly PitchConcept[] = [
  {
    description: "The voice rises after the first mora and stays high through the word.",
    itemIds: ["ame-candy", "sakana"],
    title: "Pitch can stay high",
  },
  {
    description: "Some words begin high, then fall after the first mora.",
    itemIds: ["ame-rain", "neko"],
    title: "Pitch can fall early",
  },
  {
    description: "Other words rise first and fall later. Listen for the point where the voice drops.",
    itemIds: ["tamago", "onigiri"],
    title: "Pitch can fall later",
  },
];

const ITEM_BY_ID = new Map<PitchAccentItemId, PitchAccentCard>(
  PITCH_ACCENT_ITEMS.map((item) => [item.id, item]),
);
const PITCH_REVEAL_DELAY_MS = 4_000;

export function PitchAccentGuide() {
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
  const [activeReview, setActiveReview] = useState<PitchReview | null>(null);
  const [answerRevealed, setAnswerRevealed] = useState(false);
  const [knowledgeError, setKnowledgeError] = useState(false);
  const [knownItems, setKnownItems] = useState<Set<PitchAccentItemId>>(() => new Set());
  const [reviewIndex, setReviewIndex] = useState(0);
  const activeCard = activeReview?.cards[reviewIndex] ?? null;

  useEffect(() => {
    const controller = new AbortController();
    void fetch("/api/stations/pitch-accent/introduction", { method: "POST" });

    void fetch("/api/stations/pitch-accent/knowledge", {
      cache: "no-store",
      signal: controller.signal,
    })
      .then(async (response) => {
        if (!response.ok) throw new Error("Knowledge could not load");
        return response.json() as Promise<{ known?: unknown }>;
      })
      .then((payload) => {
        if (!Array.isArray(payload.known)) throw new Error("Knowledge is invalid");
        const known = payload.known.filter(isPitchAccentItemId);
        if (known.length !== payload.known.length) throw new Error("Knowledge is invalid");
        setKnownItems(new Set(known));
      })
      .catch(() => {
        if (!controller.signal.aborted) setKnowledgeError(true);
      });

    return () => controller.abort();
  }, []);

  useEffect(() => {
    const dialog = dialogRef.current;
    if (activeReview && dialog && !dialog.open) dialog.showModal();
  }, [activeReview]);

  useEffect(() => {
    if (!activeReview || answerRevealed) return;

    const revealTimeout = window.setTimeout(() => {
      setAnswerRevealed(true);
    }, PITCH_REVEAL_DELAY_MS);

    return () => window.clearTimeout(revealTimeout);
  }, [activeReview, answerRevealed, reviewIndex]);

  function itemIndex(item: PitchAccentCard) {
    return PITCH_ACCENT_ITEMS.findIndex((candidate) => candidate.id === item.id);
  }

  function playItem(item: PitchAccentCard) {
    playAudio({
      beatCount: item.morae.length,
      index: itemIndex(item),
      src: item.audio,
    });
  }

  function openReview(cards: readonly PitchAccentCard[]) {
    const nextCards = shuffle(cards);
    stopAudio();
    setAnswerRevealed(false);
    setKnowledgeError(false);
    setReviewIndex(0);
    setActiveReview({ cards: nextCards, title: "Pitch" });
    playItem(nextCards[0]);
  }

  function closeReview() {
    stopAudio();
    dialogRef.current?.close();
    setActiveReview(null);
    setAnswerRevealed(false);
    setReviewIndex(0);
  }

  function answerCard(known: boolean) {
    if (!activeCard || !activeReview) return;

    const { id } = activeCard;
    const wasKnown = knownItems.has(id);
    updateKnownState(id, known);
    setKnowledgeError(false);

    void fetch("/api/stations/pitch-accent/knowledge", {
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

    const nextCard = activeReview.cards[nextIndex];
    stopAudio();
    setAnswerRevealed(false);
    setReviewIndex(nextIndex);
    playItem(nextCard);
  }

  function updateKnownState(itemId: PitchAccentItemId, known: boolean) {
    setKnownItems((current) => {
      const next = new Set(current);
      if (known) next.add(itemId);
      else next.delete(itemId);
      return next;
    });
  }

  async function setAllKnowledge(known: boolean) {
    setKnowledgeError(false);
    const response = await fetch("/api/stations/pitch-accent/knowledge", {
      body: JSON.stringify({ known }),
      headers: { "Content-Type": "application/json" },
      method: "PATCH",
    });
    if (!response.ok) throw new Error("Knowledge could not save");

    const payload = await response.json() as { known?: unknown };
    if (!Array.isArray(payload.known)) throw new Error("Knowledge is invalid");
    const nextKnown = payload.known.filter(isPitchAccentItemId);
    if (nextKnown.length !== payload.known.length) throw new Error("Knowledge is invalid");
    setKnownItems(new Set(nextKnown));
  }

  function finishAudio() {
    handleAudioEnded();
  }

  function failAudio() {
    handleAudioError();
  }

  const knownCount = PITCH_ACCENT_ITEMS.filter((item) => knownItems.has(item.id)).length;
  const remainingCount = PITCH_ACCENT_ITEMS.length - knownCount;
  const reviewLabel = remainingCount === 0
    ? "Test Pitch. Complete."
    : `Test Pitch. ${remainingCount} remaining.`;

  return (
    <>
      <header className="station-heading">
        <div className="station-heading-row">
          <div aria-label="Lines" className="station-memberships">
            <span className="station-membership station-membership-sound" data-line="sound">Sound</span>
          </div>
          <div className="station-heading-actions">
            <StationOptions
              allComplete={remainingCount === 0}
              completeDescription="This marks all 6 Pitch words as complete."
              hasProgress={knownCount > 0}
              onError={() => setKnowledgeError(true)}
              onSetComplete={setAllKnowledge}
              resetDescription="This marks all 6 Pitch words as incomplete."
              stationId="pitch-accent"
              stationName="Pitch"
            />
            <span className="hiragana-test-trigger-wrap">
              <button
                aria-label={reviewLabel}
                className="hiragana-test-trigger"
                data-complete={remainingCount === 0 ? "true" : undefined}
                onClick={() => openReview(PITCH_ACCENT_ITEMS)}
                style={{ "--hiragana-test-progress": `${knownCount / PITCH_ACCENT_ITEMS.length}turn` } as CSSProperties}
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
              <span className="network-tooltip hiragana-test-tooltip">{reviewLabel}</span>
            </span>
          </div>
        </div>
        <h1>Pitch</h1>
      </header>

      <section className="pitch-accent-guide">
        <audio
          onEnded={finishAudio}
          onError={failAudio}
          preload="none"
          ref={audioRef}
        />

        <div className="station-intro pitch-accent-intro">
          <p><strong>Japanese words move between low and high pitch.</strong> The place where the voice falls can distinguish one word from another.</p>
          <p>Tap each word and follow the shape from mora to mora.</p>
        </div>

        <div aria-label="Japanese pitch accent concepts" className="pitch-concepts">
          {PITCH_CONCEPTS.map((concept) => (
            <section className="pitch-concept" key={concept.title}>
              <header className="pitch-concept-heading">
                <h2>{concept.title}</h2>
                <p>{concept.description}</p>
              </header>
              <div className="pitch-example-list">
                {concept.itemIds.map((id) => {
                  const item = ITEM_BY_ID.get(id);
                  if (!item) throw new Error(`Missing Pitch item ${id}`);
                  const index = itemIndex(item);
                  const playing = audioPlaying && activeAudioIndex === index;

                  return (
                    <button
                      aria-label={`Play ${item.word}, ${item.meaning}`}
                      className="pitch-example"
                      data-playing={playing ? "true" : undefined}
                      key={item.id}
                      onClick={() => playItem(item)}
                      type="button"
                    >
                      <span className="pitch-example-meaning">{item.meaning}</span>
                      <PitchContour
                        activeMoraIndex={playing ? activeBeatIndex : null}
                        morae={item.morae}
                        pitch={item.pitch}
                        word={item.word}
                      />
                    </button>
                  );
                })}
              </div>
            </section>
          ))}
        </div>

        <section aria-labelledby="pitch-practice-title" className="station-practice">
          <header className="pitch-concept-heading">
            <h2 id="pitch-practice-title">Practice words</h2>
          </header>
          <div className="station-practice-list">
            {PITCH_ACCENT_ITEMS.map((item) => {
              const isKnown = knownItems.has(item.id);

              return (
                <button
                  aria-label={`Study ${item.word}${isKnown ? ", marked known" : ""}`}
                  className="station-practice-word"
                  data-known={isKnown ? "true" : undefined}
                  key={item.id}
                  onClick={() => openReview([item])}
                  type="button"
                >
                  <span lang="ja">{item.word}</span>
                </button>
              );
            })}
          </div>
        </section>

        {audioError ? <p className="station-audio-error" role="alert">Audio could not play. Try again.</p> : null}
        {knowledgeError ? <p className="station-knowledge-error" role="alert">Your Pitch progress could not sync. Try again.</p> : null}

        {activeReview && activeCard ? (
          <dialog
            aria-labelledby="pitch-review-title"
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
                <h2 id="pitch-review-title">{activeReview.title}</h2>
                <button aria-label="Close test" className="hiragana-test-close" onClick={closeReview} type="button">
                  <span aria-hidden="true">×</span>
                </button>
              </header>
              <FlashcardReview
                activationLabel={answerRevealed
                  ? `Replay ${activeCard.word}`
                  : "Replay word"}
                announcement={answerRevealed
                  ? `${activeCard.word}, ${activeCard.meaning}: ${pitchLabel(activeCard.pitch)}.`
                  : ""}
                key={`${reviewIndex}-${activeCard.id}`}
                onActivate={() => playItem(activeCard)}
                onAnswer={answerCard}
                playing={audioPlaying}
              >
                <span className="pitch-review-card-content">
                  {answerRevealed ? (
                    <>
                      <PitchContour
                        activeMoraIndex={activeAudioIndex === itemIndex(activeCard) ? activeBeatIndex : null}
                        morae={activeCard.morae}
                        pitch={activeCard.pitch}
                        word={activeCard.word}
                      />
                      <span className="pitch-review-meaning">{activeCard.meaning}</span>
                    </>
                  ) : null}
                </span>
              </FlashcardReview>
            </div>
          </dialog>
        ) : null}
      </section>
    </>
  );
}

function PitchContour({
  activeMoraIndex,
  morae,
  pitch,
  word,
}: {
  readonly activeMoraIndex: number | null;
  readonly morae: readonly string[];
  readonly pitch: readonly PitchLevel[];
  readonly word: string;
}) {
  const width = morae.length * 48;
  const points = pitch
    .map((level, index) => `${24 + index * 48},${level === "high" ? 14 : 42}`)
    .join(" ");

  return (
    <span
      aria-label={`${word}: ${pitchLabel(pitch)}`}
      className="pitch-contour"
      role="img"
      style={{ "--pitch-mora-count": morae.length } as CSSProperties}
    >
      <svg aria-hidden="true" className="pitch-contour-line" viewBox={`0 0 ${width} 56`}>
        <polyline points={points} />
        {pitch.map((level, index) => (
          <circle
            className="pitch-contour-point"
            cx={24 + index * 48}
            cy={level === "high" ? 14 : 42}
            data-active={activeMoraIndex === index ? "true" : undefined}
            key={`${word}-${index}-${level}`}
            r="4"
          />
        ))}
      </svg>
      <span aria-hidden="true" className="pitch-contour-morae">
        {morae.map((mora, index) => (
          <span
            data-active={activeMoraIndex === index ? "true" : undefined}
            key={`${word}-${index}`}
            lang="ja"
          >
            {mora}
          </span>
        ))}
      </span>
    </span>
  );
}

function pitchLabel(pitch: readonly PitchLevel[]) {
  return `${pitch.join(", ")} pitch`;
}

function shuffle<T>(entries: readonly T[]): T[] {
  const next = [...entries];
  for (let index = next.length - 1; index > 0; index -= 1) {
    const replacement = Math.floor(Math.random() * (index + 1));
    [next[index], next[replacement]] = [next[replacement], next[index]];
  }
  return next;
}
