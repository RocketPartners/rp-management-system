import { Alert, AlertDescription } from '@/components/ui/alert';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Progress } from '@/components/ui/progress';
import { useAuth } from '@/contexts/auth-context';
import { apiFetch } from '@/lib/spring-boot-api';
import type { LeaveApplicationResponse, LeaveBalanceResponse } from '@/types';
import {
    AlertCircle,
    Bell,
    Calendar,
    Clock,
    Eye,
    Laptop,
    LayoutDashboard,
    Mail,
    MapPin,
    Phone,
    Plus,
    User,
    Briefcase,
} from 'lucide-react';
import { useEffect, useState } from 'react';
import { Helmet } from 'react-helmet-async';
import { Link } from 'react-router-dom';

export default function Dashboard() {
    const { user } = useAuth();
    const [leaveBalances, setLeaveBalances] = useState<LeaveBalanceResponse[]>([]);
    const [upcomingLeaves, setUpcomingLeaves] = useState<LeaveApplicationResponse[]>([]);
    const [pendingLeaves, setPendingLeaves] = useState<LeaveApplicationResponse[]>([]);
    const [announcements] = useState<unknown[]>([]);
    const [loading, setLoading] = useState<boolean>(true);

    useEffect(() => {
        async function fetchDashboard() {
            try {
                const [balancesRes, leavesRes] = await Promise.allSettled([
                    apiFetch('/leave-applications/balances/my'),
                    apiFetch('/leave-applications/my'),
                ]);

                if (balancesRes.status === 'fulfilled' && balancesRes.value.ok) {
                    const data = await balancesRes.value.json();
                    setLeaveBalances(data.data || []);
                }

                if (leavesRes.status === 'fulfilled' && leavesRes.value.ok) {
                    const data = await leavesRes.value.json();
                    const leaves: LeaveApplicationResponse[] = data.data || [];
                    setUpcomingLeaves(
                        leaves.filter(
                            (l) =>
                                l.status === 'APPROVED' &&
                                new Date(l.startDate) >= new Date(),
                        ),
                    );
                    setPendingLeaves(
                        leaves.filter(
                            (l) =>
                                l.status === 'PENDING_MANAGER' ||
                                l.status === 'PENDING_HR',
                        ),
                    );
                }
            } catch {
                // Silent fail — show empty state
            } finally {
                setLoading(false);
            }
        }

        fetchDashboard();
    }, []);

    const getLeaveBalanceColor = (balance: LeaveBalanceResponse): string => {
        const percentage =
            (balance.remainingDays / balance.totalDays) * 100;
        if (percentage < 25) return 'text-red-600';
        if (percentage < 50) return 'text-yellow-600';
        return 'text-green-600';
    };

    if (loading) {
        return (
            <div className="flex h-screen items-center justify-center">
                <div className="h-8 w-8 animate-spin rounded-full border-4 border-blue-600 border-t-transparent" />
            </div>
        );
    }

    return (
        <>
            <Helmet>
                <title>Dashboard</title>
            </Helmet>

            {/* Header */}
            <div className="border-b border-gray-200 bg-white">
                <div className="px-4 py-6 sm:px-6 lg:px-8">
                    <div className="flex items-center gap-3">
                        <div className="rounded-lg bg-blue-100 p-2">
                            <LayoutDashboard className="h-6 w-6 text-blue-600" />
                        </div>
                        <div>
                            <h2 className="text-3xl font-bold text-gray-900">
                                Welcome back, {user?.firstName || user?.name}!
                            </h2>
                            <p className="mt-1 text-gray-600">
                                Here's what's happening with your account
                            </p>
                        </div>
                    </div>
                </div>
            </div>

            <div className="mx-auto max-w-7xl space-y-6 px-4 py-8 sm:px-6 lg:px-8">
                    {/* Quick Stats */}
                    <div className="animate-fade-in grid grid-cols-1 gap-6 md:grid-cols-4">
                        <Card>
                            <CardContent className="pt-6">
                                <div className="flex items-center justify-between">
                                    <div>
                                        <p className="text-sm font-medium text-gray-600">
                                            Assigned Assets
                                        </p>
                                        <p className="mt-2 text-3xl font-bold text-gray-900">
                                            0
                                        </p>
                                    </div>
                                    <div className="rounded-lg bg-blue-100 p-3">
                                        <Laptop className="h-6 w-6 text-blue-600" />
                                    </div>
                                </div>
                            </CardContent>
                        </Card>

                        <Card>
                            <CardContent className="pt-6">
                                <div className="flex items-center justify-between">
                                    <div>
                                        <p className="text-sm font-medium text-gray-600">
                                            Upcoming Leaves
                                        </p>
                                        <p className="mt-2 text-3xl font-bold text-purple-600">
                                            {upcomingLeaves.length}
                                        </p>
                                    </div>
                                    <div className="rounded-lg bg-purple-100 p-3">
                                        <Calendar className="h-6 w-6 text-purple-600" />
                                    </div>
                                </div>
                            </CardContent>
                        </Card>

                        <Card>
                            <CardContent className="pt-6">
                                <div className="flex items-center justify-between">
                                    <div>
                                        <p className="text-sm font-medium text-gray-600">
                                            Pending Requests
                                        </p>
                                        <p className="mt-2 text-3xl font-bold text-yellow-600">
                                            {pendingLeaves.length}
                                        </p>
                                    </div>
                                    <div className="rounded-lg bg-yellow-100 p-3">
                                        <Clock className="h-6 w-6 text-yellow-600" />
                                    </div>
                                </div>
                            </CardContent>
                        </Card>

                        <Card>
                            <CardContent className="pt-6">
                                <div className="flex items-center justify-between">
                                    <div>
                                        <p className="text-sm font-medium text-gray-600">
                                            Announcements
                                        </p>
                                        <p className="mt-2 text-3xl font-bold text-red-600">
                                            {announcements.length}
                                        </p>
                                    </div>
                                    <div className="rounded-lg bg-red-100 p-3">
                                        <Bell className="h-6 w-6 text-red-600" />
                                    </div>
                                </div>
                            </CardContent>
                        </Card>
                    </div>

                    {/* Main Content Grid */}
                    <div className="grid grid-cols-1 gap-6 lg:grid-cols-3">
                        {/* Left Column - Leave Balances */}
                        <div className="space-y-6 lg:col-span-2">
                            <Card className="animate-fade-in animation-delay-200">
                                <CardHeader>
                                    <div className="flex items-center justify-between">
                                        <CardTitle className="flex items-center gap-2">
                                            <Calendar className="h-5 w-5" />
                                            My Leave Balances (
                                            {new Date().getFullYear()})
                                        </CardTitle>
                                        <Button
                                            asChild
                                            size="sm"
                                            className="bg-blue-600 hover:bg-blue-700"
                                        >
                                            <Link to="/my-leaves/apply">
                                                <Plus className="mr-2 h-4 w-4" />
                                                Apply for Leave
                                            </Link>
                                        </Button>
                                    </div>
                                </CardHeader>
                                <CardContent>
                                    {leaveBalances.length > 0 ? (
                                        <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
                                            {leaveBalances.map((balance) => (
                                                <div
                                                    key={balance.id}
                                                    className="rounded-lg border-2 p-4 transition-shadow hover:shadow-md"
                                                >
                                                    <div className="mb-3 flex items-center justify-between">
                                                        <span className="font-medium text-gray-900">
                                                            {balance.leaveTypeName}
                                                        </span>
                                                    </div>
                                                    <div className="mb-2 flex items-baseline gap-2">
                                                        <span
                                                            className={`text-3xl font-bold ${getLeaveBalanceColor(balance)}`}
                                                        >
                                                            {balance.remainingDays}
                                                        </span>
                                                        <span className="text-gray-500">
                                                            / {balance.totalDays} days
                                                        </span>
                                                    </div>
                                                    <Progress
                                                        value={
                                                            (balance.remainingDays /
                                                                balance.totalDays) *
                                                            100
                                                        }
                                                        className="mb-3 h-2"
                                                    />
                                                    <div className="flex justify-between text-xs text-gray-600">
                                                        <span>
                                                            Used: {balance.usedDays}
                                                        </span>
                                                        {balance.carriedOverDays > 0 && (
                                                            <span className="text-blue-600">
                                                                +{balance.carriedOverDays}{' '}
                                                                carried over
                                                            </span>
                                                        )}
                                                    </div>
                                                </div>
                                            ))}
                                        </div>
                                    ) : (
                                        <Alert className="border-yellow-200 bg-yellow-50">
                                            <AlertCircle className="h-4 w-4 text-yellow-600" />
                                            <AlertDescription className="text-yellow-800">
                                                No leave balances found. Contact HR
                                                to initialize your balances.
                                            </AlertDescription>
                                        </Alert>
                                    )}
                                </CardContent>
                            </Card>

                            {/* Pending Leave Requests */}
                            {pendingLeaves.length > 0 && (
                                <Card className="animate-fade-in animation-delay-400">
                                    <CardHeader>
                                        <CardTitle className="flex items-center gap-2">
                                            <Clock className="h-5 w-5 text-yellow-600" />
                                            Pending Leave Requests
                                        </CardTitle>
                                    </CardHeader>
                                    <CardContent>
                                        <div className="space-y-3">
                                            {pendingLeaves.map((leave) => (
                                                <div
                                                    key={leave.id}
                                                    className="rounded-lg border border-yellow-200 bg-yellow-50 p-4"
                                                >
                                                    <div className="mb-2 flex items-start justify-between">
                                                        <span className="font-medium text-gray-900">
                                                            {leave.leaveTypeName}
                                                        </span>
                                                        <Badge className="bg-yellow-100 text-yellow-700">
                                                            {leave.statusLabel}
                                                        </Badge>
                                                    </div>
                                                    <div className="flex items-center gap-4 text-sm text-gray-600">
                                                        <span>
                                                            {new Date(
                                                                leave.startDate,
                                                            ).toLocaleDateString(
                                                                'en-US',
                                                                {
                                                                    month: 'short',
                                                                    day: 'numeric',
                                                                },
                                                            )}
                                                            {leave.startDate !==
                                                                leave.endDate &&
                                                                ` - ${new Date(
                                                                    leave.endDate,
                                                                ).toLocaleDateString(
                                                                    'en-US',
                                                                    {
                                                                        month: 'short',
                                                                        day: 'numeric',
                                                                    },
                                                                )}`}
                                                        </span>
                                                        <span>•</span>
                                                        <span>
                                                            {leave.totalDays}{' '}
                                                            {leave.totalDays === 1
                                                                ? 'day'
                                                                : 'days'}
                                                        </span>
                                                    </div>
                                                </div>
                                            ))}
                                        </div>
                                    </CardContent>
                                </Card>
                            )}
                        </div>

                        {/* Right Sidebar */}
                        <div className="space-y-6">
                            {/* My Profile Card */}
                            <Card className="animate-fade-in animation-delay-100">
                                <CardHeader>
                                    <CardTitle className="flex items-center gap-2">
                                        <User className="h-5 w-5" />
                                        My Profile
                                    </CardTitle>
                                </CardHeader>
                                <CardContent className="space-y-4">
                                    <div className="flex items-center gap-4">
                                        <div className="flex h-16 w-16 items-center justify-center rounded-full border-2 border-gray-200 bg-blue-600">
                                            <span className="text-2xl font-medium text-white">
                                                {(user?.name || 'U')
                                                    .charAt(0)
                                                    .toUpperCase()}
                                            </span>
                                        </div>
                                        <div>
                                            <h3 className="font-semibold text-gray-900">
                                                {user?.name}
                                            </h3>
                                            <p className="text-sm text-gray-600">
                                                {user?.position}
                                            </p>
                                        </div>
                                    </div>

                                    <div className="space-y-2 text-sm">
                                        {user?.employeeId && (
                                            <div className="flex items-center gap-2 text-gray-600">
                                                <Briefcase className="h-4 w-4" />
                                                <span>ID: {user.employeeId}</span>
                                            </div>
                                        )}
                                        {user?.department?.name && (
                                            <div className="flex items-center gap-2 text-gray-600">
                                                <MapPin className="h-4 w-4" />
                                                <span>{user.department.name}</span>
                                            </div>
                                        )}
                                        {user?.email && (
                                            <div className="flex items-center gap-2 text-gray-600">
                                                <Mail className="h-4 w-4" />
                                                <span className="truncate">
                                                    {user.email}
                                                </span>
                                            </div>
                                        )}
                                        {user?.phoneNumber && (
                                            <div className="flex items-center gap-2 text-gray-600">
                                                <Phone className="h-4 w-4" />
                                                <span>{user.phoneNumber}</span>
                                            </div>
                                        )}
                                    </div>

                                    <Button
                                        asChild
                                        variant="outline"
                                        className="mt-4 w-full"
                                    >
                                        <Link to="/settings">
                                            View Full Profile
                                        </Link>
                                    </Button>
                                </CardContent>
                            </Card>

                            {/* Quick Actions */}
                            <Card className="animate-fade-in animation-delay-300">
                                <CardHeader>
                                    <CardTitle>Quick Actions</CardTitle>
                                </CardHeader>
                                <CardContent className="grid grid-cols-2 gap-3">
                                    <Button
                                        asChild
                                        variant="outline"
                                        className="justify-start"
                                    >
                                        <Link to="/my-leaves/apply">
                                            <Calendar className="mr-2 h-4 w-4" />
                                            Apply Leave
                                        </Link>
                                    </Button>
                                    <Button
                                        asChild
                                        variant="outline"
                                        className="justify-start"
                                    >
                                        <Link to="/my-leaves">
                                            <Eye className="mr-2 h-4 w-4" />
                                            My Leaves
                                        </Link>
                                    </Button>
                                    <Button
                                        asChild
                                        variant="outline"
                                        className="justify-start"
                                    >
                                        <Link to="/my-assets">
                                            <Laptop className="mr-2 h-4 w-4" />
                                            My Assets
                                        </Link>
                                    </Button>
                                    <Button
                                        asChild
                                        variant="outline"
                                        className="justify-start"
                                    >
                                        <Link to="/settings">
                                            <User className="mr-2 h-4 w-4" />
                                            My Profile
                                        </Link>
                                    </Button>
                                </CardContent>
                            </Card>
                        </div>
                    </div>
                </div>
        </>
    );
}
