# IMPLEMENTATION_PLAN.md — NovaCon Master Execution Plan
> Version: 1.0 | Date: 2026-11-10 | Assumptions: 1 AI-assisted developer, ~4–6h/day productive time

---

## 1. Baseline & Target State

### What Currently Exists
- Full-stack Next.js 16 app with Prisma/Neon Postgres
- Functional: auth, org/event/speaker/session CRUD, ticket tier management, public event page, 3-step registration modal
- Schema complete: FinanceRecord, Vendor, Payment, EventMember, OrgInvitation, PasswordResetToken — no API/UI yet
- Middleware, auth helpers, Zod validation — recently fixed from ROADMAP bugs

### What Must Be Retained
- All existing working features (see PROJECT_BASELINE §2.1)
- Existing token system and CSS architecture (refine, not replace)
- Sora + Inter fonts
- OrgSidebar + MobileTopbar layout
- Routing structure (no URL changes)

### What Requires Refactoring
- Fix missing CSS tokens: `--bg-highlight`, `--bg-surface-elevated`
- Replace hardcoded `#00ff80` with `var(--green)`
- Remove inline styles from page components (extract to CSS classes)
- Fix analytics/stats API org-scoping (security)
- Fix Export CSV handler on attendees page

### What Must Be Removed
- `novacon-backend/` (archive)
- Dead components: DashboardShell, Sidebar, LiveTicker
- Dead page: `(auth)/register/page.tsx`
- Emoji icons in org events page

### What Will Be Developed
See FEATURE_PROPOSALS.md. Prioritized: Finance UI, Org Dashboard, QR Check-In, Emails, Auth improvements, Analytics.

### Out of Scope (this plan)
- Payment processing integration (Phase 4)
- Real-time SSE (Phase 5)
- AI features (Phase 5)
- Mobile native app
- Multi-language/i18n

---

## 2. Phased Delivery

### Phase 0 — Security Fixes & Dead Code Cleanup (2h)
Fix remaining security issues; remove dead code. No feature additions.

### Phase 1 — Design System Foundation (8h)
CSS token fixes, new UI primitives (`Toast`, `Skeleton`, `EmptyState`, `PageHeader`), landing page polish. No behavior changes.

### Phase 2 — Dashboard Pages Upgrade (12h)
Org home dashboard, event overview improvements, attendees search/filter/CSV, finance tab structure.

### Phase 3 — Finance Dashboard & Core Features (16h)
Full FinanceRecord/Vendor UI, budget analytics, QR check-in, email integration.

### Phase 4 — Auth & Team Management (12h)
Google OAuth, password reset, org team invitation/management.

### Phase 5 — Analytics & Intelligence (16h)
Attendee analytics charts, registration funnel, payment integration.

### Phase 6 — Polish & Launch Readiness (8h)
Accessibility audit, performance optimization, E2E test coverage, Vercel deployment verification.

---

## 3. Technical Contracts

### 3.1 New API Contracts

#### Finance Records
```
GET    /api/org/[orgSlug]/events/[eventSlug]/finance/records
POST   /api/org/[orgSlug]/events/[eventSlug]/finance/records
PATCH  /api/org/[orgSlug]/events/[eventSlug]/finance/records/[id]
DELETE /api/org/[orgSlug]/events/[eventSlug]/finance/records/[id]

Request body (POST/PATCH):
{
  type: "EXPENSE" | "PAYABLE" | "RECEIVABLE" | "BUDGET",
  category?: string,
  description: string,
  budgetedAmount?: number,
  actualAmount: number,
  vendorId?: string,
  currency?: string,
  paymentStatus?: "PENDING" | "PAID" | "PARTIAL" | "OVERDUE",
  dueDate?: string,
  invoiceNumber?: string,
  notes?: string
}

Response (GET): FinanceRecord[] with vendor relation included
Auth: requireOrgRole(OWNER | FINANCE)
```

#### Vendors
```
GET    /api/org/[orgSlug]/events/[eventSlug]/vendors
POST   /api/org/[orgSlug]/events/[eventSlug]/vendors
PATCH  /api/org/[orgSlug]/events/[eventSlug]/vendors/[id]
DELETE /api/org/[orgSlug]/events/[eventSlug]/vendors/[id]

Request body:
{
  name: string,
  category: string,
  contactName?: string,
  contactEmail?: string,
  contactPhone?: string,
  status?: "ACTIVE" | "INACTIVE" | "BLACKLISTED",
  notes?: string
}

Auth: requireOrgRole(OWNER | FINANCE | EVENT_MANAGER)
```

#### Org Dashboard Stats
```
GET /api/org/[orgSlug]/dashboard

Response:
{
  totalEvents: number,
  activeEvents: number,
  totalRegistrations: number,
  recentRevenue: number,
  upcomingEvents: Event[],
  eventsByStatus: { status: EventStatus, count: number }[]
}

Auth: requireOrgRole(any role)
```

#### Check-In
```
PATCH /api/org/[orgSlug]/events/[eventSlug]/check-in

Request: { registrationId: string }
Response: { success: true, name: string, tier: string }
Auth: requireOrgRole(STAFF | EVENT_MANAGER | OWNER)
```

#### Event Analytics
```
GET /api/org/[orgSlug]/events/[eventSlug]/analytics

Response:
{
  registrationsByDay: { date: string, count: number }[],
  byTier: { name: string, count: number, revenue: number }[],
  byTrack: { track: string, count: number }[],
  byUniversity: { university: string, count: number }[],
  checkInRate: number,
  capacityUtilization: number
}

Auth: requireOrgRole(any role)
```

### 3.2 Database Changes Required

| Change | Type | Risk |
|---|---|---|
| Add `@@relation` to `OrgInvitation.orgId` | Schema change | Low — additive |
| Remove `Registration.ticketType` (string) | Migration | Medium — migrate reads first |
| Remove `Session.registered` or wire increment | Schema change | Low |
| Remove `RegistrationDayStat` model | Migration | Low — no writes exist |
| Add `@@index([orgId])` to `OrgInvitation` | Migration | Low — additive |

### 3.3 Environment Variables Required

```bash
# Existing
DATABASE_URL=                    # Neon postgres
NEXTAUTH_SECRET=                 # Auth.js signing secret
NEXTAUTH_URL=                    # App URL

# New (Phase 3)
RESEND_API_KEY=                  # Transactional email

# New (Phase 4)
GOOGLE_CLIENT_ID=                # OAuth
GOOGLE_CLIENT_SECRET=            # OAuth
```

---

## 4. Timeline

| Phase | Description | Effort | Expected Duration |
|---|---|---|---|
| Phase 0 | Security fixes + dead code | 2h | 0.5 day |
| Phase 1 | Design system foundation | 8h | 2 days |
| Phase 2 | Dashboard pages upgrade | 12h | 3 days |
| Phase 3 | Finance + check-in + email | 16h | 4 days |
| Phase 4 | Auth + team management | 12h | 3 days |
| Phase 5 | Analytics + payment | 16h | 4 days |
| Phase 6 | Polish + launch readiness | 8h | 2 days |
| **Total** | | **74h** | **~18 working days** |

Parallelizable phases: Phase 1 and Phase 0 can run simultaneously. Phase 3 and Phase 4 have no dependencies on each other.

---

## 5. Quality Gates

A phase is not complete until:
- `npm run build` succeeds with zero TypeScript errors
- `eslint` passes with zero errors
- All new API routes tested with both valid and invalid payloads
- All new UI components render correctly at 375px, 768px, 1024px, 1440px
- Keyboard navigation tested on all new interactive elements
- Color contrast verified (≥ 4.5:1 for normal text)
- No console errors in production build

**Phase 0 gate**: Security items verified fixed via API testing  
**Phase 1 gate**: Missing tokens defined; no `#00ff80` hardcoded; `prefers-reduced-motion` guard added  
**Phase 2 gate**: Search/filter/CSV functional on attendees; org home KPIs load correctly  
**Phase 3 gate**: Finance CRUD functional; check-in updates registration status; test email delivered  
**Phase 4 gate**: OAuth sign-in works; password reset email delivered and token accepted  
**Phase 5 gate**: Analytics charts render with real data; payment webhook updates status  
**Phase 6 gate**: Lighthouse score ≥ 85; zero WCAG AA violations in automated check
