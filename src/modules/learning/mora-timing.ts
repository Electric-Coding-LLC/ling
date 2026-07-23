export const MORA_TIMING_REVIEW_IDS = [
  "basic-neko",
  "basic-sakana",
  "nasal-pan",
  "nasal-pyon",
  "yoon-shashin",
  "yoon-ryokou",
  "small-tsu-zakku",
  "small-tsu-shop",
  "long-mark-soup",
  "long-mark-guitar",
] as const;

export type MoraTimingReviewId = (typeof MORA_TIMING_REVIEW_IDS)[number];

const MORA_TIMING_REVIEW_ID_SET = new Set<string>(MORA_TIMING_REVIEW_IDS);

export function isMoraTimingReviewId(
  value: unknown,
): value is MoraTimingReviewId {
  return typeof value === "string" && MORA_TIMING_REVIEW_ID_SET.has(value);
}
