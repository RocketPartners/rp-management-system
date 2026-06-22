self.addEventListener('install', (event) => {
    event.waitUntil(self.skipWaiting());
});

self.addEventListener('activate', (event) => {
    event.waitUntil(self.clients.claim());
});

self.addEventListener('push', (event) => {
    if (!event.data) return;

    try {
        const data = event.data.json();
        const options = {
            body: data.body || '',
            icon: data.icon || '/images/icon-192x192.png',
            badge: '/images/icon-192x192.png',
            data: data.data || {},
            vibrate: [200, 100, 200],
        };
        event.waitUntil(self.registration.showNotification(data.title || 'Notification', options));
    } catch {
        const text = event.data.text();
        event.waitUntil(self.registration.showNotification('New Notification', { body: text }));
    }
});

self.addEventListener('notificationclick', (event) => {
    event.notification.close();

    const data = event.notification.data || {};
    let url = '/';

    if (data.referenceType === 'LEAVE_APPLICATION' && data.referenceId) {
        url = `/my-leaves/${data.referenceId}`;
    } else if (data.referenceType === 'TICKET') {
        url = '/support';
    } else if (data.referenceType === 'USER' && data.referenceId) {
        url = `/users/${data.referenceId}`;
    }

    event.waitUntil(
        clients.matchAll({ type: 'window', includeUncontrolled: true }).then((clientList) => {
            for (const client of clientList) {
                if (client.url.includes(self.location.origin) && 'focus' in client) {
                    client.navigate(url);
                    return client.focus();
                }
            }
            return clients.openWindow(url);
        }),
    );
});
