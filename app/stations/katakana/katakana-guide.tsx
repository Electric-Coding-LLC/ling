"use client";

import type { CSSProperties } from "react";
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
  sound: "nn",
};

const KATAKANA_VOWEL_COLUMNS = ["ア", "イ", "ウ", "エ", "オ"] as const;
const KATAKANA_GROUP_DEFINITIONS = [
  { description: "The same five steady vowel sounds now use their Katakana shapes.", id: "katakana-vowels", title: "The vowel row" },
  { description: "Match each K-row Katakana to the Hiragana sound you already know.", id: "katakana-k-row", title: "The K row" },
  { description: "The S row keeps the familiar pattern, including シ for the shee sound.", id: "katakana-s-row", title: "The S row" },
  { description: "The T row includes チ for chee and ツ for tsoo.", id: "katakana-t-row", title: "The T row" },
  { description: "The N row pairs an n sound with each of the five vowels.", id: "katakana-n-row", title: "The N row" },
  { description: "The H row includes フ for the soft foo sound.", id: "katakana-h-row", title: "The H row" },
  { description: "The M row follows the regular five-vowel pattern.", id: "katakana-m-row", title: "The M row" },
  { description: "The Y row has three modern basic forms: ヤ, ユ, and ヨ.", id: "katakana-y-row", title: "The Y row" },
  { description: "The R row uses the same quick tongue tap as its Hiragana matches.", id: "katakana-r-row", title: "The R row" },
  { description: "The W row keeps ワ and ヲ; ヲ is uncommon outside specific spelling contexts.", id: "katakana-w-row", title: "The W row" },
] as const;

const KATAKANA_STUDY_GROUPS = [
  ...KATAKANA_GROUP_DEFINITIONS.map((group, index) => ({
    ...group,
    entries: KATAKANA_ROWS[index].filter(isKanaEntry),
  })),
  {
    description: "ン is the only basic Katakana without a following vowel and takes its own beat.",
    entries: [FINAL_KATAKANA],
    id: "katakana-final-n",
    title: "ン",
  },
];

type KatakanaTest = {
  cards: KanaEntry[];
  title: string;
};

const ALL_KATAKANA_TEST_ENTRIES = KATAKANA_STUDY_GROUPS.flatMap((group) => group.entries);
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
  const [expandedGroups, setExpandedGroups] = useState<Set<string>>(() => new Set());
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
    setAudioPlaying(false);
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
        aria-label={`Study ${kana.katakana}, matching Hiragana ${kana.hiragana}${isKnown ? ", marked known" : ""}`}
        className={`katakana-button${isKnown ? " katakana-button-known" : ""}`}
        data-known={isKnown ? "true" : undefined}
        onClick={() => openTest("Katakana", [kana])}
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

  function renderStudyKatakana(entry: KanaEntry) {
    const isKnown = knownKatakana.has(entry.katakana);
    return (
      <button
        aria-label={`Study ${entry.katakana}${isKnown ? ", marked known" : ""}`}
        className={`kana-study-button kana-study-kana-button${isKnown ? " kana-study-button-known" : ""}`}
        data-known={isKnown ? "true" : undefined}
        onClick={() => openTest("Katakana", [entry])}
        type="button"
      >
        <span lang="ja">{entry.katakana}</span>
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

  function revealPronunciation() {
    if (!activeCard) return;
    setPronunciationRevealed(true);
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

  function toggleStudyGroup(groupId: string) {
    setExpandedGroups((current) => {
      const next = new Set(current);
      if (next.has(groupId)) next.delete(groupId);
      else next.add(groupId);
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
              Writing
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
          onPause={() => setAudioPlaying(false)}
          onPlaying={() => setAudioPlaying(true)}
          preload="none"
          ref={audioRef}
        />
        <div className="station-intro katakana-intro">
          <p><strong>Katakana is the second Kana system.</strong> It represents the same sounds as Hiragana, so <span lang="ja">あ</span> and <span lang="ja">ア</span> are different shapes for the same sound.</p>
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
        {knowledgeError ? <p className="station-knowledge-error" role="alert">Your Katakana progress could not sync. Try again.</p> : null}

        <div className="station-notes">
          <p><strong>Same sounds, different shapes.</strong> The rows follow the same five-vowel order as Hiragana.</p>
          <p><strong>Why do they look different?</strong> Hiragana developed from flowing, cursive forms of Chinese characters. Katakana developed from selected pieces of those characters. That history is why Hiragana looks rounded while Katakana looks more angular.</p>
          <p><strong>This is the base chart.</strong> Sound marks and small Katakana extend these forms later.</p>
        </div>

        <section aria-labelledby="katakana-groups-title" className="hiragana-groups">
          <header className="hiragana-groups-heading">
            <h2 id="katakana-groups-title">Connect the shapes</h2>
            <p>Work through one row at a time. Tap a Katakana to hear it, then use its familiar Hiragana match to anchor the new shape.</p>
          </header>

          {KATAKANA_STUDY_GROUPS.map((group) => {
            const expanded = expandedGroups.has(group.id);
            return (
              <section aria-labelledby={`${group.id}-title`} className="hiragana-study-group" key={group.id}>
                <div className="hiragana-study-group-heading">
                  <h3 id={`${group.id}-title`}>
                    <button
                      aria-controls={`${group.id}-content`}
                      aria-expanded={expanded}
                      className="hiragana-study-group-toggle"
                      onClick={() => toggleStudyGroup(group.id)}
                      type="button"
                    >
                      <span>{group.title}</span>
                      <svg aria-hidden="true" className="hiragana-study-group-chevron" viewBox="0 0 16 16">
                        <path d="m3 6 5 5 5-5" />
                      </svg>
                    </button>
                  </h3>
                  {renderTestButton(group.title, group.entries)}
                </div>
                <div className="hiragana-study-group-content" hidden={!expanded} id={`${group.id}-content`}>
                  <p>{group.description}</p>
                  <table aria-label={group.title} className="kana-study-table katakana-study-table">
                    <colgroup>
                      <col />
                      <col />
                      <col />
                    </colgroup>
                    <thead>
                      <tr>
                        <th scope="col">Katakana</th>
                        <th scope="col">Hiragana</th>
                        <th scope="col">Sound</th>
                      </tr>
                    </thead>
                    <tbody>
                      {group.entries.map((entry) => (
                        <tr key={entry.katakana}>
                          <td>{renderStudyKatakana(entry)}</td>
                          <td className="katakana-study-match" lang="ja">{entry.hiragana}</td>
                          <td className="kana-study-cue">{entry.sound}</td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              </section>
            );
          })}
        </section>

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

              <button
                aria-label={`Play ${activeCard.katakana} and reveal its pronunciation`}
                className="hiragana-test-card"
                data-playing={audioPlaying ? "true" : undefined}
                onClick={revealPronunciation}
                type="button"
              >
                <span aria-hidden="true" className="hiragana-test-playing-indicator">
                  <span />
                  <span />
                  <span />
                </span>
                <span className="hiragana-test-card-kana" lang="ja">{activeCard.katakana}</span>
                <span aria-hidden="true" className="hiragana-test-pronunciation">
                  {pronunciationRevealed ? activeCard.sound : "\u00a0"}
                </span>
              </button>
              <span aria-live="polite" className="sr-only">
                {pronunciationRevealed ? activeCard.sound : ""}
              </span>
              <p className="hiragana-test-instruction">Say the sound, then tap the Katakana to hear it and reveal the pronunciation.</p>

              <div className="hiragana-test-actions">
                <button className="hiragana-test-answer hiragana-test-answer-no" onClick={() => answerCard(false)} type="button">
                  <svg aria-hidden="true" className="hiragana-test-answer-icon" viewBox="0 0 16 16">
                    <path d="m4 4 8 8M12 4l-8 8" />
                  </svg>
                  <span>No</span>
                </button>
                <button className="hiragana-test-answer hiragana-test-answer-yes" onClick={() => answerCard(true)} type="button">
                  <svg aria-hidden="true" className="hiragana-test-answer-icon" viewBox="0 0 16 16">
                    <path d="m3 8.5 3 3 7-7" />
                  </svg>
                  <span>Yes</span>
                </button>
              </div>
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
