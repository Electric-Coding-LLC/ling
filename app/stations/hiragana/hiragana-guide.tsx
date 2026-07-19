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
const HIRAGANA_VOWEL_SOUNDS = ["ah", "ee", "oo", "eh", "oh"] as const;
const HIRAGANA_STUDY_GROUPS = [
  {
    description: "These five clear, steady vowel sounds anchor every row that follows.",
    entries: [
      { english: "ah", example: "あさ", exampleAudio: "/audio/ja-asa.wav", kana: "あ", kanaAudio: "/audio/ja-a.wav", translation: "morning" },
      { english: "ee", example: "いぬ", exampleAudio: "/audio/ja-inu.wav", kana: "い", kanaAudio: "/audio/ja-i.wav", translation: "dog" },
      { english: "oo", example: "うみ", exampleAudio: "/audio/ja-umi.wav", kana: "う", kanaAudio: "/audio/ja-u.wav", translation: "sea" },
      { english: "eh", example: "えき", exampleAudio: "/audio/ja-eki.wav", kana: "え", kanaAudio: "/audio/ja-e.wav", translation: "station" },
      { english: "oh", example: "おと", exampleAudio: "/audio/ja-oto.wav", kana: "お", kanaAudio: "/audio/ja-o.wav", translation: "sound" },
    ],
    id: "hiragana-vowels",
    title: "The vowel row",
  },
  {
    description: "The K row pairs a short k sound with each of the five vowels.",
    entries: [
      { english: "kah", example: "かさ", exampleAudio: "/audio/ja-kasa.wav", kana: "か", kanaAudio: "/audio/ja-ka.wav", translation: "umbrella" },
      { english: "kee", example: "きく", exampleAudio: "/audio/ja-kiku.wav", kana: "き", kanaAudio: "/audio/ja-ki.wav", translation: "listen" },
      { english: "koo", example: "くち", exampleAudio: "/audio/ja-kuchi.wav", kana: "く", kanaAudio: "/audio/ja-ku.wav", translation: "mouth" },
      { english: "keh", example: "けさ", exampleAudio: "/audio/ja-kesa.wav", kana: "け", kanaAudio: "/audio/ja-ke.wav", translation: "this morning" },
      { english: "koh", example: "こえ", exampleAudio: "/audio/ja-koe.wav", kana: "こ", kanaAudio: "/audio/ja-ko.wav", translation: "voice" },
    ],
    id: "hiragana-k-row",
    title: "The K row",
  },
  {
    description: "The S row follows the vowel pattern, but し sounds closer to shee than see.",
    entries: [
      { english: "sah", example: "さかな", exampleAudio: "/audio/ja-sakana.wav", kana: "さ", kanaAudio: "/audio/ja-sa.wav", translation: "fish" },
      { english: "shee", example: "しお", exampleAudio: "/audio/ja-shio.wav", kana: "し", kanaAudio: "/audio/ja-shi.wav", translation: "salt" },
      { english: "soo", example: "すし", exampleAudio: "/audio/ja-sushi.wav", kana: "す", kanaAudio: "/audio/ja-su.wav", translation: "sushi" },
      { english: "seh", example: "せかい", exampleAudio: "/audio/ja-sekai.wav", kana: "せ", kanaAudio: "/audio/ja-se.wav", translation: "world" },
      { english: "soh", example: "そと", exampleAudio: "/audio/ja-soto.wav", kana: "そ", kanaAudio: "/audio/ja-so.wav", translation: "outside" },
    ],
    id: "hiragana-s-row",
    title: "The S row",
  },
  {
    description: "The T row includes two changes: ち sounds like chee and つ sounds like tsoo.",
    entries: [
      { english: "tah", example: "たこ", exampleAudio: "/audio/ja-tako.wav", kana: "た", kanaAudio: "/audio/ja-ta.wav", translation: "octopus" },
      { english: "chee", example: "ちち", exampleAudio: "/audio/ja-chichi.wav", kana: "ち", kanaAudio: "/audio/ja-chi.wav", translation: "father" },
      { english: "tsoo", example: "つき", exampleAudio: "/audio/ja-tsuki.wav", kana: "つ", kanaAudio: "/audio/ja-tsu.wav", translation: "moon" },
      { english: "teh", example: "て", exampleAudio: "/audio/ja-te.wav", kana: "て", kanaAudio: "/audio/ja-te.wav", translation: "hand" },
      { english: "toh", example: "とり", exampleAudio: "/audio/ja-tori.wav", kana: "と", kanaAudio: "/audio/ja-to.wav", translation: "bird" },
    ],
    id: "hiragana-t-row",
    title: "The T row",
  },
  {
    description: "The N row pairs an n sound with each vowel without a major sound change.",
    entries: [
      { english: "nah", example: "なつ", exampleAudio: "/audio/ja-natsu.wav", kana: "な", kanaAudio: "/audio/ja-na.wav", translation: "summer" },
      { english: "nee", example: "にく", exampleAudio: "/audio/ja-niku.wav", kana: "に", kanaAudio: "/audio/ja-ni.wav", translation: "meat" },
      { english: "noo", example: "ぬの", exampleAudio: "/audio/ja-nuno.wav", kana: "ぬ", kanaAudio: "/audio/ja-nu.wav", translation: "cloth" },
      { english: "neh", example: "ねこ", exampleAudio: "/audio/ja-neko.wav", kana: "ね", kanaAudio: "/audio/ja-ne.wav", translation: "cat" },
      { english: "noh", example: "のむ", exampleAudio: "/audio/ja-nomu.wav", kana: "の", kanaAudio: "/audio/ja-no.wav", translation: "drink" },
    ],
    id: "hiragana-n-row",
    title: "The N row",
  },
  {
    description: "The H row follows the pattern, but ふ begins with a soft breath closer to foo.",
    entries: [
      { english: "hah", example: "はな", exampleAudio: "/audio/ja-hana.wav", kana: "は", kanaAudio: "/audio/ja-ha.wav", translation: "flower" },
      { english: "hee", example: "ひと", exampleAudio: "/audio/ja-hito.wav", kana: "ひ", kanaAudio: "/audio/ja-hi.wav", translation: "person" },
      { english: "foo", example: "ふね", exampleAudio: "/audio/ja-fune.wav", kana: "ふ", kanaAudio: "/audio/ja-fu.wav", translation: "boat" },
      { english: "heh", example: "へや", exampleAudio: "/audio/ja-heya.wav", kana: "へ", kanaAudio: "/audio/ja-he.wav", translation: "room" },
      { english: "hoh", example: "ほし", exampleAudio: "/audio/ja-hoshi.wav", kana: "ほ", kanaAudio: "/audio/ja-ho.wav", translation: "star" },
    ],
    id: "hiragana-h-row",
    title: "The H row",
  },
  {
    description: "The M row pairs an m sound with each of the five vowels.",
    entries: [
      { english: "mah", example: "まめ", exampleAudio: "/audio/ja-mame.wav", kana: "ま", kanaAudio: "/audio/ja-ma.wav", translation: "bean" },
      { english: "mee", example: "みみ", exampleAudio: "/audio/ja-mimi.wav", kana: "み", kanaAudio: "/audio/ja-mi.wav", translation: "ear" },
      { english: "moo", example: "むし", exampleAudio: "/audio/ja-mushi.wav", kana: "む", kanaAudio: "/audio/ja-mu.wav", translation: "insect" },
      { english: "meh", example: "め", exampleAudio: "/audio/ja-me.wav", kana: "め", kanaAudio: "/audio/ja-me.wav", translation: "eye" },
      { english: "moh", example: "もも", exampleAudio: "/audio/ja-momo.wav", kana: "も", kanaAudio: "/audio/ja-mo.wav", translation: "peach" },
    ],
    id: "hiragana-m-row",
    title: "The M row",
  },
  {
    description: "The Y row has only three modern basic kana: や, ゆ, and よ.",
    entries: [
      { english: "yah", example: "やま", exampleAudio: "/audio/ja-yama.wav", kana: "や", kanaAudio: "/audio/ja-ya.wav", translation: "mountain" },
      { english: "yoo", example: "ゆき", exampleAudio: "/audio/ja-yuki.wav", kana: "ゆ", kanaAudio: "/audio/ja-yu.wav", translation: "snow" },
      { english: "yoh", example: "よる", exampleAudio: "/audio/ja-yoru.wav", kana: "よ", kanaAudio: "/audio/ja-yo.wav", translation: "night" },
    ],
    id: "hiragana-y-row",
    title: "The Y row",
  },
  {
    description: "The R row uses a quick tongue tap between an English r and l; follow the audio closely.",
    entries: [
      { english: "rah", example: "らいねん", exampleAudio: "/audio/ja-rainen.wav", kana: "ら", kanaAudio: "/audio/ja-ra.wav", translation: "next year" },
      { english: "ree", example: "りす", exampleAudio: "/audio/ja-risu.wav", kana: "り", kanaAudio: "/audio/ja-ri.wav", translation: "squirrel" },
      { english: "roo", example: "るす", exampleAudio: "/audio/ja-rusu.wav", kana: "る", kanaAudio: "/audio/ja-ru.wav", translation: "away" },
      { english: "reh", example: "れきし", exampleAudio: "/audio/ja-rekishi.wav", kana: "れ", kanaAudio: "/audio/ja-re.wav", translation: "history" },
      { english: "roh", example: "ろく", exampleAudio: "/audio/ja-roku.wav", kana: "ろ", kanaAudio: "/audio/ja-ro.wav", translation: "six" },
    ],
    id: "hiragana-r-row",
    title: "The R row",
  },
  {
    description: "The W row keeps わ and を. を sounds like お and usually marks an object. ん closes a beat without a following vowel.",
    entries: [
      { english: "wah", example: "わに", exampleAudio: "/audio/ja-wani.wav", kana: "わ", kanaAudio: "/audio/ja-wa.wav", translation: "crocodile" },
      { english: "oh", example: "これを", exampleAudio: "/audio/ja-kore-o.wav", kana: "を", kanaAudio: "/audio/ja-wo.wav", translation: "this (object)" },
      { english: "n", example: "ほん", exampleAudio: "/audio/ja-hon.wav", kana: "ん", kanaAudio: "/audio/ja-n.wav", translation: "book" },
    ],
    id: "hiragana-w-row",
    title: "The W row and ん",
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
        <p><strong>Hiragana is the everyday Kana system.</strong> Its rounded characters appear throughout Japanese sentences, for complete words as well as the grammatical parts around them.</p>
        <p>There are 46 basic Hiragana, arranged under the five vowel sounds you already know: あ, い, う, え, お. Learning them lets you sound out written Japanese, even before you know what every word means. Tap any Kana to hear it.</p>
      </div>

      <table aria-label="The 46 basic hiragana" className="hiragana-table">
        <thead>
          <tr>
            {HIRAGANA_VOWEL_SOUNDS.map((sound) => (
              <th aria-label={`Column of sounds ending in ${sound}`} key={sound} scope="col">
                {sound}
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
          <p>Work through one row at a time. Tap a kana or example to hear it. English spellings are approximate; follow the audio.</p>
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
                  <th scope="col">Sound</th>
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
                    <td className="kana-study-cue">{entry.english}</td>
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
