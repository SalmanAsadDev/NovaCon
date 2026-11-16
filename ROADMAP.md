# NovaCon — Engineering Audit & Roadmap

> Generated: 2026-09-14  
> Based on a full static analysis of the codebase.

---

## Table of Contents

1. [Current State Summary](#1-current-state-summary)
2. [Bug & Security Audit](#2-bug--security-audit)
3. [Architectural Observations](#3-architectural-observations)
4. [Dead Code Inventory](#4-dead-code-inventory)
5. [Recommended Fixes — Priority Order](#5-recommended-fixes--priority-order)
6. [Feature Roadmap](#6-feature-roadmap)
7. [Schema Gaps to Close](#7-schema-gaps-to-close)

---

## 1. Current State Summary

### What Works End-to-End

| Area | Status |
|---|---|
| User signup / login (credentials) | ✅ Working |
| Org creation, slug generation | ✅ Working |
| Org settings (name, description, logo) | ✅ Working |
| Event creation with default tiers | ✅ Working |
| Event settings update | ✅ Working |
| Speaker CRUD in dashboard | ✅ Working |
| Session CRUD in dashboard | ✅ Working |
| Ticket tier management in dashboard | ✅ Working |
| Public event page (attendee view) | ✅ Working |
| Attendee registration modal (3-step) | ✅ Working |
| Dashboard layout — desktop sidebar | ✅ Working |
| Dashboard layout — mobile drawer | ✅ Working |

### What Is Schema-Ready But Has No API

| Area | Schema Model | API Routes | UI |
|---|---|---|---|
| Finance records & budgeting | ✅ `FinanceRecord` | ❌ None | ❌ None |
| Vendor management | ✅ `Vendor` | ❌ None | ❌ None |
| Payment processing | ✅ `Payment` | ❌ None | ❌ None |
| Password reset flow | ✅ `PasswordResetToken` | ❌ None | ❌ None |
| Invitation email gating | ✅ `OrgInvitation.email` | ⚠️ Incomplete | ❌ None |

---

## 2. Bug & Security Audit

### 🔴 CRITICAL

#### 2.1 Middleware Not Wired — All Routes Unprotected

**File:** `src/proxy.ts`  
**Problem:** Next.js recognizes route-protection middleware only from a file named `middleware.ts` at the project root or at `src/middleware.ts`. The protection logic lives in `src/proxy.ts` under a named export `proxy`, which Next.js ignores. As a result, every route — including all dashboard pages and API endpoints — is currently accessible without authentication.

**Fix:** Rename `src/proxy.ts` to `src/middleware.ts` and change the export:

```ts
// src/middleware.ts  (was proxy.ts)
export { proxy as default } from './proxy'   // ← if keeping old file for re-use
// OR just rename and change `export async function proxy` → `export default async function middleware`
```

Alternatively, inline the logic and export a default function named `middleware` plus re-export `config`.

---

#### 2.2 Missing Role/Membership Checks on All Mutation Routes

**Files:** `app/api/org/[orgSlug]/events/[eventSlug]/speakers/`, `sessions/`, `tiers/`  
**Problem:** POST, PATCH, and DELETE handlers on speakers, sessions, and ticket tiers check only that `session?.user` exists (i.e., the user is logged in). They do not verify that the user is a member of the org that owns the event. Any authenticated user on the platform can create, edit, or delete data belonging to another organization's event.

**Fix:** Add a membership lookup before any write:

```ts
const membership = await prisma.orgMember.findFirst({
  where: { userId: session.user.id, org: { slug: orgSlug } }
})
if (!membership || !['OWNER', 'EVENT_MANAGER'].includes(membership.role)) {
  return Response.json({ error: 'Forbidden' }, { status: 403 })
}
```

This same pattern already exists on `POST /api/org/[orgSlug]/events` and should be extracted into a shared helper (e.g., `lib/auth-helpers.ts → requireOrgRole()`).

---

#### 2.3 Event PATCH Does Not Verify Org Ownership

**File:** `app/api/org/[orgSlug]/events/[eventSlug]/route.ts` (PATCH handler)  
**Problem:** The handler confirms the user is an OWNER/EVENT_MANAGER of *some* org, then runs `event.update({ where: { slug: eventSlug } })` — this updates any event with that slug, regardless of which org it belongs to. A malicious org owner could update or corrupt another org's events.

**Fix:** Scope the update to the specific org:

```ts
await prisma.event.update({
  where: { slug: eventSlug, orgId: org.id },  // org.id resolved from orgSlug
  data: { ... }
})
```

---

### 🟠 HIGH

#### 2.4 Invitation Token Not Email-Gated

**File:** `app/api/org/join/route.ts`  
**Problem:** `POST /api/org/join` looks up `OrgInvitation` by token and creates an `OrgMember`, but never checks that `session.user.email === invitation.email`. Any authenticated user who obtains (or guesses) a valid token can join any org at any role level, including OWNER.

**Fix:**

```ts
if (invitation.email.toLowerCase() !== session.user.email.toLowerCase()) {
  return Response.json({ error: 'This invitation is not for your account' }, { status: 403 })
}
```

---

#### 2.5 Registration Capacity Race Condition (TOCTOU)

**File:** `app/api/public/events/[eventSlug]/register/route.ts`  
**Problem:** The route reads current registration count, checks against tier capacity, then inserts. Under concurrent load, multiple requests can read the same count simultaneously and all proceed to insert, allowing overselling.

**Fix:** Wrap in a Prisma transaction, or use a database-level check:

```ts
await prisma.$transaction(async (tx) => {
  const count = await tx.registration.count({ where: { ticketTierId: tier.id } })
  if (count + quantity > tier.capacity) throw new Error('Sold out')
  await tx.registration.createMany({ data: registrations })
})
```

For a portfolio project, a serializable transaction is sufficient. For production at scale, a `SELECT ... FOR UPDATE` on a counter column would be the next step.

---

### 🟡 MEDIUM

#### 2.6 No Server-Side Input Validation on Registration

**File:** `app/api/public/events/[eventSlug]/register/route.ts`  
**Problem:** `name`, `email`, `university`, `track` are required by the form but not validated server-side. An API consumer (or a direct curl call) can insert blank or malformed data.

**Fix:** Add a Zod schema at the top of the handler:

```ts
const RegisterSchema = z.object({
  name: z.string().min(2),
  email: z.string().email(),
  university: z.string().min(2),
  track: z.string().min(1),
  quantity: z.number().int().min(1).max(10).default(1),
})
```

---

#### 2.7 Analytics and Stats Not Org-Scoped

**Files:** `app/api/analytics/route.ts`, `app/api/stats/route.ts`  
**Problem:** Both endpoints return aggregate data across every org and event on the platform. Any authenticated user can query another org's registration breakdown, revenue, and attendance figures.

**Fix:** Require an `orgSlug` (or `eventSlug`) query param, resolve the user's membership, and scope all queries with `WHERE org.slug = ?`.

---

#### 2.8 Hardcoded Ticket Prices in `/api/stats`

**File:** `app/api/stats/route.ts`  
**Problem:** Revenue is computed using a hardcoded map `{ STANDARD: 2500, PREMIUM: 5000, WORKSHOP: 3500 }` against the legacy `ticketType` string field. The actual `TicketTier.price` column in the database is ignored, so any custom pricing set through the finance dashboard is never reflected in the stats widget.

**Fix:** Join `Registration → TicketTier` and sum `TicketTier.price`:

```ts
const revenueResult = await prisma.registration.aggregate({
  _sum: { ticketTier: { price: true } },  // via join
  where: { eventId: event.id }
})
```

Or more simply: `SUM(tt.price)` via a raw query grouped per event.

---

#### 2.9 `PATCH /api/org/[orgSlug]` Has No Input Validation

**File:** `app/api/org/[orgSlug]/route.ts`  
**Problem:** The raw request body is passed directly to `organization.update` without validation. A malicious payload with extra fields could attempt Prisma client prototype pollution or at minimum corrupt stored data with unexpected types.

**Fix:** Add a Zod schema gating `name`, `description`, `logo`, `website`, `country`, `currency` only.

---

### 🔵 LOW / UX

#### 2.10 Registration Modal Claims to Send Confirmation Email

**File:** `src/components/events/RegistrationModal.tsx`  
**Problem:** The success screen reads "We've sent a confirmation email to {email}" — no email-sending code exists anywhere. This is a false promise to the attendee.

**Fix:** Either remove the copy or integrate Resend (see Feature Roadmap §6.4).

---

## 3. Architectural Observations

### 3.1 `novacon-backend/` Is a Dead Prototype

The Express.js server in `novacon-backend/` reads static JSON files and is not called by any part of the Next.js frontend. It served as an early prototype before the decision to consolidate into Next.js Route Handlers. It can be safely deleted to reduce repository noise, or archived in a `_archive/` folder.

### 3.2 `DashboardShell` and `Sidebar` Are Legacy Dead Code

`components/layout/DashboardShell.tsx` and `components/layout/Sidebar.tsx` contain links to top-level routes (`/sessions`, `/speakers`, `/registrations`, `/analytics`) that no longer exist in the new org-scoped App Router structure. These components appear to never be rendered in the current routing tree (replaced by `OrgSidebar`). They should be deleted.

### 3.3 `LiveTicker` Polls a Non-Existent Endpoint

`components/layout/LiveTicker.tsx` polls `GET /api/activity` every 10 seconds. No such route handler exists. Every poll silently 404s. Either implement the endpoint or remove the component.

### 3.4 `(auth)/register` Page Is a Broken Attendee Self-Registration Flow

`app/(auth)/register/page.tsx` POSTs to `/api/registrations`, which has no Next.js Route Handler. The proxy whitelist even explicitly allows this path as "legacy self-registration." This flow is superseded by the `RegistrationModal` on the public event page. The register page and its proxy whitelist entry should be removed, or the flow should be re-implemented.

### 3.5 `Session.registered` Counter Is a Denormalized Field

`Session.registered` (default 0) is a denormalized count stored directly on the session row. Nothing in the current codebase increments this field when a registration happens — it stays at 0 forever. Either remove it and compute counts from registrations at query time, or add a `session.update({ data: { registered: { increment: 1 } } })` inside the registration transaction.

### 3.6 The `ticketType` String Field Is a Legacy Duplicate

`Registration.ticketType` (string, e.g. `"STANDARD"`) coexists with the properly normalized `Registration.ticketTierId` FK. Both are written on registration. The analytics and stats routes still use `ticketType` (string) while the finance route uses `ticketTierId`. This dual-path creates the hardcoded-price bug (§2.8). Once `ticketTierId` is consistently used everywhere, `ticketType` should be dropped in a migration.

### 3.7 Slug Generation Uses a Retry Loop — Consider a DB Unique Index Fallback

Both org and event slug generation use a `while(true)` loop with a `findUnique` check before insert. Under concurrent creation this is still a race condition (two requests can both pass the `findUnique` check). Since `slug` is `@unique` in the schema, the Prisma insert will throw a `P2002` on collision — the handler should catch that and retry rather than returning a 500. This is a minor issue for a portfolio app but worth noting.

---

## 4. Dead Code Inventory

| File / Component | Reason Dead | Recommended Action |
|---|---|---|
| `novacon-backend/` | Abandoned Express prototype, not called anywhere | Delete or move to `_archive/` |
| `components/layout/DashboardShell.tsx` | Replaced by OrgSidebar; links to non-existent routes | Delete |
| `components/layout/Sidebar.tsx` | Same as above | Delete |
| `components/layout/LiveTicker.tsx` | Polls `/api/activity` which doesn't exist | Delete or implement endpoint |
| `app/(auth)/register/page.tsx` | Posts to `/api/registrations` which doesn't exist | Delete or re-implement |
| `proxy.ts` whitelist entry for `/api/registrations` | Dead route | Remove after deleting register page |
| `proxy.ts` whitelist entry for `/api/activity` | Dead route | Remove or implement endpoint |
| `Registration.ticketType` (string field) | Superseded by `ticketTierId` FK | Drop after migrating analytics/stats |
| `Session.registered` (counter field) | Never incremented | Remove or wire up increment |
| `PasswordResetToken` model | No API routes consume it | Either implement forgot-password or remove |
| `RegistrationDayStat` model | Only used in analytics; no write path exists | Remove or implement a write path |

---

## 5. Recommended Fixes — Priority Order

These are ordered by impact and effort. Fix the critical items before any feature work.

| # | Fix | Effort | Impact |
|---|---|---|---|
| 1 | Wire middleware: rename `proxy.ts` → `middleware.ts`, export default | 5 min | 🔴 All routes unprotected without this |
| 2 | Add membership check helper in `lib/auth-helpers.ts` and apply to all mutation routes | 2 hr | 🔴 Closes cross-org data tampering |
| 3 | Scope event PATCH to org | 15 min | 🔴 Closes org-bypass attack |
| 4 | Gate invitation token by email | 15 min | 🟠 Closes invitation hijacking |
| 5 | Wrap registration in a transaction | 30 min | 🟠 Prevents overselling |
| 6 | Add Zod validation to registration route | 30 min | 🟡 Data integrity |
| 7 | Scope analytics/stats to org/event | 1 hr | 🟡 Closes data leakage |
| 8 | Fix stats revenue to use `TicketTier.price` | 1 hr | 🟡 Accuracy |
| 9 | Add Zod validation to PATCH org | 20 min | 🟡 Input safety |
| 10 | Delete dead code (backend, legacy components) | 30 min | 🔵 Repo hygiene |
| 11 | Remove or fix registration copy ("email sent") | 5 min | 🔵 UX honesty |
| 12 | Fix `Session.registered` counter wiring | 30 min | 🔵 Data accuracy |

---

## 6. Feature Roadmap

### 6.1 OAuth Integration (Complexity: Low)

Add "Sign in with Google" as a second NextAuth provider. The schema already has the `Account` table from the NextAuth Prisma Adapter.

**Why:** Reduces friction for organizer onboarding; demonstrates standard OAuth patterns.

**How:**
- Add `GoogleProvider` to `lib/auth.ts`
- Add `GOOGLE_CLIENT_ID` / `GOOGLE_CLIENT_SECRET` to `.env.local`
- Update the login UI to show a "Continue with Google" button
- The existing Prisma Adapter handles account linking automatically

---

### 6.2 Stripe / Safepay Payment Integration (Complexity: Medium)

The schema already has `Payment`, `TicketTier.price`, and `Registration.paymentId`. The plumbing is ready.

**Why:** Demonstrates the most commercially relevant feature for an event platform; the schema is already designed for it.

**How (Stripe path):**
1. On registration submit, create a Stripe Checkout Session server-side and return the `url`
2. Redirect attendee to Stripe hosted checkout
3. Implement `POST /api/webhooks/stripe` — verify signature, find Payment by `gatewayPaymentId`, update `status → PAID`, update `Registration.status → REGISTERED`
4. Show success page

**Safepay** (Pakistan-local): same pattern but with Safepay's hosted checkout SDK.

---

### 6.3 QR-Code Ticket Emails via Resend (Complexity: Low–Medium)

**Why:** Completes the registration flow promise (the modal already says "We've sent a confirmation email"). Demonstrates transactional email integration.

**How:**
1. `npm install resend`
2. Create `lib/email.ts` with a `sendTicketConfirmation(registration)` function
3. Generate a QR code from `registration.id` using `qrcode` npm package
4. Send via Resend's API using an HTML template
5. Call from inside the registration transaction after insert

---

### 6.4 Attendee Check-In via QR Scan (Complexity: Medium)

**Why:** Closes the event-day operational loop; demonstrates real-time state changes.

**How:**
1. Each QR code encodes the `registration.id`
2. Staff scan → `PATCH /api/org/[orgSlug]/events/[eventSlug]/check-in` with `registrationId`
3. Route sets `Registration.status = CHECKED_IN` and increments a live counter
4. Dashboard attendee table updates (can start with manual refresh, upgrade to SSE)
5. Role gate: require `STAFF` or above

---

### 6.5 Finance Dashboard (Complexity: Medium)

The `FinanceRecord` and `Vendor` models are fully defined. Building the UI would directly demonstrate the platform's "ops" value proposition.

**Why:** The schema investment pays off; finance tracking is a core pain point for event companies.

**Feature set (MVP):**
- List / create / edit finance records per event (expense, payable, receivable)
- Vendor registry with CRUD
- Budget vs. actual comparison widget (using `budgetedAmount` vs `actualAmount`)
- Per-event P&L summary card

**Role gate:** OWNER and FINANCE role only.

---

### 6.6 Event Team Management (Complexity: Low)

**Why:** The `OrgInvitation` model and `EventMember` assignment model exist but there is no UI to invite team members or assign staff to specific events.

**Feature set:**
- Org Settings → Team tab: invite by email (generates `OrgInvitation` token, sends email via Resend), list current members, change role, remove member
- Event Settings → Team tab: assign org members to specific events (creates `EventMember` rows)
- After this is built, event-level role checks can scope speakers/sessions write access to `EventMember` rather than all `OrgMember`

---

### 6.7 Real-Time Analytics (Complexity: Medium-High)

**Why:** Elevates the dashboard from static reports to a live ops tool; demonstrates WebSocket/SSE skills.

**Approach (SSE — simpler than WebSockets for one-way push):**
1. `GET /api/org/[orgSlug]/events/[eventSlug]/stream` — returns `text/event-stream`
2. Server pushes `registration.count`, `checkedIn.count`, `revenue` every 5 seconds
3. Dashboard KPI cards switch from server-fetched to `EventSource` consumer
4. Neon Postgres supports LISTEN/NOTIFY — can be used to trigger pushes on insert

---

### 6.8 Public Event Search & Discovery Page (Complexity: Low)

**Why:** The landing page already fetches `PUBLISHED`/`LIVE` events. A proper search/filter page would showcase the multi-org nature of the platform.

**Feature set:**
- `/events` listing with filter by city, eventType, date range
- Full-text search on event name / description (Postgres `ILIKE` is sufficient at portfolio scale)
- Pagination (cursor-based using `createdAt`)

---

### 6.9 Password Reset Flow (Complexity: Low)

**Why:** The `PasswordResetToken` model is already in the schema. Missing this makes credential accounts feel incomplete.

**How:**
1. `POST /api/auth/forgot-password` — create token, send email via Resend
2. `GET /api/auth/reset-password?token=...` — validate token, render form
3. `POST /api/auth/reset-password` — hash new password, mark token used

---

### 6.10 Org-Level Dashboard Home (Complexity: Low)

**Why:** Currently `/org/[orgSlug]` redirects immediately to `/events`. A proper org home with KPIs (total events, total registrations across events, team size, revenue) would make the dashboard feel complete.

---

## 7. Schema Gaps to Close

These are schema-level cleanups to do alongside or after the bug fixes:

| Issue | Migration Action |
|---|---|
| `Registration.ticketType` (string) duplicates `ticketTierId` FK | After migrating all reads to use the FK, remove the column in a migration |
| `Session.registered` never incremented | Either wire it in the registration transaction, or `DROP COLUMN registered` and compute from registrations |
| `OrgInvitation.orgId` has no Prisma relation | Add `org Organization @relation(...)` or at minimum add `@@index([orgId])` for query performance |
| `RegistrationDayStat` never written to | Either seed it from real registrations in a migration, or remove the model entirely |
| `Event.expectedAttendees` field unused | Remove if never referenced, or use it to drive a "target capacity" progress bar in the dashboard |

---

*End of document.*
