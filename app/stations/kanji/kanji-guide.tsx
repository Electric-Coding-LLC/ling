"use client";

import { getVocabularyItem } from "@/src/modules/learning/vocabulary";
import { useFlashcardAudio } from "../use-flashcard-audio";

const KANJI_EXAMPLES = [
  { id: "hito", kanji: "人", kana: "", note: "A single character can be a complete word." },
  { id: "namae", kanji: "名前", kana: "", note: "Characters also combine to make a word." },
  { id: "taberu", kanji: "食", kana: "べる", note: "Kanji can carry the core meaning while Hiragana completes the word." },
  { id: "ookii", kanji: "大", kana: "きい", note: "The same pattern appears in descriptions." },
] as const;

export function KanjiGuide() {
  const {
    activeAudioIndex,
    audioError,
    audioPlaying,
    audioRef,
    handleAudioEnded,
    handleAudioError,
    playAudio,
  } = useFlashcardAudio();

  return (
    <section className="kanji-guide">
      <header className="station-heading">
        <div className="station-heading-row">
          <div aria-label="Network line" className="station-memberships">
            <span className="station-membership station-membership-writing" data-line="writing">
              Writing
            </span>
          </div>
        </div>
        <h1>Kanji</h1>
      </header>

      <audio
        onEnded={handleAudioEnded}
        onError={handleAudioError}
        preload="none"
        ref={audioRef}
      />

      <div className="station-intro kanji-intro">
        <p><strong>Kanji are characters that carry meaning inside Japanese words.</strong> Kana still matters: it shows the reading and often completes the word around a Kanji.</p>
        <p>Ling introduces Kanji through words you can use. Learn the written form, its reading, and its meaning together; a character can have other readings in other words.</p>
      </div>

      <section aria-labelledby="kanji-in-words-title" className="kanji-examples-section">
        <h2 id="kanji-in-words-title">Kanji in words</h2>
        <div className="kanji-example-list">
          {KANJI_EXAMPLES.map((example, index) => {
            const item = getVocabularyItem(example.id);
            const playing = audioPlaying && activeAudioIndex === index;
            return (
              <button
                aria-label={`Play ${item.word}, ${item.reading}, ${item.meaning}`}
                className="kanji-example"
                data-playing={playing ? "true" : undefined}
                key={item.id}
                onClick={() => playAudio({ index, src: item.audio })}
                type="button"
              >
                <span className="kanji-example-meaning">{item.meaning}</span>
                <span aria-hidden="true" className="kanji-example-word" lang="ja">
                  <strong>{example.kanji}</strong>{example.kana}
                </span>
                <span className="kanji-example-reading" lang="ja">{item.reading}</span>
                <span className="kanji-example-note">{example.note}</span>
              </button>
            );
          })}
        </div>
      </section>

      {audioError ? <p className="station-audio-error" role="alert">Audio could not play. Try again.</p> : null}
    </section>
  );
}
