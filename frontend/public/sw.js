const CACHE_VERSION = 'v1';
const STATIC_CACHE = `hris-static-${CACHE_VERSION}`;
const RUNTIME_CACHE = `hris-runtime-${CACHE_VERSION}`;

const PRECACHE_URLS = [
    '/',
    '/offline.html',
    '/images/icon-192x192.png',
    '/images/icon-512x512.png',
];

const STATIC_EXTENSIONS = /\.(js|css|woff2?|ttf|png|jpg|jpeg|svg|ico|webp)$/;

// Install: precache critical assets
self.addEventListener('install', (event) => {
    event.waitUntil(
        caches
            .open(STATIC_CACHE)
            .then((cache) => cache.addAll(PRECACHE_URLS))
            .then(() => self.skipWaiting()),
    );
});

// Activate: clean up old caches
self.addEventListener('activate', (event) => {
    event.waitUntil(
        caches
            .keys()
            .then((keys) =>
                Promise.all(
                    keys
                        .filter((key) => key !== STATIC_CACHE && key !== RUNTIME_CACHE)
                        .map((key) => caches.delete(key)),
                ),
            )
            .then(() => self.clients.claim()),
    );
});

// Fetch: cache-first for static assets, network-first for navigation/API
self.addEventListener('fetch', (event) => {
    const { request } = event;
    const url = new URL(request.url);

    // Skip non-GET requests
    if (request.method !== 'GET') return;

    // Skip cross-origin requests
    if (url.origin !== self.location.origin) return;

    // API calls: network-first with cache fallback
    if (url.pathname.startsWith('/api/')) {
        event.respondWith(
            fetch(request)
                .then((response) => {
                    if (response.ok) {
                        const clone = response.clone();
                        caches.open(RUNTIME_CACHE).then((cache) => cache.put(request, clone));
                    }
                    return response;
                })
                .catch(() => caches.match(request)),
        );
        return;
    }

    // Static assets: cache-first
    if (STATIC_EXTENSIONS.test(url.pathname)) {
        event.respondWith(
            caches.match(request).then(
                (cached) =>
                    cached ||
                    fetch(request).then((response) => {
                        if (response.ok) {
                            const clone = response.clone();
                            caches.open(STATIC_CACHE).then((cache) => cache.put(request, clone));
                        }
                        return response;
                    }),
            ),
        );
        return;
    }

    // Navigation requests: network-first, fall back to cache, then offline page
    if (request.mode === 'navigate') {
        event.respondWith(
            fetch(request)
                .then((response) => {
                    if (response.ok) {
                        const clone = response.clone();
                        caches.open(RUNTIME_CACHE).then((cache) => cache.put(request, clone));
                    }
                    return response;
                })
                .catch(() =>
                    caches.match(request).then((cached) => cached || caches.match('/offline.html')),
                ),
        );
        return;
    }
});

// Push notifications
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

// Notification click
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

// Listen for skip-waiting message from the app
self.addEventListener('message', (event) => {
    if (event.data && event.data.type === 'SKIP_WAITING') {
        self.skipWaiting();
    }
});
