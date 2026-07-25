# Japanese & Travel Network

## Goal

Make `Japanese` Ling's clear mobile-first entrance and add a small, always-available `Travel` reference line without disturbing the existing Speech, Kana, progress, or prerequisite behavior.

## Guardrails

- Keep the visible labels exactly `Japanese`, `Japan`, `Greetings`, `Navigation`, `Food`, and `Shopping`; name the new line `Travel`.
- Keep Speech coral-red, give Travel the current restrained blue identity, and move Kana to a restrained warm yellow identity. Apply line identity consistently to network lines, labels, station rings/backlights, locator glyphs, and line-specific loading accents without recoloring unrelated controls or learning-state semantics.
- Preserve the column-first mobile model: `Japanese` is the initial central station, Travel continues vertically beneath it, and the existing Vowels/Speech/Kana territory unfolds horizontally to the right.
- Keep every Travel station independently accessible from the start. Do not make Travel completion a prerequisite for any station, and do not add these reference stations to the D1 completion chain.
- Keep product onboarding in the separate `/welcome` guide. Make `Japanese` a compact language orientation and `Japan` a practical first-trip introduction; keep the four practical stations short playable reference lists with no review, score, progress, completion control, scheduling, speech evaluation, or persistence in this slice.
- Present phrases through Japanese writing, bundled audio, and concise English meaning. Do not add a global romaji mode or retrofit romaji into Speech or Kana; use romaji only when it is itself real-world content, such as an authored sign or place-name example.
- Reuse the established station header, practice-row, audio-intent feedback, loading, and responsive patterns. Add at most one focused shared Travel reference component if it removes real duplication across the four phrase stations.
- Keep each practical station to no more than six source-checked essentials. Do not expand into grammar lessons, cultural essays, a generic phrasebook, travel planning, generic content management, or speculative stations.
- Preserve existing routes, stored station focus, completion data, and Speech/Kana reveal/reset behavior. New-user and server fallback focus becomes `Japanese`; a valid stored returning-user focus remains valid.

## Execution Map

- [x] [Freeze the purpose, minimal copy, phrase inventory, romaji boundary, source notes, and bundled-audio manifest for all six stations.](./01-content-contract.md)
- [x] [Implement the accepted mobile-first topology, focus graph, line treatment, station locators, and unconditional Travel visibility without changing the existing completion domain.](./02-network-contract.md)
- [x] Build the always-available `/stations/japanese` and `/stations/japan` orientation routes with concise content, direct authored audio where useful, loading treatment, and return-to-network focus.
- [x] Build one minimal Travel reference surface and the `/stations/greetings`, `/stations/navigation`, `/stations/food`, and `/stations/shopping` routes with the frozen entries and bundled audio, without review or persistence.
- [x] Add focused contracts for route access, exact one-word labels, content/audio integrity, immediate audio feedback, no-progress behavior, keyboard neighbors, stored/query focus, responsive geometry, accessibility, and unchanged Speech/Kana prerequisites.
- [x] Update `VISION.md` to make `Japanese` the network entrance, describe the Travel line and station interiors, and replace the absolute no-romaji rule with the narrower Japanese-first boundary.
- [x] Run the Travel audio verifier, `npm run check`, and `execmap check .`; inspect the final diff; then verify the initial and returning-user network, every new route/audio control, keyboard movement, horizontal mobile movement, and 320px/390px/desktop geometry in a real browser.

## Done When

- A new or server-rendered visit focuses one central `Japanese` station, with Travel extending down the same mobile column and Vowels/Speech/Kana extending to the right without a forked or diagonal entrance.
- The network labels the three lines `Speech`, `Kana`, and `Travel`; Speech is coral-red, Travel is blue, Kana is warm yellow, and every new station uses its agreed one-word label.
- `Japanese`, `Japan`, `Greetings`, `Navigation`, `Food`, and `Shopping` are always visible, directly routable, and independent of introduction, knowledge, completion, reset, and D1 state.
- `/welcome` introduces Ling and the network outside station progress. `Japanese` introduces the language and its writing systems; `Japan` frames a first visit and begins with three playable expressions; each practical station provides no more than six accurate, playable essentials in the shared restrained reference style.
- Existing Speech/Kana availability, persistence, reset cascades, mobile focus restoration, keyboard navigation, loading behavior, and route guards remain intact.
- No global romaji surface, review flow, progress UI, schema migration, new dependency, or generic course/content system is introduced.
- All authored Travel audio and content contracts pass, the complete repository gate and execution-map validation pass, and rendered mobile/desktop proof shows readable labels, sufficient color contrast, centered columns, reachable stations, and no clipping or sticky hover behavior.
