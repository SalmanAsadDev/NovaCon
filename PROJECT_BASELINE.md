# PROJECT_BASELINE.md — NovaCon Verified Baseline
> Generated: 2026-11-10 | Source of truth: live repository inspection

---

## 1. Technology Stack (Verified)

| Layer | Technology | Version | Notes |
|---|---|---|---|
| Framework | Next.js (App Router) | 16.3.3 | React 19.2.8, TypeScript strict |
| Styling | Vanilla CSS (`globals.css`) | — | Tailwind in devDeps but only postcss config; not used in app code |
| Icons | lucide-react | ^1.34.0 | Consistent SVG icons |
| Charts | recharts | ^3.10.1 | Installed, referenced in layout |
| ORM | Prisma | ^6.4.0 | Neon Postgres (serverless) |
| Auth | NextAuth v5 (beta.32) | — | Credentials + JWT strategy, bcryptjs passwords |
| Validation | Zod | ^4.4.3 | Used in API routes |
| DB Adapter | @auth/prisma-adapter | ^2.11.3 | — |
| Deploy | Vercel | — | `vercel.json` present |

**Primary working directory:** `novacon-frontend/`  
**Database:** PostgreSQL via Neon (env `DATABASE_URL`)  
**Dead prototype:** `novacon-backend/` — Express + JSON files, not wired to any Next.js code

---

## 2. Feature Status Matrix

### 2.1 Fully Implemented ✅

| Feature | Files | Notes |
|---|---|---|
| User signup/login (credentials) | `(auth)/login`, `(auth)/signup`, `/api/auth/signup`, `lib/auth.ts` | bcrypt hash, JWT session |
| Org creation + slug generation | `/api/org/route.ts`, `onboarding/page.tsx` | Slug uniqueness enforced |
| Org settings (name, description, logo, website) | `/org/[orgSlug]/settings/`, `/api/org/[orgSlug]/route.ts` | Zod validated |
| Event CRUD | `/org/[orgSlug]/events/`, `/api/org/[orgSlug]/events/` | Full create/read/update |
| Speaker CRUD | `/org/[orgSlug]/events/[eventSlug]/speakers/`, API routes | requireOrgRole applied |
| Session CRUD | `/org/[orgSlug]/events/[eventSlug]/sessions/`, API routes | requireOrgRole applied |
| Ticket tier management | `/org/[orgSlug]/events/[eventSlug]/finance/page.tsx` | Note: "Finance" page is actually ticket tiers UI |
| Public event page (attendee view) | `/events/[eventSlug]/page.tsx` | — |
| Attendee registration modal (3-step) | `components/events/RegistrationModal.tsx` | — |
| Dashboard layout — desktop sidebar | `components/layout/OrgSidebar.tsx`, `org/[orgSlug]/layout.tsx` | — |
| Dashboard layout — mobile drawer | `OrgSidebar.tsx` custom-event-based open | — |
| Route protection middleware | `src/middleware.ts` | FIXED from ROADMAP bug 2.1 |
| Org membership auth helper | `lib/auth-helpers.ts → requireOrgRole()` | FIXED from ROADMAP bug 2.2 |
| Event PATCH org-scoped | `/api/org/[orgSlug]/events/[eventSlug]/route.ts` | FIXED from ROADMAP bug 2.3 |
| Registration race condition fix | `/api/public/events/[eventSlug]/register/route.ts` | FIXED — uses `prisma.$transaction()` |
| Registration server-side Zod validation | Same route | FIXED from ROADMAP bug 2.6 |
| Landing page with public events | `app/page.tsx` | Server component, queries PUBLISHED/LIVE |

### 2.2 Partial / Broken ⚠️

| Feature | Files | Issue |
|---|---|---|
| Finance dashboard | `finance/page.tsx` | Shows ticket tiers only; zero FinanceRecord/Vendor UI despite full schema |
| Attendees page | `attendees/page.tsx` | No search/filter; Export CSV button is non-functional (no handler) |
| Analytics | `/api/analytics/route.ts` | Not org-scoped (ROADMAP bug 2.7) — any authenticated user reads all orgs' data |
| Stats | `/api/stats/route.ts` | Hardcoded prices bug (ROADMAP 2.8) + not org-scoped (bug 2.7) |
| Org dashboard home | `/org/[orgSlug]/page.tsx` | Redirects immediately to `/events`; no KPI home |
| Invitation flow | `/api/org/join/route.ts` | Token email-gating unverified (ROADMAP bug 2.4) |
| ConfirmModal | `components/ui/ConfirmModal.tsx` | Exists but not universally applied; finance page has ad-hoc modal |

### 2.3 Schema-Ready, No UI/API ❌

| Feature | Schema Model | API | UI |
|---|---|---|---|
| Finance records & budgeting | `FinanceRecord` | None | None |
| Vendor management | `Vendor` | None | None |
| Payment processing | `Payment` | None | None |
| Password reset | `PasswordResetToken` | None | None |
| Team invitation | `OrgInvitation` | Partial (join route) | None |
| Event team assignment | `EventMember` | None | None |
| QR check-in | `Registration.status=CHECKED_IN` | None | None |

### 2.4 Dead Code 🗑️

| File | Status | Action |
|---|---|---|
| `novacon-backend/` | Abandoned Express prototype | Archive or delete |
| `components/layout/DashboardShell.tsx` | Replaced by OrgSidebar | Delete |
| `components/layout/Sidebar.tsx` | Replaced by OrgSidebar | Delete |
| `components/layout/LiveTicker.tsx` | Polls non-existent `/api/activity` | Delete or implement |
| `app/(auth)/register/page.tsx` | Posts to non-existent `/api/registrations` | Delete |
| `Registration.ticketType` (string) | Duplicates `ticketTierId` FK | Drop after migrating analytics/stats |
| `Session.registered` (counter) | Never incremented anywhere | Remove or wire up |
| `RegistrationDayStat` model | No write path | Remove |

---

## 3. UI/UX Patterns — Current State

### Design Tokens (from `globals.css`)
```
--bg-base: #0D1117       (GitHub-dark)
--bg-surface: #161B22
--bg-surface-2: #1C2128
--accent: #F0A500        (amber)
--text-primary: #E6EDF3
--text-secondary: #8B949E
Fonts: Sora (headings) + Inter (body)
```

### Missing/Broken Tokens (referenced in components but not defined)
- `--bg-highlight` — used in overview/finance but absent from globals.css
- `--bg-surface-elevated` — used in overview but absent
- Hardcoded `#00ff80` in finance and events pages (should be CSS variable `--green`)

### Styling Approach
- Global utility classes in `globals.css` (`.card`, `.btn`, `.table`, `.badge`, etc.)
- Heavy inline styles in page components for layout-specific positioning
- No CSS modules or component-scoped styles
- No Tailwind classes used despite Tailwind being installed

### Known UX Gaps
- Emoji used as icon in org events page (`📅`) — anti-pattern
- "Export CSV" button on attendees page has no handler
- Registration modal success screen claims email was sent — no email code exists
- No toast/notification system for async feedback (errors inline only)
- No loading skeletons — pages show no loading state between navigation
- `--green` (#3FB950) exists but #00ff80 used in 3 places instead

---

## 4. Database Schema Summary

**Core entities**: User → OrgMember → Organization → Event → (Sessions, Speakers, TicketTiers, Registrations, FinanceRecords, Vendors, Payments)

**Fully defined and wired**: User, Account (OAuth), OrgMember, Organization, Event, Speaker, Session, TicketTier, Registration

**Defined but no backend logic**: FinanceRecord, Vendor, Payment, EventMember, OrgInvitation, PasswordResetToken

**Legacy/cleanup needed**: Registration.ticketType (string duplicate), Session.registered (never incremented), RegistrationDayStat (no write path)

**OrgInvitation gap**: `OrgInvitation.orgId` has no Prisma `@relation` — only raw string field. No index defined.

---

## 5. Architecture Structure

```
novacon-frontend/
├── prisma/              schema.prisma + seed.ts (dev.db also present — SQLite leftover)
├── src/
│   ├── app/
│   │   ├── (auth)/      login, signup pages  [register page is dead]
│   │   ├── api/         Route handlers (REST)
│   │   │   ├── analytics/   ⚠ not org-scoped
│   │   │   ├── stats/       ⚠ not org-scoped, hardcoded prices
│   │   │   ├── auth/        signup, /me
│   │   │   ├── org/         CRUD for orgs, events, speakers, sessions, tiers
│   │   │   └── public/      Registration (no auth required)
│   │   ├── dashboard/   Simple redirect page
│   │   ├── events/      Public attendee-facing event page
│   │   ├── onboarding/  Org creation wizard
│   │   └── org/         Protected dashboard tree
│   ├── components/
│   │   ├── events/      RegistrationModal (3-step)
│   │   ├── layout/      OrgSidebar, MobileTopbar (active) + DashboardShell, Sidebar, LiveTicker (dead)
│   │   └── ui/          ConfirmModal
│   ├── lib/             auth.ts, auth.config.ts, auth-helpers.ts, prisma.ts
│   ├── middleware.ts     Route protection (properly wired)
│   └── types/           next-auth.d.ts session augmentation
```

---

## 6. Doc vs Reality Gaps

| Claim in Docs | Reality |
|---|---|
| "proxy.ts handles route protection" | Fixed — now middleware.ts with default export |
| "Missing role checks on mutation routes" | Fixed — requireOrgRole() implemented and applied to speakers, sessions, event PATCH |
| "Registration has no Zod validation" | Fixed — full Zod schema applied |
| "Registration race condition" | Fixed — prisma.$transaction() used |
| "Finance dashboard" | Misleading — the finance page manages ticket tiers, not FinanceRecord entries |
| "NextAuth v5 JWT strategy" | Correct |
| "Tailwind avoided intentionally" | Installed as devDep but not used — consistent with claim |
| "Recharts installed" | Installed but no chart implementations found in current pages |
| "dev.db present in prisma/" | SQLite artifact — should use Neon PostgreSQL per DATABASE_URL |

---

## 7. Open Security Items (from ROADMAP, unverified)

| Item | File | Status |
|---|---|---|
| Invitation token not email-gated | `/api/org/join/route.ts` | Unverified — not inspected |
| Analytics/stats not org-scoped | `/api/analytics/route.ts`, `/api/stats/route.ts` | Confirmed gap — no org filtering |
| PATCH org no input validation | `/api/org/[orgSlug]/route.ts` | Unverified |
| Stats uses hardcoded prices | `/api/stats/route.ts` | Confirmed in ROADMAP, not re-verified |
