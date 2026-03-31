import { createBrowserRouter, Navigate, Outlet } from 'react-router-dom';
import { ProtectedRoute, GuestRoute } from '@/components/route-guards';
import AuthenticatedLayout from '@/layouts/AuthenticatedLayout';
import { lazy, Suspense } from 'react';

// Phase 1 — Migrated pages (TSX)
const Login = lazy(() => import('@/pages/Auth/Login'));
const Dashboard = lazy(() => import('@/pages/Dashboard/Index'));

// Phase 2 — Employee Leave pages (TSX)
const MyLeaves = lazy(() => import('@/pages/Employees/Leaves/MyLeaves'));
const ApplyLeave = lazy(() => import('@/pages/Employees/Leaves/Apply'));
const ShowLeave = lazy(() => import('@/pages/Employees/Leaves/Show'));
const EditLeave = lazy(() => import('@/pages/Employees/Leaves/Edit'));

// Phase 3 — Calendar + WFH pages (TSX)
const Calendar = lazy(() => import('@/pages/Calendar/Index'));
const MyWFH = lazy(() => import('@/pages/Employees/WFH/Index'));

// Phase 5 — Team Management pages (TSX)
const TeamList = lazy(() => import('@/pages/Teams/Index'));
const TeamShow = lazy(() => import('@/pages/Teams/Show'));
const TeamCreateEdit = lazy(() => import('@/pages/Teams/CreateEdit'));

// Phase 7 — Announcements (TSX)
const AnnouncementList = lazy(() => import('@/pages/Announcements/Index'));

// Phase 6 — Department & Position Management pages (TSX)
const DepartmentList = lazy(() => import('@/pages/Departments/Index'));
const DepartmentCreateEdit = lazy(() => import('@/pages/Departments/CreateEdit'));
const PositionList = lazy(() => import('@/pages/Positions/Index'));
const PositionCreateEdit = lazy(() => import('@/pages/Positions/CreateEdit'));

// Phase 4 — User Management pages (TSX)
const UserList = lazy(() => import('@/pages/Users/Index'));
const UserCreate = lazy(() => import('@/pages/Users/Create'));
const UserEdit = lazy(() => import('@/pages/Users/Edit'));
const UserShow = lazy(() => import('@/pages/Users/Show'));
const UserPendingApprovals = lazy(() => import('@/pages/Users/PendingApprovals'));
const Profile = lazy(() => import('@/pages/Profile/Index'));

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

                            // Employee Leave pages (migrated)
                            { path: '/my-leaves', element: <MyLeaves /> },
                            { path: '/my-leaves/apply', element: <ApplyLeave /> },
                            { path: '/my-leaves/:id', element: <ShowLeave /> },
                            { path: '/my-leaves/:id/edit', element: <EditLeave /> },

                            // Placeholder routes — will be migrated in subsequent phases
                            { path: '/calendar', element: <Calendar /> },
                            { path: '/announcements', element: <AnnouncementList /> },
                            { path: '/my-assets', element: <ComingSoon /> },
                            { path: '/my-wfh', element: <MyWFH /> },
                            // User Management (migrated)
                            { path: '/users', element: <UserList /> },
                            { path: '/users/create', element: <UserCreate /> },
                            { path: '/users/pending-approvals', element: <UserPendingApprovals /> },
                            { path: '/users/:id', element: <UserShow /> },
                            { path: '/users/:id/edit', element: <UserEdit /> },
                            { path: '/profile', element: <Profile /> },
                            { path: '/teams', element: <TeamList /> },
                            { path: '/teams/create', element: <TeamCreateEdit /> },
                            { path: '/teams/:id', element: <TeamShow /> },
                            { path: '/teams/:id/edit', element: <TeamCreateEdit /> },
                            { path: '/departments', element: <DepartmentList /> },
                            { path: '/departments/create', element: <DepartmentCreateEdit /> },
                            { path: '/departments/:id/edit', element: <DepartmentCreateEdit /> },
                            { path: '/positions', element: <PositionList /> },
                            { path: '/positions/create', element: <PositionCreateEdit /> },
                            { path: '/positions/:id/edit', element: <PositionCreateEdit /> },
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
