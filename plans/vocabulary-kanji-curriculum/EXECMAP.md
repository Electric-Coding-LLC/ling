# Vocabulary and Kanji Curriculum

## Goal

Replace the catch-all Words station with a useful ordered vocabulary curriculum and introduce Kanji at the point where Hiragana and meaningful words can support it.

## Guardrails

- Keep every mapped station directly accessible; the order is guidance, not gating.
- Use one-word station names where they remain natural: Pointing, People, Needs, Movement, Time, Actions, and Descriptions.
- Preserve the existing 15 vocabulary item IDs and both-direction knowledge records as those words move into focused stations.
- Teach Kanji through known words and Kana readings; do not create an isolated character dump or require completed Katakana.
- Keep station geometry, interactions, audio, review, accessibility, and quiet progress semantics consistent with the existing network.
- Add no generic course engine, scheduling system, score, streak, or speculative vocabulary stations.
- Do not commit, push, publish, or deploy without separate authorization.

## Execution Map

- [x] Define the seven-station word curriculum, Kanji scope, canonical Japanese forms, readings, meanings, pitch data, and [compatibility contract](./01-curriculum-contract.md).
- [x] Generalize vocabulary data, APIs, review state, and audio verification for multiple bounded stations while preserving existing knowledge.
- [x] Build the seven vocabulary station interiors and generate or reuse verified bundled audio.
- [x] Build the Kanji orientation station and connect it to Writing and the first Kanji-bearing vocabulary station.
- [x] Update network geometry, keyboard navigation, next-station routing, introductions, vision documentation, and compatibility redirects.
- [x] Add focused content, persistence, topology, rendering, accessibility, and audio regression coverage.
- [x] Run the complete repository gate, inspect the final diff, and verify the affected routes at mobile and desktop sizes.

## Done When

- The Vocabulary line presents Pointing, People, Needs, Movement, Time, Actions, and Descriptions in a sensible optional order.
- Existing vocabulary mastery remains attached to the same item IDs and review directions.
- Kanji is introduced after basic Hiragana and then appears contextually in vocabulary words with readable Kana support.
- Every new station has accurate content, bundled audio where applicable, direct access, the shared review behavior, and a coherent next-station footer.
- The map and documentation represent the new topology without suggesting locked progression.
- `npm run check`, focused content/audio checks, `execmap check .`, `git diff --check`, and rendered route inspection pass.
