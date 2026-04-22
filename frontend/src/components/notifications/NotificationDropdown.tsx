import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import { formatDistanceToNow } from 'date-fns';
import { Bell, CheckCircle2 } from 'lucide-react';
import {
    DropdownMenu,
    DropdownMenuContent,
    DropdownMenuLabel,
    DropdownMenuSeparator,
    DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import { apiGet, apiPatch } from '@/lib/spring-boot-api';
import { useNotificationSocket } from '@/hooks/use-notification-socket';
import { usePushNotifications } from '@/hooks/use-push-notifications';
import { useIsBottomNav } from '@/hooks/use-bottom-nav';
import { useUnreadCount } from '@/hooks/use-unread-count';
import type { PagedResponse } from '@/types';
import {
    getNotificationMeta,
    getNotificationRoute,
    type NotificationResponse,
} from '@/types/notification';

export function NotificationDropdown() {
    const [open, setOpen] = useState(false);
    const navigate = useNavigate();
    const queryClient = useQueryClient();

    const isMobile = useIsBottomNav();

    // Live WebSocket updates (polling kept as fallback)
    useNotificationSocket();
    // Browser push notifications (prompts for permission on first load)
    usePushNotifications();

    const unreadCount = useUnreadCount();

    const { data: notificationsData, isLoading, isError } = useQuery({
        queryKey: ['notifications', 'list'],
        queryFn: () =>
            apiGet<PagedResponse<NotificationResponse>>('/notifications?page=0&size=15'),
        enabled: open,
        staleTime: 15_000,
    });

    const notifications = notificationsData?.content ?? [];

    const markReadMutation = useMutation({
        mutationFn: ({ id }: { id: number; wasUnread: boolean }) =>
            apiPatch<NotificationResponse>(`/notifications/${id}/read`),
        onMutate: async ({ id, wasUnread }) => {
            await queryClient.cancelQueries({ queryKey: ['notifications'] });
            queryClient.setQueryData<PagedResponse<NotificationResponse>>(
                ['notifications', 'list'],
                (old) => {
                    if (!old) return old;
                    return {
                        ...old,
                        content: old.content.map((n) =>
                            n.id === id ? { ...n, isRead: true } : n,
                        ),
                    };
                },
            );
            if (wasUnread) {
                queryClient.setQueryData<{ count: number }>(
                    ['notifications', 'unread-count'],
                    (old) => (old ? { count: Math.max(0, old.count - 1) } : old),
                );
            }
        },
        onSettled: () => {
            queryClient.invalidateQueries({ queryKey: ['notifications'] });
        },
    });

    const markAllReadMutation = useMutation({
        mutationFn: () => apiPatch<void>('/notifications/read-all'),
        onMutate: async () => {
            await queryClient.cancelQueries({ queryKey: ['notifications'] });
            queryClient.setQueryData<PagedResponse<NotificationResponse>>(
                ['notifications', 'list'],
                (old) => {
                    if (!old) return old;
                    return {
                        ...old,
                        content: old.content.map((n) => ({ ...n, isRead: true })),
                    };
                },
            );
            queryClient.setQueryData<{ count: number }>(
                ['notifications', 'unread-count'],
                () => ({ count: 0 }),
            );
        },
        onSettled: () => {
            queryClient.invalidateQueries({ queryKey: ['notifications'] });
        },
    });

    function handleNotificationClick(notification: NotificationResponse) {
        if (!notification.isRead) {
            markReadMutation.mutate({ id: notification.id, wasUnread: true });
        }
        const route = getNotificationRoute(notification.referenceType, notification.referenceId);
        if (route) {
            setOpen(false);
            navigate(route);
        }
    }

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
            <DropdownMenuTrigger asChild>
                <button className="relative rounded-lg p-2 text-gray-400 hover:bg-gray-100 hover:text-gray-500">
                    <Bell className="h-6 w-6" />
                    {unreadCount > 0 && (
                        <span className="absolute -right-1 -top-1 flex h-5 min-w-[20px] items-center justify-center rounded-full bg-red-500 px-1 text-xs font-bold text-white">
                            {unreadCount > 99 ? '99+' : unreadCount}
                        </span>
                    )}
                </button>
            </DropdownMenuTrigger>
            <DropdownMenuContent align="end" className="w-[calc(100vw-2rem)] sm:w-96">
                <DropdownMenuLabel className="flex items-center justify-between">
                    <span className="text-base font-semibold">Notifications</span>
                    {unreadCount > 0 && (
                        <button
                            onClick={() => markAllReadMutation.mutate()}
                            className="text-xs font-medium text-blue-600 hover:text-blue-800"
                        >
                            Mark all as read
                        </button>
                    )}
                </DropdownMenuLabel>
                <DropdownMenuSeparator />

                {isLoading && open ? (
                    <div className="px-4 py-8 text-center">
                        <p className="text-sm text-gray-500">Loading...</p>
                    </div>
                ) : isError ? (
                    <div className="px-4 py-8 text-center">
                        <p className="text-sm font-medium text-gray-900">Failed to load</p>
                        <p className="mt-1 text-xs text-gray-500">Please try again in a moment</p>
                    </div>
                ) : notifications.length === 0 ? (
                    <div className="px-4 py-8 text-center">
                        <CheckCircle2 className="mx-auto h-12 w-12 text-gray-300" />
                        <p className="mt-2 text-sm font-medium text-gray-900">All caught up!</p>
                        <p className="mt-1 text-xs text-gray-500">No notifications</p>
                    </div>
                ) : (
                    <div className="max-h-96 overflow-y-auto">
                        {notifications.map((notification) => {
                            const meta = getNotificationMeta(notification.type);
                            const Icon = meta.icon;
                            return (
                                <button
                                    key={notification.id}
                                    onClick={() => handleNotificationClick(notification)}
                                    className={`flex w-full items-start gap-3 px-4 py-3 text-left transition-colors hover:bg-gray-50 ${
                                        !notification.isRead ? 'bg-blue-50/50' : ''
                                    }`}
                                >
                                    <div className={`mt-0.5 flex-shrink-0 ${meta.color}`}>
                                        <Icon className="h-5 w-5" />
                                    </div>
                                    <div className="min-w-0 flex-1">
                                        <p className={`text-sm ${!notification.isRead ? 'font-semibold' : 'font-medium'} text-gray-900`}>
                                            {notification.title}
                                        </p>
                                        <p className="mt-0.5 line-clamp-2 text-xs text-gray-500">
                                            {notification.message}
                                        </p>
                                        <p className="mt-1 text-xs text-gray-400">
                                            {formatDistanceToNow(new Date(notification.createdAt), {
                                                addSuffix: true,
                                            })}
                                        </p>
                                    </div>
                                    {!notification.isRead && (
                                        <div className="mt-2 h-2 w-2 flex-shrink-0 rounded-full bg-blue-500" />
                                    )}
                                </button>
                            );
                        })}
                    </div>
                )}
            </DropdownMenuContent>
        </DropdownMenu>
    );
}
