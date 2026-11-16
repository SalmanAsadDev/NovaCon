# NovaCon — Developer Onboarding Guide

Welcome to the NovaCon project! This document serves as a comprehensive onboarding guide to help you understand what our product is, how our technical stack is implemented, the key decisions we've made so far, and our future goals. 

---

## 1. What is NovaCon?

**NovaCon** is a multi-tenant event management and registration platform. It is designed to handle everything from large-scale conferences to small workshops. The platform serves two primary audiences:

1. **Event Organizers (Admins/Managers)**: Organizers use the **NovaCon Ops Dashboard** to create events, manage sessions, approve speakers, monitor ticket sales, track attendees, and view analytics.
2. **Attendees (Public)**: Attendees visit the public-facing event pages to view the agenda, learn about speakers, and register/purchase tickets for the event.

### Multi-Tenant Architecture
The platform is built on a multi-tenant model. An **Organization** (e.g., `xgrid-events`) can host multiple **Events** (e.g., `xgrid-events-launch-5988`). Organizers are scoped to their respective organizations, ensuring data isolation and clean URLs (e.g., `/org/:orgSlug/events/:eventSlug`).

---

## 2. Technical Implementation & Stack

We have adopted a modern, full-stack JavaScript architecture using the latest tools and best practices.

### Core Technologies
- **Framework**: [Next.js 16 (App Router)](https://nextjs.org/) with React 19.
- **Language**: TypeScript (Strict mode enabled).
- **Styling**: Vanilla CSS (`globals.css`) emphasizing custom, responsive, and dynamic designs. We intentionally avoid heavy CSS frameworks to maintain complete control over our premium UI/UX aesthetics.
- **Icons**: `lucide-react` for consistent, lightweight SVG icons.

### Backend & Database
Initially, the project was planned with a separate Express backend using JSON files for storage. We made a strategic decision to consolidate and modernize:
- **Database**: **PostgreSQL** hosted on [Neon](https://neon.tech/) (Serverless Postgres). 
- **ORM**: **Prisma** is used for database migrations, schema definitions, and type-safe database queries.
- **API Routes**: We migrated all backend logic into **Next.js Route Handlers** (`app/api/...`). This eliminated CORS issues and allowed us to deploy a single, cohesive full-stack application on Vercel.

### Authentication & Authorization
- **Library**: **NextAuth.js (Auth.js v5)** using the Prisma Adapter.
- **Strategy**: We use a `Credentials` provider with a `jwt` session strategy. Passwords are cryptographically hashed using `bcryptjs`.
- **Middleware/Proxy**: Route protection is handled in `src/proxy.ts`. It ensures that unauthenticated users cannot access the `/org` dashboards, while simultaneously preventing logged-in users from seeing the `/login` page (redirecting them securely to their dashboard).

---

## 3. Key Design & Architecture Decisions

As you navigate the codebase, you will notice several architectural patterns born from deliberate decisions during development:

> [!IMPORTANT]
> **Mobile Responsiveness is a First-Class Citizen**
> The NovaCon Ops dashboard features a complex layout. On desktop, it utilizes a fixed sidebar and a responsive grid. On mobile (≤768px), the layout completely transforms: the sidebar becomes a hidden drawer triggered by a `MobileTopbar` hamburger menu, and tables gain horizontal scroll wrappers. Never use inline styles that override media queries; always rely on CSS classes defined in `globals.css` for structural layout.

> [!TIP]
> **Prisma Connection Pooling in Development**
> Because we use Neon Serverless Postgres, fast refreshes via Next.js Turbopack can easily exhaust the database connection pool limit (throwing a `PrismaClientKnownRequestError` timeout, which sometimes masks itself as an "Invalid Credentials" error during login). We mitigate this by appending `&connection_limit=3` to the local `DATABASE_URL` and utilizing `globalThis` to cache the Prisma Client instance.

> [!NOTE]
> **Custom Event-Based Modals**
> We strictly avoid native browser dialogs (like `window.confirm()`) for destructive actions (e.g., deleting a session or speaker). Instead, we use custom-built React modals to maintain our premium design aesthetic.

---

## 4. Codebase Structure

```
novacon-frontend/
├── prisma/                  # Database schema (schema.prisma) & migrations
├── src/
│   ├── app/                 # Next.js App Router
│   │   ├── (auth)/          # Grouped auth routes (login, register)
│   │   ├── api/             # Backend REST endpoints (auth, registrations, etc.)
│   │   ├── events/          # Public-facing event pages (attendee view)
│   │   ├── org/             # Protected Org Dashboard pages
│   │   └── globals.css      # Core design tokens and responsive layout CSS
│   ├── components/          # Reusable React components
│   │   ├── events/          # Modals, Registration forms, Ticket cards
│   │   └── layout/          # OrgSidebar, MobileTopbar, Dashboard shells
│   ├── lib/                 # Utilities and configs
│   │   ├── auth.ts          # NextAuth configuration and Credentials logic
│   │   └── prisma.ts        # Prisma Client singleton
│   └── proxy.ts             # Route protection middleware logic
└── .env.local               # Local secrets (DATABASE_URL, NEXTAUTH_SECRET)
```

---

## 5. Future Goals & Roadmap

While the core event management and registration flows are functional, our roadmap includes several key features to scale NovaCon:

1. **OAuth Integration**: 
   - Add "Sign in with Google" / "Sign in with GitHub" to complement our existing Credentials provider, making onboarding seamless for both organizers and attendees.
2. **Ticketing & Payments**:
   - Integrate Stripe or a local payment gateway to handle paid ticket tiers (currently registrations are mocked as free or manually approved).
3. **Real-time Analytics**:
   - Transition our dashboard KPIs and charts from static queries to real-time streams (potentially using WebSockets or Server-Sent Events) for live check-in monitoring.
4. **Automated Emails**:
   - Integrate Resend or SendGrid to send automated QR-code tickets upon successful registration, and email reminders leading up to the event.
5. **Supabase Migration (Optional)**:
   - While Neon serves us perfectly right now, if our real-time requirements become overly complex, we may evaluate migrating to Supabase for native real-time subscriptions and built-in edge functions.

---

## Getting Started

1. Ensure your `.env.local` contains the correct `DATABASE_URL` (with `&connection_limit=3` for local dev) and `NEXTAUTH_SECRET`.
2. Run `npm install` to install dependencies.
3. Run `npx prisma generate` to build the TypeScript client.
4. Run `npm run dev` to start the Turbopack server. 
5. Start exploring the public event view at `http://localhost:3000/events/...` and the ops dashboard at `http://localhost:3000/login`.
