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
│   ├── shared/             # Cross-feature UI (Navbar, MediaCarousel, buttons)
│   ├── hooks/              # Cross-feature hooks
│   ├── lib/                # prisma client, low-level helpers
│   ├── api/                # HTTP client wrappers per resource
│   ├── stores/             # Cross-feature Zustand stores (auth)
│   ├── types/              # Global TS types
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

## Known tech debt

**Storage / data**
- Profile photos stored as base64 in `users.photo_url` (TEXT). Should move to object storage (S3/Cloudinary).
- `session.user` cache is bypassed in `/api/user` GET by re-querying Prisma — trade consistency for extra DB round-trip.

**Pending major upgrades** (skipped in the Bun migration to keep the diff safe)
- **Prisma 5 → 7**: two majors. Follow https://pris.ly/d/major-version-upgrade. Regenerate client, review query call sites, run migrations against a snapshot first.
- **Tailwind 3 → 4**: CSS-first config, dropped `tailwind.config.js` in favor of `@theme` blocks, new PostCSS plugin (`@tailwindcss/postcss`). Requires touching every entry stylesheet.
- **TypeScript 5.9 → 6**: mostly compatible; audit `tsconfig` `module` / `moduleResolution` after upgrade.
- **ESLint 9 → 10**: blocked on `eslint-config-next` supporting v10 (peerDep is `>=9.0.0`, not v10).

**Code smells** (non-blocking, worth a focused refactor pass)
- `src/features/categories/components/core/CategoriesContent.tsx` (~1000 lines): God component. Split by concern (filters, grid, pagination, search state).
- `src/features/categories/hooks/useContentLoader.ts` (~549 lines): same shape, split by responsibility.
- 5+ files >300 lines in `features/profile/**` — refactor candidates.
- New React 19 lint rules (`react-hooks/set-state-in-effect`, `react-hooks/purity`, `react-hooks/error-boundaries`) are set to `warn` in `eslint.config.mjs`. Address progressively — the warnings point at real anti-patterns, they were just too many to tackle in the migration commit.

**Orphan modules** (audited, safe to delete once you confirm no external tooling references them)
- Barrels never imported: `src/features/{about,discover,trending}/index.ts`, `src/features/{discover,trending,media}/components/index.ts`, `src/links/index.ts`, `src/metadata/index.ts` (and its `pages/*.ts`).
- Types never used: `src/types/media.ts`; `interface CategoriesState` and `OverlayContentProps` (already deleted where duplicated).
- Profile components exported only via barrel, never consumed: `FormInput`, `UserProfileCard`, `ProfileLoader`, `ProfileTabs`, `TabNavigationButton`.
- Hook `src/hooks/useMediaQuery.ts` — every call site is commented out in `DiscoverGrid.tsx` / `DiscoverContent.tsx`. Either uncomment the sites or delete the hook.

**`'use client'` on pure render-only components** (would gain from becoming Server Components)
`src/features/{theatrical,weekend}/components/*Section.tsx`, `src/features/media/components/{platforms/StreamingProviders,hero/title/MediaTitle,hero/backdrop/BackdropImage,hero/genres/GenresList,hero/metadata/MediaMetadata,hero/creators/CreatorInfo,hero/modal/PosterImage,review/StarDisplay}.tsx`.

**Duplicated logic** (DRY)
- `src/app/errors/error-403.tsx` and `not-found.tsx` share identical `STYLES` — extract to `src/app/errors/_styles.ts`.
- `src/shared/components/ActionButtons.tsx` and `src/features/media/components/hero/actions/ActionButtons.tsx` reimplement the same favorite lookup.
- `useEffect(() => { setLoading(true); api.list().then(setState).catch(setError).finally(setLoading(false)); }, [])` copied verbatim in ≥5 files under `features/profile/**` and `features/categories/hooks/**`. Wrap in a `useAsyncList<T>` hook.

**Remaining `any` to clean up** (see also `src/api/{peliculas,series}/mapper/*.ts`, `src/app/(auth)/register/page.tsx:62`, `src/app/api/reviews/media/[tmdbId]/[itemType]/route.ts:10`, `src/app/api/library/details/route.ts:27`).

## Skills available for this repo

- `.claude/skills/nextjs-best-practices` — App Router patterns cheat sheet.
- `.claude/skills/vercel-react-best-practices` — 57 Vercel Engineering React perf rules with examples.

Prefer these over guessing when touching data fetching, hydration, memoization, or bundle-size sensitive code.
