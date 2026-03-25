import { createBrowserRouter, Navigate, Outlet } from 'react-router-dom';
import { ProtectedRoute, GuestRoute } from '@/components/route-guards';
import AuthenticatedLayout from '@/layouts/AuthenticatedLayout';
import { lazy, Suspense } from 'react';

// Phase 1 — Migrated pages
const Login = lazy(() => import('@/pages/Auth/Login'));
const Dashboard = lazy(() => import('@/pages/Employees/Dashboard'));

// Placeholder for unmigrated pages
function ComingSoon() {
    return (
        <div className="flex h-[calc(100vh-4rem)] flex-col items-center justify-center gap-4">
            <h1 className="text-2xl font-bold text-gray-900">Coming Soon</h1>
            <p className="text-gray-600">This page is being migrated from the legacy system.</p>
            <a href="/dashboard" className="text-blue-600 hover:underline">
                Back to Dashboard
            </a>
        </div>
    );
}

function SuspenseLayout() {
    return (
        <Suspense
            fallback={
                <div className="flex h-screen items-center justify-center">
                    <div className="h-8 w-8 animate-spin rounded-full border-4 border-blue-600 border-t-transparent" />
                </div>
            }
        >
            <Outlet />
        </Suspense>
    );
}

export const router = createBrowserRouter([
    {
        element: <SuspenseLayout />,
        children: [
            // Guest routes (no sidebar/nav)
            {
                element: <GuestRoute />,
                children: [
                    { path: '/login', element: <Login /> },
                    { path: '/', element: <Navigate to="/login" replace /> },
                ],
            },

            // Protected routes wrapped in AuthenticatedLayout
            {
                element: <ProtectedRoute />,
                children: [
                    {
                        element: <AuthenticatedLayout />,
                        children: [
                            { path: '/dashboard', element: <Dashboard /> },

                            // Placeholder routes — will be migrated in subsequent phases
                            { path: '/calendar', element: <ComingSoon /> },
                            { path: '/my-leaves', element: <ComingSoon /> },
                            { path: '/my-leaves/apply', element: <ComingSoon /> },
                            { path: '/my-leaves/:id', element: <ComingSoon /> },
                            { path: '/my-assets', element: <ComingSoon /> },
                            { path: '/my-wfh', element: <ComingSoon /> },
                            { path: '/users', element: <ComingSoon /> },
                            { path: '/users/pending-approvals', element: <ComingSoon /> },
                            { path: '/users/:id', element: <ComingSoon /> },
                            { path: '/teams', element: <ComingSoon /> },
                            { path: '/roles', element: <ComingSoon /> },
                            { path: '/roles/:id', element: <ComingSoon /> },
                            { path: '/onboarding/invites', element: <ComingSoon /> },
                            { path: '/onboarding/submissions', element: <ComingSoon /> },
                            { path: '/leaves', element: <ComingSoon /> },
                            { path: '/leaves/pending-approvals', element: <ComingSoon /> },
                            { path: '/leaves/:id', element: <ComingSoon /> },
                            { path: '/leave-types', element: <ComingSoon /> },
                            { path: '/leave-balances', element: <ComingSoon /> },
                            { path: '/holidays', element: <ComingSoon /> },
                            { path: '/inventory', element: <ComingSoon /> },
                            { path: '/individual-assets', element: <ComingSoon /> },
                            { path: '/projects', element: <ComingSoon /> },
                            { path: '/tasks', element: <ComingSoon /> },
                            { path: '/tasks/kanban', element: <ComingSoon /> },
                            { path: '/support', element: <ComingSoon /> },
                            { path: '/settings', element: <ComingSoon /> },
                        ],
                    },
                ],
            },
        ],
    },
]);
