import { createBrowserRouter, Link, Navigate, Outlet } from 'react-router-dom';
import { ProtectedRoute, GuestRoute, PermissionRoute } from '@/components/route-guards';
import { RouteErrorPage, NotFoundPage } from '@/components/error-boundary';
import AuthenticatedLayout from '@/layouts/AuthenticatedLayout';
import { lazy, Suspense } from 'react';
import { FullPageSpinner } from '@/components/full-page-spinner';

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
const MyTeams = lazy(() => import('@/pages/Employees/Team/MyTeams'));

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

const NotificationsPage = lazy(() => import('@/pages/Notifications/Index'));
const SettingsPage = lazy(() => import('@/pages/Settings/Index'));

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
        <Suspense fallback={<FullPageSpinner />}>
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
                            // ─── Everyone (authenticated, no extra permissions) ───
                            { path: '/dashboard', element: <Dashboard /> },
                            { path: '/calendar', element: <Calendar /> },
                            { path: '/my-leaves', element: <MyLeaves /> },
                            { path: '/my-leaves/apply', element: <ApplyLeave /> },
                            { path: '/my-leaves/:id', element: <ShowLeave /> },
                            { path: '/my-leaves/:id/edit', element: <EditLeave /> },
                            { path: '/my-wfh', element: <MyWFH /> },
                            { path: '/announcements', element: <AnnouncementList /> },
                            { path: '/my-assets', element: <MyAssets /> },
                            { path: '/my-team', element: <Navigate to="/my-teams" replace /> },
                            { path: '/my-teams', element: <MyTeams /> },
                            { path: '/profile', element: <Profile /> },
                            { path: '/ai-chat', element: <AIChat /> },
                            { path: '/ai-chat/:sessionId', element: <AIChat /> },
                            { path: '/support', element: <SupportTickets /> },
                            { path: '/notifications', element: <NotificationsPage /> },
                            { path: '/settings', element: <SettingsPage /> },

                            // ─── User Management ───
                            {
                                element: <PermissionRoute permission="USER_READ" />,
                                children: [
                                    { path: '/users', element: <UserList /> },
                                    { path: '/users/:id', element: <UserShow /> },
                                ],
                            },
                            {
                                element: <PermissionRoute permission="USER_CREATE" />,
                                children: [
                                    { path: '/users/create', element: <UserCreate /> },
                                ],
                            },
                            {
                                element: <PermissionRoute permission="USER_UPDATE" />,
                                children: [
                                    { path: '/users/pending-approvals', element: <UserPendingApprovals /> },
                                    { path: '/users/:id/edit', element: <UserEdit /> },
                                ],
                            },

                            // ─── Teams ───
                            {
                                element: <PermissionRoute permission="TEAM_READ" />,
                                children: [
                                    { path: '/teams', element: <TeamList /> },
                                    { path: '/teams/:id', element: <TeamShow /> },
                                ],
                            },
                            {
                                element: <PermissionRoute permission="TEAM_CREATE" />,
                                children: [
                                    { path: '/teams/create', element: <TeamCreateEdit /> },
                                ],
                            },
                            {
                                element: <PermissionRoute permission="TEAM_UPDATE" />,
                                children: [
                                    { path: '/teams/:id/edit', element: <TeamCreateEdit /> },
                                ],
                            },

                            // ─── Departments ───
                            {
                                element: <PermissionRoute permission="DEPARTMENT_READ" />,
                                children: [
                                    { path: '/departments', element: <DepartmentList /> },
                                ],
                            },
                            {
                                element: <PermissionRoute permission="DEPARTMENT_CREATE" />,
                                children: [
                                    { path: '/departments/create', element: <DepartmentCreateEdit /> },
                                ],
                            },
                            {
                                element: <PermissionRoute permission="DEPARTMENT_UPDATE" />,
                                children: [
                                    { path: '/departments/:id/edit', element: <DepartmentCreateEdit /> },
                                ],
                            },

                            // ─── Positions ───
                            {
                                element: <PermissionRoute permission="POSITION_READ" />,
                                children: [
                                    { path: '/positions', element: <PositionList /> },
                                ],
                            },
                            {
                                element: <PermissionRoute permission="POSITION_CREATE" />,
                                children: [
                                    { path: '/positions/create', element: <PositionCreateEdit /> },
                                ],
                            },
                            {
                                element: <PermissionRoute permission="POSITION_UPDATE" />,
                                children: [
                                    { path: '/positions/:id/edit', element: <PositionCreateEdit /> },
                                ],
                            },

                            // ─── Roles — ROLE_READ ───
                            {
                                element: <PermissionRoute permission="ROLE_READ" />,
                                children: [
                                    { path: '/roles', element: <RoleList /> },
                                ],
                            },

                            // ─── Onboarding — ONBOARDING_VIEW or ONBOARDING_MANAGE ───
                            {
                                element: <PermissionRoute permission={['ONBOARDING_VIEW', 'ONBOARDING_MANAGE']} />,
                                children: [
                                    { path: '/onboarding/invites', element: <OnboardingInvites /> },
                                    { path: '/onboarding/submissions', element: <OnboardingSubmissions /> },
                                    { path: '/onboarding/submissions/:id', element: <OnboardingSubmissionShow /> },
                                ],
                            },

                            // ─── Leave Pending Approvals — LEAVE_APPLICATION_APPROVE ───
                            {
                                element: <PermissionRoute permission="LEAVE_APPLICATION_APPROVE" />,
                                children: [
                                    { path: '/leaves/pending-approvals', element: <LeavePendingApprovals /> },
                                ],
                            },

                            // ─── Leave Requests — admin only (APPROVE or LEAVE_TYPE_CREATE) ───
                            {
                                element: <PermissionRoute permission={['LEAVE_APPLICATION_APPROVE', 'LEAVE_TYPE_CREATE']} />,
                                children: [
                                    { path: '/leaves', element: <LeaveRequestList /> },
                                    { path: '/leaves/:id', element: <LeaveRequestShow /> },
                                ],
                            },

                            // ─── Leave Config — LEAVE_TYPE_CREATE ───
                            {
                                element: <PermissionRoute permission="LEAVE_TYPE_CREATE" />,
                                children: [
                                    { path: '/leave-types', element: <LeaveTypeList /> },
                                    { path: '/leave-balances', element: <LeaveBalanceList /> },
                                    { path: '/holidays', element: <HolidayList /> },
                                ],
                            },

                            // ─── Assets — ASSET_VIEW or ASSET_CREATE or ASSET_EDIT ───
                            {
                                element: <PermissionRoute permission={['ASSET_VIEW', 'ASSET_CREATE', 'ASSET_EDIT']} />,
                                children: [
                                    { path: '/assets', element: <AssetList /> },
                                    { path: '/inventory', element: <Navigate to="/assets" replace /> },
                                    { path: '/individual-assets', element: <Navigate to="/assets" replace /> },
                                ],
                            },

                            // ─── Projects — PROJECT_READ or PROJECT_CREATE ───
                            {
                                element: <PermissionRoute permission={['PROJECT_READ', 'PROJECT_CREATE']} />,
                                children: [
                                    { path: '/projects', element: <ComingSoon /> },
                                    { path: '/tasks', element: <ComingSoon /> },
                                    { path: '/tasks/kanban', element: <ComingSoon /> },
                                ],
                            },

                            // ─── Audit Trail — AUDIT_LOG_READ ───
                            {
                                element: <PermissionRoute permission="AUDIT_LOG_READ" />,
                                children: [
                                    { path: '/audit-logs', element: <AuditLogList /> },
                                    { path: '/audit-dashboard', element: <AuditDashboard /> },
                                ],
                            },

                            // ─── Admin Tools — ADMIN_TOOLS ───
                            {
                                element: <PermissionRoute permission="ADMIN_TOOLS" />,
                                children: [
                                    { path: '/admin-tools', element: <AdminTools /> },
                                ],
                            },

                            // ─── Analytics — ANALYTICS_READ ───
                            {
                                element: <PermissionRoute permission="ANALYTICS_READ" />,
                                children: [
                                    { path: '/analytics', element: <AnalyticsIndex /> },
                                    { path: '/analytics/leave-utilization', element: <LeaveUtilization /> },
                                    { path: '/analytics/onboarding-funnel', element: <OnboardingFunnel /> },
                                    { path: '/analytics/headcount', element: <Headcount /> },
                                    { path: '/analytics/wfh', element: <WfhAnalytics /> },
                                ],
                            },

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
