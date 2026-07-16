# Foundation

## Goal

Ship an owner-only, D1-backed, ChatGPT-authenticated, PWA-ready OpenAI Sites foundation that is fast to run and easy to evolve.

## Guardrails

- Keep one deployable application with explicit internal boundaries.
- Use opaque internal user IDs and replaceable external identities.
- Treat D1 as authoritative; browser storage is non-authoritative.
- Keep the interface responsive, restrained, and nearly copy-free.
- Do not add roles, teams, uploads, offline writes, analytics, or a design system.
- Fail closed in production when identity or storage is unavailable.

## Execution Map

- [x] Bootstrap the official Sites starter and open the live development preview.
- [x] Establish the D1 schema, migration, current-identity boundary, and explicit local development identity.
- [x] Replace the starter with the minimal responsive shell and add the PWA install/offline/update foundation.
- [x] Add fast development commands, CI, and concise architecture and operating documentation.
- [x] Verify lint, tests, build, routes, PWA assets, migration integrity, and the rendered preview.

## Done When

- Local development starts with HMR using one documented command.
- D1 owns users and external identity mappings through a generated migration.
- ChatGPT identity is used in Sites, with an explicit development-only identity locally.
- Production never falls back to a fabricated identity or in-memory database.
- The app is installable and has a non-personalized offline fallback.
- Authentication, API, and personalized responses are never stored by the service worker.
- Health and PWA version endpoints are private and non-cacheable.
- `npm run check` is the CI and local completion gate.
- The starter surface is gone and the foundation is verified at mobile and desktop widths.
