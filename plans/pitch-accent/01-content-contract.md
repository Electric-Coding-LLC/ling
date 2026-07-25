# Validate and freeze the pitch-accent content and machine-verified audio contract; reserve the human listening pass for final browser verification.

[Back to Execution Map](./EXECMAP.md)

## Goal

Freeze a trustworthy, bounded set of pitch contours, teaching examples, review prompts, and audio assets before storage or UI implementation begins.

## Tasks

- Scope the station explicitly to standard Tokyo Japanese word pitch and explain that scope without implying one universal Japanese accent.
- Select 8–12 common, beginner-appropriate words written only with Kana and spanning two to four morae, with enough clear contour variation to teach perception without introducing sentence prosody.
- Record a stable review ID, Kana spelling, mora segmentation, concise meaning, high/low contour, authoritative contour reference, audio path, audio provenance, and validation note for every item.
- Use the University of Tokyo’s [OJAD](https://gavo.t.u-tokyo.ac.jp/ojad/eng/pages/home) or an equivalently authoritative source to verify the intended Tokyo contour; do not copy or redistribute reference audio without confirmed permission.
- Produce or acquire bundled audio whose audible contour matches the recorded reference, verify each asset with an inspectable pitch trace rather than trusting TTS output metadata, and queue one human listening pass for the final browser-verification step.
- Define the teaching representation as a contour aligned directly to mora cells, with an accessible text equivalent that communicates the same high/low sequence.
- Freeze the review contract: audio is the initial cue; a quiet delay precedes the reveal of Kana, mora-aligned contour, and meaning; answers remain `Good` and `Not Yet`; replay stays available without adding visible instructions, a timer, or grading.

## Constraints

- Do not use romaji, numeric accent labels, stress-style typography, a complete accent taxonomy, or unexplained linguistic notation.
- Do not introduce particles or sentence context merely to force distinctions that are outside this first station’s word-level scope.
- Do not add generated fallback audio, browser speech synthesis, a microphone, recording, automated pronunciation judgment, or speech scoring.
- Do not bundle third-party audio or derived datasets unless their terms explicitly allow the repository and deployment use.
- If a proposed word has disputed, variable, unclear, or inaudible pitch in the available evidence, replace it instead of adding qualifications to the lesson.
- Keep content data local and typed; do not create a CMS, generic deck model, or remote runtime dependency.

## Exit Criteria

- One reviewed content table contains all required fields for 8–12 teaching/review items with no unresolved contour, provenance, or licensing question.
- Every audio asset has an inspectable pitch trace against the intended contour and is included in the required final human listening pass.
- The mora-aligned visual and accessible representations convey equivalent information without romaji or numeric notation.
- The listening-first reveal and answer behavior is precise enough to implement with the shared flashcard review.
- If trustworthy audio cannot be established, the initiative is explicitly blocked at this step before schema, network, or UI work begins.

## Frozen content

Scope: standard Tokyo Japanese word pitch in isolation. OJAD’s checked word-search database is the contour authority; OJAD recordings are reference-only and are not included in Ling.

| Review ID | Kana | Morae | Meaning | Low/high contour | OJAD entry | Bundled audio |
| --- | --- | --- | --- | --- | --- | --- |
| `ame-candy` | あめ | あ・め | candy | low, high | 飴 | `/audio/ja-pitch-ame-candy.wav` |
| `sakana` | さかな | さ・か・な | fish | low, high, high | 魚 | `/audio/ja-pitch-sakana.wav` |
| `nihongo` | にほんご | に・ほ・ん・ご | Japanese | low, high, high, high | 日本語 | `/audio/ja-pitch-nihongo.wav` |
| `ame-rain` | あめ | あ・め | rain | high, low | 雨 | `/audio/ja-pitch-ame-rain.wav` |
| `neko` | ねこ | ね・こ | cat | high, low | 猫 | `/audio/ja-pitch-neko.wav` |
| `kumo` | くも | く・も | cloud | high, low | 雲 | `/audio/ja-pitch-kumo.wav` |
| `tamago` | たまご | た・ま・ご | egg | low, high, low | 卵 | `/audio/ja-pitch-tamago.wav` |
| `onigiri` | おにぎり | お・に・ぎ・り | rice ball | low, high, low, low | おにぎり | `/audio/ja-pitch-onigiri.wav` |
| `kudamono` | くだもの | く・だ・も・の | fruit | low, high, low, low | 果物 | `/audio/ja-pitch-kudamono.wav` |
| `nomimono` | のみもの | の・み・も・の | drink | low, high, low, low | 飲み物 | `/audio/ja-pitch-nomimono.wav` |

## Provenance and validation

- Contours were checked against the University of Tokyo [OJAD word search](https://www.gavo.t.u-tokyo.ac.jp/ojad/search) with accent variation hidden and the pitch curve visible. The checked database, not the predicted text-search output, is the reference.
- Audio was authored locally with the macOS Kyoko Japanese system voice at 175 words per minute, then converted to mono 22.05 kHz 16-bit PCM WAV. Semantic spellings such as `飴` and `雨` were supplied to distinguish homophones. No OJAD audio or third-party recording is bundled.
- `npm run audio:verify:pitch` checks every asset’s PCM contract, duration, readable F0 trace, and expected broad rise/fall location. Its mora-level frequency report is the inspectable acoustic trace.
- The acoustic check is reproducible, but this environment cannot honestly claim a human listening judgment. Final browser verification must play every asset; the learner’s first listening pass remains the explicit human perceptual check before the initiative is closed.

## Representation contract

- Each mora owns one equal-width cell and one `low` or `high` value.
- The visible contour connects centered mora points and places the Kana directly below those points.
- Accessible text names the word and spells the contour with plain words, for example “low, high, low.” Numeric accent labels and romaji remain absent.
- Isolated flat words can end with ordinary phrase-final lowering in the recording; the authored low/high cells represent the checked lexical contour, not a literal frame-by-frame transcription.

## Review contract

- Opening or advancing a card immediately plays the word while the written answer remains hidden for four seconds without showing a timer.
- When the listening window ends, reveal shows Kana, meaning, and the same mora-aligned contour used in teaching examples.
- Replay remains available before and after reveal.
- Answers are the shared `Not Yet` and `Good` actions; there is no pronunciation grading, score, or extra instruction.
