# TASK_BACKLOG.md — NovaCon Atomic Implementation Backlog
> Version: 1.0 | Date: 2026-11-10 | Format: Each task is independently executable

---

## Phase 0 — Security Fixes & Dead Code

---

### TASK-001: Fix Analytics & Stats Org Scoping
**ID**: TASK-001  
**Phase**: 0  
**Effort**: 1h | **Risk**: Low  
**Depends on**: None

**Objective**: Prevent cross-org data leakage on analytics and stats endpoints.

**Inspect**:
- `src/app/api/analytics/route.ts`
- `src/app/api/stats/route.ts`

**Files to modify**:
- `src/app/api/analytics/route.ts`
- `src/app/api/stats/route.ts`

**Instructions**:
1. Import `auth` and `requireOrgRole` in both files
2. Require `orgSlug` as a query param: `const orgSlug = url.searchParams.get('orgSlug')`
3. Call `requireOrgRole(session.user.id, orgSlug)` — return 403 if unauthorized
4. Scope all Prisma queries with `where: { org: { slug: orgSlug } }` or `where: { event: { org: { slug: orgSlug } } }`
5. For stats revenue: replace hardcoded price map with `JOIN TicketTier` to use actual `TicketTier.price`

**API Contract**:
```
GET /api/analytics?orgSlug=<slug>&eventSlug=<slug>
GET /api/stats?orgSlug=<slug>&eventSlug=<slug>
```

**Acceptance criteria**:
- Unauthenticated request returns 401
- Authenticated user from org-B requesting org-A data returns 403
- Stats revenue matches actual TicketTier.price values

---

### TASK-002: Email-Gate Invitation Token
**ID**: TASK-002  
**Phase**: 0  
**Effort**: 15min | **Risk**: Low  
**Depends on**: None

**Inspect**: `src/app/api/org/join/route.ts`

**Files to modify**: `src/app/api/org/join/route.ts`

**Instructions**:
After looking up `invitation` by token, add before creating `OrgMember`:
```ts
if (invitation.email.toLowerCase() !== session.user.email.toLowerCase()) {
  return Response.json({ error: 'This invitation is not for your account' }, { status: 403 })
}
```

**Acceptance criteria**: User with different email than invitation.email gets 403

---

### TASK-003: Remove Dead Code
**ID**: TASK-003  
**Phase**: 0  
**Effort**: 30min | **Risk**: Low  
**Depends on**: None

**Files to delete**:
- `src/components/layout/DashboardShell.tsx`
- `src/components/layout/Sidebar.tsx`
- `src/components/layout/LiveTicker.tsx`
- `src/app/(auth)/register/page.tsx`

**Instructions**:
1. `grep -r "DashboardShell\|Sidebar\|LiveTicker" src/` — verify no active imports
2. Delete each file
3. Remove whitelist entries from `src/middleware.ts` for `/api/registrations` and `/api/activity`
4. Run `npm run build` — verify zero TypeScript errors

**Acceptance criteria**: `npm run build` succeeds; no 404 errors on current routes

---

## Phase 1 — Design System Foundation

---

### TASK-010: Fix Missing CSS Tokens
**ID**: TASK-010  
**Phase**: 1  
**Effort**: 30min | **Risk**: Very low (additive CSS)  
**Depends on**: None

**Files to modify**: `src/app/globals.css`

**Instructions**:
1. In `:root {}`, add after `--bg-surface-2`:
```css
--bg-surface-3:        #21262D;
--bg-highlight:        #1F2937;
--bg-surface-elevated: #21262D;
```
2. Find all occurrences of `#00ff80` in the codebase: `grep -r "00ff80" src/`
3. Replace each `#00ff80` with `var(--green)`
4. Add `prefers-reduced-motion` guard at bottom of globals.css:
```css
@media (prefers-reduced-motion: reduce) {
  *, *::before, *::after {
    animation-duration: 0.01ms !important;
    transition-duration: 0.01ms !important;
  }
}
```

**Acceptance criteria**: No `#00ff80` in codebase; no console errors about undefined CSS vars

---

### TASK-011: Create Toast Component
**ID**: TASK-011  
**Phase**: 1  
**Effort**: 1.5h | **Risk**: Low  
**Depends on**: TASK-010

**Files to create**:
- `src/components/ui/Toast.tsx`
- `src/hooks/useToast.ts`

**UI Specification**:
- Position: fixed bottom-right, 16px from edges
- Width: 320px max
- Variants: success (green-dim bg, green text), error (red-dim bg, red text), info (blue-dim bg, blue text)
- Auto-dismiss: 4s for success, 6s for error
- Manual dismiss: X button (30×30px touch target)
- Animation: slide in from right, fade out
- Stack: up to 3 toasts visible

**Component API**:
```ts
// useToast hook
const { toast } = useToast()
toast.success('Speaker created successfully')
toast.error('Failed to save changes')
toast.info('Processing...')
```

**Instructions**:
1. Create a React context `ToastContext` in `Toast.tsx` with an array of toast items
2. Export `ToastProvider` to wrap `app/layout.tsx` children
3. Each toast: `{ id, type, message, dismissAt }`
4. Use `useEffect` with `setTimeout` for auto-dismiss
5. Render as a `<div>` with `position: fixed; bottom: 16px; right: 16px; z-index: 9999`
6. Add `role="status"` and `aria-live="polite"` on the container

**Acceptance criteria**: Toast renders, auto-dismisses, dismisses on X click, screen reader announces it

---

### TASK-012: Create Skeleton Component
**ID**: TASK-012  
**Phase**: 1  
**Effort**: 45min | **Risk**: Low  
**Depends on**: TASK-010

**Files to create**: `src/components/ui/Skeleton.tsx`

**UI Specification**:
```tsx
// Props
type SkeletonProps = { width?: string | number; height?: string | number; className?: string }

// CSS: shimmer animation using background-image gradient
// background: linear-gradient(90deg, var(--bg-surface-2) 25%, var(--bg-surface-3) 50%, var(--bg-surface-2) 75%);
// background-size: 200% 100%;
// animation: shimmer 1.5s infinite;
```

**Pre-built variants**:
- `<Skeleton.Table rows={5} columns={5} />` — full table skeleton
- `<Skeleton.Card height={120} />` — card skeleton
- `<Skeleton.KpiGrid count={4} />` — 4-column KPI skeleton

**Acceptance criteria**: Shimmer animation visible; `prefers-reduced-motion` renders static gray block instead

---

### TASK-013: Create EmptyState Component
**ID**: TASK-013  
**Phase**: 1  
**Effort**: 30min | **Risk**: Low  
**Depends on**: None

**Files to create**: `src/components/ui/EmptyState.tsx`

**Component API**:
```tsx
<EmptyState
  icon={<Users size={40} />}
  title="No attendees yet"
  description="Once people register, they appear here."
  action={{ label: "Create event", href: "/org/..." }}   // optional
/>
```

**CSS**: Centers in flex column; icon color `var(--text-muted)` at 0.5 opacity; padding 48px 24px

**Acceptance criteria**: Renders correctly with and without action prop

---

### TASK-014: Landing Page Polish
**ID**: TASK-014  
**Phase**: 1  
**Effort**: 2h | **Risk**: Low  
**Depends on**: TASK-010

**Files to modify**: `src/app/page.tsx`

**Instructions**:
1. Replace emoji icon `📅` in empty state with `<CalendarDays size={48} />` Lucide icon
2. Extract inline `style={{}}` objects to named CSS classes in globals.css or inline `<style>` block at bottom
3. Add `prefers-reduced-motion` to hero `fadeIn` animation
4. Add `aria-label` to "Get Started" button
5. Ensure "Sign In" link has minimum 44px touch target height
6. Add `<footer>` semantic element with copyright

**Acceptance criteria**: No emoji as icon; all animations respect `prefers-reduced-motion`; Lighthouse a11y score improves

---

## Phase 2 — Dashboard Pages Upgrade

---

### TASK-020: Org Home Dashboard
**ID**: TASK-020  
**Phase**: 2  
**Effort**: 4h | **Risk**: Low  
**Depends on**: TASK-010, TASK-012

**Files to create**:
- `src/app/org/[orgSlug]/page.tsx` (replace redirect with dashboard)
- `src/app/api/org/[orgSlug]/dashboard/route.ts`

**API Contract**:
```
GET /api/org/[orgSlug]/dashboard
Auth: requireOrgRole(any)
Response:
{
  totalEvents: number,
  draftEvents: number,
  liveEvents: number,
  completedEvents: number,
  totalRegistrations: number,
  recentRevenue: number,
  upcomingEvents: { id, name, slug, startDate, status, registrationCount }[]
}
```

**UI Layout**:
```
Page title: "Welcome back, [name]" + org name subtitle
─────────────────────────────────
KPI Grid (4 cards):
  Total Events | Live Now | Total Registrations | Revenue
─────────────────────────────────
Upcoming Events (table: name, date, status, registrations)
```

**Instructions**:
1. Create API route with `requireOrgRole` check
2. Query: aggregate counts using `prisma.event.groupBy` or multiple `count()` calls
3. Replace `src/app/org/[orgSlug]/page.tsx` redirect with actual page
4. Use `<Skeleton.KpiGrid count={4} />` during loading (via Suspense or manual loading state)

**Acceptance criteria**: KPIs show real data; page renders in <1s; works with 0 events (empty state)

---

### TASK-021: Attendees Search, Filter & CSV Export
**ID**: TASK-021  
**Phase**: 2  
**Effort**: 3h | **Risk**: Low  
**Depends on**: TASK-013

**Files to modify**: `src/app/org/[orgSlug]/events/[eventSlug]/attendees/page.tsx`

**Instructions**:
1. Convert to `'use client'` component (or add search params to server component)
2. Add `FilterBar` with:
   - Text search input (filter by name, email client-side)
   - Status filter dropdown (All / REGISTERED / CHECKED_IN / CANCELLED)
   - Ticket tier filter dropdown
3. Implement CSV export:
   ```ts
   const csv = [
     ['Name','Email','Ticket','Status','Date'],
     ...filtered.map(a => [a.name, a.email, a.ticketTier?.name, a.status, new Date(a.registeredAt).toLocaleDateString()])
   ].map(row => row.join(',')).join('\n')
   const blob = new Blob([csv], { type: 'text/csv' })
   const url = URL.createObjectURL(blob)
   // trigger download
   ```
4. Add registration count + capacity progress bar above table
5. Add `<EmptyState>` for 0 attendees

**Acceptance criteria**: Search filters live; CSV download triggers; progress bar shows % filled

---

### TASK-022: Event Overview Improvements
**ID**: TASK-022  
**Phase**: 2  
**Effort**: 1.5h | **Risk**: Low  
**Depends on**: TASK-010

**Files to modify**: `src/app/org/[orgSlug]/events/[eventSlug]/overview/page.tsx`

**Instructions**:
1. Replace all `var(--bg-highlight)` and `var(--bg-surface-elevated)` usages — these are now defined tokens (TASK-010 fixes them)
2. Add registration capacity progress bar: `(registrations / event.capacity) * 100`
3. Add revenue summary: query `ticketTiers` with their registration counts × price
4. Fix status colors to use CSS variables instead of hardcoded values
5. Remove `var(--bg-highlight)` → use `var(--bg-surface-2)` as fallback if needed

**Acceptance criteria**: No undefined CSS variable references; progress bar renders

---

### TASK-023: Org Events List Polish
**ID**: TASK-023  
**Phase**: 2  
**Effort**: 1h | **Risk**: Very low  
**Depends on**: TASK-013

**Files to modify**: `src/app/org/[orgSlug]/events/page.tsx`

**Instructions**:
1. Replace emoji `📅` in empty state with `<CalendarDays size={48} />` Lucide icon
2. Add status filter tabs above grid: All / Draft / Planning / Published / Live / Completed
3. Cards: add status-colored left border (use `var(--green)` for LIVE, `var(--accent)` for PUBLISHED, etc.)
4. Cards: use `.card-hover` class for hover effect

**Acceptance criteria**: No emoji; status filter works; cards have clear status visual

---

## Phase 3 — Finance Dashboard & Core Features

---

### TASK-030: Finance Records API
**ID**: TASK-030  
**Phase**: 3  
**Effort**: 2h | **Risk**: Low  
**Depends on**: TASK-002 (security), None for schema

**Files to create**:
- `src/app/api/org/[orgSlug]/events/[eventSlug]/finance/records/route.ts`
- `src/app/api/org/[orgSlug]/events/[eventSlug]/finance/records/[id]/route.ts`

**See IMPLEMENTATION_PLAN §3.1 for full API contract**

**Instructions**:
1. `GET`: return `prisma.financeRecord.findMany({ where: { eventId: event.id }, include: { vendor: true } })`
2. `POST`: Zod schema validates required fields; `createdById = session.user.id`
3. `PATCH`: Partial update with Zod `.partial()`; `updatedById = session.user.id`
4. `DELETE`: verify record belongs to this event before deleting
5. All routes: `requireOrgRole(userId, orgSlug, [OWNER, FINANCE])`

**Acceptance criteria**: CRUD works; 403 for non-OWNER/FINANCE users; 404 for wrong eventId

---

### TASK-031: Vendors API
**ID**: TASK-031  
**Phase**: 3  
**Effort**: 1.5h | **Risk**: Low  
**Depends on**: None

**Files to create**:
- `src/app/api/org/[orgSlug]/events/[eventSlug]/vendors/route.ts`
- `src/app/api/org/[orgSlug]/events/[eventSlug]/vendors/[id]/route.ts`

**Pattern**: Same as TASK-030 but for `Vendor` model. `requireOrgRole(OWNER, FINANCE, EVENT_MANAGER)`.

---

### TASK-032: Finance Dashboard UI
**ID**: TASK-032  
**Phase**: 3  
**Effort**: 4h | **Risk**: Medium  
**Depends on**: TASK-030, TASK-031, TASK-011 (Toast)

**Files to modify**: `src/app/org/[orgSlug]/events/[eventSlug]/finance/page.tsx`

**Current state**: Shows ticket tiers only. Rename section clearly; add tabs.

**UI Layout**:
```
Page: "Finance & Operations"
Subtitle: total budget | total spent | variance
─────────────────────────────────
KPI strip: Budgeted | Actual Spend | Variance | Revenue
─────────────────────────────────
Tabs: [Ticket Tiers] [Budget Records] [Vendors]

Ticket Tiers tab: (existing code, unchanged)

Budget Records tab:
  + Add Record button → slide-in form
  Table: Type | Description | Category | Budgeted | Actual | Status | Vendor | Actions

Vendors tab:
  + Add Vendor button → modal form
  Table: Name | Category | Contact | Status | Actions
```

**Instructions**:
1. Add tab state (useState: 'tiers' | 'records' | 'vendors')
2. Fetch `/finance/records` and `/vendors` in separate `useEffect` calls
3. KPI computation: sum `budgetedAmount` and `actualAmount` from records
4. Use `ConfirmModal` for delete actions (replace ad-hoc inline modal)
5. Use `Toast` for success/error feedback (replace error state variables)
6. `recharts` BarChart: budgeted vs actual per category

**Acceptance criteria**: CRUD works for records and vendors; chart renders; delete uses ConfirmModal

---

### TASK-033: QR Check-In (Manual Button)
**ID**: TASK-033  
**Phase**: 3  
**Effort**: 2h | **Risk**: Low  
**Depends on**: TASK-021 (attendees page)

**Files to create**: `src/app/api/org/[orgSlug]/events/[eventSlug]/check-in/route.ts`  
**Files to modify**: `src/app/org/[orgSlug]/events/[eventSlug]/attendees/page.tsx`

**API**: See IMPLEMENTATION_PLAN §3.1

**Instructions**:
1. API route: validate `registrationId`; verify registration belongs to this event; set `status = CHECKED_IN`; return updated record
2. Attendees page: add "Check In" button in action column for REGISTERED status
3. Button on click: PATCH `/check-in`, update local state on success, show Toast
4. Checked-in row: show green badge instead of button

**Acceptance criteria**: Check-in updates status in DB; UI reflects change without page reload

---

### TASK-034: Email Integration (Resend)
**ID**: TASK-034  
**Phase**: 3  
**Effort**: 3h | **Risk**: Medium (external service)  
**Depends on**: None

**Files to create**: `src/lib/email.ts`

**Instructions**:
1. `npm install resend`
2. Create `lib/email.ts`:
```ts
import { Resend } from 'resend'
const resend = new Resend(process.env.RESEND_API_KEY)

export async function sendRegistrationConfirmation(params: {
  to: string; name: string; eventName: string;
  tierName: string; registrationId: string
}) { ... }
```
3. Email HTML template: event name, ticket tier, attendee name, registration ID (as QR placeholder)
4. Call `sendRegistrationConfirmation` inside `prisma.$transaction` callback in `/api/public/events/[eventSlug]/register/route.ts` after `createMany`
5. Fix `RegistrationModal.tsx` success copy: "Check your email for your ticket confirmation"

**Acceptance criteria**: Email arrives on successful registration; existing registration flow still works if Resend fails (wrap in try/catch — email failure should not roll back registration)

---

## Phase 4 — Auth & Team Management

---

### TASK-040: Google OAuth
**ID**: TASK-040  
**Phase**: 4  
**Effort**: 2h | **Risk**: Low  
**Depends on**: None

**Files to modify**: `src/lib/auth.ts`, `src/app/(auth)/login/page.tsx`, `src/app/(auth)/signup/page.tsx`

**Instructions**:
1. Add to `lib/auth.ts`: `import Google from 'next-auth/providers/google'`
2. Add to `providers` array: `Google({ clientId: process.env.GOOGLE_CLIENT_ID!, clientSecret: process.env.GOOGLE_CLIENT_SECRET! })`
3. Add `GOOGLE_CLIENT_ID` and `GOOGLE_CLIENT_SECRET` to `.env.example`
4. Add "Continue with Google" button to both login and signup pages
5. Test: new OAuth user gets org creation redirect (onboarding)

**Acceptance criteria**: Google OAuth sign-in creates user, redirects to onboarding for new users

---

### TASK-041: Password Reset Flow
**ID**: TASK-041  
**Phase**: 4  
**Effort**: 3h | **Risk**: Low  
**Depends on**: TASK-034 (Resend)

**Files to create**:
- `src/app/api/auth/forgot-password/route.ts`
- `src/app/api/auth/reset-password/route.ts`
- `src/app/(auth)/forgot-password/page.tsx`
- `src/app/(auth)/reset-password/page.tsx`

**Flow**:
1. User clicks "Forgot password?" on login page
2. `POST /api/auth/forgot-password { email }` → create `PasswordResetToken`, send email via `lib/email.ts`
3. Email link: `https://app/auth/reset-password?token=<token>`
4. Reset page: form with new password + confirm
5. `POST /api/auth/reset-password { token, password }` → validate token not expired/used, hash password, mark token used

**Acceptance criteria**: Token expires after 1h; used token rejected; email arrives within 60s

---

### TASK-042: Org Team Management UI
**ID**: TASK-042  
**Phase**: 4  
**Effort**: 5h | **Risk**: Medium  
**Depends on**: TASK-002 (invitation email gate), TASK-034 (Resend)

**Files to create**:
- `src/app/api/org/[orgSlug]/members/route.ts`
- `src/app/api/org/[orgSlug]/members/[id]/route.ts`
- `src/app/api/org/[orgSlug]/invitations/route.ts`

**Files to modify**: `src/app/org/[orgSlug]/settings/page.tsx` (add Team tab)

**UI**: Org Settings page → add "Team" tab:
- Members table: name, email, role, joined date, change role select, remove button
- Invite section: email input + role select + "Send Invite" button

**Acceptance criteria**: Invitation email sent; invitee joins at correct role; member removal works

---

## Phase 5 — Analytics & Intelligence

---

### TASK-050: Event Analytics API + Charts
**ID**: TASK-050  
**Phase**: 5  
**Effort**: 4h | **Risk**: Low  
**Depends on**: TASK-001 (fix org scoping first)

**Files to create**:
- `src/app/api/org/[orgSlug]/events/[eventSlug]/analytics/route.ts`
- `src/app/org/[orgSlug]/events/[eventSlug]/analytics/page.tsx` (new page)

**Files to modify**: `src/components/layout/OrgSidebar.tsx` (add Analytics link)

**Charts** (all using `recharts` — already installed):
1. `AreaChart`: registrations over time (by day)
2. `PieChart`: attendees by ticket tier
3. `BarChart`: top 10 universities/institutions
4. `BarChart`: attendees by track
5. KPI strip: total registered, check-in rate, capacity %

**Acceptance criteria**: All charts render with real data; empty state for 0 registrations

---

### TASK-051: Schema Cleanup Migration
**ID**: TASK-051  
**Phase**: 5  
**Effort**: 1h | **Risk**: Medium (migration)  
**Depends on**: TASK-050 (analytics no longer uses ticketType string)

**Instructions**:
1. Verify all reads of `Registration.ticketType` are replaced with `Registration.ticketTier.name`
2. Create Prisma migration: `npx prisma migrate dev --name remove_legacy_fields`
3. Schema changes:
   - Remove `Registration.ticketType String` field
   - Remove `Session.registered Int @default(0)` or wire increment
   - Remove `RegistrationDayStat` model
4. Seed test to verify app still works

**Acceptance criteria**: Migration runs without data loss; build succeeds

---

## Phase 6 — Polish & Launch Readiness

---

### TASK-060: Accessibility Audit & Fixes
**ID**: TASK-060  
**Phase**: 6  
**Effort**: 3h | **Risk**: Low

**Checklist**:
- [ ] All icon-only buttons have `aria-label`
- [ ] All modals have `role="dialog"` and `aria-modal="true"` and trap focus
- [ ] All form errors use `aria-describedby` pointing to error element
- [ ] Color contrast ≥ 4.5:1 on all text (verify amber on dark: `#F0A500` on `#0D1117` = 7.5:1 ✓)
- [ ] All images have `alt` text
- [ ] Keyboard navigation works for sidebar, tabs, modals
- [ ] `prefers-reduced-motion` guard applied (TASK-010)

---

### TASK-061: Performance Optimization
**ID**: TASK-061  
**Phase**: 6  
**Effort**: 2h | **Risk**: Low

**Instructions**:
1. Add `connection_limit=3` to DATABASE_URL in `.env.example` documentation
2. Add Prisma query logging in development only
3. Audit N+1 queries in event/attendee list pages — add `include` or use aggregate
4. Verify `prisma.ts` uses `globalThis` singleton pattern (already implemented — verify)
5. Add `loading.tsx` files in `/org/` route segments for Next.js Suspense streaming

**Acceptance criteria**: No N+1 queries in attendees/events list; loading.tsx provides instant feedback
