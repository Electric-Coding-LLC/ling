# Ling

An owner-only OpenAI Site foundation with ChatGPT identity, D1 persistence, and PWA support.

## Run

```bash
cp .env.example .env.local
npm install
npm run db:migrate:local
npm run dev
```

Open `http://localhost:3000`. Local development uses the explicit `DEV_USER_EMAIL`; deployed requests use platform-provided ChatGPT identity headers.

## Verify

```bash
npm run check
```

This runs lint, TypeScript, focused tests, and a production build. After changing `db/schema.ts`, run `npm run db:generate` and inspect the generated SQL before applying it.

## Boundaries

- D1 is authoritative for users and future product state.
- The installed app is intentionally online-only and does not register a service worker.
- HTML, `/api/*`, and ChatGPT authentication responses remain private and uncached.
- Production has no development identity or in-memory database fallback.
- R2, roles, teams, analytics, and offline writes remain absent until required.
