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

// Handle session expiration on Inertia navigation (419 CSRF mismatch)
// Auto-refresh instead of showing a scary confirm dialog
router.on('error', (event) => {
    if (event.detail.response?.status === 419) {
        event.preventDefault();

        // Silently refresh the CSRF cookie then retry the navigation
        fetch('/sanctum/csrf-cookie', { credentials: 'same-origin' })
            .then(() => {
                // Retry: just reload the current page which will re-fetch everything
                window.location.reload();
            })
            .catch(() => {
                window.location.reload();
            });
    }
});

// Session keepalive - ping server every 4 minutes to keep session + CSRF token alive
let keepaliveInterval = null;

const startSessionKeepalive = () => {
    if (keepaliveInterval) {
        clearInterval(keepaliveInterval);
    }

    keepaliveInterval = setInterval(() => {
        if (
            !window.location.pathname.match(
                /^\/(login|register|forgot-password|reset-password)/,
            )
        ) {
            // Use apiAxios so it goes through the CSRF interceptors
            // This keeps the session alive AND refreshes the XSRF-TOKEN cookie
            window.apiAxios?.get('/api/keepalive').catch(() => {
                // Silent fail
            });
        }
    }, 240000); // 4 minutes (under the default 5-min session gc)
};

startSessionKeepalive();

router.on('navigate', () => {
    startSessionKeepalive();
});
