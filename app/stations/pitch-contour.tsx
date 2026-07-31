import type { CSSProperties } from "react";
import type { PitchLevel } from "@/src/modules/learning/pitch-accent";
import { getJapaneseWordRomaji } from "@/src/modules/romaji";

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

  const romaji = getJapaneseWordRomaji(word);
  const moraCharacterWidths = morae.map((mora) => Array.from(mora).length);
  const characterCount = moraCharacterWidths.reduce((total, count) => total + count, 0);
  const pointXs = moraCharacterWidths.map((characterWidth, index) => (
    moraCharacterWidths
      .slice(0, index)
      .reduce((offset, precedingWidth) => offset + precedingWidth, 0)
      + characterWidth / 2
  ) * 48);
  const width = characterCount * 48;
  const points = pitch
    .map((level, index) => `${pointXs[index]},${level === "high" ? 14 : 42}`)
    .join(" ");

  return (
    <span
      aria-label={`${word}: Rōmaji ${romaji}; ${morae.length} ${morae.length === 1 ? "beat" : "beats"}; ${pitchLabel(pitch)}`}
      className="pitch-contour"
      data-pronunciation={showPronunciation ? "true" : undefined}
      role="img"
      style={{ "--pitch-character-count": characterCount } as CSSProperties}
    >
      <svg
        aria-hidden="true"
        className="pitch-contour-line"
        height={56}
        viewBox={`0 0 ${width} 56`}
        width={width}
      >
        <polyline points={points} />
        {pitch.map((level, index) => (
          <circle
            className="pitch-contour-point"
            cx={pointXs[index]}
            cy={level === "high" ? 14 : 42}
            data-active={activeMoraIndex === index ? "true" : undefined}
            key={`${word}-${index}-${level}`}
            r="4"
          />
        ))}
      </svg>
      <span aria-hidden="true" className="pitch-contour-word">
        {morae.map((mora, index) => (
          <span
            data-active={activeMoraIndex === index ? "true" : undefined}
            key={`${word}-${index}`}
            lang="ja"
            style={{ "--pitch-mora-character-count": moraCharacterWidths[index] } as CSSProperties}
          >
            {mora}
          </span>
        ))}
      </span>
      {showPronunciation ? (
        <span aria-hidden="true" className="pitch-contour-romaji">{romaji}</span>
      ) : null}
    </span>
  );
}

export function pitchLabel(pitch: readonly PitchLevel[]) {
  return `${pitch.join(", ")} pitch`;
}
