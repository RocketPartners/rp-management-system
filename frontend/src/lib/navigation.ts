import {
    Briefcase,
    Building2,
    Calendar,
    CheckSquare,
    ClipboardList,
    FileCheck,
    FolderKanban,
    Home,
    Laptop,
    LayoutDashboard,
    Layers,
    LifeBuoy,
    Mail,
    Megaphone,
    Package,
    PartyPopper,
    Settings,
    Shield,
    UserCheck,
    UserPlus,
    Users,
    UsersRound,
    Wallet,
} from 'lucide-react';
import { type LucideIcon } from 'lucide-react';

export interface NavItemConfig {
    name: string;
    href: string;
    icon: LucideIcon;
    badge?: number;
}

export interface NavSectionItems {
    type: 'items';
    label?: string;
    items: NavItemConfig[];
}

export interface NavSectionAccordion {
    type: 'accordion';
    name: string;
    icon: LucideIcon;
    items: NavItemConfig[];
}

export interface NavSectionDivider {
    type: 'divider';
    label?: string;
}

export type NavSection = NavSectionItems | NavSectionAccordion | NavSectionDivider;

export function buildNavigation(can: (perm: string) => boolean): NavSection[] {
    const nav: NavSection[] = [];

    // EVERYONE - Personal
    nav.push({
        type: 'items',
        items: [
            {
                name: 'Dashboard',
                href: '/dashboard',
                icon: LayoutDashboard,
            },
            { name: 'Calendar', href: '/calendar', icon: Calendar },
            { name: 'My Leaves', href: '/my-leaves', icon: ClipboardList },
            { name: 'My WFH', href: '/my-wfh', icon: Home },
            { name: 'Announcements', href: '/announcements', icon: Megaphone },
            { name: 'My Assets', href: '/my-assets', icon: Laptop },
        ],
    });

    // ADMINISTRATION divider
    const hasAdminAccess =
        can('USER_READ') || can('TEAM_READ') || can('ROLE_READ') ||
        can('DEPARTMENT_READ') || can('POSITION_READ') ||
        can('ONBOARDING_VIEW') || can('ONBOARDING_MANAGE') ||
        can('LEAVE_APPLICATION_APPROVE') || can('LEAVE_APPLICATION_READ') || can('LEAVE_TYPE_CREATE') ||
        can('ASSET_VIEW') || can('ASSET_CREATE') ||
        can('PROJECT_READ') || can('PROJECT_CREATE');

    if (hasAdminAccess) {
        nav.push({ type: 'divider', label: 'Administration' });
    }

    // USER MANAGEMENT
    if (can('USER_READ') || can('TEAM_READ')) {
        const userItems: NavItemConfig[] = [];

        if (can('USER_READ')) {
            userItems.push({
                name: 'All Users',
                href: '/users',
                icon: Users,
            });
        }

        if (can('USER_UPDATE')) {
            userItems.push({
                name: 'Pending Approvals',
                href: '/users/pending-approvals',
                icon: UserCheck,
            });
        }

        if (can('TEAM_READ')) {
            userItems.push({
                name: 'Teams',
                href: '/teams',
                icon: UsersRound,
            });
        }

        if (userItems.length > 0) {
            nav.push({
                type: 'accordion',
                name: 'User Management',
                icon: Users,
                items: userItems,
            });
        }
    } else if (can('USER_UPDATE')) {
        nav.push({
            type: 'items',
            items: [
                {
                    name: 'Pending Approvals',
                    href: '/users/pending-approvals',
                    icon: UserCheck,
                },
            ],
        });
    }

    // ROLE MANAGEMENT
    if (can('ROLE_READ')) {
        nav.push({
            type: 'accordion',
            name: 'Role Management',
            icon: Shield,
            items: [
                {
                    name: 'All Roles',
                    href: '/roles',
                    icon: Shield,
                },
            ],
        });
    }

    // ORGANIZATION (Departments & Positions)
    if (can('DEPARTMENT_READ') || can('POSITION_READ')) {
        const orgItems: NavItemConfig[] = [];

        if (can('DEPARTMENT_READ')) {
            orgItems.push({
                name: 'Departments',
                href: '/departments',
                icon: Building2,
            });
        }

        if (can('POSITION_READ')) {
            orgItems.push({
                name: 'Positions',
                href: '/positions',
                icon: Briefcase,
            });
        }

        if (orgItems.length > 0) {
            nav.push({
                type: 'accordion',
                name: 'Organization',
                icon: Building2,
                items: orgItems,
            });
        }
    }

    // ONBOARDING MANAGEMENT
    if (can('ONBOARDING_VIEW') || can('ONBOARDING_MANAGE')) {
        nav.push({
            type: 'accordion',
            name: 'Onboarding',
            icon: UserPlus,
            items: [
                {
                    name: 'Invites',
                    href: '/onboarding/invites',
                    icon: Mail,
                },
                {
                    name: 'Submissions',
                    href: '/onboarding/submissions',
                    icon: FileCheck,
                },
            ],
        });
    }

    // LEAVE MANAGEMENT
    if (
        can('LEAVE_APPLICATION_APPROVE') ||
        can('LEAVE_APPLICATION_READ') ||
        can('LEAVE_TYPE_CREATE')
    ) {
        const leaveItems: NavItemConfig[] = [];

        if (can('LEAVE_APPLICATION_APPROVE') && !can('LEAVE_TYPE_CREATE')) {
            leaveItems.push({
                name: 'Pending Approvals',
                href: '/leaves/pending-approvals',
                icon: CheckSquare,
            });
        }

        if (can('LEAVE_APPLICATION_READ') || can('LEAVE_TYPE_CREATE')) {
            leaveItems.push({
                name: 'All Requests',
                href: '/leaves',
                icon: ClipboardList,
            });
            leaveItems.push({
                name: 'Pending HR Approval',
                href: '/leaves?status=pending_hr',
                icon: CheckSquare,
            });
        }

        if (can('LEAVE_TYPE_CREATE')) {
            leaveItems.push({
                name: 'Leave Types',
                href: '/leave-types',
                icon: Layers,
            });
            leaveItems.push({
                name: 'Balance Management',
                href: '/leave-balances',
                icon: Wallet,
            });
            leaveItems.push({
                name: 'Holidays',
                href: '/holidays',
                icon: PartyPopper,
            });
        }

        if (leaveItems.length > 0) {
            nav.push({
                type: 'accordion',
                name: 'Leave Management',
                icon: Calendar,
                items: leaveItems,
            });
        }
    }

    // ASSET MANAGEMENT
    if (can('ASSET_VIEW') || can('ASSET_CREATE') || can('ASSET_EDIT')) {
        nav.push({
            type: 'items',
            items: [
                {
                    name: 'Assets',
                    href: '/assets',
                    icon: Package,
                },
            ],
        });
    }

    // PROJECT MANAGEMENT
    if (can('PROJECT_READ') || can('PROJECT_CREATE')) {
        nav.push({
            type: 'accordion',
            name: 'Projects',
            icon: FolderKanban,
            items: [
                {
                    name: 'All Projects',
                    href: '/projects',
                    icon: FolderKanban,
                },
                { name: 'Tasks', href: '/tasks', icon: ClipboardList },
                {
                    name: 'Kanban Board',
                    href: '/tasks/kanban',
                    icon: Layers,
                },
            ],
        });
    }

    // SUPPORT & SETTINGS
    nav.push({ type: 'divider' });
    nav.push({
        type: 'items',
        items: [
            { name: 'Support', href: '/support', icon: LifeBuoy },
            { name: 'Settings', href: '/settings', icon: Settings },
        ],
    });

    return nav;
}
