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

## Delivery

- **Gate:** `npm run check` (CI runs the same).
- **While iterating:** `npm run dev`, then check the affected route.
- **Review focus:** the Boundaries above.
- **Sensitive areas** (always a full review): identity (ChatGPT sign-in, development identity), D1 schema and migrations, service worker caching.
- **Merge:** squash PR into `main`; CI must pass (not enforced by branch protection).
- **Go live:** merging does not deploy. Publish the merged commit to the private OpenAI Sites project in `.openai/hosting.json`, save a version, and wait for `succeeded`. If the save is rejected as a stale commit, push the merged SHA to the Sites source repository and retry; never publish a different SHA. Only Codex has the Sites tools: other agents stop at "merged, not delivered" and say Codex must publish.
- **Verify live:** the signed-in production site shows the change. Signed-out access returning sign-in or 401 is expected.
- **Deploy policy:** automatic.
