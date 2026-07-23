"use client";

import type { CSSProperties } from "react";
import { useEffect, useRef, useState } from "react";
import {
  getJapaneseSoundCue,
  getJapaneseWordSoundCue,
  JAPANESE_VOWEL_SOUND_CUES,
  splitJapaneseMorae,
} from "@/src/modules/learning/japanese-sound-cues";
import { FlashcardContent, FlashcardReview } from "../flashcard-review";
import { useFlashcardAudio } from "../use-flashcard-audio";

type VowelCard = {
  readonly audio: string;
  readonly example: string;
  readonly exampleAudio: string;
  readonly kana: string;
  readonly script: "hiragana" | "katakana";
  readonly translation: string;
};

type VowelTest = {
  readonly cards: VowelCard[];
  readonly title: string;
};

const VOWEL_CARDS: readonly VowelCard[] = [
  { audio: "/audio/ja-a.wav", example: "あさ", exampleAudio: "/audio/ja-asa.wav", kana: "あ", script: "hiragana", translation: "morning" },
  { audio: "/audio/ja-i.wav", example: "いぬ", exampleAudio: "/audio/ja-inu.wav", kana: "い", script: "hiragana", translation: "dog" },
  { audio: "/audio/ja-u.wav", example: "うみ", exampleAudio: "/audio/ja-umi.wav", kana: "う", script: "hiragana", translation: "sea" },
  { audio: "/audio/ja-e.wav", example: "えき", exampleAudio: "/audio/ja-eki.wav", kana: "え", script: "hiragana", translation: "station" },
  { audio: "/audio/ja-o.wav", example: "おと", exampleAudio: "/audio/ja-oto.wav", kana: "お", script: "hiragana", translation: "sound" },
  { audio: "/audio/ja-a.wav", example: "アニメ", exampleAudio: "/audio/ja-katakana-anime.wav", kana: "ア", script: "katakana", translation: "animation" },
  { audio: "/audio/ja-i.wav", example: "イカ", exampleAudio: "/audio/ja-katakana-ika.wav", kana: "イ", script: "katakana", translation: "squid" },
  { audio: "/audio/ja-u.wav", example: "ウニ", exampleAudio: "/audio/ja-katakana-uni.wav", kana: "ウ", script: "katakana", translation: "sea urchin" },
  { audio: "/audio/ja-e.wav", example: "エアコン", exampleAudio: "/audio/ja-katakana-eakon.wav", kana: "エ", script: "katakana", translation: "air conditioner" },
  { audio: "/audio/ja-o.wav", example: "オセロ", exampleAudio: "/audio/ja-katakana-osero.wav", kana: "オ", script: "katakana", translation: "Othello" },
];
const VOWEL_ROWS = [
  VOWEL_CARDS.filter((entry) => entry.script === "hiragana"),
  VOWEL_CARDS.filter((entry) => entry.script === "katakana"),
] as const;
const VOWEL_KANA = new Set(VOWEL_CARDS.map((entry) => entry.kana));

export function KanaGuide() {
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
  const dialogRef = useRef<HTMLDialogElement | null>(null);
  const [activeTest, setActiveTest] = useState<VowelTest | null>(null);
  const [knowledgeError, setKnowledgeError] = useState(false);
  const [knownKana, setKnownKana] = useState<Set<string>>(() => new Set());
  const [pronunciationRevealed, setPronunciationRevealed] = useState(false);
  const [testIndex, setTestIndex] = useState(0);
  const activeCard = activeTest?.cards[testIndex] ?? null;

  useEffect(() => {
    const controller = new AbortController();
    void fetch("/api/stations/kana/introduction", { method: "POST" });

    void Promise.all([
      fetch("/api/stations/hiragana/knowledge", { cache: "no-store", signal: controller.signal }),
      fetch("/api/stations/katakana/knowledge", { cache: "no-store", signal: controller.signal }),
    ])
      .then(async (responses) => {
        if (responses.some((response) => !response.ok)) throw new Error("Knowledge could not load");
        return Promise.all(responses.map((response) => response.json() as Promise<{ known?: unknown }>));
      })
      .then((payloads) => {
        if (payloads.some((payload) => !Array.isArray(payload.known))) {
          throw new Error("Knowledge is invalid");
        }
        setKnownKana(new Set(
          payloads.flatMap((payload) => payload.known as unknown[]).filter(
            (kana): kana is string => typeof kana === "string" && VOWEL_KANA.has(kana),
          ),
        ));
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

  function openTest(title: string, entries: readonly VowelCard[]) {
    stopAudio();
    setKnowledgeError(false);
    setPronunciationRevealed(false);
    setTestIndex(0);
    setActiveTest({ cards: shuffle(entries), title });
  }

  function closeTest() {
    stopAudio();
    dialogRef.current?.close();
    setActiveTest(null);
    setPronunciationRevealed(false);
    setTestIndex(0);
  }

  function activateCard() {
    if (!activeCard) return;
    setPronunciationRevealed(true);
    playAudio({ index: 0, src: activeCard.audio });
  }

  function playExample() {
    if (!activeCard) return;
    playAudio({
      beatCount: splitJapaneseMorae(activeCard.example).length,
      index: 1,
      src: activeCard.exampleAudio,
    });
  }

  function answerCard(known: boolean) {
    if (!activeCard || !activeTest) return;

    stopAudio();
    setPronunciationRevealed(false);
    const { kana, script } = activeCard;
    const wasKnown = knownKana.has(kana);
    updateKnownState(kana, known);
    setKnowledgeError(false);

    void fetch(`/api/stations/${script}/knowledge`, {
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

  function renderTestButton() {
    const knownCount = VOWEL_CARDS.filter((entry) => knownKana.has(entry.kana)).length;
    const remainingCount = VOWEL_CARDS.length - knownCount;
    const testLabel = remainingCount === 0
      ? "Test All Vowels. Complete."
      : `Test All Vowels. ${remainingCount} remaining.`;

    return (
      <span className="hiragana-test-trigger-wrap">
        <button
          aria-label={testLabel}
          className="hiragana-test-trigger"
          data-complete={remainingCount === 0 ? "true" : undefined}
          onClick={() => openTest("Vowels", VOWEL_CARDS)}
          style={{ "--hiragana-test-progress": `${knownCount / VOWEL_CARDS.length}turn` } as CSSProperties}
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

  function renderKana(entry: VowelCard) {
    const isKnown = knownKana.has(entry.kana);
    return (
      <button
        aria-label={`Study ${entry.kana}${isKnown ? ", marked known" : ""}`}
        className={`hiragana-button${isKnown ? " hiragana-button-known" : ""}`}
        data-known={isKnown ? "true" : undefined}
        onClick={() => openTest("Vowels", [entry])}
        type="button"
      >
        <span lang="ja">{entry.kana}</span>
      </button>
    );
  }

  return (
    <>
      <header className="station-heading">
        <div className="station-heading-row">
          <div aria-label="Lines" className="station-memberships">
            <span className="station-membership station-membership-sound" data-line="sound">Speech</span>
            <span className="station-membership station-membership-writing" data-line="writing">Kana</span>
          </div>
          <div className="station-heading-actions">{renderTestButton()}</div>
        </div>
        <h1>Vowels</h1>
      </header>

      <section className="kana-guide">
        <audio
          onEnded={handleAudioEnded}
          onError={handleAudioError}
          preload="none"
          ref={audioRef}
        />

        <div className="station-intro kana-intro">
          <p><strong>Kana is the collective name for Hiragana and Katakana.</strong> They are two sets of characters used to write how Japanese words sound. Both sets represent the same sounds with different shapes.</p>
          <p>Hiragana is used for everyday Japanese words and grammar. Katakana is used mainly for borrowed words, foreign names, emphasis, and sound effects.</p>
        </div>

        <p className="kana-table-intro"><strong>Start with the five vowel sounds.</strong> Tap any Kana to practice it.</p>

        <table aria-label="The five Japanese vowels in Hiragana and Katakana" className="hiragana-table kana-vowels-chart">
          <thead>
            <tr>
              {JAPANESE_VOWEL_SOUND_CUES.map((sound) => <th key={sound} scope="col">{sound}</th>)}
            </tr>
          </thead>
          <tbody>
            {VOWEL_ROWS.map((row) => (
              <tr key={row[0]?.script}>
                {row.map((entry) => <td key={entry.kana}>{renderKana(entry)}</td>)}
              </tr>
            ))}
          </tbody>
        </table>

        {audioError ? <p className="station-audio-error" role="alert">Audio could not play. Try again.</p> : null}
        {knowledgeError ? <p className="station-knowledge-error" role="alert">Your Vowels progress could not sync. Try again.</p> : null}

        <div className="station-notes">
          <p><strong>Same sound, two shapes.</strong> Each pair above is pronounced the same way.</p>
        </div>

        {activeTest && activeCard ? (
          <dialog
            aria-labelledby="vowels-test-title"
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
                <h2 id="vowels-test-title">{activeTest.title}</h2>
                <button aria-label="Close test" className="hiragana-test-close" onClick={closeTest} type="button">
                  <span aria-hidden="true">×</span>
                </button>
              </header>

              <FlashcardReview
                activationLabel={pronunciationRevealed
                  ? `Replay ${activeCard.kana}`
                  : `Reveal and play ${activeCard.kana}`}
                announcement={pronunciationRevealed ? `${getJapaneseSoundCue(activeCard.kana)}. Example: ${activeCard.example}, ${getJapaneseWordSoundCue(activeCard.example)}, ${activeCard.translation}` : ""}
                key={`${testIndex}-${activeCard.kana}`}
                onActivate={activateCard}
                onAnswer={answerCard}
                playing={audioPlaying}
              >
                <FlashcardContent
                  activeAudio={activeAudioIndex === 0
                    ? "pronunciation"
                    : activeAudioIndex === 1 ? "example" : null}
                  activeExampleBeatIndex={activeBeatIndex}
                  example={activeCard.example}
                  examplePronunciation={getJapaneseWordSoundCue(activeCard.example)}
                  kana={activeCard.kana}
                  onPlayExample={playExample}
                  onReveal={activateCard}
                  pronunciation={getJapaneseSoundCue(activeCard.kana)}
                  revealed={pronunciationRevealed}
                  translation={activeCard.translation}
                />
              </FlashcardReview>
            </div>
          </dialog>
        ) : null}
      </section>
    </>
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
