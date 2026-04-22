# PWA Mobile Optimization — Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Replace the mobile hamburger sidebar with a liquid glass bottom navigation bar, add a notifications page, and polish the PWA mobile experience.

**Architecture:** Extract shared navigation config from `AuthenticatedLayout.tsx` into a utility. Build three new mobile-nav components (BottomNav, MoreSheet, QuickActionFab) that render only below the `lg` breakpoint. Add a `/notifications` full-page route. Fix known bugs in sw.js, vite.config, and notification socket.

**Tech Stack:** React 19, React Router, TanStack Query, Radix UI (Sheet), Tailwind CSS v4, Lucide icons, Vite

---

## File Structure

**New files:**
| File | Responsibility |
|---|---|
| `src/lib/navigation.ts` | Shared nav config builder (extracted from AuthenticatedLayout) |
| `src/hooks/use-bottom-nav.ts` | Hook: detects `< lg` breakpoint (1024px) for showing bottom nav |
| `src/components/mobile-nav/BottomNav.tsx` | Orchestrator: renders glass pill + MoreSheet + QuickActionFab |
| `src/components/mobile-nav/GlassPill.tsx` | Glass pill with 4 nav tabs (Home, Calendar, Leaves, Alerts) |
| `src/components/mobile-nav/MoreSheet.tsx` | Bottom sheet with full navigation, triggered by More blob |
| `src/components/mobile-nav/QuickActionFab.tsx` | FAB + quick action menu (Apply Leave, Request WFH, Submit Ticket) |
| `src/components/mobile-nav/glass-styles.ts` | Shared CSS class strings for glass material (light/dark) |
| `src/pages/Notifications/Index.tsx` | Full-screen notifications page with filter tabs |

**Modified files:**
| File | Change |
|---|---|
| `src/layouts/AuthenticatedLayout.tsx` | Import BottomNav, remove mobile hamburger, use shared nav config, add bottom padding |
| `src/router.tsx` | Add `/notifications` route |
| `src/components/notifications/NotificationDropdown.tsx` | On mobile, navigate to `/notifications` instead of opening dropdown |
| `public/sw.js` | Fix icon paths |
| `src/hooks/use-notification-socket.ts` | Remove unused `SOCKJS_URL` |
| `vite.config.ts` | Remove hardcoded host config |

---

### Task 1: Bug Fixes & Cleanup

**Files:**
- Modify: `frontend/public/sw.js:6-9`
- Modify: `frontend/src/hooks/use-notification-socket.ts:12`
- Modify: `frontend/vite.config.ts:17-20`

- [ ] **Step 1: Fix sw.js icon paths**

In `frontend/public/sw.js`, replace lines 6-9:

```js
// Before:
icon: data.icon || '/icon-192x192.png',
badge: '/icon-192x192.png',

// After:
icon: data.icon || '/images/icon-192x192.png',
badge: '/images/icon-192x192.png',
```

- [ ] **Step 2: Remove unused SOCKJS_URL from use-notification-socket.ts**

Delete line 12 from `frontend/src/hooks/use-notification-socket.ts`:

```ts
// DELETE this line:
const SOCKJS_URL = (import.meta.env.VITE_SPRING_BOOT_API_URL || 'http://localhost:8080/api/v1') + '/ws';
```

- [ ] **Step 3: Clean vite.config.ts**

In `frontend/vite.config.ts`, remove the hardcoded `allowedHosts` and `hmr` config. Keep `host`, `port`, `strictPort`, and `proxy`:

```ts
server: {
    host: '0.0.0.0',
    port: 5174,
    strictPort: true,
    proxy: {
        '/api': {
            target: 'http://localhost:8080',
            changeOrigin: true,
        },
    },
},
```

- [ ] **Step 4: Commit**

```bash
git add frontend/public/sw.js frontend/src/hooks/use-notification-socket.ts frontend/vite.config.ts
git commit -m "fix: correct sw.js icon paths, remove unused SOCKJS_URL, clean vite config"
```

---

### Task 2: Extract Shared Navigation Config

**Files:**
- Create: `frontend/src/lib/navigation.ts`
- Modify: `frontend/src/layouts/AuthenticatedLayout.tsx`

- [ ] **Step 1: Create navigation.ts**

Create `frontend/src/lib/navigation.ts`. This extracts the nav types and `buildNavigation()` logic from `AuthenticatedLayout.tsx` so both the sidebar and mobile sheet can use it. The function takes a `can` permission checker as a parameter (no hook dependency):

```ts
import type { LucideIcon } from 'lucide-react';
import {
    Briefcase,
    Building2,
    Calendar,
    CheckSquare,
    ClipboardList,
    FolderKanban,
    Home,
    Laptop,
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
    FileCheck,
    LayoutDashboard,
} from 'lucide-react';

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
            { name: 'Dashboard', href: '/dashboard', icon: LayoutDashboard },
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
        if (can('USER_READ')) userItems.push({ name: 'All Users', href: '/users', icon: Users });
        if (can('USER_UPDATE')) userItems.push({ name: 'Pending Approvals', href: '/users/pending-approvals', icon: UserCheck });
        if (can('TEAM_READ')) userItems.push({ name: 'Teams', href: '/teams', icon: UsersRound });
        if (userItems.length > 0) {
            nav.push({ type: 'accordion', name: 'User Management', icon: Users, items: userItems });
        }
    } else if (can('USER_UPDATE')) {
        nav.push({ type: 'items', items: [{ name: 'Pending Approvals', href: '/users/pending-approvals', icon: UserCheck }] });
    }

    // ROLE MANAGEMENT
    if (can('ROLE_READ')) {
        nav.push({ type: 'accordion', name: 'Role Management', icon: Shield, items: [{ name: 'All Roles', href: '/roles', icon: Shield }] });
    }

    // ORGANIZATION
    if (can('DEPARTMENT_READ') || can('POSITION_READ')) {
        const orgItems: NavItemConfig[] = [];
        if (can('DEPARTMENT_READ')) orgItems.push({ name: 'Departments', href: '/departments', icon: Building2 });
        if (can('POSITION_READ')) orgItems.push({ name: 'Positions', href: '/positions', icon: Briefcase });
        if (orgItems.length > 0) {
            nav.push({ type: 'accordion', name: 'Organization', icon: Building2, items: orgItems });
        }
    }

    // ONBOARDING
    if (can('ONBOARDING_VIEW') || can('ONBOARDING_MANAGE')) {
        nav.push({
            type: 'accordion', name: 'Onboarding', icon: UserPlus,
            items: [
                { name: 'Invites', href: '/onboarding/invites', icon: Mail },
                { name: 'Submissions', href: '/onboarding/submissions', icon: FileCheck },
            ],
        });
    }

    // LEAVE MANAGEMENT
    if (can('LEAVE_APPLICATION_APPROVE') || can('LEAVE_APPLICATION_READ') || can('LEAVE_TYPE_CREATE')) {
        const leaveItems: NavItemConfig[] = [];
        if (can('LEAVE_APPLICATION_APPROVE') && !can('LEAVE_TYPE_CREATE')) {
            leaveItems.push({ name: 'Pending Approvals', href: '/leaves/pending-approvals', icon: CheckSquare });
        }
        if (can('LEAVE_APPLICATION_READ') || can('LEAVE_TYPE_CREATE')) {
            leaveItems.push({ name: 'All Requests', href: '/leaves', icon: ClipboardList });
            leaveItems.push({ name: 'Pending HR Approval', href: '/leaves?status=pending_hr', icon: CheckSquare });
        }
        if (can('LEAVE_TYPE_CREATE')) {
            leaveItems.push({ name: 'Leave Types', href: '/leave-types', icon: Layers });
            leaveItems.push({ name: 'Balance Management', href: '/leave-balances', icon: Wallet });
            leaveItems.push({ name: 'Holidays', href: '/holidays', icon: PartyPopper });
        }
        if (leaveItems.length > 0) {
            nav.push({ type: 'accordion', name: 'Leave Management', icon: Calendar, items: leaveItems });
        }
    }

    // ASSET MANAGEMENT
    if (can('ASSET_VIEW') || can('ASSET_CREATE') || can('ASSET_EDIT')) {
        nav.push({ type: 'items', items: [{ name: 'Assets', href: '/assets', icon: Package }] });
    }

    // PROJECT MANAGEMENT
    if (can('PROJECT_READ') || can('PROJECT_CREATE')) {
        nav.push({
            type: 'accordion', name: 'Projects', icon: FolderKanban,
            items: [
                { name: 'All Projects', href: '/projects', icon: FolderKanban },
                { name: 'Tasks', href: '/tasks', icon: ClipboardList },
                { name: 'Kanban Board', href: '/tasks/kanban', icon: Layers },
            ],
        });
    }

    // SUPPORT & SETTINGS
    nav.push({ type: 'divider' });
    nav.push({ type: 'items', items: [
        { name: 'Support', href: '/support', icon: LifeBuoy },
        { name: 'Settings', href: '/settings', icon: Settings },
    ]});

    return nav;
}
```

- [ ] **Step 2: Refactor AuthenticatedLayout to use shared nav config**

In `frontend/src/layouts/AuthenticatedLayout.tsx`:

1. Remove the local `NavItemConfig`, `NavSectionItems`, `NavSectionAccordion`, `NavSectionDivider`, `NavSection` interfaces (lines 50-75).
2. Remove the local `buildNavigation` function (lines 147-400).
3. Import from the shared module:

```ts
import { buildNavigation, type NavSection, type NavItemConfig } from '@/lib/navigation';
```

4. Replace the call site — change `const navigation = buildNavigation();` to:

```ts
const navigation = buildNavigation(can);
```

5. Remove the now-unused icon imports that are no longer referenced in this file (they moved to `navigation.ts`). Keep only icons still used directly in the layout (Menu, X, ChevronDown, ChevronRight, Globe, Search, LogOut, LifeBuoy, Settings, Calendar, UserCheck).

- [ ] **Step 3: Verify the app still renders correctly**

```bash
cd frontend && npx tsc --noEmit
```

Expected: no type errors.

- [ ] **Step 4: Commit**

```bash
git add frontend/src/lib/navigation.ts frontend/src/layouts/AuthenticatedLayout.tsx
git commit -m "refactor: extract shared navigation config from AuthenticatedLayout"
```

---

### Task 3: Glass Styles & Bottom Nav Hook

**Files:**
- Create: `frontend/src/components/mobile-nav/glass-styles.ts`
- Create: `frontend/src/hooks/use-bottom-nav.ts`

- [ ] **Step 1: Create glass-styles.ts**

Create `frontend/src/components/mobile-nav/glass-styles.ts` with shared CSS class strings for the liquid glass material. These use Tailwind's `dark:` variant which maps to `prefers-color-scheme: dark`:

```ts
/**
 * Liquid glass material classes — adaptive light/dark.
 * Uses Tailwind `dark:` variant (prefers-color-scheme).
 */
export const glassClasses = [
    // Light mode
    'bg-white/50 border border-white/70',
    'shadow-[0_8px_32px_rgba(0,0,0,0.08),inset_0_1px_0_rgba(255,255,255,0.9)]',
    'backdrop-blur-[40px] backdrop-saturate-[1.8]',
    // Dark mode
    'dark:bg-[rgba(40,40,65,0.6)] dark:border-white/10',
    'dark:shadow-[0_8px_32px_rgba(0,0,0,0.35),inset_0_1px_0_rgba(255,255,255,0.07)]',
    'dark:backdrop-saturate-150',
].join(' ');

/** Icon color for inactive nav items */
export const inactiveIconClass = 'text-black/30 dark:text-white/40';

/** Icon color for active nav items */
export const activeIconClass = 'text-black/80 dark:text-white/90';

/** Label color for inactive nav items */
export const inactiveLabelClass = 'text-[10px] font-medium text-black/35 dark:text-white/40';

/** Label color for active nav items */
export const activeLabelClass = 'text-[10px] font-semibold text-slate-900 dark:text-white';

/** Active tab background within the pill */
export const activeTabBg = 'bg-black/[0.08] dark:bg-white/[0.12]';

/** Scrim behind FAB menu / sheet */
export const scrimClass = 'bg-black/15 dark:bg-black/30';
```

- [ ] **Step 2: Create use-bottom-nav.ts**

Create `frontend/src/hooks/use-bottom-nav.ts`. This detects the `< lg` breakpoint (1024px) — the same breakpoint Tailwind uses for `lg:`:

```ts
import { useEffect, useState } from 'react';

const LG_BREAKPOINT = 1024;

export function useIsBottomNav() {
    const [show, setShow] = useState(
        () => typeof window !== 'undefined' && window.innerWidth < LG_BREAKPOINT,
    );

    useEffect(() => {
        const mql = window.matchMedia(`(max-width: ${LG_BREAKPOINT - 1}px)`);
        const onChange = () => setShow(window.innerWidth < LG_BREAKPOINT);
        mql.addEventListener('change', onChange);
        return () => mql.removeEventListener('change', onChange);
    }, []);

    return show;
}
```

- [ ] **Step 3: Commit**

```bash
git add frontend/src/components/mobile-nav/glass-styles.ts frontend/src/hooks/use-bottom-nav.ts
git commit -m "feat: add glass style tokens and bottom nav breakpoint hook"
```

---

### Task 4: Glass Pill Component

**Files:**
- Create: `frontend/src/components/mobile-nav/GlassPill.tsx`

- [ ] **Step 1: Create GlassPill.tsx**

Create `frontend/src/components/mobile-nav/GlassPill.tsx`:

```tsx
import { Link, useLocation } from 'react-router-dom';
import { useQuery } from '@tanstack/react-query';
import {
    LayoutDashboard,
    Calendar,
    ClipboardList,
    Bell,
} from 'lucide-react';
import { cn } from '@/lib/utils';
import { apiGet } from '@/lib/spring-boot-api';
import {
    glassClasses,
    inactiveIconClass,
    activeIconClass,
    inactiveLabelClass,
    activeLabelClass,
    activeTabBg,
} from './glass-styles';

const tabs = [
    { name: 'Home', href: '/dashboard', icon: LayoutDashboard },
    { name: 'Calendar', href: '/calendar', icon: Calendar },
    { name: 'Leaves', href: '/my-leaves', icon: ClipboardList },
    { name: 'Alerts', href: '/notifications', icon: Bell },
] as const;

function isTabActive(href: string, pathname: string): boolean {
    if (href === '/dashboard') return pathname === '/dashboard';
    if (href === '/calendar') return pathname.startsWith('/calendar');
    if (href === '/my-leaves') return pathname.startsWith('/my-leaves');
    if (href === '/notifications') return pathname === '/notifications';
    return pathname === href;
}

export function GlassPill() {
    const { pathname } = useLocation();

    const { data: unreadData } = useQuery({
        queryKey: ['notifications', 'unread-count'],
        queryFn: () => apiGet<{ count: number }>('/notifications/unread-count'),
        refetchInterval: 30_000,
        refetchIntervalInBackground: false,
    });
    const unreadCount = unreadData?.count ?? 0;

    return (
        <nav
            className={cn(
                'flex flex-1 items-center justify-around rounded-full px-1 py-1 h-14',
                glassClasses,
            )}
        >
            {tabs.map((tab) => {
                const active = isTabActive(tab.href, pathname);
                const Icon = tab.icon;
                return (
                    <Link
                        key={tab.name}
                        to={tab.href}
                        className={cn(
                            'relative flex flex-col items-center gap-0.5 rounded-full px-4 py-1.5 transition-all duration-200',
                            active && activeTabBg,
                        )}
                    >
                        <Icon
                            className={cn('h-[22px] w-[22px]', active ? activeIconClass : inactiveIconClass)}
                            fill={active ? 'currentColor' : 'none'}
                            strokeWidth={active ? 0 : 1.8}
                        />
                        <span className={active ? activeLabelClass : inactiveLabelClass}>
                            {tab.name}
                        </span>
                        {tab.name === 'Alerts' && unreadCount > 0 && (
                            <span className="absolute right-1.5 top-0 flex h-3.5 min-w-[14px] items-center justify-center rounded-full bg-red-500 px-1 text-[8px] font-bold text-white shadow-[0_2px_6px_rgba(239,68,68,0.5)]">
                                {unreadCount > 99 ? '99+' : unreadCount}
                            </span>
                        )}
                    </Link>
                );
            })}
        </nav>
    );
}
```

- [ ] **Step 2: Verify types**

```bash
cd frontend && npx tsc --noEmit
```

- [ ] **Step 3: Commit**

```bash
git add frontend/src/components/mobile-nav/GlassPill.tsx
git commit -m "feat: add GlassPill bottom nav component with 4 tabs"
```

---

### Task 5: Quick Action FAB

**Files:**
- Create: `frontend/src/components/mobile-nav/QuickActionFab.tsx`

- [ ] **Step 1: Create QuickActionFab.tsx**

Create `frontend/src/components/mobile-nav/QuickActionFab.tsx`:

```tsx
import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { ClipboardList, Home, HelpCircle, Plus } from 'lucide-react';
import { cn } from '@/lib/utils';
import { glassClasses, scrimClass } from './glass-styles';

const actions = [
    { name: 'Apply Leave', href: '/my-leaves/apply', icon: ClipboardList, iconColor: 'text-emerald-500 dark:text-emerald-400' },
    { name: 'Request WFH', href: '/my-wfh', icon: Home, iconColor: 'text-indigo-500 dark:text-indigo-400' },
    { name: 'Submit Ticket', href: '/support', icon: HelpCircle, iconColor: 'text-amber-500 dark:text-amber-400' },
] as const;

export function QuickActionFab() {
    const [open, setOpen] = useState(false);
    const navigate = useNavigate();

    function handleAction(href: string) {
        setOpen(false);
        navigate(href);
    }

    return (
        <>
            {/* Scrim */}
            {open && (
                <div
                    className={cn('fixed inset-0 z-40 transition-opacity', scrimClass)}
                    onClick={() => setOpen(false)}
                />
            )}

            <div className="relative z-50">
                {/* Action menu — expands upward */}
                <div
                    className={cn(
                        'absolute bottom-[58px] right-0 flex flex-col gap-2 transition-all duration-200',
                        open
                            ? 'translate-y-0 scale-100 opacity-100'
                            : 'pointer-events-none translate-y-2 scale-95 opacity-0',
                    )}
                >
                    {actions.map((action) => {
                        const Icon = action.icon;
                        return (
                            <button
                                key={action.name}
                                onClick={() => handleAction(action.href)}
                                className={cn(
                                    'flex items-center gap-2.5 whitespace-nowrap rounded-full px-4 py-2.5 text-[13px] font-medium',
                                    'text-black/70 dark:text-white/80',
                                    'transition-transform hover:-translate-x-1',
                                    glassClasses,
                                )}
                            >
                                <Icon className={cn('h-[18px] w-[18px]', action.iconColor)} />
                                {action.name}
                            </button>
                        );
                    })}
                </div>

                {/* FAB button */}
                <button
                    onClick={() => setOpen(!open)}
                    className={cn(
                        'flex h-[50px] w-[50px] items-center justify-center rounded-full transition-transform duration-300',
                        glassClasses,
                        open && 'scale-105',
                    )}
                    aria-label={open ? 'Close quick actions' : 'Open quick actions'}
                >
                    <Plus
                        className={cn(
                            'h-6 w-6 text-black/50 dark:text-white/70 transition-transform duration-300',
                            open && 'rotate-45',
                        )}
                        strokeWidth={2.2}
                    />
                </button>
            </div>
        </>
    );
}
```

- [ ] **Step 2: Commit**

```bash
git add frontend/src/components/mobile-nav/QuickActionFab.tsx
git commit -m "feat: add QuickActionFab with Apply Leave, Request WFH, Submit Ticket"
```

---

### Task 6: More Sheet

**Files:**
- Create: `frontend/src/components/mobile-nav/MoreSheet.tsx`

- [ ] **Step 1: Create MoreSheet.tsx**

Create `frontend/src/components/mobile-nav/MoreSheet.tsx`. Uses Radix Sheet (bottom side) with glass styling. Renders full navigation from shared `buildNavigation()`:

```tsx
import { useState } from 'react';
import { Link, useLocation, useNavigate } from 'react-router-dom';
import { ChevronRight, LogOut, MoreHorizontal } from 'lucide-react';
import {
    Sheet,
    SheetContent,
    SheetTitle,
} from '@/components/ui/sheet';
import { cn } from '@/lib/utils';
import { useAuth } from '@/contexts/auth-context';
import { usePermission } from '@/hooks/usePermission';
import { buildNavigation, type NavSection, type NavItemConfig } from '@/lib/navigation';
import { glassClasses, scrimClass } from './glass-styles';

function isActive(href: string, pathname: string): boolean {
    const cleanHref = href.split('?')[0];
    if (pathname === cleanHref) return true;
    if (cleanHref !== '/' && pathname.startsWith(cleanHref + '/')) return true;
    return false;
}

function NavItem({ item, pathname, onNavigate }: { item: NavItemConfig; pathname: string; onNavigate: () => void }) {
    const active = isActive(item.href, pathname);
    const Icon = item.icon;
    return (
        <Link
            to={item.href}
            onClick={onNavigate}
            className={cn(
                'flex items-center gap-3 rounded-xl px-3 py-2.5 text-sm font-medium transition-colors',
                active ? 'bg-blue-500/10 text-blue-600' : 'text-slate-700 hover:bg-black/[0.04]',
            )}
        >
            <Icon className={cn('h-5 w-5', active ? 'text-blue-600' : 'text-black/40')} />
            {item.name}
            {item.badge && (
                <span className="ml-auto rounded-full bg-blue-600 px-2 py-0.5 text-[10px] font-semibold text-white">
                    {item.badge}
                </span>
            )}
        </Link>
    );
}

function AccordionSection({ section, pathname, onNavigate }: {
    section: { name: string; icon: React.ComponentType<{ className?: string }>; items: NavItemConfig[] };
    pathname: string;
    onNavigate: () => void;
}) {
    const hasActive = section.items.some((i) => isActive(i.href, pathname));
    const [expanded, setExpanded] = useState(hasActive);
    const Icon = section.icon;

    return (
        <div>
            <button
                onClick={() => setExpanded(!expanded)}
                className={cn(
                    'flex w-full items-center gap-3 rounded-xl px-3 py-2.5 text-sm font-medium transition-colors',
                    hasActive ? 'text-blue-600' : 'text-slate-700 hover:bg-black/[0.04]',
                )}
            >
                <Icon className={cn('h-5 w-5', hasActive ? 'text-blue-600' : 'text-black/40')} />
                {section.name}
                <ChevronRight
                    className={cn('ml-auto h-4 w-4 text-black/30 transition-transform', expanded && 'rotate-90')}
                />
            </button>
            {expanded && (
                <div className="ml-5 border-l-2 border-gray-200 pl-2 mt-1 space-y-0.5">
                    {section.items.map((item) => (
                        <NavItem key={item.name} item={item} pathname={pathname} onNavigate={onNavigate} />
                    ))}
                </div>
            )}
        </div>
    );
}

export function MoreSheet() {
    const [open, setOpen] = useState(false);
    const { user, logout } = useAuth();
    const { can } = usePermission();
    const { pathname } = useLocation();
    const navigate = useNavigate();
    const navigation = buildNavigation(can);

    const handleNavigate = () => setOpen(false);

    const handleLogout = async () => {
        setOpen(false);
        await logout();
        navigate('/login');
    };

    return (
        <>
            {/* More blob trigger */}
            <button
                onClick={() => setOpen(true)}
                className={cn(
                    'flex h-14 w-14 items-center justify-center rounded-full',
                    glassClasses,
                )}
                aria-label="More navigation"
            >
                <MoreHorizontal className="h-[22px] w-[22px] text-black/30 dark:text-white/40" strokeWidth={2.5} />
            </button>

            <Sheet open={open} onOpenChange={setOpen}>
                <SheetContent
                    side="bottom"
                    className={cn(
                        'max-h-[85vh] rounded-t-3xl border-t-0 p-0',
                        'bg-white/75 backdrop-blur-[50px] backdrop-saturate-[1.8]',
                        'dark:bg-[rgba(40,40,65,0.75)] dark:backdrop-saturate-150',
                    )}
                >
                    {/* Hidden title for accessibility */}
                    <SheetTitle className="sr-only">Navigation Menu</SheetTitle>

                    {/* Drag handle */}
                    <div className="flex justify-center pt-3 pb-1">
                        <div className="h-1 w-9 rounded-full bg-black/15 dark:bg-white/20" />
                    </div>

                    {/* User header */}
                    <div className="flex items-center gap-3 border-b border-black/[0.06] dark:border-white/[0.06] px-5 pb-3 pt-2">
                        <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-full bg-blue-600">
                            <span className="text-sm font-semibold text-white">
                                {(user?.name || 'U').charAt(0).toUpperCase()}
                            </span>
                        </div>
                        <div className="min-w-0">
                            <div className="truncate text-sm font-semibold text-slate-900 dark:text-white">{user?.name}</div>
                            <div className="truncate text-xs text-slate-500 dark:text-white/50">{user?.position || user?.email}</div>
                        </div>
                    </div>

                    {/* Scrollable navigation */}
                    <div className="flex-1 overflow-y-auto px-3 py-2">
                        {navigation.map((section: NavSection, idx: number) => (
                            <div key={idx}>
                                {section.type === 'divider' ? (
                                    section.label ? (
                                        <div className="flex items-center gap-2 px-3 pt-4 pb-2">
                                            <div className="h-px flex-1 bg-black/[0.06] dark:bg-white/[0.06]" />
                                            <span className="text-[10px] font-semibold uppercase tracking-widest text-slate-400 dark:text-white/30">
                                                {section.label}
                                            </span>
                                            <div className="h-px flex-1 bg-black/[0.06] dark:bg-white/[0.06]" />
                                        </div>
                                    ) : (
                                        <div className="mx-3 my-2 h-px bg-black/[0.06] dark:bg-white/[0.06]" />
                                    )
                                ) : section.type === 'items' ? (
                                    <div className="space-y-0.5">
                                        {section.items.map((item) => (
                                            <NavItem key={item.name} item={item} pathname={pathname} onNavigate={handleNavigate} />
                                        ))}
                                    </div>
                                ) : (
                                    <AccordionSection section={section} pathname={pathname} onNavigate={handleNavigate} />
                                )}
                            </div>
                        ))}
                    </div>

                    {/* Footer - Logout */}
                    <div className="border-t border-black/[0.06] dark:border-white/[0.06] px-3 py-3">
                        <button
                            onClick={handleLogout}
                            className="flex w-full items-center gap-3 rounded-xl px-3 py-2.5 text-sm font-medium text-red-500 transition-colors hover:bg-red-500/[0.06]"
                        >
                            <LogOut className="h-5 w-5" />
                            Log Out
                        </button>
                    </div>
                </SheetContent>
            </Sheet>
        </>
    );
}
```

- [ ] **Step 2: Verify types**

```bash
cd frontend && npx tsc --noEmit
```

- [ ] **Step 3: Commit**

```bash
git add frontend/src/components/mobile-nav/MoreSheet.tsx
git commit -m "feat: add MoreSheet bottom sheet with full navigation"
```

---

### Task 7: BottomNav Orchestrator

**Files:**
- Create: `frontend/src/components/mobile-nav/BottomNav.tsx`

- [ ] **Step 1: Create BottomNav.tsx**

Create `frontend/src/components/mobile-nav/BottomNav.tsx`. This is the top-level component that composes the three glass elements:

```tsx
import { GlassPill } from './GlassPill';
import { MoreSheet } from './MoreSheet';
import { QuickActionFab } from './QuickActionFab';

export function BottomNav() {
    return (
        <div
            className="fixed bottom-0 left-0 right-0 z-30 px-3 lg:hidden"
            style={{ paddingBottom: 'max(14px, env(safe-area-inset-bottom))' }}
        >
            {/* FAB row — above the bar, right-aligned */}
            <div className="mb-2.5 flex justify-end pr-1">
                <QuickActionFab />
            </div>

            {/* Bar row — pill + more blob */}
            <div className="flex items-center gap-2.5">
                <GlassPill />
                <MoreSheet />
            </div>
        </div>
    );
}
```

- [ ] **Step 2: Commit**

```bash
git add frontend/src/components/mobile-nav/BottomNav.tsx
git commit -m "feat: add BottomNav orchestrator component"
```

---

### Task 8: Integrate BottomNav into AuthenticatedLayout

**Files:**
- Modify: `frontend/src/layouts/AuthenticatedLayout.tsx`

- [ ] **Step 1: Add BottomNav import and render**

In `frontend/src/layouts/AuthenticatedLayout.tsx`:

1. Add import at the top:

```ts
import { BottomNav } from '@/components/mobile-nav/BottomNav';
```

2. Render `<BottomNav />` inside the root div, after `<main>` (before the closing `</div>`), around line 761:

```tsx
            {/* Main Content */}
            <main
                className={`flex-1 transition-all duration-300 ${sidebarMinimized ? 'lg:ml-20' : 'lg:ml-64'} pt-16 pb-28 lg:pb-0`}
            >
                <Outlet />
            </main>

            {/* Mobile Bottom Navigation */}
            <BottomNav />
        </div>
    );
```

Note the added `pb-28 lg:pb-0` on the `<main>` element to clear the bottom nav on mobile.

- [ ] **Step 2: Remove mobile hamburger button**

In the top nav bar, change the hamburger button to only show on `lg:` (as the sidebar collapse toggle, not the mobile menu toggle). Find the button around line 424-432 and replace:

```tsx
{/* Before: */}
<button
    onClick={() => setSidebarOpen(!sidebarOpen)}
    className="inline-flex items-center justify-center rounded-md p-2 text-gray-400 hover:bg-gray-100 hover:text-gray-500 lg:hidden"
>

{/* After: hide on mobile completely — sidebar is now only for desktop */}
<button
    onClick={() => setSidebarOpen(!sidebarOpen)}
    className="hidden"
>
```

Actually, since the hamburger is now unused (mobile uses BottomNav, desktop has the sidebar minimize button inside the sidebar), remove the hamburger button entirely and its `sidebarOpen` state usage for mobile. The `sidebarOpen` state and the overlay can be removed too since the mobile sidebar overlay is replaced by the MoreSheet.

Remove:
- The hamburger `<button>` in the top nav (lines 424-432)
- The mobile sidebar overlay `{sidebarOpen && ...}` div (lines 562-567)
- From the sidebar `<aside>`, remove the mobile translate classes. Change:

```tsx
{/* Before */}
className={`fixed left-0 z-20 ... ${sidebarOpen ? 'translate-x-0' : '-translate-x-full lg:translate-x-0'}`}

{/* After — always hidden on mobile, visible on desktop */}
className={`fixed left-0 z-20 ... hidden lg:block`}
```

- Keep `sidebarOpen` state only if still used; if not, remove it. The `sidebarMinimized` state stays (used by the desktop sidebar collapse button).

- [ ] **Step 3: Verify the app builds**

```bash
cd frontend && npx tsc --noEmit
```

- [ ] **Step 4: Commit**

```bash
git add frontend/src/layouts/AuthenticatedLayout.tsx
git commit -m "feat: integrate BottomNav, remove mobile hamburger sidebar"
```

---

### Task 9: Notifications Page

**Files:**
- Create: `frontend/src/pages/Notifications/Index.tsx`
- Modify: `frontend/src/router.tsx`

- [ ] **Step 1: Create the Notifications page**

Create `frontend/src/pages/Notifications/Index.tsx`:

```tsx
import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import { formatDistanceToNow } from 'date-fns';
import { apiGet, apiPatch } from '@/lib/spring-boot-api';
import type { PagedResponse } from '@/types';
import {
    getNotificationMeta,
    getNotificationRoute,
    type NotificationResponse,
} from '@/types/notification';
import { cn } from '@/lib/utils';

type FilterTab = 'all' | 'unread' | 'leaves' | 'system';

const FILTER_TABS: { key: FilterTab; label: string }[] = [
    { key: 'all', label: 'All' },
    { key: 'unread', label: 'Unread' },
    { key: 'leaves', label: 'Leaves' },
    { key: 'system', label: 'System' },
];

const LEAVE_TYPES = new Set([
    'LEAVE_REQUESTED', 'LEAVE_APPROVED', 'LEAVE_APPROVED_BY_MANAGER',
    'LEAVE_REJECTED', 'LEAVE_REJECTED_BY_MANAGER', 'LEAVE_CANCELLED',
    'LEAVE_CANCELLATION_REQUESTED', 'LEAVE_CANCELLATION_APPROVED', 'LEAVE_CANCELLATION_REJECTED',
]);

function filterNotifications(notifications: NotificationResponse[], filter: FilterTab): NotificationResponse[] {
    switch (filter) {
        case 'unread':
            return notifications.filter((n) => !n.isRead);
        case 'leaves':
            return notifications.filter((n) => LEAVE_TYPES.has(n.type));
        case 'system':
            return notifications.filter((n) => !LEAVE_TYPES.has(n.type));
        default:
            return notifications;
    }
}

export default function NotificationsPage() {
    const [activeFilter, setActiveFilter] = useState<FilterTab>('all');
    const navigate = useNavigate();
    const queryClient = useQueryClient();

    const { data: unreadData } = useQuery({
        queryKey: ['notifications', 'unread-count'],
        queryFn: () => apiGet<{ count: number }>('/notifications/unread-count'),
        refetchInterval: 30_000,
        refetchIntervalInBackground: false,
    });
    const unreadCount = unreadData?.count ?? 0;

    const { data: notificationsData, isLoading } = useQuery({
        queryKey: ['notifications', 'list'],
        queryFn: () => apiGet<PagedResponse<NotificationResponse>>('/notifications?page=0&size=15'),
    });
    const notifications = notificationsData?.content ?? [];
    const filtered = filterNotifications(notifications, activeFilter);

    const markReadMutation = useMutation({
        mutationFn: (id: number) => apiPatch<NotificationResponse>(`/notifications/${id}/read`),
        onMutate: async (id) => {
            await queryClient.cancelQueries({ queryKey: ['notifications'] });
            queryClient.setQueryData<PagedResponse<NotificationResponse>>(
                ['notifications', 'list'],
                (old) => {
                    if (!old) return old;
                    return { ...old, content: old.content.map((n) => n.id === id ? { ...n, isRead: true } : n) };
                },
            );
            queryClient.setQueryData<{ count: number }>(
                ['notifications', 'unread-count'],
                (old) => (old ? { count: Math.max(0, old.count - 1) } : old),
            );
        },
        onSettled: () => queryClient.invalidateQueries({ queryKey: ['notifications'] }),
    });

    const markAllReadMutation = useMutation({
        mutationFn: () => apiPatch<void>('/notifications/read-all'),
        onMutate: async () => {
            await queryClient.cancelQueries({ queryKey: ['notifications'] });
            queryClient.setQueryData<PagedResponse<NotificationResponse>>(
                ['notifications', 'list'],
                (old) => {
                    if (!old) return old;
                    return { ...old, content: old.content.map((n) => ({ ...n, isRead: true })) };
                },
            );
            queryClient.setQueryData<{ count: number }>(
                ['notifications', 'unread-count'],
                () => ({ count: 0 }),
            );
        },
        onSettled: () => queryClient.invalidateQueries({ queryKey: ['notifications'] }),
    });

    function handleClick(notification: NotificationResponse) {
        if (!notification.isRead) markReadMutation.mutate(notification.id);
        const route = getNotificationRoute(notification.referenceType, notification.referenceId);
        if (route) navigate(route);
    }

    return (
        <div className="mx-auto max-w-2xl px-4 py-6">
            {/* Header */}
            <div className="flex items-center justify-between mb-4">
                <h1 className="text-xl font-bold text-gray-900">Notifications</h1>
                {unreadCount > 0 && (
                    <button
                        onClick={() => markAllReadMutation.mutate()}
                        className="text-sm font-medium text-blue-600 hover:text-blue-800"
                    >
                        Mark all as read
                    </button>
                )}
            </div>

            {/* Filter tabs */}
            <div className="flex gap-2 mb-4">
                {FILTER_TABS.map((tab) => (
                    <button
                        key={tab.key}
                        onClick={() => setActiveFilter(tab.key)}
                        className={cn(
                            'rounded-full px-3 py-1.5 text-xs font-medium transition-colors',
                            activeFilter === tab.key
                                ? 'bg-gray-900 text-white'
                                : 'text-gray-500 hover:bg-gray-100',
                        )}
                    >
                        {tab.label}
                    </button>
                ))}
            </div>

            {/* Notification list */}
            {isLoading ? (
                <p className="text-sm text-gray-500 py-8">Loading...</p>
            ) : filtered.length === 0 ? (
                <p className="text-sm text-gray-500 py-8">No notifications</p>
            ) : (
                <div className="space-y-0">
                    {filtered.map((notification) => {
                        const meta = getNotificationMeta(notification.type);
                        const Icon = meta.icon;
                        return (
                            <button
                                key={notification.id}
                                onClick={() => handleClick(notification)}
                                className={cn(
                                    'flex w-full items-start gap-3 rounded-xl px-3 py-3.5 text-left transition-colors hover:bg-gray-50',
                                    !notification.isRead && 'bg-blue-50/50',
                                )}
                            >
                                <div className={cn('mt-0.5 flex h-9 w-9 shrink-0 items-center justify-center rounded-[10px]', {
                                    'bg-green-100': meta.color.includes('green'),
                                    'bg-blue-100': meta.color.includes('blue'),
                                    'bg-yellow-100': meta.color.includes('yellow') || meta.color.includes('orange'),
                                    'bg-red-100': meta.color.includes('red'),
                                    'bg-indigo-100': meta.color.includes('indigo') || meta.color.includes('teal'),
                                    'bg-gray-100': meta.color.includes('gray'),
                                })}>
                                    <Icon className={cn('h-[18px] w-[18px]', meta.color)} />
                                </div>
                                <div className="min-w-0 flex-1">
                                    <p className={cn('text-sm text-gray-900', !notification.isRead ? 'font-semibold' : 'font-medium')}>
                                        {notification.title}
                                    </p>
                                    <p className="mt-0.5 line-clamp-2 text-xs text-gray-500">
                                        {notification.message}
                                    </p>
                                    <p className="mt-1 text-xs text-gray-400">
                                        {formatDistanceToNow(new Date(notification.createdAt), { addSuffix: true })}
                                    </p>
                                </div>
                                {!notification.isRead && (
                                    <div className="mt-2 h-2 w-2 shrink-0 rounded-full bg-blue-500" />
                                )}
                            </button>
                        );
                    })}
                </div>
            )}
        </div>
    );
}
```

- [ ] **Step 2: Add route to router.tsx**

In `frontend/src/router.tsx`, add the lazy import near the top (after the other lazy imports):

```ts
const NotificationsPage = lazy(() => import('@/pages/Notifications/Index'));
```

Add the route inside the AuthenticatedLayout children, after the `/support` route:

```ts
{ path: '/notifications', element: <NotificationsPage /> },
```

- [ ] **Step 3: Verify types**

```bash
cd frontend && npx tsc --noEmit
```

- [ ] **Step 4: Commit**

```bash
git add frontend/src/pages/Notifications/Index.tsx frontend/src/router.tsx
git commit -m "feat: add full-screen notifications page with filter tabs"
```

---

### Task 10: NotificationDropdown Mobile Redirect

**Files:**
- Modify: `frontend/src/components/notifications/NotificationDropdown.tsx`

- [ ] **Step 1: Add mobile detection and redirect**

In `frontend/src/components/notifications/NotificationDropdown.tsx`:

1. Add imports:

```ts
import { useIsBottomNav } from '@/hooks/use-bottom-nav';
```

2. Inside the `NotificationDropdown` component, add after the existing hooks:

```ts
const isMobile = useIsBottomNav();
```

3. Change the bell button. Wrap the existing `DropdownMenu` so that on mobile, clicking the bell navigates to `/notifications` instead of opening the dropdown. Replace the entire return block:

```tsx
if (isMobile) {
    return (
        <button
            onClick={() => navigate('/notifications')}
            className="relative rounded-lg p-2 text-gray-400 hover:bg-gray-100 hover:text-gray-500"
        >
            <Bell className="h-6 w-6" />
            {unreadCount > 0 && (
                <span className="absolute -right-1 -top-1 flex h-5 min-w-[20px] items-center justify-center rounded-full bg-red-500 px-1 text-xs font-bold text-white">
                    {unreadCount > 99 ? '99+' : unreadCount}
                </span>
            )}
        </button>
    );
}

return (
    <DropdownMenu modal={false} open={open} onOpenChange={setOpen}>
        {/* ... existing dropdown code unchanged ... */}
    </DropdownMenu>
);
```

- [ ] **Step 2: Commit**

```bash
git add frontend/src/components/notifications/NotificationDropdown.tsx
git commit -m "fix: redirect notification bell to /notifications on mobile"
```

---

### Task 11: Final Layout Polish

**Files:**
- Modify: `frontend/src/layouts/AuthenticatedLayout.tsx`

- [ ] **Step 1: Ensure sidebar is fully hidden on mobile**

In `AuthenticatedLayout.tsx`, verify the sidebar `<aside>` has `hidden lg:block` (from Task 8). Also ensure the mobile sidebar overlay div is removed (from Task 8).

- [ ] **Step 2: Verify the `sidebarOpen` state cleanup**

If `sidebarOpen` is no longer referenced anywhere (hamburger removed, overlay removed), remove it:

```ts
// Remove this line if no longer used:
const [sidebarOpen, setSidebarOpen] = useState<boolean>(false);
```

Keep `sidebarMinimized` — it's still used by the desktop sidebar collapse button.

- [ ] **Step 3: Type check and visual verification**

```bash
cd frontend && npx tsc --noEmit
```

Start the dev server and verify in the browser:
- Mobile: bottom nav visible, hamburger gone, More sheet works, FAB works, Alerts navigates to /notifications
- Desktop: sidebar visible as before, no bottom nav, bell opens dropdown

- [ ] **Step 4: Commit**

```bash
git add frontend/src/layouts/AuthenticatedLayout.tsx
git commit -m "chore: clean up unused mobile sidebar state"
```

---

## Summary

| Task | Description | Files |
|------|-------------|-------|
| 1 | Bug fixes (sw.js, SOCKJS_URL, vite.config) | 3 modified |
| 2 | Extract shared nav config | 1 new, 1 modified |
| 3 | Glass styles + breakpoint hook | 2 new |
| 4 | Glass pill (4 tabs) | 1 new |
| 5 | Quick action FAB | 1 new |
| 6 | More sheet (bottom sheet) | 1 new |
| 7 | BottomNav orchestrator | 1 new |
| 8 | Integrate into AuthenticatedLayout | 1 modified |
| 9 | Notifications page + route | 1 new, 1 modified |
| 10 | NotificationDropdown mobile redirect | 1 modified |
| 11 | Final layout polish & cleanup | 1 modified |
