import '../css/app.css';
import './bootstrap';

import { createInertiaApp } from '@inertiajs/react';
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
