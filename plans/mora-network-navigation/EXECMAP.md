# Mora Network Navigation

## Goal

Make Mora timing reachable from the mastery network through direct desktop navigation and mobile horizontal exploration.

## Guardrails

- Preserve the approved network geography, dark brand, and exact initial mobile bisection.
- Support touch/pointer swiping without blocking vertical page movement or station links.
- Keep keyboard navigation functional and honor reduced-motion preferences.
- Open an honest Mora timing station preview; do not invent learning material.
- Add no generic graph engine, navigation library, persistence, or dependencies.

## Execution Map

- [x] Add focused contracts for Mora timing routing and mobile pan behavior.
- [x] Make both mapped Sound stations directly navigable.
- [x] Add mobile swipe/pan between the centered Vowels and Mora timing positions.
- [x] Add the Mora timing station preview and network return path.
- [x] Preserve the current station when returning through the station locator or explicit network link.
- [x] Run the full gate, inspect the diff, and verify desktop click plus mobile swipe/tap locally.

## Done When

- Desktop users can click Mora timing to open `/stations/mora-timing`.
- Mobile still opens with Vowels centered and exactly half of Mora timing visible.
- A leftward swipe centers Mora timing and leaves half of Vowels visible on the left.
- A rightward swipe returns Vowels to center.
- Keyboard users can reach and open both stations without relying on swipe.
- The Mora timing route clearly says its lesson is not built yet and links back to the network.
- Returning from a station focuses that same location on the mobile network.
- `npm run check` and `execmap check .` pass.
