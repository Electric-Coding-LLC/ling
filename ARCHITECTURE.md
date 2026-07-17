# Architecture

Ling is a modular monolith: one Sites deployment with narrow server-side boundaries.

## Runtime

- `app/` owns routes, metadata, and the minimal UI shell.
- `src/platform/` adapts platform identity into an application identity.
- `src/modules/` owns product capabilities and focused persistence operations.
- `db/` owns the D1 schema and binding helper; `drizzle/` holds generated migrations.
- `public/` owns the install metadata and static app assets.

Dependencies point inward: routes call modules, modules call the database boundary, and platform-specific identity is adapted before entering a module. Route handlers do not read D1 bindings directly.

## Identity and ownership

ChatGPT/Sites supplies the external identity. `user_identities` maps that replaceable identity to an opaque internal `users.id`. Future user-owned records should reference `users.id`, never an email address.

Sites access policy is the owner-only perimeter. Server routes still require identity and enforce ownership; the browser is never an authorization boundary.

## PWA

Ling is installable but intentionally online-only. It does not register a service worker or cache an offline shell. The production client unregisters legacy Ling workers and deletes only `ling-shell-*` caches left by earlier releases; the retirement worker at `/sw.js` performs the same cleanup for browsers that update an existing registration before loading the new client. HTML responses remain private and `no-store`, and content-addressed static assets can use immutable caching without pinning an obsolete asset graph. The private Sites access perimeter protects the manifest and its icons until sign-in, while the pre-authentication page remains platform-owned. Safari's Add to Dock helper fetches its preferred touch icon outside that authenticated page context, so Ling declares an immutable public `apple-touch-icon` whose bytes mirror the content-addressed repository asset. The manifest remains the install source for browsers that can read its protected icon set. D1 remains the source of truth; offline writes are unsupported.
