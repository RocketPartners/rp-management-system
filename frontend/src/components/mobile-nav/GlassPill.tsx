import { useRef, useEffect, useState, useCallback } from 'react';
import { Link, useLocation } from 'react-router-dom';
import { useQuery } from '@tanstack/react-query';
import { LayoutDashboard, Calendar, ClipboardList, Bell } from 'lucide-react';
import { cn } from '@/lib/utils';
import { apiGet } from '@/lib/spring-boot-api';
import {
    glassClasses, inactiveIconClass, activeIconClass,
    inactiveLabelClass, activeLabelClass,
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
    const navRef = useRef<HTMLElement>(null);
    const tabRefs = useRef<(HTMLAnchorElement | null)[]>([]);
    const [indicator, setIndicator] = useState({ left: 0, width: 0 });
    const [hasAnimated, setHasAnimated] = useState(false);

    const { data: unreadData } = useQuery({
        queryKey: ['notifications', 'unread-count'],
        queryFn: () => apiGet<{ count: number }>('/notifications/unread-count'),
        refetchInterval: 30_000,
        refetchIntervalInBackground: false,
    });
    const unreadCount = unreadData?.count ?? 0;

    const activeIndex = tabs.findIndex((tab) => isTabActive(tab.href, pathname));

    const updateIndicator = useCallback(() => {
        const activeEl = tabRefs.current[activeIndex];
        const navEl = navRef.current;
        if (activeEl && navEl) {
            const navRect = navEl.getBoundingClientRect();
            const tabRect = activeEl.getBoundingClientRect();
            setIndicator({
                left: tabRect.left - navRect.left,
                width: tabRect.width,
            });
            if (!hasAnimated) setHasAnimated(true);
        }
    }, [activeIndex, hasAnimated]);

    useEffect(() => {
        updateIndicator();
    }, [updateIndicator]);

    return (
        <nav
            ref={navRef}
            className={cn('relative flex flex-1 items-center justify-around rounded-full px-1 py-1 h-16', glassClasses)}
        >
            {/* Sliding active indicator */}
            {activeIndex >= 0 && (
                <div
                    className={cn(
                        'absolute top-1 bottom-1 rounded-full bg-black/[0.08]',
                        hasAnimated && 'transition-all duration-300 ease-[cubic-bezier(0.4,0,0.2,1)]',
                    )}
                    style={{ left: indicator.left, width: indicator.width }}
                />
            )}

            {tabs.map((tab, index) => {
                const active = isTabActive(tab.href, pathname);
                const Icon = tab.icon;
                return (
                    <Link
                        key={tab.name}
                        ref={(el) => { tabRefs.current[index] = el; }}
                        to={tab.href}
                        className={cn(
                            'relative z-[1] flex flex-col items-center gap-0.5 rounded-full px-5 py-2',
                        )}
                    >
                        <Icon
                            className={cn(
                                'h-6 w-6 transition-colors duration-200',
                                active ? activeIconClass : inactiveIconClass,
                            )}
                            fill={tab.name === 'Calendar' ? 'none' : active ? 'currentColor' : 'none'}
                            strokeWidth={active ? (tab.name === 'Calendar' ? 2.5 : 0) : 1.8}
                        />
                        <span className={cn(
                            'transition-colors duration-200',
                            active ? activeLabelClass : inactiveLabelClass,
                        )}>
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
