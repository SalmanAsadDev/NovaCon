# FRONTEND_REVAMP_SPEC.md — NovaCon Frontend Design Specification
> Version: 1.0 | Date: 2026-11-10 | Mode: Operate (dashboard) + Persuade (landing)

---

## 1. Design Direction

**Aesthetic**: Premium Enterprise SaaS — Linear/Vercel/Retool-caliber dark dashboard with a distinctive amber intelligence identity.

**Principles** (from ui-ux-pro-max Operate mode):
- Scanability and consistency over expression
- Precision in data presentation; brand lives in details
- Predictable navigation — users never wonder where they are
- Density: 8/10 — information-dense without clutter
- Motion: 4/10 — purposeful microinteractions only

**Retained from current design**: Dark-mode-first aesthetic, Sora + Inter typography, amber accent, component architecture. The existing token system is a solid foundation — we refine rather than replace.

**What changes**:
- Eliminate inline styles from page components → scoped CSS classes
- Fix missing/inconsistent tokens (`--bg-highlight`, `--bg-surface-elevated`, #00ff80)
- Add light mode token set
- Replace emoji icons with Lucide SVG
- Add proper toast/notification system
- Add loading skeleton states
- Standardize component usage (ConfirmModal, table patterns)
- Improve information hierarchy on all dashboard pages

---

## 2. Color System

### 2.1 Dark Mode Tokens (retained + additions)

```css
:root {
  /* Backgrounds */
  --bg-base:           #0D1117;   /* page background */
  --bg-surface:        #161B22;   /* cards, sidebar */
  --bg-surface-2:      #1C2128;   /* elevated elements, inputs */
  --bg-surface-3:      #21262D;   /* table headers, nested surfaces */
  --bg-highlight:      #1F2937;   /* NEW: hover highlights, subtle fills */
  --bg-surface-elevated: #21262D; /* NEW: alias — components already reference this */

  /* Borders */
  --border:            #21262D;
  --border-strong:     #30363D;
  --border-focus:      #F0A500;   /* accent focus ring */

  /* Accent — Amber Intelligence */
  --accent:            #F0A500;
  --accent-hover:      #FFB820;
  --accent-dim:        rgba(240, 165, 0, 0.1);
  --accent-dim-hover:  rgba(240, 165, 0, 0.18);

  /* Text */
  --text-primary:      #E6EDF3;
  --text-secondary:    #8B949E;
  --text-muted:        #484F58;
  --text-inverse:      #0D1117;   /* text on accent backgrounds */

  /* Semantic — Status */
  --green:             #3FB950;
  --green-dim:         rgba(63, 185, 80, 0.12);
  --green-hover:       #46C759;
  --red:               #F85149;
  --red-dim:           rgba(248, 81, 73, 0.12);
  --red-hover:         #FF5950;
  --blue:              #58A6FF;
  --blue-dim:          rgba(88, 166, 255, 0.12);
  --yellow:            #F0A500;   /* alias accent for warning use */
  --yellow-dim:        rgba(240, 165, 0, 0.12);
  --purple:            #BC8CFF;
  --purple-dim:        rgba(188, 140, 255, 0.12);
  --cyan:              #39D0D8;
  --cyan-dim:          rgba(57, 208, 216, 0.12);

  /* Spacing & Shape */
  --radius-xs:         4px;
  --radius-sm:         6px;
  --radius:            10px;
  --radius-lg:         14px;
  --radius-xl:         20px;

  /* Layout */
  --sidebar-width:     240px;
  --header-height:     60px;

  /* Elevation (box shadows) */
  --shadow-sm:         0 1px 3px rgba(0,0,0,0.3), 0 1px 2px rgba(0,0,0,0.2);
  --shadow:            0 4px 12px rgba(0,0,0,0.4);
  --shadow-lg:         0 12px 32px rgba(0,0,0,0.5);
  --shadow-accent:     0 0 0 2px rgba(240, 165, 0, 0.3);
}
```

### 2.2 Light Mode Tokens (new)

```css
[data-theme="light"] {
  --bg-base:           #F5F7FA;
  --bg-surface:        #FFFFFF;
  --bg-surface-2:      #F0F2F5;
  --bg-surface-3:      #E8ECF0;
  --bg-highlight:      #EEF0F3;
  --bg-surface-elevated: #FFFFFF;
  --border:            #E1E4E8;
  --border-strong:     #C9CDD2;
  --text-primary:      #1A1F2C;
  --text-secondary:    #586069;
  --text-muted:        #959DA5;
  --text-inverse:      #FFFFFF;
  /* Semantic colors: same hex values work in light mode */
}
```

---

## 3. Typography System

### Fonts (retained)
```css
@import url('https://fonts.googleapis.com/css2?family=Sora:wght@400;500;600;700;800&family=Inter:wght@400;500;600;700&display=swap');
```

### Type Scale

| Token | Size | Weight | Font | Use |
|---|---|---|---|---|
| `--text-xs` | 11px | 500–600 | Inter | Labels, badges, table headers |
| `--text-sm` | 12px | 400–500 | Inter | Helper text, timestamps |
| `--text-base` | 14px | 400 | Inter | Body, table cells |
| `--text-md` | 15px | 500 | Inter | Secondary headings, card titles |
| `--text-lg` | 18px | 600 | Sora | Card headings, section titles |
| `--text-xl` | 22px | 600–700 | Sora | Page titles |
| `--text-2xl` | 28px | 700 | Sora | Dashboard KPI values |
| `--text-3xl` | 36px | 700–800 | Sora | Hero headings |
| `--text-hero` | clamp(40px, 6vw, 72px) | 800 | Sora | Landing hero |

**Body default**: 14px / line-height 1.6 / Inter  
**Headings**: Sora, line-height 1.25

---

## 4. Component Inventory

### 4.1 Retain & Refine
| Component | File | Action |
|---|---|---|
| `.card`, `.card-hover` | globals.css | Retain; add `--shadow-sm` |
| `.btn`, `.btn-primary`, `.btn-ghost`, `.btn-danger` | globals.css | Retain; add `min-height: 36px`, `min-width: 44px` (touch target) |
| `.badge` variants | globals.css | Retain; add `--badge-draft` |
| `.form-input`, `.form-label`, `.form-select` | globals.css | Retain; add focus-visible ring |
| `.table`, `.table-wrapper` | globals.css | Retain; add row selection state |
| `.kpi-card`, `.kpi-grid` | globals.css | Retain; refine shadow |
| `.modal-backdrop`, `.modal-card` | globals.css | Retain; add focus trap |
| `.tabs`, `.tab` | globals.css | Retain; add keyboard nav |
| `OrgSidebar` | components/layout/ | Refine: add org switcher affordance |
| `MobileTopbar` | components/layout/ | Retain; minor styling |
| `RegistrationModal` | components/events/ | Retain; fix email copy |
| `ConfirmModal` | components/ui/ | Retain; apply universally |

### 4.2 New Components Required
| Component | Location | Purpose |
|---|---|---|
| `Toast` / `useToast` | `components/ui/Toast.tsx` | App-wide success/error notifications |
| `Skeleton` | `components/ui/Skeleton.tsx` | Loading states for tables/cards |
| `PageHeader` | `components/ui/PageHeader.tsx` | Standardize title + subtitle + action area |
| `EmptyState` | `components/ui/EmptyState.tsx` | Standardize no-data states with icon + CTA |
| `StatCard` | `components/ui/StatCard.tsx` | KPI card with icon, value, delta |
| `DataTable` | `components/ui/DataTable.tsx` | Table with search, sort, pagination |
| `FilterBar` | `components/ui/FilterBar.tsx` | Search + filter controls row |

### 4.3 Delete
- `components/layout/DashboardShell.tsx`
- `components/layout/Sidebar.tsx`
- `components/layout/LiveTicker.tsx`
- `app/(auth)/register/page.tsx`

---

## 5. Navigation & Information Architecture

### Sidebar — Org Level
```
[Org Logo + Name]
─────────────────
📅 Events              /org/:slug/events
⚙️  Org Settings       /org/:slug/settings
─────────────────
[User avatar + name]
[Role badge]
[Logout]
```

### Sidebar — Event Level (when inside an event)
```
[Org Name]  ← Back to Events
[Event Name]
─────────────────
▦  Overview           /overview
👥 Attendees          /attendees
🎤 Speakers           /speakers
◫  Sessions           /sessions
💰 Finance            /finance
⚙️  Settings          /settings
```

**Changes**: Add "Team" tab to both levels once EventMember UI exists.

### Page URLs (unchanged — no routing changes required)
```
/                         Landing page
/signup                   New account
/login                    Sign in
/onboarding               Create first org
/dashboard                → redirects to org dashboard
/org/:orgSlug/            → redirects to events
/org/:orgSlug/events      Events list
/org/:orgSlug/events/new  Create event
/org/:orgSlug/events/:slug/overview
/org/:orgSlug/events/:slug/attendees
/org/:orgSlug/events/:slug/speakers
/org/:orgSlug/events/:slug/sessions
/org/:orgSlug/events/:slug/finance
/org/:orgSlug/events/:slug/settings
/events/:slug             Public event page (attendee)
```

---

## 6. Page-by-Page Specifications

### 6.1 Landing Page (`app/page.tsx`)
**Mode**: Persuade  
**Current**: Functional but heavy inline styles, emoji icon (📅), no search

**Redesigned structure**:
1. `<Header>` sticky nav: Logo | "Sign In" | "Get Started" (pill button)
2. `<Hero>` radial gradient bg, headline, subtext, 2 CTAs, `<EventCountBadge>` live stat
3. `<FeatureStrip>` 3-column icon grid (Lucide icons only — no emoji)
4. `<PublicEventsGrid>` filterable event cards with venue, date, type
5. `<Footer>` minimal: NovaCon © 2026

**Acceptance criteria**: Lighthouse performance ≥ 90; no emoji as icons; CTA contrast ≥ 4.5:1

### 6.2 Login / Signup Pages
**Current**: Functional auth card with radial gradient bg — solid

**Changes**:
- Add `prefers-reduced-motion` guard on `fadeIn` animation
- Add `aria-live` region for error messages
- Add visible focus rings on inputs
- Signup: add password strength indicator

### 6.3 Onboarding (`app/onboarding/page.tsx`)
**Current**: Org creation form — functional

**Changes**: Add step indicator (Step 1 of 1), org avatar upload placeholder

### 6.4 Events List (`/org/:slug/events`)
**Current**: Card grid — good structure but emoji `📅` in empty state

**Changes**:
- Replace emoji with `<CalendarDays>` Lucide icon
- Add status filter tabs (All / Draft / Live / Completed)
- Add search input
- Card: show `startDate`, `status badge`, registration count progress bar

### 6.5 Event Overview (`/overview`)
**Current**: Good hero card + KPI grid — retain structure

**Changes**:
- Fix `--bg-highlight` and `--bg-surface-elevated` references (define tokens)
- Replace `#00ff80` with `var(--green)`
- Add "Quick Actions" section with commonly used links
- Add registration progress bar (registered / capacity)
- Add status history / event lifecycle indicator

### 6.6 Attendees Page (`/attendees`)
**Current**: Basic table, non-functional Export CSV

**Changes**:
- Implement search (client-side filter by name/email)
- Implement filter by status (REGISTERED / CHECKED_IN / CANCELLED)
- Implement ticket tier filter
- Fix Export CSV handler (download as blob)
- Add `Skeleton` loading state
- Add check-in status progress bar

### 6.7 Speakers Page (`/speakers`)
**Current**: Not inspected but API is complete

**Expected**: Card grid with avatar, name, title, track badge, edit/delete actions

**Changes**: Standardize to use `ConfirmModal` for delete; add `EmptyState` component

### 6.8 Sessions Page (`/sessions`)
**Current**: Not inspected but API is complete

**Expected**: Table with day, time, title, track, speaker, capacity, status

**Changes**: Add day filter tabs; add `Skeleton`; use `ConfirmModal` for delete

### 6.9 Finance Page (`/finance`)
**Current**: Ticket tier management (misnamed "Finance")

**Phase 1 fix**: Rename UI section header to "Ticket Tiers & Revenue"  
**Phase 4 addition**: Add tabbed UI: "Ticket Tiers" | "Budget Records" | "Vendors"  
**Budget Records tab**: List/create/edit `FinanceRecord` entries  
**Vendors tab**: CRUD for `Vendor` model

### 6.10 Event Settings (`/settings`)
**Current**: Form with event metadata — functional  
**Changes**: Add "Ticket Tier management" link pointing to finance page; add danger zone (archive/delete event)

### 6.11 Org Settings (`/org/:slug/settings`)
**Current**: Functional form  
**Changes**: Add Team tab (invite members, manage roles) once implemented

### 6.12 Public Event Page (`/events/:slug`)
**Current**: Full page with agenda, speakers, registration modal  
**Changes**: Add event banner image display; improve registration modal CTA prominence

---

## 7. Tables, Forms & Data Visualization Standards

### Tables
- Always use `.table-wrapper` for horizontal scroll on mobile
- Column headers: 11px / 600 / uppercase / `var(--text-muted)` / `var(--bg-surface-2)` background
- Row hover: `var(--bg-surface-2)` background
- Last row: no bottom border
- Sticky first column on mobile-critical tables (attendees)

### Forms
- Label above input, always visible (no placeholder-only labels)
- Error message immediately below the failing field
- Submit button: right-aligned or full-width on mobile
- Required fields: asterisk `*` after label
- Minimum touch target: 44×44px for all interactive elements

### Data Visualization
- Use `recharts` (already installed)
- Chart card: `var(--bg-surface)` background, 20px padding
- Always include axis labels and tooltips
- Use semantic color variables (`var(--accent)` for primary series, `var(--blue)` for secondary, `var(--green)` for positive, `var(--red)` for negative)
- Never use color alone to convey meaning — add pattern fill or label

---

## 8. Responsive Behavior

| Breakpoint | Behavior |
|---|---|
| `>992px` | Desktop: fixed sidebar + scrollable content |
| `768–992px` | Tablet: sidebar collapses to icon-only, 2-col grids → 1-col |
| `<768px` | Mobile: hidden sidebar, `MobileTopbar` with drawer |
| `<540px` | Phone: 1-col grids, full-width buttons, reduced KPI padding |

---

## 9. Accessibility Requirements

- All interactive elements reachable by keyboard (`Tab`, `Enter`, `Escape` for modals)
- Focus rings visible: `outline: 2px solid var(--border-focus); outline-offset: 2px`
- Color contrast: text ≥ 4.5:1 on background (WCAG AA)
- Semantic HTML: `<nav>`, `<main>`, `<header>`, `<aside>` — not just `<div>`
- ARIA: `aria-label` on icon-only buttons; `role="dialog"` + `aria-modal="true"` on modals; `aria-live="polite"` on status messages
- `prefers-reduced-motion`: guard all `animation` and `transition` declarations
- `alt` text on all images; decorative images: `alt=""`

---

## 10. Loading, Empty, Error, Success States

### Loading
- Page-level: `Skeleton` components matching the page structure (not spinners)
- Button submitting: replace button text with `<Spinner size={14} />` + "Saving..."
- Table loading: 5 skeleton rows

### Empty State (`.empty-state`)
- Icon (Lucide SVG, 40px, `var(--text-muted)`)
- Title: "No [entity] yet"
- Subtitle: contextual hint
- CTA button when user has permission to create

### Error State
- Inline API errors: `<div className="alert alert-error">` with icon + message
- Toast for async failures: auto-dismiss after 5s, manual dismiss

### Success State
- Toast: `alert-success` variant, 3s auto-dismiss
- Form: redirect or reset with success message

---

## 11. Animation Standards

- Page transitions: `fadeIn` 0.25s ease (existing — retain)
- Modal open: `modalScaleIn` 0.22s cubic-bezier (existing — retain)
- Sidebar drawer slide: `transform: translateX` 0.28s cubic-bezier (existing — retain)
- Hover transitions: `all 0.15s` (existing — retain)
- Guard all animations:
```css
@media (prefers-reduced-motion: reduce) {
  *, *::before, *::after {
    animation-duration: 0.01ms !important;
    transition-duration: 0.01ms !important;
  }
}
```

---

## 12. Proposed Frontend Architecture

```
src/
├── app/                       Next.js App Router (unchanged structure)
├── components/
│   ├── ui/                    Design system primitives
│   │   ├── Toast.tsx           NEW
│   │   ├── Skeleton.tsx        NEW
│   │   ├── PageHeader.tsx      NEW
│   │   ├── EmptyState.tsx      NEW
│   │   ├── StatCard.tsx        NEW
│   │   ├── DataTable.tsx       NEW
│   │   ├── FilterBar.tsx       NEW
│   │   └── ConfirmModal.tsx    EXISTING — retain
│   ├── events/                 Event-specific components
│   │   └── RegistrationModal.tsx   EXISTING — retain + fix
│   └── layout/                 App shell
│       ├── OrgSidebar.tsx      EXISTING — refine
│       └── MobileTopbar.tsx    EXISTING — retain
├── lib/                        Server utilities (unchanged)
└── styles/                     NEW: component CSS modules (optional phase 2)
```

---

## 13. Migration Strategy

### Phase approach (preserves all existing functionality):

**Step 1 — Token fixes** (no visual regression risk):  
Add missing CSS variables to `globals.css`. Replace `#00ff80` with `var(--green)` across components. No behavior change.

**Step 2 — New UI components** (additive only):  
Implement `Toast`, `Skeleton`, `EmptyState`, `PageHeader`. No existing code removed yet.

**Step 3 — Page-by-page inline style replacement**:  
Per page, extract inline `style={{...}}` to named CSS classes. Test each page. No logic change.

**Step 4 — Dead code removal**:  
Delete `DashboardShell`, `Sidebar`, `LiveTicker`, dead auth page. Run `next build` to verify no imports broken.

**Step 5 — Feature additions** (new pages/tabs):  
Add finance dashboard tab, vendor management, analytics improvements. Each is additive.

**Non-changes**: No framework swap, no Tailwind migration, no routing changes.
