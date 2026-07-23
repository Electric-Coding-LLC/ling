"use client";

import type { CSSProperties } from "react";
import { useEffect, useRef, useState } from "react";
import { FlashcardContent, FlashcardReview } from "../flashcard-review";

type KanaEntry = {
  readonly audio: string;
  readonly example: string;
  readonly exampleAudio: string;
  readonly hiragana: string;
  readonly katakana: string;
  readonly sound: string;
  readonly translation: string;
};

const KATAKANA_ROWS: readonly (readonly (KanaEntry | null)[])[] = [
  [
    { audio: "/audio/ja-a.wav", example: "アニメ", exampleAudio: "/audio/ja-katakana-anime.wav", hiragana: "あ", katakana: "ア", sound: "ah", translation: "anime" },
    { audio: "/audio/ja-i.wav", example: "イメージ", exampleAudio: "/audio/ja-katakana-imeeji.wav", hiragana: "い", katakana: "イ", sound: "ee", translation: "image" },
    { audio: "/audio/ja-u.wav", example: "ウール", exampleAudio: "/audio/ja-katakana-uuru.wav", hiragana: "う", katakana: "ウ", sound: "oo", translation: "wool" },
    { audio: "/audio/ja-e.wav", example: "エアコン", exampleAudio: "/audio/ja-katakana-eakon.wav", hiragana: "え", katakana: "エ", sound: "eh", translation: "air conditioner" },
    { audio: "/audio/ja-o.wav", example: "オレンジ", exampleAudio: "/audio/ja-katakana-orenji.wav", hiragana: "お", katakana: "オ", sound: "oh", translation: "orange" },
  ],
  [
    { audio: "/audio/ja-ka.wav", example: "カメラ", exampleAudio: "/audio/ja-katakana-kamera.wav", hiragana: "か", katakana: "カ", sound: "kah", translation: "camera" },
    { audio: "/audio/ja-ki.wav", example: "キロ", exampleAudio: "/audio/ja-katakana-kiro.wav", hiragana: "き", katakana: "キ", sound: "kee", translation: "kilogram" },
    { audio: "/audio/ja-ku.wav", example: "クラス", exampleAudio: "/audio/ja-katakana-kurasu.wav", hiragana: "く", katakana: "ク", sound: "koo", translation: "class" },
    { audio: "/audio/ja-ke.wav", example: "ケーキ", exampleAudio: "/audio/ja-katakana-keeki.wav", hiragana: "け", katakana: "ケ", sound: "keh", translation: "cake" },
    { audio: "/audio/ja-ko.wav", example: "コート", exampleAudio: "/audio/ja-katakana-kooto.wav", hiragana: "こ", katakana: "コ", sound: "koh", translation: "coat" },
  ],
  [
    { audio: "/audio/ja-sa.wav", example: "サラダ", exampleAudio: "/audio/ja-katakana-sarada.wav", hiragana: "さ", katakana: "サ", sound: "sah", translation: "salad" },
    { audio: "/audio/ja-shi.wav", example: "シーツ", exampleAudio: "/audio/ja-katakana-shiitsu.wav", hiragana: "し", katakana: "シ", sound: "shee", translation: "bedsheet" },
    { audio: "/audio/ja-su.wav", example: "スープ", exampleAudio: "/audio/ja-katakana-suupu.wav", hiragana: "す", katakana: "ス", sound: "soo", translation: "soup" },
    { audio: "/audio/ja-se.wav", example: "セーター", exampleAudio: "/audio/ja-katakana-seetaa.wav", hiragana: "せ", katakana: "セ", sound: "seh", translation: "sweater" },
    { audio: "/audio/ja-so.wav", example: "ソファ", exampleAudio: "/audio/ja-katakana-sofa.wav", hiragana: "そ", katakana: "ソ", sound: "soh", translation: "sofa" },
  ],
  [
    { audio: "/audio/ja-ta.wav", example: "タクシー", exampleAudio: "/audio/ja-katakana-takushii.wav", hiragana: "た", katakana: "タ", sound: "tah", translation: "taxi" },
    { audio: "/audio/ja-chi.wav", example: "チーズ", exampleAudio: "/audio/ja-katakana-chiizu.wav", hiragana: "ち", katakana: "チ", sound: "chee", translation: "cheese" },
    { audio: "/audio/ja-tsu.wav", example: "ツアー", exampleAudio: "/audio/ja-katakana-tsuaa.wav", hiragana: "つ", katakana: "ツ", sound: "tsoo", translation: "tour" },
    { audio: "/audio/ja-te.wav", example: "テレビ", exampleAudio: "/audio/ja-katakana-terebi.wav", hiragana: "て", katakana: "テ", sound: "teh", translation: "television" },
    { audio: "/audio/ja-to.wav", example: "トマト", exampleAudio: "/audio/ja-katakana-tomato.wav", hiragana: "と", katakana: "ト", sound: "toh", translation: "tomato" },
  ],
  [
    { audio: "/audio/ja-na.wav", example: "ナイフ", exampleAudio: "/audio/ja-katakana-naifu.wav", hiragana: "な", katakana: "ナ", sound: "nah", translation: "knife" },
    { audio: "/audio/ja-ni.wav", example: "ニュース", exampleAudio: "/audio/ja-katakana-nyuusu.wav", hiragana: "に", katakana: "ニ", sound: "nee", translation: "news" },
    { audio: "/audio/ja-nu.wav", example: "ヌードル", exampleAudio: "/audio/ja-katakana-nuudoru.wav", hiragana: "ぬ", katakana: "ヌ", sound: "noo", translation: "noodles" },
    { audio: "/audio/ja-ne.wav", example: "ネクタイ", exampleAudio: "/audio/ja-katakana-nekutai.wav", hiragana: "ね", katakana: "ネ", sound: "neh", translation: "necktie" },
    { audio: "/audio/ja-no.wav", example: "ノート", exampleAudio: "/audio/ja-katakana-nooto.wav", hiragana: "の", katakana: "ノ", sound: "noh", translation: "notebook" },
  ],
  [
    { audio: "/audio/ja-ha.wav", example: "ハンバーガー", exampleAudio: "/audio/ja-katakana-hanbaagaa.wav", hiragana: "は", katakana: "ハ", sound: "hah", translation: "hamburger" },
    { audio: "/audio/ja-hi.wav", example: "ヒーター", exampleAudio: "/audio/ja-katakana-hiitaa.wav", hiragana: "ひ", katakana: "ヒ", sound: "hee", translation: "heater" },
    { audio: "/audio/ja-fu.wav", example: "フルーツ", exampleAudio: "/audio/ja-katakana-furuutsu.wav", hiragana: "ふ", katakana: "フ", sound: "foo", translation: "fruit" },
    { audio: "/audio/ja-he.wav", example: "ヘルメット", exampleAudio: "/audio/ja-katakana-herumetto.wav", hiragana: "へ", katakana: "ヘ", sound: "heh", translation: "helmet" },
    { audio: "/audio/ja-ho.wav", example: "ホテル", exampleAudio: "/audio/ja-katakana-hoteru.wav", hiragana: "ほ", katakana: "ホ", sound: "hoh", translation: "hotel" },
  ],
  [
    { audio: "/audio/ja-ma.wav", example: "マスク", exampleAudio: "/audio/ja-katakana-masuku.wav", hiragana: "ま", katakana: "マ", sound: "mah", translation: "mask" },
    { audio: "/audio/ja-mi.wav", example: "ミルク", exampleAudio: "/audio/ja-katakana-miruku.wav", hiragana: "み", katakana: "ミ", sound: "mee", translation: "milk" },
    { audio: "/audio/ja-mu.wav", example: "ムード", exampleAudio: "/audio/ja-katakana-muudo.wav", hiragana: "む", katakana: "ム", sound: "moo", translation: "mood" },
    { audio: "/audio/ja-me.wav", example: "メニュー", exampleAudio: "/audio/ja-katakana-menyuu.wav", hiragana: "め", katakana: "メ", sound: "meh", translation: "menu" },
    { audio: "/audio/ja-mo.wav", example: "モデル", exampleAudio: "/audio/ja-katakana-moderu.wav", hiragana: "も", katakana: "モ", sound: "moh", translation: "model" },
  ],
  [
    { audio: "/audio/ja-ya.wav", example: "ヤード", exampleAudio: "/audio/ja-katakana-yaado.wav", hiragana: "や", katakana: "ヤ", sound: "yah", translation: "yard" },
    null,
    { audio: "/audio/ja-yu.wav", example: "ユニフォーム", exampleAudio: "/audio/ja-katakana-yunifoomu.wav", hiragana: "ゆ", katakana: "ユ", sound: "yoo", translation: "uniform" },
    null,
    { audio: "/audio/ja-yo.wav", example: "ヨーグルト", exampleAudio: "/audio/ja-katakana-yooguruto.wav", hiragana: "よ", katakana: "ヨ", sound: "yoh", translation: "yogurt" },
  ],
  [
    { audio: "/audio/ja-ra.wav", example: "ラジオ", exampleAudio: "/audio/ja-katakana-rajio.wav", hiragana: "ら", katakana: "ラ", sound: "rah", translation: "radio" },
    { audio: "/audio/ja-ri.wav", example: "リモコン", exampleAudio: "/audio/ja-katakana-rimokon.wav", hiragana: "り", katakana: "リ", sound: "ree", translation: "remote control" },
    { audio: "/audio/ja-ru.wav", example: "ルール", exampleAudio: "/audio/ja-katakana-ruuru.wav", hiragana: "る", katakana: "ル", sound: "roo", translation: "rule" },
    { audio: "/audio/ja-re.wav", example: "レモン", exampleAudio: "/audio/ja-katakana-remon.wav", hiragana: "れ", katakana: "レ", sound: "reh", translation: "lemon" },
    { audio: "/audio/ja-ro.wav", example: "ロボット", exampleAudio: "/audio/ja-katakana-robotto.wav", hiragana: "ろ", katakana: "ロ", sound: "roh", translation: "robot" },
  ],
  [
    { audio: "/audio/ja-wa.wav", example: "ワイン", exampleAudio: "/audio/ja-katakana-wain.wav", hiragana: "わ", katakana: "ワ", sound: "wah", translation: "wine" },
    null,
    null,
    null,
    { audio: "/audio/ja-wo.wav", example: "ヲタク", exampleAudio: "/audio/ja-katakana-wotaku.wav", hiragana: "を", katakana: "ヲ", sound: "oh", translation: "enthusiast" },
  ],
];

const FINAL_KATAKANA: KanaEntry = {
  audio: "/audio/ja-n.wav",
  example: "パン",
  exampleAudio: "/audio/ja-katakana-pan.wav",
  hiragana: "ん",
  katakana: "ン",
  sound: "nn",
  translation: "bread",
};

const KATAKANA_VOWEL_SOUNDS = ["ah", "ee", "oo", "eh", "oh"] as const;

type KatakanaTest = {
  cards: KanaEntry[];
  title: string;
};

const ALL_KATAKANA_TEST_ENTRIES = [
  ...KATAKANA_ROWS.flatMap((row) => row.filter(isKanaEntry)),
  FINAL_KATAKANA,
];
const BASIC_KATAKANA_SET = new Set(
  ALL_KATAKANA_TEST_ENTRIES.map((entry) => entry.katakana),
);

export function KatakanaGuide() {
  const audioRef = useRef<HTMLAudioElement | null>(null);
  const completeDialogRef = useRef<HTMLDialogElement | null>(null);
  const dialogRef = useRef<HTMLDialogElement | null>(null);
  const resetDialogRef = useRef<HTMLDialogElement | null>(null);
  const stationOptionsRef = useRef<HTMLDetailsElement | null>(null);
  const [activeTest, setActiveTest] = useState<KatakanaTest | null>(null);
  const [audioError, setAudioError] = useState(false);
  const [audioPlaying, setAudioPlaying] = useState(false);
  const [bulkKnowledgeAction, setBulkKnowledgeAction] = useState<"complete" | "reset" | null>(null);
  const [knowledgeError, setKnowledgeError] = useState(false);
  const [knownKatakana, setKnownKatakana] = useState<Set<string>>(() => new Set());
  const [pronunciationRevealed, setPronunciationRevealed] = useState(false);
  const [testIndex, setTestIndex] = useState(0);
  const activeCard = activeTest?.cards[testIndex] ?? null;
  const allKatakanaKnown = knownKatakana.size === ALL_KATAKANA_TEST_ENTRIES.length;
  const hasKatakanaProgress = knownKatakana.size > 0;

  useEffect(() => {
    const controller = new AbortController();
    void fetch("/api/stations/katakana/introduction", { method: "POST" });

    void fetch("/api/stations/katakana/knowledge", {
      cache: "no-store",
      signal: controller.signal,
    })
      .then(async (response) => {
        if (!response.ok) throw new Error("Knowledge could not load");
        return response.json() as Promise<{ known?: unknown }>;
      })
      .then((payload) => {
        if (!Array.isArray(payload.known)) throw new Error("Knowledge is invalid");
        setKnownKatakana(new Set(
          payload.known.filter(
            (kana): kana is string => typeof kana === "string" && BASIC_KATAKANA_SET.has(kana),
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

  useEffect(() => {
    function dismissStationOptions(event: PointerEvent) {
      const stationOptions = stationOptionsRef.current;
      if (
        stationOptions?.open
        && event.target instanceof Node
        && !stationOptions.contains(event.target)
      ) {
        stationOptions.open = false;
      }
    }

    function closeStationOptionsWithEscape(event: KeyboardEvent) {
      const stationOptions = stationOptionsRef.current;
      if (event.key !== "Escape" || !stationOptions?.open) return;

      stationOptions.open = false;
      stationOptions.querySelector<HTMLElement>("summary")?.focus();
    }

    document.addEventListener("pointerdown", dismissStationOptions);
    document.addEventListener("keydown", closeStationOptionsWithEscape);
    return () => {
      document.removeEventListener("pointerdown", dismissStationOptions);
      document.removeEventListener("keydown", closeStationOptionsWithEscape);
    };
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
    setAudioPlaying(true);
    try {
      await audio.play();
    } catch {
      setAudioError(true);
      setAudioPlaying(false);
    }
  }

  function stopAudio() {
    const audio = audioRef.current;
    if (audio) {
      audio.pause();
      audio.currentTime = 0;
    }
    setAudioPlaying(false);
  }

  function renderKatakana(kana: KanaEntry) {
    const isKnown = knownKatakana.has(kana.katakana);
    return (
      <button
        aria-label={`Study ${kana.katakana}${isKnown ? ", marked known" : ""}`}
        className={`hiragana-button katakana-button${isKnown ? " katakana-button-known" : ""}`}
        data-known={isKnown ? "true" : undefined}
        onClick={() => openTest("Katakana", [kana])}
        type="button"
      >
        <span lang="ja">{kana.katakana}</span>
      </button>
    );
  }

  function openTest(title: string, entries: readonly KanaEntry[]) {
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

  function playActiveKana() {
    if (!activeCard) return;
    void playAudio(activeCard.audio);
  }

  function answerCard(known: boolean) {
    if (!activeCard || !activeTest) return;

    stopAudio();
    setPronunciationRevealed(false);
    const kana = activeCard.katakana;
    const wasKnown = knownKatakana.has(kana);
    updateKnownState(kana, known);
    setKnowledgeError(false);

    void fetch("/api/stations/katakana/knowledge", {
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
    setKnownKatakana((current) => {
      const next = new Set(current);
      if (known) next.add(kana);
      else next.delete(kana);
      return next;
    });
  }

  async function setAllKnowledge(known: boolean) {
    setBulkKnowledgeAction(known ? "complete" : "reset");
    setKnowledgeError(false);

    try {
      const response = await fetch("/api/stations/katakana/knowledge", {
        body: JSON.stringify({ known }),
        headers: { "Content-Type": "application/json" },
        method: "PATCH",
      });
      if (!response.ok) throw new Error("Knowledge could not save");

      const payload = await response.json() as { known?: unknown };
      if (!Array.isArray(payload.known)) throw new Error("Knowledge is invalid");
      const nextKnown = payload.known.filter(
        (kana): kana is string => typeof kana === "string" && BASIC_KATAKANA_SET.has(kana),
      );
      if (nextKnown.length !== payload.known.length) throw new Error("Knowledge is invalid");

      setKnownKatakana(new Set(nextKnown));
      closeStationOptions();
      if (known) completeDialogRef.current?.close();
      else resetDialogRef.current?.close();
    } catch {
      setKnowledgeError(true);
    } finally {
      setBulkKnowledgeAction(null);
    }
  }

  function closeStationOptions() {
    if (stationOptionsRef.current) stationOptionsRef.current.open = false;
  }

  function renderTestButton(title: string, entries: readonly KanaEntry[]) {
    const knownCount = entries.filter((entry) => knownKatakana.has(entry.katakana)).length;
    const remainingCount = entries.length - knownCount;
    const testLabel = remainingCount === 0
      ? `Test ${title}. Complete.`
      : `Test ${title}. ${remainingCount} remaining.`;

    return (
      <span className="hiragana-test-trigger-wrap">
        <button
          aria-label={testLabel}
          className="hiragana-test-trigger"
          data-complete={remainingCount === 0 ? "true" : undefined}
          onClick={() => openTest(title, entries)}
          style={{ "--hiragana-test-progress": `${knownCount / entries.length}turn` } as CSSProperties}
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

  return (
    <>
      <header className="station-heading">
        <div className="station-heading-row">
          <div aria-label="Lines" className="station-memberships">
            <span className="station-membership station-membership-writing" data-line="writing">
              Kana
            </span>
          </div>
          <div className="station-heading-actions">
            <details className="station-options" ref={stationOptionsRef}>
              <summary aria-label="Station options">
                <svg aria-hidden="true" viewBox="0 0 20 20">
                  <circle cx="4" cy="10" r="1.5" />
                  <circle cx="10" cy="10" r="1.5" />
                  <circle cx="16" cy="10" r="1.5" />
                </svg>
              </summary>
              <div aria-label="Station options" className="station-options-menu">
                <button
                  aria-label="Close station options"
                  className="station-options-close"
                  onClick={closeStationOptions}
                  type="button"
                >
                  <svg aria-hidden="true" viewBox="0 0 16 16">
                    <path d="m4 4 8 8M12 4l-8 8" />
                  </svg>
                </button>
                {!allKatakanaKnown ? (
                  <button
                    className="station-options-action"
                    disabled={bulkKnowledgeAction !== null}
                    onClick={() => {
                      closeStationOptions();
                      completeDialogRef.current?.showModal();
                    }}
                    type="button"
                  >
                    <svg aria-hidden="true" viewBox="0 0 16 16">
                      <path d="m3 8.5 3 3 7-7" />
                    </svg>
                    <span>I know this</span>
                  </button>
                ) : null}
                {hasKatakanaProgress ? (
                  <button
                    className="station-options-action"
                    disabled={bulkKnowledgeAction !== null}
                    onClick={() => {
                      closeStationOptions();
                      resetDialogRef.current?.showModal();
                    }}
                    type="button"
                  >
                    <svg aria-hidden="true" viewBox="0 0 16 16">
                      <path d="M12.5 5.5A5 5 0 1 0 13 10" />
                      <path d="M12.5 2.5v3h-3" />
                    </svg>
                    <span>Reset station</span>
                  </button>
                ) : null}
              </div>
            </details>
            {renderTestButton("All Katakana", ALL_KATAKANA_TEST_ENTRIES)}
          </div>
        </div>
        <h1>Katakana</h1>
      </header>

      <section className="katakana-guide">
        <audio
          onEnded={() => setAudioPlaying(false)}
          onError={() => {
            setAudioError(true);
            setAudioPlaying(false);
          }}
          onPlaying={() => setAudioPlaying(true)}
          preload="none"
          ref={audioRef}
        />
        <div className="station-intro katakana-intro">
          <p><strong>Katakana is another way to write the sounds you learned in Hiragana.</strong> Each Katakana has a Hiragana match: <span lang="ja">ア</span> sounds like <span lang="ja">あ</span>, <span lang="ja">カ</span> sounds like <span lang="ja">か</span>, and so on.</p>
          <p>Japanese uses both because they do different jobs in writing. Hiragana is used for many Japanese words and for grammar. Katakana is mainly used for words borrowed from other languages, foreign names, and sound effects.</p>
          <p>Since you already know the sounds, you only need to learn the Katakana shapes.</p>
          <p>Tap any Katakana in the chart to practice its sound.</p>
        </div>

        <table aria-label="The 46 basic Katakana" className="hiragana-table katakana-table">
          <thead>
            <tr>
              {KATAKANA_VOWEL_SOUNDS.map((sound) => (
                <th aria-label={`Column of sounds ending in ${sound}`} key={sound} scope="col">
                  {sound}
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
        {knowledgeError ? <p className="station-knowledge-error" role="alert">Your Katakana progress could not sync. Try again.</p> : null}

        {activeTest && activeCard ? (
          <dialog
            aria-labelledby="katakana-test-title"
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
                <h2 id="katakana-test-title">{activeTest.title}</h2>
                <button aria-label="Close test" className="hiragana-test-close" onClick={closeTest} type="button">
                  <span aria-hidden="true">×</span>
                </button>
              </header>

              <FlashcardReview
                announcement={pronunciationRevealed
                  ? `${activeCard.sound}. Example: ${activeCard.example}, ${activeCard.translation}`
                  : ""}
                key={`${testIndex}-${activeCard.katakana}`}
                onAnswer={answerCard}
                playing={audioPlaying}
              >
                <FlashcardContent
                  example={activeCard.example}
                  kana={activeCard.katakana}
                  onPlayExample={() => void playAudio(activeCard.exampleAudio)}
                  onPlayKana={playActiveKana}
                  onReveal={() => setPronunciationRevealed(true)}
                  pronunciation={activeCard.sound}
                  revealed={pronunciationRevealed}
                  translation={activeCard.translation}
                />
              </FlashcardReview>
            </div>
          </dialog>
        ) : null}

        <dialog
          aria-labelledby="katakana-complete-title"
          className="station-confirm-dialog"
          onCancel={(event) => {
            event.preventDefault();
            completeDialogRef.current?.close();
          }}
          ref={completeDialogRef}
        >
          <div className="station-confirm-modal">
            <h2 id="katakana-complete-title">Mark Katakana complete?</h2>
            <p>This marks all 46 Katakana as complete.</p>
            <div className="hiragana-test-actions">
              <button className="hiragana-test-answer hiragana-test-answer-no" disabled={bulkKnowledgeAction !== null} onClick={() => completeDialogRef.current?.close()} type="button">
                <svg aria-hidden="true" className="hiragana-test-answer-icon" viewBox="0 0 16 16">
                  <path d="m4 4 8 8M12 4l-8 8" />
                </svg>
                <span>Cancel</span>
              </button>
              <button className="hiragana-test-answer hiragana-test-answer-yes" disabled={bulkKnowledgeAction !== null} onClick={() => void setAllKnowledge(true)} type="button">
                <svg aria-hidden="true" className="hiragana-test-answer-icon" viewBox="0 0 16 16">
                  <path d="m3 8.5 3 3 7-7" />
                </svg>
                <span>{bulkKnowledgeAction === "complete" ? "Completing…" : "Complete"}</span>
              </button>
            </div>
          </div>
        </dialog>

        <dialog
          aria-labelledby="katakana-reset-title"
          className="station-confirm-dialog"
          onCancel={(event) => {
            event.preventDefault();
            resetDialogRef.current?.close();
          }}
          ref={resetDialogRef}
        >
          <div className="station-confirm-modal">
            <h2 id="katakana-reset-title">Reset Katakana?</h2>
            <p>This marks all 46 Katakana as incomplete. Later stations will stay hidden until Katakana is complete again.</p>
            <div className="hiragana-test-actions">
              <button className="hiragana-test-answer hiragana-test-answer-no" disabled={bulkKnowledgeAction !== null} onClick={() => resetDialogRef.current?.close()} type="button">
                <svg aria-hidden="true" className="hiragana-test-answer-icon" viewBox="0 0 16 16">
                  <path d="m4 4 8 8M12 4l-8 8" />
                </svg>
                <span>Cancel</span>
              </button>
              <button className="hiragana-test-answer station-confirm-reset" disabled={bulkKnowledgeAction !== null} onClick={() => void setAllKnowledge(false)} type="button">
                <svg aria-hidden="true" className="hiragana-test-answer-icon" viewBox="0 0 16 16">
                  <path d="M12.5 5.5A5 5 0 1 0 13 10" />
                  <path d="M12.5 2.5v3h-3" />
                </svg>
                <span>{bulkKnowledgeAction === "reset" ? "Resetting…" : "Reset"}</span>
              </button>
            </div>
          </div>
        </dialog>
      </section>
    </>
  );
}

function isKanaEntry(entry: KanaEntry | null): entry is KanaEntry {
  return entry !== null;
}

function shuffle<T>(entries: readonly T[]): T[] {
  const shuffled = [...entries];
  for (let index = shuffled.length - 1; index > 0; index -= 1) {
    const replacement = Math.floor(Math.random() * (index + 1));
    [shuffled[index], shuffled[replacement]] = [shuffled[replacement], shuffled[index]];
  }
  return shuffled;
}
