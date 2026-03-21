# IntelloNotes — Debug Prompt for Claude Code

Read CLAUDE.md and all skills in .claude/skills/ before doing anything.

## The problem

intercept-console-error.ts:42 A tree hydrated but some attributes of the server rendered HTML didn't match the client properties. This won't be patched up. This can happen if a SSR-ed Client Component used:

- A server/client branch `if (typeof window !== 'undefined')`.
- Variable input such as `Date.now()` or `Math.random()` which changes each time it's called.
- Date formatting in a user's locale which doesn't match the server.
- External changing data without sending a snapshot of it along with the HTML.
- Invalid HTML tag nesting.

It can also happen if the client has a browser extension installed which messes with the HTML before React loaded.

https://react.dev/link/hydration-mismatch

  ...
    <HotReload globalError={[...]} webSocket={WebSocket} staticIndicatorState={{pathname:null, ...}}>
      <AppDevOverlayErrorBoundary globalError={[...]}>
        <ReplaySsrOnlyErrors>
        <DevRootHTTPAccessFallbackBoundary>
          <HTTPAccessFallbackBoundary notFound={<NotAllowedRootHTTPFallbackError>}>
            <HTTPAccessFallbackErrorBoundary pathname="/fr" notFound={<NotAllowedRootHTTPFallbackError>} ...>
              <RedirectBoundary>
                <RedirectErrorBoundary router={{...}}>
                  <Head>
                  <__next_root_layout_boundary__>
                    <SegmentViewNode type="layout" pagePath="layout.tsx">
                      <SegmentTrieNode>
                      <RootLayout>
                        <html
-                         lang="fr"
-                         dir="ltr"
-                         className="inter_c15e96cb-module__0bjUvq__variable noto_sans_arabic_6ed1a132-module__jgXZWq_..."
                        >
                          <body
-                           className="bg-white text-gray-900 antialiased"
                          >
                  ...

## Debug instructions

Follow this exact sequence. Do NOT skip steps or jump to a fix before understanding the root cause.

### Step 1: Reproduce and understand
- Read the error message carefully — identify the exact file, line number, and error type
- If it's a runtime error, check the browser console AND the terminal (Next.js server logs)
- If it's a build error, run `npm run build` and read the full output
- If it's a type error, run `npx tsc --noEmit` to get all TypeScript errors at once
- If it's a Supabase/database error, check: Is the local Supabase running? (`npx supabase status`). Are types up to date? (`npx supabase gen types typescript --local > src/types/database.ts`)

### Step 2: Identify the root cause
- Trace the error back to its origin — don't fix the symptom, fix the source
- Check if the issue is in: the component, the data fetching, the database query, the RLS policy, the middleware, or the types
- For "undefined" or "null" errors: trace where the data comes from and find where the chain breaks
- For hydration errors: find the component that renders differently on server vs client — it probably needs `"use client"` or `next/dynamic`
- For Supabase "row not found" or empty results: check RLS policies first using the SQL editor (which bypasses RLS) to verify data exists
- For i18n errors: check that the translation key exists in BOTH `messages/fr.json` AND `messages/ar.json`
- For RTL layout issues: search the file for `ml-`, `mr-`, `pl-`, `pr-`, `left-`, `right-`, `text-left`, `text-right` — replace with logical properties

### Step 3: Explain before fixing
Before writing any code, tell me:
1. **What is the root cause** — one sentence explaining why this is broken
2. **What files need to change** — list every file you will modify
3. **What the fix is** — describe the change in plain language
4. Wait for my confirmation before applying the fix.

### Step 4: Apply the fix
- Make the minimal change needed — don't refactor unrelated code
- If the fix touches the database schema, follow the create-supabase-migration skill (run `db reset` + `gen types`)
- If the fix touches a component, ensure it still follows the create-component skill (RTL-safe, typed props, proper imports)
- If the fix touches a page, ensure it still follows the create-page skill (auth guard, translations, metadata)

### Step 5: Verify
- Run `npm run build` to confirm no build errors
- Run `npx tsc --noEmit` to confirm no type errors
- Run `npm run lint` to confirm no lint errors
- If there are tests for the affected code, run `npx vitest run <file>`
- Tell me what to manually test in the browser to confirm the fix works

## Common IntelloNotes issues — check these first

| Symptom | Likely cause | Quick fix |
|---------|-------------|-----------|
| Page shows 404 | Missing `[locale]` in path | Ensure page is under `src/app/[locale]/` |
| "Text content mismatch" hydration error | Component uses browser-only API at render | Add `"use client"` or use `next/dynamic` with `ssr: false` |
| Supabase query returns empty array | RLS policy blocking access | Check policy with `SELECT * FROM table` in Supabase SQL editor |
| "Module not found: react-pdf" | SSR trying to load browser-only module | Use `next/dynamic` with `ssr: false` |
| Monaco editor blank/crash | SSR importing Monaco | Use `next/dynamic` with `ssr: false` |
| Arabic layout broken | Hardcoded `ml-`/`mr-`/`left-`/`right-` | Replace with `ms-`/`me-`/`start-`/`end-` |
| Translation key shows raw key string | Key missing in `fr.json` or `ar.json` | Add the key to both files |
| "auth.uid() is null" in RLS | User not logged in or session expired | Check middleware session refresh |
| Type error after schema change | Stale generated types | Run `npx supabase gen types typescript --local > src/types/database.ts` |
| Purchase not unlocking course | Realtime subscription not set up | Check `useRealtimePurchase` hook and Supabase Realtime config |
| Axis quiz not unlocking next axis | Progress update logic wrong | Check `submitQuizResults` in create-axis-quiz skill |
| Build fails with "window is not defined" | Server component using browser API | Move to client component or guard with `typeof window !== 'undefined'` |
| Middleware redirect loop | next-intl and Supabase middleware conflicting | Check middleware.ts chaining order: locale first, then Supabase |
| Image/PDF not loading | Supabase Storage signed URL expired or wrong bucket | Check bucket name `course-pdfs` and regenerate signed URL |
| Commission calculation wrong | Hardcoded percentages instead of using utility | Use `src/lib/utils/commission.ts` — never hardcode 0.7/0.3 |
