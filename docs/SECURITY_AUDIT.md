# LeadSaaS Security Audit & Architecture Refactor

## Executive Summary

### Current State: NOT PRODUCTION-SAFE

The codebase has **5 critical issues** that make it non-functional in a real Supabase deployment, **6 high-severity security problems**, and ~10 medium issues that need fixing before beta.

### Biggest Risks (in order of severity)

1. **ALL tenant RLS is broken.** Migration 001 creates `auth.org_id()` inside the `auth` schema. Supabase does not allow user-defined functions in the `auth` schema. This function will silently fail to create. Every RLS policy across 15+ tables depends on it. Result: **all org-scoped queries return zero rows** through the anon/user client, or the function errors.

2. **Privilege escalation via `set_user_org_claim`.** This `SECURITY DEFINER` function modifies `auth.users.raw_app_meta_data`. It is exposed as a public RPC callable by any authenticated user. A malicious user can call `rpc('set_user_org_claim', { p_user_id: 'any-user', p_org_id: 'any-org' })` and hijack any account into any organization.

3. **No auth callback route.** There is no `/api/auth/callback` or `/auth/callback` route. Supabase email confirmation links and password reset links redirect to this callback to exchange the auth code. Without it, email confirmation and password reset are completely broken.

4. **Signup bootstrap is client-side and non-atomic.** The signup page runs 4+ sequential Supabase client calls (create org, create membership, create profile, set JWT claim, create pipeline) from the browser. If any one fails, the user is in a broken state. The RPC to set JWT claims is called with the anon key, which means it goes through RLS — but `set_user_org_claim` is SECURITY DEFINER so it bypasses RLS. This is the privilege escalation mentioned above.

5. **JWT claim refresh timing.** After signup, even if the JWT claim is set in `auth.users.raw_app_meta_data`, the user's current session token does not contain it until the token refreshes (up to 1 hour later or on re-login). The middleware and API middleware both read `org_id` from the JWT. So after signup, the user will be redirected to the dashboard but have no org context.

### What Is Currently Okay
- Login form UX and Supabase `signInWithPassword` call
- Forgot password form UX (though the redirect URL is wrong)
- Middleware basic structure (checks auth, redirects)
- Webhook routes use service-role admin client (correct for M2M)
- Twilio signature verification approach
- Domain types and error handling pattern
- AI engine architecture (tools, prompts, executor)
- UI components and responsive layout

---

## Audit Findings (Concrete Issues)

### CRITICAL

| # | File/Location | Issue |
|---|---|---|
| C1 | `001_foundation.sql:34` | `CREATE FUNCTION auth.org_id()` — cannot create functions in `auth` schema on Supabase. All downstream RLS policies are broken. |
| C2 | `006_auth_helpers.sql:6-12` | `set_user_org_claim` is SECURITY DEFINER, modifies `auth.users`, and is callable by any authenticated user. Privilege escalation. |
| C3 | Missing file | No `/api/auth/callback/route.ts`. Email confirmation and password reset flows are dead. |
| C4 | `signup/page.tsx:69-110` | `setupOrganization()` runs 4+ client-side DB calls non-atomically. Partial failure = broken user state. |
| C5 | `signup/page.tsx:104-108` | Calls `rpc('set_user_org_claim')` from browser client. Combined with C2, this is exploitable. |

### HIGH

| # | File/Location | Issue |
|---|---|---|
| H1 | `src/lib/middleware/api.ts:12` | Uses `getSession()` which reads unverified local data. Should use `getUser()` for server-side auth. |
| H2 | `006_auth_helpers.sql:33` | `org_create` policy: `WITH CHECK (true)`. Any authenticated user can create unlimited organizations. |
| H3 | `005_functions.sql:8-11` | `increment_daily_usage` uses `format('%I', p_field)` where `p_field` is a parameter. While `%I` does identifier quoting, the function accepts any column name — should be restricted to known fields. |
| H4 | All `SECURITY DEFINER` functions | None have `SET search_path = public, pg_temp`. Vulnerable to search_path hijacking. None have `REVOKE ALL FROM PUBLIC` + selective `GRANT`. |
| H5 | `agents/trigger/route.ts:3` | Bearer token comparison is not timing-safe. `===` on secrets leaks timing information. |
| H6 | `forgot-password/page.tsx:18` | `redirectTo` points to `/login`. Should point to `/auth/callback?next=/update-password` so the code can be exchanged and the user can set a new password. No update-password page exists. |
| H7 | `004_events_usage.sql:37` | `domain_events` has `FOR ALL USING (org_id=auth.org_id())`. Users can insert fake domain events. Should be SELECT-only for users. |
| H8 | `002_agents.sql` through `003_leads_conversations.sql` | All `FOR ALL` policies lack explicit `WITH CHECK`. While Postgres uses `USING` as fallback, this is not explicit and risks accidental cross-tenant writes if the USING clause is loosened. |

### MEDIUM

| # | File/Location | Issue |
|---|---|---|
| M1 | `src/lib/db/supabase.ts:52-55` | `getSession()` helper uses deprecated `supabase.auth.getSession()`. |
| M2 | Multiple files | 15+ uses of `as any` type casts, hiding type mismatches. |
| M3 | `004_events_usage.sql` | `webhook_deliveries` table has no explicit RLS policy — users can't read delivery logs for their webhooks. |
| M4 | `001_foundation.sql` | `organization_members` only has a SELECT policy. No INSERT/UPDATE/DELETE policies for admins. |
| M5 | `src/middleware.ts:47-49` | Middleware matcher duplicates the route allowlist from the body logic. If they drift, routes break. |
| M6 | `src/app/api/leads/capture/route.ts` | CORS `Access-Control-Allow-Origin: *` in production is risky. Should be restricted to known client domains. |

---

## Architecture Decisions

### Decision 1: Replace `auth.org_id()` with membership-based RLS

**Decision: YES. Remove `auth.org_id()` entirely. Use `organization_members + auth.uid()` as the canonical access model.**

Why:
- `auth.org_id()` cannot exist in Supabase's `auth` schema
- Even as `public.get_user_org_id()`, it relies on JWT `app_metadata` which has stale-data problems
- Membership-based RLS is the Supabase-recommended pattern for multi-tenant apps
- It naturally supports multi-org users in the future
- The subquery `org_id IN (SELECT org_id FROM organization_members WHERE user_id = auth.uid() AND is_active = true)` is the correct pattern

Performance note: This subquery is fast with the existing `idx_org_members_user` index. Postgres caches the subquery result per-statement.

### Decision 2: Keep JWT `org_id` as optional convenience hint, not security boundary

**Decision: Keep it for UI convenience only (e.g., sidebar org display). NEVER use it in RLS policies.**

The middleware and dashboard can read it to pre-select the active org in the UI, but all data access goes through membership-based RLS.

### Decision 3: Move signup bootstrap to a server-side API route

**Decision: Create `POST /api/auth/signup` as a route handler that uses the admin client.**

Why:
- The admin client (service role) bypasses RLS and can atomically create org + membership + profile + pipeline
- If any step fails, the route returns an error before the user is told signup succeeded
- No SECURITY DEFINER functions needed for bootstrap
- JWT claims can be set via `supabase.auth.admin.updateUserById()` on the server

### Decision 4: Add auth callback route and update-password page

**Decision: Create `/api/auth/callback/route.ts` and `/auth/update-password/page.tsx`.**

The callback route exchanges the auth code from email links. The update-password page lets users set a new password after reset.

### Decision 5: Migration restructuring

**Decision: Restructure into the requested 8-file format with correct dependency ordering.**

The key change: RLS policies are moved to a dedicated migration that runs after ALL tables and functions exist. This prevents the current problem where RLS references functions that don't exist yet or are in the wrong schema.

---

## File-by-File Implementation Plan

### CREATE (new files)
- `src/lib/supabase/client.ts` — browser client (replaces `db/supabase-browser.ts`)
- `src/lib/supabase/server.ts` — server component client (replaces `db/supabase.ts`)
- `src/lib/supabase/middleware.ts` — middleware client helper
- `src/lib/supabase/admin.ts` — service-role admin client
- `src/app/api/auth/callback/route.ts` — auth code exchange
- `src/app/api/auth/signup/route.ts` — server-side signup bootstrap
- `src/app/(auth)/update-password/page.tsx` — post-reset password form
- `supabase/migrations/001_extensions_and_enums.sql`
- `supabase/migrations/002_core_orgs_and_members.sql`
- `supabase/migrations/003_agents_and_workflows.sql`
- `supabase/migrations/004_leads_conversations_pipeline.sql`
- `supabase/migrations/005_usage_webhooks_notifications.sql`
- `supabase/migrations/006_helper_functions.sql`
- `supabase/migrations/007_rls_policies_and_triggers.sql`
- `supabase/migrations/008_auth_helpers.sql`

### DELETE (replaced by new structure)
- `src/lib/db/supabase.ts`
- `src/lib/db/supabase-browser.ts`
- `supabase/migrations/001_foundation.sql`
- `supabase/migrations/002_agents.sql`
- `supabase/migrations/003_leads_conversations.sql`
- `supabase/migrations/004_events_usage.sql`
- `supabase/migrations/005_functions.sql`
- `supabase/migrations/006_auth_helpers.sql`

### UPDATE (modify in place)
- `src/middleware.ts` — add callback/update-password to allowlist
- `src/app/(auth)/signup/page.tsx` — call server route instead of client-side bootstrap
- `src/app/(auth)/forgot-password/page.tsx` — fix redirectTo URL
- `src/lib/middleware/api.ts` — use `getUser()` instead of `getSession()`
- `src/app/api/agents/trigger/route.ts` — timing-safe auth comparison
- `src/app/api/agents/send-message/route.ts` — timing-safe auth comparison

---

## Remaining Temporary Compromises

These are acceptable for beta but should be fixed before production:

1. **CORS `*` on lead capture** — restrict to customer domains via org settings
2. **`as any` casts** — generate proper database types with `supabase gen types`
3. **No rate limiting** — add rate limiting middleware before production
4. **Admin client singleton** — fine for serverless but audit for connection leaks
5. **Edge function auth** — edge functions use service key in headers; add a shared secret rotation mechanism
6. **Multi-org support** — current architecture supports it via membership but UI assumes single org

## Final Verdict

After implementing the changes in this audit: **Beta-safe.** The auth flow will work end-to-end, tenant isolation will be enforced at the database level via membership checks, and the critical privilege escalation is eliminated. Remaining items are operational hardening, not architectural flaws.
