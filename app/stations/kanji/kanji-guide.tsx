"use client";

import { useEffect, useState } from "react";
import {
  getKanjiMemoryNote,
  isKanjiKnowledge,
  KANJI_REVIEW_DIRECTIONS,
  type KanjiKnowledge,
  type KanjiReviewDirection,
  type KanjiStation,
} from "@/src/modules/learning/kanji";
import {
  getPitchLevels,
} from "@/src/modules/learning/pitch-accent";
import {
  getVocabularyItem,
  type VocabularyItem,
} from "@/src/modules/learning/vocabulary";
import {
  getJapaneseMorae,
  getJapaneseWordRomaji,
} from "@/src/modules/romaji";
import { FlashcardCountdown, FlashcardReview } from "../flashcard-review";
import { PitchContour, pitchLabel } from "../pitch-contour";
import { StationOptions } from "../station-options";
import { useFlashcardAudio } from "../use-flashcard-audio";
import { WordAudioIndicator, WordReviewDialog, WordReviewLauncher } from "../word-review";

type KanjiReview = {
  readonly cards: readonly VocabularyItem[];
  readonly direction: KanjiReviewDirection;
};

export function KanjiGuide({ station }: { readonly station: KanjiStation }) {
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
  const [activeReview, setActiveReview] = useState<KanjiReview | null>(null);
  const [answerRevealed, setAnswerRevealed] = useState(false);
  const [knowledgeError, setKnowledgeError] = useState(false);
  const [knownItems, setKnownItems] = useState<KnownKanjiItems>(createEmptyKnownItems);
  const [reviewIndex, setReviewIndex] = useState(0);
  const activeCard = activeReview?.cards[reviewIndex] ?? null;
  const writingFirst = activeReview?.direction !== "reading-to-writing";
  const activeCardMorae = activeCard ? getJapaneseMorae(activeCard.reading) : null;
  const activeCardPitch = activeCardMorae && activeCard
    ? getPitchLevels(activeCardMorae.length, activeCard.pitchAccent)
    : null;

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
        const known = payload.known.filter((value): value is KanjiKnowledge =>
          isKanjiKnowledge(value),
        );
        if (known.length !== payload.known.length) throw new Error("Knowledge is invalid");
        setKnownItems(toKnownKanjiItems(known));
      })
      .catch(() => {
        if (!controller.signal.aborted) setKnowledgeError(true);
      });

    return () => controller.abort();
  }, [station.id]);

  function itemIndex(item: VocabularyItem) {
    return station.items.findIndex((candidate) => candidate.id === item.id);
  }

  function playItem(item: VocabularyItem) {
    playAudio({
      beatCount: getJapaneseMorae(item.reading).length,
      index: itemIndex(item),
      src: item.audio,
    });
  }

  function activateCard() {
    if (!activeCard) return;
    setAnswerRevealed(true);
    playItem(activeCard);
  }

  function openReview(direction: KanjiReviewDirection) {
    stopAudio();
    setAnswerRevealed(false);
    setKnowledgeError(false);
    setReviewIndex(0);
    setActiveReview({ cards: shuffle(station.items), direction });
  }

  function closeReview() {
    stopAudio();
    setActiveReview(null);
    setAnswerRevealed(false);
    setReviewIndex(0);
  }

  function updateKnownState(
    itemId: string,
    direction: KanjiReviewDirection,
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
    const nextKnown = payload.known.filter((value): value is KanjiKnowledge =>
      isKanjiKnowledge(value),
    );
    if (nextKnown.length !== payload.known.length) throw new Error("Knowledge is invalid");
    setKnownItems(toKnownKanjiItems(nextKnown));
  }

  const knownRecallCount = KANJI_REVIEW_DIRECTIONS.reduce(
    (count, direction) => count + station.items.filter((item) =>
      knownItems[direction].has(item.id),
    ).length,
    0,
  );
  const totalRecallCount = station.items.length * KANJI_REVIEW_DIRECTIONS.length;
  const remainingRecallCount = totalRecallCount - knownRecallCount;
  const reviewLabel = remainingRecallCount === 0
    ? `Review ${station.name}. Complete.`
    : `Review ${station.name}. ${remainingRecallCount} recalls remaining.`;

  return (
    <>
      <header className="station-heading">
        <div className="station-heading-row">
          <div aria-label="Lines" className="station-memberships">
            <span className="station-membership station-membership-kanji" data-line="kanji">
              Kanji
            </span>
          </div>
          <div className="station-heading-actions">
            <StationOptions
              allComplete={remainingRecallCount === 0}
              completeDescription={`This marks both reading directions for all ${station.items.length} ${station.name} words as complete.`}
              hasProgress={knownRecallCount > 0}
              onError={() => setKnowledgeError(true)}
              onSetComplete={setAllKnowledge}
              resetDescription={`This resets both reading directions for all ${station.items.length} ${station.name} words.`}
              stationId={station.id}
              stationName={station.name}
            />
            <WordReviewLauncher
              directions={[
                {
                  label: "Writing → Reading",
                  onSelect: () => openReview("writing-to-reading"),
                  progress: formatDirectionProgress(station, knownItems, "writing-to-reading"),
                },
                {
                  label: "Reading → Writing",
                  onSelect: () => openReview("reading-to-writing"),
                  progress: formatDirectionProgress(station, knownItems, "reading-to-writing"),
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

      <section className="vocabulary-guide kanji-guide">
        <audio onEnded={handleAudioEnded} onError={handleAudioError} preload="none" ref={audioRef} />

        <div className="station-intro vocabulary-intro kanji-intro">
          {station.description.map((paragraph) => <p key={paragraph}>{paragraph}</p>)}
          <p>Listen to each word as you study its written form and reading.</p>
        </div>

        <div aria-label={`${station.name} reference`} className="vocabulary-reference-list">
          {station.items.map((item) => {
            const playing = audioPlaying && activeAudioIndex === itemIndex(item);
            const morae = getJapaneseMorae(item.reading);
            const pitch = getPitchLevels(morae.length, item.pitchAccent);
            const memoryAnnouncement = formatMemoryAnnouncement(item);
            return (
              <button
                aria-label={`Play ${item.word}, ${item.reading}, ${item.meaning}, ${morae.length} ${morae.length === 1 ? "beat" : "beats"}${memoryAnnouncement ? `. ${memoryAnnouncement}` : ""}`}
                className="vocabulary-reference-item"
                data-known={KANJI_REVIEW_DIRECTIONS.every((direction) => knownItems[direction].has(item.id)) ? "true" : undefined}
                data-playing={playing ? "true" : undefined}
                key={item.id}
                onClick={() => playItem(item)}
                type="button"
              >
                <span className="vocabulary-reference-meaning">{item.meaning}</span>
                <span className="vocabulary-reference-written" lang="ja">{item.word}</span>
                <PitchContour
                  activeMoraIndex={playing ? activeBeatIndex : null}
                  morae={morae}
                  pitch={pitch}
                  showPronunciation
                  word={item.reading}
                />
                <KanjiMemoryNote item={item} />
                <WordAudioIndicator />
              </button>
            );
          })}
        </div>

        {audioError ? <p className="station-audio-error" role="alert">Audio could not play. Try again.</p> : null}
        {knowledgeError ? <p className="station-knowledge-error" role="alert">Your {station.name} progress could not sync. Try again.</p> : null}

        {activeReview && activeCard && activeCardMorae && activeCardPitch ? (
          <WordReviewDialog
            directionLabel={writingFirst ? "Writing → Reading" : "Reading → Writing"}
            onDismiss={closeReview}
            stationId={station.id}
            stationName={station.name}
          >
            <FlashcardReview
              activationLabel={`Play ${activeCard.word}`}
              announcement={answerRevealed ? kanjiAnnouncement(activeCard, writingFirst) : ""}
              key={`${activeReview.direction}-${reviewIndex}-${activeCard.id}`}
              onActivate={activateCard}
              onAnswer={answerCard}
              playing={audioPlaying && activeAudioIndex === itemIndex(activeCard)}
            >
                <span className="vocabulary-review-content">
                  <span className="vocabulary-review-word vocabulary-review-prompt-word" lang="ja">
                    {writingFirst ? activeCard.word : activeCard.reading}
                  </span>
                  <span className="vocabulary-review-answer-slot">
                    {answerRevealed ? (
                      <span className="vocabulary-review-answer">
                        {writingFirst ? (
                          <>
                            <PitchContour
                              activeMoraIndex={audioPlaying && activeAudioIndex === itemIndex(activeCard) ? activeBeatIndex : null}
                              morae={activeCardMorae}
                              pitch={activeCardPitch}
                              showPronunciation
                              word={activeCard.reading}
                            />
                            <span className="vocabulary-review-meaning">{activeCard.meaning}</span>
                          </>
                        ) : (
                          <>
                            <span className="vocabulary-review-word" lang="ja">{activeCard.word}</span>
                            <span className="vocabulary-review-meaning">{activeCard.meaning}</span>
                          </>
                        )}
                        <KanjiMemoryNote item={activeCard} />
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

type KnownKanjiItems = Record<KanjiReviewDirection, Set<string>>;

function createEmptyKnownItems(): KnownKanjiItems {
  return {
    "reading-to-writing": new Set(),
    "writing-to-reading": new Set(),
  };
}

function toKnownKanjiItems(knowledge: readonly KanjiKnowledge[]): KnownKanjiItems {
  const knownItems = createEmptyKnownItems();
  for (const item of knowledge) knownItems[item.direction].add(item.itemId);
  return knownItems;
}

function formatDirectionProgress(
  station: KanjiStation,
  knownItems: KnownKanjiItems,
  direction: KanjiReviewDirection,
) {
  const knownCount = station.items.filter((item) => knownItems[direction].has(item.id)).length;
  const remainingCount = station.items.length - knownCount;
  return remainingCount === 0 ? "Complete" : `${remainingCount} remaining`;
}

function kanjiAnnouncement(item: VocabularyItem, writingFirst: boolean) {
  const morae = getJapaneseMorae(item.reading);
  const pitch = getPitchLevels(morae.length, item.pitchAccent);
  const answer = writingFirst
    ? `${item.word}: reading ${item.reading}, Rōmaji ${getJapaneseWordRomaji(item.reading)}, ${item.meaning}`
    : `${item.reading}: written ${item.word}, ${item.meaning}`;
  const memoryAnnouncement = formatMemoryAnnouncement(item);
  return `${answer}. ${morae.length} ${morae.length === 1 ? "beat" : "beats"}. ${pitchLabel(pitch)}.${memoryAnnouncement ? ` ${memoryAnnouncement}` : ""}`;
}

function KanjiMemoryNote({ item }: { readonly item: VocabularyItem }) {
  const note = getKanjiMemoryNote(item.id);
  if (!note) return null;
  const relatedItem = note.relatedItemId
    ? getVocabularyItem(note.relatedItemId)
    : null;

  return (
    <span className="kanji-memory-note">
      <span className="kanji-memory-label">Memory cue</span>
      <span className="kanji-memory-cue">{note.cue}</span>
      {relatedItem ? (
        <span className="kanji-memory-related">
          <span className="kanji-memory-related-label">Seen again</span>{" "}
          <span lang="ja">{relatedItem.word}</span> · <span lang="ja">{relatedItem.reading}</span> · {relatedItem.meaning}
        </span>
      ) : null}
    </span>
  );
}

function formatMemoryAnnouncement(item: VocabularyItem) {
  const note = getKanjiMemoryNote(item.id);
  if (!note) return "";
  const relatedItem = note.relatedItemId
    ? getVocabularyItem(note.relatedItemId)
    : null;
  return relatedItem
    ? `Memory cue: ${note.cue} Seen again: ${relatedItem.word}, ${relatedItem.reading}, ${relatedItem.meaning}.`
    : `Memory cue: ${note.cue}`;
}

function shuffle<T>(entries: readonly T[]): T[] {
  const next = [...entries];
  for (let index = next.length - 1; index > 0; index -= 1) {
    const replacement = Math.floor(Math.random() * (index + 1));
    [next[index], next[replacement]] = [next[replacement], next[index]];
  }
  return next;
}
