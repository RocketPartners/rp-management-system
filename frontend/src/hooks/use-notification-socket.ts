import { useEffect, useRef } from 'react';
import { Client } from '@stomp/stompjs';
import { useQueryClient } from '@tanstack/react-query';
import { useAuth } from '@/contexts/auth-context';
import { getAccessToken } from '@/lib/spring-boot-api';
import type { PagedResponse } from '@/types';
import type { NotificationResponse } from '@/types/notification';

const WS_URL = (import.meta.env.VITE_SPRING_BOOT_API_URL || 'http://localhost:8080/api/v1')
    .replace(/^http/, 'ws') + '/ws';

const SOCKJS_URL = (import.meta.env.VITE_SPRING_BOOT_API_URL || 'http://localhost:8080/api/v1') + '/ws';

export function useNotificationSocket() {
    const { user } = useAuth();
    const queryClient = useQueryClient();
    const clientRef = useRef<Client | null>(null);

    useEffect(() => {
        if (!user?.id) return;

        const client = new Client({
            // Use SockJS transport via the HTTP URL
            webSocketFactory: () => {
                // SockJS connects over HTTP and upgrades
                return new WebSocket(WS_URL + '/websocket');
            },
            connectHeaders: {
                Authorization: `Bearer ${getAccessToken()}`,
            },
            reconnectDelay: 5000,
            onConnect: () => {
                client.subscribe(`/user/${user.id}/notifications`, (message) => {
                    try {
                        const notification: NotificationResponse = JSON.parse(message.body);

                        // Prepend to notification list cache
                        queryClient.setQueryData<PagedResponse<NotificationResponse>>(
                            ['notifications', 'list'],
                            (old) => {
                                if (!old) return old;
                                return {
                                    ...old,
                                    content: [notification, ...old.content],
                                    totalElements: old.totalElements + 1,
                                };
                            },
                        );

                        // Increment unread count
                        queryClient.setQueryData<{ count: number }>(
                            ['notifications', 'unread-count'],
                            (old) => ({ count: (old?.count ?? 0) + 1 }),
                        );
                    } catch {
                        // Ignore malformed messages
                    }
                });
            },
            onStompError: (frame) => {
                console.warn('STOMP error:', frame.headers?.message);
            },
        });

        client.activate();
        clientRef.current = client;

        return () => {
            client.deactivate();
            clientRef.current = null;
        };
    }, [user?.id, queryClient]);
}
