import { useEffect, useRef, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import { formatDistanceToNow } from 'date-fns';
import { Bell, CheckCheck } from 'lucide-react';
import { useHaptics } from '@/hooks/use-haptics';
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

function filterNotifications(notifications: NotificationResponse[], filter: FilterTab): NotificationResponse[] {
    switch (filter) {
        case 'unread':
            return notifications.filter((n) => !n.isRead);
        case 'leaves':
            return notifications.filter((n) => n.type.startsWith('LEAVE_'));
        case 'system':
            return notifications.filter((n) => !n.type.startsWith('LEAVE_'));
        default:
            return notifications;
    }
}

function getIconBg(colorClass: string): string {
    if (colorClass.includes('green')) return 'bg-emerald-500/10';
    if (colorClass.includes('blue')) return 'bg-blue-500/10';
    if (colorClass.includes('yellow') || colorClass.includes('orange')) return 'bg-amber-500/10';
    if (colorClass.includes('red')) return 'bg-red-500/10';
    if (colorClass.includes('indigo') || colorClass.includes('teal')) return 'bg-indigo-500/10';
    return 'bg-gray-500/10';
}

export default function NotificationsPage() {
    const [activeFilter, setActiveFilter] = useState<FilterTab>('all');
    const navigate = useNavigate();
    const queryClient = useQueryClient();
    const { tap, success } = useHaptics();

    const { data: unreadData } = useQuery({
        queryKey: ['notifications', 'unread-count'],
        queryFn: () => apiGet<{ count: number }>('/notifications/unread-count'),
        refetchInterval: 10_000,
        refetchIntervalInBackground: false,
    });
    const unreadCount = unreadData?.count ?? 0;

    const { data: notificationsData, isLoading, refetch } = useQuery({
        queryKey: ['notifications', 'list'],
        queryFn: () => apiGet<PagedResponse<NotificationResponse>>('/notifications?page=0&size=15'),
        staleTime: 0,
        refetchOnWindowFocus: true,
    });
    const notifications = notificationsData?.content ?? [];

    // Refetch list when unread count changes (detects new notifications
    // even if WebSocket didn't update the list cache)
    const prevUnread = useRef(unreadCount);
    useEffect(() => {
        if (unreadCount !== prevUnread.current) {
            prevUnread.current = unreadCount;
            refetch();
        }
    }, [unreadCount, refetch]);
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
        tap();
        if (!notification.isRead) markReadMutation.mutate(notification.id);
        const route = getNotificationRoute(notification.referenceType, notification.referenceId);
        if (route) navigate(route);
    }

    return (
        <>
        {/* Header — white bg strip */}
        <div className="border-b border-gray-200 bg-white">
            <div className="mx-auto max-w-2xl flex items-center justify-between px-4 py-4 lg:py-6">
                <div>
                    <h1 className="text-xl font-bold text-gray-900 lg:text-2xl">Notifications</h1>
                    {unreadCount > 0 && (
                        <p className="text-xs text-gray-500 mt-0.5">{unreadCount} unread</p>
                    )}
                </div>
                <button
                    onClick={() => { success(); markAllReadMutation.mutate(); }}
                    disabled={unreadCount === 0}
                    className={cn(
                        'flex items-center gap-1.5 rounded-full px-3.5 py-2 text-xs font-medium transition-colors',
                        unreadCount > 0
                            ? 'bg-blue-50 text-blue-600 active:bg-blue-100'
                            : 'bg-gray-50 text-gray-400',
                    )}
                >
                    <CheckCheck className="h-3.5 w-3.5" />
                    Mark all read
                </button>
            </div>
        </div>

        <div className="mx-auto max-w-2xl px-4 py-4 lg:py-6">
            {/* Filter tabs — pill style with sliding background */}
            <div className="flex gap-1.5 rounded-xl bg-gray-100/80 p-1 mb-4">
                {FILTER_TABS.map((tab) => (
                    <button
                        key={tab.key}
                        onClick={() => { tap(); setActiveFilter(tab.key); }}
                        className={cn(
                            'flex-1 rounded-lg px-3 py-2 text-xs font-medium transition-all',
                            activeFilter === tab.key
                                ? 'bg-white text-gray-900 shadow-sm'
                                : 'text-gray-500 active:bg-white/50',
                        )}
                    >
                        {tab.label}
                    </button>
                ))}
            </div>

            {/* Notification list */}
            {isLoading ? (
                <div className="space-y-3 py-4">
                    {[...Array(3)].map((_, i) => (
                        <div key={i} className="flex gap-3 rounded-2xl bg-white p-4 animate-pulse">
                            <div className="h-10 w-10 rounded-xl bg-gray-100" />
                            <div className="flex-1 space-y-2">
                                <div className="h-4 w-3/4 rounded bg-gray-100" />
                                <div className="h-3 w-1/2 rounded bg-gray-100" />
                            </div>
                        </div>
                    ))}
                </div>
            ) : filtered.length === 0 ? (
                <div className="py-16 text-center">
                    <div className="mx-auto mb-3 flex h-14 w-14 items-center justify-center rounded-2xl bg-gray-100">
                        <Bell className="h-6 w-6 text-gray-400" />
                    </div>
                    <p className="text-sm font-medium text-gray-900">All caught up</p>
                    <p className="mt-1 text-xs text-gray-500">
                        {activeFilter === 'all' ? 'No notifications yet' : `No ${activeFilter} notifications`}
                    </p>
                </div>
            ) : (
                <div className="space-y-2">
                    {filtered.map((notification) => {
                        const meta = getNotificationMeta(notification.type);
                        const Icon = meta.icon;
                        const isUnread = !notification.isRead;
                        return (
                            <button
                                key={notification.id}
                                onClick={() => handleClick(notification)}
                                className={cn(
                                    'flex w-full items-start gap-3 rounded-2xl p-4 text-left transition-all active:scale-[0.98]',
                                    isUnread
                                        ? 'bg-white shadow-[0_1px_3px_rgba(0,0,0,0.06),0_0_0_1px_rgba(37,99,235,0.08)] border border-blue-100/60'
                                        : 'bg-white/60 border border-gray-100',
                                )}
                            >
                                {/* Icon */}
                                <div className={cn(
                                    'mt-0.5 flex h-10 w-10 shrink-0 items-center justify-center rounded-xl',
                                    getIconBg(meta.color),
                                )}>
                                    <Icon className={cn('h-5 w-5', meta.color)} />
                                </div>

                                {/* Content */}
                                <div className="min-w-0 flex-1">
                                    <div className="flex items-start justify-between gap-2">
                                        <p className={cn(
                                            'text-sm text-gray-900 leading-snug',
                                            isUnread ? 'font-semibold' : 'font-medium',
                                        )}>
                                            {notification.title}
                                        </p>
                                        {isUnread && (
                                            <div className="mt-1.5 h-2 w-2 shrink-0 rounded-full bg-blue-500" />
                                        )}
                                    </div>
                                    <p className="mt-1 line-clamp-2 text-xs leading-relaxed text-gray-500">
                                        {notification.message}
                                    </p>
                                    <p className="mt-1.5 text-[11px] text-gray-400">
                                        {formatDistanceToNow(new Date(notification.createdAt), { addSuffix: true })}
                                    </p>
                                </div>
                            </button>
                        );
                    })}
                </div>
            )}
        </div>
        </>
    );
}
