# First Usable Vowels

## Goal

Ship the first usable Ling slice: a responsive mastery-network home and a minimal station covering the five basic Japanese vowels.

## Guardrails

- Preserve the approved dark Ling brand and transit-map visual grammar on desktop and mobile.
- Keep `/` as the browsable network and `/stations/vowels` as the station interior.
- Make Vowels the only station with a lesson; Mora timing and Hiragana establish stable geography without invented learning material.
- Use one direct study surface with replayable synthesized Japanese audio without presenting it as human-reviewed.
- Use no romaji, scoring, progress state, persistence, speech evaluation, gamification, generic graph engine, or content-management layer.
- Keep the slice inside the existing app shell and add no dependencies or database changes.

## Execution Map

- [x] Establish focused rendered-route tests for the network geography, navigation, and Vowels learning contract.
- [x] Build the responsive network home with Sound, Script, Vowels, Mora timing, and Hiragana.
- [x] Build the minimal Vowels station as one compact Kana, English, Example, and Translation table for あ, い, う, え, and お.
- [x] Add and verify bundled synthesized pronunciation assets for each isolated vowel and example word without a distracting provenance disclaimer.
- [x] Run the full repository gate, inspect the final diff, and verify `/` and `/stations/vowels` at mobile and desktop widths.

## Done When

- `/` renders the Ling network with Vowels and Mora timing balanced on desktop.
- Mobile centers Vowels and bisects both the Mora timing marker and label at the right edge.
- The Script line branches from Vowels, stops at Hiragana, and adds no speculative geography.
- Vowels opens `/stations/vowels`; the station's Network link returns with Vowels focused.
- The Ling navbar remains present inside stations.
- あ, い, う, え, and お appear in order as rows in one compact table, without local navigation.
- Every vowel has the same compact treatment: a clickable kana for isolated playback, its English vowel, one playable example word, and that word's translation without a reveal flow or staged completion gates.
- Pronunciation is replayable from bundled synthesized assets at their authored speed, and the UI makes no human-review claim.
- The routes are keyboard accessible, responsive, server-rendered where practical, and covered by focused tests.
- `npm run check` passes and both affected routes are visually verified locally.
