"use client";

import { useRef, useState } from "react";

const MORA_EXAMPLES = [
  {
    meaning: "dog",
    morae: [
      { audio: "/audio/ja-i.wav", text: "い" },
      { audio: "/audio/ja-nu.wav", text: "ぬ" },
    ],
    word: "いぬ",
    wordAudio: "/audio/ja-inu.wav",
  },
  {
    meaning: "morning",
    morae: [
      { audio: "/audio/ja-a.wav", text: "あ" },
      { audio: "/audio/ja-sa.wav", text: "さ" },
    ],
    word: "あさ",
    wordAudio: "/audio/ja-asa.wav",
  },
  {
    meaning: "mother",
    morae: [
      { audio: "/audio/ja-o.wav", text: "お" },
      { audio: "/audio/ja-ka.wav", text: "か" },
      { audio: "/audio/ja-a.wav", text: "あ" },
      { audio: "/audio/ja-sa.wav", text: "さ" },
      { audio: "/audio/ja-n.wav", text: "ん" },
    ],
    word: "おかあさん",
    wordAudio: "/audio/ja-okaasan.wav",
  },
  {
    meaning: "book",
    morae: [
      { audio: "/audio/ja-ho.wav", text: "ほ" },
      { audio: "/audio/ja-n.wav", text: "ん" },
    ],
    word: "ほん",
    wordAudio: "/audio/ja-hon.wav",
  },
] as const;

export function MoraTimingGuide() {
  const audioRef = useRef<HTMLAudioElement | null>(null);
  const [audioError, setAudioError] = useState(false);

  async function playAudio(src: string) {
    setAudioError(false);
    const audio = audioRef.current;
    if (!audio) {
      setAudioError(true);
      return;
    }

    audio.pause();
    audio.src = src;
    audio.currentTime = 0;
    try {
      await audio.play();
    } catch {
      setAudioError(true);
    }
  }

  return (
    <section className="mora-guide">
      <audio onError={() => setAudioError(true)} preload="none" ref={audioRef} />
      <div className="mora-explanation">
        <p><strong>Japanese words are spoken in even rhythmic beats.</strong> Linguists call each beat a mora.</p>
        <p>A mora is one unit of timing. It is not exactly the same as an English syllable. Tap a word to hear it, then say each part at a steady pace.</p>
      </div>

      <div aria-label="Japanese mora timing examples" className="mora-rows" role="list">
        {MORA_EXAMPLES.map((example) => (
          <article className="mora-row" key={example.word} role="listitem">
            <div className="mora-row-heading">
              <button
                aria-label={`Play ${example.word}`}
                className="mora-word-button"
                onClick={() => playAudio(example.wordAudio)}
                type="button"
              >
                <span lang="ja">{example.word}</span>
              </button>
              <span className="mora-meaning">{example.meaning}</span>
            </div>
            <div className="mora-row-timing">
              <span aria-label={`${example.word}: ${example.morae.length} beats`} className="mora-breakdown">
                {example.morae.map((mora, index) => (
                  <span key={`${example.word}-${index}`}>
                    {index > 0 ? <span aria-hidden="true" className="mora-divider">｜</span> : null}
                    <button
                      aria-label={`Play timing unit ${mora.text}`}
                      className="mora-part-button"
                      onClick={() => playAudio(mora.audio)}
                      type="button"
                    >
                      <span lang="ja">{mora.text}</span>
                    </button>
                  </span>
                ))}
              </span>
              <span className="mora-count">{example.morae.length} beats</span>
            </div>
          </article>
        ))}
      </div>

      {audioError ? <p className="station-audio-error" role="alert">Audio could not play. Try again.</p> : null}

      <section aria-labelledby="mora-why-title" className="mora-explanation mora-explanation-after">
        <h2 id="mora-why-title">Why the count matters</h2>
        <p><span lang="ja">おかあさん</span> may feel like fewer syllables to an English speaker, but Japanese gives it five timing units. The long vowel and <span lang="ja">ん</span> each take their own beat.</p>
        <p>Keeping those beats even helps Japanese sound natural and makes words easier to understand.</p>
      </section>
    </section>
  );
}
