"use client";

import { useCallback, useEffect, useRef, useState } from "react";

type FlashcardAudioSource = {
  readonly beatCount?: number;
  readonly index: number;
  readonly src: string;
};

export function useFlashcardAudio() {
  const activeSourceRef = useRef<FlashcardAudioSource | null>(null);
  const animationFrameRef = useRef<number | null>(null);
  const audioRef = useRef<HTMLAudioElement | null>(null);
  const [activeAudioIndex, setActiveAudioIndex] = useState<number | null>(null);
  const [activeBeatIndex, setActiveBeatIndex] = useState<number | null>(null);
  const [audioError, setAudioError] = useState(false);
  const [audioPlaying, setAudioPlaying] = useState(false);

  const cancelBeatAnimation = useCallback(() => {
    if (animationFrameRef.current === null) return;
    window.cancelAnimationFrame(animationFrameRef.current);
    animationFrameRef.current = null;
  }, []);

  const clearPlaybackFeedback = useCallback(() => {
    cancelBeatAnimation();
    activeSourceRef.current = null;
    setActiveAudioIndex(null);
    setActiveBeatIndex(null);
    setAudioPlaying(false);
  }, [cancelBeatAnimation]);

  const failPlayback = useCallback(() => {
    setAudioError(true);
    clearPlaybackFeedback();
  }, [clearPlaybackFeedback]);

  const startBeatAnimation = useCallback((source: FlashcardAudioSource) => {
    cancelBeatAnimation();
    const beatCount = source.beatCount ?? 1;
    if (beatCount <= 1) return;

    function updateActiveBeat() {
      const audio = audioRef.current;
      if (!audio || activeSourceRef.current !== source || audio.paused || audio.ended) return;

      if (Number.isFinite(audio.duration) && audio.duration > 0) {
        const progress = Math.min(audio.currentTime / audio.duration, 0.999999);
        const nextBeat = Math.floor(progress * beatCount);
        setActiveBeatIndex((current) => current === nextBeat ? current : nextBeat);
      }
      animationFrameRef.current = window.requestAnimationFrame(updateActiveBeat);
    }

    updateActiveBeat();
  }, [cancelBeatAnimation]);

  const playAudio = useCallback((source: FlashcardAudioSource) => {
    const audio = audioRef.current;
    if (!audio) {
      failPlayback();
      return;
    }

    cancelBeatAnimation();
    audio.pause();
    audio.src = source.src;
    audio.currentTime = 0;
    activeSourceRef.current = source;
    setAudioError(false);
    setActiveAudioIndex(source.index);
    setActiveBeatIndex(source.beatCount === undefined ? null : 0);
    setAudioPlaying(true);
    void audio.play()
      .then(() => startBeatAnimation(source))
      .catch(failPlayback);
  }, [cancelBeatAnimation, failPlayback, startBeatAnimation]);

  const stopAudio = useCallback(() => {
    const audio = audioRef.current;
    if (audio) {
      audio.pause();
      audio.currentTime = 0;
    }
    clearPlaybackFeedback();
  }, [clearPlaybackFeedback]);

  useEffect(() => stopAudio, [stopAudio]);

  return {
    activeAudioIndex,
    activeBeatIndex,
    audioError,
    audioPlaying,
    audioRef,
    handleAudioEnded: clearPlaybackFeedback,
    handleAudioError: failPlayback,
    playAudio,
    stopAudio,
  };
}
