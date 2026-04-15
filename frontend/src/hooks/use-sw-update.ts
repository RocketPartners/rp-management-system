import { useEffect, useState } from 'react';

/**
 * Detects when a new service worker version is waiting to activate
 * and exposes a function to apply the update (reload).
 */
export function useSwUpdate() {
    const [updateAvailable, setUpdateAvailable] = useState(false);
    const [waitingWorker, setWaitingWorker] = useState<ServiceWorker | null>(null);

    useEffect(() => {
        if (!('serviceWorker' in navigator)) return;

        const onUpdate = (registration: ServiceWorkerRegistration) => {
            setWaitingWorker(registration.waiting);
            setUpdateAvailable(true);
        };

        navigator.serviceWorker.ready.then((registration) => {
            // Already waiting (e.g. page was refreshed while a SW was pending)
            if (registration.waiting) {
                onUpdate(registration);
            }

            // Listen for new updates
            registration.addEventListener('updatefound', () => {
                const newWorker = registration.installing;
                if (!newWorker) return;

                newWorker.addEventListener('statechange', () => {
                    if (newWorker.state === 'installed' && navigator.serviceWorker.controller) {
                        onUpdate(registration);
                    }
                });
            });
        });

        // When the new SW takes over, reload to get fresh assets
        let refreshing = false;
        navigator.serviceWorker.addEventListener('controllerchange', () => {
            if (refreshing) return;
            refreshing = true;
            window.location.reload();
        });
    }, []);

    const applyUpdate = () => {
        if (waitingWorker) {
            waitingWorker.postMessage({ type: 'SKIP_WAITING' });
        }
    };

    return { updateAvailable, applyUpdate };
}
