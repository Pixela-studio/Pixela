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
│   ├── proxy.ts            # Security headers (CSP) + bot denylist + redirect for protected routes
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
- **`tmdbProxy.ts`** — the actual TMDB proxying. Route files under `/api/{movies,series}/*` are one-line wrappers. Every response carries `Cache-Control` so the CDN answers repeats instead of the function; `proxySearch` is additionally rate-limited because its query space is unbounded and therefore uncacheable.
- **`tmdbDetails.ts`** — `fetchTmdbDetail` plus `parseTmdbId` / `toTmdbType`. The route handler and the Server Components of the media pages both go through it so they request the identical URL and Next's Data Cache serves both from one TMDB call. `parseTmdbId` must gate any id before it reaches a TMDB path: Next decodes route params, so an encoded `..` would otherwise walk to arbitrary TMDB endpoints with our API key.
- **`rateLimit.ts`** — fixed-window limiter in memory. Per-process, so a multi-instance deploy multiplies the effective limit; swap the `Map` for Redis if that stops being acceptable, keeping the signature.
- **`mediaEnrichment.ts`** — `enrichWithTmdb` resolves TMDB metadata for a list of own rows, deduplicating by `(itemType, tmdbId)`.

`src/proxy.ts` adds the CSP and security headers, rejects a denylist of user-agents with 403, and redirects to `/login` when the session cookie is missing. That redirect is UX only — real authorization lives in the handlers. (Next 16 renamed the `middleware.ts` convention to `proxy.ts`; the exported function is the default export.)

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
- The remaining lint warnings (22, all `warn`) are mostly `react-hooks/set-state-in-effect` coming from fetch-in-effect, which is inherent to `useAsyncResource`. The two `react-hooks/purity` hits are `Math.random()` inside Server Components in `app/page.tsx`; the page is now ISR (`revalidate = 3600`), so those values are drawn once per regeneration instead of per request. Worth moving to `src/lib/deterministicRandom.ts` seeded by the revalidation bucket.
- `next.config.js` line 1 uses `require()`, which trips `@typescript-eslint/no-require-imports` as an **error**, so `bun run lint` exits 1 even when nothing else is wrong. Pre-existing.

**Shared building blocks** — reach for these before writing a new one:
- `src/hooks/useAsyncResource.ts` — load a resource with loading/error state, cancel on unmount and discard out-of-order responses.
- `src/hooks/useFavoriteToggle.ts` — favorite state and toggling for a title.
- `src/shared/components/EmptyState.tsx` — empty list with headline, context and an exit.
- `src/lib/date.ts` — `formatYear` / `formatRuntime`. Use `formatYear`, never `new Date(x).getFullYear()`: TMDB returns an empty string for unreleased titles and that renders as `NaN`.
- `src/lib/deterministicRandom.ts` — seeded values for decorative elements. Do not call `Math.random()` during render.
- `src/lib/constants/reviews.ts` — review limits shared by the form and the API schema.

## Deployment (Vercel)

Audited 2026-09-01. State at that moment, and the traps found:

**The project is disabled by Vercel.** `https://pixela-seven.vercel.app` answers `402 Payment Required` with `X-Vercel-Error: DEPLOYMENT_DISABLED` — the free-plan quota was exceeded and Vercel hard-paused it. **While it is in that state no push deploys**: the last deployment GitHub recorded is `07cd37b` from 2026-07-04, and pushes made on 2026-09-01 produced none. Re-enable the project in the dashboard before expecting any change to reach production.

**Two Vercel projects were wired to the same repo**, `pixela` and `pixela199x`, both under the `envyx10s-projects` team and therefore the same quota. Every push built and deployed twice — the GitHub deployment list shows the same commit deployed to both within a minute. `pixela199x.vercel.app` now answers `DEPLOYMENT_NOT_FOUND`, so it looks abandoned. Delete it or disconnect it from the repo; otherwise every fix to request volume is paid for twice in build time.

**URLs that are not ours.** `pixela.io` is **not** this project's domain: it is parked and for sale on Spaceship.com (`Server: openresty`, title "Pixela.io for sale"). It was nonetheless the canonical URL in `layout.tsx`. `pixela.vercel.app` belongs to an unrelated Vercel user (a pixe.la graph embed). The real production URL is `pixela-seven.vercel.app`, which is also the repo's `homepage` field. Canonical URL now lives in **`src/lib/site.ts`** — `layout.tsx`, `robots.ts` and `sitemap.ts` all import `SITE_URL` from there, so they cannot drift. Override with `NEXT_PUBLIC_SITE_URL` once there is a real domain.

Still stale: the footer advertises `pixel@pixela.io`, a mailbox on a domain we do not control. Nobody receives mail sent there.

### `vercel.json`

JSON takes no comments, so the `ignoreCommand` is explained here. Semantics are inverted and easy to get backwards:

- **exit 0 → build is SKIPPED**
- **exit 1 → build PROCEEDS**

The command builds `main`, skips every other branch, and offers an escape hatch: put `[deploy]` anywhere in the commit message to force a preview build of a branch. This stops preview deployments from consuming quota on every branch push. To go back to previews for everything, delete the `ignoreCommand` key.

`github.silent` only suppresses the deployment comments Vercel posts on PRs; it has no effect on quota.

### Environment variables the deploy needs

Derived from every `process.env` reference in `src/` plus `prisma/schema.prisma`:

| Variable | Required | Notes |
|---|---|---|
| `TMDB_API_KEY` | **yes** | `src/lib/tmdb.ts` throws at module load if missing, so the **build itself fails** — not just requests. |
| `TMDB_BASE_URL` | **yes** | `https://api.themoviedb.org/3`. Not guarded: if absent, every TMDB URL is built as `undefined/...`. |
| `DATABASE_URL` | **yes** | The only var `schema.prisma` reads. Use the Supabase pooler (`:6543`, `pgbouncer=true`) for the runtime. |
| `AUTH_SECRET` | **yes** | Auth.js. |
| `NEXT_PUBLIC_SITE_URL` | recommended | Overrides `src/lib/site.ts`. Without it the fallback `https://pixela-seven.vercel.app` is used. |
| `NEXT_PUBLIC_API_URL` | no | Only a localhost fallback now. Every `API_ENDPOINTS` consumer left is client-side, and in the browser off localhost `getBaseUrl()` returns the relative `/api`. The server no longer calls its own API. |
| `DIRECT_URL` | no | Present in `.env.local` for migrations but **not referenced** by `schema.prisma`; add `directUrl` to the datasource block if you want it honored. |
| `AUTH_URL` / `AUTH_TRUST_HOST` | no | Only for exercising a production build locally — see Gotchas. |

`NEXT_PUBLIC_BACKEND_URL` and `NEXT_PUBLIC_FRONTEND_URL` appear in `.env.local` but no code reads them; leftovers from the Laravel backend.

## Request budget (Vercel Edge Requests)

The free plan caps Edge Requests at 1M/month and this project blew past it. **Every** HTTP request that reaches the deployment counts, cache hit or not, so the metric is driven by the *number* of requests a page triggers — not by how fast they are. Before adding a fetch, an image, or a prefetch, ask what it costs per page view.

Rules that came out of that audit — breaking any of them regresses the quota:

- **Never call your own API over HTTP from the server.** A Server Component doing `fetch("https://<domain>/api/...")` leaves the function, re-enters through the edge and wakes a second function: two Edge Requests and two invocations for something a direct call would do for free. Server-side code goes to `fetchFromTmdb` / Prisma directly. `src/api/**` clients are for the **browser**.
- **`dynamic = "force-dynamic"` is a last resort.** It makes every visit a render. TMDB catalog data is not real-time; use `revalidate`.
- **A `[id]` route needs `generateStaticParams` to be ISR at all.** `export const revalidate` alone leaves it fully dynamic — verify in `.next/prerender-manifest.json`: if the path is missing from `dynamicRoutes`, it is not cached. Return `[]` plus `dynamicParams = true` for generate-on-first-visit.
- **TMDB images bypass `next/image`'s optimizer** via the custom loader in `src/lib/imageLoader.js`. They already come from a CDN with size variants in the path; re-optimizing them cost one Edge Request plus one optimizer invocation *per image*, and the home page renders ~65. Don't set `images.loader` back to default.
- **Route handlers must set `Cache-Control`.** Public catalog responses use `public, s-maxage=…, stale-while-revalidate=…` so the CDN answers without invoking anything; add `max-age` when the browser should stop asking too. `DEFAULT_FETCH_OPTIONS` forces `no-store` — correct for user data, wrong for catalog.
- **`<Link prefetch={false}>` in grids and navbars.** It does not disable prefetch; it moves it from "on viewport" to "on hover". The default prefetched one RSC payload per visible card.
- **`SessionProvider` has `refetchOnWindowFocus` disabled** (`src/app/providers.tsx`). The default hit `/api/auth/session` on every tab focus, including for anonymous visitors.
- **Referencing a file that does not exist in `public/` is not free.** A missing `/manifest.json` or `/apple-touch-icon.png` 404s through the App Router, which is a function invocation. `robots.ts`, `sitemap.ts` and `manifest.ts` exist so crawlers stop probing for them.
- **`src/proxy.ts` rejects a denylist of user-agents with 403.** It cannot prevent the request that already arrived, but it stops the cascade behind it. The list includes `curl/` and `wget/` — if you add an uptime monitor, give it its own user-agent or take those two out.

## Skills available for this repo

- `.claude/skills/nextjs-best-practices` — App Router patterns cheat sheet.
- `.claude/skills/vercel-react-best-practices` — 57 Vercel Engineering React perf rules with examples.

Prefer these over guessing when touching data fetching, hydration, memoization, or bundle-size sensitive code.
