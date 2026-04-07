import { useEffect, useRef } from 'react';
import { useAuth } from '@/contexts/auth-context';
import { apiGet, apiPost } from '@/lib/spring-boot-api';

function urlBase64ToUint8Array(base64String: string): Uint8Array {
    const padding = '='.repeat((4 - (base64String.length % 4)) % 4);
    const base64 = (base64String + padding).replace(/-/g, '+').replace(/_/g, '/');
    const rawData = atob(base64);
    const outputArray = new Uint8Array(rawData.length);
    for (let i = 0; i < rawData.length; i++) {
        outputArray[i] = rawData.charCodeAt(i);
    }
    return outputArray;
}

export function usePushNotifications() {
    const { user } = useAuth();
    const lastUserId = useRef<number | null>(null);

    useEffect(() => {
        if (!user?.id) return;
        if (user.id === lastUserId.current) return;
        if (!('serviceWorker' in navigator) || !('PushManager' in window)) return;

        lastUserId.current = user.id;

        const setup = async () => {
            try {
                const registration = await navigator.serviceWorker.register('/sw.js');
                await navigator.serviceWorker.ready;

                const existing = await registration.pushManager.getSubscription();
                if (existing) {
                    // Always re-register with backend for current user (handles user switch)
                    const subJson = existing.toJSON();
                    await apiPost('/notifications/push/subscribe', {
                        endpoint: subJson.endpoint,
                        keys: subJson.keys,
                    });
                    return;
                }

                const permission = await Notification.requestPermission();
                if (permission !== 'granted') return;

                const { publicKey } = await apiGet<{ publicKey: string }>('/notifications/push/vapid-key');

                const subscription = await registration.pushManager.subscribe({
                    userVisibleOnly: true,
                    applicationServerKey: urlBase64ToUint8Array(publicKey),
                });

                const subJson = subscription.toJSON();
                await apiPost('/notifications/push/subscribe', {
                    endpoint: subJson.endpoint,
                    keys: subJson.keys,
                });
            } catch (err) {
                if (err instanceof Error && err.message.includes('PushManager')) return;
                console.warn('Push notification setup failed:', err);
            }
        };

        setup();
    }, [user?.id]);
}
