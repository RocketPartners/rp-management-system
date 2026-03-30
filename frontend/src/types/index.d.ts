import { LucideIcon } from 'lucide-react';

export interface Auth {
    user: User;
}

export interface BreadcrumbItem {
    title: string;
    href: string;
}

export interface NavGroup {
    title: string;
    items: NavItem[];
}

export interface NavItem {
    title: string;
    href: string;
    icon?: LucideIcon | null;
    isActive?: boolean;
}

export interface User {
    id: number;
    name: string;
    email: string;
    avatar?: string;
    email_verified_at: string | null;
    two_factor_enabled?: boolean;
    created_at: string;
    updated_at: string;
    permissions?: string[]; // Array of permission slugs
    [key: string]: unknown; // This allows for additional properties...
}

// ============================================
// PERMISSION SYSTEM TYPES
// ============================================

export interface Permission {
    id: number;
    name: string;
    slug: string;
    description: string;
    group: string;
    category?: string;
}

export interface PermissionOverride {
    permission_id: number;
    type: 'grant' | 'revoke';
    reason: string | null;
    expires_at: string | null;
    granted_by: {
        id: number;
        name: string;
    };
    created_at: string;
}

export interface PermissionMatrixItem {
    id: number;
    name: string;
    slug: string;
    description: string;
    from_role: boolean; // Does the role have this?
    override: 'grant' | 'revoke' | null; // User-specific override
    effective: boolean; // Final access (what matters)
    override_info: {
        granted_by: { id: number; name: string };
        reason: string | null;
        expires_at: string | null;
        created_at: string;
    } | null;
}

export interface PermissionMatrix {
    [group: string]: PermissionMatrixItem[];
}

export interface RolePermissionMatrixItem {
    id: number;
    name: string;
    slug: string;
    description: string;
    assigned: boolean; // Is this permission assigned to the role?
}

export interface RolePermissionMatrix {
    [group: string]: RolePermissionMatrixItem[];
}

// ============================================
// CALENDAR SYSTEM TYPES
// ============================================

export interface CalendarEventType {
    id: number;
    name: string;
    slug: string;
    color: string;
    icon: string;
    description: string;
    is_system: boolean;
    is_active: boolean;
    sort_order: number;
    count?: number;
}

export interface CalendarEvent {
    id: string;
    title: string;
    start: string;
    end: string;
    allDay: boolean;
    color: string;
    textColor: string;
    type: string;
    extendedProps: {
        event_id: number;
        event_type: string;
        user_name: string;
        department_id: number | null;
        department: { id: number; name: string } | null;
        leave_type?: string;
        total_days?: number;
        reason?: string;
        status?: string;
        user_id?: number;
        leave_type_id?: number;
        [key: string]: unknown;
    };
}

export interface CalendarUserSettings {
    id: number;
    user_id: number;
    default_view: 'month' | 'week' | 'day';
    show_weekends: boolean;
    visible_event_types: string[];
    default_filters: Record<string, unknown> | null;
    created_at: string;
    updated_at: string;
}

export interface CalendarFilters {
    event_types: string[];
    user_ids: number[] | null;
    department_id: number | null;
    leave_type_ids: number[] | null;
    search: string | null;
}

export interface CalendarStatistics {
    total_events: number;
    by_type: Record<string, number>;
    users_on_leave_today: number;
    upcoming_holidays: unknown[];
}

export interface UserOnLeave {
    id: number;
    user: {
        id: number;
        name: string;
        avatar: string | null;
        department: { id: number; name: string } | null;
    };
    leave_type: {
        id: number;
        name: string;
        color: string;
    };
    start_date: string;
    end_date: string;
    total_days: number;
}

// ============================================
// TEAM MANAGEMENT TYPES
// ============================================

export interface Team {
    id: number;
    name: string;
    slug: string;
    description: string | null;
    leader_id: number | null;
    sub_leader_id: number | null;
    status: 'active' | 'inactive' | 'archived';
    leader: TeamMember | null;
    sub_leader: TeamMember | null;
    members: TeamMember[];
    members_count?: number;
    created_at: string;
    updated_at: string;
}

export interface TeamMember {
    id: number;
    name: string;
    email?: string;
    position: string | null;
    department: { id: number; name: string } | null;
    profile_picture: string | null;
    pivot?: {
        is_primary: boolean;
        role_in_team: 'lead' | 'sub-lead' | 'member' | null;
        created_at: string;
    };
}

// ============================================
// DEPARTMENT TYPES (Spring Boot camelCase)
// ============================================

export interface DepartmentResponse {
    id: number;
    name: string;
    code: string;
    description: string | null;
    parentId: number | null;
    parentName: string | null;
    managerId: number | null;
    managerName: string | null;
    isActive: boolean;
    createdAt: string;
    updatedAt: string;
}

// ============================================
// POSITION TYPES (Spring Boot camelCase)
// ============================================

export interface PositionResponse {
    id: number;
    title: string;
    code: string;
    description: string | null;
    departmentId: number | null;
    departmentName: string | null;
    minSalary: number | null;
    maxSalary: number | null;
    level: string | null;
    isActive: boolean;
    createdAt: string;
    updatedAt: string;
}

// ============================================
// TEAM MANAGEMENT TYPES (Spring Boot camelCase)
// ============================================

export interface TeamResponse {
    id: number;
    name: string;
    slug: string;
    description: string | null;
    leaderId: number | null;
    leaderName: string | null;
    subLeaderId: number | null;
    subLeaderName: string | null;
    status: string;
    membersCount: number;
    members: TeamMemberResponse[] | null;
    createdAt: string;
    updatedAt: string;
}

export interface TeamMemberResponse {
    userId: number;
    userName: string;
    email: string | null;
    position: string | null;
    department: string | null;
    roleInTeam: string;
    isPrimary: boolean;
}

export interface LeaveType {
    id: number;
    name: string;
    code: string;
    color: string;
    icon: string;
    description?: string;
    is_active?: boolean;
    sort_order?: number;
}

// ============================================
// SPRING BOOT API TYPES (camelCase)
// ============================================

export interface LeaveApplicationResponse {
    id: number;
    userId: number;
    userName: string;
    leaveTypeId: number;
    leaveTypeName: string;
    leaveTypeCode: string;
    leaveTypeColor: string;
    startDate: string;
    endDate: string;
    totalDays: number;
    duration: string;
    reason: string;
    attachment: string | null;
    emergencyContactName: string | null;
    emergencyContactPhone: string | null;
    availability: string;
    status: LeaveStatus;
    statusLabel: string;
    assignedManagerId: number | null;
    assignedManagerName: string | null;
    managerApprovedById: number | null;
    managerApprovedByName: string | null;
    managerApprovedAt: string | null;
    managerComments: string | null;
    hrApprovedById: number | null;
    hrApprovedByName: string | null;
    hrApprovedAt: string | null;
    hrComments: string | null;
    cancellationReason: string | null;
    cancellationRequestedAt: string | null;
    cancellationApprovedById: number | null;
    cancellationApprovedByName: string | null;
    cancellationApprovedAt: string | null;
    cancellationHrComments: string | null;
    createdAt: string;
    updatedAt: string;
}

export type LeaveStatus =
    | 'PENDING_MANAGER'
    | 'PENDING_HR'
    | 'APPROVED'
    | 'REJECTED_BY_MANAGER'
    | 'REJECTED_BY_HR'
    | 'CANCELLED'
    | 'PENDING_CANCELLATION';

export interface LeaveBalanceResponse {
    id: number;
    userId: number;
    userName: string;
    leaveTypeId: number;
    leaveTypeName: string;
    leaveTypeCode: string;
    year: number;
    totalDays: number;
    usedDays: number;
    pendingDays: number;
    remainingDays: number;
    carriedOverDays: number;
    adjustmentDays: number;
    adjustmentReason: string | null;
    createdAt: string;
    updatedAt: string;
}

export interface LeaveTypeResponse {
    id: number;
    name: string;
    code: string;
    description: string | null;
    defaultDaysPerYear: number;
    isPaid: boolean;
    requiresMedicalCert: boolean;
    medicalCertDaysThreshold: number | null;
    isCarryOverAllowed: boolean;
    maxCarryOverDays: number | null;
    requiresManagerApproval: boolean;
    requiresHrApproval: boolean;
    color: string;
    icon: string | null;
    sortOrder: number;
    genderSpecific: string | null;
    maxConsecutiveDays: number | null;
    isActive: boolean;
    createdAt: string;
    updatedAt: string;
}

export interface PagedResponse<T> {
    content: T[];
    totalPages: number;
    totalElements: number;
    number: number;
    size: number;
    first: boolean;
    last: boolean;
}

export interface ApiResponse<T> {
    status: 'success' | 'error';
    message: string;
    data: T;
}

export interface PotentialApprover {
    id: number;
    name: string;
    email: string;
    employeeId: string | null;
    position: string | null;
}

// ============================================
// CALENDAR & WFH TYPES (Spring Boot)
// ============================================

export interface CalendarSettings {
    defaultView: string;
    showWeekends: boolean;
    visibleEventTypes: string[];
    defaultFilters: Record<string, unknown> | null;
}

export interface CalendarFiltersState {
    event_types: string[];
    user_ids: number[] | null;
    department_id: number | null;
    manager_id: number | null;
    leave_type_ids: number[] | null;
    search: string | null;
    country_codes: string[];
    us_states: string[];
}

export interface CalendarEventTypeConfig {
    id: number;
    name: string;
    slug: string;
    color: string;
    icon: string;
    description: string;
    isSystem: boolean;
    isActive: boolean;
    sortOrder: number;
    count?: number;
}

export interface CalendarStatsResponse {
    totalEvents: number;
    byType: Record<string, number>;
    usersOnLeaveToday: number;
    upcomingHolidays: unknown[];
}

export interface UserOnLeaveResponse {
    id: number;
    user: {
        id: number;
        name: string;
        avatar: string | null;
        department: { id: number; name: string } | null;
    };
    leaveType: {
        id: number;
        name: string;
        color: string;
    };
    startDate: string;
    endDate: string;
    totalDays: number;
}

export interface CalendarEventData {
    id: string;
    title: string;
    start: string;
    end: string;
    allDay: boolean;
    color: string;
    textColor: string;
    type: string;
    extendedProps: Record<string, unknown>;
}

export interface CalendarManagerOption {
    id: number;
    name: string;
    department?: { id: number; name: string } | null;
}

export interface WFHWeeklyUsage {
    used: number;
    quota: number;
    remaining: number;
}

export interface WFHMonthlyStats {
    approved: number;
    upcoming: number;
}

export interface WFHSchedule {
    id: number;
    date: string;
    dayName: string;
    type: string;
    reason: string | null;
    status: 'approved' | 'pending' | 'cancelled';
    isToday: boolean;
    isPast: boolean;
}

// ============================================
// USER MANAGEMENT TYPES (Spring Boot camelCase)
// ============================================

export type AccountStatus = 'PENDING' | 'ACTIVE' | 'REJECTED' | 'SUSPENDED';

export interface UserResponse {
    id: number;
    email: string;
    firstName: string;
    middleName: string | null;
    lastName: string;
    suffix: string | null;
    fullName: string;
    phone: string | null;
    personalMobile: string | null;
    workEmail: string | null;
    personalEmail: string | null;
    civilStatus: string | null;
    dateOfBirth: string | null;
    birthday: string | null;
    gender: string | null;
    address: string | null;
    addressLine2: string | null;
    city: string | null;
    state: string | null;
    postalCode: string | null;
    country: string | null;
    emergencyContactName: string | null;
    emergencyContactPhone: string | null;
    emergencyContactMobile: string | null;
    emergencyContactRelationship: string | null;
    sssNumber: string | null;
    tinNumber: string | null;
    hdmfNumber: string | null;
    philhealthNumber: string | null;
    payrollAccount: string | null;
    hireDate: string | null;
    terminationDate: string | null;
    employeeId: string | null;
    profileImageUrl: string | null;
    employmentType: string | null;
    status: string;
    accountStatus: AccountStatus;
    approvedBy: number | null;
    approvedAt: string | null;
    departmentId: number | null;
    departmentName: string | null;
    positionId: number | null;
    positionTitle: string | null;
    managerId: number | null;
    managerName: string | null;
    roles: string[];
    permissions: string[];
    createdAt: string;
    updatedAt: string;
}

export interface PermissionMatrixEntry {
    permissionId: number;
    permissionName: string;
    permissionSlug: string;
    group: string;
    fromRole: boolean;
    overrideType: 'GRANT' | 'REVOKE' | null;
    effective: boolean;
    reason: string | null;
    expiresAt: string | null;
    grantedBy: number | null;
}

export interface DepartmentOption {
    id: number;
    name: string;
}

export interface PositionOption {
    id: number;
    title: string;
}

export interface RoleOption {
    id: number;
    name: string;
}

export interface SelectedCalendarEvent {
    title: string;
    start: Date | null;
    end: Date | null;
    event_type: string;
    user_name?: string;
    leave_type?: string;
    department?: { id: number; name: string } | null;
    total_days?: number;
    reason?: string;
    status?: string;
    [key: string]: unknown;
}
