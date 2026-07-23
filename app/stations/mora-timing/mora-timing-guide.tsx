"use client";

import type { CSSProperties } from "react";
import { useEffect, useRef, useState } from "react";
import {
  isMoraTimingReviewId,
  MORA_TIMING_REVIEW_IDS,
  type MoraTimingReviewId,
} from "@/src/modules/learning/mora-timing";
import {
  getJapaneseMoraSoundCueSeparator,
  getJapaneseMoraSoundCues,
  getJapaneseWordSoundCue,
  splitJapaneseMorae,
} from "@/src/modules/learning/japanese-sound-cues";
import { FlashcardCountdown, FlashcardReview } from "../flashcard-review";

type MoraExample = {
  readonly meaning: string;
  readonly morae: readonly string[];
  readonly word: string;
  readonly wordAudio: string;
};

type MoraConcept = {
  readonly description: string;
  readonly examples: readonly MoraExample[];
  readonly title: string;
};

type MoraReviewCard = {
  readonly id: MoraTimingReviewId;
  readonly meaning: string;
  readonly morae: readonly string[];
  readonly word: string;
  readonly wordAudio: string;
};

type MoraReview = {
  readonly cards: MoraReviewCard[];
  readonly title: string;
};

type MoraPlayback = {
  readonly moraCount: number;
  readonly word: string;
};

const MORA_CONCEPTS: readonly MoraConcept[] = [
  {
    description: "Most Kana take one beat each. Keep every beat the same length.",
    examples: [
      { meaning: "dog", morae: ["い", "ぬ"], word: "いぬ", wordAudio: "/audio/ja-inu.wav" },
      { meaning: "morning", morae: ["あ", "さ"], word: "あさ", wordAudio: "/audio/ja-asa.wav" },
    ],
    title: "One Kana, one beat",
  },
  {
    description: "The final ん is a complete timing unit. Give it the same space as the Kana before it.",
    examples: [
      { meaning: "book", morae: ["ほ", "ん"], word: "ほん", wordAudio: "/audio/ja-hon.wav" },
      { meaning: "wine", morae: ["ワ", "イ", "ン"], word: "ワイン", wordAudio: "/audio/ja-katakana-wain.wav" },
    ],
    title: "ん has its own beat",
  },
  {
    description: "The small ゃ, ゅ, or ょ combines with the Kana before it. The pair takes one beat, not two.",
    examples: [
      { meaning: "today", morae: ["きょ", "う"], word: "きょう", wordAudio: "/audio/ja-yoon-hiragana-kyo.wav" },
      { meaning: "guest", morae: ["きゃ", "く"], word: "きゃく", wordAudio: "/audio/ja-kyaku.wav" },
    ],
    title: "Yōon is one beat",
  },
  {
    description: "Small っ or ッ holds a silent beat before the next sound. Do not skip over it.",
    examples: [
      { meaning: "stamp", morae: ["き", "っ", "て"], word: "きって", wordAudio: "/audio/ja-kitte.wav" },
      { meaning: "robot", morae: ["ロ", "ボ", "ッ", "ト"], word: "ロボット", wordAudio: "/audio/ja-katakana-robotto.wav" },
    ],
    title: "Small っ holds a silent beat",
  },
  {
    description: "The prolonged sound mark ー, used mainly in Katakana, extends the sound before it for one more beat.",
    examples: [
      { meaning: "cake", morae: ["ケ", "ー", "キ"], word: "ケーキ", wordAudio: "/audio/ja-keeki.wav" },
      { meaning: "cheese", morae: ["チ", "ー", "ズ"], word: "チーズ", wordAudio: "/audio/ja-katakana-chiizu.wav" },
    ],
    title: "ー extends the sound",
  },
];

const MORA_REVIEW_CARDS: readonly MoraReviewCard[] = [
  { id: "basic-neko", meaning: "cat", morae: ["ね", "こ"], word: "ねこ", wordAudio: "/audio/ja-neko.wav" },
  { id: "basic-sakana", meaning: "fish", morae: ["さ", "か", "な"], word: "さかな", wordAudio: "/audio/ja-sakana.wav" },
  { id: "nasal-pan", meaning: "bread", morae: ["パ", "ン"], word: "パン", wordAudio: "/audio/ja-katakana-pan.wav" },
  { id: "nasal-pyon", meaning: "hop", morae: ["ぴょ", "ん"], word: "ぴょん", wordAudio: "/audio/ja-yoon-hiragana-pyo.wav" },
  { id: "yoon-shashin", meaning: "photograph", morae: ["しゃ", "し", "ん"], word: "しゃしん", wordAudio: "/audio/ja-yoon-hiragana-sha.wav" },
  { id: "yoon-ryokou", meaning: "travel", morae: ["りょ", "こ", "う"], word: "りょこう", wordAudio: "/audio/ja-yoon-hiragana-ryo.wav" },
  { id: "small-tsu-zakku", meaning: "backpack", morae: ["ザ", "ッ", "ク"], word: "ザック", wordAudio: "/audio/ja-marks-zakku.wav" },
  { id: "small-tsu-shop", meaning: "shop", morae: ["ショ", "ッ", "プ"], word: "ショップ", wordAudio: "/audio/ja-yoon-katakana-sho.wav" },
  { id: "long-mark-soup", meaning: "soup", morae: ["ス", "ー", "プ"], word: "スープ", wordAudio: "/audio/ja-katakana-suupu.wav" },
  { id: "long-mark-guitar", meaning: "guitar", morae: ["ギ", "ー", "タ", "ー"], word: "ギター", wordAudio: "/audio/ja-marks-gitaa.wav" },
];

export function MoraTimingGuide() {
  const animationFrameRef = useRef<number | null>(null);
  const audioRef = useRef<HTMLAudioElement | null>(null);
  const dialogRef = useRef<HTMLDialogElement | null>(null);
  const playbackRef = useRef<MoraPlayback | null>(null);
  const [activeBeatIndex, setActiveBeatIndex] = useState<number | null>(null);
  const [activeReview, setActiveReview] = useState<MoraReview | null>(null);
  const [audioError, setAudioError] = useState(false);
  const [audioPlaying, setAudioPlaying] = useState(false);
  const [breakdownRevealed, setBreakdownRevealed] = useState(false);
  const [knowledgeError, setKnowledgeError] = useState(false);
  const [knownReviews, setKnownReviews] = useState<Set<MoraTimingReviewId>>(() => new Set());
  const [playingWord, setPlayingWord] = useState<string | null>(null);
  const [reviewIndex, setReviewIndex] = useState(0);
  const activeCard = activeReview?.cards[reviewIndex] ?? null;

  useEffect(() => {
    const controller = new AbortController();
    void fetch("/api/stations/mora-timing/introduction", { method: "POST" });

    void fetch("/api/stations/mora-timing/knowledge", {
      cache: "no-store",
      signal: controller.signal,
    })
      .then(async (response) => {
        if (!response.ok) throw new Error("Knowledge could not load");
        return response.json() as Promise<{ known?: unknown }>;
      })
      .then((payload) => {
        if (!Array.isArray(payload.known)) throw new Error("Knowledge is invalid");
        const known = payload.known.filter(isMoraTimingReviewId);
        if (known.length !== payload.known.length) throw new Error("Knowledge is invalid");
        setKnownReviews(new Set(known));
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

  useEffect(() => () => cancelBeatAnimation(), []);

  async function playAudio(src: string, playback: MoraPlayback) {
    setAudioError(false);
    const audio = audioRef.current;
    if (!audio) {
      setAudioError(true);
      return;
    }

    stopAudio();
    playbackRef.current = playback;
    setPlayingWord(playback.word);
    audio.src = src;
    audio.currentTime = 0;
    setAudioPlaying(true);
    try {
      await audio.play();
    } catch {
      setAudioError(true);
      clearPlaybackFeedback();
    }
  }

  function stopAudio() {
    const audio = audioRef.current;
    if (audio) {
      audio.pause();
      audio.currentTime = 0;
    }
    clearPlaybackFeedback();
  }

  function cancelBeatAnimation() {
    if (animationFrameRef.current === null) return;
    window.cancelAnimationFrame(animationFrameRef.current);
    animationFrameRef.current = null;
  }

  function clearPlaybackFeedback() {
    cancelBeatAnimation();
    playbackRef.current = null;
    setActiveBeatIndex(null);
    setAudioPlaying(false);
    setPlayingWord(null);
  }

  function startBeatAnimation() {
    cancelBeatAnimation();
    if (window.matchMedia("(prefers-reduced-motion: reduce)").matches) return;

    function updateActiveBeat() {
      const audio = audioRef.current;
      const playback = playbackRef.current;
      if (!audio || !playback || audio.paused || audio.ended) return;

      if (Number.isFinite(audio.duration) && audio.duration > 0) {
        const progress = Math.min(audio.currentTime / audio.duration, 0.999999);
        const nextBeat = Math.floor(progress * playback.moraCount);
        setActiveBeatIndex((current) => current === nextBeat ? current : nextBeat);
      }
      animationFrameRef.current = window.requestAnimationFrame(updateActiveBeat);
    }

    updateActiveBeat();
  }

  function handleAudioPlaying() {
    setAudioPlaying(true);
    startBeatAnimation();
  }

  function activateReviewCard() {
    if (!activeCard) return;
    setBreakdownRevealed(true);
    void playAudio(activeCard.wordAudio, {
      moraCount: activeCard.morae.length,
      word: activeCard.word,
    });
  }

  function openReview() {
    stopAudio();
    resetReviewReveal();
    setKnowledgeError(false);
    setReviewIndex(0);
    setActiveReview({ cards: shuffle(MORA_REVIEW_CARDS), title: "Mora timing" });
  }

  function closeReview() {
    stopAudio();
    dialogRef.current?.close();
    setActiveReview(null);
    resetReviewReveal();
    setReviewIndex(0);
  }

  function answerCard(known: boolean) {
    if (!activeCard || !activeReview) return;

    stopAudio();
    resetReviewReveal();
    const { id } = activeCard;
    const wasKnown = knownReviews.has(id);
    updateKnownState(id, known);
    setKnowledgeError(false);

    void fetch("/api/stations/mora-timing/knowledge", {
      body: JSON.stringify({ reviewId: id, known }),
      headers: { "Content-Type": "application/json" },
      method: "PUT",
    }).then((response) => {
      if (!response.ok) throw new Error("Knowledge could not save");
    }).catch(() => {
      updateKnownState(id, wasKnown);
      setKnowledgeError(true);
    });

    if (reviewIndex + 1 >= activeReview.cards.length) closeReview();
    else setReviewIndex((current) => current + 1);
  }

  function resetReviewReveal() {
    setBreakdownRevealed(false);
  }

  function updateKnownState(reviewId: MoraTimingReviewId, known: boolean) {
    setKnownReviews((current) => {
      const next = new Set(current);
      if (known) next.add(reviewId);
      else next.delete(reviewId);
      return next;
    });
  }

  const knownCount = MORA_REVIEW_CARDS.filter((card) => knownReviews.has(card.id)).length;
  const remainingCount = MORA_REVIEW_CARDS.length - knownCount;
  const reviewLabel = remainingCount === 0
    ? "Test Mora timing. Complete."
    : `Test Mora timing. ${remainingCount} remaining.`;

  return (
    <>
      <header className="station-heading">
        <div className="station-heading-row">
          <div aria-label="Lines" className="station-memberships">
            <span className="station-membership station-membership-sound" data-line="sound">Speech</span>
          </div>
          <div className="station-heading-actions">
            <span className="hiragana-test-trigger-wrap">
              <button
                aria-label={reviewLabel}
                className="hiragana-test-trigger"
                data-complete={remainingCount === 0 ? "true" : undefined}
                onClick={openReview}
                style={{ "--hiragana-test-progress": `${knownCount / MORA_TIMING_REVIEW_IDS.length}turn` } as CSSProperties}
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
        <h1>Mora timing</h1>
      </header>

      <section className="mora-guide">
        <audio
          onEnded={clearPlaybackFeedback}
          onError={() => {
            setAudioError(true);
            clearPlaybackFeedback();
          }}
          onPlaying={handleAudioPlaying}
          preload="none"
          ref={audioRef}
        />

        <div className="station-intro mora-intro">
          <p><strong>Japanese is spoken in even rhythmic beats called morae.</strong> A mora is one unit of timing, which is not always the same as an English syllable.</p>
          <p>Tap a word to hear it. Then repeat each visible beat at the same steady pace.</p>
        </div>

        <div aria-label="Japanese mora timing concepts" className="mora-concepts">
          {MORA_CONCEPTS.map((concept) => (
            <section className="mora-concept" key={concept.title}>
              <header className="mora-concept-heading">
                <h2>{concept.title}</h2>
                <p>{concept.description}</p>
              </header>
              <div className="mora-example-list">
                {concept.examples.map((example) => (
                  <button
                    aria-label={`Play ${example.word}`}
                    className="mora-example"
                    data-playing={audioPlaying && playingWord === example.word ? "true" : undefined}
                    key={example.word}
                    onClick={() => void playAudio(example.wordAudio, {
                      moraCount: example.morae.length,
                      word: example.word,
                    })}
                    type="button"
                  >
                    <span className="mora-example-timing">
                      <MoraBeats
                        activeBeatIndex={audioPlaying && playingWord === example.word ? activeBeatIndex : null}
                        morae={example.morae}
                        word={example.word}
                      />
                      <MoraAudioIndicator />
                    </span>
                    <MoraPronunciation
                      activeBeatIndex={audioPlaying && playingWord === example.word ? activeBeatIndex : null}
                      word={example.word}
                    />
                    <span className="mora-meaning">{example.meaning}</span>
                  </button>
                ))}
              </div>
            </section>
          ))}
        </div>

        {audioError ? <p className="station-audio-error" role="alert">Audio could not play. Try again.</p> : null}
        {knowledgeError ? <p className="station-knowledge-error" role="alert">Your Mora timing progress could not sync. Try again.</p> : null}

        {activeReview && activeCard ? (
          <dialog
            aria-labelledby="mora-review-title"
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
                <h2 id="mora-review-title">{activeReview.title}</h2>
                <button aria-label="Close test" className="hiragana-test-close" onClick={closeReview} type="button">
                  <span aria-hidden="true">×</span>
                </button>
              </header>
              <FlashcardReview
                activationLabel={breakdownRevealed
                  ? `Replay ${activeCard.word}`
                  : `Reveal timing and play ${activeCard.word}`}
                announcement={breakdownRevealed
                  ? `${activeCard.word}: ${activeCard.morae.length} beats, ${activeCard.morae.join(", ")}. ${activeCard.meaning}.`
                  : ""}
                key={`${reviewIndex}-${activeCard.id}`}
                onActivate={activateReviewCard}
                onAnswer={answerCard}
                playing={audioPlaying}
              >
                <span className="mora-review-card-content">
                  <span
                    aria-hidden={!breakdownRevealed}
                    className="mora-review-translation"
                    data-revealed={breakdownRevealed ? "true" : undefined}
                  >
                    {activeCard.meaning}
                  </span>
                  <span className="mora-review-word">
                    <span lang="ja">{activeCard.word}</span>
                  </span>
                  <span className="mora-review-answer-slot">
                    {breakdownRevealed ? (
                      <MoraBeats
                        activeBeatIndex={audioPlaying && playingWord === activeCard.word ? activeBeatIndex : null}
                        morae={activeCard.morae}
                        word={activeCard.word}
                      />
                    ) : (
                      <FlashcardCountdown onComplete={activateReviewCard} />
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

function MoraAudioIndicator() {
  return (
    <span aria-hidden="true" className="mora-audio-indicator">
      <span />
      <span />
      <span />
    </span>
  );
}

function MoraBeats({
  activeBeatIndex,
  morae,
  word,
}: {
  readonly activeBeatIndex: number | null;
  readonly morae: readonly string[];
  readonly word: string;
}) {
  return (
    <span aria-label={`${word}: ${morae.length} beats`} className="mora-beats">
      {morae.map((mora, index) => (
        <span
          className="mora-beat"
          data-active={activeBeatIndex === index ? "true" : undefined}
          key={`${word}-${index}`}
          lang="ja"
        >
          {mora}
        </span>
      ))}
    </span>
  );
}

function MoraPronunciation({
  activeBeatIndex,
  word,
}: {
  readonly activeBeatIndex: number | null;
  readonly word: string;
}) {
  const morae = splitJapaneseMorae(word);
  const soundCues = getJapaneseMoraSoundCues(word);

  return (
    <span
      aria-label={getJapaneseWordSoundCue(word)}
      className="mora-pronunciation"
    >
      {soundCues.map((soundCue, index) => {
        const connected = index > 0
          && getJapaneseMoraSoundCueSeparator(morae, index) === "";

        return (
          <span
            className="mora-pronunciation-beat"
            data-active={activeBeatIndex === index ? "true" : undefined}
            data-connected={connected ? "true" : undefined}
            key={`${word}-sound-${index}`}
          >
            {soundCue}
          </span>
        );
      })}
    </span>
  );
}

function shuffle<T>(entries: readonly T[]): T[] {
  const next = [...entries];
  for (let index = next.length - 1; index > 0; index -= 1) {
    const replacement = Math.floor(Math.random() * (index + 1));
    [next[index], next[replacement]] = [next[replacement], next[index]];
  }
  return next;
}
