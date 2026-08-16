# Pixela

Full-stack Next.js app for movie/series discovery. TMDB proxy + PostgreSQL for user data.

## Stack

- **Framework:** Next.js 16 (App Router) + React 19
- **Language:** TypeScript (strict)
- **DB:** PostgreSQL (Supabase) via Prisma
- **Auth:** Auth.js v5 (NextAuth beta)
- **Styles:** Tailwind CSS
- **State:** Zustand
- **Forms:** react-hook-form + Zod
- **Package manager:** Bun

## Structure

```
pixela/
├── src/
│   ├── app/                # Next.js App Router (routes, layouts, API)
│   │   ├── (auth)/         # Login/register routes group
│   │   ├── (rutas)/        # Public content routes group
│   │   └── api/            # Route handlers (proxy a TMDB, user CRUD, favorites, reviews)
│   ├── features/           # Feature-based modules (media, profile, hero, discover, actor, ...)
│   │   └── <feature>/
│   │       ├── components/
│   │       ├── hooks/
│   │       ├── store/
│   │       └── types/
│   ├── shared/             # Cross-feature UI (Navbar, MediaCarousel, EmptyState)
│   ├── hooks/              # Cross-feature hooks
│   ├── lib/                # prisma client, low-level helpers
│   │   └── api/            # Route-handler layer: guards, responses, schemas, TMDB proxy
│   ├── api/                # HTTP client wrappers per resource
│   ├── stores/             # Cross-feature Zustand stores (auth)
│   ├── proxy.ts            # Security headers (CSP) + redirect for protected routes
│   └── auth.ts             # NextAuth config
├── prisma/                 # schema + migrations + seeds
└── public/
```

## Conventions

- **Server Components by default.** Add `'use client'` only when the component needs state, effects, or event handlers.
- **Feature-based imports.** Cross-feature imports go through `@/shared` or `@/hooks`; avoid reaching into another feature's internals.
- **Named exports** over default exports (better refactor / auto-import).
- **Types with camelCase in TS, snake_case at the API boundary** (Prisma models map columns via `@map(...)`).
- **Data fetching:** Server Components fetch directly; client uses SWR-style hooks or Zustand slices.
- **Validation:** Zod schemas at every API boundary and form submit.

## Package manager: Bun

```bash
bun install           # install deps
bun run dev           # dev server (proxies to next dev)
bun run build         # prisma generate && next build
bun run start
bun run lint
```

Do NOT reintroduce `package-lock.json` or `.npmrc legacy-peer-deps`. Bun handles peer resolution.

## Prisma

- `bun run build` runs `prisma generate` before `next build`.
- Schema lives in `prisma/schema.prisma`.
- Migrations: `bunx prisma migrate dev`.
- Client is a singleton in `src/lib/prisma.ts` (avoid connection storms during dev HMR).

## API layer (`src/lib/api/`)

Every route handler goes through these. Don't hand-roll auth or validation in a route.

- **`guards.ts`** — `requireUser()` / `requireAdmin()`. Return `{ ok, user }` or `{ ok: false, response }`; bail early with `if (!guard.ok) return guard.response`. They parse and validate `session.user.id` so it never reaches Prisma as `NaN`.
- **`responses.ts`** — `apiError`, `validationError`, `parseJsonBody`, `handleRouteError`. **Never return `error.message` to the client**: Prisma leaks index and column names in it. `handleRouteError` logs the real error and answers generically.
- **`schemas.ts`** — shared Zod schemas (`tmdbIdSchema`, `itemTypeSchema`, `watchStatusSchema`, …) plus `pickDiscoverParams`, the allowlist for what may be forwarded to TMDB.
- **`tmdbProxy.ts`** — the actual TMDB proxying. Route files under `/api/{movies,series}/*` are one-line wrappers. `parseTmdbId` must gate any id before it reaches a TMDB path: Next decodes route params, so an encoded `..` would otherwise walk to arbitrary TMDB endpoints with our API key.
- **`rateLimit.ts`** — fixed-window limiter in memory. Per-process, so a multi-instance deploy multiplies the effective limit; swap the `Map` for Redis if that stops being acceptable, keeping the signature.
- **`mediaEnrichment.ts`** — `enrichWithTmdb` resolves TMDB metadata for a list of own rows, deduplicating by `(itemType, tmdbId)`.

`src/proxy.ts` adds the CSP and security headers, and redirects to `/login` when the session cookie is missing. That redirect is UX only — real authorization lives in the handlers. (Next 16 renamed the `middleware.ts` convention to `proxy.ts`; the exported function is the default export.)

## Gotchas

- **Run everything from `pixela/`, with Bun.** There is no `package.json` at the repo root, so `bun dev` one level up fails with `Script not found "dev"`. Don't use pnpm/npm here — the lockfile is `bun.lock`.
- **`outputFileTracingRoot` in `next.config.js` is load-bearing.** Next infers the workspace root by walking up looking for lockfiles. A stray `package.json`/`pnpm-lock.yaml` in the user's home directory makes it pick that as the root and trace through AppData, OneDrive and Windows junctions; the dev worker then dies with `Jest worker encountered 2 child process exceptions` and `/api/auth/session` returns HTML, surfacing as an Auth.js `ClientFetchError`. Don't remove that setting.
- **`next start` locally fails Auth.js with `UntrustedHost`.** Auth.js only trusts the host automatically in development or on Vercel. To exercise a production build locally, set `AUTH_URL=http://localhost:3000` (or `AUTH_TRUST_HOST=true`) in `.env.local`. Not needed for the Vercel deploy.

## Known tech debt

**Storage / data**
- Profile photos stored as base64 in `users.photo_url` (TEXT), capped at 512 KB by the Zod schema. Should move to object storage (S3/Cloudinary).
- No password recovery. The "forgot password" link is rendered disabled on purpose; wire it up once there's email delivery.

**Pending major upgrades** (skipped in the Bun migration to keep the diff safe)
- **Prisma 5 → 7**: two majors. Follow https://pris.ly/d/major-version-upgrade. Regenerate client, review query call sites, run migrations against a snapshot first.
- **Tailwind 3 → 4**: CSS-first config, dropped `tailwind.config.js` in favor of `@theme` blocks, new PostCSS plugin (`@tailwindcss/postcss`). Requires touching every entry stylesheet.
- **TypeScript 5.9 → 6**: mostly compatible; audit `tsconfig` `module` / `moduleResolution` after upgrade.
- **ESLint 9 → 10**: blocked on `eslint-config-next` supporting v10 (peerDep is `>=9.0.0`, not v10).

**Code smells** (non-blocking, worth a focused refactor pass)
- `src/features/categories/components/core/CategoriesContent.tsx` (~1000 lines): God component. Split by concern (filters, grid, pagination, search state).
- `src/features/categories/hooks/useContentLoader.ts` (~485 lines): same shape, split by responsibility. It also drops user interactions — `if (isLoadingRef.current) return` silently discards a page change requested while another load is in flight. Replace the boolean with a request-id counter (see `useAsyncResource`) so newer requests supersede older ones instead of being ignored.
- `src/features/hero/services/heroBackdropService.ts` pins a hardcoded TMDB id as the first hero slide and keeps a manual title blacklist. Both will rot; move them to configuration.
- The remaining lint warnings (22, all `warn`) are mostly `react-hooks/set-state-in-effect` coming from fetch-in-effect, which is inherent to `useAsyncResource`. The two `react-hooks/purity` hits are `Math.random()` inside Server Components in `app/page.tsx`, which is safe there because the page is `force-dynamic`.

**Shared building blocks** — reach for these before writing a new one:
- `src/hooks/useAsyncResource.ts` — load a resource with loading/error state, cancel on unmount and discard out-of-order responses.
- `src/hooks/useFavoriteToggle.ts` — favorite state and toggling for a title.
- `src/shared/components/EmptyState.tsx` — empty list with headline, context and an exit.
- `src/lib/date.ts` — `formatYear` / `formatRuntime`. Use `formatYear`, never `new Date(x).getFullYear()`: TMDB returns an empty string for unreleased titles and that renders as `NaN`.
- `src/lib/deterministicRandom.ts` — seeded values for decorative elements. Do not call `Math.random()` during render.
- `src/lib/constants/reviews.ts` — review limits shared by the form and the API schema.

## Skills available for this repo

- `.claude/skills/nextjs-best-practices` — App Router patterns cheat sheet.
- `.claude/skills/vercel-react-best-practices` — 57 Vercel Engineering React perf rules with examples.

Prefer these over guessing when touching data fetching, hydration, memoization, or bundle-size sensitive code.
