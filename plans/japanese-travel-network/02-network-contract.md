# Implement the accepted mobile-first topology, focus graph, line treatment, station locators, and unconditional Travel visibility without changing the existing completion domain.

[Back to Execution Map](./EXECMAP.md)

## Goal

Implement one mobile-first network topology in which `Japanese` is the obvious entrance, Travel extends down the central column, and the established technical lines remain easy to explore horizontally.

## Tasks

- Add the always-routable focus keys and routes `japanese`, `japan`, `greetings`, `navigation`, `food`, and `shopping`.
- Use this stable topology:

  ```text
  Japanese ───── Vowels ───── Mora Timing ───── Pitch Accent
      │              │
    Japan         Hiragana
      │              │
  Greetings       Katakana
      │              │
  Navigation      Dakuten & Handakuten
      │              │
    Food             Yōon
      │
  Shopping
  ```

- Keep `Japanese` at the current central starting coordinate, shift the existing Speech/Kana column one segment to the right, and retain one visual unit per connected station.
- Render Travel vertically through `Japanese → Japan → Greetings → Navigation → Food → Shopping`; render Speech horizontally through `Japanese → Vowels → Mora Timing → Pitch Accent`; keep Kana branching vertically from Vowels.
- Make `Japanese` an interchange between Speech and Travel and keep Vowels an interchange between Speech and Kana.
- Make new-user, server, and invalid-stored-focus fallback `japanese`; preserve all valid existing stored focuses and let an explicit visible `?focus=` request win.
- Extend pointer, keyboard, and mobile focus relationships:
  - `Japanese`: Right → Vowels, Down → Japan.
  - `Japan`: Up → Japanese, Down → Greetings.
  - `Greetings`: Up → Japan, Down → Navigation.
  - `Navigation`: Up → Greetings, Down → Food.
  - `Food`: Up → Navigation, Down → Shopping.
  - `Shopping`: Up → Food.
  - `Vowels`: Left → Japanese, Right → Mora Timing, Down → Hiragana.
  - Preserve the remaining Speech and Kana relationships.
- Extend station locator glyphs so `Japanese` shows Speech to the right and Travel below, Vowels shows Speech on both sides plus Kana below, intermediate Travel stations show a vertical through-line, and Shopping shows a terminal.
- Keep Speech's coral-red identity, reuse the current restrained blue identity for Travel, and replace Kana's blue identity with a restrained warm yellow. Apply those identities consistently to line strokes and labels, single-line station outer rings and backlights, interchange treatments, station locator glyphs, and line-specific loading accents while preserving the structural white inner ring.
- Keep the Travel line and its routes in the static base network. Continue loading only personalized Speech/Kana availability through the private fail-closed availability request.

## Constraints

- Optimize the initial 320px–430px view for one centered vertical Travel column; do not introduce a diagonal fork, miniature overview, zoom control, internal scrollbar, or separate mobile topology.
- Let the desktop view be the wider expression of the same coordinates and relationships.
- Do not erase or rewrite the existing local station-focus preference.
- Do not add Travel stations to `STATION_IDS`, prerequisite filtering, station introductions, knowledge tables, or repository completion logic.
- Do not use the line-color swap to recolor body text, generic buttons, `Good` / `Not Yet`, known/complete state, errors, or other semantic UI that is not expressing network-line identity.
- Do not show unavailable, faint, placeholder, or speculative geography.
- Preserve direct station links, keyboard focus, touch-safe hover behavior, accessible network descriptions, and reduced motion.

## Exit Criteria

- At 320px and 390px widths, the first view centers `Japanese` with the Travel column directly below; horizontal movement reaches Vowels and the existing technical network without clipping labels or losing focus.
- At desktop width, the Travel and Kana columns remain legible beneath their respective interchanges and the Speech backbone remains easy to scan.
- Blue Travel and yellow Kana treatments remain distinguishable from each other and from coral Speech in line labels, ordinary stations, interchanges, focus/backlight states, station locators, and loading surfaces, with readable contrast against the dark background.
- All new stations are reachable by pointer and keyboard, valid stored/query focus resolves correctly, and returning users keep their previous valid station focus.
- Travel is present before personalized availability loads and remains usable if it has no completion state; existing fail-closed personalized loading and retry behavior is unchanged.
- Station locator glyphs and accessible network descriptions report the same topology that is rendered.
