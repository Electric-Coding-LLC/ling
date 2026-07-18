"use client";

import { useRef, useState } from "react";

const VOWELS = [
  {
    audio: "/audio/ja-a.wav",
    english: "a",
    example: "あさ",
    exampleAudio: "/audio/ja-asa.wav",
    kana: "あ",
    translation: "morning",
  },
  {
    audio: "/audio/ja-i.wav",
    english: "i",
    example: "いぬ",
    exampleAudio: "/audio/ja-inu.wav",
    kana: "い",
    translation: "dog",
  },
  {
    audio: "/audio/ja-u.wav",
    english: "u",
    example: "うみ",
    exampleAudio: "/audio/ja-umi.wav",
    kana: "う",
    translation: "sea",
  },
  {
    audio: "/audio/ja-e.wav",
    english: "e",
    example: "えき",
    exampleAudio: "/audio/ja-eki.wav",
    kana: "え",
    translation: "station",
  },
  {
    audio: "/audio/ja-o.wav",
    english: "o",
    example: "おと",
    exampleAudio: "/audio/ja-oto.wav",
    kana: "お",
    translation: "sound",
  },
] as const;

export function VowelsGuide() {
  const exampleAudioRefs = useRef<Array<HTMLAudioElement | null>>([]);
  const vowelAudioRefs = useRef<Array<HTMLAudioElement | null>>([]);
  const [audioError, setAudioError] = useState<string | null>(null);

  async function playAudio(audio: HTMLAudioElement | null, errorKey: string) {
    setAudioError(null);
    if (!audio) {
      setAudioError(errorKey);
      return;
    }

    try {
      audio.currentTime = 0;
      await audio.play();
    } catch {
      setAudioError(errorKey);
    }
  }

  return (
    <section className="vowels-reference">
      <p className="vowels-intro">Japanese has five clear, steady vowels. Tap a kana or example to hear it.</p>

      <table aria-label="Japanese vowels" className="vowels-table">
        <colgroup>
          <col className="vowels-col-kana" />
          <col className="vowels-col-english" />
          <col className="vowels-col-example" />
          <col className="vowels-col-translation" />
        </colgroup>
        <thead>
          <tr>
            <th scope="col">Kana</th>
            <th className="vowels-english-heading" scope="col">English</th>
            <th scope="col">Example</th>
            <th scope="col">Translation</th>
          </tr>
        </thead>
        <tbody>
          {VOWELS.map((vowel, index) => (
            <tr className="vowel-row-wrap" key={vowel.kana}>
              <td className="vowel-kana-cell">
                <audio
                  onError={() => setAudioError(`${vowel.kana}-vowel`)}
                  preload="auto"
                  ref={(element) => {
                    vowelAudioRefs.current[index] = element;
                  }}
                  src={vowel.audio}
                />
                <button
                  aria-label={`Play isolated vowel ${vowel.kana}`}
                  className="vowel-audio-button vowel-kana-button"
                  onClick={() => playAudio(vowelAudioRefs.current[index], `${vowel.kana}-vowel`)}
                  type="button"
                >
                  <span className="vowel-kana" lang="ja">{vowel.kana}</span>
                </button>
              </td>
              <td className="vowel-english-cue">{vowel.english}</td>
              <td className="vowel-example-cell">
                <audio
                  onError={() => setAudioError(`${vowel.kana}-example`)}
                  preload="auto"
                  ref={(element) => {
                    exampleAudioRefs.current[index] = element;
                  }}
                  src={vowel.exampleAudio}
                />
                <button
                  aria-label={`Play example word ${vowel.example}`}
                  className="vowel-audio-button vowel-example"
                  onClick={() => playAudio(exampleAudioRefs.current[index], `${vowel.kana}-example`)}
                  type="button"
                >
                  <span className="vowel-example-word" lang="ja">{vowel.example}</span>
                </button>
              </td>
              <td className="vowel-translation">{vowel.translation}</td>
            </tr>
          ))}
        </tbody>
      </table>

      {audioError ? (
        <p className="vowel-error" role="alert">
          Audio could not play. Try again.
        </p>
      ) : null}

      <div className="vowels-notes">
        <p><strong>One symbol, one steady sound.</strong> English vowels often glide; Japanese vowels stay comparatively clean.</p>
        <p><strong>Length matters.</strong> Holding a vowel longer can change a word&apos;s meaning.</p>
      </div>
    </section>
  );
}
