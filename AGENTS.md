# Repository guide

## Commands

- `npm run dev` — local Sites preview with HMR
- `npm run db:migrate:local` — apply generated migrations to local D1
- `npm run db:generate` — generate SQL after schema changes
- `npm run check` — lint, typecheck, tests, and production build

## Boundaries

- Keep one deployable application and cohesive capability modules.
- Keep D1 access behind `db/index.ts` and focused module repositories.
- Reference internal user IDs from product data; never use email as ownership.
- Treat ChatGPT identity as authentication, not authorization.
- Never enable development identity outside `NODE_ENV=development`.
- Never cache API, authentication, or personalized responses in the service worker.
- Add no role system, generic repository, object storage, analytics, or offline write queue without a concrete requirement.

## Definition of done

Update schema migrations and focused tests with behavior changes. Run `npm run check`, inspect the final diff, and verify the affected local route before calling work complete.
