# Kanji Track

## Goal

Turn Kanji from a four-example orientation into a continuing Kanji line that teaches learners to decode Kanji inside words they already encounter in Ling.

## Guardrails

- Keep every mapped station directly accessible; the footer order is guidance, not gating.
- Reuse the canonical Vocabulary word, reading, meaning, pitch, and audio records instead of copying content.
- Track written-word recognition separately from Vocabulary meaning recall; knowing one skill must not complete the other.
- Teach Kanji as words: no isolated on/kun lists, character-frequency dump, radical inventory, handwriting system, or claim that a character is universally mastered.
- Keep the first tranche bounded to `Kanji`, `Compounds`, and `Endings`; add later reading-pattern or applied-reading stations only when the vocabulary corpus supports them.
- Split the overloaded Writing geography into visually distinct `Kana` and `Kanji` Foundation lines; Kana retains the established gold and Kanji receives its own burnt orange.
- Preserve the Kana branch's convergence, direct navigation, accessibility, quiet completion semantics, and responsive behavior.
- Do not commit, push, publish, or deploy without separate authorization.

## Execution Map

- [x] Define the three-station word sets, learning directions, explanations, optional footer order, and [curriculum contract](./01-curriculum-contract.md).
- [x] Add a focused Kanji curriculum module and separate, station-scoped persistence/API contract without duplicating Vocabulary content.
- [x] Replace the orientation-only Kanji page with a shared reference-and-review surface for Kanji, Compounds, and Endings.
- [x] Replace the overloaded Writing line with separate Kana and Kanji Foundation lines and update keyboard navigation, completion state, legacy focus handling, footers, introductions, and vision documentation.
- [x] Add focused curriculum, persistence, topology, rendering, accessibility, and migration regression coverage.
- [x] Run the full repository gate, inspect the final diff, and verify all three routes and the map at mobile and desktop sizes.

Step document: [Kanji Track Curriculum Contract](./01-curriculum-contract.md)

## Done When

- The Foundations spine presents distinct gold Kana and orange Kanji lines; Kana preserves its established convergence while Kanji continues through Compounds and Endings.
- Each Kanji-track station teaches a coherent written-word pattern using known Vocabulary records and bundled audio.
- Learners can review writing-to-reading and reading-to-writing, with private progress and station completion that do not alter Vocabulary progress.
- Each new station is directly accessible, keyboard reachable, responsive, and connected by a coherent optional next-station footer.
- `npm run check`, `execmap check .`, `git diff --check`, migration checks, and rendered route/map inspection pass.
