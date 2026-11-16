# FEATURE_PROPOSALS.md — NovaCon Feature Proposals
> Version: 1.0 | Date: 2026-11-10 | Framework: Impact × Effort (I×E)

---

## Scoring Framework

**Impact** (1–5): Revenue potential, user value, differentiation, breadth of use  
**Effort** (1–5): Dev hours, complexity, external deps  
**Priority Score** = Impact ÷ Effort  

| Score | Priority |
|---|---|
| ≥ 2.5 | Phase 1–2 (High) |
| 1.5–2.4 | Phase 3–4 (Medium) |
| < 1.5 | Phase 5+ (Low / Optional) |

---

## F1 — Security Bug Fixes (Pre-requisite)

**Score: Mandatory / No choice**

| Item | Effort | Business Problem |
|---|---|---|
| Fix analytics/stats org scoping | 1h | Data leakage across orgs |
| Email-gate invitation token | 15min | Invitation hijacking |
| Zod validate PATCH org | 20min | Input safety |

These are not features — they are correctness fixes that must ship before any feature work.

---

## F2 — Finance Dashboard (FinanceRecord + Vendor UI)

**Impact: 5 | Effort: 2 | Score: 2.5 → Phase 1**

**Business problem**: The schema has fully defined `FinanceRecord` and `Vendor` models with no UI. Event companies need budget vs. actual tracking and vendor payment management. Currently zero revenue intelligence.

**Target user**: Event owners and finance roles  
**Value**: Directly demonstrates the platform's "ops" value proposition; schema investment pays off immediately

**Frontend requirements**:
- Finance page: tabbed UI — "Ticket Tiers" | "Budget Records" | "Vendors"
- Budget Records tab: table with CRUD for FinanceRecord (expense/payable/receivable/budget)
- Vendors tab: list with CRUD for Vendor
- KPI cards: total budget, total actual spend, variance
- Budget vs. actual comparison bar chart (recharts — already installed)

**Backend requirements**:
- `GET/POST /api/org/[orgSlug]/events/[eventSlug]/finance/records`
- `PATCH/DELETE /api/org/[orgSlug]/events/[eventSlug]/finance/records/[id]`
- `GET/POST /api/org/[orgSlug]/events/[eventSlug]/vendors`
- `PATCH/DELETE /api/org/[orgSlug]/events/[eventSlug]/vendors/[id]`
- Role gate: OWNER and FINANCE roles

**DB**: Schema already complete — no migrations needed  
**External**: None  
**Effort**: ~8h (API routes 3h + UI 5h)

---

## F3 — Event Command Center (Org Home Dashboard)

**Impact: 4 | Effort: 2 | Score: 2.0 → Phase 2**

**Business problem**: `/org/:slug` immediately redirects to events list with no KPI summary. Org owners have no single view of their portfolio health.

**Target user**: Org owners, event managers  
**Value**: Provides operational awareness; reduces navigation to find key numbers

**UI**: Replace redirect with dashboard page:
- Portfolio KPIs: total events, total registrations (all events), active events, total revenue
- Events status breakdown (donut chart)
- Upcoming event countdown cards
- Recent activity feed (registrations, new speakers)

**API requirements**:
- `GET /api/org/[orgSlug]/dashboard` — aggregate stats across events

**DB**: No new schema; query across existing models  
**Effort**: ~6h (API 2h + UI 4h)

---

## F4 — QR Code Check-In

**Impact: 4 | Effort: 2 | Score: 2.0 → Phase 2**

**Business problem**: Closes the event-day operational loop. Schema already has `Registration.status = CHECKED_IN` but no mechanism to set it.

**Target user**: Event staff (day-of operations)  
**Value**: Core operational feature; demonstrates real-time state changes

**Frontend**:
- Attendees page: "Check In" button per row → sets status
- Mobile-optimized scan view: `/org/:slug/events/:slug/check-in` — QR scanner using device camera (via `@zxing/browser` or similar)
- Live check-in progress bar on overview page

**API**:
- `PATCH /api/org/[orgSlug]/events/[eventSlug]/check-in` — `{ registrationId }` → sets `status = CHECKED_IN`
- Role gate: STAFF and above

**DB**: No migration needed — `RegistrationStatus.CHECKED_IN` already defined  
**External**: QR code library (`qrcode` npm) for generation; `@zxing/browser` for scanning (~25KB)  
**Effort**: ~8h (manual check-in 3h + QR generation 2h + scanner UI 3h)

---

## F5 — Transactional Email (Registration Confirmation)

**Impact: 4 | Effort: 1.5 | Score: 2.7 → Phase 1**

**Business problem**: Registration success screen says "We've sent a confirmation email" — no email code exists. This is a false promise.

**Target user**: Attendees  
**Value**: Completes registration flow; professional expectation; also needed for invitations and password reset

**Implementation**:
- `npm install resend` — transactional email provider
- `lib/email.ts` — `sendRegistrationConfirmation(registration, tier, event)` function
- Call from inside the registration transaction after `createMany`
- Email template: ticket details, QR code (registration.id as payload), event info
- QR generation: `npm install qrcode` — generate data URL server-side

**API**: No new endpoints; called from existing registration handler  
**DB**: No changes  
**External**: Resend API key (env `RESEND_API_KEY`)  
**Effort**: ~4h

---

## F6 — Password Reset Flow

**Impact: 3 | Effort: 1 | Score: 3.0 → Phase 1**

**Business problem**: `PasswordResetToken` model is fully defined in schema. No reset flow makes credential accounts feel incomplete and reduces trust.

**Implementation**:
1. `POST /api/auth/forgot-password` — create token, send reset email via Resend
2. `GET /api/auth/reset-password?token=` — validate, render form
3. `POST /api/auth/reset-password` — hash new password, mark token used

**DB**: No migration needed — `PasswordResetToken` already defined  
**External**: Resend (dependency from F5)  
**Effort**: ~3h

---

## F7 — Google OAuth

**Impact: 3 | Effort: 1 | Score: 3.0 → Phase 1**

**Business problem**: Friction in organizer onboarding. OAuth handles account lifecycle automatically.

**Implementation**:
- Add `GoogleProvider` to `lib/auth.ts`
- Add `GOOGLE_CLIENT_ID` / `GOOGLE_CLIENT_SECRET` to env
- Update login/signup UI with "Continue with Google" button
- Prisma adapter handles account linking automatically

**DB**: `Account` table already exists for OAuth  
**External**: Google Cloud Console credentials  
**Effort**: ~2h

---

## F8 — Team Management (Org Members + Event Assignment)

**Impact: 4 | Effort: 2.5 | Score: 1.6 → Phase 3**

**Business problem**: `OrgInvitation` and `EventMember` models exist but no UI to invite or assign team members.

**Target user**: Org owners  
**Value**: Unlocks role-based access control in practice; needed for multi-person orgs

**Frontend**:
- Org Settings → Team tab: list members, invite by email, change role, remove
- Event Settings → Team tab: assign org members to specific events

**API**:
- `GET/POST /api/org/[orgSlug]/invitations` — create invite, send email
- `GET /api/org/[orgSlug]/members` — list members with roles
- `PATCH /api/org/[orgSlug]/members/[id]` — change role
- `DELETE /api/org/[orgSlug]/members/[id]` — remove
- `POST /api/org/join` — accept invitation (fix email-gate bug first)

**DB**: Fix `OrgInvitation.orgId` Prisma relation, add index  
**External**: Resend (email invitations)  
**Effort**: ~12h

---

## F9 — Attendee Intelligence (Analytics)

**Impact: 4 | Effort: 2 | Score: 2.0 → Phase 3**

**Business problem**: No registration funnel analytics, no engagement segmentation, no post-event reports.

**Target user**: Event managers, org owners  
**Value**: Differentiates from basic CRUD systems; provides decision support

**Features (MVP)**:
- Registration trend chart (registrations per day) — `recharts` AreaChart
- Ticket tier breakdown donut chart
- University/institution breakdown (top 10)
- Track selection distribution
- Capacity utilization per tier

**API**:
- `GET /api/org/[orgSlug]/events/[eventSlug]/analytics` — returns all metrics
- Fix: scope existing `/api/analytics` to org (security fix)

**DB**: Query existing `Registration` model — no schema changes  
**Effort**: ~8h

---

## F10 — Stripe/Safepay Payment Integration

**Impact: 5 | Effort: 4 | Score: 1.25 → Phase 4**

**Business problem**: The most commercially relevant feature. Schema has `Payment`, `TicketTier.price`, `Registration.paymentId` but no payment flow.

**Target user**: Attendees purchasing tickets; event finance team  
**Value**: Unlocks monetization; demonstrates commercial credibility

**Implementation (Stripe path)**:
1. Create Stripe Checkout Session server-side on registration submit
2. Redirect attendee to Stripe hosted checkout
3. `POST /api/webhooks/stripe` — verify signature, update Payment.status → PAID, Registration.status → REGISTERED
4. Payment method enum supports: STRIPE, JAZZCASH, EASYPAISA, SAFEPAY (schema already has all)

**DB**: No schema changes — Payment model fully defined  
**External**: Stripe account + webhook endpoint setup  
**Effort**: ~16h

---

## F11 — Real-Time Registration Stream (SSE)

**Impact: 3 | Effort: 3 | Score: 1.0 → Phase 5**

**Business problem**: Dashboard KPIs are static (require manual refresh). Live events need real-time check-in and registration tracking.

**Implementation**:
- `GET /api/org/[orgSlug]/events/[eventSlug]/stream` — `text/event-stream`
- Server pushes: `registration.count`, `checkedIn.count`, `revenue` every 5s
- Dashboard KPI cards switch from static to `EventSource` consumer
- Neon supports `LISTEN/NOTIFY` for PostgreSQL-level push triggers

**External**: None (SSE is native HTTP)  
**Effort**: ~12h

---

## F12 — AI Event Intelligence

**Impact: 4 | Effort: 4 | Score: 1.0 → Phase 5**

**Business problem**: Manual data interpretation. Event managers need quick answers from their data without building SQL queries.

**High-value, practical AI features only**:
- **Post-event summary generation**: AI-generated report from registration, attendance, revenue, session data — no hallucination risk since it summarizes known facts
- **Budget anomaly detection**: Flag finance records where actual > 1.5× budgeted amount
- **Registration trend forecast**: Simple regression on daily registrations → estimated final attendance

**Avoid**: Chatbot integrations, general-purpose Q&A, speculative features

**External**: Anthropic Claude API (claude-haiku-4-5-20251001 for cost efficiency)  
**Effort**: ~12h

---

## Priority Matrix Summary

| Feature | Impact | Effort | Score | Phase |
|---|---|---|---|---|
| F6 Password Reset | 3 | 1 | 3.0 | 1 |
| F7 Google OAuth | 3 | 1 | 3.0 | 1 |
| F5 Transactional Email | 4 | 1.5 | 2.7 | 1 |
| F2 Finance Dashboard | 5 | 2 | 2.5 | 1 |
| F3 Org Home Dashboard | 4 | 2 | 2.0 | 2 |
| F4 QR Check-In | 4 | 2 | 2.0 | 2 |
| F9 Attendee Analytics | 4 | 2 | 2.0 | 3 |
| F8 Team Management | 4 | 2.5 | 1.6 | 3 |
| F10 Payments | 5 | 4 | 1.25 | 4 |
| F11 Real-Time SSE | 3 | 3 | 1.0 | 5 |
| F12 AI Intelligence | 4 | 4 | 1.0 | 5 |

**Top 5 Differentiators**:
1. Finance Dashboard (schema-ready, immediate value, no competitor does it at this level)
2. QR Check-In (closes the event-day operational loop)
3. Attendee Analytics (registration funnel + engagement intelligence)
4. Team Management (multi-person org operations)
5. AI Post-Event Reports (novel, practical, low hallucination risk)
