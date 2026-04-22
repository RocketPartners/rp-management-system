import { useQuery } from '@tanstack/react-query';
import { apiGet } from '@/lib/spring-boot-api';

export const UNREAD_COUNT_QUERY_KEY = ['notifications', 'unread-count'] as const;
export const UNREAD_COUNT_POLL_MS = 30_000;

export function useUnreadCount() {
    const { data } = useQuery({
        queryKey: UNREAD_COUNT_QUERY_KEY,
        queryFn: () => apiGet<{ count: number }>('/notifications/unread-count'),
        refetchInterval: UNREAD_COUNT_POLL_MS,
        refetchIntervalInBackground: false,
    });
    return data?.count ?? 0;
}
