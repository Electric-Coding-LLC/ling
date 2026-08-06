"use client";

import type { CSSProperties, ReactNode } from "react";
import { useEffect, useRef } from "react";

export type WordReviewDirectionOption = {
  readonly label: string;
  readonly onSelect: () => void;
  readonly progress: string;
};

export function WordReviewLauncher({
  directions,
  knownCount,
  reviewLabel,
  totalCount,
}: {
  readonly directions: readonly WordReviewDirectionOption[];
  readonly knownCount: number;
  readonly reviewLabel: string;
  readonly totalCount: number;
}) {
  const launcherRef = useRef<HTMLDetailsElement | null>(null);
  const complete = knownCount === totalCount;

  useEffect(() => {
    function dismissLauncher(event: PointerEvent) {
      const launcher = launcherRef.current;
      if (launcher?.open && event.target instanceof Node && !launcher.contains(event.target)) {
        launcher.open = false;
      }
    }

    function closeLauncherWithEscape(event: KeyboardEvent) {
      const launcher = launcherRef.current;
      if (event.key !== "Escape" || !launcher?.open) return;
      launcher.open = false;
      launcher.querySelector<HTMLElement>("summary")?.focus();
    }

    document.addEventListener("pointerdown", dismissLauncher);
    document.addEventListener("keydown", closeLauncherWithEscape);
    return () => {
      document.removeEventListener("pointerdown", dismissLauncher);
      document.removeEventListener("keydown", closeLauncherWithEscape);
    };
  }, []);

  return (
    <span className="hiragana-test-trigger-wrap">
      <details className="vocabulary-review-launcher" ref={launcherRef}>
        <summary
          aria-label={`${reviewLabel} Choose review direction.`}
          className="hiragana-test-trigger"
          data-complete={complete ? "true" : undefined}
          style={{ "--hiragana-test-progress": `${knownCount / totalCount}turn` } as CSSProperties}
        >
          <span className="hiragana-test-progress-text">{complete ? "✓" : totalCount - knownCount}</span>
        </summary>
        <div aria-label="Review direction" className="station-options-menu vocabulary-review-direction-menu">
          {directions.map((direction) => (
            <button
              className="station-options-action"
              key={direction.label}
              onClick={() => {
                if (launcherRef.current) launcherRef.current.open = false;
                direction.onSelect();
              }}
              type="button"
            >
              <span>{direction.label}</span>
              <span className="vocabulary-review-direction-progress">{direction.progress}</span>
            </button>
          ))}
        </div>
      </details>
      <span className="network-tooltip hiragana-test-tooltip">{reviewLabel}</span>
    </span>
  );
}

export function WordReviewDialog({
  children,
  directionLabel,
  onDismiss,
  stationId,
  stationName,
}: {
  readonly children: ReactNode;
  readonly directionLabel: string;
  readonly onDismiss: () => void;
  readonly stationId: string;
  readonly stationName: string;
}) {
  const dialogRef = useRef<HTMLDialogElement | null>(null);

  useEffect(() => {
    const dialog = dialogRef.current;
    if (dialog && !dialog.open) dialog.showModal();
  }, []);

  return (
    <dialog
      aria-labelledby={`${stationId}-review-title`}
      className="hiragana-test-dialog"
      onCancel={(event) => {
        event.preventDefault();
        onDismiss();
      }}
      onClose={onDismiss}
      ref={dialogRef}
    >
      <div className="hiragana-test-modal">
        <header className="hiragana-test-modal-heading">
          <div>
            <h2 id={`${stationId}-review-title`}>{stationName}</h2>
            <p className="vocabulary-review-direction-label">{directionLabel}</p>
          </div>
          <button aria-label="Close flashcards" className="hiragana-test-close" onClick={onDismiss} type="button">
            <span aria-hidden="true">×</span>
          </button>
        </header>
        {children}
      </div>
    </dialog>
  );
}

export function WordAudioIndicator() {
  return (
    <span aria-hidden="true" className="vocabulary-audio-indicator">
      <span />
      <span />
      <span />
    </span>
  );
}
