# Pitch Accent

## Goal

Extend the Speech line with a source-verified, listening-first Pitch accent station that teaches the learner to perceive and recall standard Tokyo Japanese word-pitch contours after Mora timing.

## Guardrails

- Validate every contour and audio asset before station implementation; do not treat synthetic speech as pitch-accurate without evidence.
- Use source material as a reference only unless its license explicitly permits bundling; record provenance for the authored content and audio that ships.
- Present pitch through Japanese writing, sound, and a clear mora-level contour; use no romaji, numeric accent notation, stress marks, scores, streaks, or gamification.
- Keep the first station to word-level perception and recall. Do not expand into sentence prosody, dialect comparison, vocabulary management, speech recording, or pronunciation scoring.
- Reuse the current station, flashcard-review, identity, D1 repository, and private non-cacheable API patterns; add no dependency or generic content/deck abstraction.
- Preserve existing network geography. Reveal Pitch accent only after Mora timing is complete, and draw no speculative Speech segment beyond it.
- Preserve immediate audio feedback, accessible controls, reduced-motion behavior, keyboard navigation, and mobile touch behavior.

## Execution Map

- [x] [Validate and freeze the pitch-accent content and machine-verified audio contract; reserve the human listening pass for final browser verification.](./01-content-contract.md)
- [x] Add `pitch-accent` to the learning domain, prerequisite chain, D1 schema and generated migration, focused repository methods, introduction endpoint, and private knowledge API.
- [x] Extend the Speech-line network, route availability, stored/query focus, keyboard neighbors, mobile horizontal navigation, loading treatment, and station locator so Pitch accent appears only after Mora timing is complete.
- [x] Build `/stations/pitch-accent` with concise teaching examples, mora-aligned pitch contours, direct bundled playback, and a listening-first `Good` / `Not Yet` review using the shared flashcard interaction.
- [x] Add focused regression coverage for content validity, audio files, authentication and cache headers, persistence, prerequisite/reset behavior, route guards, network geometry/navigation, accessibility, and responsive station behavior.
- [x] Update `VISION.md` so the current network and station-interior contract include Pitch accent without promoting speculative future geography.
- [x] Generate and inspect the migration, apply it locally, run `npm run check` and `execmap check .`, review the final diff, and verify the unlock/reset path plus the station at mobile and desktop widths with every teaching and review audio control, including one human listening pass over all ten authored assets.

## Done When

- Completing Mora timing reveals one new Speech segment and the Pitch accent station; resetting Mora timing hides it again without exposing stale focus or a usable guarded route.
- The station teaches a small, explicitly scoped set of standard Tokyo Japanese word-pitch contours with kana, mora alignment, accessible high/low information, and verified bundled audio.
- Teaching examples play directly, and review starts from listening before revealing the written word, meaning, and contour through the existing stable flashcard interaction.
- Pitch-accent knowledge is stored by internal user ID in D1 and served only through authenticated, validated, private `no-store` endpoints.
- Desktop pointer and keyboard navigation, mobile horizontal navigation, return focus, loading feedback, reduced motion, and station-locator geography all include the new endpoint.
- The repository documents the content and audio provenance; no unlicensed third-party asset or unverified pitch claim ships.
- The generated migration is inspected and applied locally, the affected route is verified at mobile and desktop widths, and `npm run check` plus `execmap check .` pass.
