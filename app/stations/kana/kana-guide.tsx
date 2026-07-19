"use client";

import { useEffect, useRef, useState } from "react";

const VOWELS = [
  {
    audio: "/audio/ja-a.wav",
    example: "あさ",
    exampleAudio: "/audio/ja-asa.wav",
    hiragana: "あ",
    katakana: "ア",
    sound: "ah",
    translation: "morning",
  },
  {
    audio: "/audio/ja-i.wav",
    example: "いぬ",
    exampleAudio: "/audio/ja-inu.wav",
    hiragana: "い",
    katakana: "イ",
    sound: "ee",
    translation: "dog",
  },
  {
    audio: "/audio/ja-u.wav",
    example: "うみ",
    exampleAudio: "/audio/ja-umi.wav",
    hiragana: "う",
    katakana: "ウ",
    sound: "oo",
    translation: "sea",
  },
  {
    audio: "/audio/ja-e.wav",
    example: "えき",
    exampleAudio: "/audio/ja-eki.wav",
    hiragana: "え",
    katakana: "エ",
    sound: "eh",
    translation: "station",
  },
  {
    audio: "/audio/ja-o.wav",
    example: "おと",
    exampleAudio: "/audio/ja-oto.wav",
    hiragana: "お",
    katakana: "オ",
    sound: "oh",
    translation: "sound",
  },
] as const;

export function KanaGuide() {
  const audioRef = useRef<HTMLAudioElement | null>(null);
  const [audioError, setAudioError] = useState(false);

  useEffect(() => {
    void fetch("/api/stations/kana/introduction", { method: "POST" });
  }, []);

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
    <section className="kana-guide">
      <audio onError={() => setAudioError(true)} preload="none" ref={audioRef} />

      <div className="station-intro kana-intro">
        <p><strong>Kana is the collective name for Hiragana and Katakana.</strong> They are two sets of characters used to write how Japanese words sound. Both sets represent the same sounds with different shapes.</p>
        <p>Hiragana is used for everyday Japanese words and grammar. Katakana is used mainly for borrowed words, foreign names, emphasis, and sound effects.</p>
      </div>

      <p className="kana-table-intro"><strong>Start with the five vowel sounds.</strong> Tap a Kana pair or example word to hear it.</p>

      <table aria-label="The five Japanese vowels in Hiragana and Katakana" className="kana-study-table kana-vowels-table">
        <colgroup>
          <col className="kana-study-col-kana" />
          <col className="kana-study-col-cue" />
          <col className="kana-study-col-example" />
          <col className="kana-study-col-translation" />
        </colgroup>
        <thead>
          <tr>
            <th scope="col">Kana</th>
            <th scope="col">Sound</th>
            <th scope="col">Example</th>
            <th scope="col">Translation</th>
          </tr>
        </thead>
        <tbody>
          {VOWELS.map((vowel) => (
            <tr key={vowel.hiragana}>
              <td>
                <button
                  aria-label={`Play ${vowel.hiragana} and ${vowel.katakana}, the same vowel sound`}
                  className="kana-study-button kana-study-kana-button"
                  onClick={() => playAudio(vowel.audio)}
                  type="button"
                >
                  <span className="kana-pair" lang="ja">{vowel.hiragana} {vowel.katakana}</span>
                </button>
              </td>
              <td className="kana-study-cue">{vowel.sound}</td>
              <td>
                <button
                  aria-label={`Play example word ${vowel.example}`}
                  className="kana-study-button kana-study-example-button"
                  onClick={() => playAudio(vowel.exampleAudio)}
                  type="button"
                >
                  <span lang="ja">{vowel.example}</span>
                </button>
              </td>
              <td className="kana-study-translation">{vowel.translation}</td>
            </tr>
          ))}
        </tbody>
      </table>

      {audioError ? <p className="station-audio-error" role="alert">Audio could not play. Try again.</p> : null}

      <div className="station-notes">
        <p><strong>Same sound, two shapes.</strong> Each pair above is pronounced the same way.</p>
        <p><strong>Kanji is different.</strong> Kanji primarily carries meaning and can have multiple readings; it comes later.</p>
      </div>
    </section>
  );
}
