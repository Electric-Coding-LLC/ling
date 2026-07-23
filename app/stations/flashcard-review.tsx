"use client";

import type {
  AnimationEvent,
  CSSProperties,
  PointerEvent,
  ReactNode,
} from "react";
import { useEffect, useRef, useState } from "react";

const DRAG_START_PX = 8;
const SWIPE_THRESHOLD_PX = 64;
const TRANSITION_DURATION_MS = 180;

type Motion = "dragging" | "enter" | "exit-left" | "exit-right" | "idle";
type ExitDirection = "left" | "right";

type DragStart = {
  readonly pointerId: number;
  readonly x: number;
  readonly y: number;
};

type FlashcardReviewProps = {
  readonly announcement: string;
  readonly children: ReactNode;
  readonly onAnswer: (known: boolean) => void;
  readonly playing: boolean;
};

type FlashcardContentProps = {
  readonly example: string;
  readonly kana: string;
  readonly onPlayExample: () => void;
  readonly onPlayKana: () => void;
  readonly onReveal: () => void;
  readonly pronunciation: string;
  readonly revealed: boolean;
  readonly translation: string;
};

export function FlashcardContent({
  example,
  kana,
  onPlayExample,
  onPlayKana,
  onReveal,
  pronunciation,
  revealed,
  translation,
}: FlashcardContentProps) {
  return (
    <>
      <button
        aria-label={`Play ${kana}`}
        className="hiragana-test-reveal"
        onClick={onPlayKana}
        type="button"
      >
        <span
          aria-hidden="true"
          className="hiragana-test-pronunciation"
          data-revealed={revealed ? "true" : undefined}
        >
          {revealed ? pronunciation : "\u00a0"}
        </span>
        <span className="hiragana-test-card-kana" lang="ja">{kana}</span>
      </button>
      <div className="hiragana-test-answer-slot">
        {revealed ? (
          <button
            aria-label={`Play example word ${example}`}
            className="hiragana-test-example"
            onClick={onPlayExample}
            type="button"
          >
            <span className="hiragana-test-example-word" lang="ja">{example}</span>
            <span className="hiragana-test-example-translation">{translation}</span>
          </button>
        ) : (
          <button
            aria-label={`Show answer for ${kana}`}
            className="hiragana-test-example-reveal"
            onClick={onReveal}
            type="button"
          >
            Answer
          </button>
        )}
      </div>
    </>
  );
}

export function FlashcardReview({
  announcement,
  children,
  onAnswer,
  playing,
}: FlashcardReviewProps) {
  const [dragX, setDragX] = useState(0);
  const [motion, setMotion] = useState<Motion>("enter");
  const answeringRef = useRef(false);
  const answerTimerRef = useRef<number | null>(null);
  const draggedRef = useRef(false);
  const dragStartRef = useRef<DragStart | null>(null);
  const suppressClickRef = useRef(false);

  useEffect(() => () => {
    if (answerTimerRef.current !== null) window.clearTimeout(answerTimerRef.current);
  }, []);

  const swipeDirection = motion === "exit-left" || (motion === "dragging" && dragX < 0)
    ? "no"
    : motion === "exit-right" || (motion === "dragging" && dragX > 0)
      ? "yes"
      : undefined;
  const dragStyle: CSSProperties | undefined = motion === "dragging"
    ? { transform: `translate3d(${dragX}px, 0, 0) rotate(${dragX / 32}deg)` }
    : undefined;

  function beginAnswer(
    known: boolean,
    direction: ExitDirection = known ? "right" : "left",
  ) {
    if (answeringRef.current) return;
    answeringRef.current = true;

    if (window.matchMedia("(prefers-reduced-motion: reduce)").matches) {
      onAnswer(known);
      return;
    }

    setDragX(0);
    setMotion(direction === "right" ? "exit-right" : "exit-left");
    answerTimerRef.current = window.setTimeout(() => onAnswer(known), TRANSITION_DURATION_MS);
  }

  function resetDrag() {
    dragStartRef.current = null;
    setDragX(0);
    setMotion("idle");
  }

  function handlePointerDown(event: PointerEvent<HTMLDivElement>) {
    if (event.pointerType === "mouse" || !event.isPrimary || answeringRef.current) return;
    dragStartRef.current = { pointerId: event.pointerId, x: event.clientX, y: event.clientY };
    draggedRef.current = false;
  }

  function handlePointerMove(event: PointerEvent<HTMLDivElement>) {
    const start = dragStartRef.current;
    if (!start || start.pointerId !== event.pointerId || answeringRef.current) return;

    const deltaX = event.clientX - start.x;
    const deltaY = event.clientY - start.y;
    if (Math.abs(deltaY) > Math.abs(deltaX) && Math.abs(deltaY) > DRAG_START_PX) {
      resetDrag();
      return;
    }
    if (Math.abs(deltaX) < DRAG_START_PX) return;

    event.preventDefault();
    draggedRef.current = true;
    setDragX(deltaX);
    setMotion("dragging");
  }

  function handlePointerUp(event: PointerEvent<HTMLDivElement>) {
    const start = dragStartRef.current;
    if (!start || start.pointerId !== event.pointerId || answeringRef.current) return;

    const deltaX = event.clientX - start.x;
    const deltaY = event.clientY - start.y;
    dragStartRef.current = null;
    suppressClickRef.current = draggedRef.current;

    if (Math.abs(deltaX) >= SWIPE_THRESHOLD_PX && Math.abs(deltaX) > Math.abs(deltaY)) {
      beginAnswer(deltaX > 0, deltaX > 0 ? "right" : "left");
      return;
    }
    resetDrag();
  }

  function handleCardClick(event: React.MouseEvent<HTMLDivElement>) {
    if (!suppressClickRef.current) return;
    suppressClickRef.current = false;
    event.preventDefault();
    event.stopPropagation();
  }

  function handleAnimationEnd(event: AnimationEvent<HTMLDivElement>) {
    if (event.target === event.currentTarget && motion === "enter") setMotion("idle");
  }

  return (
    <>
      <div
        className="hiragana-test-card hiragana-test-card-with-example hiragana-test-card-gesture"
        data-motion={motion}
        data-playing={playing ? "true" : undefined}
        data-swipe={swipeDirection}
        onAnimationEnd={handleAnimationEnd}
        onClickCapture={handleCardClick}
        onPointerCancel={resetDrag}
        onPointerDown={handlePointerDown}
        onPointerMove={handlePointerMove}
        onPointerUp={handlePointerUp}
        style={dragStyle}
      >
        <span aria-hidden="true" className="hiragana-test-playing-indicator">
          <span />
          <span />
          <span />
        </span>
        {children}
      </div>
      <span aria-live="polite" className="sr-only">{announcement}</span>
      <div className="hiragana-test-actions hiragana-test-review-actions">
        <button
          className="hiragana-test-answer hiragana-test-answer-no"
          onClick={() => beginAnswer(false)}
          type="button"
        >
          <svg aria-hidden="true" className="hiragana-test-answer-icon" viewBox="0 0 16 16">
            <path d="m4 4 8 8M12 4l-8 8" />
          </svg>
          <svg aria-hidden="true" className="hiragana-test-swipe-icon" viewBox="0 0 16 16">
            <path d="M13 8H3m4-4L3 8l4 4" />
          </svg>
          <span>Not Yet</span>
        </button>
        <button
          className="hiragana-test-answer hiragana-test-answer-yes"
          onClick={() => beginAnswer(true)}
          type="button"
        >
          <svg aria-hidden="true" className="hiragana-test-answer-icon" viewBox="0 0 16 16">
            <path d="m3 8.5 3 3 7-7" />
          </svg>
          <span>Good</span>
          <svg aria-hidden="true" className="hiragana-test-swipe-icon" viewBox="0 0 16 16">
            <path d="M3 8h10m-4-4 4 4-4 4" />
          </svg>
        </button>
      </div>
    </>
  );
}
