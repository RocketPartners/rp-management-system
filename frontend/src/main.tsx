import './css/app.css';
import './css/animations.css';

import { StrictMode } from 'react';
import { createRoot } from 'react-dom/client';
import { RouterProvider } from 'react-router-dom';
import { HelmetProvider } from 'react-helmet-async';
import { AuthProvider } from '@/contexts/auth-context';
import { TimezoneProvider } from '@/hooks/use-timezone';
import { router } from '@/router';

createRoot(document.getElementById('root')!).render(
    <StrictMode>
        <HelmetProvider>
            <AuthProvider>
                <TimezoneProvider>
                    <RouterProvider router={router} />
                </TimezoneProvider>
            </AuthProvider>
        </HelmetProvider>
    </StrictMode>,
);
