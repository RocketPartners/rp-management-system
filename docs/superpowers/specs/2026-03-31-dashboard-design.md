# HRIS-41: Dashboard & Reports — Design Spec

## Overview

Implement a unified Dashboard page with tab-based navigation: **"My Dashboard"** (employee view for all users) and **"Admin Overview"** (org-wide stats for admins/HR/managers). The employee tab replicates the Laravel monolith dashboard. The admin tab provides system-wide metrics.

## Backend

### New Files

- `DashboardController.java` — two GET endpoints
- `DashboardService.java` / `DashboardServiceImpl.java` — aggregation logic
- `MyDashboardResponse.java` — employee dashboard DTO
- `AdminDashboardResponse.java` — admin dashboard DTO (with nested DTOs)

### Endpoints

#### `GET /dashboard/my` (Authenticated)

Returns personal stats for the logged-in user.

```json
{
  "data": {
    "leaveBalances": [
      {
        "id": 1,
        "leaveType": { "id": 1, "name": "Vacation Leave", "code": "VL", "color": "#3B82F6" },
        "totalDays": 15,
        "usedDays": 3,
        "pendingDays": 0,
        "remainingDays": 12,
        "carriedOverDays": 0
      }
    ],
    "upcomingLeaves": [
      {
        "id": 5,
        "leaveTypeName": "Vacation Leave",
        "leaveTypeColor": "#3B82F6",
        "startDate": "2026-04-05",
        "endDate": "2026-04-07",
        "totalDays": 3,
        "status": "APPROVED"
      }
    ],
    "pendingLeaves": [
      {
        "id": 8,
        "leaveTypeName": "Sick Leave",
        "leaveTypeColor": "#EF4444",
        "startDate": "2026-04-10",
        "endDate": "2026-04-10",
        "totalDays": 1,
        "status": "PENDING_MANAGER"
      }
    ],
    "upcomingLeavesCount": 1,
    "pendingLeavesCount": 1,
    "wfhThisWeekCount": 2,
    "assignedAssetsCount": 0,
    "announcementsCount": 0
  }
}
```

**Implementation:**
- `leaveBalances`: Query `LeaveBalanceRepository` by userId and current year, join leaveType
- `upcomingLeaves`: Query `LeaveApplicationRepository` — status=APPROVED, startDate >= today, userId = current, limit 5, order by startDate ASC
- `pendingLeaves`: Query `LeaveApplicationRepository` — status IN (PENDING_MANAGER, PENDING_HR), userId = current, limit 5
- `wfhThisWeekCount`: Query `WfhScheduleRepository` — userId = current, date between Monday and Friday of current week, not cancelled
- `assignedAssetsCount`: hardcoded 0 (until HRIS-36)
- `announcementsCount`: hardcoded 0 (until HRIS-40)

#### `GET /dashboard/admin` (Permission-gated)

Returns org-wide metrics. Requires role: ADMIN or MANAGER.

```json
{
  "data": {
    "totalActiveEmployees": 24,
    "pendingAccountApprovals": 3,
    "pendingLeaveRequests": 5,
    "activeTeamsCount": 4,
    "recentLeaveApplications": [
      {
        "id": 12,
        "userName": "Jose Cruz",
        "leaveTypeName": "Vacation Leave",
        "leaveTypeColor": "#3B82F6",
        "startDate": "2026-04-05",
        "endDate": "2026-04-07",
        "totalDays": 3,
        "status": "APPROVED",
        "createdAt": "2026-03-28T10:30:00"
      }
    ],
    "usersOnLeaveToday": [
      {
        "userId": 5,
        "userName": "Ana Santos",
        "leaveTypeName": "Vacation Leave",
        "leaveTypeColor": "#3B82F6",
        "profileImageUrl": null
      }
    ],
    "usersWfhTodayCount": 3,
    "upcomingHolidays": [
      {
        "id": 1,
        "name": "Araw ng Kagitingan",
        "date": "2026-04-09",
        "country": "PH"
      }
    ],
    "teamOverview": [
      {
        "teamId": 1,
        "teamName": "Team Alpha",
        "leaderName": "Lead Engineer 1",
        "membersCount": 6,
        "status": "ACTIVE"
      }
    ],
    "announcements": []
  }
}
```

**Implementation:**
- `totalActiveEmployees`: `userRepository.countByStatusAndIsDeleted(ACTIVE, false)`
- `pendingAccountApprovals`: `userRepository.countByAccountStatusAndIsDeleted(PENDING, false)`
- `pendingLeaveRequests`: `leaveApplicationRepository.countByStatusIn(PENDING_MANAGER, PENDING_HR)`
- `activeTeamsCount`: `teamRepository.countByStatus(ACTIVE)`
- `recentLeaveApplications`: Last 10 leave applications across all users, ordered by createdAt DESC
- `usersOnLeaveToday`: Approved leave applications where today is between startDate and endDate
- `usersWfhTodayCount`: Count of WFH schedules for today that aren't cancelled
- `upcomingHolidays`: Next 5 holidays where date >= today, ordered by date ASC
- `teamOverview`: All active teams with leader name and member count
- `announcements`: empty array (until HRIS-40)

### Repository Changes

New query methods needed (added to existing repositories):

- `LeaveApplicationRepository`:
  - `findUpcomingByUserId(Long userId, LocalDate today, Pageable limit)` — approved, startDate >= today
  - `findPendingByUserId(Long userId)` — PENDING_MANAGER or PENDING_HR
  - `countByStatusIn(List<LeaveApplicationStatus> statuses)`
  - `findRecentApplications(Pageable limit)` — all users, order by createdAt DESC
  - `findUsersOnLeaveToday(LocalDate today)` — approved, today between start and end

- `WfhScheduleRepository`:
  - `countByUserIdAndDateBetweenAndCancelledAtIsNull(Long userId, LocalDate start, LocalDate end)`
  - `countByDateAndCancelledAtIsNull(LocalDate date)`

- `UserRepository`:
  - `countByStatusAndIsDeleted(UserStatus status, Boolean isDeleted)`
  - `countByAccountStatusAndIsDeleted(AccountStatus status, Boolean isDeleted)`

- `TeamRepository`:
  - `countByStatus(TeamStatus status)`

- `HolidayRepository`:
  - `findUpcomingHolidays(LocalDate today, Pageable limit)`

### Security

- `/dashboard/my` — any authenticated user
- `/dashboard/admin` — `@PreAuthorize("hasAnyRole('ADMIN', 'MANAGER')")` or check for specific permissions

---

## Frontend

### Page: `/dashboard` (single route)

File: `frontend/src/pages/Dashboard/Index.tsx`

### Tab Bar

- Visible only if user has admin/manager role
- Two tabs: "My Dashboard" (default) | "Admin Overview"
- Uses `useState` for active tab (no URL change)
- Regular employees see no tab bar — just the employee dashboard directly

### My Dashboard Tab

Uses `useQuery` to fetch `GET /dashboard/my`.

**Layout (top to bottom):**

1. **Header**: "Welcome back, {firstName}!" with subtitle "Here's what's happening with your account"

2. **Quick Stats Row** (4 cards, `grid-cols-4`):
   - Assigned Assets — count, blue, Laptop icon (placeholder: 0)
   - Upcoming Leaves — count, purple, Calendar icon
   - Pending Requests — count, yellow, Clock icon
   - WFH This Week — count, green, Laptop icon

3. **Main Content** (`grid lg:grid-cols-3`):

   **Left column (col-span-2):**
   - **My Leave Balances** card — 2-column grid of balance cards with:
     - Color dot matching leave type color
     - Leave type name + code badge
     - Remaining / total days (large number)
     - Progress bar (color-coded: green >50%, yellow 25-50%, red <25%)
     - Used days + carried over days
     - "Apply for Leave" button in header
   - **Upcoming Leaves** card — list of approved future leaves with type color dot, date range, day count. Empty state: calendar icon + "No upcoming leaves". "View All Leaves" button at bottom.
   - **Pending Leave Requests** card (conditional — only if count > 0) — list of pending leaves with status badge (Pending Manager / Pending HR)

   **Right column (col-span-1):**
   - **My Profile** card — avatar initial (or image), name, position, department, employee ID, email, phone. "View Full Profile" button.
   - **My Assets** card — placeholder empty state: Laptop icon + "No assets assigned"
   - **Quick Actions** card — 2-column grid of buttons: Apply for Leave, My Leaves, My WFH, My Profile

### Admin Overview Tab

Uses `useQuery` to fetch `GET /dashboard/admin`. Only fetched when admin tab is active (enabled: activeTab === 'admin').

**Layout (top to bottom):**

1. **Quick Stats Row** (4 cards, `grid-cols-4`):
   - Active Employees — count, blue, Users icon
   - Pending Approvals — count, orange, UserCheck icon
   - Pending Leaves — count, yellow, Clock icon
   - Active Teams — count, green, UsersRound icon

2. **Main Content** (`grid lg:grid-cols-3`):

   **Left column (col-span-2):**
   - **Recent Leave Applications** card — table with columns: Employee, Type, Dates, Days, Status. Last 10 applications. Status badges color-coded. "View All" link to /leaves/management.
   - **Announcements** card — placeholder: Bell icon + "No announcements yet. Company announcements will appear here." (Lights up with HRIS-40)
   - **Team Overview** card — table with columns: Team, Leader, Members, Status. All active teams. "Manage Teams" link.

   **Right column (col-span-1):**
   - **Users on Leave Today** card — list with avatar initials, name, leave type. Empty state: "No one on leave today"
   - **WFH Today** card — count display with icon. "X employees working from home today"
   - **Upcoming Holidays** card — list with date and holiday name. Next 5 holidays.
   - **Quick Actions (Admin)** card — buttons: Manage Users, Manage Teams, Leave Approvals, Pending Accounts

### Types

Add to `frontend/src/types/index.d.ts`:

```typescript
interface DashboardLeaveBalance {
  id: number;
  leaveType: {
    id: number;
    name: string;
    code: string;
    color: string;
  };
  totalDays: number;
  usedDays: number;
  pendingDays: number;
  remainingDays: number;
  carriedOverDays: number;
}

interface DashboardLeaveItem {
  id: number;
  leaveTypeName: string;
  leaveTypeColor: string;
  startDate: string;
  endDate: string;
  totalDays: number;
  status: string;
}

interface MyDashboardResponse {
  leaveBalances: DashboardLeaveBalance[];
  upcomingLeaves: DashboardLeaveItem[];
  pendingLeaves: DashboardLeaveItem[];
  upcomingLeavesCount: number;
  pendingLeavesCount: number;
  wfhThisWeekCount: number;
  assignedAssetsCount: number;
  announcementsCount: number;
}

interface AdminLeaveApplication {
  id: number;
  userName: string;
  leaveTypeName: string;
  leaveTypeColor: string;
  startDate: string;
  endDate: string;
  totalDays: number;
  status: string;
  createdAt: string;
}

interface AdminUserOnLeave {
  userId: number;
  userName: string;
  leaveTypeName: string;
  leaveTypeColor: string;
  profileImageUrl: string | null;
}

interface AdminTeamOverview {
  teamId: number;
  teamName: string;
  leaderName: string;
  membersCount: number;
  status: string;
}

interface AdminHoliday {
  id: number;
  name: string;
  date: string;
  country: string;
}

interface AdminDashboardResponse {
  totalActiveEmployees: number;
  pendingAccountApprovals: number;
  pendingLeaveRequests: number;
  activeTeamsCount: number;
  recentLeaveApplications: AdminLeaveApplication[];
  usersOnLeaveToday: AdminUserOnLeave[];
  usersWfhTodayCount: number;
  upcomingHolidays: AdminHoliday[];
  teamOverview: AdminTeamOverview[];
  announcements: never[];
}
```

### Data Fetching Pattern

```typescript
// Employee data — always fetched
const { data: myDashboard, isLoading } = useQuery({
  queryKey: ['dashboard', 'my'],
  queryFn: () => apiGet<MyDashboardResponse>('/dashboard/my'),
});

// Admin data — only fetched when admin tab is active
const { data: adminDashboard, isLoading: adminLoading } = useQuery({
  queryKey: ['dashboard', 'admin'],
  queryFn: () => apiGet<AdminDashboardResponse>('/dashboard/admin'),
  enabled: activeTab === 'admin' && canViewAdmin,
});
```

### Router Changes

Update `frontend/src/router.tsx`:
- Change the existing dashboard route to point to the new `Dashboard/Index.tsx`

---

## File Structure

### Backend (new files)
```
src/main/java/org/rp/
  application/
    dashboard/
      DashboardService.java
      DashboardServiceImpl.java
    dto/response/
      MyDashboardResponse.java
      AdminDashboardResponse.java
  infrastructure/
    controller/
      DashboardController.java
```

### Frontend (new/modified files)
```
frontend/src/
  pages/
    Dashboard/
      Index.tsx              (new — main dashboard with tabs)
  types/
    index.d.ts               (modified — add dashboard types)
  router.tsx                 (modified — update dashboard route)
```

---

## Out of Scope

- Announcements CRUD (HRIS-40)
- Asset management (HRIS-36)
- Chart libraries — all visualizations are pure CSS/Tailwind
- Dashboard customization/widget reordering
- Real-time updates / WebSocket
- Export / PDF reports
