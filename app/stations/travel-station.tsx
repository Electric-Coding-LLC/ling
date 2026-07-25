"use client";

import { useFlashcardAudio } from "./use-flashcard-audio";

type TravelReferenceItem = {
  readonly audio: string;
  readonly japanese: string;
  readonly meaning: string;
  readonly note?: string;
};

export function TravelStation({
  intro,
  items,
  title,
}: {
  intro: readonly string[];
  items: readonly TravelReferenceItem[];
  title: string;
}) {
  const {
    activeAudioIndex,
    audioError,
    audioPlaying,
    audioRef,
    handleAudioEnded,
    handleAudioError,
    playAudio,
  } = useFlashcardAudio();

  return (
    <section className="travel-guide">
      <header className="station-heading">
        <div className="station-memberships">
          <span className="station-membership station-membership-travel">
            Travel
          </span>
        </div>
        <h1>{title}</h1>
      </header>

      <div className="station-intro travel-intro">
        {intro.map((paragraph) => <p key={paragraph}>{paragraph}</p>)}
      </div>

      <section aria-label={`${title} Japanese reference`} className="travel-reference">
        <div className="travel-reference-list">
          {items.map((item, index) => {
            const playing = audioPlaying && activeAudioIndex === index;
            return (
              <button
                aria-label={`${item.japanese}: ${item.meaning}. Play audio`}
                className="travel-reference-item"
                data-playing={playing}
                key={item.japanese}
                onClick={() => playAudio({ index, src: item.audio })}
                type="button"
              >
                <span className="travel-reference-japanese" lang="ja">
                  {item.japanese}
                </span>
                <span className="travel-reference-meaning">{item.meaning}</span>
                {item.note ? (
                  <span className="travel-reference-note">{item.note}</span>
                ) : null}
                <span aria-hidden="true" className="travel-audio-indicator">
                  <span />
                  <span />
                  <span />
                </span>
              </button>
            );
          })}
        </div>
      </section>

      {audioError ? (
        <p className="station-audio-error" role="alert">
          Audio couldn&apos;t play. Try again.
        </p>
      ) : null}
      <audio
        onEnded={handleAudioEnded}
        onError={handleAudioError}
        preload="none"
        ref={audioRef}
      />
    </section>
  );
}
