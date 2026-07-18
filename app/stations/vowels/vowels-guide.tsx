"use client";

import { useRef, useState } from "react";

const VOWELS = [
  { audio: "/audio/ja-a.wav", example: "あさ", exampleAudio: "/audio/ja-asa.wav", kana: "あ" },
  { audio: "/audio/ja-i.wav", example: "いぬ", exampleAudio: "/audio/ja-inu.wav", kana: "い" },
  { audio: "/audio/ja-u.wav", example: "うみ", exampleAudio: "/audio/ja-umi.wav", kana: "う" },
  { audio: "/audio/ja-e.wav", example: "えき", exampleAudio: "/audio/ja-eki.wav", kana: "え" },
  { audio: "/audio/ja-o.wav", example: "おと", exampleAudio: "/audio/ja-oto.wav", kana: "お" },
] as const;

function SpeakerIcon() {
  return (
    <svg aria-hidden="true" className="vowel-listen-icon" data-icon="speaker" viewBox="0 0 24 24">
      <path d="M11 5 6.5 9H3v6h3.5l4.5 4V5Z" />
      <path d="M15 9.5a4 4 0 0 1 0 5" />
      <path d="M18 7a7 7 0 0 1 0 10" />
    </svg>
  );
}

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
      <p className="vowels-intro">Japanese has five clear, steady vowels. Tap a sound or example to hear it.</p>

      <table aria-label="Japanese vowels" className="vowels-table">
        <thead>
          <tr>
            <th scope="col">Kana</th>
            <th scope="col">Sound</th>
            <th scope="col">Example</th>
          </tr>
        </thead>
        <tbody>
          {VOWELS.map((vowel, index) => (
            <tr className="vowel-row-wrap" key={vowel.kana}>
              <td className="vowel-kana-cell">
                <span className="vowel-kana" lang="ja">{vowel.kana}</span>
              </td>
              <td className="vowel-sound-cell">
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
                  className="vowel-audio-button vowel-sound-button vowel-row"
                  onClick={() => playAudio(vowelAudioRefs.current[index], `${vowel.kana}-vowel`)}
                  type="button"
                >
                  <SpeakerIcon />
                </button>
              </td>
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
