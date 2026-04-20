# Pages Inventory

This inventory is based on the **actual filesystem routes** under `src/app/` (Next.js App Router). It includes:

- Pages/screens (`page.tsx`)
- Layouts (`layout.tsx`)
- Loading UIs (`loading.tsx`)
- Error and not-found boundaries (`error.tsx`, `not-found.tsx`)
- API route handlers (`route.ts`)

---

# Routing Model and Locale Behavior

- **App Router** is used (`src/app/**`).
- UI routing is **locale-prefixed** via the dynamic segment `src/app/[locale]/...`.
- `middleware.ts` installs `next-intl` middleware using `i18n/routing.ts`:
  - locales: `fr`, `ar`
  - default locale: `fr`
- Middleware matcher excludes `api/*`, Next internals, and static assets; therefore:
  - UI pages are accessed as `/<locale>/...`
  - API routes stay under `/api/...` (not locale-prefixed)

---

# Layouts / Boundaries / Special App Files

## Root layout

- **Name**: Root layout (passthrough)
- **Route/path**: applies to all routes
- **File**: `src/app/layout.tsx`
- **Purpose**: returns `{children}` only; comment explains avoiding nested `<html>/<body>` because the locale layout renders the HTML shell.
- **Implementation status**: implemented
- **Notes/issues**: relies on `middleware.ts` to route requests into `src/app/[locale]/...` so the locale layout becomes the outer shell.

## Locale layout

- **Name**: Locale HTML shell
- **Route/path**: `/<locale>/*`
- **File**: `src/app/[locale]/layout.tsx`
- **Related layout**: `src/app/layout.tsx`
- **Locale behavior**:
  - validates locale against `i18n/routing.ts`
  - sets `dir="rtl"` when locale is `ar`
  - calls `setRequestLocale(locale)`
  - loads messages via `getMessages()` and provides `NextIntlClientProvider`
- **Main sections/components rendered**:
  - `<SessionProvider>` (NextAuth)
  - `<NextIntlClientProvider>`
  - `<Header />` (`src/components/layout/Header.tsx`)
  - `{children}`
- **SEO/meta handling**: `export const metadata` with title/description
- **Implementation status**: implemented

## Admin layout (role guard + subnav)

- **Name**: Admin layout
- **Route/path**: `/<locale>/admin/*`
- **File**: `src/app/[locale]/admin/layout.tsx`
- **Related layout**: `src/app/[locale]/layout.tsx`
- **Public/protected**: protected (server-side check)
- **Access control**:
  - uses `auth()`; redirects to `/<locale>/auth/login` if no session
  - redirects to `/<locale>` if role is not `admin`
- **Main sections/components rendered**:
  - `<AdminSubNav />` (`src/components/admin/AdminSubNav.tsx`)
  - `{children}`
- **Implementation status**: implemented

## Professor layout (role guard)

- **Name**: Professor layout
- **Route/path**: `/<locale>/professor/*`
- **File**: `src/app/[locale]/professor/layout.tsx`
- **Related layout**: `src/app/[locale]/layout.tsx`
- **Public/protected**: protected (server-side check)
- **Access control**:
  - uses `auth()`; redirects to `/<locale>/auth/login` if no session
  - redirects to `/<locale>` if role is not `professor`
- **Implementation status**: implemented

## Locale error boundary

- **Name**: Locale error UI
- **Route/path**: `/<locale>/*` (error boundary for locale subtree)
- **File**: `src/app/[locale]/error.tsx`
- **Related layout**: `src/app/[locale]/layout.tsx`
- **Purpose**: renders a retry UI using `Button` and translations (`common.error`, `common.retry`).
- **Implementation status**: implemented

## Locale not-found boundary

- **Name**: Locale 404 page
- **Route/path**: `/<locale>/*` (not-found UI)
- **File**: `src/app/[locale]/not-found.tsx`
- **Related layout**: `src/app/[locale]/layout.tsx`
- **Purpose**: renders “404” + localized message and a link back home.
- **Implementation status**: implemented

## Global CSS

- **Name**: Global styling entry
- **File**: `src/app/globals.css`
- **Purpose**: Tailwind v4 import and design token definitions; includes RTL text alignment rule and scrollbar hiding utilities.
- **Implementation status**: implemented

---

# UI Pages / Screens (all `page.tsx`)

For each page below: **Page name, route, file, layout, locale behavior, purpose, access, UI/components, data/actions, hooks/state, SEO/meta, implementation status, notes/issues**.

## Home / Catalog

- **Page name**: Home (Course catalog)
- **Route/path**: `/<locale>`
- **File**: `src/app/[locale]/page.tsx`
- **Related layout**: `src/app/[locale]/layout.tsx`
- **Locale behavior**: calls `setRequestLocale(locale)`; translations via `getTranslations("catalog")`.
- **Purpose**: list approved courses; allow search and filtering.
- **Public/protected/unclear**: public
- **Main sections/components rendered**:
  - `<SearchBar initialQ={q} />` (`src/components/courses/SearchBar.tsx`)
  - `<FilterChips language={language} level={level} />` (`src/components/courses/FilterChips.tsx`)
  - `<CourseGrid q={q} language={language} level={level} />` inside `<Suspense>` (`src/components/courses/CourseGrid.tsx`)
  - `<CourseGridSkeleton />` fallback (`src/components/courses/CourseCardSkeleton.tsx`)
- **Data fetched or displayed**:
  - `CourseGrid` fetches DB rows via `getApprovedCourses({ q, language, level })` (`src/lib/db/queries.ts`).
- **Forms/actions/buttons available**:
  - Search input (debounced query string update)
  - Filter chip buttons (query string update)
- **Server actions / API calls / DB usage**:
  - server-side DB read through `CourseGrid` (Drizzle+SQLite).
- **Hooks / state / stores used** (in child components):
  - `SearchBar`: `useState`, `useEffect` debounce, `useRef`, `useSearchParams`, locale-aware `useRouter`/`usePathname`.
  - `FilterChips`: `useSearchParams`, locale-aware `useRouter`/`usePathname`.
- **SEO/meta handling**:
  - `generateMetadata` uses `getTranslations({ locale, namespace: "HomePage" })` and sets `title`/`description`.
- **Current implementation status**: implemented
- **Notes/issues**:
  - Filtering parameters are stringly-typed and passed into DB query helper which casts to enum types (`src/lib/db/queries.ts`).

## Course detail

- **Page name**: Course detail
- **Route/path**: `/<locale>/courses/:courseId`
- **File**: `src/app/[locale]/courses/[courseId]/page.tsx`
- **Related layout**: `src/app/[locale]/layout.tsx`
- **Locale behavior**: calls `setRequestLocale(locale)`; uses `getTranslations("course")`, `getTranslations("catalog")`, `getTranslations("common")`.
- **Purpose**: display course info and allow purchase/continue-learning; show axis TOC and preview.
- **Public/protected/unclear**: public (read), but purchase/continue actions depend on session role and purchase status.
- **Main sections/components rendered**:
  - back link (`Link` from `@i18n/navigation`)
  - course badges (`Badge`)
  - professor card (conditional)
  - objectives/prerequisites lists (conditional)
  - `<AxisTOC lessons={lessons} isPurchased={isPurchased} />` (`src/components/courses/AxisTOC.tsx`)
  - `<PurchaseButton ... />` (`src/components/courses/PurchaseButton.tsx`) in sidebar for students/guests
- **Data fetched or displayed**:
  - `auth()` session (`src/lib/auth.ts`)
  - `getCourseDetail(courseId)` and `getCourseLessons(courseId)` (`src/lib/db/queries.ts`)
  - `getPurchaseStatus(userId, courseId)` for logged-in students (`src/lib/db/queries.ts`)
- **Forms/actions/buttons available**:
  - Purchase button opens modal with payment instructions and calls server action `createPurchase(...)` when “I have paid”.
  - If confirmed, “Continue learning” navigates to `/<locale>/courses/:courseId/learn`.
- **Server actions / API calls / DB usage / services used**:
  - Reads from DB via `src/lib/db/queries.ts`
  - Purchase mutation via server action `src/lib/actions/purchase.ts`
  - Purchase polling hook exists (see notes)
- **Hooks / state / stores used** (in child components):
  - `AxisTOC`: `useState` accordion; uses translations `course.axisNames.*`.
  - `PurchaseButton`: `useState`, `useTransition`, `useCallback`, `usePurchasePolling`, locale-aware router.
- **SEO/meta handling**:
  - `generateMetadata` sets title/description from `getCourseDetail(courseId)` (fallback “IntelloNotes”).
- **Current implementation status**: implemented (with partial purchase polling)
- **Notes / issues**:
  - Purchase polling depends on having a `purchaseId`, but the page only loads purchase `status` (`getPurchaseStatus` returns status only). `createPurchase` does not return an id. As implemented, `usePurchasePolling` cannot be activated by this page.

## Learning (course consumption)

- **Page name**: Learning page
- **Route/path**: `/<locale>/courses/:courseId/learn`
- **File**: `src/app/[locale]/courses/[courseId]/learn/page.tsx`
- **Related layout**: `src/app/[locale]/layout.tsx`
- **Locale behavior**: calls `setRequestLocale(locale)`.
- **Purpose**: render the learning experience (PDF/lessons/quiz/playground) with axis progression and persistent progress.
- **Public/protected/unclear**: protected
- **Access control**:
  - requires authenticated session (`auth()`); redirects to `/<locale>/auth/login`
  - requires confirmed purchase (`getPurchaseStatus(...).status === "confirmed"`); otherwise redirects to course detail
- **Main sections/components rendered**:
  - `<LearningLayout ... />` (`src/components/learning/LearningLayout.tsx`)
- **Data fetched or displayed**:
  - course metadata for learning (`getCourseForLearn(courseId)`)
  - lessons with content (`getCourseLessonsWithContent(courseId)`)
  - quizzes for lessons (`getQuizzesForLessons(lessonIds)`)
  - progress record created/updated (`upsertProgress(userId, courseId)`)
  - PDF URL is constructed as `/api/pdf/<pdf_url>` if present
- **Forms/actions/buttons available**:
  - quiz submission button(s) inside `QuizEngine`
  - axis navigation buttons in `ProgressSidebar`
  - code run button in `CodePlayground` (when executable language)
- **Server actions / API calls / DB usage / services used**:
  - DB reads from `src/lib/db/queries.ts`
  - `saveQuizResult` server action (`src/lib/actions/progress.ts`) persists quiz outcomes and progress
  - PDF content is fetched via `/api/pdf/...` and rendered by react-pdf
  - Python execution uses `/pyodide-worker.js` worker; that worker downloads Pyodide from CDN
- **Hooks / state / stores used** (in main client layout):
  - `LearningLayout`: `useState`, `useEffect`, `useCallback`, `useRef`; dynamic imports of `PDFViewer` and `CodePlayground` with `ssr:false`
  - `QuizEngine`: `useState` answer/result state; uses `gradeQuiz(...)`
  - `CodePlayground`: `useState`, `useEffect` localStorage persistence; uses `usePyodide()`
- **SEO/meta handling**:
  - `generateMetadata` sets title from `getCourseForLearn(courseId)`
- **Current implementation status**: implemented
- **Notes / issues**:
  - PDF and Pyodide depend on external CDNs at runtime.

## Login

- **Page name**: Login
- **Route/path**: `/<locale>/auth/login`
- **File**: `src/app/[locale]/auth/login/page.tsx`
- **Related layout**: `src/app/[locale]/layout.tsx`
- **Locale behavior**: calls `setRequestLocale(locale)`; uses `useTranslations("auth")` on client.
- **Purpose**: credentials login.
- **Public/protected/unclear**: public
- **Main sections/components rendered**:
  - `<LoginForm />` (`src/components/auth/LoginForm.tsx`)
- **Data fetched or displayed**:
  - no server DB fetch; uses NextAuth client sign-in.
- **Forms/actions/buttons available**:
  - email/password form; submit triggers `signIn("credentials", ...)`
  - link to register
- **Server actions / API calls / DB usage / services used**:
  - NextAuth credential login via `/api/auth/*` (NextAuth handlers)
  - After sign-in, client fetches `/api/auth/session` to read role and redirect accordingly.
- **Hooks / state / stores used**:
  - `LoginForm`: `useState` for inputs/loading/error; `useRouter` from `@i18n/navigation`
- **SEO/meta handling**:
  - `generateMetadata` sets title using `getTranslations({ locale, namespace: "auth" })`.
- **Current implementation status**: implemented
- **Notes / issues**:
  - Redirect paths in `LoginForm` use non-locale-prefixed URLs (e.g. `/admin/payments`, `/dashboard`); these go through locale middleware and should become `/<locale>/...` depending on next-intl configuration behavior.

## Register

- **Page name**: Register
- **Route/path**: `/<locale>/auth/register`
- **File**: `src/app/[locale]/auth/register/page.tsx`
- **Related layout**: `src/app/[locale]/layout.tsx`
- **Locale behavior**: calls `setRequestLocale(locale)`; uses `useTranslations("auth")` on client.
- **Purpose**: create a new user (student or professor).
- **Public/protected/unclear**: public
- **Main sections/components rendered**:
  - `<RegisterForm />` (`src/components/auth/RegisterForm.tsx`)
- **Data fetched or displayed**:
  - writes to DB via server action `registerUser(...)` (SQLite users table).
- **Forms/actions/buttons available**:
  - name/email/password inputs
  - role radio selection: student vs professor
  - submit triggers server action + auto sign-in
- **Server actions / API calls / DB usage / services used**:
  - `registerUser(...)` (`src/lib/actions/auth.ts`) inserts into SQLite `users`
  - `signIn("credentials")` after registration
- **Hooks / state / stores used**:
  - `RegisterForm`: `useState`, locale-aware router
- **SEO/meta handling**:
  - `generateMetadata` sets title using `getTranslations({ locale, namespace: "auth" })`.
- **Current implementation status**: implemented
- **Notes / issues**:
  - Registration uses UUIDs generated in server action (`uuidv4()`).

## Dashboard (student)

- **Page name**: Student dashboard
- **Route/path**: `/<locale>/dashboard`
- **File**: `src/app/[locale]/dashboard/page.tsx`
- **Related layout**: `src/app/[locale]/layout.tsx`
- **Locale behavior**: calls `setRequestLocale(locale)`; translations via `getTranslations({ locale, namespace: "dashboard" })`.
- **Purpose**: show purchased courses and progress; CTA into learning.
- **Public/protected/unclear**: protected
- **Access control**:
  - requires session; otherwise redirects to `/<locale>/auth/login`
  - requires role `student`; otherwise redirects to `/<locale>`
- **Main sections/components rendered**:
  - Purchased course cards: `<PurchasedCourseCard />` (`src/components/dashboard/PurchasedCourseCard.tsx`)
  - empty state link back to catalog
- **Data fetched or displayed**:
  - purchases: `getStudentPurchases(userId)`
  - progress: `getStudentProgress(userId)`
  - merges/sorts by `last_accessed_at`
- **Forms/actions/buttons available**:
  - CTA link to `/<locale>/courses/:courseId/learn`
- **Server actions / API calls / DB usage / services used**:
  - DB reads via `src/lib/db/queries.ts`
- **Hooks / state / stores used**:
  - page itself is server-side; interactive behavior is in child components
  - `PurchasedCourseCard` uses `useTranslations("dashboard")` and renders `ProgressBar`
- **SEO/meta handling**:
  - `generateMetadata` sets title from `dashboard.meta.title`.
- **Current implementation status**: implemented

### Dashboard loading UI

- **Page name**: Dashboard loading skeleton
- **Route/path**: `/<locale>/dashboard` (loading state)
- **File**: `src/app/[locale]/dashboard/loading.tsx`
- **Related layout**: `src/app/[locale]/layout.tsx`
- **Purpose**: skeleton UI while dashboard data loads.
- **Main components**: `DashboardGridSkeleton` (`src/components/dashboard/DashboardCardSkeleton.tsx`)
- **Implementation status**: implemented

## Profile (all authenticated roles)

- **Page name**: Profile
- **Route/path**: `/<locale>/profile`
- **File**: `src/app/[locale]/profile/page.tsx`
- **Related layout**: `src/app/[locale]/layout.tsx`
- **Locale behavior**: calls `setRequestLocale(locale)`.
- **Purpose**: show account info and update profile fields.
- **Public/protected/unclear**: protected
- **Access control**:
  - requires session; redirects to `/<locale>/auth/login`
- **Main sections/components rendered**:
  - `<ProfileForm ... />` (`src/components/profile/ProfileForm.tsx`)
- **Data fetched or displayed**:
  - user row via `getUserById(session.user.id)` (`src/lib/db/queries.ts`)
- **Forms/actions/buttons available**:
  - update form calls server action `updateProfile(...)` (`src/lib/actions/profile.ts`)
- **Hooks / state / stores used**:
  - `ProfileForm`: `useState`, locale-aware router, success/error state
- **SEO/meta handling**:
  - `generateMetadata` uses `getTranslations({ locale, namespace: "profile" })` and sets title.
- **Current implementation status**: implemented
- **Notes / issues**:
  - `ProfilePage` calls `getUserById(...)` synchronously without `await` (DB is sync); redirects if user not found.

---

# Professor Area Pages

All professor pages are under `src/app/[locale]/professor/*` and are protected by `src/app/[locale]/professor/layout.tsx`.

## Professor courses list

- **Page name**: Professor courses
- **Route/path**: `/<locale>/professor/courses`
- **File**: `src/app/[locale]/professor/courses/page.tsx`
- **Related layout**: `src/app/[locale]/professor/layout.tsx` → `src/app/[locale]/layout.tsx`
- **Locale behavior**: calls `setRequestLocale(locale)`.
- **Purpose**: list professor’s courses and provide entry point to create/edit/submit.
- **Public/protected/unclear**: protected (professor only)
- **Main sections/components rendered**:
  - `<ProfessorCourseList courses={courses} />` (`src/components/professor/ProfessorCourseList.tsx`)
  - `<EmptyCoursesState />` when no courses (`src/components/professor/EmptyCoursesState.tsx`)
  - “Create course” link to `/professor/courses/new`
- **Data fetched or displayed**:
  - `getProfessorCourses(session.user.id)` (`src/lib/db/queries.ts`)
- **Forms/actions/buttons available** (via cards/components):
  - edit link to `/professor/courses/:courseId` (only for draft/rejected)
  - submit for review button (`submitForReview` server action)
  - delete draft button (`deleteDraftCourse` server action)
- **Hooks / state / stores used**:
  - `ProfessorCourseCard` (client) maintains loading/modal state for submit/delete
- **SEO/meta handling**:
  - `generateMetadata` uses `getTranslations({ locale, namespace: "professor.meta" })` and sets title.
- **Current implementation status**: implemented

## Professor create course

- **Page name**: New course
- **Route/path**: `/<locale>/professor/courses/new`
- **File**: `src/app/[locale]/professor/courses/new/page.tsx`
- **Related layout**: `src/app/[locale]/professor/layout.tsx`
- **Locale behavior**: calls `setRequestLocale(locale)`.
- **Purpose**: render the course creation form.
- **Public/protected/unclear**: protected (professor only)
- **Main sections/components rendered**:
  - `<CourseForm />` (`src/components/professor/CourseForm.tsx`)
- **Forms/actions/buttons available**:
  - create course form calls server action `createCourse(...)` (`src/lib/actions/course.ts`)
- **Hooks / state / stores used**:
  - `CourseForm`: `useState` + client-side validation + locale-aware router
- **SEO/meta handling**:
  - `generateMetadata` uses `professor.meta.createTitle`.
- **Current implementation status**: implemented

## Professor course editor

- **Page name**: Course editor
- **Route/path**: `/<locale>/professor/courses/:courseId`
- **File**: `src/app/[locale]/professor/courses/[courseId]/page.tsx`
- **Related layout**: `src/app/[locale]/professor/layout.tsx`
- **Locale behavior**: calls `setRequestLocale(locale)` and uses translations from `professor.courseEditor`, `course`, `common`.
- **Purpose**: edit course content (PDF + 5 axis lesson+quiz) and submit for review.
- **Public/protected/unclear**: protected (professor only)
- **Access control (additional to layout)**:
  - redirects to `/<locale>/professor/courses` if course not found or status not `draft`/`rejected`
- **Main sections/components rendered**:
  - `<CourseEditor course=... initialAxisData=... />` (`src/components/professor/CourseEditor.tsx`)
  - rejection reason callout (when rejected)
- **Data fetched or displayed**:
  - `getProfessorCourseById(courseId, session.user.id)` (`src/lib/db/queries.ts`)
  - `getCourseContentForEditor(courseId)` (`src/lib/db/queries.ts`)
  - axis name generation uses i18n keys `course.axis` and `course.axisNames.*` with a static fallback map for FR.
- **Forms/actions/buttons available** (in child components):
  - PDF upload/remove via `/api/upload-pdf` (POST/DELETE)
  - per-axis save via server action `saveAxisContent(...)` (`src/lib/actions/course-content.ts`)
  - submit-for-review via server action `submitForReview(...)` (`src/lib/actions/course.ts`)
- **Hooks / state / stores used**:
  - `CourseEditor`: manages expanded axis and filled-state map; uses `useState`
  - `AxisEditor`: accordion, lesson/quiz state, error/success state
  - `PdfUploader`: drag/drop/upload/delete state
- **SEO/meta handling**:
  - `generateMetadata` uses `professor.meta.editTitle`.
- **Current implementation status**: implemented
- **Notes / issues**:
  - PDF is stored on local disk under `storage/course-pdfs/` via API route.

## Professor earnings

- **Page name**: Professor earnings
- **Route/path**: `/<locale>/professor/earnings`
- **File**: `src/app/[locale]/professor/earnings/page.tsx`
- **Related layout**: `src/app/[locale]/professor/layout.tsx`
- **Locale behavior**: calls `setRequestLocale(locale)`.
- **Purpose**: show earnings summary, transactions, withdrawal history, and allow requesting withdrawals.
- **Public/protected/unclear**: protected (professor only)
- **Main sections/components rendered**:
  - summary cards (rendered in page)
  - `<WithdrawalForm availableBalance=... />` (`src/components/professor/WithdrawalForm.tsx`)
  - transactions table and withdrawal history tables (rendered in page)
- **Data fetched or displayed**:
  - `getProfessorEarnings(...)`, `getProfessorTransactions(...)`, `getProfessorWithdrawals(...)` (`src/lib/db/queries.ts`)
- **Forms/actions/buttons available**:
  - withdrawal request form calls server action `requestWithdrawal(amount, locale)` (`src/lib/actions/withdrawal.ts`)
- **Hooks / state / stores used**:
  - `WithdrawalForm`: `useState` amount/error/success/loading; locale-aware router
- **SEO/meta handling**:
  - `generateMetadata` uses `professor.earnings.metaTitle`.
- **Current implementation status**: implemented

---

# Admin Area Pages

All admin pages are under `src/app/[locale]/admin/*` and are protected by `src/app/[locale]/admin/layout.tsx`.

## Admin index redirect

- **Page name**: Admin index
- **Route/path**: `/<locale>/admin`
- **File**: `src/app/[locale]/admin/page.tsx`
- **Related layout**: `src/app/[locale]/admin/layout.tsx`
- **Purpose**: redirects to `/<locale>/admin/courses`.
- **Public/protected/unclear**: protected (admin only)
- **Implementation status**: implemented (redirect-only)

## Admin course queue

- **Page name**: Admin courses queue
- **Route/path**: `/<locale>/admin/courses`
- **File**: `src/app/[locale]/admin/courses/page.tsx`
- **Related layout**: `src/app/[locale]/admin/layout.tsx`
- **Locale behavior**: calls `setRequestLocale(locale)`.
- **Purpose**: show all non-draft courses for review/monitoring, with client-side status filtering.
- **Public/protected/unclear**: protected (admin only)
- **Main sections/components rendered**:
  - `<CourseReviewQueue courses={rows} />` (`src/components/admin/CourseReviewQueue.tsx`)
- **Data fetched or displayed**:
  - `getCoursesForAdmin()` (`src/lib/db/queries.ts`)
- **Forms/actions/buttons available**:
  - review link to `/admin/courses/:courseId`
  - quick approve button (only for pending) in `CourseReviewCard`
- **Hooks / state / stores used**:
  - `CourseReviewQueue`:
    - `useState` for active status filter (default `"pending"`)
    - `useEffect` polling refresh every 15s via `router.refresh()`
- **SEO/meta handling**:
  - `generateMetadata` uses `admin.meta.title`.
- **Current implementation status**: implemented

## Admin course review detail

- **Page name**: Admin course review
- **Route/path**: `/<locale>/admin/courses/:courseId`
- **File**: `src/app/[locale]/admin/courses/[courseId]/page.tsx`
- **Related layout**: `src/app/[locale]/admin/layout.tsx`
- **Locale behavior**: calls `setRequestLocale(locale)`.
- **Purpose**: review a single course (metadata, description, objectives/prerequisites, PDF link, lesson content, quiz preview) and take actions.
- **Public/protected/unclear**: protected (admin only)
- **Main sections/components rendered**:
  - `<QuizPreview questions=... />` (`src/components/admin/QuizPreview.tsx`)
  - `<CourseReviewActions courseId status />` (`src/components/admin/CourseReviewActions.tsx`)
- **Data fetched or displayed**:
  - `getAdminCourseDetail(courseId)` (`src/lib/db/queries.ts`)
  - `getCourseContentForEditor(courseId)` (`src/lib/db/queries.ts`) for lessons/quizzes
- **Forms/actions/buttons available**:
  - approve button (`approveCourse` server action)
  - reject flow with modal and reason textarea (`rejectCourse` server action)
  - suspend flow with confirmation modal (`suspendCourse` server action)
- **Hooks / state / stores used**:
  - `CourseReviewActions` uses `useState` for modal open states, loading states, and reason/error strings; uses locale-aware router.
- **SEO/meta handling**:
  - `generateMetadata` uses `admin.meta.title`.
- **Current implementation status**: implemented

## Admin payments queue

- **Page name**: Admin payments
- **Route/path**: `/<locale>/admin/payments`
- **File**: `src/app/[locale]/admin/payments/page.tsx`
- **Related layout**: `src/app/[locale]/admin/layout.tsx`
- **Locale behavior**: calls `setRequestLocale(locale)`.
- **Purpose**: list pending purchases and allow confirm/reject.
- **Public/protected/unclear**: protected (admin only)
- **Main sections/components rendered**:
  - `<PaymentQueue purchases={...} />` (`src/components/admin/PaymentQueue.tsx`)
  - each item: `<PaymentConfirmCard />` (`src/components/admin/PaymentConfirmCard.tsx`)
- **Data fetched or displayed**:
  - `getPendingPurchases()` (`src/lib/db/queries.ts`)
- **Forms/actions/buttons available**:
  - confirm and reject buttons per purchase:
    - `confirmPurchase(purchaseId, locale)` server action
    - `rejectPurchase(purchaseId, locale)` server action
- **Hooks / state / stores used**:
  - `PaymentQueue`: `useEffect` polling every 10s via `router.refresh()`
  - `PaymentConfirmCard`: `useState` loading flags
- **SEO/meta handling**:
  - `generateMetadata` uses `admin.payments.title`.
- **Current implementation status**: implemented

### Admin payments loading UI

- **Page name**: Admin payments loading skeleton
- **Route/path**: `/<locale>/admin/payments` (loading state)
- **File**: `src/app/[locale]/admin/payments/loading.tsx`
- **Implementation status**: implemented

## Admin withdrawals queue

- **Page name**: Admin withdrawals
- **Route/path**: `/<locale>/admin/withdrawals`
- **File**: `src/app/[locale]/admin/withdrawals/page.tsx`
- **Related layout**: `src/app/[locale]/admin/layout.tsx`
- **Locale behavior**: calls `setRequestLocale(locale)`.
- **Purpose**: list pending withdrawal requests; process or reject them.
- **Public/protected/unclear**: protected (admin only)
- **Main sections/components rendered**:
  - `<WithdrawalQueue withdrawals={...} />` (`src/components/admin/WithdrawalQueue.tsx`)
- **Data fetched or displayed**:
  - `getPendingWithdrawals()` (`src/lib/db/queries.ts`)
- **Forms/actions/buttons available**:
  - confirm/process button calls `processWithdrawal(id, locale)` server action
  - reject button calls `rejectWithdrawal(id, locale)` server action
- **Hooks / state / stores used**:
  - `WithdrawalQueue`: `useState` for processing/rejecting row ids; locale-aware router refresh
- **SEO/meta handling**:
  - `generateMetadata` uses `admin.meta.title`.
- **Current implementation status**: implemented

---

# API Routes (`src/app/api/**/route.ts`)

API routes are not locale-prefixed (excluded from `middleware.ts` matcher).

## NextAuth handlers

- **Route/path**: `/api/auth/[...nextauth]`
- **File**: `src/app/api/auth/[...nextauth]/route.ts`
- **Purpose**: exposes NextAuth GET/POST handlers from `src/lib/auth.ts`.
- **Public/protected/unclear**: used by auth system; access is controlled by NextAuth itself.
- **DB/services used**: credential authorize calls `getUserByEmail(...)` and bcrypt compare in `src/lib/auth.ts`.
- **Implementation status**: implemented

## Purchase status

- **Route/path**: `/api/purchase-status?id=:purchaseId`
- **File**: `src/app/api/purchase-status/route.ts`
- **Purpose**: returns `{ status }` for a purchase row id.
- **Public/protected/unclear**: protected (requires `auth()` session)
- **DB/services used**: `getPurchaseById(purchaseId)` (`src/lib/db/queries.ts`)
- **Implementation status**: implemented
- **Notes/issues**: intended to support polling (`src/hooks/usePurchasePolling.ts`), but the UI does not currently surface a `purchaseId` in the course detail page flow.

## Upload/delete PDF

- **Route/path**: `/api/upload-pdf`
- **File**: `src/app/api/upload-pdf/route.ts`
- **Methods**: `POST` (upload), `DELETE` (remove)
- **Purpose**: store/remove a course PDF on local disk and update `courses.pdf_url`.
- **Public/protected/unclear**: protected (requires `auth()` session and role `professor`)
- **Important validations**:
  - accepts only `application/pdf`
  - max size 20MB
  - verifies professor owns course and course status is `draft` or `rejected`
- **DB/services used**:
  - reads course row via Drizzle query
  - updates `courses.pdf_url`
  - writes/removes files under `storage/course-pdfs/`
- **Implementation status**: implemented

## Serve PDF (authorized streaming)

- **Route/path**: `/api/pdf/[...path]`
- **File**: `src/app/api/pdf/[...path]/route.ts`
- **Purpose**: stream PDF bytes from `storage/course-pdfs/` after role-based authorization checks.
- **Public/protected/unclear**: protected (requires `auth()` session)
- **Authorization rules** (as implemented):
  - `admin`: always allowed
  - `professor`: only if professor owns the course matching that `pdf_url`
  - `student`: only if there is a confirmed purchase for that course
- **DB/services used**: Drizzle queries against `courses` and `purchases`; filesystem read.
- **Implementation status**: implemented

---

# Route Groups / Additional Notes

- **Route groups** (e.g. `(group)` folders): none present under `src/app/`.
- **Dynamic segments present**:
  - `[locale]` (all UI routes)
  - `[courseId]` (course detail, learn, professor editor, admin review)
  - `[...nextauth]` (NextAuth API)
  - `[...path]` (PDF API)

---

# Pages Summary

- **Total UI pages detected (`page.tsx`)**: 16
- **Total API routes detected (`route.ts`)**: 4
- **Total pages/routes detected (UI + API)**: 20
- **Total layouts detected (`layout.tsx`)**: 4
- **Total dynamic route definitions detected (folders with `[]` / `[... ]`)**: 6
  - `src/app/[locale]/`
  - `src/app/[locale]/courses/[courseId]/`
  - `src/app/[locale]/professor/courses/[courseId]/`
  - `src/app/[locale]/admin/courses/[courseId]/`
  - `src/app/api/auth/[...nextauth]/`
  - `src/app/api/pdf/[...path]/`
- **Routes referenced in code but missing physically**:
  - Non-locale-prefixed UI paths are referenced in several client components (e.g. `/auth/login`, `/auth/register`, `/dashboard`, `/profile`, `/admin/*`, `/professor/*`, `/courses/*`), but there are **no corresponding non-locale `src/app/...` pages**. These paths rely on `middleware.ts` (next-intl) to route users to `/<locale>/...` equivalents.
