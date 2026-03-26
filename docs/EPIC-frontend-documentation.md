# EPIC: HRIS Frontend Documentation

**Epic Title:** Frontend SPA Documentation Suite
**Epic Key:** HRIS-DOC
**Priority:** Medium
**Labels:** documentation, frontend, spa, react, onboarding
**Branch:** `release/0.0.2`

## Description

Create comprehensive documentation for the new React SPA frontend (`frontend/`) that is replacing the Laravel/Inertia frontend. This documentation covers architecture, API integration, migration patterns, and developer onboarding — everything needed for a new developer to understand, run, and contribute to the project.

**Repos:**
- Frontend SPA: `RocketPartners/rp-management-system` — branch `release/0.0.2`, folder `frontend/`
- Spring Boot Backend: `jaemie-campo-rp/hr_management_backend`

---

## Child Work Items

### HRIS-D01: Frontend Architecture Documentation
**Type:** Task
**Priority:** High
**Assignee:** TBD
**Description:**
Document the frontend SPA architecture — project structure, key patterns, routing, state management, and component conventions.

**Document:** `docs/frontend/architecture.md`

**Sections to Cover:**

#### 1. Tech Stack
| Layer | Technology | Version |
|-------|-----------|---------|
| Framework | React | 19.x |
| Language | TypeScript (strict) | 5.9.x |
| Build tool | Vite | 8.x |
| Routing | React Router DOM | 7.x |
| Styling | Tailwind CSS | 4.x |
| UI Components | Radix UI (shadcn/ui pattern) | Latest |
| Icons | Lucide React | 1.6.x |
| SEO/Head | react-helmet-async | 3.x |
| Calendar | FullCalendar | 6.x |
| Date utils | date-fns | 4.x |
| Animations | Framer Motion | 12.x |
| Linting | ESLint + Prettier | 9.x / 3.x |

#### 2. Project Structure
```
frontend/
  src/
    components/          # Shared UI components (TSX)
      ui/                # shadcn/ui primitives (button, card, dialog, etc.)
      route-guards.tsx   # ProtectedRoute, GuestRoute wrappers
    contexts/
      auth-context.tsx   # AuthProvider, useAuth() hook
    hooks/
      use-timezone.tsx   # TimezoneProvider + useTimezone()
      usePermission.ts   # Permission checking (can, canAll, cannot)
    layouts/
      AuthenticatedLayout.tsx  # Sidebar + top nav (uses Outlet)
    lib/
      spring-boot-api.ts       # apiFetch(), login(), logout(), token mgmt
      utils.ts                 # cn() utility
    pages/
      Auth/Login.tsx           # Login page
      Employees/
        Dashboard.tsx          # Employee dashboard
        Leaves/                # MyLeaves, Apply, Show, Edit (all TSX)
    types/
      index.d.ts               # All TypeScript interfaces
    router.tsx                 # React Router config (lazy loading)
    main.tsx                   # App entry point
```

#### 3. Key Architectural Decisions
- **No Inertia.js** — Standalone SPA, no server-side rendering dependency
- **Layout as Route Wrapper** — `AuthenticatedLayout` uses `<Outlet />`, nested in router config (not passed as a prop wrapper)
- **Lazy Loading** — All page components loaded via `React.lazy()` with a shared `SuspenseLayout` fallback
- **Token-based Auth** — JWT access/refresh tokens stored in `localStorage`, auto-refresh on 401
- **Permission-gated Navigation** — Sidebar sections show/hide based on `usePermission().can()` checks
- **TypeScript Strict** — All new pages must be `.tsx` with explicit interfaces (no `any`)

#### 4. State Management Pattern
- **Auth state:** React Context (`AuthProvider`) — user object, login/logout, isAuthenticated
- **Timezone state:** React Context (`TimezoneProvider`) — selected timezone, persisted to localStorage
- **Page state:** Local `useState` per page (no global store like Redux)
- **Server state:** Direct `apiFetch()` calls in `useEffect` / event handlers (no React Query yet)

#### 5. Component Conventions
- Shared UI components: `components/ui/*.tsx` (shadcn/ui pattern, Radix primitives)
- Page components: `pages/**/*.tsx` (one default export per file)
- Hooks: `hooks/*.ts` or `hooks/*.tsx` (if they contain JSX like providers)
- Types: centralized in `types/index.d.ts`

**Acceptance Criteria:**
- [ ] Document covers all sections above
- [ ] Includes a visual architecture diagram (Mermaid or ASCII)
- [ ] All file paths are accurate against current codebase
- [ ] Reviewed by at least 1 team member

---

### HRIS-D02: API Integration Documentation
**Type:** Task
**Priority:** High
**Assignee:** TBD
**Description:**
Document the Spring Boot API integration layer — endpoint catalog, request/response shapes, auth token flow, and error handling.

**Document:** `docs/frontend/api-integration.md`

**Sections to Cover:**

#### 1. API Client (`lib/spring-boot-api.ts`)
- Base URL: `VITE_SPRING_BOOT_API_URL` env var (default: `http://localhost:8080/api/v1`)
- `apiFetch(path, options)` — Authenticated fetch wrapper
- Auto-refresh: If token expired or 401 returned, calls `/auth/refresh` and retries
- Token storage: `localStorage` keys `accessToken`, `refreshToken`
- All requests include `Content-Type: application/json` + `Authorization: Bearer <token>`

#### 2. Auth Endpoints
| Method | Path | Purpose |
|--------|------|---------|
| POST | `/auth/login` | Login, returns accessToken + refreshToken |
| POST | `/auth/refresh` | Refresh token pair |
| POST | `/auth/logout` | Invalidate refresh token |
| GET | `/auth/me` | Get current user profile |

#### 3. Leave Endpoints (Migrated)
| Method | Path | Purpose |
|--------|------|---------|
| GET | `/leave-applications/my?page=&size=&sort=` | My leave requests (paginated) |
| GET | `/leave-applications/balances/my` | My leave balances |
| GET | `/leave-applications/{id}` | Single leave request detail |
| POST | `/leave-applications` | Create leave request |
| PUT | `/leave-applications/{id}` | Update pending leave request |
| POST | `/leave-applications/{id}/cancel` | Cancel pending leave |
| POST | `/leave-applications/{id}/request-cancellation` | Request cancellation of approved leave |
| GET | `/leave-types/active` | Active leave types list |
| GET | `/users/potential-approvers` | List of potential leave approvers |

#### 4. Standard Response Format
```typescript
// Success
{ status: "success", message: "...", data: T }

// Paginated
{ status: "success", message: "...", data: {
    content: T[],
    totalPages: number,
    totalElements: number,
    number: number,     // current page (0-indexed)
    size: number,
    first: boolean,
    last: boolean
}}

// Error
{ status: "error", message: "...", errors?: Record<string, string> }
```

#### 5. Spring Boot DTO Field Naming
- All fields are **camelCase** (not snake_case like Laravel)
- Status values are **UPPERCASE**: `PENDING_MANAGER`, `PENDING_HR`, `APPROVED`, `REJECTED_BY_MANAGER`, `REJECTED_BY_HR`, `CANCELLED`, `PENDING_CANCELLATION`
- Dates are ISO strings: `"2026-03-25T00:00:00"`
- See `types/index.d.ts` for full interface definitions

#### 6. Error Handling Pattern
```typescript
const res = await apiFetch('/endpoint', { method: 'POST', body: JSON.stringify(data) });
const json = await res.json();

if (res.ok) {
    // Success — json.data contains the result
} else {
    if (json.errors) {
        // Field-level validation errors — Record<string, string>
    } else {
        // General error — json.message
    }
}
```

**Acceptance Criteria:**
- [ ] All currently migrated endpoints are documented with request/response examples
- [ ] Auth token flow is explained with a sequence diagram
- [ ] Error handling patterns are documented with code examples
- [ ] TypeScript interface references link to `types/index.d.ts`

---

### HRIS-D03: Migration Guide (Inertia to SPA)
**Type:** Task
**Priority:** High
**Assignee:** TBD
**Description:**
Document the established patterns for migrating pages from the old Laravel/Inertia frontend to the new standalone React SPA. This is the playbook for migrating the remaining ~40 pages.

**Document:** `docs/frontend/migration-guide.md`

**Sections to Cover:**

#### 1. Migration Checklist (Per Page)
1. Read the source `.jsx` file from the Laravel project
2. Create a new `.tsx` file in the corresponding `frontend/src/pages/` path
3. Define TypeScript interfaces for all props, state, and API responses
4. Replace all Inertia patterns (see table below)
5. Connect to Spring Boot API via `apiFetch()`
6. Add route to `router.tsx` (replace `<ComingSoon />` placeholder)
7. Delete the old `.jsx` file if it existed in `frontend/src/`
8. Run `npx vite build` to verify
9. Test in browser

#### 2. Pattern Replacement Table

| Laravel/Inertia Pattern | React SPA Replacement |
|------------------------|-----------------------|
| `import { Head } from '@inertiajs/react'` | `import { Helmet } from 'react-helmet-async'` |
| `<Head title="Page" />` | `<Helmet><title>Page</title></Helmet>` |
| `import { Link } from '@inertiajs/react'` | `import { Link } from 'react-router-dom'` |
| `<Link href={route('name')}>`| `<Link to="/path">` |
| `import { router } from '@inertiajs/react'` | `import { useNavigate } from 'react-router-dom'` |
| `router.post(url, data)` | `await apiFetch(url, { method: 'POST', body: JSON.stringify(data) })` |
| `router.get(url)` | `navigate(url)` |
| `usePage().props.auth.user` | `useAuth().user` |
| `usePage().props.flash` | Local `useState<string>('')` for success/error messages |
| `usePage().url` | `useLocation().pathname` |
| `useForm({ ... })` (Inertia) | `useState<FormData>({ ... })` + manual submit |
| `route('named.route')` | Hardcoded path string (`'/my-leaves'`) |
| `{ auth, leaveRequest }` (props) | Fetch data in `useEffect` via `apiFetch()` + `useParams()` for IDs |
| `AuthenticatedLayout` as wrapper | Layout via router nesting (`<Outlet />`) — no wrapper needed |
| `preserveScroll: true` | Not needed (SPA handles scroll natively) |

#### 3. Field Name Conversion
| Laravel (snake_case) | Spring Boot (camelCase) |
|---------------------|------------------------|
| `leave_type.name` | `leaveTypeName` |
| `start_date` | `startDate` |
| `remaining_days` | `remainingDays` |
| `pending_manager` | `PENDING_MANAGER` |
| `leave_type.color` | `leaveTypeColor` |
| `assigned_manager.name` | `assignedManagerName` |

#### 4. Data Fetching Pattern
```typescript
// Old (Inertia — data passed as props from controller)
export default function MyPage({ auth, leaveRequests, balances }) { ... }

// New (SPA — fetch from API on mount)
export default function MyPage() {
    const [leaveRequests, setLeaveRequests] = useState<LeaveApplicationResponse[]>([]);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        const fetchData = async () => {
            const res = await apiFetch('/leave-applications/my');
            if (res.ok) {
                const json = await res.json();
                setLeaveRequests(json.data.content || []);
            }
            setLoading(false);
        };
        fetchData();
    }, []);
}
```

#### 5. Pages Remaining to Migrate
| Category | Pages | Count |
|----------|-------|-------|
| Calendar | Index, Filters, Sidebar, EventModal, WFHModal | 5 |
| My WFH | Index | 1 |
| My Assets | MyAssets, Apply, Show | 3 |
| Admin Dashboard | Index | 1 |
| Admin Users | Index, Create, Edit, Show, PendingApprovals, Permissions, Import | 7 |
| Admin Roles | Index, Create, Edit, Show | 4 |
| Admin Teams | Index, CreateEdit, Show | 3 |
| Admin Leaves | Index, Apply, Show, PendingApprovals, Types, CreateType, EditType, Balances | 8 |
| Admin Inventory | Index, Create, Edit, Show | 4 |
| Admin Assets | Index, Edit, Assign | 3 |
| Admin Projects | Index, Create, Edit, Show | 4 |
| Admin Tasks | Index, Create, Kanban | 3 |
| Admin Onboarding | Invites (Index, Create, Show), Submissions (Index, Review), Checklist, Form | 7 |
| Admin Announcements | Index, Create, Edit, Show | 4 |
| Admin Holidays | Index | 1 |
| Profile | Edit + 3 Partials | 4 |
| Settings | Index | 1 |
| Support | Index | 1 |
| **Total** | | **~64** |

**Acceptance Criteria:**
- [ ] Pattern replacement table is complete and accurate
- [ ] Includes a worked example of a full page migration (e.g., MyLeaves)
- [ ] Remaining pages inventory is accurate
- [ ] New developers can follow the guide to migrate a page independently

---

### HRIS-D04: Developer Onboarding Guide
**Type:** Task
**Priority:** High
**Assignee:** TBD
**Description:**
Create a getting-started guide for new developers joining the project. Covers environment setup, running both frontend and backend locally, and development workflow.

**Document:** `docs/frontend/developer-onboarding.md`

**Sections to Cover:**

#### 1. Prerequisites
| Tool | Version | Purpose |
|------|---------|---------|
| Node.js | >= 20.x | Frontend runtime |
| npm | >= 10.x | Package manager |
| Java | 21 | Spring Boot backend |
| PostgreSQL | 15+ | Database |
| Git | Latest | Version control |

#### 2. Repository Setup
```bash
# Clone the repo
git clone git@github.com:RocketPartners/rp-management-system.git
cd rp-management-system

# Switch to the frontend branch
git checkout release/0.0.2

# Install frontend dependencies
cd frontend
npm install
```

#### 3. Environment Configuration
```bash
# Copy the example env file
cp .env.example .env

# Required variables:
VITE_SPRING_BOOT_API_URL=http://localhost:8080/api/v1
```

#### 4. Running the Development Servers

**Frontend (Vite dev server):**
```bash
cd frontend
npm run dev
# Opens at http://localhost:5173
```

**Spring Boot Backend:**
```bash
# (In the hr_management_backend repo)
./mvnw spring-boot:run
# Runs at http://localhost:8080
```

#### 5. Development Workflow
- Branch from `release/0.0.2` for frontend work
- Branch naming: `feature/HRIS-XX-description` or `fix/HRIS-XX-description`
- Commit messages: Conventional commits (`feat:`, `fix:`, `refactor:`, `chore:`, `docs:`)
- All new pages must be `.tsx` with strict TypeScript interfaces
- Run `npx vite build` before pushing to verify compilation
- Run `npx prettier --write .` for formatting

#### 6. Key Files to Understand First
| File | Why |
|------|-----|
| `src/router.tsx` | All routes defined here — add new pages here |
| `src/contexts/auth-context.tsx` | Auth state + login/logout — used everywhere |
| `src/lib/spring-boot-api.ts` | API client — all backend calls go through here |
| `src/types/index.d.ts` | All TypeScript interfaces — add new types here |
| `src/layouts/AuthenticatedLayout.tsx` | Sidebar navigation — add new nav items here |
| `src/hooks/usePermission.ts` | Permission checks — gates sidebar sections |

#### 7. Common Tasks

**Add a new page:**
1. Create `src/pages/Category/PageName.tsx`
2. Add TypeScript interfaces for API data
3. Add lazy import + route in `router.tsx`
4. Add nav link in `AuthenticatedLayout.tsx` (if needed)

**Add a new API type:**
1. Add interface to `src/types/index.d.ts`
2. Import with `import type { MyType } from '@/types'`

**Add a new UI component:**
1. Use `npx shadcn@latest add <component>` or create in `src/components/ui/`

#### 8. Test Credentials (Local Dev)
| Email | Password | Role |
|-------|----------|------|
| admin@rocketpartners.com | admin123 | Super Admin |

**Acceptance Criteria:**
- [ ] A new developer can go from zero to running app in < 30 minutes
- [ ] All commands are copy-pasteable
- [ ] Environment variables are documented
- [ ] Common task workflows are clear

---

### HRIS-D05: Frontend README
**Type:** Task
**Priority:** Medium
**Assignee:** TBD
**Depends On:** HRIS-D01, HRIS-D02, HRIS-D03, HRIS-D04
**Description:**
Create a `frontend/README.md` that serves as the entry point for all frontend documentation. Links to the detailed docs created in D01-D04.

**Document:** `frontend/README.md`

**Sections:**
1. **Overview** — What this project is (standalone React SPA for HRIS)
2. **Quick Start** — 5-line setup (clone, checkout, cd, npm install, npm run dev)
3. **Tech Stack** — Summary table
4. **Project Structure** — Tree overview
5. **Documentation Links:**
   - Architecture Guide → `docs/frontend/architecture.md`
   - API Integration → `docs/frontend/api-integration.md`
   - Migration Guide → `docs/frontend/migration-guide.md`
   - Developer Onboarding → `docs/frontend/developer-onboarding.md`
6. **Scripts** — `npm run dev`, `npm run build`, `npm run lint`, `npm run preview`
7. **Migration Status** — Table showing which pages are migrated vs remaining

**Acceptance Criteria:**
- [ ] README exists at `frontend/README.md`
- [ ] All documentation links are valid
- [ ] Quick start works for a fresh clone
- [ ] Migration status table is accurate

---

## Suggested Sprint Breakdown

**Sprint 1:** HRIS-D04 (Developer Onboarding) + HRIS-D01 (Architecture)
- These unblock new team members immediately

**Sprint 2:** HRIS-D02 (API Integration) + HRIS-D03 (Migration Guide)
- These enable the team to continue migrating pages independently

**Sprint 3:** HRIS-D05 (README)
- Final polish after all detailed docs are reviewed

---

## Definition of Done
- All documentation files are in `docs/frontend/` and `frontend/README.md`
- All code examples compile and are accurate against current codebase
- Reviewed by at least 1 team member
- No stale/incorrect file paths or API endpoints
- Committed to `release/0.0.2` branch
