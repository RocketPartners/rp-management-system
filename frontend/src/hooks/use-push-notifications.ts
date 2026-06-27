import { useEffect } from 'react';
import { useAuth } from '@/contexts/auth-context';
import { apiGet, apiPost } from '@/lib/spring-boot-api';

let lastRegisteredUserId: number | null = null;

function urlBase64ToUint8Array(base64String: string): Uint8Array<ArrayBuffer> {
    const padding = '='.repeat((4 - (base64String.length % 4)) % 4);
    const base64 = (base64String + padding).replace(/-/g, '+').replace(/_/g, '/');
    const rawData = atob(base64);
    const outputArray = new Uint8Array(new ArrayBuffer(rawData.length));
    for (let i = 0; i < rawData.length; i++) {
        outputArray[i] = rawData.charCodeAt(i);
    }
    return outputArray;
}

async function registerSubscription(subscription: PushSubscription): Promise<void> {
    const subJson = subscription.toJSON();
    if (!subJson.endpoint || !subJson.keys?.p256dh || !subJson.keys?.auth) {
        console.warn('Push subscription missing endpoint or keys — skipping registration');
        return;
    }
    await apiPost('/notifications/push/subscribe', {
        endpoint: subJson.endpoint,
        keys: subJson.keys,
    });
}

export function usePushNotifications() {
    const { user } = useAuth();

    useEffect(() => {
        if (!user?.id) return;
        if (user.id === lastRegisteredUserId) return;
        if (!('serviceWorker' in navigator) || !('PushManager' in window)) return;

        const targetUserId = user.id;
        lastRegisteredUserId = targetUserId;

        let cancelled = false;

        const setup = async () => {
            try {
                const registration = await navigator.serviceWorker.register('/sw.js');
                await navigator.serviceWorker.ready;
                if (cancelled) return;

                const existing = await registration.pushManager.getSubscription();
                if (cancelled) return;
                if (existing) {
                    await registerSubscription(existing);
                    return;
                }

                const permission = await Notification.requestPermission();
                if (cancelled || permission !== 'granted') return;

                const { publicKey } = await apiGet<{ publicKey: string }>('/notifications/push/vapid-key');
                if (cancelled) return;

                const subscription = await registration.pushManager.subscribe({
                    userVisibleOnly: true,
                    applicationServerKey: urlBase64ToUint8Array(publicKey),
                });
                if (cancelled) return;

                await registerSubscription(subscription);
            } catch (err) {
                if (err instanceof Error && err.message.includes('PushManager')) return;
                console.warn('Push notification setup failed:', err);
            }
        };

        setup();

        return () => {
            cancelled = true;
            // Allow a fresh attempt if this effect was torn down before it
            // finished registering (e.g. fast user switch / Strict Mode remount).
            if (lastRegisteredUserId === targetUserId) {
                lastRegisteredUserId = null;
            }
        };
    }, [user?.id]);
}
