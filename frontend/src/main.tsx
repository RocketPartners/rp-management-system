import './css/app.css';
import './css/animations.css';

import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { StrictMode } from 'react';
import { createRoot } from 'react-dom/client';
import { HelmetProvider } from 'react-helmet-async';
import { RouterProvider } from 'react-router-dom';
import { Toaster } from 'sonner';
import { AuthProvider } from '@/contexts/auth-context';
import { ErrorBoundary } from '@/components/ErrorBoundary';
import { TimezoneProvider } from '@/hooks/use-timezone';
import { router } from '@/router';

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
                        <ErrorBoundary>
                            <RouterProvider router={router} />
                            <Toaster position="top-right" richColors closeButton />
                        </ErrorBoundary>
                    </TimezoneProvider>
                </AuthProvider>
            </HelmetProvider>
        </QueryClientProvider>
    </StrictMode>,
);
