import './css/app.css';
import './css/animations.css';

import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { StrictMode } from 'react';
import { createRoot } from 'react-dom/client';
import { HelmetProvider } from 'react-helmet-async';
import { RouterProvider } from 'react-router-dom';
import { Toaster } from 'sonner';
import { AuthProvider } from '@/contexts/auth-context';
import { TimezoneProvider } from '@/hooks/use-timezone';
import { router } from '@/router';

if ('serviceWorker' in navigator) {
    navigator.serviceWorker.register('/sw.js');
}

const queryClient = new QueryClient({
    defaultOptions: {
        queries: {
            staleTime: 5 * 60 * 1000,
            retry: 1,
            refetchOnWindowFocus: false,
        },
    },
});

createRoot(document.getElementById('root')!).render(
    <StrictMode>
        <QueryClientProvider client={queryClient}>
            <HelmetProvider>
                <AuthProvider>
                    <TimezoneProvider>
                        <RouterProvider router={router} />
                        <Toaster position="top-right" richColors closeButton />
                    </TimezoneProvider>
                </AuthProvider>
            </HelmetProvider>
        </QueryClientProvider>
    </StrictMode>,
);
