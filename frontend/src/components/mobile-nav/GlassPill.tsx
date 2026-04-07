import { Link, useLocation } from 'react-router-dom';
import { useQuery } from '@tanstack/react-query';
import { LayoutDashboard, Calendar, ClipboardList, Bell } from 'lucide-react';
import { cn } from '@/lib/utils';
import { apiGet } from '@/lib/spring-boot-api';
import {
    glassClasses, inactiveIconClass, activeIconClass,
    inactiveLabelClass, activeLabelClass, activeTabBg,
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
        <nav className={cn('flex flex-1 items-center justify-around rounded-full px-1 py-1 h-14', glassClasses)}>
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
