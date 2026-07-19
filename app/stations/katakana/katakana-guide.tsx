"use client";

import { useEffect, useRef, useState } from "react";

type KanaEntry = {
  readonly audio: string;
  readonly hiragana: string;
  readonly katakana: string;
  readonly sound: string;
};

const KATAKANA_ROWS: readonly (readonly (KanaEntry | null)[])[] = [
  [
    { audio: "/audio/ja-a.wav", hiragana: "あ", katakana: "ア", sound: "ah" },
    { audio: "/audio/ja-i.wav", hiragana: "い", katakana: "イ", sound: "ee" },
    { audio: "/audio/ja-u.wav", hiragana: "う", katakana: "ウ", sound: "oo" },
    { audio: "/audio/ja-e.wav", hiragana: "え", katakana: "エ", sound: "eh" },
    { audio: "/audio/ja-o.wav", hiragana: "お", katakana: "オ", sound: "oh" },
  ],
  [
    { audio: "/audio/ja-ka.wav", hiragana: "か", katakana: "カ", sound: "kah" },
    { audio: "/audio/ja-ki.wav", hiragana: "き", katakana: "キ", sound: "kee" },
    { audio: "/audio/ja-ku.wav", hiragana: "く", katakana: "ク", sound: "koo" },
    { audio: "/audio/ja-ke.wav", hiragana: "け", katakana: "ケ", sound: "keh" },
    { audio: "/audio/ja-ko.wav", hiragana: "こ", katakana: "コ", sound: "koh" },
  ],
  [
    { audio: "/audio/ja-sa.wav", hiragana: "さ", katakana: "サ", sound: "sah" },
    { audio: "/audio/ja-shi.wav", hiragana: "し", katakana: "シ", sound: "shee" },
    { audio: "/audio/ja-su.wav", hiragana: "す", katakana: "ス", sound: "soo" },
    { audio: "/audio/ja-se.wav", hiragana: "せ", katakana: "セ", sound: "seh" },
    { audio: "/audio/ja-so.wav", hiragana: "そ", katakana: "ソ", sound: "soh" },
  ],
  [
    { audio: "/audio/ja-ta.wav", hiragana: "た", katakana: "タ", sound: "tah" },
    { audio: "/audio/ja-chi.wav", hiragana: "ち", katakana: "チ", sound: "chee" },
    { audio: "/audio/ja-tsu.wav", hiragana: "つ", katakana: "ツ", sound: "tsoo" },
    { audio: "/audio/ja-te.wav", hiragana: "て", katakana: "テ", sound: "teh" },
    { audio: "/audio/ja-to.wav", hiragana: "と", katakana: "ト", sound: "toh" },
  ],
  [
    { audio: "/audio/ja-na.wav", hiragana: "な", katakana: "ナ", sound: "nah" },
    { audio: "/audio/ja-ni.wav", hiragana: "に", katakana: "ニ", sound: "nee" },
    { audio: "/audio/ja-nu.wav", hiragana: "ぬ", katakana: "ヌ", sound: "noo" },
    { audio: "/audio/ja-ne.wav", hiragana: "ね", katakana: "ネ", sound: "neh" },
    { audio: "/audio/ja-no.wav", hiragana: "の", katakana: "ノ", sound: "noh" },
  ],
  [
    { audio: "/audio/ja-ha.wav", hiragana: "は", katakana: "ハ", sound: "hah" },
    { audio: "/audio/ja-hi.wav", hiragana: "ひ", katakana: "ヒ", sound: "hee" },
    { audio: "/audio/ja-fu.wav", hiragana: "ふ", katakana: "フ", sound: "foo" },
    { audio: "/audio/ja-he.wav", hiragana: "へ", katakana: "ヘ", sound: "heh" },
    { audio: "/audio/ja-ho.wav", hiragana: "ほ", katakana: "ホ", sound: "hoh" },
  ],
  [
    { audio: "/audio/ja-ma.wav", hiragana: "ま", katakana: "マ", sound: "mah" },
    { audio: "/audio/ja-mi.wav", hiragana: "み", katakana: "ミ", sound: "mee" },
    { audio: "/audio/ja-mu.wav", hiragana: "む", katakana: "ム", sound: "moo" },
    { audio: "/audio/ja-me.wav", hiragana: "め", katakana: "メ", sound: "meh" },
    { audio: "/audio/ja-mo.wav", hiragana: "も", katakana: "モ", sound: "moh" },
  ],
  [
    { audio: "/audio/ja-ya.wav", hiragana: "や", katakana: "ヤ", sound: "yah" },
    null,
    { audio: "/audio/ja-yu.wav", hiragana: "ゆ", katakana: "ユ", sound: "yoo" },
    null,
    { audio: "/audio/ja-yo.wav", hiragana: "よ", katakana: "ヨ", sound: "yoh" },
  ],
  [
    { audio: "/audio/ja-ra.wav", hiragana: "ら", katakana: "ラ", sound: "rah" },
    { audio: "/audio/ja-ri.wav", hiragana: "り", katakana: "リ", sound: "ree" },
    { audio: "/audio/ja-ru.wav", hiragana: "る", katakana: "ル", sound: "roo" },
    { audio: "/audio/ja-re.wav", hiragana: "れ", katakana: "レ", sound: "reh" },
    { audio: "/audio/ja-ro.wav", hiragana: "ろ", katakana: "ロ", sound: "roh" },
  ],
  [
    { audio: "/audio/ja-wa.wav", hiragana: "わ", katakana: "ワ", sound: "wah" },
    null,
    null,
    null,
    { audio: "/audio/ja-wo.wav", hiragana: "を", katakana: "ヲ", sound: "oh" },
  ],
];

const FINAL_KATAKANA: KanaEntry = {
  audio: "/audio/ja-n.wav",
  hiragana: "ん",
  katakana: "ン",
  sound: "n",
};

const KATAKANA_VOWEL_COLUMNS = ["ア", "イ", "ウ", "エ", "オ"] as const;

export function KatakanaGuide() {
  const audioRef = useRef<HTMLAudioElement | null>(null);
  const [audioError, setAudioError] = useState(false);

  useEffect(() => {
    void fetch("/api/stations/katakana/introduction", { method: "POST" });
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

  function renderKatakana(kana: KanaEntry) {
    return (
      <button
        aria-label={`Play ${kana.katakana}, matching Hiragana ${kana.hiragana}`}
        className="katakana-button"
        onClick={() => playAudio(kana.audio)}
        type="button"
      >
        <span className="katakana-character" lang="ja">{kana.katakana}</span>
        <span className="katakana-match">
          <span lang="ja">{kana.hiragana}</span>
          <span aria-hidden="true"> · </span>
          <span>{kana.sound}</span>
        </span>
      </button>
    );
  }

  return (
    <section className="katakana-guide">
      <audio onError={() => setAudioError(true)} preload="none" ref={audioRef} />
      <div className="station-intro katakana-intro">
        <p><strong>Katakana is the second basic sound-writing system of Japanese.</strong> It represents the same sounds as Hiragana with a more angular set of characters.</p>
        <p>Katakana commonly appears in borrowed words, foreign names, emphasis, and sound effects. Because the sounds are familiar, focus on connecting each new shape to the Hiragana you already know.</p>
        <p>Tap any Katakana to hear its sound. Its Hiragana match and approximate sound spelling appear underneath.</p>
      </div>

      <table aria-label="The 46 basic Katakana paired with Hiragana" className="katakana-table">
        <thead>
          <tr>
            {KATAKANA_VOWEL_COLUMNS.map((vowel) => (
              <th aria-label={`Column of sounds ending in ${vowel}`} key={vowel} scope="col">
                <span aria-hidden="true" lang="ja">{vowel}</span>
              </th>
            ))}
          </tr>
        </thead>
        <tbody>
          {KATAKANA_ROWS.map((row, rowIndex) => (
            <tr key={rowIndex}>
              {row.map((kana, columnIndex) => (
                <td className={kana ? undefined : "katakana-empty"} key={columnIndex}>
                  {kana ? renderKatakana(kana) : null}
                </td>
              ))}
            </tr>
          ))}
          <tr>
            <td className="katakana-final" colSpan={5}>{renderKatakana(FINAL_KATAKANA)}</td>
          </tr>
        </tbody>
      </table>

      {audioError ? <p className="station-audio-error" role="alert">Audio could not play. Try again.</p> : null}

      <div className="station-notes">
        <p><strong>Same sounds, different shapes.</strong> The rows follow the same five-vowel order as Hiragana.</p>
        <p><strong>This is the base chart.</strong> Sound marks and small Katakana extend these forms later.</p>
      </div>
    </section>
  );
}
