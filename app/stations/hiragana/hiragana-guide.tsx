"use client";

import { useEffect, useRef, useState } from "react";

const HIRAGANA_ROWS = [
  [
    { audio: "/audio/ja-a.wav", character: "あ" },
    { audio: "/audio/ja-i.wav", character: "い" },
    { audio: "/audio/ja-u.wav", character: "う" },
    { audio: "/audio/ja-e.wav", character: "え" },
    { audio: "/audio/ja-o.wav", character: "お" },
  ],
  [
    { audio: "/audio/ja-ka.wav", character: "か" },
    { audio: "/audio/ja-ki.wav", character: "き" },
    { audio: "/audio/ja-ku.wav", character: "く" },
    { audio: "/audio/ja-ke.wav", character: "け" },
    { audio: "/audio/ja-ko.wav", character: "こ" },
  ],
  [
    { audio: "/audio/ja-sa.wav", character: "さ" },
    { audio: "/audio/ja-shi.wav", character: "し" },
    { audio: "/audio/ja-su.wav", character: "す" },
    { audio: "/audio/ja-se.wav", character: "せ" },
    { audio: "/audio/ja-so.wav", character: "そ" },
  ],
  [
    { audio: "/audio/ja-ta.wav", character: "た" },
    { audio: "/audio/ja-chi.wav", character: "ち" },
    { audio: "/audio/ja-tsu.wav", character: "つ" },
    { audio: "/audio/ja-te.wav", character: "て" },
    { audio: "/audio/ja-to.wav", character: "と" },
  ],
  [
    { audio: "/audio/ja-na.wav", character: "な" },
    { audio: "/audio/ja-ni.wav", character: "に" },
    { audio: "/audio/ja-nu.wav", character: "ぬ" },
    { audio: "/audio/ja-ne.wav", character: "ね" },
    { audio: "/audio/ja-no.wav", character: "の" },
  ],
  [
    { audio: "/audio/ja-ha.wav", character: "は" },
    { audio: "/audio/ja-hi.wav", character: "ひ" },
    { audio: "/audio/ja-fu.wav", character: "ふ" },
    { audio: "/audio/ja-he.wav", character: "へ" },
    { audio: "/audio/ja-ho.wav", character: "ほ" },
  ],
  [
    { audio: "/audio/ja-ma.wav", character: "ま" },
    { audio: "/audio/ja-mi.wav", character: "み" },
    { audio: "/audio/ja-mu.wav", character: "む" },
    { audio: "/audio/ja-me.wav", character: "め" },
    { audio: "/audio/ja-mo.wav", character: "も" },
  ],
  [
    { audio: "/audio/ja-ya.wav", character: "や" },
    null,
    { audio: "/audio/ja-yu.wav", character: "ゆ" },
    null,
    { audio: "/audio/ja-yo.wav", character: "よ" },
  ],
  [
    { audio: "/audio/ja-ra.wav", character: "ら" },
    { audio: "/audio/ja-ri.wav", character: "り" },
    { audio: "/audio/ja-ru.wav", character: "る" },
    { audio: "/audio/ja-re.wav", character: "れ" },
    { audio: "/audio/ja-ro.wav", character: "ろ" },
  ],
  [
    { audio: "/audio/ja-wa.wav", character: "わ" },
    null,
    null,
    null,
    { audio: "/audio/ja-wo.wav", character: "を" },
  ],
] as const;

const FINAL_HIRAGANA = { audio: "/audio/ja-n.wav", character: "ん" } as const;
const HIRAGANA_VOWEL_COLUMNS = ["あ", "い", "う", "え", "お"] as const;
const HIRAGANA_STUDY_GROUPS = [
  {
    description: "Japanese has five clear, steady vowels.",
    entries: [
      { cue: "a", example: "あさ", exampleAudio: "/audio/ja-asa.wav", kana: "あ", kanaAudio: "/audio/ja-a.wav", translation: "morning" },
      { cue: "i", example: "いぬ", exampleAudio: "/audio/ja-inu.wav", kana: "い", kanaAudio: "/audio/ja-i.wav", translation: "dog" },
      { cue: "u", example: "うみ", exampleAudio: "/audio/ja-umi.wav", kana: "う", kanaAudio: "/audio/ja-u.wav", translation: "sea" },
      { cue: "e", example: "えき", exampleAudio: "/audio/ja-eki.wav", kana: "え", kanaAudio: "/audio/ja-e.wav", translation: "station" },
      { cue: "o", example: "おと", exampleAudio: "/audio/ja-oto.wav", kana: "お", kanaAudio: "/audio/ja-o.wav", translation: "sound" },
    ],
    id: "hiragana-vowels",
    title: "The five vowels",
  },
  {
    description: "These add a short consonant sound before the same five vowels.",
    entries: [
      { cue: "car", example: "かさ", exampleAudio: "/audio/ja-kasa.wav", kana: "か", kanaAudio: "/audio/ja-ka.wav", translation: "umbrella" },
      { cue: "key", example: "きく", exampleAudio: "/audio/ja-kiku.wav", kana: "き", kanaAudio: "/audio/ja-ki.wav", translation: "listen" },
      { cue: "coo", example: "くち", exampleAudio: "/audio/ja-kuchi.wav", kana: "く", kanaAudio: "/audio/ja-ku.wav", translation: "mouth" },
      { cue: "kept", example: "けさ", exampleAudio: "/audio/ja-kesa.wav", kana: "け", kanaAudio: "/audio/ja-ke.wav", translation: "this morning" },
      { cue: "coat", example: "こえ", exampleAudio: "/audio/ja-koe.wav", kana: "こ", kanaAudio: "/audio/ja-ko.wav", translation: "voice" },
    ],
    id: "hiragana-next-five",
    title: "The next five sounds",
  },
] as const;

export function HiraganaGuide() {
  const audioRef = useRef<HTMLAudioElement | null>(null);
  const [audioError, setAudioError] = useState(false);

  useEffect(() => {
    void fetch("/api/stations/hiragana/introduction", { method: "POST" });
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

  function renderKana(kana: { readonly audio: string; readonly character: string }) {
    return (
      <button
        aria-label={`Play ${kana.character}`}
        className="hiragana-button"
        onClick={() => playAudio(kana.audio)}
        type="button"
      >
        <span lang="ja">{kana.character}</span>
      </button>
    );
  }

  return (
    <section className="hiragana-guide">
      <audio onError={() => setAudioError(true)} preload="none" ref={audioRef} />
      <div className="station-intro hiragana-intro">
        <p><strong>Hiragana is the basic sound-writing system of Japanese.</strong> Each character represents a spoken sound rather than a meaning. Japanese uses hiragana throughout sentences, for complete words as well as the grammatical parts around them.</p>
        <p>There are 46 basic hiragana, arranged here under the five vowel sounds あ, い, う, え, お. Learning them lets you sound out written Japanese, even before you know what every word means. Tap any kana to hear it.</p>
      </div>

      <table aria-label="The 46 basic hiragana" className="hiragana-table">
        <thead>
          <tr>
            {HIRAGANA_VOWEL_COLUMNS.map((vowel) => (
              <th aria-label={`Column of sounds ending in ${vowel}`} key={vowel} scope="col">
                <span aria-hidden="true" lang="ja">{vowel}</span>
              </th>
            ))}
          </tr>
        </thead>
        <tbody>
          {HIRAGANA_ROWS.map((row, rowIndex) => (
            <tr key={rowIndex}>
              {row.map((kana, columnIndex) => (
                <td className={kana ? undefined : "hiragana-empty"} key={columnIndex}>
                  {kana ? renderKana(kana) : null}
                </td>
              ))}
            </tr>
          ))}
          <tr>
            <td className="hiragana-final" colSpan={5}>{renderKana(FINAL_HIRAGANA)}</td>
          </tr>
        </tbody>
      </table>

      {audioError ? <p className="station-audio-error" role="alert">Audio could not play. Try again.</p> : null}

      <div className="station-notes">
        <p><strong>Read each row across.</strong> The vowel pattern stays in the same five-column order.</p>
        <p><strong>This is the base chart.</strong> Sound marks and small kana extend these forms without replacing them.</p>
      </div>

      <section aria-labelledby="hiragana-groups-title" className="hiragana-groups">
        <header className="hiragana-groups-heading">
          <h2 id="hiragana-groups-title">Hear them in words</h2>
          <p>Start with the first ten. Tap a kana or example to hear it. English words are only nearby sound cues; follow the audio.</p>
        </header>

        {HIRAGANA_STUDY_GROUPS.map((group) => (
          <section aria-labelledby={`${group.id}-title`} className="hiragana-study-group" key={group.id}>
            <h3 id={`${group.id}-title`}>{group.title}</h3>
            <p>{group.description}</p>
            <table aria-label={group.title} className="kana-study-table">
              <colgroup>
                <col className="kana-study-col-kana" />
                <col className="kana-study-col-cue" />
                <col className="kana-study-col-example" />
                <col className="kana-study-col-translation" />
              </colgroup>
              <thead>
                <tr>
                  <th scope="col">Kana</th>
                  <th scope="col">English cue</th>
                  <th scope="col">Example</th>
                  <th scope="col">Translation</th>
                </tr>
              </thead>
              <tbody>
                {group.entries.map((entry) => (
                  <tr key={entry.kana}>
                    <td>
                      <button
                        aria-label={`Play ${entry.kana}`}
                        className="kana-study-button kana-study-kana-button"
                        onClick={() => playAudio(entry.kanaAudio)}
                        type="button"
                      >
                        <span lang="ja">{entry.kana}</span>
                      </button>
                    </td>
                    <td className="kana-study-cue">{entry.cue}</td>
                    <td>
                      <button
                        aria-label={`Play example word ${entry.example}`}
                        className="kana-study-button kana-study-example-button"
                        onClick={() => playAudio(entry.exampleAudio)}
                        type="button"
                      >
                        <span lang="ja">{entry.example}</span>
                      </button>
                    </td>
                    <td className="kana-study-translation">{entry.translation}</td>
                  </tr>
                ))}
              </tbody>
            </table>
            {group.id === "hiragana-vowels" ? (
              <div className="kana-study-notes">
                <p><strong>One symbol, one steady sound.</strong> English vowels often glide; Japanese vowels stay comparatively clean.</p>
                <p><strong>Length matters.</strong> Holding a vowel longer can change a word&apos;s meaning.</p>
              </div>
            ) : null}
          </section>
        ))}
      </section>
    </section>
  );
}
