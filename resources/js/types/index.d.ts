import { InertiaLinkProps } from '@inertiajs/react';
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
    href: NonNullable<InertiaLinkProps['href']>;
    icon?: LucideIcon | null;
    isActive?: boolean;
}

export interface SharedData {
    name: string;
    quote: { message: string; author: string };
    auth: Auth;
    sidebarOpen: boolean;
    [key: string]: unknown;
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
        department: string | null;
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
    department: string | null;
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
        department: string | null;
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
    department: string | null;
    profile_picture: string | null;
    pivot?: {
        is_primary: boolean;
        role_in_team: 'lead' | 'sub-lead' | 'member' | null;
        created_at: string;
    };
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
