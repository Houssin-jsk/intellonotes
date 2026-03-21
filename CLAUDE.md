# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Project Overview

IntelloNotes is an e-learning marketplace for Moroccan university students to learn programming languages (49-78 Dh/course). Three roles: **student** (browse, buy, learn), **professor** (publish courses, earn 70% commission), **admin** (review courses, confirm payments). Manual payment via CashPlus/bank transfer. Bilingual: French (default) + Arabic (RTL).

## Tech Stack

- **Next.js 16+ App Router** with TypeScript and Tailwind CSS 4
- **SQLite** via **Drizzle ORM** (better-sqlite3 driver, WAL mode) — local file database
- **Auth.js v5** (next-auth beta): Credentials provider, JWT sessions, bcrypt password hashing
- **next-intl**: i18n with locales `['fr', 'ar']`, default `fr`
- **react-pdf**: in-browser PDF rendering (dynamically imported, ssr: false)
- **@monaco-editor/react**: code editor with syntax highlighting for all languages
- **Pyodide**: Python execution in a Web Worker (lazy-loaded ~10MB); JS execution via `new Function()`; C/Java/SQL are syntax-only (no execution)
- **Vitest**: unit and component tests

## Commands

```bash
npm run dev              # Start dev server
npm run build            # Production build
npm run lint             # ESLint
npx vitest               # Run all tests
npx vitest run <file>    # Run a single test file
npm run db:generate      # Generate Drizzle migrations from schema changes
npm run db:migrate       # Apply migrations to SQLite database
npm run db:seed          # Seed database with dev data (admin, professor, student, courses)
npm run db:reset         # Delete DB + migrate + seed (full reset)
```

## Folder Structure

```
intellonotes/
├── .env.local / .env.example
├── next.config.ts
├── tailwind.config.ts
├── drizzle.config.ts                   # Drizzle ORM config (SQLite dialect)
├── middleware.ts                       # next-intl locale routing only
├── intellonotes.db                     # SQLite database file (gitignored)
├── drizzle/                            # Auto-generated migration SQL files
├── i18n/
│   ├── routing.ts                      # locales: ['fr','ar'], default: 'fr'
│   ├── request.ts                      # getRequestConfig
│   └── navigation.ts                   # createNavigation exports
├── messages/
│   ├── fr.json
│   └── ar.json
├── storage/
│   └── course-pdfs/                    # Local PDF file storage
├── src/
│   ├── app/
│   │   ├── layout.tsx                  # Passthrough only — renders <>{children}</>
│   │   ├── [locale]/
│   │   │   ├── layout.tsx              # Root HTML: lang/dir, fonts, SessionProvider, Header
│   │   │   ├── page.tsx                # Homepage = course catalog
│   │   │   ├── auth/
│   │   │   │   ├── login/page.tsx
│   │   │   │   └── register/page.tsx
│   │   │   ├── courses/
│   │   │   │   └── [courseId]/
│   │   │   │       ├── page.tsx        # Course detail
│   │   │   │       └── learn/page.tsx  # Learning interface
│   │   │   ├── dashboard/page.tsx      # Student dashboard
│   │   │   └── admin/
│   │   │       ├── layout.tsx          # Admin role guard (server-side)
│   │   │       └── payments/page.tsx
│   │   └── api/
│   │       ├── auth/[...nextauth]/route.ts  # Auth.js route handlers
│   │       ├── pdf/[...path]/route.ts       # Protected PDF serving
│   │       └── purchase-status/route.ts     # Polling endpoint for purchase status
│   ├── components/
│   │   ├── ui/                         # Button, Card, Badge, Input, Modal, Spinner, Toast
│   │   ├── layout/                     # Header
│   │   ├── auth/                       # LoginForm, RegisterForm, RoleGuard
│   │   ├── courses/                    # CourseCard, CourseGrid, SearchBar, FilterChips, AxisTOC, PurchaseButton
│   │   ├── learning/                   # PDFViewer, ProgressSidebar, QuizEngine, QuizQuestion, CodePlayground
│   │   ├── dashboard/                  # PurchasedCourseCard, ProgressBar
│   │   └── admin/                      # PaymentQueue, PaymentConfirmCard
│   ├── lib/
│   │   ├── auth.ts                     # Auth.js v5 config (Credentials, JWT, trustHost)
│   │   ├── db/
│   │   │   ├── index.ts                # Drizzle instance (better-sqlite3, WAL, FK ON)
│   │   │   ├── schema.ts              # All 7 table definitions + relations
│   │   │   ├── queries.ts             # Read-only query functions
│   │   │   └── seed.ts                # Dev seed script (bcrypt passwords)
│   │   ├── actions/
│   │   │   ├── auth.ts                 # registerUser server action
│   │   │   ├── purchase.ts             # createPurchase server action
│   │   │   ├── admin.ts                # confirmPurchase, rejectPurchase
│   │   │   └── progress.ts             # submitQuizAnswers, advanceAxis
│   │   ├── utils/                      # cn.ts, commission.ts, quiz-grader.ts
│   │   ├── pyodide/worker.ts           # Web Worker for Python execution
│   │   └── constants.ts                # Axis labels, languages, levels, price range
│   ├── hooks/
│   │   ├── useAuth.ts                  # Wraps useSession() → { user, role, isLoading }
│   │   ├── usePurchasePolling.ts       # Polls /api/purchase-status every 5s
│   │   └── usePyodide.ts              # Lazy-load Pyodide worker
│   └── types/
│       ├── index.ts                    # Drizzle-inferred types (InferSelectModel)
│       ├── next-auth.d.ts              # Augments Session/JWT with id + role
│       └── quiz.ts
```

## Architecture

### Routing & i18n

All pages live under `src/app/[locale]/`. The `middleware.ts` handles **next-intl locale routing only** — `api` is excluded from the matcher so Auth.js routes at `/api/auth/*` work. i18n config lives in `i18n/` (routing, request, navigation). Translations in `messages/fr.json` and `messages/ar.json`.

**Important layout structure:** `src/app/layout.tsx` is a passthrough (`<>{children}</>`). The actual `<html>` and `<body>` are rendered in `src/app/[locale]/layout.tsx` which sets `lang`, `dir`, fonts, and wraps content with `<SessionProvider>` + `<NextIntlClientProvider>`. Never add `<html>`/`<body>` to the root layout — it causes nested `<html>` hydration errors.

For Arabic, `<html dir="rtl">` is set in the locale layout. Use Tailwind logical properties throughout: `ms-`/`me-` (not `ml-`/`mr-`), `ps-`/`pe-`, `text-start`/`text-end`, `start-0`/`end-0`.

### Authentication (Auth.js v5)

- **Config:** `src/lib/auth.ts` — Credentials provider (email + password), JWT session strategy, `trustHost: true`
- **Server-side:** Call `auth()` from `@/lib/auth` to get the session in server components/actions
- **Client-side:** `useSession()` from `next-auth/react` — wrapped by `src/hooks/useAuth.ts` which returns `{ user, role, isLoading }`
- **JWT callbacks:** `id` and `role` are embedded in the JWT on sign-in — no DB round-trip per request
- **Type augmentation:** `src/types/next-auth.d.ts` extends `Session`, `User`, and `JWT` with `id: string` and `role: string`
- **Route handlers:** `src/app/api/auth/[...nextauth]/route.ts` exports Auth.js GET/POST handlers
- **Registration:** `src/lib/actions/auth.ts` — `registerUser` server action (bcrypt 12 rounds, catches unique constraint)
- **Login redirect:** Role-based — admin → `/admin/payments`, professor → `/`, student → `/dashboard`

### The 5-Axis Pedagogical Model

Every course follows 5 mandatory axes: Introduction → Theory → Practice → Synthesis → Final Evaluation. Students progress sequentially — each axis quiz must be passed before the next unlocks. Axis content gating is enforced at the **application layer**.

### Database

**Engine:** SQLite via Drizzle ORM (better-sqlite3, WAL mode, foreign keys ON).

**Schema:** `src/lib/db/schema.ts` — 7 tables: `users`, `courses`, `lessons`, `quizzes`, `purchases`, `progress`, `withdrawals`. The `users` table includes a `password_hash` column (passwords are stored with bcrypt, not in a separate auth service).

**Queries:** `src/lib/db/queries.ts` — read-only functions. Uses `db.select().from().leftJoin().all()` pattern (NOT the Drizzle relational API `db.query.*` — it returns `SQLiteSyncRelationalQuery` which TypeScript doesn't treat as a plain array).

**Mutations:** Server actions in `src/lib/actions/*.ts`.

**Migrations:** Auto-generated by `npm run db:generate` into `drizzle/`. Applied with `npm run db:migrate`. After any schema change: generate → migrate → test.

**Seed:** `src/lib/db/seed.ts` — dev credentials:
- `admin@intellonotes.ma` / `Admin@IntelloNotes2024!`
- `prof.ahmed@intellonotes.ma` / `Prof@IntelloNotes2024!`
- `student@intellonotes.ma` / `Student@IntelloNotes2024!`

Key relationships: `courses.professor_id → users.id`, `lessons.course_id → courses.id` with `axis_number` (1-5), `quizzes.lesson_id → lessons.id`.

### Quiz System

Quiz questions stored as JSON arrays (text column, mode: "json") with three types: `mcq`, `true_false`, `fill_blank`. Grading is **client-side** (`src/lib/utils/quiz-grader.ts`). Scores saved to `progress.quiz_scores` (JSON). Passing threshold: 70% for Axis 5 final evaluation.

### Commission Model

70% professor / 30% platform, calculated via `src/lib/utils/commission.ts` on each confirmed purchase. Purchases use a state machine: `pending → confirmed | rejected`. Admin confirms manually; `usePurchasePolling` hook (5s interval) detects the status change on the student side.

### Code Playground

Monaco editor is dynamically imported (ssr: false). Pyodide runs in a dedicated Web Worker (`src/lib/pyodide/worker.ts`), loaded lazily on first Python execution. The `usePyodide` hook manages worker lifecycle. For JavaScript, execution uses `new Function()` with captured console output. C, Java, and SQL show syntax highlighting only with a disabled Run button.

### PDF Storage

Course PDFs are stored locally in `storage/course-pdfs/` (gitignored). Served via the protected API route `src/app/api/pdf/[...path]/route.ts` which checks authentication and purchase status before returning the file. Upload cap: 20MB.

### Role Guards

- **Server-side:** `auth()` checks in layout files (e.g., `admin/layout.tsx` rejects non-admin users)
- **Client-side:** `RoleGuard` component wraps `useAuth()` hook — redirects if role doesn't match
- **Purchase gating:** Course detail page only shows `PurchaseButton` to students and guests — professors/admins see course info without purchase UI
- Seed data created via `src/lib/db/seed.ts`

## Conventions

### Styling & Layout
- Mobile-first responsive design: grid columns 1 (mobile) → 2 (tablet) → 3 (desktop)
- Always use Tailwind logical properties for RTL support: `ms-`/`me-`, `ps-`/`pe-`, `text-start`/`text-end`, `start-0`/`end-0` — NEVER `ml-`/`mr-`/`pl-`/`pr-`/`left-`/`right-`
- Classname utility: `src/lib/utils/cn.ts` (`clsx` + `tailwind-merge`) — use `cn()` for all conditional classes
- Color palette: use CSS variables defined in `tailwind.config.ts` — primary (purple), secondary (teal), accent (coral), warning (amber)
- Dark mode is NOT in scope for MVP

### Component Patterns
- Heavy client components (PDFViewer, CodePlayground, QuizEngine) must use `next/dynamic` with `ssr: false`
- All components must be typed with explicit Props interfaces — no `any` types
- Use `"use client"` directive only when the component genuinely needs browser APIs, hooks, or event handlers
- Server components are the default — fetch data on the server whenever possible
- Loading states: use Skeleton components, never blank screens
- Error boundaries: wrap each major section (PDF viewer, quiz, code playground) in its own error boundary

### Data Fetching
- Server components use query functions from `src/lib/db/queries.ts` (synchronous, better-sqlite3)
- Mutations go through server actions in `src/lib/actions/*.ts` (all marked `"use server"`)
- Client components read auth state via `useAuth()` hook — never import DB code in client components
- After any mutation (purchase, quiz submit, course status change), revalidate with `router.refresh()` or `revalidatePath()`

### Database Rules
- Types are inferred from Drizzle schema via `InferSelectModel` — defined in `src/types/index.ts`
- After any schema change: `npm run db:generate` → `npm run db:migrate` → test
- Access control is at the **application layer** (server-side `auth()` checks) — there is no RLS
- Use `db.select().from().leftJoin()` for multi-table queries — avoid `db.query.*` relational API (returns `SQLiteSyncRelationalQuery`, not a plain array)

### Business Logic Rules
- Course prices must avoid the digit 9 (use 49, 56, 68, 78 Dh)
- Commission split: always compute via `commission.ts` — never hardcode 0.7/0.3 in components
- PDF uploads capped at 20MB; stored in `storage/course-pdfs/`, served via protected `/api/pdf/[...path]` route
- Quiz passing threshold: 70% for Axis 5, no minimum for Axes 1-4 (but all questions must be answered)
- Axis progression is strictly sequential — never allow skipping axes even via URL manipulation
- Purchase states: `pending` → `confirmed` | `rejected` — no other transitions allowed

### File & Naming Conventions
- Files: kebab-case (`course-card.tsx`, `quiz-grader.ts`)
- Components: PascalCase (`CourseCard`, `QuizEngine`)
- Hooks: camelCase with `use` prefix (`useAuth`, `usePyodide`)
- Types: PascalCase, suffix with purpose (`CourseWithProfessor`, `QuizQuestion`, `PurchaseStatus`)
- Constants: UPPER_SNAKE_CASE for enum-like values (`AXIS_LABELS`, `SUPPORTED_LANGUAGES`)
- Drizzle migrations are auto-generated in `drizzle/` — do not edit by hand

### Testing
- Write tests for all utility functions (`commission.ts`, `quiz-grader.ts`)
- Write tests for hooks that contain business logic
- Component tests use `@testing-library/react`
- No tests needed for pure layout/UI components at MVP stage

## Common Pitfalls — Read Before Coding

1. **react-pdf SSR crash:** react-pdf uses browser APIs — always dynamically import with `ssr: false`. It will crash the build otherwise.
2. **Monaco Editor bundle size:** Monaco is ~2MB. Use `@monaco-editor/react` (not raw `monaco-editor`) and dynamically import it. Never import at the top level of a page.
3. **Pyodide initial load:** Pyodide is ~10MB on first load. Show a clear loading indicator. Never auto-load — only initialize when the student clicks "Run" for the first time.
4. **RTL layout breaks:** If something looks wrong in Arabic, check for hardcoded `left`/`right`/`ml-`/`mr-` — replace with logical properties.
5. **Root layout must be passthrough:** `src/app/layout.tsx` must return `<>{children}</>` only. The `<html>` and `<body>` elements belong in `src/app/[locale]/layout.tsx`. Having both render `<html>/<body>` causes a nested `<html>` hydration error.
6. **Auth.js `trustHost`:** `src/lib/auth.ts` must include `trustHost: true` — without it Auth.js rejects sign-in requests when the host doesn't exactly match `AUTH_URL`.
7. **better-sqlite3 on Windows:** Requires native build tools. If `npm install` fails, install Visual Studio Build Tools (C++ workload) or use `npm install --build-from-source`.
8. **Drizzle relational API type issue:** `db.query.*.findMany()` returns `SQLiteSyncRelationalQuery<T[]>` which TypeScript doesn't treat as an array. Use `db.select().from().leftJoin().all()` instead and map the flat rows manually.
9. **Serverless deployment:** better-sqlite3 does NOT work on Vercel serverless. For Vercel, swap to `@libsql/client` (Turso) — one-file change in `src/lib/db/index.ts`, same Drizzle schema.

## Environment Variables

```
AUTH_SECRET=                # Generated with: openssl rand -base64 32
AUTH_URL=                   # http://localhost:3000 in dev, production URL in prod
NEXT_PUBLIC_SITE_URL=       # Same as AUTH_URL
DATABASE_PATH=              # Path to SQLite file (default: intellonotes.db)
```

## Skills
See `.claude/skills/` for detailed implementation guides on recurring tasks.
