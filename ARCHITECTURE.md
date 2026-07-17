# Architecture

Ling is a modular monolith: one Sites deployment with narrow server-side boundaries.

## Runtime

- `app/` owns routes, metadata, and the minimal UI shell.
- `src/platform/` adapts platform identity into an application identity.
- `src/modules/` owns product capabilities and focused persistence operations.
- `db/` owns the D1 schema and binding helper; `drizzle/` holds generated migrations.
- `public/` owns the installable shell and non-personalized offline fallback.

Dependencies point inward: routes call modules, modules call the database boundary, and platform-specific identity is adapted before entering a module. Route handlers do not read D1 bindings directly.

## Identity and ownership

ChatGPT/Sites supplies the external identity. `user_identities` maps that replaceable identity to an opaque internal `users.id`. Future user-owned records should reference `users.id`, never an email address.

Sites access policy is the owner-only perimeter. Server routes still require identity and enforce ownership; the browser is never an authorization boundary.

## PWA

The service worker is registered only in production. It pre-caches only the generic offline page, uses the network for navigation, and never stores API, authentication, or personalized responses. The private Sites access perimeter also protects the manifest, icons, and service worker until sign-in; those assets are available to the authenticated app, while the pre-authentication page remains platform-owned. Safari installation must use the manifest's full-bleed icon; do not declare an `apple-touch-icon`, because that competing path resolves to the private Sites identity instead of Ling. D1 remains the source of truth; offline writes are intentionally unsupported.
