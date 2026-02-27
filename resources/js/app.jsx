import '../css/app.css';
import './bootstrap';

import { createInertiaApp, router } from '@inertiajs/react';
import { createRoot } from 'react-dom/client';
import { TimezoneProvider } from './hooks/use-timezone.jsx';

const appName = import.meta.env.VITE_APP_NAME || 'Your Company';

createInertiaApp({
    title: (title) => (title ? `${title}` : appName),
    resolve: (name) => {
        const pages = import.meta.glob('./pages/**/*.jsx', { eager: true });
        const page = pages[`./pages/${name}.jsx`];

        if (!page) {
            console.error('Available pages:', Object.keys(pages));
            throw new Error(`Page not found: ./pages/${name}.jsx`);
        }

        return page;
    },
    setup({ el, App, props }) {
        const root = createRoot(el);
        root.render(
            <TimezoneProvider>
                <App {...props} />
            </TimezoneProvider>,
        );
    },
    progress: {
        color: '#4B5563',
    },
});

// Handle session expiration gracefully
router.on('error', (event) => {
    // If session expired (419 CSRF token mismatch), reload the page to get a fresh token
    if (event.detail.response?.status === 419) {
        event.preventDefault();

        // Show a more user-friendly message
        if (confirm('Your session has expired. The page will reload to refresh your session. Your form data will be preserved if possible.')) {
            window.location.reload();
        }
    }
});

// Session keepalive - ping server every 5 minutes to keep session active
let keepaliveInterval = null;

const startSessionKeepalive = () => {
    // Clear any existing interval
    if (keepaliveInterval) {
        clearInterval(keepaliveInterval);
    }

    // Ping every 5 minutes (300000ms)
    keepaliveInterval = setInterval(() => {
        // Only ping if user is logged in (check if we're not on login/register pages)
        if (!window.location.pathname.match(/^\/(login|register|forgot-password|reset-password)/)) {
            fetch('/api/keepalive', {
                method: 'GET',
                headers: {
                    'X-Requested-With': 'XMLHttpRequest',
                    'Accept': 'application/json',
                },
                credentials: 'same-origin'
            }).catch(() => {
                // Silently fail if keepalive fails
            });
        }
    }, 300000); // 5 minutes
};

// Start keepalive on page load
startSessionKeepalive();

// Restart keepalive after navigation
router.on('navigate', () => {
    startSessionKeepalive();
});
