"use client";

import type { CSSProperties } from "react";
import { useEffect, useMemo, useRef, useState } from "react";
import {
  isRomajiKana,
  type RomajiEntry,
  type RomajiRule,
} from "../../../src/modules/romaji";
import { getJapaneseSoundCue } from "../../../src/modules/learning/japanese-sound-cues";
import { FlashcardCountdown, FlashcardReview } from "../flashcard-review";
import { StationOptions } from "../station-options";
import { useFlashcardAudio } from "../use-flashcard-audio";

type RomajiTest = {
  readonly cards: RomajiEntry[];
  readonly title: string;
};

export function RomajiGuide({
  columnHeadings,
  combinedRows,
  finalEntry,
  rows,
  rules,
}: {
  columnHeadings: readonly string[];
  combinedRows: readonly (readonly (RomajiEntry | null)[])[];
  finalEntry: RomajiEntry;
  rows: readonly (readonly (RomajiEntry | null)[])[];
  rules: readonly RomajiRule[];
}) {
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
  const dialogRef = useRef<HTMLDialogElement | null>(null);
  const allEntries = useMemo(
    () => [
      ...rows.flatMap((row) => row.filter(isRomajiEntry)),
      finalEntry,
      ...combinedRows.flatMap((row) => row.filter(isRomajiEntry)),
    ],
    [combinedRows, finalEntry, rows],
  );
  const [activeTest, setActiveTest] = useState<RomajiTest | null>(null);
  const [answerRevealed, setAnswerRevealed] = useState(false);
  const [knowledgeError, setKnowledgeError] = useState(false);
  const [knownKana, setKnownKana] = useState<Set<string>>(() => new Set());
  const [testIndex, setTestIndex] = useState(0);
  const activeCard = activeTest?.cards[testIndex] ?? null;

  useEffect(() => {
    const controller = new AbortController();

    void fetch("/api/stations/romaji/knowledge", {
      cache: "no-store",
      signal: controller.signal,
    })
      .then(async (response) => {
        if (!response.ok) throw new Error("Knowledge could not load");
        return response.json() as Promise<{ known?: unknown }>;
      })
      .then((payload) => {
        if (!Array.isArray(payload.known)) throw new Error("Knowledge is invalid");
        const known = payload.known.filter(isRomajiKana);
        if (known.length !== payload.known.length) throw new Error("Knowledge is invalid");
        setKnownKana(new Set(known));
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

  function openTest(title: string, entries: readonly RomajiEntry[]) {
    stopAudio();
    setAnswerRevealed(false);
    setKnowledgeError(false);
    setTestIndex(0);
    setActiveTest({ cards: shuffle(entries), title });
  }

  function closeTest() {
    stopAudio();
    dialogRef.current?.close();
    setActiveTest(null);
    setAnswerRevealed(false);
    setTestIndex(0);
  }

  function activateCard() {
    if (!activeCard) return;
    setAnswerRevealed(true);
    playAudio({ index: 0, src: activeCard.audio });
  }

  function answerCard(known: boolean) {
    if (!activeCard || !activeTest) return;

    stopAudio();
    setAnswerRevealed(false);
    const { kana } = activeCard;
    const wasKnown = knownKana.has(kana);
    updateKnownState(kana, known);
    setKnowledgeError(false);

    void fetch("/api/stations/romaji/knowledge", {
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
    setKnownKana((current) => {
      const next = new Set(current);
      if (known) next.add(kana);
      else next.delete(kana);
      return next;
    });
  }

  async function setAllKnowledge(known: boolean) {
    setKnowledgeError(false);
    const response = await fetch("/api/stations/romaji/knowledge", {
      body: JSON.stringify({ known }),
      headers: { "Content-Type": "application/json" },
      method: "PATCH",
    });
    if (!response.ok) throw new Error("Knowledge could not save");

    const payload = await response.json() as { known?: unknown };
    if (!Array.isArray(payload.known)) throw new Error("Knowledge is invalid");
    const nextKnown = payload.known.filter(isRomajiKana);
    if (nextKnown.length !== payload.known.length) throw new Error("Knowledge is invalid");
    setKnownKana(new Set(nextKnown));
  }

  function renderTestButton() {
    const knownCount = allEntries.filter((entry) => knownKana.has(entry.kana)).length;
    const remainingCount = allEntries.length - knownCount;
    const testLabel = remainingCount === 0
      ? "Test Rōmaji. Complete."
      : `Test Rōmaji. ${remainingCount} remaining.`;

    return (
      <span className="hiragana-test-trigger-wrap">
        <button
          aria-label={testLabel}
          className="hiragana-test-trigger"
          data-complete={remainingCount === 0 ? "true" : undefined}
          onClick={() => openTest("Rōmaji", allEntries)}
          style={{ "--hiragana-test-progress": `${knownCount / allEntries.length}turn` } as CSSProperties}
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

  function renderEntry(entry: RomajiEntry) {
    const isKnown = knownKana.has(entry.kana);
    return (
      <button
        aria-label={`Study ${entry.romaji}${isKnown ? ", marked known" : ""}`}
        className={`hiragana-button romaji-button${isKnown ? " hiragana-button-known" : ""}`}
        data-known={isKnown ? "true" : undefined}
        onClick={() => openTest("Rōmaji", [entry])}
        type="button"
      >
        <span>{entry.romaji}</span>
      </button>
    );
  }

  return (
    <>
      <header className="station-heading">
        <div className="station-heading-row">
          <div aria-label="Network role" className="station-memberships">
            <span className="station-membership station-membership-connector">
              Connector
            </span>
          </div>
          <div className="station-heading-actions">
            <StationOptions
              allComplete={knownKana.size === allEntries.length}
              completeDescription="This marks every Rōmaji reading as complete."
              hasProgress={knownKana.size > 0}
              onError={() => setKnowledgeError(true)}
              onSetComplete={setAllKnowledge}
              resetDescription="This marks every Rōmaji reading as incomplete."
              stationId="romaji"
              stationName="Rōmaji"
            />
            {renderTestButton()}
          </div>
        </div>
        <h1>Rōmaji</h1>
      </header>

      <section className="romaji-guide">
        <audio
          onEnded={handleAudioEnded}
          onError={handleAudioError}
          preload="none"
          ref={audioRef}
        />

        <div className="station-intro romaji-intro">
          <p>
            <strong>Rōmaji uses the Latin alphabet—the letters A–Z—to represent Japanese sounds.</strong>{" "}
            We use it as a bridge, so you can read the sounds in the Kana stations while learning Hiragana and Katakana.
          </p>
        </div>

        <table aria-label="The 46 basic Rōmaji readings" className="hiragana-table romaji-chart">
          <thead>
            <tr>
              {columnHeadings.map((heading) => (
                <th key={heading} scope="col">{heading}</th>
              ))}
            </tr>
          </thead>
          <tbody>
            {rows.map((row, rowIndex) => (
              <tr key={rowIndex}>
                {row.map((entry, columnIndex) => (
                  <td className={entry ? undefined : "hiragana-empty"} key={columnIndex}>
                    {entry ? renderEntry(entry) : null}
                  </td>
                ))}
              </tr>
            ))}
            <tr>
              <td className="hiragana-final" colSpan={5}>
                {renderEntry(finalEntry)}
              </td>
            </tr>
          </tbody>
        </table>

        <section aria-labelledby="romaji-combined-title" className="romaji-combined">
          <h2 id="romaji-combined-title">Combined sounds</h2>
          <table
            aria-label="The 33 combined Rōmaji readings"
            className="hiragana-table romaji-chart"
          >
            <thead>
              <tr>
                {columnHeadings.map((heading) => (
                  <th key={heading} scope="col">{heading}</th>
                ))}
              </tr>
            </thead>
            <tbody>
              {combinedRows.map((row, rowIndex) => (
                <tr key={rowIndex}>
                  {row.map((entry, columnIndex) => (
                    <td className={entry ? undefined : "hiragana-empty"} key={columnIndex}>
                      {entry ? renderEntry(entry) : null}
                    </td>
                  ))}
                </tr>
              ))}
            </tbody>
          </table>
        </section>

        {audioError ? (
          <p className="station-audio-error" role="alert">
            Audio couldn&apos;t play. Try again.
          </p>
        ) : null}
        {knowledgeError ? (
          <p className="station-knowledge-error" role="alert">
            Your Rōmaji progress couldn&apos;t sync. Try again.
          </p>
        ) : null}

        <section aria-labelledby="romaji-rules-title" className="romaji-rules">
          <header className="romaji-rules-heading">
            <h2 id="romaji-rules-title">Rōmaji conventions</h2>
          </header>
          <div className="romaji-rules-list">
            {rules.map((rule, ruleIndex) => (
              <article className="romaji-rule" key={rule.id}>
                <h3>{rule.title}</h3>
                <div className="romaji-rule-examples">
                  {rule.examples.map((example, exampleIndex) => {
                    const audioIndex = 1_000 + ruleIndex * 10 + exampleIndex;
                    const playing = audioPlaying && activeAudioIndex === audioIndex;
                    return (
                      <button
                        aria-label={`Play pronunciation for ${example.romaji}`}
                        className="romaji-rule-example"
                        data-playing={playing ? "true" : undefined}
                        key={example.romaji}
                        onClick={() => playAudio({
                          index: audioIndex,
                          src: example.audio,
                        })}
                        type="button"
                      >
                        <span className="romaji-rule-reading">
                          {example.romaji}
                        </span>
                        <span
                          aria-hidden="true"
                          className="romaji-rule-audio-indicator"
                        >
                          <span />
                          <span />
                          <span />
                        </span>
                      </button>
                    );
                  })}
                </div>
                <p>{rule.note}</p>
              </article>
            ))}
          </div>
        </section>

        {activeTest && activeCard ? (
          <dialog
            aria-labelledby="romaji-test-title"
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
                <h2 id="romaji-test-title">{activeTest.title}</h2>
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
                activationLabel={answerRevealed
                  ? `Replay ${activeCard.romaji}`
                  : `Reveal and play ${activeCard.romaji}`}
                announcement={answerRevealed
                  ? `${activeCard.romaji}, ${getJapaneseSoundCue(activeCard.kana)}`
                  : ""}
                key={`${testIndex}-${activeCard.kana}`}
                onActivate={activateCard}
                onAnswer={answerCard}
                playing={audioPlaying}
              >
                <span className="hiragana-test-reveal romaji-test-reveal">
                  <span className="romaji-test-prompt">{activeCard.romaji}</span>
                </span>
                <span className="hiragana-test-answer-slot">
                  {answerRevealed ? (
                    <span
                      className="romaji-test-answer"
                      data-playing={activeAudioIndex === 0 ? "true" : undefined}
                    >
                      <span className="romaji-test-answer-cue">
                        {getJapaneseSoundCue(activeCard.kana)}
                      </span>
                    </span>
                  ) : (
                    <FlashcardCountdown onComplete={activateCard} />
                  )}
                </span>
              </FlashcardReview>
            </div>
          </dialog>
        ) : null}
      </section>
    </>
  );
}

function isRomajiEntry(entry: RomajiEntry | null): entry is RomajiEntry {
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
