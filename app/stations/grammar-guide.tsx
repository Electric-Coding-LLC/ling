"use client";

import { useEffect, useState } from "react";
import {
  GRAMMAR_REVIEW_DIRECTIONS,
  isGrammarKnowledge,
  type GrammarItem,
  type GrammarKnowledge,
  type GrammarReviewDirection,
  type GrammarStation,
} from "@/src/modules/learning/grammar";
import { FlashcardCountdown, FlashcardReview } from "./flashcard-review";
import { StationOptions } from "./station-options";
import { WordReviewDialog, WordReviewLauncher } from "./word-review";

type GrammarReview = {
  readonly cards: readonly GrammarItem[];
  readonly direction: GrammarReviewDirection;
};

export function GrammarGuide({ station }: { readonly station: GrammarStation }) {
  const [activeReview, setActiveReview] = useState<GrammarReview | null>(null);
  const [answerRevealed, setAnswerRevealed] = useState(false);
  const [knowledgeError, setKnowledgeError] = useState(false);
  const [knownItems, setKnownItems] = useState<KnownGrammarItems>(
    createEmptyKnownItems,
  );
  const [reviewIndex, setReviewIndex] = useState(0);
  const activeCard = activeReview?.cards[reviewIndex] ?? null;
  const meaningFirst = activeReview?.direction !== "japanese-to-meaning";

  useEffect(() => {
    const controller = new AbortController();
    void fetch(`/api/stations/${station.id}/introduction`, { method: "POST" });
    void fetch(`/api/stations/${station.id}/knowledge`, {
      cache: "no-store",
      signal: controller.signal,
    })
      .then(async (response) => {
        if (!response.ok) throw new Error("Knowledge could not load");
        return response.json() as Promise<{ known?: unknown }>;
      })
      .then((payload) => {
        if (!Array.isArray(payload.known)) throw new Error("Knowledge is invalid");
        const known = payload.known.filter((value): value is GrammarKnowledge =>
          isGrammarKnowledge(value),
        );
        if (known.length !== payload.known.length) throw new Error("Knowledge is invalid");
        setKnownItems(toKnownGrammarItems(known));
      })
      .catch(() => {
        if (!controller.signal.aborted) setKnowledgeError(true);
      });

    return () => controller.abort();
  }, [station.id]);

  function revealCard() {
    setAnswerRevealed(true);
  }

  function openReview(direction: GrammarReviewDirection) {
    setAnswerRevealed(false);
    setKnowledgeError(false);
    setReviewIndex(0);
    setActiveReview({ cards: shuffle(station.items), direction });
  }

  function closeReview() {
    setActiveReview(null);
    setAnswerRevealed(false);
    setReviewIndex(0);
  }

  function updateKnownState(
    itemId: string,
    direction: GrammarReviewDirection,
    known: boolean,
  ) {
    setKnownItems((current) => {
      const nextDirection = new Set(current[direction]);
      if (known) nextDirection.add(itemId);
      else nextDirection.delete(itemId);
      return { ...current, [direction]: nextDirection };
    });
  }

  function answerCard(known: boolean) {
    if (!activeCard || !activeReview) return;

    const { id } = activeCard;
    const { direction } = activeReview;
    const wasKnown = knownItems[direction].has(id);
    updateKnownState(id, direction, known);
    setKnowledgeError(false);

    void fetch(`/api/stations/${station.id}/knowledge`, {
      body: JSON.stringify({ direction, itemId: id, known }),
      headers: { "Content-Type": "application/json" },
      method: "PUT",
    }).then((response) => {
      if (!response.ok) throw new Error("Knowledge could not save");
    }).catch(() => {
      updateKnownState(id, direction, wasKnown);
      setKnowledgeError(true);
    });

    const nextIndex = reviewIndex + 1;
    if (nextIndex >= activeReview.cards.length) {
      closeReview();
      return;
    }

    setAnswerRevealed(false);
    setReviewIndex(nextIndex);
  }

  async function setAllKnowledge(known: boolean) {
    setKnowledgeError(false);
    const response = await fetch(`/api/stations/${station.id}/knowledge`, {
      body: JSON.stringify({ known }),
      headers: { "Content-Type": "application/json" },
      method: "PATCH",
    });
    if (!response.ok) throw new Error("Knowledge could not save");

    const payload = await response.json() as { known?: unknown };
    if (!Array.isArray(payload.known)) throw new Error("Knowledge is invalid");
    const nextKnown = payload.known.filter((value): value is GrammarKnowledge =>
      isGrammarKnowledge(value),
    );
    if (nextKnown.length !== payload.known.length) throw new Error("Knowledge is invalid");
    setKnownItems(toKnownGrammarItems(nextKnown));
  }

  const knownRecallCount = GRAMMAR_REVIEW_DIRECTIONS.reduce(
    (count, direction) => count + station.items.filter((item) =>
      knownItems[direction].has(item.id),
    ).length,
    0,
  );
  const totalRecallCount = station.items.length * GRAMMAR_REVIEW_DIRECTIONS.length;
  const remainingRecallCount = totalRecallCount - knownRecallCount;
  const reviewLabel = remainingRecallCount === 0
    ? `Review ${station.name}. Complete.`
    : `Review ${station.name}. ${remainingRecallCount} recalls remaining.`;

  return (
    <>
      <header className="station-heading">
        <div className="station-heading-row">
          <div aria-label="Lines" className="station-memberships">
            <span className="station-membership station-membership-grammar" data-line="grammar">
              Grammar
            </span>
          </div>
          <div className="station-heading-actions">
            <StationOptions
              allComplete={remainingRecallCount === 0}
              completeDescription={`This marks both recall directions for all ${station.items.length} ${station.name} sentences as complete.`}
              hasProgress={knownRecallCount > 0}
              onError={() => setKnowledgeError(true)}
              onSetComplete={setAllKnowledge}
              resetDescription={`This resets both recall directions for all ${station.items.length} ${station.name} sentences.`}
              stationId={station.id}
              stationName={station.name}
            />
            <WordReviewLauncher
              directions={[
                {
                  label: "English → Japanese",
                  onSelect: () => openReview("meaning-to-japanese"),
                  progress: formatDirectionProgress(station, knownItems, "meaning-to-japanese"),
                },
                {
                  label: "Japanese → English",
                  onSelect: () => openReview("japanese-to-meaning"),
                  progress: formatDirectionProgress(station, knownItems, "japanese-to-meaning"),
                },
              ]}
              knownCount={knownRecallCount}
              reviewLabel={reviewLabel}
              totalCount={totalRecallCount}
            />
          </div>
        </div>
        <h1>{station.name}</h1>
      </header>

      <section className="grammar-guide">
        <div className="station-intro grammar-intro">
          {station.description.map((paragraph) => <p key={paragraph}>{paragraph}</p>)}
        </div>

        <div aria-label={`${station.name} sentence patterns`} className="grammar-reference-list">
          {station.items.map((item) => (
            <article
              className="grammar-reference-item"
              data-known={GRAMMAR_REVIEW_DIRECTIONS.every((direction) =>
                knownItems[direction].has(item.id),
              ) ? "true" : undefined}
              key={item.id}
            >
              <p className="grammar-reference-japanese" lang="ja">{item.japanese}</p>
              <p className="grammar-reference-meaning">{item.meaning}</p>
              <p className="grammar-reference-pattern" lang="ja">{item.pattern}</p>
              <p className="grammar-reference-note">{item.note}</p>
            </article>
          ))}
        </div>

        {knowledgeError ? (
          <p className="station-knowledge-error" role="alert">
            Your {station.name} progress could not sync. Try again.
          </p>
        ) : null}

        {activeReview && activeCard ? (
          <WordReviewDialog
            directionLabel={meaningFirst ? "English → Japanese" : "Japanese → English"}
            onDismiss={closeReview}
            stationId={station.id}
            stationName={station.name}
          >
            <FlashcardReview
              activationLabel={answerRevealed
                ? "Answer revealed"
                : `Reveal answer for ${meaningFirst ? activeCard.meaning : activeCard.japanese}`}
              announcement={answerRevealed
                ? `${activeCard.japanese} ${activeCard.meaning} ${activeCard.note}`
                : ""}
              key={`${activeReview.direction}-${reviewIndex}-${activeCard.id}`}
              onActivate={revealCard}
              onAnswer={answerCard}
              playing={false}
            >
              <span className="vocabulary-review-content grammar-review-content">
                {meaningFirst ? (
                  <span className="vocabulary-review-prompt">{activeCard.meaning}</span>
                ) : (
                  <span className="vocabulary-review-word vocabulary-review-prompt-word" lang="ja">
                    {activeCard.japanese}
                  </span>
                )}
                <span className="vocabulary-review-answer-slot">
                  {answerRevealed ? (
                    <span className="vocabulary-review-answer grammar-review-answer">
                      {meaningFirst ? (
                        <span className="vocabulary-review-word" lang="ja">{activeCard.japanese}</span>
                      ) : (
                        <span className="vocabulary-review-meaning">{activeCard.meaning}</span>
                      )}
                      <span className="grammar-review-pattern" lang="ja">{activeCard.pattern}</span>
                      <span className="grammar-review-note">{activeCard.note}</span>
                    </span>
                  ) : (
                    <FlashcardCountdown onComplete={revealCard} />
                  )}
                </span>
              </span>
            </FlashcardReview>
          </WordReviewDialog>
        ) : null}
      </section>
    </>
  );
}

type KnownGrammarItems = Record<GrammarReviewDirection, Set<string>>;

function createEmptyKnownItems(): KnownGrammarItems {
  return {
    "japanese-to-meaning": new Set(),
    "meaning-to-japanese": new Set(),
  };
}

function toKnownGrammarItems(
  knowledge: readonly GrammarKnowledge[],
): KnownGrammarItems {
  const knownItems = createEmptyKnownItems();
  for (const item of knowledge) knownItems[item.direction].add(item.itemId);
  return knownItems;
}

function formatDirectionProgress(
  station: GrammarStation,
  knownItems: KnownGrammarItems,
  direction: GrammarReviewDirection,
) {
  const knownCount = station.items.filter((item) =>
    knownItems[direction].has(item.id),
  ).length;
  const remainingCount = station.items.length - knownCount;
  return remainingCount === 0 ? "Complete" : `${remainingCount} remaining`;
}

function shuffle<T>(entries: readonly T[]): T[] {
  const next = [...entries];
  for (let index = next.length - 1; index > 0; index -= 1) {
    const replacement = Math.floor(Math.random() * (index + 1));
    [next[index], next[replacement]] = [next[replacement], next[index]];
  }
  return next;
}
