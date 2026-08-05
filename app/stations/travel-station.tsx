"use client";

import type { ReactElement } from "react";
import { Fragment, useEffect, useRef, useState } from "react";
import { FlashcardCountdown, FlashcardReview } from "./flashcard-review";
import { useFlashcardAudio } from "./use-flashcard-audio";

type TravelReferenceItem = {
  readonly audio: string;
  readonly japanese: string;
  readonly japaneseSegments?: readonly string[];
  readonly meaning: string;
  readonly note?: string;
  readonly romaji?: string;
};

export function TravelStation({
  framed = false,
  intro = [],
  items = [],
  lines = ["Japan"],
  review = false,
  showPronunciation = false,
  meaningFirst = showPronunciation,
  title,
}: {
  framed?: boolean;
  intro?: readonly (string | ReactElement)[];
  items?: readonly TravelReferenceItem[];
  lines?: readonly ("Foundations" | "Japan")[];
  meaningFirst?: boolean;
  review?: boolean;
  showPronunciation?: boolean;
  title: string;
}) {
  const framedCards = framed || showPronunciation;
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
  const reviewDialogRef = useRef<HTMLDialogElement | null>(null);
  const [answerRevealed, setAnswerRevealed] = useState(false);
  const [reviewCards, setReviewCards] = useState<TravelReferenceItem[] | null>(null);
  const [reviewIndex, setReviewIndex] = useState(0);
  const activeReviewCard = reviewCards?.[reviewIndex] ?? null;

  useEffect(() => {
    const dialog = reviewDialogRef.current;
    if (reviewCards && dialog && !dialog.open) dialog.showModal();
  }, [reviewCards]);

  function openReview() {
    stopAudio();
    setAnswerRevealed(false);
    setReviewIndex(0);
    setReviewCards(shuffle(items));
  }

  function closeReview() {
    stopAudio();
    reviewDialogRef.current?.close();
    setAnswerRevealed(false);
    setReviewCards(null);
    setReviewIndex(0);
  }

  function revealReviewCard() {
    if (!activeReviewCard) return;
    setAnswerRevealed(true);
    playAudio({ index: items.length, src: activeReviewCard.audio });
  }

  function answerReviewCard() {
    if (!reviewCards) return;

    stopAudio();
    setAnswerRevealed(false);
    if (reviewIndex + 1 >= reviewCards.length) closeReview();
    else setReviewIndex((current) => current + 1);
  }

  if (review && items.some((item) => !item.romaji)) {
    throw new Error(`${title} review requires Rōmaji for every phrase`);
  }

  return (
    <section className="travel-guide">
      <header className="station-heading">
        <div className="station-heading-row">
          <div
            aria-label={lines.length === 1 ? "Network line" : "Network lines"}
            className="station-memberships"
          >
            {lines.map((line) => (
              <span
                className={`station-membership ${
                  line === "Foundations"
                    ? "station-membership-foundation"
                    : "station-membership-travel"
                }`}
                data-line={line === "Foundations" ? "foundation" : "travel"}
                key={line}
              >
                {line}
              </span>
            ))}
          </div>
          {review ? (
            <span className="hiragana-test-trigger-wrap">
              <button
                aria-label={`Test ${title}. ${items.length} cards.`}
                className="hiragana-test-trigger"
                onClick={openReview}
                type="button"
              >
                <span className="hiragana-test-progress-text">{items.length}</span>
              </button>
              <span className="network-tooltip hiragana-test-tooltip">
                Test {title}. {items.length} cards.
              </span>
            </span>
          ) : null}
        </div>
        <h1>{title}</h1>
      </header>

      {intro.length > 0 ? (
        <div className="station-intro travel-intro">
          {intro.map((content) => {
            if (typeof content === "string") {
              return <p key={content}>{content}</p>;
            }
            return content;
          })}
        </div>
      ) : null}

      {items.length > 0 ? (
        <section aria-label={`${title} Japanese reference`} className="travel-reference">
          <div className="travel-reference-list">
            {items.map((item, index) => {
              const playing = audioPlaying && activeAudioIndex === index;
              if (showPronunciation && !item.romaji) {
                throw new Error(`Rōmaji is required for ${item.japanese}`);
              }
              const meaningTerminator = /[.!?]$/.test(item.meaning) ? "" : ".";
              const romajiTerminator = item.romaji && /[.!?]$/.test(item.romaji)
                ? ""
                : ".";
              return (
                <button
                  aria-label={item.romaji
                    ? `${item.japanese}: ${item.meaning}${meaningTerminator} Rōmaji: ${item.romaji}${romajiTerminator} Play audio`
                    : `${item.japanese}: ${item.meaning}${meaningTerminator} Play audio`}
                  className="travel-reference-item"
                  data-framed={framedCards ? "true" : undefined}
                  data-playing={playing}
                  data-pronunciation={showPronunciation ? "true" : undefined}
                  key={item.japanese}
                  onClick={() => playAudio({
                    index,
                    src: item.audio,
                  })}
                  type="button"
                >
                  {meaningFirst ? (
                    <span className="travel-reference-meaning">{item.meaning}</span>
                  ) : null}
                  <JapanesePhrase
                    className="travel-reference-japanese"
                    item={item}
                  />
                  {showPronunciation && item.romaji ? (
                    <span
                      aria-label={`Rōmaji: ${item.romaji}`}
                      className="travel-reference-pronunciation"
                    >
                      <span className="travel-reference-romaji">
                        {item.romaji}
                      </span>
                    </span>
                  ) : null}
                  {!meaningFirst ? (
                    <span className="travel-reference-meaning">{item.meaning}</span>
                  ) : null}
                  {item.note ? (
                    <span className="travel-reference-note">{item.note}</span>
                  ) : null}
                  <span aria-hidden="true" className="travel-audio-indicator">
                    <span />
                    <span />
                    <span />
                  </span>
                </button>
              );
            })}
          </div>
        </section>
      ) : null}

      {reviewCards && activeReviewCard ? (
        <dialog
          aria-labelledby="travel-test-title"
          className="hiragana-test-dialog"
          onCancel={(event) => {
            event.preventDefault();
            closeReview();
          }}
          onClose={() => setReviewCards(null)}
          ref={reviewDialogRef}
        >
          <div className="hiragana-test-modal">
            <header className="hiragana-test-modal-heading">
              <h2 id="travel-test-title">{title}</h2>
              <button
                aria-label="Close test"
                className="hiragana-test-close"
                onClick={closeReview}
                type="button"
              >
                <span aria-hidden="true">×</span>
              </button>
            </header>

            <FlashcardReview
              activationLabel={answerRevealed
                ? `Replay ${activeReviewCard.japanese}`
                : `Reveal answer for ${activeReviewCard.meaning}`}
              announcement={answerRevealed
                ? `${asSentence(activeReviewCard.japanese)} Rōmaji: ${asSentence(activeReviewCard.romaji ?? "")} ${asSentence(activeReviewCard.meaning)}`
                : ""}
              key={`${reviewIndex}-${activeReviewCard.japanese}`}
              onActivate={revealReviewCard}
              onAnswer={answerReviewCard}
              playing={audioPlaying && activeAudioIndex === items.length}
            >
              <span className="hiragana-test-reveal travel-test-reveal">
                <span className="travel-test-prompt">{activeReviewCard.meaning}</span>
              </span>
              <span className="hiragana-test-answer-slot">
                {answerRevealed ? (
                  <span
                    className="travel-test-answer"
                    data-playing={audioPlaying && activeAudioIndex === items.length
                      ? "true"
                      : undefined}
                  >
                    <JapanesePhrase
                      className="travel-test-japanese"
                      item={activeReviewCard}
                    />
                    <span className="travel-test-romaji">
                      {activeReviewCard.romaji}
                    </span>
                  </span>
                ) : (
                  <FlashcardCountdown onComplete={revealReviewCard} />
                )}
              </span>
            </FlashcardReview>
          </div>
        </dialog>
      ) : null}

      {audioError ? (
        <p className="station-audio-error" role="alert">
          Audio couldn&apos;t play. Try again.
        </p>
      ) : null}
      <audio
        onEnded={handleAudioEnded}
        onError={handleAudioError}
        preload="none"
        ref={audioRef}
      />
    </section>
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

function asSentence(value: string): string {
  return /[.!?。！？]$/.test(value) ? value : `${value}.`;
}

function JapanesePhrase({
  className,
  item,
}: {
  readonly className: string;
  readonly item: TravelReferenceItem;
}) {
  const segments = item.japaneseSegments ?? [item.japanese];

  return (
    <span className={className} lang="ja">
      {segments.map((segment, index) => (
        <Fragment key={`${index}-${segment}`}>
          {index > 0 ? <wbr /> : null}
          <span className="travel-japanese-segment">{segment}</span>
        </Fragment>
      ))}
    </span>
  );
}
