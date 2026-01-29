// resources/js/Layouts/AuthenticatedLayout.jsx
import { Badge } from '@/Components/ui/badge';
import {
    DropdownMenu,
    DropdownMenuContent,
    DropdownMenuItem,
    DropdownMenuLabel,
    DropdownMenuSeparator,
    DropdownMenuTrigger,
} from '@/Components/ui/dropdown-menu';
import { useTimezone } from '@/hooks/use-timezone.jsx';
import { usePermission } from '@/hooks/usePermission';
import { cn } from '@/lib/utils';
import { Link, usePage } from '@inertiajs/react';
import {
    Bell,
    Calendar,
    CheckSquare,
    ChevronDown,
    ChevronRight,
    ClipboardList,
    FileCheck,
    FolderKanban,
    Globe,
    Laptop,
    Layers,
    LayoutDashboard,
    LifeBuoy,
    LogOut,
    Mail,
    Menu,
    Package,
    Search,
    Settings,
    UserCheck,
    UserPlus,
    Users,
    Wallet,
    X,
} from 'lucide-react';
import { useState } from 'react';

export default function AuthenticatedLayout({ header, children }) {
    const [sidebarOpen, setSidebarOpen] = useState(false);
    const [sidebarMinimized, setSidebarMinimized] = useState(false);
    const [expandedSections, setExpandedSections] = useState({});
    const { auth } = usePage().props;
    const currentUrl = usePage().url;
    const { can } = usePermission();
    const { timezone, setTimezone, timezones } = useTimezone();
    const currentTimezone =
        timezones.find((tz) => tz.id === timezone) || timezones[2];

    const toggleSection = (sectionName) => {
        setExpandedSections((prev) => ({
            ...prev,
            [sectionName]: !prev[sectionName],
        }));
    };

    const sectionHasActiveItem = (items) => {
        return items.some((item) => isActive(item.href));
    };

    const buildNavigation = () => {
        const nav = [];

        // ============================================
        // EVERYONE - Personal Dashboard
        // ============================================
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
                { name: 'My Assets', href: '/employees/assets', icon: Laptop },
            ],
        });

        // ============================================
        // USER MANAGEMENT
        // ============================================
        if (can('users.view')) {
            const userItems = [];

            if (can('users.view')) {
                userItems.push({
                    name: 'All Users',
                    href: '/users',
                    icon: Users,
                });
            }

            if (can('users.approve')) {
                userItems.push({
                    name: 'Pending Approvals',
                    href: '/users/pending-approvals',
                    icon: UserCheck,
                    badge: 'new',
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
        } else if (can('users.approve')) {
            nav.push({
                type: 'items',
                items: [
                    {
                        name: 'Pending Approvals',
                        href: '/users/pending-approvals',
                        icon: UserCheck,
                        badge: 'new',
                    },
                ],
            });
        }

        // ============================================
        // ONBOARDING MANAGEMENT
        // ============================================
        if (can('onboarding.view') || can('onboarding.manage')) {
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

        // ============================================
        // LEAVE MANAGEMENT
        // ============================================
        if (
            can('leaves.approve') ||
            can('leaves.view-all') ||
            can('leaves.manage')
        ) {
            const leaveItems = [];

            if (can('leaves.approve') && !can('leaves.manage')) {
                leaveItems.push({
                    name: 'Pending Approvals',
                    href: '/leaves/pending-approvals',
                    icon: CheckSquare,
                    badge: 'pending',
                });
            }

            if (can('leaves.view-all') || can('leaves.manage')) {
                leaveItems.push({
                    name: 'All Requests',
                    href: '/leaves',
                    icon: ClipboardList,
                });
                leaveItems.push({
                    name: 'Pending HR Approval',
                    href: '/leaves?status=pending_hr',
                    icon: CheckSquare,
                    badge: 'pending',
                });
            }

            if (can('leaves.manage')) {
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

        // ============================================
        // INVENTORY MANAGEMENT
        // ============================================
        if (can('assets.view') || can('assets.create') || can('assets.edit')) {
            nav.push({
                type: 'accordion',
                name: 'Inventory',
                icon: Package,
                items: [
                    {
                        name: 'Inventory Items',
                        href: '/inventory',
                        icon: Package,
                    },
                    {
                        name: 'Individual Assets',
                        href: '/individual-assets',
                        icon: Laptop,
                    },
                ],
            });
        }

        // ============================================
        // PROJECT MANAGEMENT
        // ============================================
        if (can('projects.view') || can('tasks.view')) {
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

        // ============================================
        // SUPPORT & SETTINGS
        // ============================================
        nav.push({
            type: 'items',
            items: [
                { name: 'Support', href: '/support', icon: LifeBuoy },
                { name: 'Settings', href: '/settings', icon: Settings },
            ],
        });

        return nav;
    };

    const navigation = buildNavigation();

    const isActive = (href) => {
        const cleanHref = href.split('?')[0];
        const cleanUrl = currentUrl.split('?')[0];

        if (cleanUrl === cleanHref) return true;

        if (cleanHref === '/calendar' && cleanUrl.startsWith('/calendar'))
            return true;
        if (cleanHref === '/users' && cleanUrl.startsWith('/users/'))
            return true;
        if (cleanHref === '/leaves' && cleanUrl.startsWith('/leaves/'))
            return true;
        if (cleanHref === '/inventory' && cleanUrl.startsWith('/inventory/'))
            return true;
        if (
            cleanHref === '/individual-assets' &&
            cleanUrl.startsWith('/individual-assets/')
        )
            return true;
        if (cleanHref === '/projects' && cleanUrl.startsWith('/projects/'))
            return true;
        if (cleanHref === '/tasks' && cleanUrl.startsWith('/tasks/'))
            return true;
        if (
            cleanHref === '/onboarding/invites' &&
            cleanUrl.startsWith('/onboarding/invites')
        )
            return true;
        if (
            cleanHref === '/onboarding/submissions' &&
            cleanUrl.startsWith('/onboarding/submissions')
        )
            return true;

        return false;
    };

    useState(() => {
        const initialExpanded = {};
        navigation.forEach((section) => {
            if (section.type === 'accordion') {
                initialExpanded[section.name] = sectionHasActiveItem(
                    section.items,
                );
            }
        });
        setExpandedSections(initialExpanded);
    }, []);

    return (
        <div className="min-h-screen bg-gray-50">
            <nav className="fixed top-0 z-30 w-full border-b border-gray-200 bg-white">
                <div className="px-4 sm:px-6 lg:px-8">
                    <div className="flex h-16 justify-between">
                        <div className="flex items-center">
                            <button
                                onClick={() => setSidebarOpen(!sidebarOpen)}
                                className="inline-flex items-center justify-center rounded-md p-2 text-gray-400 hover:bg-gray-100 hover:text-gray-500 lg:hidden"
                            >
                                {sidebarOpen ? (
                                    <X className="h-6 w-6" />
                                ) : (
                                    <Menu className="h-6 w-6" />
                                )}
                            </button>
                            <Link
                                href="/dashboard"
                                className="group ml-4 flex items-center lg:ml-0"
                            >
                                <div className="rounded-lg bg-gray-900 px-4 py-2 shadow-sm transition-shadow group-hover:shadow-md">
                                    <img
                                        src="/images/logo.png"
                                        alt="Logo"
                                        className="h-8 w-auto"
                                    />
                                </div>
                            </Link>
                            <div className="hidden md:ml-8 md:flex md:items-center">
                                <div className="relative">
                                    <Search className="absolute left-3 top-1/2 h-5 w-5 -translate-y-1/2 transform text-gray-400" />
                                    <input
                                        type="text"
                                        placeholder="Search..."
                                        className="w-64 rounded-lg border border-gray-300 py-2 pl-10 pr-4 focus:outline-none focus:ring-2 focus:ring-blue-500"
                                    />
                                </div>
                            </div>
                        </div>

                        <div className="flex items-center space-x-4">
                            <button className="relative rounded-lg p-2 text-gray-400 hover:bg-gray-100 hover:text-gray-500">
                                <Bell className="h-6 w-6" />
                                <span className="absolute right-1 top-1 block h-2 w-2 rounded-full bg-red-500"></span>
                            </button>

                            <DropdownMenu>
                                <DropdownMenuTrigger asChild>
                                    <button
                                        className="rounded-lg p-2 text-gray-400 hover:bg-gray-100 hover:text-gray-500"
                                        title={`${currentTimezone.name} (${currentTimezone.offset})`}
                                    >
                                        <img
                                            src={currentTimezone.flag}
                                            alt={currentTimezone.name}
                                            className="h-5 w-5 rounded-sm object-cover"
                                        />
                                    </button>
                                </DropdownMenuTrigger>
                                <DropdownMenuContent
                                    align="end"
                                    className="w-48"
                                >
                                    <DropdownMenuLabel className="flex items-center gap-2">
                                        <Globe className="h-4 w-4" />
                                        Select Timezone
                                    </DropdownMenuLabel>
                                    <DropdownMenuSeparator />
                                    {timezones.map((tz) => (
                                        <DropdownMenuItem
                                            key={tz.id}
                                            onClick={() => setTimezone(tz.id)}
                                            className={cn(
                                                'flex cursor-pointer items-center justify-between',
                                                timezone === tz.id &&
                                                    'bg-accent',
                                            )}
                                        >
                                            <span className="flex items-center gap-2">
                                                <img
                                                    src={tz.flag}
                                                    alt={tz.name}
                                                    className="h-4 w-4 rounded-sm object-cover"
                                                />
                                                <span>{tz.name}</span>
                                            </span>
                                            <span className="text-xs text-muted-foreground">
                                                {tz.offset}
                                            </span>
                                        </DropdownMenuItem>
                                    ))}
                                </DropdownMenuContent>
                            </DropdownMenu>

                            <DropdownMenu>
                                <DropdownMenuTrigger className="flex items-center gap-3 rounded-lg px-3 py-2 hover:bg-gray-100">
                                    <div className="flex h-8 w-8 items-center justify-center rounded-full bg-blue-600">
                                        <span className="text-sm font-medium text-white">
                                            {auth.user.name
                                                .charAt(0)
                                                .toUpperCase()}
                                        </span>
                                    </div>
                                    <div className="hidden text-left md:block">
                                        <div className="text-sm font-medium text-gray-900">
                                            {auth.user.name}
                                        </div>
                                        <div className="text-xs text-gray-500">
                                            {auth.user.email}
                                        </div>
                                    </div>
                                    <ChevronDown className="h-4 w-4 text-gray-400" />
                                </DropdownMenuTrigger>
                                <DropdownMenuContent
                                    align="end"
                                    className="w-56"
                                >
                                    <DropdownMenuLabel>
                                        My Account
                                    </DropdownMenuLabel>
                                    <DropdownMenuSeparator />
                                    <DropdownMenuItem asChild>
                                        <Link
                                            href="/support"
                                            className="cursor-pointer"
                                        >
                                            <LifeBuoy className="mr-2 h-4 w-4" />
                                            Support
                                        </Link>
                                    </DropdownMenuItem>
                                    <DropdownMenuItem asChild>
                                        <Link
                                            href={route('settings.index')}
                                            className="cursor-pointer"
                                        >
                                            <Settings className="mr-2 h-4 w-4" />
                                            Settings
                                        </Link>
                                    </DropdownMenuItem>
                                    <DropdownMenuSeparator />
                                    <DropdownMenuItem asChild>
                                        <Link
                                            href={route('logout')}
                                            method="post"
                                            as="button"
                                            className="w-full cursor-pointer text-red-600"
                                        >
                                            <LogOut className="mr-2 h-4 w-4" />
                                            Log Out
                                        </Link>
                                    </DropdownMenuItem>
                                </DropdownMenuContent>
                            </DropdownMenu>
                        </div>
                    </div>
                </div>
            </nav>

            {sidebarOpen && (
                <div
                    className="fixed inset-0 z-20 bg-gray-900 bg-opacity-50 lg:hidden"
                    onClick={() => setSidebarOpen(false)}
                />
            )}

            <aside
                className={`fixed left-0 z-20 transform border-r border-gray-200 bg-white transition-all duration-300 ${sidebarMinimized ? 'w-20' : 'w-64'} lg:translate-x-0 ${sidebarOpen ? 'translate-x-0' : '-translate-x-full lg:translate-x-0'}`}
                style={{ top: '64px', height: 'calc(100vh - 64px)' }}
            >
                <div className="flex h-full flex-col">
                    <div className="hidden items-center justify-end border-b px-4 py-2 lg:flex">
                        <button
                            onClick={() =>
                                setSidebarMinimized(!sidebarMinimized)
                            }
                            className="rounded-lg p-2 hover:bg-gray-100"
                        >
                            {sidebarMinimized ? (
                                <Menu className="h-5 w-5" />
                            ) : (
                                <X className="h-5 w-5" />
                            )}
                        </button>
                    </div>

                    <nav className="flex-1 overflow-y-auto px-3 py-4">
                        {navigation.map((section, idx) => (
                            <div key={idx} className="mb-2">
                                {section.type === 'items' ? (
                                    <div className="space-y-1">
                                        {section.items.map((item) => {
                                            const Icon = item.icon;
                                            const active = isActive(item.href);
                                            return (
                                                <Link
                                                    key={item.name}
                                                    href={item.href}
                                                    className={`group relative flex items-center rounded-lg px-3 py-2.5 text-sm font-medium transition-colors ${active ? 'bg-blue-50 text-blue-700' : 'text-gray-700 hover:bg-gray-50'} ${sidebarMinimized ? 'justify-center' : ''}`}
                                                >
                                                    <Icon
                                                        className={`h-5 w-5 ${active ? 'text-blue-700' : 'text-gray-400'}`}
                                                    />
                                                    {!sidebarMinimized && (
                                                        <span className="ml-3 flex-1">
                                                            {item.name}
                                                        </span>
                                                    )}
                                                    {item.badge &&
                                                        !sidebarMinimized && (
                                                            <Badge
                                                                className={`ml-2 text-xs ${
                                                                    item.badge ===
                                                                    'new'
                                                                        ? 'border-green-200 bg-green-100 text-green-700'
                                                                        : item.badge ===
                                                                            'pending'
                                                                          ? 'border-yellow-200 bg-yellow-100 text-yellow-700'
                                                                          : 'bg-blue-100 text-blue-700'
                                                                } border`}
                                                            >
                                                                {item.badge ===
                                                                'new'
                                                                    ? '!'
                                                                    : item.badge ===
                                                                        'pending'
                                                                      ? '•'
                                                                      : item.badge}
                                                            </Badge>
                                                        )}
                                                    {active && (
                                                        <div className="absolute bottom-0 left-0 top-0 w-1 rounded-r bg-blue-700"></div>
                                                    )}
                                                    {sidebarMinimized && (
                                                        <div className="pointer-events-none absolute left-full z-50 ml-2 whitespace-nowrap rounded bg-gray-900 px-2 py-1 text-sm text-white opacity-0 group-hover:opacity-100">
                                                            {item.name}
                                                        </div>
                                                    )}
                                                </Link>
                                            );
                                        })}
                                    </div>
                                ) : (
                                    <div>
                                        <button
                                            onClick={() =>
                                                toggleSection(section.name)
                                            }
                                            className={`flex w-full items-center justify-between rounded-lg px-3 py-2.5 text-sm font-medium transition-colors ${sectionHasActiveItem(section.items) ? 'bg-blue-50 text-blue-700' : 'text-gray-700 hover:bg-gray-50'} ${sidebarMinimized ? 'justify-center' : ''}`}
                                        >
                                            <div className="flex flex-1 items-center">
                                                <section.icon
                                                    className={`h-5 w-5 ${sectionHasActiveItem(section.items) ? 'text-blue-700' : 'text-gray-400'}`}
                                                />
                                                {!sidebarMinimized && (
                                                    <span className="ml-3">
                                                        {section.name}
                                                    </span>
                                                )}
                                            </div>
                                            {!sidebarMinimized && (
                                                <ChevronRight
                                                    className={`h-4 w-4 transition-transform ${expandedSections[section.name] ? 'rotate-90' : ''}`}
                                                />
                                            )}
                                        </button>

                                        {!sidebarMinimized &&
                                            expandedSections[section.name] && (
                                                <div className="ml-4 mt-1 space-y-1 border-l-2 border-gray-200 pl-2">
                                                    {section.items.map(
                                                        (item) => {
                                                            const Icon =
                                                                item.icon;
                                                            const active =
                                                                isActive(
                                                                    item.href,
                                                                );
                                                            return (
                                                                <Link
                                                                    key={
                                                                        item.name
                                                                    }
                                                                    href={
                                                                        item.href
                                                                    }
                                                                    className={`flex items-center rounded-lg px-3 py-2 text-sm transition-colors ${active ? 'bg-blue-100 font-medium text-blue-700' : 'text-gray-600 hover:bg-gray-50 hover:text-gray-900'}`}
                                                                >
                                                                    <Icon
                                                                        className={`mr-2 h-4 w-4 ${active ? 'text-blue-700' : 'text-gray-400'}`}
                                                                    />
                                                                    <span className="flex-1">
                                                                        {
                                                                            item.name
                                                                        }
                                                                    </span>
                                                                    {item.badge && (
                                                                        <Badge
                                                                            className={`ml-2 text-xs ${
                                                                                item.badge ===
                                                                                'new'
                                                                                    ? 'border-green-200 bg-green-100 text-green-700'
                                                                                    : item.badge ===
                                                                                        'pending'
                                                                                      ? 'border-yellow-200 bg-yellow-100 text-yellow-700'
                                                                                      : 'bg-blue-100 text-blue-700'
                                                                            } border`}
                                                                        >
                                                                            {item.badge ===
                                                                            'new'
                                                                                ? '!'
                                                                                : item.badge ===
                                                                                    'pending'
                                                                                  ? '•'
                                                                                  : item.badge}
                                                                        </Badge>
                                                                    )}
                                                                </Link>
                                                            );
                                                        },
                                                    )}
                                                </div>
                                            )}
                                    </div>
                                )}
                            </div>
                        ))}
                    </nav>

                    {!sidebarMinimized && (
                        <div className="border-t border-gray-200 bg-gray-50 p-4">
                            <div className="mb-3 flex items-center gap-3">
                                <div className="flex h-10 w-10 flex-shrink-0 items-center justify-center rounded-full bg-blue-600">
                                    <span className="text-sm font-medium text-white">
                                        {auth.user.name.charAt(0).toUpperCase()}
                                    </span>
                                </div>
                                <div className="min-w-0 flex-1">
                                    <p className="truncate text-sm font-medium text-gray-900">
                                        {auth.user.name}
                                    </p>
                                    <p className="truncate text-xs text-gray-500">
                                        {auth.user.position || auth.user.email}
                                    </p>
                                </div>
                            </div>
                            {(can('users.approve') ||
                                can('leaves.approve')) && (
                                <div className="flex flex-wrap gap-1">
                                    {can('users.approve') && (
                                        <Badge className="border border-green-200 bg-green-100 text-xs text-green-700">
                                            <UserCheck className="mr-1 h-3 w-3" />
                                            Approver
                                        </Badge>
                                    )}
                                    {can('leaves.approve') && (
                                        <Badge className="border border-blue-200 bg-blue-100 text-xs text-blue-700">
                                            <Calendar className="mr-1 h-3 w-3" />
                                            Manager
                                        </Badge>
                                    )}
                                </div>
                            )}
                        </div>
                    )}
                </div>
            </aside>

            <main
                className={`flex-1 transition-all duration-300 ${sidebarMinimized ? 'lg:ml-20' : 'lg:ml-64'} pt-16`}
            >
                {header && (
                    <header className="border-b border-gray-200 bg-white">
                        <div className="px-4 py-6 sm:px-6 lg:px-8">
                            {header}
                        </div>
                    </header>
                )}
                <div className="px-4 py-8 sm:px-6 lg:px-8">{children}</div>
            </main>
        </div>
    );
}
