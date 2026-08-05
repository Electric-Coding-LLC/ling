"use client";

import { useEffect, useRef, useState } from "react";

type BulkAction = "complete" | "reset" | null;

export function StationOptions({
  allComplete,
  completeDescription,
  hasProgress,
  onError,
  onSetComplete,
  resetDescription,
  stationId,
  stationName,
}: {
  readonly allComplete: boolean;
  readonly completeDescription: string;
  readonly hasProgress: boolean;
  readonly onError: () => void;
  readonly onSetComplete: (complete: boolean) => Promise<void>;
  readonly resetDescription: string;
  readonly stationId: string;
  readonly stationName: string;
}) {
  const completeDialogRef = useRef<HTMLDialogElement | null>(null);
  const resetDialogRef = useRef<HTMLDialogElement | null>(null);
  const stationOptionsRef = useRef<HTMLDetailsElement | null>(null);
  const [bulkAction, setBulkAction] = useState<BulkAction>(null);

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

  async function setComplete(complete: boolean) {
    setBulkAction(complete ? "complete" : "reset");

    try {
      await onSetComplete(complete);
      if (complete) completeDialogRef.current?.close();
      else resetDialogRef.current?.close();
    } catch {
      onError();
    } finally {
      setBulkAction(null);
    }
  }

  const completeTitleId = `${stationId}-complete-title`;
  const resetTitleId = `${stationId}-reset-title`;

  return (
    <>
      <details className="station-options" ref={stationOptionsRef}>
        <summary aria-label="Station options">
          <svg aria-hidden="true" viewBox="0 0 20 20">
            <circle cx="4" cy="10" r="1.5" />
            <circle cx="10" cy="10" r="1.5" />
            <circle cx="16" cy="10" r="1.5" />
          </svg>
        </summary>
        <div aria-label="Station options" className="station-options-menu">
          {!allComplete ? (
            <button
              className="station-options-action"
              disabled={bulkAction !== null}
              onClick={openCompleteDialog}
              type="button"
            >
              <svg aria-hidden="true" viewBox="0 0 16 16">
                <path d="m3 8.5 3 3 7-7" />
              </svg>
              <span>I know this</span>
            </button>
          ) : null}
          {hasProgress ? (
            <button
              className="station-options-action"
              disabled={bulkAction !== null}
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

      <dialog
        aria-labelledby={completeTitleId}
        className="station-confirm-dialog"
        onCancel={(event) => {
          event.preventDefault();
          completeDialogRef.current?.close();
        }}
        ref={completeDialogRef}
      >
        <div className="station-confirm-modal">
          <h2 id={completeTitleId}>Mark {stationName} complete?</h2>
          <p>{completeDescription}</p>
          <div className="hiragana-test-actions">
            <button
              className="hiragana-test-answer hiragana-test-answer-no"
              disabled={bulkAction !== null}
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
              disabled={bulkAction !== null}
              onClick={() => void setComplete(true)}
              type="button"
            >
              <svg aria-hidden="true" className="hiragana-test-answer-icon" viewBox="0 0 16 16">
                <path d="m3 8.5 3 3 7-7" />
              </svg>
              <span>{bulkAction === "complete" ? "Completing…" : "Complete"}</span>
            </button>
          </div>
        </div>
      </dialog>

      <dialog
        aria-labelledby={resetTitleId}
        className="station-confirm-dialog"
        onCancel={(event) => {
          event.preventDefault();
          resetDialogRef.current?.close();
        }}
        ref={resetDialogRef}
      >
        <div className="station-confirm-modal">
          <h2 id={resetTitleId}>Reset {stationName}?</h2>
          <p>{resetDescription}</p>
          <div className="hiragana-test-actions">
            <button
              className="hiragana-test-answer hiragana-test-answer-no"
              disabled={bulkAction !== null}
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
              disabled={bulkAction !== null}
              onClick={() => void setComplete(false)}
              type="button"
            >
              <svg aria-hidden="true" className="hiragana-test-answer-icon" viewBox="0 0 16 16">
                <path d="M12.5 5.5A5 5 0 1 0 13 10" />
                <path d="M12.5 2.5v3h-3" />
              </svg>
              <span>{bulkAction === "reset" ? "Resetting…" : "Reset"}</span>
            </button>
          </div>
        </div>
      </dialog>
    </>
  );
}
