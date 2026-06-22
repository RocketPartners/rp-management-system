# HRIS-41: Dashboard & Reports — Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Build a tabbed dashboard with employee and admin views, powered by two new backend aggregation endpoints.

**Architecture:** Backend gets a `DashboardController` + `DashboardService` that aggregate data from existing repositories into two DTOs (`MyDashboardResponse`, `AdminDashboardResponse`). Frontend replaces the existing `Employees/Dashboard.tsx` with a new `Dashboard/Index.tsx` using Radix Tabs and TanStack Query — the admin tab is permission-gated and lazy-fetched.

**Tech Stack:** Spring Boot 3 (Java 21), Spring Data JPA, PostgreSQL, React 19, TanStack Query, shadcn/ui Tabs, Radix UI, Tailwind CSS

---

## File Map

### Backend — New Files
| File | Responsibility |
|------|---------------|
| `src/main/java/org/rp/application/dto/response/MyDashboardResponse.java` | Employee dashboard DTO with nested inner classes |
| `src/main/java/org/rp/application/dto/response/AdminDashboardResponse.java` | Admin dashboard DTO with nested inner classes |
| `src/main/java/org/rp/application/dashboard/DashboardService.java` | Service interface |
| `src/main/java/org/rp/application/dashboard/DashboardServiceImpl.java` | Aggregation logic |
| `src/main/java/org/rp/infrastructure/controller/DashboardController.java` | Two GET endpoints |

### Backend — Modified Files
| File | Change |
|------|--------|
| `LeaveApplicationRepository.java` | Add 4 new query methods |
| `WfhScheduleRepository.java` | Add 1 new query method |
| `UserRepository.java` | Add 2 count methods |
| `TeamRepository.java` | Add 1 count method |

### Frontend — New Files
| File | Responsibility |
|------|---------------|
| `frontend/src/pages/Dashboard/Index.tsx` | Tabbed dashboard page |

### Frontend — Modified Files
| File | Change |
|------|--------|
| `frontend/src/types/index.d.ts` | Add dashboard response types |
| `frontend/src/router.tsx` | Update dashboard route import |

---

## Task 1: Backend — Create Dashboard DTOs

**Files:**
- Create: `src/main/java/org/rp/application/dto/response/MyDashboardResponse.java`
- Create: `src/main/java/org/rp/application/dto/response/AdminDashboardResponse.java`

- [ ] **Step 1: Create MyDashboardResponse.java**

```java
package org.rp.application.dto.response;

import com.fasterxml.jackson.annotation.JsonInclude;
import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.math.BigDecimal;
import java.time.LocalDate;
import java.util.List;

@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
@JsonInclude(JsonInclude.Include.NON_NULL)
public class MyDashboardResponse {
    private List<LeaveBalanceSummary> leaveBalances;
    private List<LeaveItem> upcomingLeaves;
    private List<LeaveItem> pendingLeaves;
    private int upcomingLeavesCount;
    private int pendingLeavesCount;
    private long wfhThisWeekCount;
    private int assignedAssetsCount;
    private int announcementsCount;

    @Data
    @Builder
    @NoArgsConstructor
    @AllArgsConstructor
    public static class LeaveBalanceSummary {
        private Long id;
        private LeaveTypeInfo leaveType;
        private BigDecimal totalDays;
        private BigDecimal usedDays;
        private BigDecimal pendingDays;
        private BigDecimal remainingDays;
        private BigDecimal carriedOverDays;
    }

    @Data
    @Builder
    @NoArgsConstructor
    @AllArgsConstructor
    public static class LeaveTypeInfo {
        private Long id;
        private String name;
        private String code;
        private String color;
    }

    @Data
    @Builder
    @NoArgsConstructor
    @AllArgsConstructor
    public static class LeaveItem {
        private Long id;
        private String leaveTypeName;
        private String leaveTypeColor;
        private LocalDate startDate;
        private LocalDate endDate;
        private BigDecimal totalDays;
        private String status;
    }
}
```

- [ ] **Step 2: Create AdminDashboardResponse.java**

```java
package org.rp.application.dto.response;

import com.fasterxml.jackson.annotation.JsonInclude;
import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.math.BigDecimal;
import java.time.LocalDate;
import java.time.LocalDateTime;
import java.util.List;

@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
@JsonInclude(JsonInclude.Include.NON_NULL)
public class AdminDashboardResponse {
    private long totalActiveEmployees;
    private long pendingAccountApprovals;
    private long pendingLeaveRequests;
    private long activeTeamsCount;
    private List<RecentLeaveApplication> recentLeaveApplications;
    private List<UserOnLeave> usersOnLeaveToday;
    private long usersWfhTodayCount;
    private List<UpcomingHoliday> upcomingHolidays;
    private List<TeamOverviewItem> teamOverview;
    @Builder.Default
    private List<Object> announcements = List.of();

    @Data
    @Builder
    @NoArgsConstructor
    @AllArgsConstructor
    public static class RecentLeaveApplication {
        private Long id;
        private String userName;
        private String leaveTypeName;
        private String leaveTypeColor;
        private LocalDate startDate;
        private LocalDate endDate;
        private BigDecimal totalDays;
        private String status;
        private LocalDateTime createdAt;
    }

    @Data
    @Builder
    @NoArgsConstructor
    @AllArgsConstructor
    public static class UserOnLeave {
        private Long userId;
        private String userName;
        private String leaveTypeName;
        private String leaveTypeColor;
        private String profileImageUrl;
    }

    @Data
    @Builder
    @NoArgsConstructor
    @AllArgsConstructor
    public static class UpcomingHoliday {
        private Long id;
        private String name;
        private LocalDate date;
        private String country;
    }

    @Data
    @Builder
    @NoArgsConstructor
    @AllArgsConstructor
    public static class TeamOverviewItem {
        private Long teamId;
        private String teamName;
        private String leaderName;
        private int membersCount;
        private String status;
    }
}
```

- [ ] **Step 3: Verify compilation**

Run: `cd /Users/seanreptimiguell.ticzon/Herd/hr_management_backend && ./gradlew compileJava 2>&1 | tail -5`
Expected: `BUILD SUCCESSFUL`

- [ ] **Step 4: Commit**

```bash
git add src/main/java/org/rp/application/dto/response/MyDashboardResponse.java \
        src/main/java/org/rp/application/dto/response/AdminDashboardResponse.java
git commit -m "feat(HRIS-41): add dashboard response DTOs"
```

---

## Task 2: Backend — Add Repository Query Methods

**Files:**
- Modify: `src/main/java/org/rp/infrastructure/database/repository/LeaveApplicationRepository.java`
- Modify: `src/main/java/org/rp/infrastructure/database/repository/WfhScheduleRepository.java`
- Modify: `src/main/java/org/rp/infrastructure/database/repository/UserRepository.java`
- Modify: `src/main/java/org/rp/infrastructure/database/repository/TeamRepository.java`

- [ ] **Step 1: Add LeaveApplicationRepository methods**

Add these methods to the existing `LeaveApplicationRepository` interface:

```java
@Query("SELECT la FROM LeaveApplication la JOIN FETCH la.leaveType " +
       "WHERE la.user.id = :userId AND la.status = 'APPROVED' " +
       "AND la.startDate >= :today ORDER BY la.startDate ASC")
List<LeaveApplication> findUpcomingByUserId(@Param("userId") Long userId,
                                             @Param("today") LocalDate today,
                                             Pageable pageable);

@Query("SELECT la FROM LeaveApplication la JOIN FETCH la.leaveType " +
       "WHERE la.user.id = :userId " +
       "AND la.status IN ('PENDING_MANAGER', 'PENDING_HR') " +
       "ORDER BY la.createdAt DESC")
List<LeaveApplication> findPendingByUserId(@Param("userId") Long userId);

@Query("SELECT COUNT(la) FROM LeaveApplication la " +
       "WHERE la.status IN ('PENDING_MANAGER', 'PENDING_HR')")
long countAllPendingLeaves();

@Query("SELECT la FROM LeaveApplication la " +
       "JOIN FETCH la.user JOIN FETCH la.leaveType " +
       "ORDER BY la.createdAt DESC")
List<LeaveApplication> findRecentApplications(Pageable pageable);

@Query("SELECT la FROM LeaveApplication la " +
       "JOIN FETCH la.user JOIN FETCH la.leaveType " +
       "WHERE la.status = 'APPROVED' " +
       "AND la.startDate <= :today AND la.endDate >= :today")
List<LeaveApplication> findUsersOnLeaveToday(@Param("today") LocalDate today);
```

Also add the missing import at the top if not already present:

```java
import org.springframework.data.domain.Pageable;
```

- [ ] **Step 2: Add WfhScheduleRepository method**

Add to the existing `WfhScheduleRepository` interface:

```java
@Query("SELECT COUNT(s) FROM WfhSchedule s WHERE s.date = :date AND s.status != 'cancelled'")
long countActiveByDate(@Param("date") LocalDate date);
```

- [ ] **Step 3: Add UserRepository count methods**

Add to the existing `UserRepository` interface:

```java
long countByStatusAndIsDeletedFalse(User.UserStatus status);

long countByAccountStatusAndIsDeletedFalse(User.AccountStatus status);
```

- [ ] **Step 4: Add TeamRepository count method**

Add to the existing `TeamRepository` interface:

```java
long countByStatus(Team.TeamStatus status);
```

- [ ] **Step 5: Verify compilation**

Run: `cd /Users/seanreptimiguell.ticzon/Herd/hr_management_backend && ./gradlew compileJava 2>&1 | tail -5`
Expected: `BUILD SUCCESSFUL`

- [ ] **Step 6: Commit**

```bash
git add src/main/java/org/rp/infrastructure/database/repository/LeaveApplicationRepository.java \
        src/main/java/org/rp/infrastructure/database/repository/WfhScheduleRepository.java \
        src/main/java/org/rp/infrastructure/database/repository/UserRepository.java \
        src/main/java/org/rp/infrastructure/database/repository/TeamRepository.java
git commit -m "feat(HRIS-41): add dashboard repository query methods"
```

---

## Task 3: Backend — Create DashboardService

**Files:**
- Create: `src/main/java/org/rp/application/dashboard/DashboardService.java`
- Create: `src/main/java/org/rp/application/dashboard/DashboardServiceImpl.java`

- [ ] **Step 1: Create DashboardService interface**

```java
package org.rp.application.dashboard;

import org.rp.application.dto.response.AdminDashboardResponse;
import org.rp.application.dto.response.MyDashboardResponse;

public interface DashboardService {
    MyDashboardResponse getMyDashboard(Long userId);
    AdminDashboardResponse getAdminDashboard();
}
```

- [ ] **Step 2: Create DashboardServiceImpl**

```java
package org.rp.application.dashboard;

import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.rp.application.dto.response.AdminDashboardResponse;
import org.rp.application.dto.response.MyDashboardResponse;
import org.rp.infrastructure.database.entity.*;
import org.rp.infrastructure.database.repository.*;
import org.springframework.data.domain.PageRequest;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.time.DayOfWeek;
import java.time.LocalDate;
import java.time.temporal.TemporalAdjusters;
import java.util.List;

@Service
@Slf4j
@RequiredArgsConstructor
public class DashboardServiceImpl implements DashboardService {

    private final LeaveBalanceRepository leaveBalanceRepository;
    private final LeaveApplicationRepository leaveApplicationRepository;
    private final WfhScheduleRepository wfhScheduleRepository;
    private final UserRepository userRepository;
    private final TeamRepository teamRepository;
    private final HolidayRepository holidayRepository;

    @Override
    @Transactional(readOnly = true)
    public MyDashboardResponse getMyDashboard(Long userId) {
        log.debug("Building employee dashboard for userId={}", userId);

        LocalDate today = LocalDate.now();
        int currentYear = today.getYear();

        // Leave balances
        List<LeaveBalance> balances = leaveBalanceRepository.findByUserIdAndYear(userId, currentYear);
        List<MyDashboardResponse.LeaveBalanceSummary> balanceSummaries = balances.stream()
                .map(this::toBalanceSummary)
                .toList();

        // Upcoming leaves (approved, future, max 5)
        List<LeaveApplication> upcoming = leaveApplicationRepository
                .findUpcomingByUserId(userId, today, PageRequest.of(0, 5));
        List<MyDashboardResponse.LeaveItem> upcomingItems = upcoming.stream()
                .map(this::toLeaveItem)
                .toList();

        // Pending leaves
        List<LeaveApplication> pending = leaveApplicationRepository
                .findPendingByUserId(userId);
        List<MyDashboardResponse.LeaveItem> pendingItems = pending.stream()
                .map(this::toLeaveItem)
                .toList();

        // WFH this week
        LocalDate weekStart = today.with(TemporalAdjusters.previousOrSame(DayOfWeek.MONDAY));
        LocalDate weekEnd = today.with(TemporalAdjusters.nextOrSame(DayOfWeek.FRIDAY));
        long wfhCount = wfhScheduleRepository.countActiveInWeek(userId, weekStart, weekEnd);

        return MyDashboardResponse.builder()
                .leaveBalances(balanceSummaries)
                .upcomingLeaves(upcomingItems)
                .pendingLeaves(pendingItems)
                .upcomingLeavesCount(upcomingItems.size())
                .pendingLeavesCount(pendingItems.size())
                .wfhThisWeekCount(wfhCount)
                .assignedAssetsCount(0)
                .announcementsCount(0)
                .build();
    }

    @Override
    @Transactional(readOnly = true)
    public AdminDashboardResponse getAdminDashboard() {
        log.debug("Building admin dashboard");

        LocalDate today = LocalDate.now();

        // Summary counts
        long activeEmployees = userRepository.countByStatusAndIsDeletedFalse(User.UserStatus.ACTIVE);
        long pendingApprovals = userRepository.countByAccountStatusAndIsDeletedFalse(User.AccountStatus.PENDING);
        long pendingLeaves = leaveApplicationRepository.countAllPendingLeaves();
        long activeTeams = teamRepository.countByStatus(Team.TeamStatus.ACTIVE);

        // Recent leave applications (last 10)
        List<LeaveApplication> recentApps = leaveApplicationRepository
                .findRecentApplications(PageRequest.of(0, 10));
        List<AdminDashboardResponse.RecentLeaveApplication> recentItems = recentApps.stream()
                .map(la -> AdminDashboardResponse.RecentLeaveApplication.builder()
                        .id(la.getId())
                        .userName(la.getUser().getFirstName() + " " + la.getUser().getLastName())
                        .leaveTypeName(la.getLeaveType().getName())
                        .leaveTypeColor(la.getLeaveType().getColor())
                        .startDate(la.getStartDate())
                        .endDate(la.getEndDate())
                        .totalDays(la.getTotalDays())
                        .status(la.getStatus().name())
                        .createdAt(la.getCreatedAt())
                        .build())
                .toList();

        // Users on leave today
        List<LeaveApplication> onLeaveToday = leaveApplicationRepository.findUsersOnLeaveToday(today);
        List<AdminDashboardResponse.UserOnLeave> usersOnLeave = onLeaveToday.stream()
                .map(la -> AdminDashboardResponse.UserOnLeave.builder()
                        .userId(la.getUser().getId())
                        .userName(la.getUser().getFirstName() + " " + la.getUser().getLastName())
                        .leaveTypeName(la.getLeaveType().getName())
                        .leaveTypeColor(la.getLeaveType().getColor())
                        .profileImageUrl(la.getUser().getProfileImageUrl())
                        .build())
                .toList();

        // WFH today
        long wfhToday = wfhScheduleRepository.countActiveByDate(today);

        // Upcoming holidays (next 5)
        List<Holiday> holidays = holidayRepository.findByIsActiveTrueAndDateAfterOrderByDateAsc(today);
        List<AdminDashboardResponse.UpcomingHoliday> upcomingHolidays = holidays.stream()
                .limit(5)
                .map(h -> AdminDashboardResponse.UpcomingHoliday.builder()
                        .id(h.getId())
                        .name(h.getName())
                        .date(h.getDate())
                        .country(h.getCountryCode())
                        .build())
                .toList();

        // Team overview (active teams)
        List<Team> teams = teamRepository.findByStatus(Team.TeamStatus.ACTIVE);
        List<AdminDashboardResponse.TeamOverviewItem> teamItems = teams.stream()
                .map(t -> AdminDashboardResponse.TeamOverviewItem.builder()
                        .teamId(t.getId())
                        .teamName(t.getName())
                        .leaderName(t.getLeader() != null
                                ? t.getLeader().getFirstName() + " " + t.getLeader().getLastName()
                                : "Unassigned")
                        .membersCount(t.getTeamUsers() != null ? t.getTeamUsers().size() : 0)
                        .status(t.getStatus().name())
                        .build())
                .toList();

        return AdminDashboardResponse.builder()
                .totalActiveEmployees(activeEmployees)
                .pendingAccountApprovals(pendingApprovals)
                .pendingLeaveRequests(pendingLeaves)
                .activeTeamsCount(activeTeams)
                .recentLeaveApplications(recentItems)
                .usersOnLeaveToday(usersOnLeave)
                .usersWfhTodayCount(wfhToday)
                .upcomingHolidays(upcomingHolidays)
                .teamOverview(teamItems)
                .announcements(List.of())
                .build();
    }

    private MyDashboardResponse.LeaveBalanceSummary toBalanceSummary(LeaveBalance lb) {
        return MyDashboardResponse.LeaveBalanceSummary.builder()
                .id(lb.getId())
                .leaveType(MyDashboardResponse.LeaveTypeInfo.builder()
                        .id(lb.getLeaveType().getId())
                        .name(lb.getLeaveType().getName())
                        .code(lb.getLeaveType().getCode())
                        .color(lb.getLeaveType().getColor())
                        .build())
                .totalDays(lb.getTotalDays())
                .usedDays(lb.getUsedDays())
                .pendingDays(lb.getPendingDays())
                .remainingDays(lb.getRemainingDays())
                .carriedOverDays(lb.getCarriedOverDays())
                .build();
    }

    private MyDashboardResponse.LeaveItem toLeaveItem(LeaveApplication la) {
        return MyDashboardResponse.LeaveItem.builder()
                .id(la.getId())
                .leaveTypeName(la.getLeaveType().getName())
                .leaveTypeColor(la.getLeaveType().getColor())
                .startDate(la.getStartDate())
                .endDate(la.getEndDate())
                .totalDays(la.getTotalDays())
                .status(la.getStatus().name())
                .build();
    }
}
```

- [ ] **Step 3: Verify compilation**

Run: `cd /Users/seanreptimiguell.ticzon/Herd/hr_management_backend && ./gradlew compileJava 2>&1 | tail -5`
Expected: `BUILD SUCCESSFUL`

- [ ] **Step 4: Commit**

```bash
git add src/main/java/org/rp/application/dashboard/DashboardService.java \
        src/main/java/org/rp/application/dashboard/DashboardServiceImpl.java
git commit -m "feat(HRIS-41): add DashboardService with employee and admin aggregation"
```

---

## Task 4: Backend — Create DashboardController

**Files:**
- Create: `src/main/java/org/rp/infrastructure/controller/DashboardController.java`

- [ ] **Step 1: Create DashboardController.java**

```java
package org.rp.infrastructure.controller;

import io.swagger.v3.oas.annotations.security.SecurityRequirement;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.rp.application.dashboard.DashboardService;
import org.rp.application.dto.response.AdminDashboardResponse;
import org.rp.application.dto.response.MyDashboardResponse;
import org.rp.infrastructure.database.repository.UserRepository;
import org.rp.infrastructure.exception.ResourceNotFoundException;
import org.rp.infrastructure.web.response.ApiResponse;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.security.core.annotation.AuthenticationPrincipal;
import org.springframework.security.oauth2.jwt.Jwt;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

@Slf4j
@RestController
@RequestMapping("/dashboard")
@RequiredArgsConstructor
@SecurityRequirement(name = "bearerAuth")
public class DashboardController {

    private final DashboardService dashboardService;
    private final UserRepository userRepository;

    @GetMapping("/my")
    public ResponseEntity<ApiResponse<MyDashboardResponse>> getMyDashboard(
            @AuthenticationPrincipal Jwt jwt) {
        Long userId = getUserIdFromJwt(jwt);
        MyDashboardResponse response = dashboardService.getMyDashboard(userId);
        return ResponseEntity.ok(ApiResponse.success(response));
    }

    @GetMapping("/admin")
    @PreAuthorize("hasAuthority('USER_READ')")
    public ResponseEntity<ApiResponse<AdminDashboardResponse>> getAdminDashboard() {
        AdminDashboardResponse response = dashboardService.getAdminDashboard();
        return ResponseEntity.ok(ApiResponse.success(response));
    }

    private Long getUserIdFromJwt(Jwt jwt) {
        String userIdClaim = jwt.getClaimAsString("user_id");
        if (userIdClaim != null) {
            try {
                return Long.parseLong(userIdClaim);
            } catch (NumberFormatException e) {
                log.warn("JWT user_id claim '{}' is not a valid Long, falling back to email", userIdClaim);
            }
        }

        String email = jwt.getClaimAsString("preferred_username");
        if (email == null) email = jwt.getClaimAsString("email");
        if (email == null) email = jwt.getSubject();

        final String resolvedEmail = email;
        return userRepository.findByEmail(resolvedEmail)
                .orElseThrow(() -> new ResourceNotFoundException("User", "email", resolvedEmail))
                .getId();
    }
}
```

- [ ] **Step 2: Verify compilation**

Run: `cd /Users/seanreptimiguell.ticzon/Herd/hr_management_backend && ./gradlew compileJava 2>&1 | tail -5`
Expected: `BUILD SUCCESSFUL`

- [ ] **Step 3: Commit**

```bash
git add src/main/java/org/rp/infrastructure/controller/DashboardController.java
git commit -m "feat(HRIS-41): add DashboardController with /my and /admin endpoints"
```

---

## Task 5: Backend — Build Docker & Smoke Test

- [ ] **Step 1: Rebuild the backend Docker image**

Run: `cd /Users/seanreptimiguell.ticzon/Herd/hr_management_backend && docker compose up -d --build app`
Expected: Container rebuilds and starts successfully.

- [ ] **Step 2: Check logs for startup errors**

Run: `docker compose logs --tail=30 app`
Expected: No errors. Look for `Started HrManagementApplication` in output.

- [ ] **Step 3: Commit all backend work (if not already committed)**

Verify: `git status` — all files should be committed from previous tasks.

---

## Task 6: Frontend — Add TypeScript Types

**Files:**
- Modify: `frontend/src/types/index.d.ts`

- [ ] **Step 1: Add dashboard types to index.d.ts**

Append these types after the existing `PositionResponse` interface:

```typescript
// Dashboard types
export interface DashboardLeaveTypeInfo {
    id: number;
    name: string;
    code: string;
    color: string;
}

export interface DashboardLeaveBalanceSummary {
    id: number;
    leaveType: DashboardLeaveTypeInfo;
    totalDays: number;
    usedDays: number;
    pendingDays: number;
    remainingDays: number;
    carriedOverDays: number;
}

export interface DashboardLeaveItem {
    id: number;
    leaveTypeName: string;
    leaveTypeColor: string;
    startDate: string;
    endDate: string;
    totalDays: number;
    status: string;
}

export interface MyDashboardResponse {
    leaveBalances: DashboardLeaveBalanceSummary[];
    upcomingLeaves: DashboardLeaveItem[];
    pendingLeaves: DashboardLeaveItem[];
    upcomingLeavesCount: number;
    pendingLeavesCount: number;
    wfhThisWeekCount: number;
    assignedAssetsCount: number;
    announcementsCount: number;
}

export interface AdminRecentLeaveApplication {
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

export interface AdminUserOnLeave {
    userId: number;
    userName: string;
    leaveTypeName: string;
    leaveTypeColor: string;
    profileImageUrl: string | null;
}

export interface AdminUpcomingHoliday {
    id: number;
    name: string;
    date: string;
    country: string;
}

export interface AdminTeamOverview {
    teamId: number;
    teamName: string;
    leaderName: string;
    membersCount: number;
    status: string;
}

export interface AdminDashboardResponse {
    totalActiveEmployees: number;
    pendingAccountApprovals: number;
    pendingLeaveRequests: number;
    activeTeamsCount: number;
    recentLeaveApplications: AdminRecentLeaveApplication[];
    usersOnLeaveToday: AdminUserOnLeave[];
    usersWfhTodayCount: number;
    upcomingHolidays: AdminUpcomingHoliday[];
    teamOverview: AdminTeamOverview[];
    announcements: unknown[];
}
```

- [ ] **Step 2: Commit**

```bash
cd /Users/seanreptimiguell.ticzon/Herd/rp-management-system/frontend
git add src/types/index.d.ts
git commit -m "feat(HRIS-41): add dashboard TypeScript types"
```

---

## Task 7: Frontend — Create Dashboard Page

**Files:**
- Create: `frontend/src/pages/Dashboard/Index.tsx`
- Modify: `frontend/src/router.tsx`

- [ ] **Step 1: Create Dashboard/Index.tsx**

Create the full tabbed dashboard page at `frontend/src/pages/Dashboard/Index.tsx`:

```tsx
import { Alert, AlertDescription } from '@/components/ui/alert';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import {
    Card,
    CardContent,
    CardHeader,
    CardTitle,
} from '@/components/ui/card';
import { Progress } from '@/components/ui/progress';
import { Skeleton } from '@/components/ui/skeleton';
import {
    Table,
    TableBody,
    TableCell,
    TableHead,
    TableHeader,
    TableRow,
} from '@/components/ui/table';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { useAuth } from '@/contexts/auth-context';
import { usePermission } from '@/hooks/usePermission';
import { apiGet } from '@/lib/spring-boot-api';
import type {
    AdminDashboardResponse,
    DashboardLeaveBalanceSummary,
    DashboardLeaveItem,
    MyDashboardResponse,
} from '@/types';
import { useQuery } from '@tanstack/react-query';
import {
    AlertCircle,
    Bell,
    Briefcase,
    Calendar,
    CheckCircle2,
    Clock,
    Eye,
    Home,
    Laptop,
    LayoutDashboard,
    Mail,
    MapPin,
    Phone,
    Plus,
    User,
    UserCheck,
    Users,
    UsersRound,
} from 'lucide-react';
import { useState } from 'react';
import { Helmet } from 'react-helmet-async';
import { Link } from 'react-router-dom';

// ---------------------------------------------------------------------------
// Helpers
// ---------------------------------------------------------------------------

function getLeaveBalanceColor(balance: DashboardLeaveBalanceSummary): string {
    if (balance.totalDays === 0) return 'text-gray-600';
    const pct = (balance.remainingDays / balance.totalDays) * 100;
    if (pct < 25) return 'text-red-600';
    if (pct < 50) return 'text-yellow-600';
    return 'text-green-600';
}

function formatDateRange(start: string, end: string): string {
    const opts: Intl.DateTimeFormatOptions = { month: 'short', day: 'numeric' };
    const s = new Date(start).toLocaleDateString('en-US', opts);
    if (start === end) return s;
    const e = new Date(end).toLocaleDateString('en-US', opts);
    return `${s} - ${e}`;
}

function statusBadge(status: string) {
    const map: Record<string, { label: string; cls: string }> = {
        APPROVED: { label: 'Approved', cls: 'bg-green-100 text-green-700' },
        PENDING_MANAGER: { label: 'Pending Manager', cls: 'bg-yellow-100 text-yellow-700' },
        PENDING_HR: { label: 'Pending HR', cls: 'bg-orange-100 text-orange-700' },
        REJECTED_BY_MANAGER: { label: 'Rejected', cls: 'bg-red-100 text-red-700' },
        REJECTED_BY_HR: { label: 'Rejected', cls: 'bg-red-100 text-red-700' },
        CANCELLED: { label: 'Cancelled', cls: 'bg-gray-100 text-gray-700' },
    };
    const info = map[status] ?? { label: status, cls: 'bg-gray-100 text-gray-700' };
    return <Badge className={info.cls}>{info.label}</Badge>;
}

// ---------------------------------------------------------------------------
// Stat Card
// ---------------------------------------------------------------------------

function StatCard({
    label,
    value,
    icon: Icon,
    color,
}: {
    label: string;
    value: number | string;
    icon: React.ElementType;
    color: string;
}) {
    const bgMap: Record<string, string> = {
        blue: 'bg-blue-100',
        purple: 'bg-purple-100',
        yellow: 'bg-yellow-100',
        green: 'bg-green-100',
        orange: 'bg-orange-100',
        red: 'bg-red-100',
    };
    const textMap: Record<string, string> = {
        blue: 'text-blue-600',
        purple: 'text-purple-600',
        yellow: 'text-yellow-600',
        green: 'text-green-600',
        orange: 'text-orange-600',
        red: 'text-red-600',
    };
    return (
        <Card>
            <CardContent className="pt-6">
                <div className="flex items-center justify-between">
                    <div>
                        <p className="text-sm font-medium text-gray-600">{label}</p>
                        <p className={`mt-2 text-3xl font-bold ${textMap[color] ?? 'text-gray-900'}`}>
                            {value}
                        </p>
                    </div>
                    <div className={`rounded-lg p-3 ${bgMap[color] ?? 'bg-gray-100'}`}>
                        <Icon className={`h-6 w-6 ${textMap[color] ?? 'text-gray-600'}`} />
                    </div>
                </div>
            </CardContent>
        </Card>
    );
}

// ---------------------------------------------------------------------------
// Leave item card (reused in upcoming + pending)
// ---------------------------------------------------------------------------

function LeaveItemCard({ leave, variant }: { leave: DashboardLeaveItem; variant: 'upcoming' | 'pending' }) {
    const borderColor = variant === 'upcoming' ? 'border-green-200 bg-green-50' : 'border-yellow-200 bg-yellow-50';
    return (
        <div className={`rounded-lg border p-4 ${borderColor}`}>
            <div className="mb-2 flex items-start justify-between">
                <div className="flex items-center gap-2">
                    <div
                        className="h-3 w-3 rounded-full"
                        style={{ backgroundColor: leave.leaveTypeColor }}
                    />
                    <span className="font-medium text-gray-900">{leave.leaveTypeName}</span>
                </div>
                {variant === 'upcoming' ? (
                    <Badge className="bg-green-100 text-green-700">
                        <CheckCircle2 className="mr-1 h-3 w-3" />
                        Approved
                    </Badge>
                ) : (
                    statusBadge(leave.status)
                )}
            </div>
            <div className="flex items-center gap-4 text-sm text-gray-600">
                <span>{formatDateRange(leave.startDate, leave.endDate)}</span>
                <span>&bull;</span>
                <span>
                    {leave.totalDays} {leave.totalDays === 1 ? 'day' : 'days'}
                </span>
            </div>
        </div>
    );
}

// ---------------------------------------------------------------------------
// My Dashboard (Employee Tab)
// ---------------------------------------------------------------------------

function MyDashboardTab({ data, isLoading }: { data?: MyDashboardResponse; isLoading: boolean }) {
    const { user } = useAuth();

    if (isLoading) {
        return (
            <div className="space-y-6">
                <div className="grid grid-cols-1 gap-6 md:grid-cols-4">
                    {[...Array(4)].map((_, i) => (
                        <Skeleton key={i} className="h-[100px] rounded-xl" />
                    ))}
                </div>
                <div className="grid grid-cols-1 gap-6 lg:grid-cols-3">
                    <Skeleton className="h-[400px] rounded-xl lg:col-span-2" />
                    <Skeleton className="h-[400px] rounded-xl" />
                </div>
            </div>
        );
    }

    return (
        <div className="space-y-6">
            {/* Quick Stats */}
            <div className="grid grid-cols-1 gap-6 md:grid-cols-4">
                <StatCard label="Assigned Assets" value={data?.assignedAssetsCount ?? 0} icon={Laptop} color="blue" />
                <StatCard label="Upcoming Leaves" value={data?.upcomingLeavesCount ?? 0} icon={Calendar} color="purple" />
                <StatCard label="Pending Requests" value={data?.pendingLeavesCount ?? 0} icon={Clock} color="yellow" />
                <StatCard label="WFH This Week" value={data?.wfhThisWeekCount ?? 0} icon={Home} color="green" />
            </div>

            {/* Main Content Grid */}
            <div className="grid grid-cols-1 gap-6 lg:grid-cols-3">
                {/* Left Column */}
                <div className="space-y-6 lg:col-span-2">
                    {/* Leave Balances */}
                    <Card>
                        <CardHeader>
                            <div className="flex items-center justify-between">
                                <CardTitle className="flex items-center gap-2">
                                    <Calendar className="h-5 w-5" />
                                    My Leave Balances ({new Date().getFullYear()})
                                </CardTitle>
                                <Button asChild size="sm" className="bg-blue-600 hover:bg-blue-700">
                                    <Link to="/my-leaves/apply">
                                        <Plus className="mr-2 h-4 w-4" />
                                        Apply for Leave
                                    </Link>
                                </Button>
                            </div>
                        </CardHeader>
                        <CardContent>
                            {data?.leaveBalances && data.leaveBalances.length > 0 ? (
                                <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
                                    {data.leaveBalances.map((balance) => (
                                        <div
                                            key={balance.id}
                                            className="rounded-lg border-2 p-4 transition-shadow hover:shadow-md"
                                            style={{ borderColor: balance.leaveType.color + '40' }}
                                        >
                                            <div className="mb-3 flex items-center justify-between">
                                                <div className="flex items-center gap-2">
                                                    <div
                                                        className="h-3 w-3 rounded-full"
                                                        style={{ backgroundColor: balance.leaveType.color }}
                                                    />
                                                    <span className="font-medium text-gray-900">
                                                        {balance.leaveType.name}
                                                    </span>
                                                </div>
                                                <Badge
                                                    variant="outline"
                                                    className="text-xs"
                                                    style={{
                                                        borderColor: balance.leaveType.color + '40',
                                                        color: balance.leaveType.color,
                                                    }}
                                                >
                                                    {balance.leaveType.code}
                                                </Badge>
                                            </div>
                                            <div className="mb-2 flex items-baseline gap-2">
                                                <span className={`text-3xl font-bold ${getLeaveBalanceColor(balance)}`}>
                                                    {balance.remainingDays}
                                                </span>
                                                <span className="text-gray-500">/ {balance.totalDays} days</span>
                                            </div>
                                            <Progress
                                                value={
                                                    balance.totalDays > 0
                                                        ? (balance.remainingDays / balance.totalDays) * 100
                                                        : 0
                                                }
                                                className="mb-3 h-2"
                                            />
                                            <div className="flex justify-between text-xs text-gray-600">
                                                <span>Used: {balance.usedDays}</span>
                                                {balance.carriedOverDays > 0 && (
                                                    <span className="text-blue-600">
                                                        +{balance.carriedOverDays} carried over
                                                    </span>
                                                )}
                                            </div>
                                        </div>
                                    ))}
                                </div>
                            ) : (
                                <Alert className="border-yellow-200 bg-yellow-50">
                                    <AlertCircle className="h-4 w-4 text-yellow-600" />
                                    <AlertDescription className="text-yellow-800">
                                        No leave balances found. Contact HR to initialize your balances.
                                    </AlertDescription>
                                </Alert>
                            )}
                        </CardContent>
                    </Card>

                    {/* Upcoming Leaves */}
                    <Card>
                        <CardHeader>
                            <CardTitle className="flex items-center gap-2">
                                <Calendar className="h-5 w-5" />
                                Upcoming Leaves
                            </CardTitle>
                        </CardHeader>
                        <CardContent>
                            {data?.upcomingLeaves && data.upcomingLeaves.length > 0 ? (
                                <div className="space-y-3">
                                    {data.upcomingLeaves.map((leave) => (
                                        <LeaveItemCard key={leave.id} leave={leave} variant="upcoming" />
                                    ))}
                                    <Button asChild variant="outline" className="w-full">
                                        <Link to="/my-leaves">View All Leaves</Link>
                                    </Button>
                                </div>
                            ) : (
                                <div className="py-8 text-center text-gray-500">
                                    <Calendar className="mx-auto mb-2 h-12 w-12 text-gray-400" />
                                    <p>No upcoming leaves</p>
                                </div>
                            )}
                        </CardContent>
                    </Card>

                    {/* Pending Leave Requests */}
                    {data?.pendingLeaves && data.pendingLeaves.length > 0 && (
                        <Card>
                            <CardHeader>
                                <CardTitle className="flex items-center gap-2">
                                    <Clock className="h-5 w-5 text-yellow-600" />
                                    Pending Leave Requests
                                </CardTitle>
                            </CardHeader>
                            <CardContent>
                                <div className="space-y-3">
                                    {data.pendingLeaves.map((leave) => (
                                        <LeaveItemCard key={leave.id} leave={leave} variant="pending" />
                                    ))}
                                </div>
                            </CardContent>
                        </Card>
                    )}
                </div>

                {/* Right Sidebar */}
                <div className="space-y-6">
                    {/* My Profile */}
                    <Card>
                        <CardHeader>
                            <CardTitle className="flex items-center gap-2">
                                <User className="h-5 w-5" />
                                My Profile
                            </CardTitle>
                        </CardHeader>
                        <CardContent className="space-y-4">
                            <div className="flex items-center gap-4">
                                <div className="flex h-16 w-16 items-center justify-center rounded-full border-2 border-gray-200 bg-blue-600">
                                    <span className="text-2xl font-medium text-white">
                                        {(user?.name || 'U').charAt(0).toUpperCase()}
                                    </span>
                                </div>
                                <div>
                                    <h3 className="font-semibold text-gray-900">{user?.name}</h3>
                                    <p className="text-sm text-gray-600">{user?.position}</p>
                                </div>
                            </div>
                            <div className="space-y-2 text-sm">
                                {user?.employeeId && (
                                    <div className="flex items-center gap-2 text-gray-600">
                                        <Briefcase className="h-4 w-4" />
                                        <span>ID: {user.employeeId}</span>
                                    </div>
                                )}
                                {user?.department?.name && (
                                    <div className="flex items-center gap-2 text-gray-600">
                                        <MapPin className="h-4 w-4" />
                                        <span>{user.department.name}</span>
                                    </div>
                                )}
                                {user?.email && (
                                    <div className="flex items-center gap-2 text-gray-600">
                                        <Mail className="h-4 w-4" />
                                        <span className="truncate">{user.email}</span>
                                    </div>
                                )}
                                {user?.phoneNumber && (
                                    <div className="flex items-center gap-2 text-gray-600">
                                        <Phone className="h-4 w-4" />
                                        <span>{user.phoneNumber}</span>
                                    </div>
                                )}
                            </div>
                            <Button asChild variant="outline" className="mt-4 w-full">
                                <Link to="/settings">View Full Profile</Link>
                            </Button>
                        </CardContent>
                    </Card>

                    {/* My Assets (placeholder) */}
                    <Card>
                        <CardHeader>
                            <CardTitle className="flex items-center gap-2">
                                <Laptop className="h-5 w-5" />
                                My Assets
                            </CardTitle>
                        </CardHeader>
                        <CardContent>
                            <div className="py-8 text-center text-gray-500">
                                <Laptop className="mx-auto mb-2 h-12 w-12 text-gray-400" />
                                <p className="text-sm">No assets assigned</p>
                            </div>
                        </CardContent>
                    </Card>

                    {/* Quick Actions */}
                    <Card>
                        <CardHeader>
                            <CardTitle>Quick Actions</CardTitle>
                        </CardHeader>
                        <CardContent className="grid grid-cols-2 gap-3">
                            <Button asChild variant="outline" className="justify-start">
                                <Link to="/my-leaves/apply">
                                    <Calendar className="mr-2 h-4 w-4" />
                                    Apply Leave
                                </Link>
                            </Button>
                            <Button asChild variant="outline" className="justify-start">
                                <Link to="/my-leaves">
                                    <Eye className="mr-2 h-4 w-4" />
                                    My Leaves
                                </Link>
                            </Button>
                            <Button asChild variant="outline" className="justify-start">
                                <Link to="/my-wfh">
                                    <Home className="mr-2 h-4 w-4" />
                                    My WFH
                                </Link>
                            </Button>
                            <Button asChild variant="outline" className="justify-start">
                                <Link to="/settings">
                                    <User className="mr-2 h-4 w-4" />
                                    My Profile
                                </Link>
                            </Button>
                        </CardContent>
                    </Card>
                </div>
            </div>
        </div>
    );
}

// ---------------------------------------------------------------------------
// Admin Dashboard Tab
// ---------------------------------------------------------------------------

function AdminDashboardTab({ data, isLoading }: { data?: AdminDashboardResponse; isLoading: boolean }) {
    const { can } = usePermission();

    if (isLoading) {
        return (
            <div className="space-y-6">
                <div className="grid grid-cols-1 gap-6 md:grid-cols-4">
                    {[...Array(4)].map((_, i) => (
                        <Skeleton key={i} className="h-[100px] rounded-xl" />
                    ))}
                </div>
                <div className="grid grid-cols-1 gap-6 lg:grid-cols-3">
                    <Skeleton className="h-[400px] rounded-xl lg:col-span-2" />
                    <Skeleton className="h-[400px] rounded-xl" />
                </div>
            </div>
        );
    }

    return (
        <div className="space-y-6">
            {/* Summary Cards */}
            <div className="grid grid-cols-1 gap-6 md:grid-cols-4">
                <StatCard label="Active Employees" value={data?.totalActiveEmployees ?? 0} icon={Users} color="blue" />
                <StatCard label="Pending Approvals" value={data?.pendingAccountApprovals ?? 0} icon={UserCheck} color="orange" />
                <StatCard label="Pending Leaves" value={data?.pendingLeaveRequests ?? 0} icon={Clock} color="yellow" />
                <StatCard label="Active Teams" value={data?.activeTeamsCount ?? 0} icon={UsersRound} color="green" />
            </div>

            {/* Main Content Grid */}
            <div className="grid grid-cols-1 gap-6 lg:grid-cols-3">
                {/* Left Column */}
                <div className="space-y-6 lg:col-span-2">
                    {/* Recent Leave Applications */}
                    <Card>
                        <CardHeader>
                            <div className="flex items-center justify-between">
                                <CardTitle className="flex items-center gap-2">
                                    <Calendar className="h-5 w-5" />
                                    Recent Leave Applications
                                </CardTitle>
                                {can('leaves.view') && (
                                    <Button asChild variant="outline" size="sm">
                                        <Link to="/leaves/management">View All</Link>
                                    </Button>
                                )}
                            </div>
                        </CardHeader>
                        <CardContent>
                            {data?.recentLeaveApplications && data.recentLeaveApplications.length > 0 ? (
                                <Table>
                                    <TableHeader>
                                        <TableRow>
                                            <TableHead>Employee</TableHead>
                                            <TableHead>Type</TableHead>
                                            <TableHead>Dates</TableHead>
                                            <TableHead>Days</TableHead>
                                            <TableHead>Status</TableHead>
                                        </TableRow>
                                    </TableHeader>
                                    <TableBody>
                                        {data.recentLeaveApplications.map((la) => (
                                            <TableRow key={la.id}>
                                                <TableCell className="font-medium">{la.userName}</TableCell>
                                                <TableCell>
                                                    <div className="flex items-center gap-2">
                                                        <div
                                                            className="h-2.5 w-2.5 rounded-full"
                                                            style={{ backgroundColor: la.leaveTypeColor }}
                                                        />
                                                        {la.leaveTypeName}
                                                    </div>
                                                </TableCell>
                                                <TableCell>{formatDateRange(la.startDate, la.endDate)}</TableCell>
                                                <TableCell>{la.totalDays}</TableCell>
                                                <TableCell>{statusBadge(la.status)}</TableCell>
                                            </TableRow>
                                        ))}
                                    </TableBody>
                                </Table>
                            ) : (
                                <div className="py-8 text-center text-gray-500">
                                    <Calendar className="mx-auto mb-2 h-12 w-12 text-gray-400" />
                                    <p>No leave applications yet</p>
                                </div>
                            )}
                        </CardContent>
                    </Card>

                    {/* Announcements (placeholder) */}
                    <Card>
                        <CardHeader>
                            <CardTitle className="flex items-center gap-2">
                                <Bell className="h-5 w-5" />
                                Announcements
                            </CardTitle>
                        </CardHeader>
                        <CardContent>
                            <div className="py-8 text-center text-gray-500">
                                <Bell className="mx-auto mb-2 h-12 w-12 text-gray-400" />
                                <p>No announcements yet</p>
                                <p className="mt-1 text-xs text-gray-400">
                                    Company announcements will appear here
                                </p>
                            </div>
                        </CardContent>
                    </Card>

                    {/* Team Overview */}
                    <Card>
                        <CardHeader>
                            <div className="flex items-center justify-between">
                                <CardTitle className="flex items-center gap-2">
                                    <UsersRound className="h-5 w-5" />
                                    Team Overview
                                </CardTitle>
                                {can('teams.view') && (
                                    <Button asChild variant="outline" size="sm">
                                        <Link to="/teams">Manage Teams</Link>
                                    </Button>
                                )}
                            </div>
                        </CardHeader>
                        <CardContent>
                            {data?.teamOverview && data.teamOverview.length > 0 ? (
                                <Table>
                                    <TableHeader>
                                        <TableRow>
                                            <TableHead>Team</TableHead>
                                            <TableHead>Leader</TableHead>
                                            <TableHead>Members</TableHead>
                                            <TableHead>Status</TableHead>
                                        </TableRow>
                                    </TableHeader>
                                    <TableBody>
                                        {data.teamOverview.map((team) => (
                                            <TableRow key={team.teamId}>
                                                <TableCell className="font-medium">{team.teamName}</TableCell>
                                                <TableCell>{team.leaderName}</TableCell>
                                                <TableCell>{team.membersCount}</TableCell>
                                                <TableCell>
                                                    <Badge className="bg-green-100 text-green-700">
                                                        {team.status}
                                                    </Badge>
                                                </TableCell>
                                            </TableRow>
                                        ))}
                                    </TableBody>
                                </Table>
                            ) : (
                                <div className="py-8 text-center text-gray-500">
                                    <UsersRound className="mx-auto mb-2 h-12 w-12 text-gray-400" />
                                    <p>No teams created yet</p>
                                </div>
                            )}
                        </CardContent>
                    </Card>
                </div>

                {/* Right Sidebar */}
                <div className="space-y-6">
                    {/* Users on Leave Today */}
                    <Card>
                        <CardHeader>
                            <CardTitle className="flex items-center gap-2">
                                <Calendar className="h-5 w-5 text-red-600" />
                                On Leave Today
                            </CardTitle>
                        </CardHeader>
                        <CardContent>
                            {data?.usersOnLeaveToday && data.usersOnLeaveToday.length > 0 ? (
                                <div className="space-y-3">
                                    {data.usersOnLeaveToday.map((u) => (
                                        <div key={u.userId} className="flex items-center gap-3">
                                            <div className="flex h-8 w-8 items-center justify-center rounded-full bg-blue-600 text-xs font-medium text-white">
                                                {u.userName.charAt(0).toUpperCase()}
                                            </div>
                                            <div className="flex-1 min-w-0">
                                                <p className="truncate text-sm font-medium text-gray-900">
                                                    {u.userName}
                                                </p>
                                                <div className="flex items-center gap-1">
                                                    <div
                                                        className="h-2 w-2 rounded-full"
                                                        style={{ backgroundColor: u.leaveTypeColor }}
                                                    />
                                                    <p className="text-xs text-gray-500">{u.leaveTypeName}</p>
                                                </div>
                                            </div>
                                        </div>
                                    ))}
                                </div>
                            ) : (
                                <p className="py-4 text-center text-sm text-gray-500">
                                    No one on leave today
                                </p>
                            )}
                        </CardContent>
                    </Card>

                    {/* WFH Today */}
                    <Card>
                        <CardHeader>
                            <CardTitle className="flex items-center gap-2">
                                <Home className="h-5 w-5 text-green-600" />
                                WFH Today
                            </CardTitle>
                        </CardHeader>
                        <CardContent>
                            <div className="flex items-center gap-3 py-2">
                                <div className="rounded-lg bg-green-100 p-3">
                                    <Laptop className="h-6 w-6 text-green-600" />
                                </div>
                                <div>
                                    <p className="text-2xl font-bold text-gray-900">
                                        {data?.usersWfhTodayCount ?? 0}
                                    </p>
                                    <p className="text-sm text-gray-500">employees working from home</p>
                                </div>
                            </div>
                        </CardContent>
                    </Card>

                    {/* Upcoming Holidays */}
                    <Card>
                        <CardHeader>
                            <CardTitle className="flex items-center gap-2">
                                <Calendar className="h-5 w-5 text-purple-600" />
                                Upcoming Holidays
                            </CardTitle>
                        </CardHeader>
                        <CardContent>
                            {data?.upcomingHolidays && data.upcomingHolidays.length > 0 ? (
                                <div className="space-y-3">
                                    {data.upcomingHolidays.map((h) => (
                                        <div key={h.id} className="flex items-start gap-3">
                                            <div className="mt-0.5 rounded bg-purple-100 px-2 py-1 text-xs font-medium text-purple-700">
                                                {new Date(h.date).toLocaleDateString('en-US', {
                                                    month: 'short',
                                                    day: 'numeric',
                                                })}
                                            </div>
                                            <div>
                                                <p className="text-sm font-medium text-gray-900">{h.name}</p>
                                                <p className="text-xs text-gray-500">{h.country}</p>
                                            </div>
                                        </div>
                                    ))}
                                </div>
                            ) : (
                                <p className="py-4 text-center text-sm text-gray-500">
                                    No upcoming holidays
                                </p>
                            )}
                        </CardContent>
                    </Card>

                    {/* Quick Actions (Admin) */}
                    <Card>
                        <CardHeader>
                            <CardTitle>Quick Actions</CardTitle>
                        </CardHeader>
                        <CardContent className="grid grid-cols-2 gap-3">
                            {can('users.view') && (
                                <Button asChild variant="outline" className="justify-start">
                                    <Link to="/users">
                                        <Users className="mr-2 h-4 w-4" />
                                        Users
                                    </Link>
                                </Button>
                            )}
                            {can('teams.view') && (
                                <Button asChild variant="outline" className="justify-start">
                                    <Link to="/teams">
                                        <UsersRound className="mr-2 h-4 w-4" />
                                        Teams
                                    </Link>
                                </Button>
                            )}
                            {can('leaves.approve') && (
                                <Button asChild variant="outline" className="justify-start">
                                    <Link to="/leaves/management">
                                        <CheckCircle2 className="mr-2 h-4 w-4" />
                                        Approvals
                                    </Link>
                                </Button>
                            )}
                            {can('users.view') && (
                                <Button asChild variant="outline" className="justify-start">
                                    <Link to="/users/pending-approvals">
                                        <UserCheck className="mr-2 h-4 w-4" />
                                        Pending Accts
                                    </Link>
                                </Button>
                            )}
                        </CardContent>
                    </Card>
                </div>
            </div>
        </div>
    );
}

// ---------------------------------------------------------------------------
// Main Dashboard Page
// ---------------------------------------------------------------------------

export default function Dashboard() {
    const { user } = useAuth();
    const { can } = usePermission();
    const canViewAdmin = can('users.view');

    const [activeTab, setActiveTab] = useState<string>('my');

    const { data: myData, isLoading: myLoading } = useQuery({
        queryKey: ['dashboard', 'my'],
        queryFn: () => apiGet<MyDashboardResponse>('/dashboard/my'),
    });

    const { data: adminData, isLoading: adminLoading } = useQuery({
        queryKey: ['dashboard', 'admin'],
        queryFn: () => apiGet<AdminDashboardResponse>('/dashboard/admin'),
        enabled: activeTab === 'admin' && canViewAdmin,
    });

    return (
        <>
            <Helmet>
                <title>Dashboard</title>
            </Helmet>

            {/* Header */}
            <div className="border-b border-gray-200 bg-white">
                <div className="px-4 py-6 sm:px-6 lg:px-8">
                    <div className="flex items-center gap-3">
                        <div className="rounded-lg bg-blue-100 p-2">
                            <LayoutDashboard className="h-6 w-6 text-blue-600" />
                        </div>
                        <div>
                            <h2 className="text-3xl font-bold text-gray-900">
                                Welcome back, {user?.firstName || user?.name}!
                            </h2>
                            <p className="mt-1 text-gray-600">
                                Here's what's happening with your account
                            </p>
                        </div>
                    </div>
                </div>
            </div>

            <div className="mx-auto max-w-7xl px-4 py-8 sm:px-6 lg:px-8">
                {canViewAdmin ? (
                    <Tabs value={activeTab} onValueChange={setActiveTab}>
                        <TabsList className="mb-6">
                            <TabsTrigger value="my">My Dashboard</TabsTrigger>
                            <TabsTrigger value="admin">Admin Overview</TabsTrigger>
                        </TabsList>
                        <TabsContent value="my">
                            <MyDashboardTab data={myData} isLoading={myLoading} />
                        </TabsContent>
                        <TabsContent value="admin">
                            <AdminDashboardTab data={adminData} isLoading={adminLoading} />
                        </TabsContent>
                    </Tabs>
                ) : (
                    <MyDashboardTab data={myData} isLoading={myLoading} />
                )}
            </div>
        </>
    );
}
```

- [ ] **Step 2: Update router.tsx**

In `frontend/src/router.tsx`:

1. Change the dashboard lazy import from:
```typescript
const Dashboard = lazy(() => import('@/pages/Employees/Dashboard'));
```
to:
```typescript
const Dashboard = lazy(() => import('@/pages/Dashboard/Index'));
```

The route itself (`{ path: '/dashboard', element: <Dashboard /> }`) stays unchanged.

- [ ] **Step 3: Verify frontend compiles**

Run: `cd /Users/seanreptimiguell.ticzon/Herd/rp-management-system/frontend && npm run build 2>&1 | tail -10`
Expected: Build succeeds with no TypeScript errors.

- [ ] **Step 4: Commit**

```bash
git add src/pages/Dashboard/Index.tsx src/router.tsx src/types/index.d.ts
git commit -m "feat(HRIS-41): add tabbed dashboard with employee and admin views"
```

---

## Task 8: End-to-End Verification

- [ ] **Step 1: Start backend (if not running)**

Run: `cd /Users/seanreptimiguell.ticzon/Herd/hr_management_backend && docker compose up -d --build app`

- [ ] **Step 2: Start frontend dev server**

Run: `cd /Users/seanreptimiguell.ticzon/Herd/rp-management-system/frontend && npm run dev`

- [ ] **Step 3: Verify /dashboard/my returns data**

Run: `curl -s http://localhost:8080/api/v1/dashboard/my -H "Authorization: Bearer <token>" | jq .`
Expected: JSON with `leaveBalances`, `upcomingLeaves`, `pendingLeaves`, `wfhThisWeekCount`, etc.

- [ ] **Step 4: Verify /dashboard/admin returns data**

Run: `curl -s http://localhost:8080/api/v1/dashboard/admin -H "Authorization: Bearer <token>" | jq .`
Expected: JSON with `totalActiveEmployees`, `recentLeaveApplications`, `teamOverview`, etc.

- [ ] **Step 5: Browser test**

Open `http://localhost:5173/dashboard`:
- Employee tab shows: stats cards, leave balances with color dots + code badges, upcoming leaves, pending leaves, profile card, assets placeholder, quick actions
- Admin tab (if admin user): stats cards, recent leave table, announcements placeholder, team overview table, on-leave-today sidebar, WFH today, upcoming holidays, admin quick actions
