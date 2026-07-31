import type { CSSProperties } from "react";
import type { PitchLevel } from "@/src/modules/learning/pitch-accent";
import {
  getJapaneseMoraRomaji,
  getJapaneseWordRomaji,
} from "@/src/modules/romaji";

export function PitchContour({
  activeMoraIndex,
  morae,
  pitch,
  showPronunciation = false,
  word,
}: {
  readonly activeMoraIndex: number | null;
  readonly morae: readonly string[];
  readonly pitch: readonly PitchLevel[];
  readonly showPronunciation?: boolean;
  readonly word: string;
}) {
  if (pitch.length !== morae.length) {
    throw new Error(`Pitch does not align with the morae in ${word}`);
  }

  const romajiMorae = showPronunciation
    ? getJapaneseMoraRomaji(word)
    : [];
  const width = morae.length * 48;
  const points = pitch
    .map((level, index) => `${24 + index * 48},${level === "high" ? 14 : 42}`)
    .join(" ");

  return (
    <span
      aria-label={`${word}: Rōmaji ${getJapaneseWordRomaji(word)}; ${morae.length} ${morae.length === 1 ? "beat" : "beats"}; ${pitchLabel(pitch)}`}
      className="pitch-contour"
      data-pronunciation={showPronunciation ? "true" : undefined}
      role="img"
      style={{ "--pitch-mora-count": morae.length } as CSSProperties}
    >
      <svg aria-hidden="true" className="pitch-contour-line" viewBox={`0 0 ${width} 56`}>
        <polyline points={points} />
        {pitch.map((level, index) => (
          <circle
            className="pitch-contour-point"
            cx={24 + index * 48}
            cy={level === "high" ? 14 : 42}
            data-active={activeMoraIndex === index ? "true" : undefined}
            key={`${word}-${index}-${level}`}
            r="4"
          />
        ))}
      </svg>
      <span aria-hidden="true" className="pitch-contour-morae">
        {morae.map((mora, index) => (
          <span
            data-active={activeMoraIndex === index ? "true" : undefined}
            key={`${word}-${index}`}
            lang="ja"
          >
            {mora}
          </span>
        ))}
      </span>
      {showPronunciation ? (
        <>
          <span aria-hidden="true" className="pitch-contour-romaji">
            {romajiMorae.map((romaji, index) => (
              <span
                data-active={activeMoraIndex === index ? "true" : undefined}
                key={`${word}-romaji-${index}`}
              >
                {romaji}
              </span>
            ))}
          </span>
          <span aria-hidden="true" className="pitch-contour-beat-count">
            {morae.length} {morae.length === 1 ? "beat" : "beats"}
          </span>
        </>
      ) : null}
    </span>
  );
}

export function pitchLabel(pitch: readonly PitchLevel[]) {
  return `${pitch.join(", ")} pitch`;
}
