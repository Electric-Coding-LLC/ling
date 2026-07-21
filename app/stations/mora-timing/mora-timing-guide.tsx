"use client";

import { useRef, useState } from "react";

type MoraExample = {
  readonly meaning: string;
  readonly morae: readonly {
    readonly audio?: string;
    readonly text: string;
  }[];
  readonly word: string;
  readonly wordAudio: string;
};

const MORA_EXAMPLES: readonly MoraExample[] = [
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
    meaning: "stamp",
    morae: [
      { audio: "/audio/ja-ki.wav", text: "き" },
      { text: "っ" },
      { audio: "/audio/ja-te.wav", text: "て" },
    ],
    word: "きって",
    wordAudio: "/audio/ja-kitte.wav",
  },
  {
    meaning: "cake",
    morae: [
      { audio: "/audio/ja-ke.wav", text: "ケ" },
      { text: "ー" },
      { audio: "/audio/ja-ki.wav", text: "キ" },
    ],
    word: "ケーキ",
    wordAudio: "/audio/ja-keeki.wav",
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
];

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
        <p>Small <span lang="ja">っ・ッ</span> add a short pause. The Katakana mark <span lang="ja">ー</span> makes the sound before it longer. Each one takes a beat.</p>
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
                    {mora.audio ? (
                      <button
                        aria-label={`Play timing unit ${mora.text}`}
                        className="mora-part-button"
                        onClick={() => playAudio(mora.audio as string)}
                        type="button"
                      >
                        <span lang="ja">{mora.text}</span>
                      </button>
                    ) : (
                      <span className="mora-part-sign" lang="ja">{mora.text}</span>
                    )}
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
        <p>In <span lang="ja">きって</span>, small <span lang="ja">っ</span> holds a beat before <span lang="ja">て</span>. In <span lang="ja">ケーキ</span>, <span lang="ja">ー</span> holds the sound in <span lang="ja">ケ</span> for another beat.</p>
        <p>Keeping those beats even helps Japanese sound natural and makes words easier to understand.</p>
      </section>
    </section>
  );
}
