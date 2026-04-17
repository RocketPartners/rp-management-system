import { createBrowserRouter, Link, Navigate, Outlet } from 'react-router-dom';
import { ProtectedRoute, GuestRoute } from '@/components/route-guards';
import { RouteErrorPage, NotFoundPage } from '@/components/error-boundary';
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

// Phase 8 — Asset & Inventory Management (TSX)
const AssetList = lazy(() => import('@/pages/Assets/Index'));

// Phase 9 — Support / Tickets (TSX)
const SupportTickets = lazy(() => import('@/pages/Support/Index'));

// Phase 10 — Onboarding (TSX)
const OnboardingInvites = lazy(() => import('@/pages/Onboarding/Invites/Index'));
const OnboardingSubmissions = lazy(() => import('@/pages/Onboarding/Submissions/Index'));
const OnboardingSubmissionShow = lazy(() => import('@/pages/Onboarding/Submissions/Show'));
const OnboardingPortal = lazy(() => import('@/pages/Onboarding/Portal/Index'));
const OnboardingSuccess = lazy(() => import('@/pages/Onboarding/Portal/Success'));

// Phase 11 — Role Management (TSX)
const RoleList = lazy(() => import('@/pages/Roles/Index'));

// Phase 12a — My Assets (TSX)
const MyAssets = lazy(() => import('@/pages/Employees/Assets/MyAssets'));

// Phase 12 — Leave Management (Admin) (TSX)
const LeaveRequestList = lazy(() => import('@/pages/Leaves/Index'));
const LeaveRequestShow = lazy(() => import('@/pages/Leaves/Show'));
const LeavePendingApprovals = lazy(() => import('@/pages/Leaves/PendingApprovals'));
const LeaveTypeList = lazy(() => import('@/pages/LeaveTypes/Index'));
const LeaveBalanceList = lazy(() => import('@/pages/LeaveBalances/Index'));
const HolidayList = lazy(() => import('@/pages/Holidays/Index'));

// Phase 13 — AI Chat (TSX)
const AIChat = lazy(() => import('@/pages/AIChat/Index'));

// Phase 14 — Audit Trail (TSX)
const AuditLogList = lazy(() => import('@/pages/AuditLogs/Index'));
const AuditDashboard = lazy(() => import('@/pages/AuditLogs/Dashboard'));

// Phase 15 — Admin Tools (TSX)
const AdminTools = lazy(() => import('@/pages/AdminTools/Index'));

// Phase 16 — Analytics (TSX)
const AnalyticsIndex = lazy(() => import('@/pages/Analytics/Index'));
const LeaveUtilization = lazy(() => import('@/pages/Analytics/LeaveUtilization'));
const OnboardingFunnel = lazy(() => import('@/pages/Analytics/OnboardingFunnel'));
const Headcount = lazy(() => import('@/pages/Analytics/Headcount'));
const WfhAnalytics = lazy(() => import('@/pages/Analytics/WfhAnalytics'));

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
            <Link to="/dashboard" className="text-blue-600 hover:underline">
                Back to Dashboard
            </Link>
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
        errorElement: <RouteErrorPage />,
        children: [
            // Public routes (accessible regardless of auth state)
            { path: '/onboarding/:token', element: <OnboardingPortal /> },
            { path: '/onboarding/:token/success', element: <OnboardingSuccess /> },

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
                            { path: '/my-assets', element: <MyAssets /> },
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
                            { path: '/roles', element: <RoleList /> },
                            { path: '/onboarding/invites', element: <OnboardingInvites /> },
                            { path: '/onboarding/submissions', element: <OnboardingSubmissions /> },
                            { path: '/onboarding/submissions/:id', element: <OnboardingSubmissionShow /> },
                            { path: '/leaves', element: <LeaveRequestList /> },
                            { path: '/leaves/pending-approvals', element: <LeavePendingApprovals /> },
                            { path: '/leaves/:id', element: <LeaveRequestShow /> },
                            { path: '/leave-types', element: <LeaveTypeList /> },
                            { path: '/leave-balances', element: <LeaveBalanceList /> },
                            { path: '/holidays', element: <HolidayList /> },
                            { path: '/assets', element: <AssetList /> },
                            { path: '/inventory', element: <Navigate to="/assets" replace /> },
                            { path: '/individual-assets', element: <Navigate to="/assets" replace /> },
                            { path: '/projects', element: <ComingSoon /> },
                            { path: '/tasks', element: <ComingSoon /> },
                            { path: '/tasks/kanban', element: <ComingSoon /> },
                            { path: '/ai-chat', element: <AIChat /> },
                            { path: '/ai-chat/:sessionId', element: <AIChat /> },
                            { path: '/support', element: <SupportTickets /> },
                            { path: '/audit-logs', element: <AuditLogList /> },
                            { path: '/audit-dashboard', element: <AuditDashboard /> },
                            { path: '/admin-tools', element: <AdminTools /> },
                            { path: '/analytics', element: <AnalyticsIndex /> },
                            { path: '/analytics/leave-utilization', element: <LeaveUtilization /> },
                            { path: '/analytics/onboarding-funnel', element: <OnboardingFunnel /> },
                            { path: '/analytics/headcount', element: <Headcount /> },
                            { path: '/analytics/wfh', element: <WfhAnalytics /> },
                            { path: '/settings', element: <ComingSoon /> },
                            { path: '*', element: <NotFoundPage homePath="/dashboard" /> },
                        ],
                    },
                ],
            },

            // Catch-all 404 for any unmatched route
            { path: '*', element: <NotFoundPage /> },
        ],
    },
]);
