# Validate and freeze the pitch-accent content and audio contract.

[Back to Execution Map](./EXECMAP.md)

## Goal

Freeze a trustworthy, bounded set of pitch contours, teaching examples, review prompts, and audio assets before storage or UI implementation begins.

## Tasks

- Scope the station explicitly to standard Tokyo Japanese word pitch and explain that scope without implying one universal Japanese accent.
- Select 8–12 common, beginner-appropriate words written only with Kana and spanning two to four morae, with enough clear contour variation to teach perception without introducing sentence prosody.
- Record a stable review ID, Kana spelling, mora segmentation, concise meaning, high/low contour, authoritative contour reference, audio path, audio provenance, and validation note for every item.
- Use the University of Tokyo’s [OJAD](https://gavo.t.u-tokyo.ac.jp/ojad/eng/pages/home) or an equivalently authoritative source to verify the intended Tokyo contour; do not copy or redistribute reference audio without confirmed permission.
- Produce or acquire bundled audio whose audible contour matches the recorded reference, then verify each asset perceptually and with an inspectable pitch trace rather than trusting TTS output metadata.
- Define the teaching representation as a contour aligned directly to mora cells, with an accessible text equivalent that communicates the same high/low sequence.
- Freeze the review contract: audio is the initial cue; reveal exposes Kana, mora-aligned contour, and meaning; answers remain `Good` and `Not Yet`; replay stays available without adding visible instructions or grading.

## Constraints

- Do not use romaji, numeric accent labels, stress-style typography, a complete accent taxonomy, or unexplained linguistic notation.
- Do not introduce particles or sentence context merely to force distinctions that are outside this first station’s word-level scope.
- Do not add generated fallback audio, browser speech synthesis, a microphone, recording, automated pronunciation judgment, or speech scoring.
- Do not bundle third-party audio or derived datasets unless their terms explicitly allow the repository and deployment use.
- If a proposed word has disputed, variable, unclear, or inaudible pitch in the available evidence, replace it instead of adding qualifications to the lesson.
- Keep content data local and typed; do not create a CMS, generic deck model, or remote runtime dependency.

## Exit Criteria

- One reviewed content table contains all required fields for 8–12 teaching/review items with no unresolved contour, provenance, or licensing question.
- Every audio asset has an inspectable pitch trace and a recorded human perceptual check against the intended contour.
- The mora-aligned visual and accessible representations convey equivalent information without romaji or numeric notation.
- The listening-first reveal and answer behavior is precise enough to implement with the shared flashcard review.
- If trustworthy audio cannot be established, the initiative is explicitly blocked at this step before schema, network, or UI work begins.
