# EPIC: Migrate HRIS Backend from Laravel to Spring Boot

**Epic Title:** HRIS Spring Boot Backend Migration
**Epic Key:** HRIS-MIGRATION
**Priority:** High
**Labels:** backend, migration, spring-boot, phase-3

## Description

Migrate all HRIS business logic from the Laravel backend to the existing Spring Boot backend (hr_management_backend). Each module is ported as its own story, tested via Postman, and validated against the existing Laravel Pest test specs.

**Reference repos:**
- Laravel (source): `RocketPartners/rp-management-system` — branch `TEST/Backend`
- Spring Boot (target): `jaemie-campo-rp/hr_management_backend`

**What's already built in Spring Boot:**
- Auth (login, Google OAuth, Keycloak, JWT, refresh tokens)
- User CRUD (create, read, update, soft delete, activate/deactivate)
- Department CRUD (hierarchical)
- Full database schema (10 Flyway migrations)
- Security config (JWT + RBAC + @PreAuthorize)
- Global exception handling, caching, Swagger/OpenAPI

---

## Child Work Items

### HRIS-M01: Project Setup & Local Environment
**Type:** Task
**Priority:** High
**Description:**
Get the Spring Boot backend running locally with PostgreSQL and Keycloak. Verify existing endpoints work in Postman.

**Acceptance Criteria:**
- Spring Boot app starts on port 8080
- PostgreSQL database connected, Flyway migrations run
- Keycloak running and configured
- POST /api/v1/auth/login returns JWT token
- GET /api/v1/users returns paginated users
- GET /api/v1/departments returns departments
- Postman collection created with auth variables (auto-set token from login response)

---

### HRIS-M02: Roles & Permissions CRUD
**Type:** Story
**Priority:** High
**Description:**
Implement Role and Permission management endpoints. This is foundational — all other modules depend on RBAC.

**Laravel Reference:** `RoleService.php`, `RoleController.php`, `PermissionService.php`
**Spring Boot Stubs:** `RoleService.java`, `PermissionService.java` (empty)

**Endpoints:**
- GET /api/v1/roles — List all roles with user count and permission count
- GET /api/v1/roles/{id} — Get role with permissions
- POST /api/v1/roles — Create role with permissions
- PUT /api/v1/roles/{id} — Update role (blocked for protected roles: super-admin, admin)
- DELETE /api/v1/roles/{id} — Delete role (blocked if users assigned, blocked for protected roles)
- GET /api/v1/permissions — List all permissions grouped by category

**Business Logic to Port:**
- Protected role enforcement (super-admin, admin cannot be modified/deleted)
- User count validation before deletion
- Force delete option (delete even with users assigned)
- Permission sync on role create/update

**Postman Tests:**
- Create a role with permissions
- Update a non-protected role
- Attempt to update super-admin (expect 400)
- Attempt to delete role with users (expect 400)
- Force delete role with users (expect 200)

---

### HRIS-M03: User Management Enhancements
**Type:** Story
**Priority:** High
**Description:**
Enhance the existing User endpoints to match Laravel functionality: bulk operations, profile picture upload, name construction, approval workflow.

**Laravel Reference:** `UserService.php`, `UserController.php`
**Spring Boot Existing:** `UserService.java`, `UserController.java` (basic CRUD done)

**New/Enhanced Endpoints:**
- POST /api/v1/users/{id}/approve — Approve pending user
- POST /api/v1/users/{id}/reject — Reject pending user
- POST /api/v1/users/bulk-approve — Bulk approve users
- POST /api/v1/users/bulk-reject — Bulk reject users
- POST /api/v1/users/{id}/profile-picture — Upload profile picture
- GET /api/v1/users/pending — List pending registration users

**Business Logic to Port:**
- Full name construction (first + middle + last + suffix)
- Profile picture upload/replace/delete
- Approve sets email_verified_at, account_status=active, approved_by, approved_at
- Reject sets account_status=rejected
- Bulk operations skip non-pending users gracefully

**Postman Tests:**
- Approve a pending user, verify status changes
- Reject a pending user
- Attempt to approve already-active user (expect error)
- Bulk approve 3 users (1 pending, 1 active, 1 non-existent) — verify partial success
- Upload profile picture, verify URL returned

---

### HRIS-M04: Team Management
**Type:** Story
**Priority:** Medium
**Description:**
Implement team CRUD with member sync, auto-leader addition, and primary team logic.

**Laravel Reference:** `TeamService.php`, `TeamController.php`
**Spring Boot:** No existing implementation. Entity/table exists via Flyway? (Check — may need migration)

**Endpoints:**
- GET /api/v1/teams — List teams with leader, sub-leader, member count (search + status filter)
- GET /api/v1/teams/{id} — Team detail with members
- POST /api/v1/teams — Create team with members
- PUT /api/v1/teams/{id} — Update team and sync members
- DELETE /api/v1/teams/{id} — Soft delete team

**Business Logic to Port:**
- Leader and sub-leader auto-added to members list
- role_in_team: 'lead', 'sub-lead', 'member'
- First team for a user auto-set as primary
- Existing is_primary preserved on re-sync
- Slug auto-generation from name (unique with -2, -3 suffix on collision)

**Database:** May need Flyway migration V11 for teams + team_user tables if not already in schema.

**Postman Tests:**
- Create team with leader + sub-leader + members
- Verify leader/sub-leader auto-added as members with correct roles
- Create second team for same user, verify is_primary=false
- Update team, verify existing is_primary preserved
- Delete team, verify soft delete

---

### HRIS-M05: Leave Types Management
**Type:** Story
**Priority:** High
**Description:**
Implement leave type CRUD with balance initialization and safety checks.

**Laravel Reference:** `LeaveBalanceService.php`, `LeaveTypeController.php`
**Spring Boot:** Entity `LeaveType` exists, no controller/service.

**Endpoints:**
- GET /api/v1/leave-types — List leave types (search, status filter, payment type filter)
- GET /api/v1/leave-types/{id} — Get leave type with usage stats
- POST /api/v1/leave-types — Create leave type (auto-initialize balances)
- PUT /api/v1/leave-types/{id} — Update leave type (sync future balances if days changed)
- POST /api/v1/leave-types/{id}/toggle-active — Toggle active status
- DELETE /api/v1/leave-types/{id} — Delete (blocked if requests exist)

**Business Logic to Port:**
- On create: initialize balances for all active users (gender-specific filtering)
- On update days_per_year: update future-year balances only (not current year)
- Cannot deactivate if active leave requests exist
- Cannot delete if any leave requests exist (even rejected ones)

**Postman Tests:**
- Create leave type, verify balances created for active users
- Create gender-specific leave type, verify only matching users get balances
- Update days_per_year, verify future balances updated
- Attempt to deactivate with active requests (expect error)
- Attempt to delete with requests (expect error)

---

### HRIS-M06: Leave Balance Management
**Type:** Story
**Priority:** High
**Description:**
Implement leave balance management: year reset with carry-over, preview, and statistics.

**Laravel Reference:** `LeaveBalanceService.php`, `LeaveBalanceController.php`
**Spring Boot:** Entity `LeaveBalance` exists, no controller/service.

**Endpoints:**
- GET /api/v1/leave-balances — Balance management dashboard (stats, history)
- GET /api/v1/leave-balances/preview?year=2027 — Preview carry-over for a year
- POST /api/v1/leave-balances/reset — Reset balances for new year
- GET /api/v1/leave-balances/user/{userId} — Get user's current year balances

**Business Logic to Port:**
- Year reset: create new year balances for all active users x all active leave types
- Carry-over: min(remaining_days, max_carry_over_days) added to new year total
- Prevent duplicate reset (throw error unless force_reset=true)
- Force reset deletes existing balances then re-creates
- Stats: total users, total balances, total carried over, low balance count

**Postman Tests:**
- Preview carry-over for next year
- Reset balances for next year, verify carry-over calculated
- Attempt to reset again without force (expect error)
- Force reset, verify balances replaced
- Check stats endpoint returns correct counts

---

### HRIS-M07: Leave Request & Filing
**Type:** Story
**Priority:** High
**Description:**
Implement leave request creation with approval flow determination, balance validation, and emergency contact resolution.

**Laravel Reference:** `LeaveService.php`, `LeaveRequestController.php`, `LeaveController.php`
**Spring Boot:** Entity `LeaveApplication` exists, no controller/service.

**Endpoints:**
- GET /api/v1/leave-requests — List leave requests (search, status filter, date range)
- GET /api/v1/leave-requests/{id} — Get leave request details
- POST /api/v1/leave-requests — File a leave request
- PUT /api/v1/leave-requests/{id} — Update pending leave request
- POST /api/v1/leave-requests/{id}/cancel — Cancel pending leave request
- POST /api/v1/leave-requests/{id}/request-cancellation — Request cancellation of approved leave

**Business Logic to Port:**
- calculateTotalDays(startDate, endDate) — inclusive date range
- validateBalance — check remaining >= requested
- determineApprovalFlow — based on leave type config:
  - No approval needed → auto-approve + deduct balance
  - Manager only → pending_manager
  - HR only → pending_hr (skip manager)
  - Both → pending_manager (then HR after manager approves)
- resolveEmergencyContact — use user's default if flag set
- Auto-prefill approver from primary team leader (optional)

**Postman Tests:**
- File leave with both approvals required → status=pending_manager
- File leave with no approvals → status=approved, balance deducted
- File leave with insufficient balance (expect error)
- Cancel a pending leave request
- Request cancellation of an approved leave → status=pending_cancellation

---

### HRIS-M08: Leave Approval Workflow
**Type:** Story
**Priority:** High
**Depends On:** HRIS-M07
**Description:**
Implement the full leave approval workflow: manager approve/reject, HR approve/reject, cancellation approve/reject.

**Laravel Reference:** `LeaveApprovalService.php`, `LeaveApprovalController.php`
**Spring Boot:** No existing implementation.

**Endpoints:**
- GET /api/v1/leave-approvals/pending — Pending approvals for current user (hierarchy-based)
- POST /api/v1/leave-approvals/{id}/manager-approve — Manager approves (routes to HR or fully approves)
- POST /api/v1/leave-approvals/{id}/manager-reject — Manager rejects (final)
- POST /api/v1/leave-approvals/{id}/hr-approve — HR approves (final, deducts balance)
- POST /api/v1/leave-approvals/{id}/hr-reject — HR rejects (final)
- POST /api/v1/leave-approvals/{id}/approve-cancellation — HR approves cancellation (restores balance)
- POST /api/v1/leave-approvals/{id}/reject-cancellation — HR rejects cancellation

**Business Logic to Port:**
- canManagerActOnLeave: hierarchy-based auth OR manager_id direct assignment
- Manager approve: if HR required → forward to pending_hr; if not → fully approve + deduct balance
- Manager reject: final, no appeals
- HR approve: deduct balance from leave_balances
- HR reject: final
- Approve cancellation: restore balance (used_days -= total_days)
- Reject cancellation: revert status to approved
- Pending approvals query: show leaves assigned to user OR from lower-hierarchy users

**Postman Tests:**
- Manager approve leave (HR required) → status changes to pending_hr
- Manager approve leave (HR not required) → status=approved, balance deducted
- Manager reject leave → status=rejected_by_manager
- HR approve leave → status=approved, balance deducted
- HR reject leave → status=rejected_by_hr
- Approve cancellation → status=cancelled, balance restored
- Attempt approval by unauthorized user (expect 403)

---

### HRIS-M09: Asset & Inventory Management
**Type:** Story
**Priority:** Medium
**Description:**
Implement asset lifecycle management: inventory CRUD, asset assign/return, status transitions, history logging.

**Laravel Reference:** `AssetService.php`, `AssetController.php`, `InventoryController.php`
**Spring Boot:** Entities exist (`InventoryCategory`, `InventoryItem`, `ItemAssignment`), no controller/service.

**Endpoints:**
- GET /api/v1/inventory — List inventory items (search, category filter)
- GET /api/v1/inventory/{id} — Inventory item with assets
- POST /api/v1/inventory — Create inventory item (auto-create placeholder assets)
- PUT /api/v1/inventory/{id} — Update inventory item (adjust quantity up/down)
- DELETE /api/v1/inventory/{id} — Delete inventory item
- GET /api/v1/assets — List assets (search, status filter)
- GET /api/v1/assets/{id} — Asset detail with assignment history
- PUT /api/v1/assets/{id} — Update asset (auto-return on status change from Assigned)
- POST /api/v1/assets/{id}/assign — Assign asset to user
- POST /api/v1/assets/{id}/return — Return asset from user

**Business Logic to Port:**
- assignAsset: create assignment record, update asset status to Assigned, log history
- returnAsset: close assignment, update asset status to Available, log history
- autoReturnOnStatusChange: if status moves from Assigned → auto-close active assignment
- createPlaceholderAssets: auto-generate tagged assets (ITEM-001, ITEM-002, etc.)
- adjustAssetQuantity: increase = create placeholders; decrease = remove unassigned placeholders

**Postman Tests:**
- Create inventory item with quantity=3, verify 3 placeholder assets created
- Assign asset to user, verify status=Assigned
- Return asset, verify status=Available
- Update asset status from Assigned to Maintenance, verify auto-return
- Increase quantity from 3 to 5, verify 2 new assets
- Attempt to decrease below assigned count (expect error)

---

### HRIS-M10: Work From Home & Calendar
**Type:** Story
**Priority:** Medium
**Description:**
Implement WFH scheduling, calendar event aggregation, and holiday management.

**Laravel Reference:** `WorkFromHomeService.php`, `CalendarService.php`, `WorkFromHomeController.php`, `CalendarController.php`, `HolidayController.php`
**Spring Boot:** Entity `Holiday` and `AttendanceRecord` exist, no controller/service.

**Endpoints:**
- GET /api/v1/calendar/events — Aggregated calendar events (leaves, WFH, holidays)
- GET /api/v1/calendar/statistics — Event statistics for date range
- GET /api/v1/calendar/users-on-leave — Users on leave today
- GET /api/v1/wfh/settings — Get user's WFH settings
- PUT /api/v1/wfh/settings — Update WFH settings (recurring days)
- POST /api/v1/wfh/schedules — Create one-time WFH schedule
- DELETE /api/v1/wfh/schedules/{id} — Cancel WFH schedule
- GET /api/v1/holidays — List holidays (country filter, year filter)
- POST /api/v1/holidays — Create holiday
- PUT /api/v1/holidays/{id} — Update holiday
- DELETE /api/v1/holidays/{id} — Delete holiday
- POST /api/v1/holidays/import — Import holidays from file

**Database:** May need additional Flyway migration for work_from_home_settings and work_from_home_schedules tables.

**Postman Tests:**
- Get calendar events for a month
- Create WFH schedule, verify it appears in calendar
- Create holiday, verify it appears in calendar
- Get users on leave today
- Get statistics for a date range

---

### HRIS-M11: Onboarding
**Type:** Story
**Priority:** Low
**Description:**
Implement the guest onboarding flow: invitation, document upload, form submission, admin review.

**Laravel Reference:** `OnboardingInviteService.php`, `OnboardingSubmissionService.php`, `OnboardingDocumentService.php`
**Spring Boot:** No existing implementation. Will need new Flyway migrations.

**Endpoints:**
- POST /api/v1/onboarding/invite — Send onboarding invitation
- GET /api/v1/onboarding/{token} — Get onboarding form (public, token-based)
- POST /api/v1/onboarding/{token}/submit — Submit onboarding data + documents
- GET /api/v1/onboarding/submissions — List submissions (admin)
- GET /api/v1/onboarding/submissions/{id} — Review submission (admin)
- POST /api/v1/onboarding/submissions/{id}/approve — Approve and create user
- POST /api/v1/onboarding/submissions/{id}/reject — Reject submission

**Postman Tests:**
- Create invitation, receive token
- Submit onboarding form with documents
- Admin reviews and approves, verify user created
- Admin rejects submission

---

### HRIS-M12: Tickets
**Type:** Story
**Priority:** Low
**Description:**
Implement internal ticket/support system.

**Laravel Reference:** `TicketController.php` (thin CRUD)
**Spring Boot:** No existing implementation. Will need new Flyway migration.

**Endpoints:**
- GET /api/v1/tickets — List tickets (search, status filter)
- GET /api/v1/tickets/{id} — Ticket detail with messages
- POST /api/v1/tickets — Create ticket
- PUT /api/v1/tickets/{id} — Update ticket status
- POST /api/v1/tickets/{id}/messages — Add message to ticket

**Postman Tests:**
- Create ticket, verify created
- Add message to ticket
- Update ticket status to resolved
- List tickets filtered by status

---

### HRIS-M13: Announcements
**Type:** Story
**Priority:** Low
**Description:**
Implement company announcements with file attachments.

**Laravel Reference:** `AnnouncementController.php`
**Spring Boot:** No existing implementation. Will need new Flyway migration.

**Endpoints:**
- GET /api/v1/announcements — List announcements (paginated)
- GET /api/v1/announcements/{id} — Announcement detail
- POST /api/v1/announcements — Create announcement with attachments
- PUT /api/v1/announcements/{id} — Update announcement
- DELETE /api/v1/announcements/{id} — Delete announcement
- DELETE /api/v1/announcements/{id}/attachments/{attachmentId} — Delete attachment

**Postman Tests:**
- Create announcement with file attachments
- Update announcement
- Delete a single attachment
- Delete entire announcement

---

### HRIS-M14: Dashboard & Reports
**Type:** Story
**Priority:** Low
**Description:**
Implement dashboard statistics and reporting endpoints for admin and employee views.

**Laravel Reference:** `DashboardController.php`, `EmployeeDashboardController.php`
**Spring Boot:** No existing implementation.

**Endpoints:**
- GET /api/v1/dashboard/admin — Admin dashboard stats (user counts, leave stats, pending approvals)
- GET /api/v1/dashboard/employee — Employee dashboard (my balances, upcoming leaves, assigned assets)

**Postman Tests:**
- Admin dashboard returns correct aggregate counts
- Employee dashboard returns user-specific data

---

### HRIS-M15: Postman Collection & Documentation
**Type:** Task
**Priority:** High
**Description:**
Create and maintain a comprehensive Postman collection for all endpoints with:
- Environment variables (base_url, access_token, refresh_token)
- Pre-request script to auto-login and set token
- Test scripts validating response structure and status codes
- Organized by module folders matching the stories above
- Export collection to repo for team sharing

**Acceptance Criteria:**
- Collection covers all endpoints from M01-M14
- Each request has at least 1 test assertion
- Environment file for local dev included
- Collection exported to `docs/postman/` in the Spring Boot repo

---

## Suggested Sprint Breakdown

**Sprint 1 (Foundation):** M01, M02, M03, M15
**Sprint 2 (Leave System):** M05, M06, M07, M08
**Sprint 3 (Assets & Teams):** M04, M09
**Sprint 4 (Calendar & WFH):** M10
**Sprint 5 (Remaining):** M11, M12, M13, M14
