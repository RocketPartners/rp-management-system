# HRIS Architecture

## Overview

The HRIS (HR Management System) is a two-repo system:

- **Frontend** — React SPA in this repo under `frontend/`
- **Backend** — Spring Boot API in a separate repo (`hr_management_backend`)

The frontend communicates with the backend exclusively via REST API. Authentication is handled by Keycloak (OpenID Connect / JWT).

---

## System Diagram

```
┌─────────────┐     JWT     ┌──────────────────┐     JDBC     ┌────────────┐
│  React SPA  │────────────▶│  Spring Boot API  │────────────▶│ PostgreSQL │
│  (Vite)     │  REST/JSON  │  :8080/api/v1     │             │  :5432     │
│  :5174      │◀────────────│                   │             └────────────┘
└──────┬──────┘             └────────┬──────────┘
       │                             │
       │   OAuth2 tokens             │  User mgmt / Token validation
       ▼                             ▼
┌──────────────┐            ┌──────────────┐
│  Keycloak    │            │  Keycloak    │
│  (Browser)   │            │  Admin API   │
│  :8180       │            │  :8180       │
└──────────────┘            └──────────────┘
```

---

## Frontend Architecture

### Tech Stack

| Layer | Technology |
|-------|-----------|
| Framework | React 19 |
| Language | TypeScript 5.9 |
| Build | Vite 8 |
| Routing | React Router 7 |
| State / Data | TanStack Query 5 |
| Forms | react-hook-form 7 + zod 4 |
| UI Components | shadcn/ui (Radix UI primitives) |
| Styling | Tailwind CSS 4 |
| Calendar | FullCalendar 6 |
| Rich Text | TipTap 3 |
| Notifications | sonner |

### Directory Structure

```
frontend/src/
├── components/          # Reusable UI components
│   ├── ui/              # shadcn/ui primitives (Button, Dialog, Table, etc.)
│   ├── users/           # User-specific components (UserForm, etc.)
│   └── onboarding/      # Onboarding flow components
├── contexts/            # React context providers
│   └── auth-context.tsx # Auth state, user info, permissions
├── hooks/               # Custom React hooks
│   └── usePermission.ts # Permission checking hook
├── layouts/             # Page layouts
│   └── AuthenticatedLayout.tsx # Main app shell (sidebar, nav)
├── lib/                 # Utilities and API layer
│   ├── spring-boot-api.ts      # API client (fetch wrapper, token handling)
│   ├── api/                    # Feature-specific API functions
│   ├── constants/              # Route constants, enums
│   └── utils/                  # General utilities
├── pages/               # Page components (route targets)
│   ├── Auth/            # Login, Register, ForgotPassword
│   ├── Dashboard/       # Employee dashboard
│   ├── Users/           # User CRUD (admin)
│   ├── Employees/       # Employee self-service (Leaves, WFH, Assets)
│   ├── Calendar/        # Calendar with holidays, leaves, WFH
│   ├── Announcements/   # Company announcements feed
│   ├── Teams/           # Team management
│   ├── Departments/     # Department management
│   ├── Positions/       # Position management
│   ├── Roles/           # Role & permission management
│   ├── Holidays/        # Holiday management
│   ├── Leaves/          # Leave admin (types, balances, approvals)
│   ├── LeaveTypes/      # Leave type configuration
│   ├── LeaveBalances/   # Leave balance management
│   ├── Assets/          # Asset inventory
│   ├── Onboarding/      # Onboarding invites, submissions, portal
│   ├── Support/         # Support tickets
│   ├── Profile/         # User profile & password
│   └── AIChat/          # AI chat assistant
├── types/               # TypeScript type definitions
│   └── index.d.ts       # Shared interfaces (User, Leave, PagedResponse, etc.)
└── css/                 # Global styles
```

### Key Patterns

**Data fetching:** TanStack Query (`useQuery` / `useMutation`) with `apiGet`, `apiPost`, `apiPatch`, `apiDelete` helpers from `spring-boot-api.ts`.

**Auth flow:** Login sends credentials to Spring Boot `/auth/login`, which authenticates via Keycloak and returns JWT tokens. Tokens are stored in localStorage and attached to all API requests. Token refresh is handled automatically by the API client.

**Permission checks:** `usePermission()` hook exposes `can('resource.action')`. Permissions are loaded from the backend user profile and normalized from `SCREAMING_SNAKE` to `dotted.format`.

**Route guards:** `PrivateRoute` and `PermissionRoute` components in `route-guards.tsx` protect pages based on auth state and permissions.

**File conventions:**
- `.tsx` for shared components and new pages (TypeScript)
- `.jsx` for pages carried over from the retired Laravel monolith (JavaScript)

---

## Backend Architecture

### Tech Stack

| Layer | Technology |
|-------|-----------|
| Framework | Spring Boot 3.4 |
| Language | Java 17 |
| Build | Gradle 8 |
| Database | PostgreSQL 15 |
| Migrations | Flyway (V1–V21) |
| ORM | Spring Data JPA / Hibernate |
| DTO Mapping | MapStruct |
| Auth | Keycloak (OAuth2 Resource Server + Admin API) |
| API Docs | SpringDoc OpenAPI (Swagger UI at `/api/v1/swagger-ui.html`) |
| WebSocket | Spring WebSocket (STOMP) for real-time notifications |
| Email | Spring Mail (Gmail SMTP) |

### Directory Structure

```
src/main/java/org/rp/
├── application/                  # Business logic layer
│   ├── auth/                     # AuthService (login, refresh, Google OAuth)
│   ├── user/                     # UserService, ProfileService, UserPermissionService
│   ├── leave/                    # LeaveApplicationServiceImpl, LeaveBalanceServiceImpl, LeaveServiceImpl
│   ├── wfh/                      # WfhServiceImpl
│   ├── calendar/                 # CalendarServiceImpl
│   ├── holiday/                  # HolidayServiceImpl, HolidayFetchService
│   ├── department/               # DepartmentServiceImpl
│   ├── position/                 # PositionServiceImpl
│   ├── team/                     # TeamServiceImpl
│   ├── role/                     # RoleServiceImpl, PermissionServiceImpl
│   ├── announcement/             # AnnouncementServiceImpl
│   ├── asset/                    # AssetServiceImpl, AssetAssignmentServiceImpl, AssetCategoryServiceImpl
│   ├── ticket/                   # TicketServiceImpl
│   ├── notification/             # NotificationServiceImpl (WebSocket push)
│   ├── dashboard/                # DashboardServiceImpl (employee + admin)
│   ├── onboarding/               # OnboardingInviteService, OnboardingSubmissionService,
│   │                             # OnboardingConversionService, OnboardingPortalService,
│   │                             # OnboardingDocumentService, EncryptionService, EmailService
│   ├── file/                     # FileUploadServiceImpl
│   ├── storage/                  # LocalStorageService
│   ├── dto/
│   │   ├── request/              # CreateUserRequest, UpdateUserRequest, etc.
│   │   └── response/             # UserResponse, PagedResponse, etc.
│   └── mapper/                   # MapStruct mappers (UserMapper, HolidayMapper, etc.)
│
├── infrastructure/               # Framework / external concerns
│   ├── controller/               # REST controllers (28 controllers)
│   ├── database/
│   │   ├── entity/               # JPA entities (User, LeaveApplication, Asset, etc.)
│   │   └── repository/           # Spring Data repositories
│   ├── security/
│   │   ├── config/               # SecurityConfig (CORS, filter chains, JWT)
│   │   ├── jwt/                  # JwtTokenProvider, JwtAuthenticationFilter
│   │   ├── service/              # CustomUserDetailsService
│   │   ├── KeycloakClient.java   # Keycloak Admin API client
│   │   └── CustomJwtAuthenticationConverter.java  # JWT → Spring Security authorities
│   ├── config/                   # KeycloakConfig, RequestLoggingFilter, WebSocketConfig
│   ├── exception/                # GlobalExceptionHandler, custom exceptions
│   ├── web/response/             # ApiResponse, PagedResponse, ErrorResponse wrappers
│   └── seeder/                   # DataSeeder (dev seed data)
│
└── src/main/resources/
    ├── application.properties        # Default config (production-safe)
    ├── application-dev.properties    # Dev profile (verbose SQL logging)
    └── db/migration/                 # Flyway V1–V21 SQL migrations
```

### Key Patterns

**Architecture style:** Hexagonal (ports & adapters). `application/` contains business logic and service interfaces. `infrastructure/` contains framework-specific code (controllers, JPA entities, security).

**Auth flow:** Frontend sends `POST /auth/login` with email/password. `AuthService` calls `KeycloakClient.login()` to authenticate via Keycloak's Direct Access Grant. Keycloak returns JWT tokens. For subsequent requests, the frontend sends the JWT in the `Authorization: Bearer` header. Spring Security's `OAuth2ResourceServer` validates the JWT against Keycloak's JWK endpoint. `CustomJwtAuthenticationConverter` loads the user's permissions from the local database (not from Keycloak claims).

**Response format:** All endpoints return `ApiResponse<T>` wrapper with `status`, `message`, `data`, `timestamp`. Paginated endpoints return `PagedResponse<T>` with `content`, `pageNumber`, `pageSize`, `totalElements`, `totalPages`.

**Exception handling:** `GlobalExceptionHandler` maps exceptions to HTTP responses: `ResourceNotFoundException` → 404, `DuplicateResourceException` → 409, `BusinessValidationException` → 400, `UnauthorizedException` → 401, generic `Exception` → 500 (sanitized message).

**Caching:** `@Cacheable` / `@CacheEvict` on `UserService` methods (in-memory cache).

**Transactions:** `@Transactional` on all write operations, `@Transactional(readOnly = true)` on reads.

---

## Infrastructure

### Docker Compose (backend repo)

| Service | Image | Port | Purpose |
|---------|-------|------|---------|
| `hr_management_db` | postgres:15-alpine | 5432 | Application database |
| `keycloak_db` | postgres:15-alpine | (internal) | Keycloak database |
| `keycloak` | keycloak:24.0 | 8180 | Identity provider |
| `hr_management_app` | (built from Dockerfile) | 8080 | Spring Boot API |

### Local Development Ports

| Service | Port |
|---------|------|
| Frontend (Vite) | 5174 |
| Backend (Spring Boot) | 8080 |
| Keycloak | 8180 |
| PostgreSQL | 5432 |

---

## Database

- **33 tables** across auth, users, leaves, WFH, holidays, calendar, teams, announcements, assets, tickets, notifications, and onboarding
- **Flyway** manages schema migrations (V1–V21)
- **Soft deletes** on `users` table only (`is_deleted`, `deleted_at`)
- **Audit columns** (`created_at`, `updated_at`) on all tables via `BaseEntity`
- **JSONB** used for semi-structured data (asset specs, onboarding personal info, leave type config)
- See migration files in `src/main/resources/db/migration/` for full schema

---

## Feature Modules

| Module | Frontend Pages | Backend Endpoints | Status |
|--------|---------------|-------------------|--------|
| Auth (Login, Register) | `Auth/*` | `/auth/**` | Active |
| Dashboard | `Dashboard/` | `/dashboard/**` | Active |
| User Management | `Users/*` | `/users/**` | Active |
| Leave Management | `Employees/Leaves/*`, `Leaves/*`, `LeaveTypes/*`, `LeaveBalances/*` | `/leave-applications/**`, `/leave-types/**` | Active |
| WFH Schedules | `Employees/WFH/*`, `Calendar/` | `/wfh/**` | Active |
| Calendar | `Calendar/*` | `/calendar/**` | Active |
| Holidays | `Holidays/*` | `/holidays/**` | Active |
| Departments | `Departments/*` | `/departments/**` | Active |
| Positions | `Positions/*` | `/positions/**` | Active |
| Teams | `Teams/*` | `/teams/**` | Active |
| Roles & Permissions | `Roles/*` | `/roles/**`, `/permissions/**` | Active |
| Announcements | `Announcements/*` | `/announcements/**` | Active |
| Asset Inventory | `Assets/*`, `Employees/Assets/*` | `/assets/**`, `/asset-assignments/**` | Active |
| Support Tickets | `Support/*` | `/tickets/**` | Active |
| Notifications | (WebSocket) | `/notifications/**`, `/ws/**` | Active |
| Onboarding | `Onboarding/*` | `/onboarding/**` | Active |
| Profile | `Profile/*` | `/profile/**` | Active |
| AI Chat | `AIChat/*` | (proxied to LaunchCode Bedrock) | Active |
