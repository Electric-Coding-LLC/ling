# Japanese & Japan Network

## Goal

Make `Japanese` Ling's clear mobile-first entrance and add a small, always-available `Japan` reference line without disturbing the existing Speech, Kana, progress, or prerequisite behavior.

## Guardrails

- Keep the visible station labels exactly `Japanese`, `Visit`, `Rōmaji`, `Introductions`, `Navigation`, `Food`, `Shopping`, and `Help`; name the line `Japan`.
- Keep Speech coral-red, give Japan the current restrained blue identity, and move Kana to a restrained warm yellow identity. Apply line identity consistently to network lines, labels, station rings/backlights, locator glyphs, and line-specific loading accents without recoloring unrelated controls or learning-state semantics.
- Preserve the column-first mobile model: `Japanese` is the initial central station, Japan continues vertically beneath it, and the existing Vowels/Speech/Kana territory unfolds horizontally to the right.
- Keep every Japan-line station independently accessible from the start. Do not make Japan-line completion a prerequisite for any station or add it to the availability chain. Rōmaji may save its own learning state without gating later stations.
- Keep product onboarding in the separate `/welcome` guide. Make `Japanese` a compact language orientation and `Visit` a practical first-trip introduction; give Rōmaji the established chart, flashcard, and private knowledge flow; keep the five practical stations short playable reference lists with flashcard testing but no score, progress, completion control, scheduling, speech evaluation, or persistence.
- Present phrases through Japanese writing, bundled audio, and concise English meaning. Teach rōmaji in one chart-based Japan-line station, then use compact rōmaji on later Japan-line phrases. Do not add IPA, English respellings, a global display setting, or rōmaji to Speech and Kana stations.
- Reuse the established station header, practice-row, audio-intent feedback, loading, and responsive patterns. Add at most one focused shared Japan-line reference component if it removes real duplication across the five phrase stations.
- Keep each practical station to one source-checked interaction or compact reference set. Let the purpose determine the entry count; do not pad or cut merely to hit a number, and do not expand into grammar lessons, cultural essays, a generic phrasebook, travel planning, generic content management, or speculative stations.
- Preserve existing routes, stored station focus, completion data, and Speech/Kana reveal/reset behavior. New-user and server fallback focus becomes `Japanese`; a valid stored returning-user focus remains valid.

## Execution Map

- [x] [Freeze the purpose, minimal copy, phrase inventory, rōmaji boundary, source notes, and bundled-audio manifest for all eight stations.](./01-content-contract.md)
- [x] [Implement the accepted mobile-first topology, focus graph, line treatment, station locators, and unconditional Japan-line visibility without changing the existing completion domain.](./02-network-contract.md)
- [x] Build the always-available `/stations/japanese` and `/stations/visit` orientation routes with concise content, direct authored audio where useful, loading treatment, and return-to-network focus.
- [x] Build `/stations/romaji` between Japan and Introductions with a five-column hidden-answer flashcard chart, saved completion state, and compact whole-word rules.
- [x] Build one minimal Japan-line reference surface and the `/stations/introductions`, `/stations/navigation`, `/stations/food`, `/stations/shopping`, and `/stations/help` routes with the frozen entries and bundled audio, with flashcard testing but without score or persistence.
- [x] Add focused contracts for route access, exact one-word labels, content/audio integrity, Rōmaji review persistence, immediate audio feedback, reference-station no-progress behavior, keyboard neighbors, stored/query focus, responsive geometry, accessibility, and unchanged Speech/Kana prerequisites.
- [x] Update `VISION.md` to make `Japanese` the network entrance, describe the Japan line and station interiors, and replace the absolute no-romaji rule with the narrower Japanese-first boundary.
- [x] Run the Japan-line audio verifier, `npm run check`, and `execmap check .`; inspect the final diff; then verify the initial and returning-user network, every new route/audio control, keyboard movement, horizontal mobile movement, and 320px/390px/desktop geometry in a real browser.

## Done When

- A new or server-rendered visit focuses one central `Japanese` station, with Japan extending down the same mobile column and Vowels/Speech/Kana extending to the right without a forked or diagonal entrance.
- The network labels the three lines `Speech`, `Kana`, and `Japan`; Speech is coral-red, Japan is blue, Kana is warm yellow, and every new station uses its agreed one-word label.
- `Japanese`, `Visit`, `Rōmaji`, `Introductions`, `Navigation`, `Food`, `Shopping`, and `Help` are always visible and directly routable. Rōmaji knowledge never gates access to it or any later station.
- `/welcome` introduces Ling and the network outside station progress. `Japanese` introduces the language and its writing systems; `Visit` frames a first visit and begins with three playable expressions; each practical station provides one accurate, playable, purpose-complete interaction or reference set in the shared restrained style.
- Existing Speech/Kana availability, persistence, reset cascades, mobile focus restoration, keyboard navigation, loading behavior, and route guards remain intact.
- No global rōmaji setting, IPA layer, new dependency, or generic course/content
  system is introduced. Visit alone uses short English sound cues before the
  Rōmaji station; Rōmaji alone reuses the established chart review and progress
  pattern.
- All authored Japan-line audio and content contracts pass, the complete repository gate and execution-map validation pass, and rendered mobile/desktop proof shows readable labels, sufficient color contrast, centered columns, reachable stations, and no clipping or sticky hover behavior.
