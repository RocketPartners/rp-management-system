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

            {isLoading ? (
                <p className="text-sm text-gray-500 py-8">Loading...</p>
            ) : filtered.length === 0 ? (
                <p className="text-sm text-gray-500 py-8">No notifications</p>
            ) : (
                <div>
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
