# AI_AGENT_HANDOFF.md — NovaCon Agent Operating Guide
> Version: 1.0 | Date: 2026-11-10

This guide tells you everything needed to pick up a task and implement it correctly without additional research.

---

## 1. Required Reading Order

Before touching any code:

1. `PROJECT_BASELINE.md` — What exists and what's broken
2. `FRONTEND_REVAMP_SPEC.md` — Design system, component standards, page specs
3. `TASK_BACKLOG.md` — Find your task; read its full spec
4. `IMPLEMENTATION_PLAN.md §3` — Technical contracts for the task's API/DB changes

**Then**:
5. Read every file listed in the task's "Inspect" section
6. Run `npm run build` once before starting — confirm baseline builds clean

---

## 2. Architecture Conventions

### Framework
- **Next.js 16 App Router** — `app/` directory, React Server Components by default
- Use `'use client'` only when you need browser APIs, event handlers, or React state
- Params are Promises in Next.js 16: `const { orgSlug } = await params`

### Styling
- **Vanilla CSS only** — global classes in `src/app/globals.css`
- Use existing CSS classes: `.card`, `.btn`, `.btn-primary`, `.table`, `.badge`, etc.
- Never use Tailwind classes (installed but unused — do not start using it)
- Never add inline `style={{}}` for layout in page components — extract to CSS classes
- Use CSS custom properties from `:root` for all colors: `var(--accent)`, `var(--bg-surface)`, etc.
- Do not hardcode hex colors in components — always use CSS variables

### Authentication
- Server components: `const session = await auth()` from `@/lib/auth`
- Route handlers: `const session = await auth()` then check `session?.user?.id`
- Authorization: `await requireOrgRole(userId, orgSlug, [OrgRole.OWNER, ...])` from `@/lib/auth-helpers`
- Always check `authResult.authorized` before proceeding

### Database
- Use `prisma` singleton from `@/lib/prisma`
- Scope all queries to the current org/event: include `orgId` or `org: { slug: orgSlug }` in `where`
- Use `prisma.$transaction()` for multi-step writes (e.g., capacity + registration)
- Prisma client: `@prisma/client` — do not re-import types from elsewhere

### Validation
- All POST/PATCH handlers: use Zod schema before any DB write
- Pattern: `const parsed = schema.safeParse(body); if (!parsed.success) return 400`
- Schema location: define at top of route file, not in lib/

### Icons
- Use `lucide-react` exclusively
- Never use emoji as icons in UI components
- Icon-only buttons must have `aria-label`

---

## 3. Task Selection Procedure

1. Open `TASK_BACKLOG.md`
2. Select the lowest-numbered task in the lowest-numbered Phase that has no incomplete dependencies
3. Check the **Depends on** field — verify all dependency tasks are marked done
4. Read the full task spec before writing any code
5. If a task spec references a file that doesn't exist at the path given, check `PROJECT_BASELINE.md §6` for path corrections

**Never skip Phase 0 tasks** — they fix security issues that could affect all subsequent work.

---

## 4. Implementation Workflow

For each task:

```
1. Read all "Inspect" files listed in the task
2. Understand current behavior before changing anything
3. Implement the smallest complete change:
   - New API route: auth check → Zod validation → DB query → response
   - New UI: use existing CSS classes; new component only if reusable
   - Modification: change only what the task requires
4. Test the change:
   - Run `npm run build` — zero TypeScript errors required
   - Test the happy path in browser
   - Test one error case (invalid input, wrong auth)
5. Mark task done
```

---

## 5. Git & Commit Conventions

```bash
# Branch naming
git checkout -b task/TASK-001-fix-analytics-org-scope

# Commit message format
<type>(<scope>): <description>

# Types: fix, feat, refactor, chore, style
# Examples:
fix(api): scope analytics and stats routes to org slug
feat(finance): add budget records CRUD API and UI
chore(cleanup): remove dead DashboardShell, Sidebar, LiveTicker components
style(globals): add missing bg-highlight and bg-surface-elevated tokens
```

One commit per task. If a task requires multiple logical steps, squash on completion.

**Co-Author line** (always include):
```
Co-Authored-By: Claude Sonnet 4.6 <noreply@anthropic.com>
```

---

## 6. Documentation Update Requirements

After completing a task:
- If you fixed a bug listed in `PROJECT_BASELINE.md §7`, update that row to "Fixed"
- If you implemented a feature from §2.3, move it to §2.1
- Do not update `ROADMAP.md` or `developer_onboarding.md` unless explicitly instructed

---

## 7. How to Report Completion

After implementing a task:

```
TASK-001 COMPLETE
Files changed: [list]
Tests passing: npm run build ✓
Behavior verified: [what you tested]
Next task: TASK-002
```

If blocked:

```
BLOCKED on TASK-030
Reason: Prisma relation on OrgInvitation.orgId is malformed — schema migration needed
Recommended fix: Add `org Organization @relation(fields: [orgId], references: [id])` to OrgInvitation model
Decision needed: Confirm cascade delete behavior
```

---

## 8. Preventing Duplicate & Conflicting Work

- Never work on a Phase 2+ task while Phase 0 is incomplete
- Never implement a feature that changes a DB table another task also changes — coordinate via schema migrations
- API routes you create must follow the contracts in `IMPLEMENTATION_PLAN.md §3.1` exactly — do not invent new paths
- If a task spec conflicts with what you find in the code, follow the code and note the discrepancy

---

## 9. Key File Locations

```
novacon-frontend/
├── src/app/globals.css              Design tokens & utility classes
├── src/app/layout.tsx               Root layout — wrap new providers here
├── src/lib/auth.ts                  NextAuth configuration
├── src/lib/auth-helpers.ts          requireOrgRole() — always use for protected routes
├── src/lib/prisma.ts                Prisma singleton — import from here
├── src/middleware.ts                Route protection — do not modify without review
├── prisma/schema.prisma             Source of truth for DB models
├── .env.local                       Local secrets (not committed)
├── .env.example                     Template for required env vars
└── vercel.json                      Deployment configuration
```

---

## 10. Common Patterns

### Protected Route Handler
```ts
export async function POST(req: NextRequest, { params }: { params: Promise<{ orgSlug: string }> }) {
  const session = await auth()
  if (!session?.user?.id) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
  const { orgSlug } = await params
  const authResult = await requireOrgRole(session.user.id, orgSlug)
  if (!authResult.authorized) return authResult.response
  // ... handler logic using authResult.membership.orgId
}
```

### Standard Form Submission Pattern (Client Component)
```ts
const [loading, setLoading] = useState(false)
const [error, setError] = useState('')

const handleSubmit = async (e: React.FormEvent) => {
  e.preventDefault()
  setLoading(true); setError('')
  try {
    const res = await fetch('/api/...', { method: 'POST', headers: {'Content-Type':'application/json'}, body: JSON.stringify(data) })
    if (!res.ok) { const e = await res.json(); throw new Error(e.error) }
    toast.success('Saved successfully')
  } catch (e: any) {
    setError(e.message)
  } finally {
    setLoading(false)
  }
}
```

### Prisma Query Scoped to Org
```ts
const event = await prisma.event.findFirst({
  where: { slug: eventSlug, org: { slug: orgSlug } }
})
if (!event) return NextResponse.json({ error: 'Not found' }, { status: 404 })
```
