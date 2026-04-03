# Changelog

All notable changes to this project will be documented in this file.

## [Unreleased]

### Pending
- Backend: Make sensitive config values required on startup (Keycloak client secret)
- Backend: Move Keycloak user creation outside `@Transactional` to prevent orphans
- Backend: Restrict CORS headers from wildcard to explicit whitelist
- Backend: Profile-specific logging (dev vs production)
- Backend: Sanitize generic 500 error messages
- Backend: Fix `User.password` entity-migration mismatch (nullable)
- Frontend: Migrate all pages to TanStack Query (remove manual useState/useEffect fetching)
- Frontend: Add React Error Boundary component
- Frontend: Evaluate token storage security (localStorage vs httpOnly cookies)
- Frontend: Add input length validation to form schemas
- Frontend: Add frontend test coverage

---

## [0.0.3] - 2026-04-04

### Architecture Migration
- **Removed all Laravel monolith code** — 577 files, 137,000+ lines of retired PHP/Blade/Inertia code removed
- **Frontend is now a standalone React SPA** communicating with a separate Spring Boot backend via REST API
- **Added `docs/ARCHITECTURE.md`** documenting the full system architecture (frontend, backend, infrastructure)
- **Added `CHANGELOG.md`** with full release history

### Security Hardening
- Removed hardcoded login credentials (`admin@rocketpartners.com` / `admin123`) from Login page
- Added DOMPurify sanitization for `dangerouslySetInnerHTML` in Announcements page (XSS prevention)
- Added `.env` to frontend `.gitignore` and updated `.env.example` with AI config template

---

## [0.0.2] - 2026-04-03

### Features
- **My Assets page** — Employees can view their assigned assets (#47)
- **Leave Management admin pages** — Leave requests, approvals, types, balances (#46)
- **Role Management page** — CRUD roles with permission assignment (#45)
- **Onboarding frontend pages** — Admin invites, submissions, portal (#44)
- **Support/Tickets page** — Create and manage support tickets (#HRIS-39)
- **Asset Management** — Full CRUD, check-out/in, filters, detail view (#HRIS-36)
- **Announcements page** — Feed, Tiptap rich text editor, emoji reactions, threaded comments (#HRIS-40)
- **Dashboard** — Tabbed employee and admin dashboard views (#HRIS-41)
- **Department & Position pages** — CRUD with leave auto-prefill, User Management improvements (#HRIS-33)
- **Team Management pages** — Team list, detail, create/edit (#HRIS-22)
- **Calendar refactor** — Holiday/leave/WFH events, filters, WFH self-service page (#HRIS-14)
- **Standalone React SPA** — Initial migration from Laravel/Inertia to standalone React with react-router (#37)

### Fixes
- Fixed sidebar section dividers and calendar layout (#49)
- Fixed missing padding on onboarding pages (#48)
- Widened default dialog size from `sm:max-w-lg` to `sm:max-w-2xl` (#HRIS-36)
- Fixed asset dialog designs and sidebar nav crash (#HRIS-36)
- Redesigned announcements page, fixed rich text rendering (#HRIS-40)
- Added missing ANNOUNCEMENT permission alias (#HRIS-40)

---

## [0.0.1] - Initial Release (Laravel Monolith)

### Features
- User Management with email verification and approval workflow
- Role-based access control with permissions
- Leave request system with manager approval
- Calendar module with leave balance management
- Onboarding invites and submissions
- Work From Home scheduler with recurring patterns
- Notification system (in-app)
- Email sending for user verification
- Playwright E2E test automation for onboarding workflow

### Infrastructure
- Laravel 12 + Inertia.js + React (monolith)
- CI/CD with GitHub Actions (Pint, Prettier, ESLint, Pest tests)
- Auto-deploy: develop → staging, main → production (SSH + artifacts)
