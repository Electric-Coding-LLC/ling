"use client";

import Link from "next/link";
import { useRef, useState } from "react";

const AUDIO_SOURCE = "/audio/ja-a.wav";
const LAST_STAGE = 4;

function EarIcon() {
  return (
    <svg aria-hidden="true" className="guide-button-icon" data-icon="ear" viewBox="0 0 24 24">
      <path d="M6 10a6 6 0 0 1 12 0c0 3.5-2 4.3-3.4 5.7-.8.8-.6 2.3-1.6 3.3a3 3 0 0 1-5-2.2" />
      <path d="M9 10a3 3 0 0 1 6 0c0 2-2.5 2.5-3 4" />
    </svg>
  );
}

function EyeIcon() {
  return (
    <svg aria-hidden="true" className="guide-button-icon" data-icon="eye" viewBox="0 0 24 24">
      <path d="M2.5 12s3.5-6 9.5-6 9.5 6 9.5 6-3.5 6-9.5 6-9.5-6-9.5-6Z" />
      <circle cx="12" cy="12" r="2.5" />
    </svg>
  );
}

function ActionButton({
  children,
  onClick,
  primary = false,
}: {
  children: React.ReactNode;
  onClick: () => void;
  primary?: boolean;
}) {
  return (
    <button className={primary ? "guide-button guide-button-primary" : "guide-button"} onClick={onClick} type="button">
      {children}
    </button>
  );
}

export function VowelsGuide() {
  const audioRef = useRef<HTMLAudioElement>(null);
  const [audioError, setAudioError] = useState(false);
  const [coldRevealed, setColdRevealed] = useState(false);
  const [soundRecallRevealed, setSoundRecallRevealed] = useState(false);
  const [stage, setStage] = useState(0);

  async function playAudio() {
    setAudioError(false);
    const audio = audioRef.current;
    if (!audio) {
      setAudioError(true);
      return;
    }

    try {
      audio.currentTime = 0;
      await audio.play();
    } catch {
      setAudioError(true);
    }
  }

  function next() {
    setStage((current) => Math.min(current + 1, LAST_STAGE));
  }

  function restart() {
    setColdRevealed(false);
    setSoundRecallRevealed(false);
    setStage(0);
  }

  return (
    <section className="vowels-guide" aria-label="Guided practice for あ">
      <audio onError={() => setAudioError(true)} preload="auto" ref={audioRef} src={AUDIO_SOURCE} />

      <section className="guide-step" hidden={stage !== 0}>
        <h2>Listen. Can you picture the kana?</h2>
        <div className="guide-actions">
          <ActionButton onClick={playAudio} primary>
            <EarIcon />
            Listen
          </ActionButton>
          <ActionButton onClick={() => setColdRevealed(true)}>
            <EyeIcon />
            Reveal
          </ActionButton>
        </div>
        <div aria-live="polite" className="guide-reveal" hidden={!coldRevealed}>
          <p className="kana" lang="ja">あ</p>
          <ActionButton onClick={next} primary>
            Continue
          </ActionButton>
        </div>
      </section>

      <section className="guide-step" hidden={stage !== 1}>
        <p className="guide-kicker">Meet the sound</p>
        <p className="kana" lang="ja">あ</p>
        <h2>One clear, steady vowel</h2>
        <p className="guide-copy">
          Open your mouth naturally. Keep your lips relaxed. Make one clear, steady sound without letting it glide.
        </p>
        <div className="guide-actions">
          <ActionButton onClick={playAudio}>
            <EarIcon />
            Listen again
          </ActionButton>
          <ActionButton onClick={next} primary>
            Continue
          </ActionButton>
        </div>
      </section>

      <section className="guide-step" hidden={stage !== 2}>
        <p className="guide-kicker">Production</p>
        <h2>Listen, then say it aloud</h2>
        <p className="guide-copy">Match the single steady sound. There is no recording or automated judgment.</p>
        <div className="guide-actions">
          <ActionButton onClick={playAudio}>
            <EarIcon />
            Listen
          </ActionButton>
          <ActionButton onClick={playAudio}>
            <EarIcon />
            Replay
          </ActionButton>
          <ActionButton onClick={next} primary>
            I said it
          </ActionButton>
        </div>
      </section>

      <section className="guide-step" hidden={stage !== 3}>
        <p className="guide-kicker">Sound to writing</p>
        <h2>Listen. Recall the kana before revealing it.</h2>
        <div className="guide-actions">
          <ActionButton onClick={playAudio} primary>
            <EarIcon />
            Listen
          </ActionButton>
          <ActionButton onClick={() => setSoundRecallRevealed(true)}>
            <EyeIcon />
            Reveal
          </ActionButton>
        </div>
        <div aria-live="polite" className="guide-reveal" hidden={!soundRecallRevealed}>
          <p className="kana" lang="ja">あ</p>
          <ActionButton onClick={next} primary>
            Continue
          </ActionButton>
        </div>
      </section>

      <section className="guide-step" hidden={stage !== 4}>
        <p className="guide-kicker">Writing to sound</p>
        <p className="kana" lang="ja">あ</p>
        <h2>Say the sound, then check it.</h2>
        <div className="guide-actions">
          <ActionButton onClick={playAudio} primary>
            <EarIcon />
            Check with audio
          </ActionButton>
          <ActionButton onClick={restart}>Practice again</ActionButton>
        </div>
        <Link className="guide-network-link" href="/?focus=vowels">
          Return to the network
        </Link>
      </section>

      {audioError ? (
        <p className="guide-error" role="alert">
          Audio could not play. Try again.
        </p>
      ) : null}
    </section>
  );
}
