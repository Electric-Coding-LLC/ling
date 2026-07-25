"use client";

import type { ReactElement } from "react";
import {
  getJapaneseMoraSoundCueSeparator,
  getJapaneseMoraSoundCues,
  splitJapaneseMorae,
} from "@/src/modules/learning/japanese-sound-cues";
import { useFlashcardAudio } from "./use-flashcard-audio";

type TravelReferenceItem = {
  readonly audio: string;
  readonly japanese: string;
  readonly meaning: string;
  readonly note?: string;
  readonly reading?: string;
  readonly soundCues?: readonly string[];
};

export function TravelStation({
  intro,
  items = [],
  showPronunciation = false,
  title,
}: {
  intro: readonly (string | ReactElement)[];
  items?: readonly TravelReferenceItem[];
  showPronunciation?: boolean;
  title: string;
}) {
  const {
    activeAudioIndex,
    activeBeatIndex,
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
        {intro.map((content) => {
          if (typeof content === "string") {
            return <p key={content}>{content}</p>;
          }
          return content;
        })}
      </div>

      {items.length > 0 ? (
        <section aria-label={`${title} Japanese reference`} className="travel-reference">
          <div className="travel-reference-list">
            {items.map((item, index) => {
              const playing = audioPlaying && activeAudioIndex === index;
              const reading = item.reading ?? item.japanese;
              const morae = showPronunciation ? splitJapaneseMorae(reading) : [];
              const soundCues = showPronunciation
                ? item.soundCues ?? getJapaneseMoraSoundCues(reading)
                : [];
              if (soundCues.length !== morae.length) {
                throw new Error(`Sound cues do not align with ${item.japanese}`);
              }
              const pronunciation = showPronunciation
                ? soundCues.map((soundCue, beatIndex) => (
                    `${beatIndex > 0
                      ? getJapaneseMoraSoundCueSeparator(morae, beatIndex)
                      : ""}${soundCue}`
                  )).join("")
                : null;
              const pronunciationBeats = soundCues.map((soundCue, beatIndex) => (
                <span
                  className="travel-reference-pronunciation-beat"
                  data-active={playing && activeBeatIndex === beatIndex
                    ? "true"
                    : undefined}
                  key={`${item.japanese}-sound-${beatIndex}`}
                >
                  {soundCue}
                </span>
              ));
              return (
                <button
                  aria-label={pronunciation
                    ? `${item.japanese}: ${item.meaning}. Pronunciation: ${pronunciation}. Play audio`
                    : `${item.japanese}: ${item.meaning}. Play audio`}
                  className="travel-reference-item"
                  data-playing={playing}
                  data-pronunciation={showPronunciation ? "true" : undefined}
                  key={item.japanese}
                  onClick={() => playAudio({
                    beatCount: showPronunciation ? morae.length : undefined,
                    index,
                    src: item.audio,
                  })}
                  type="button"
                >
                  {showPronunciation ? (
                    <span className="travel-reference-meaning">{item.meaning}</span>
                  ) : null}
                  <span className="travel-reference-japanese" lang="ja">
                    {showPronunciation
                      ? morae.map((mora, beatIndex) => (
                          <span
                            className="travel-reference-japanese-beat"
                            data-active={playing && activeBeatIndex === beatIndex
                              ? "true"
                              : undefined}
                            key={`${item.japanese}-mora-${beatIndex}`}
                          >
                            {mora}
                          </span>
                        ))
                      : item.japanese}
                  </span>
                  {showPronunciation ? (
                    <span
                      aria-label={pronunciation ?? undefined}
                      className="travel-reference-pronunciation"
                    >
                      {pronunciationBeats.length > 1 ? (
                        <>
                          {pronunciationBeats.slice(0, -2)}
                          <span className="travel-reference-pronunciation-tail">
                            {pronunciationBeats.slice(-2)}
                          </span>
                        </>
                      ) : pronunciationBeats}
                    </span>
                  ) : null}
                  {!showPronunciation ? (
                    <span className="travel-reference-meaning">{item.meaning}</span>
                  ) : null}
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
      ) : null}

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
