"use client";

import { useEffect, useId, useLayoutEffect, useRef, useState } from "react";
import {
  GRAMMAR_REVIEW_DIRECTIONS,
  isGrammarKnowledge,
  type GrammarItem,
  type GrammarKnowledge,
  type GrammarReviewDirection,
  type GrammarStation,
  type GrammarTerm,
} from "@/src/modules/learning/grammar";
import { FlashcardCountdown, FlashcardReview } from "./flashcard-review";
import { StationOptions } from "./station-options";
import { useFlashcardAudio } from "./use-flashcard-audio";
import {
  WordAudioIndicator,
  WordReviewDialog,
  WordReviewLauncher,
} from "./word-review";

type GrammarReview = {
  readonly cards: readonly GrammarItem[];
  readonly direction: GrammarReviewDirection;
};

function GrammarTermTooltip({
  label,
  term,
}: {
  readonly label: string;
  readonly term: GrammarTerm;
}) {
  const tooltipId = useId();
  const openBeforePointerDownRef = useRef(false);
  const triggerRef = useRef<HTMLButtonElement | null>(null);
  const tooltipRef = useRef<HTMLSpanElement | null>(null);
  const wrapperRef = useRef<HTMLSpanElement | null>(null);
  const [hovered, setHovered] = useState(false);
  const [open, setOpen] = useState(false);
  const visible = hovered || open;

  useLayoutEffect(() => {
    if (!visible || !triggerRef.current || !tooltipRef.current || !wrapperRef.current) return;

    const visualViewport = window.visualViewport;
    const viewportPadding = 16;
    const rootFontSize = Number.parseFloat(
      window.getComputedStyle(document.documentElement).fontSize,
    );

    function positionTooltip() {
      if (!triggerRef.current || !tooltipRef.current || !wrapperRef.current) return;
      const currentVisualViewport = window.visualViewport;
      const viewportLeft = currentVisualViewport?.offsetLeft ?? 0;
      const viewportTop = currentVisualViewport?.offsetTop ?? 0;
      const currentViewportWidth = currentVisualViewport?.width ?? window.innerWidth;
      const currentViewportHeight = currentVisualViewport?.height ?? window.innerHeight;
      const currentTooltipWidth = Math.min(
        18 * rootFontSize,
        Math.max(1, currentViewportWidth - (viewportPadding * 2)),
      );
      tooltipRef.current.style.width = `${currentTooltipWidth}px`;
      const triggerRect = triggerRef.current.getBoundingClientRect();
      const tooltipRect = tooltipRef.current.getBoundingClientRect();
      const minimumOffset = viewportLeft + viewportPadding - triggerRect.left;
      const maximumOffset = viewportLeft
        + currentViewportWidth
        - viewportPadding
        - tooltipRect.width
        - triggerRect.left;
      tooltipRef.current.style.left = `${Math.min(Math.max(0, minimumOffset), maximumOffset)}px`;

      const tooltipGap = 8;
      const viewportBottom = viewportTop + currentViewportHeight;
      const roomBelow = triggerRect.bottom + tooltipGap + tooltipRect.height
        <= viewportBottom - viewportPadding;
      const roomAbove = triggerRect.top - tooltipGap - tooltipRect.height
        >= viewportTop + viewportPadding;
      wrapperRef.current.dataset.placement = !roomBelow && roomAbove ? "above" : "below";
    }

    positionTooltip();
    visualViewport?.addEventListener("resize", positionTooltip);
    visualViewport?.addEventListener("scroll", positionTooltip);
    window.addEventListener("resize", positionTooltip);
    return () => {
      visualViewport?.removeEventListener("resize", positionTooltip);
      visualViewport?.removeEventListener("scroll", positionTooltip);
      window.removeEventListener("resize", positionTooltip);
    };
  }, [visible]);

  return (
    <span
      className="grammar-term-tooltip"
      data-open={visible ? "true" : undefined}
      data-placement="below"
      onMouseEnter={() => setHovered(true)}
      onMouseLeave={() => setHovered(false)}
      ref={wrapperRef}
    >
      <button
        aria-describedby={tooltipId}
        aria-expanded={open}
        aria-label={`Define ${term.term}`}
        className="grammar-term-trigger"
        onBlur={() => setOpen(false)}
        onClick={(event) => {
          if (event.detail === 0) {
            setOpen((current) => !current);
            return;
          }
          setOpen(!openBeforePointerDownRef.current);
        }}
        onFocus={() => setOpen(true)}
        onKeyDown={(event) => {
          if (event.key === "Escape") {
            setOpen(false);
            event.currentTarget.blur();
          }
        }}
        onPointerDown={() => {
          openBeforePointerDownRef.current = open;
        }}
        ref={triggerRef}
        type="button"
      >
        <span>{label}</span>
        <span aria-hidden="true" className="grammar-term-help">?</span>
      </button>
      <span
        className="grammar-term-definition"
        id={tooltipId}
        ref={tooltipRef}
        role="tooltip"
      >
        {term.definition}
      </span>
    </span>
  );
}

export function GrammarGuide({ station }: { readonly station: GrammarStation }) {
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

  function itemIndex(item: GrammarItem) {
    return station.items.findIndex((candidate) => candidate.id === item.id);
  }

  function playItem(item: GrammarItem) {
    if (!item.audio) return;
    playAudio({ index: itemIndex(item), src: item.audio });
  }

  function activateCard() {
    if (!activeCard) return;
    setAnswerRevealed(true);
    playItem(activeCard);
  }

  function openReview(direction: GrammarReviewDirection) {
    stopAudio();
    setAnswerRevealed(false);
    setKnowledgeError(false);
    setReviewIndex(0);
    setActiveReview({ cards: shuffle(station.items), direction });
  }

  function openItemReview(item: GrammarItem) {
    stopAudio();
    setAnswerRevealed(false);
    setKnowledgeError(false);
    setReviewIndex(0);
    setActiveReview({ cards: [item], direction: "japanese-to-meaning" });
  }

  function closeReview() {
    stopAudio();
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

    stopAudio();
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

  function renderGrammarText(text: string) {
    if (!station.terms?.length) return text;

    const terms = [...station.terms].sort((left, right) =>
      right.term.length - left.term.length,
    );
    const termByName = new Map(terms.map((term) => [term.term.toLocaleLowerCase(), term]));
    const pattern = new RegExp(
      `(${terms.map((term) => escapeRegExp(term.term)).join("|")})`,
      "giu",
    );

    return text.split(pattern).map((part, index) => {
      const term = termByName.get(part.toLocaleLowerCase());
      return term
        ? <GrammarTermTooltip key={`${term.term}-${index}`} label={part} term={term} />
        : part;
    });
  }

  function renderReferenceItem(item: GrammarItem, detailed = true) {
    const playing = audioPlaying && activeAudioIndex === itemIndex(item);
    const content = (
      <>
        <span className="grammar-reference-japanese" lang="ja">{item.japanese}</span>
        <span className="grammar-reference-meaning">{item.meaning}</span>
        {detailed ? (
          <>
            <span className="grammar-reference-pattern">
              <span>Sentence shape</span>
              {item.pattern}
            </span>
            <span className="grammar-reference-note">{item.note}</span>
          </>
        ) : null}
        {item.audio ? <WordAudioIndicator /> : null}
      </>
    );
    const itemState = {
      "data-known": GRAMMAR_REVIEW_DIRECTIONS.every((direction) =>
        knownItems[direction].has(item.id),
      ) ? "true" : undefined,
      "data-playing": playing ? "true" : undefined,
    } as const;

    return item.audio ? (
      <button
        aria-label={`Play ${item.japanese} ${item.meaning}`}
        className="grammar-reference-item"
        key={item.id}
        onClick={() => playItem(item)}
        type="button"
        {...itemState}
      >
        {content}
      </button>
    ) : (
      <div className="grammar-reference-item" key={item.id} {...itemState}>
        {content}
      </div>
    );
  }

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
        {station.items.some((item) => item.audio) ? (
          <audio
            onEnded={handleAudioEnded}
            onError={handleAudioError}
            preload="none"
            ref={audioRef}
          />
        ) : null}

        <div className="station-intro grammar-intro">
          {station.description.map((paragraph, index) => (
            <p key={paragraph}>
              {index === 0 && station.lesson
                ? <strong>{renderGrammarText(paragraph)}</strong>
                : renderGrammarText(paragraph)}
            </p>
          ))}
        </div>

        {station.lesson ? (
          <div aria-label={`${station.name} lesson`} className="grammar-concepts">
            <section className="grammar-concept">
              <header className="grammar-concept-heading">
                <h2>Let’s hear the whole sentence first</h2>
                <p>私はクリスです means “I am Chris.” Tap the sentence and listen for its four parts.</p>
              </header>
              <div className="grammar-example-list">{renderReferenceItem(station.items[0], false)}</div>
            </section>

            <section aria-labelledby={`${station.id}-lesson-title`} className="grammar-concept">
              <header className="grammar-concept-heading">
                <h2 id={`${station.id}-lesson-title`}>{station.lesson.heading}</h2>
                <p>{renderGrammarText(station.lesson.explanation)}</p>
              </header>
              <ol aria-label="Sentence parts" className="grammar-sentence-parts">
                {station.lesson.parts.map((part) => (
                  <li key={`${part.japanese}-${part.label}`}>
                    <span className="grammar-sentence-part-japanese" lang="ja">{part.japanese}</span>
                    <span className="grammar-sentence-part-label">{renderGrammarText(part.label)}</span>
                  </li>
                ))}
              </ol>
            </section>

            <section className="grammar-concept">
              <header className="grammar-concept-heading">
                <h2>Let’s use the same pattern again</h2>
                <p>This time, 今日は is like saying “As for today…” Then 会議です tells us there is a meeting.</p>
              </header>
              <div className="grammar-example-list">{renderReferenceItem(station.items[1], false)}</div>
            </section>

            <section className="grammar-concept">
              <header className="grammar-concept-heading">
                <h2>Now, let’s say “also” with も</h2>
                <p>も takes the place of は and adds “also.” 私も旅行者です means “I am also a traveler.”</p>
              </header>
              <div className="grammar-example-list">{renderReferenceItem(station.items[2], false)}</div>
            </section>
          </div>
        ) : (
          <div aria-label={`${station.name} sentence patterns`} className="grammar-reference-list">
            {station.items.map((item) => renderReferenceItem(item))}
          </div>
        )}

        <section aria-labelledby={`${station.id}-practice-title`} className="station-practice grammar-practice">
          <header className="grammar-concept-heading">
            <h2 id={`${station.id}-practice-title`}>Now it’s your turn</h2>
            <p>Pick a sentence and see if you can remember its meaning before you reveal it.</p>
          </header>
          <div className="station-practice-list grammar-practice-list">
            {station.items.map((item) => (
              <button
                aria-label={`Practice ${item.japanese}`}
                className="station-practice-word grammar-practice-sentence"
                data-known={knownItems["japanese-to-meaning"].has(item.id) ? "true" : undefined}
                key={item.id}
                onClick={() => openItemReview(item)}
                type="button"
              >
                <span lang="ja">{item.japanese}</span>
              </button>
            ))}
          </div>
        </section>

        {audioError ? (
          <p className="station-audio-error" role="alert">
            Audio could not play. Try again.
          </p>
        ) : null}
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
              activationLabel={activeCard.audio
                ? answerRevealed
                  ? `Replay ${activeCard.japanese}`
                  : "Reveal answer and play audio"
                : answerRevealed
                  ? "Answer revealed"
                  : `Reveal answer for ${meaningFirst ? activeCard.meaning : activeCard.japanese}`}
              announcement={answerRevealed
                ? `${activeCard.japanese} ${activeCard.meaning} ${activeCard.note}`
                : ""}
              key={`${activeReview.direction}-${reviewIndex}-${activeCard.id}`}
              onActivate={activateCard}
              onAnswer={answerCard}
              playing={audioPlaying && activeAudioIndex === itemIndex(activeCard)}
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
                      <span className="grammar-review-pattern">
                        <span>Sentence shape</span>
                        {activeCard.pattern}
                      </span>
                      <span className="grammar-review-note">{activeCard.note}</span>
                    </span>
                  ) : (
                    <FlashcardCountdown onComplete={activateCard} />
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

function escapeRegExp(value: string) {
  return value.replace(/[.*+?^${}()|[\]\\]/g, "\\$&");
}

function shuffle<T>(entries: readonly T[]): T[] {
  const next = [...entries];
  for (let index = next.length - 1; index > 0; index -= 1) {
    const replacement = Math.floor(Math.random() * (index + 1));
    [next[index], next[replacement]] = [next[replacement], next[index]];
  }
  return next;
}
