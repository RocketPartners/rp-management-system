import { Alert, AlertDescription } from '@/components/ui/alert';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import {
    Card,
    CardContent,
    CardHeader,
    CardTitle,
} from '@/components/ui/card';
import { Progress } from '@/components/ui/progress';
import { Skeleton } from '@/components/ui/skeleton';
import {
    Table,
    TableBody,
    TableCell,
    TableHead,
    TableHeader,
    TableRow,
} from '@/components/ui/table';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { useAuth } from '@/contexts/auth-context';
import { usePermission } from '@/hooks/usePermission';
import { apiGet } from '@/lib/spring-boot-api';
import type {
    AdminDashboardResponse,
    DashboardLeaveBalanceSummary,
    DashboardLeaveItem,
    MyDashboardResponse,
} from '@/types';
import { useQuery } from '@tanstack/react-query';
import {
    AlertCircle,
    Bell,
    Briefcase,
    Calendar,
    CheckCircle2,
    Clock,
    Eye,
    Home,
    Laptop,
    LayoutDashboard,
    Mail,
    MapPin,
    Phone,
    Plus,
    User,
    UserCheck,
    Users,
    UsersRound,
} from 'lucide-react';
import { useState } from 'react';
import { Helmet } from 'react-helmet-async';
import { Link } from 'react-router-dom';

// ---------------------------------------------------------------------------
// Helpers
// ---------------------------------------------------------------------------

function getLeaveBalanceColor(balance: DashboardLeaveBalanceSummary): string {
    if (balance.totalDays === 0) return 'text-gray-600';
    const pct = (balance.remainingDays / balance.totalDays) * 100;
    if (pct < 25) return 'text-red-600';
    if (pct < 50) return 'text-yellow-600';
    return 'text-green-600';
}

function formatDateRange(start: string, end: string): string {
    const opts: Intl.DateTimeFormatOptions = { month: 'short', day: 'numeric' };
    const s = new Date(start).toLocaleDateString('en-US', opts);
    if (start === end) return s;
    const e = new Date(end).toLocaleDateString('en-US', opts);
    return `${s} - ${e}`;
}

function statusBadge(status: string) {
    const map: Record<string, { label: string; cls: string }> = {
        APPROVED: { label: 'Approved', cls: 'bg-green-100 text-green-700' },
        PENDING_MANAGER: { label: 'Pending Manager', cls: 'bg-yellow-100 text-yellow-700' },
        PENDING_HR: { label: 'Pending HR', cls: 'bg-orange-100 text-orange-700' },
        REJECTED_BY_MANAGER: { label: 'Rejected', cls: 'bg-red-100 text-red-700' },
        REJECTED_BY_HR: { label: 'Rejected', cls: 'bg-red-100 text-red-700' },
        CANCELLED: { label: 'Cancelled', cls: 'bg-gray-100 text-gray-700' },
    };
    const info = map[status] ?? { label: status, cls: 'bg-gray-100 text-gray-700' };
    return <Badge className={info.cls}>{info.label}</Badge>;
}

// ---------------------------------------------------------------------------
// Stat Card
// ---------------------------------------------------------------------------

function StatCard({
    label,
    value,
    icon: Icon,
    color,
}: {
    label: string;
    value: number | string;
    icon: React.ElementType;
    color: string;
}) {
    const bgMap: Record<string, string> = {
        blue: 'bg-blue-100',
        purple: 'bg-purple-100',
        yellow: 'bg-yellow-100',
        green: 'bg-green-100',
        orange: 'bg-orange-100',
        red: 'bg-red-100',
    };
    const textMap: Record<string, string> = {
        blue: 'text-blue-600',
        purple: 'text-purple-600',
        yellow: 'text-yellow-600',
        green: 'text-green-600',
        orange: 'text-orange-600',
        red: 'text-red-600',
    };
    return (
        <Card>
            <CardContent className="p-3 lg:pt-6 lg:p-6">
                <div className="flex items-center gap-3 lg:justify-between">
                    <div className={`rounded-lg p-2 lg:order-2 lg:p-3 ${bgMap[color] ?? 'bg-gray-100'}`}>
                        <Icon className={`h-5 w-5 lg:h-6 lg:w-6 ${textMap[color] ?? 'text-gray-600'}`} />
                    </div>
                    <div>
                        <p className="text-xs font-medium text-gray-600 lg:text-sm">{label}</p>
                        <p className={`mt-0.5 text-xl font-bold lg:mt-2 lg:text-3xl ${textMap[color] ?? 'text-gray-900'}`}>
                            {value}
                        </p>
                    </div>
                </div>
            </CardContent>
        </Card>
    );
}

// ---------------------------------------------------------------------------
// Leave item card (reused in upcoming + pending)
// ---------------------------------------------------------------------------

function LeaveItemCard({ leave, variant }: { leave: DashboardLeaveItem; variant: 'upcoming' | 'pending' }) {
    const borderColor = variant === 'upcoming' ? 'border-green-200 bg-green-50' : 'border-yellow-200 bg-yellow-50';
    return (
        <div className={`rounded-lg border p-4 ${borderColor}`}>
            <div className="mb-2 flex items-start justify-between">
                <div className="flex items-center gap-2">
                    <div
                        className="h-3 w-3 rounded-full"
                        style={{ backgroundColor: leave.leaveTypeColor }}
                    />
                    <span className="font-medium text-gray-900">{leave.leaveTypeName}</span>
                </div>
                {variant === 'upcoming' ? (
                    <Badge className="bg-green-100 text-green-700">
                        <CheckCircle2 className="mr-1 h-3 w-3" />
                        Approved
                    </Badge>
                ) : (
                    statusBadge(leave.status)
                )}
            </div>
            <div className="flex items-center gap-4 text-sm text-gray-600">
                <span>{formatDateRange(leave.startDate, leave.endDate)}</span>
                <span>&bull;</span>
                <span>
                    {leave.totalDays} {leave.totalDays === 1 ? 'day' : 'days'}
                </span>
            </div>
        </div>
    );
}

// ---------------------------------------------------------------------------
// My Dashboard (Employee Tab)
// ---------------------------------------------------------------------------

function MyDashboardTab({ data, isLoading }: { data?: MyDashboardResponse; isLoading: boolean }) {
    const { user } = useAuth();

    if (isLoading) {
        return (
            <div className="space-y-6">
                <div className="grid grid-cols-1 gap-6 md:grid-cols-4">
                    {[...Array(4)].map((_, i) => (
                        <Skeleton key={i} className="h-[100px] rounded-xl" />
                    ))}
                </div>
                <div className="grid grid-cols-1 gap-6 lg:grid-cols-3">
                    <Skeleton className="h-[400px] rounded-xl lg:col-span-2" />
                    <Skeleton className="h-[400px] rounded-xl" />
                </div>
            </div>
        );
    }

    return (
        <div className="space-y-4 lg:space-y-6">
            {/* Quick Stats — 2x2 on mobile, 4-col on desktop */}
            <div className="grid grid-cols-2 gap-3 lg:gap-6 lg:grid-cols-4">
                <StatCard label="Assigned Assets" value={data?.assignedAssetsCount ?? 0} icon={Laptop} color="blue" />
                <StatCard label="Upcoming Leaves" value={data?.upcomingLeavesCount ?? 0} icon={Calendar} color="purple" />
                <StatCard label="Pending Requests" value={data?.pendingLeavesCount ?? 0} icon={Clock} color="yellow" />
                <StatCard label="WFH This Week" value={data?.wfhThisWeekCount ?? 0} icon={Home} color="green" />
            </div>

            {/* Main Content Grid */}
            <div className="grid grid-cols-1 gap-4 lg:gap-6 lg:grid-cols-3">
                {/* Left Column — on mobile this is the ONLY column, reordered */}
                <div className="space-y-4 lg:space-y-6 lg:col-span-2">
                    {/* Pending Leave Requests — shown FIRST on mobile (actionable) */}
                    {data?.pendingLeaves && data.pendingLeaves.length > 0 && (
                        <Card className="order-1 lg:order-3">
                            <CardHeader className="px-4 py-3 lg:px-6 lg:py-4">
                                <CardTitle className="flex items-center gap-2 text-base lg:text-lg">
                                    <Clock className="h-5 w-5 text-yellow-600" />
                                    Pending Leave Requests
                                </CardTitle>
                            </CardHeader>
                            <CardContent className="px-4 pb-4 lg:px-6 lg:pb-6">
                                <div className="space-y-2 lg:space-y-3">
                                    {data.pendingLeaves.map((leave) => (
                                        <LeaveItemCard key={leave.id} leave={leave} variant="pending" />
                                    ))}
                                </div>
                            </CardContent>
                        </Card>
                    )}

                    {/* Upcoming Leaves */}
                    <Card className="order-2">
                        <CardHeader className="px-4 py-3 lg:px-6 lg:py-4">
                            <CardTitle className="flex items-center gap-2 text-base lg:text-lg">
                                <Calendar className="h-5 w-5" />
                                Upcoming Leaves
                            </CardTitle>
                        </CardHeader>
                        <CardContent className="px-4 pb-4 lg:px-6 lg:pb-6">
                            {data?.upcomingLeaves && data.upcomingLeaves.length > 0 ? (
                                <div className="space-y-2 lg:space-y-3">
                                    {data.upcomingLeaves.map((leave) => (
                                        <LeaveItemCard key={leave.id} leave={leave} variant="upcoming" />
                                    ))}
                                    <Button asChild variant="outline" className="w-full">
                                        <Link to="/my-leaves">View All Leaves</Link>
                                    </Button>
                                </div>
                            ) : (
                                <p className="py-4 text-sm text-gray-500">No upcoming leaves</p>
                            )}
                        </CardContent>
                    </Card>

                    {/* Leave Balances — horizontal scroll on mobile, grid on desktop */}
                    <Card className="order-3 lg:order-1">
                        <CardHeader className="px-4 py-3 lg:px-6 lg:py-4">
                            <div className="flex items-center justify-between">
                                <CardTitle className="flex items-center gap-2 text-base lg:text-lg">
                                    <Calendar className="h-5 w-5" />
                                    Leave Balances
                                </CardTitle>
                                <Button asChild size="sm" className="bg-blue-600 hover:bg-blue-700">
                                    <Link to="/my-leaves/apply">
                                        <Plus className="mr-1 h-3.5 w-3.5 lg:mr-2 lg:h-4 lg:w-4" />
                                        <span className="hidden sm:inline">Apply for Leave</span>
                                        <span className="sm:hidden">Apply</span>
                                    </Link>
                                </Button>
                            </div>
                        </CardHeader>
                        <CardContent className="px-4 pb-4 lg:px-6 lg:pb-6">
                            {data?.leaveBalances && data.leaveBalances.length > 0 ? (
                                <>
                                    {/* Mobile: horizontal scroll chips */}
                                    <div className="flex gap-3 overflow-x-auto pb-2 lg:hidden" style={{ scrollbarWidth: 'none', WebkitOverflowScrolling: 'touch' }}>
                                        {data.leaveBalances.map((balance) => (
                                            <div
                                                key={balance.id}
                                                className="flex-shrink-0 rounded-xl border-2 p-3"
                                                style={{ borderColor: balance.leaveType.color + '40', width: '140px' }}
                                            >
                                                <div className="mb-1.5 flex items-center gap-1.5">
                                                    <div
                                                        className="h-2.5 w-2.5 rounded-full"
                                                        style={{ backgroundColor: balance.leaveType.color }}
                                                    />
                                                    <span className="truncate text-xs font-medium text-gray-700">
                                                        {balance.leaveType.name}
                                                    </span>
                                                </div>
                                                <div className="flex items-baseline gap-1">
                                                    <span className={`text-xl font-bold ${getLeaveBalanceColor(balance)}`}>
                                                        {balance.remainingDays}
                                                    </span>
                                                    <span className="text-xs text-gray-400">/ {balance.totalDays}</span>
                                                </div>
                                                <Progress
                                                    value={
                                                        balance.totalDays > 0
                                                            ? (balance.remainingDays / balance.totalDays) * 100
                                                            : 0
                                                    }
                                                    className="mt-2 h-1.5"
                                                />
                                            </div>
                                        ))}
                                    </div>
                                    {/* Desktop: existing grid layout */}
                                    <div className="hidden gap-4 lg:grid lg:grid-cols-2">
                                        {data.leaveBalances.map((balance) => (
                                            <div
                                                key={balance.id}
                                                className="rounded-lg border-2 p-4 transition-shadow hover:shadow-md"
                                                style={{ borderColor: balance.leaveType.color + '40' }}
                                            >
                                                <div className="mb-3 flex items-center justify-between">
                                                    <div className="flex items-center gap-2">
                                                        <div
                                                            className="h-3 w-3 rounded-full"
                                                            style={{ backgroundColor: balance.leaveType.color }}
                                                        />
                                                        <span className="font-medium text-gray-900">
                                                            {balance.leaveType.name}
                                                        </span>
                                                    </div>
                                                    <Badge
                                                        variant="outline"
                                                        className="text-xs"
                                                        style={{
                                                            borderColor: balance.leaveType.color + '40',
                                                            color: balance.leaveType.color,
                                                        }}
                                                    >
                                                        {balance.leaveType.code}
                                                    </Badge>
                                                </div>
                                                <div className="mb-2 flex items-baseline gap-2">
                                                    <span className={`text-3xl font-bold ${getLeaveBalanceColor(balance)}`}>
                                                        {balance.remainingDays}
                                                    </span>
                                                    <span className="text-gray-500">/ {balance.totalDays} days</span>
                                                </div>
                                                <Progress
                                                    value={
                                                        balance.totalDays > 0
                                                            ? (balance.remainingDays / balance.totalDays) * 100
                                                            : 0
                                                    }
                                                    className="mb-3 h-2"
                                                />
                                                <div className="flex justify-between text-xs text-gray-600">
                                                    <span>Used: {balance.usedDays}</span>
                                                    {balance.carriedOverDays > 0 && (
                                                        <span className="text-blue-600">
                                                            +{balance.carriedOverDays} carried over
                                                        </span>
                                                    )}
                                                </div>
                                            </div>
                                        ))}
                                    </div>
                                </>
                            ) : (
                                <Alert className="border-yellow-200 bg-yellow-50">
                                    <AlertCircle className="h-4 w-4 text-yellow-600" />
                                    <AlertDescription className="text-yellow-800">
                                        No leave balances found. Contact HR to initialize your balances.
                                    </AlertDescription>
                                </Alert>
                            )}
                        </CardContent>
                    </Card>
                </div>

                {/* Right Sidebar — hidden on mobile, visible on desktop */}
                <div className="hidden space-y-6 lg:block">
                    {/* My Profile */}
                    <Card>
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
                                        {(user?.name || 'U').charAt(0).toUpperCase()}
                                    </span>
                                </div>
                                <div>
                                    <h3 className="font-semibold text-gray-900">{user?.name}</h3>
                                    <p className="text-sm text-gray-600">{user?.position}</p>
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
                                        <span className="truncate">{user.email}</span>
                                    </div>
                                )}
                                {user?.phoneNumber && (
                                    <div className="flex items-center gap-2 text-gray-600">
                                        <Phone className="h-4 w-4" />
                                        <span>{user.phoneNumber}</span>
                                    </div>
                                )}
                            </div>
                            <Button asChild variant="outline" className="mt-4 w-full">
                                <Link to="/settings">View Full Profile</Link>
                            </Button>
                        </CardContent>
                    </Card>

                    {/* My Assets (placeholder) */}
                    <Card>
                        <CardHeader>
                            <CardTitle className="flex items-center gap-2">
                                <Laptop className="h-5 w-5" />
                                My Assets
                            </CardTitle>
                        </CardHeader>
                        <CardContent>
                            <div className="py-8 text-center text-gray-500">
                                <Laptop className="mx-auto mb-2 h-12 w-12 text-gray-400" />
                                <p className="text-sm">No assets assigned</p>
                            </div>
                        </CardContent>
                    </Card>

                    {/* Quick Actions */}
                    <Card>
                        <CardHeader>
                            <CardTitle>Quick Actions</CardTitle>
                        </CardHeader>
                        <CardContent className="grid grid-cols-2 gap-3">
                            <Button asChild variant="outline" className="justify-start">
                                <Link to="/my-leaves/apply">
                                    <Calendar className="mr-2 h-4 w-4" />
                                    Apply Leave
                                </Link>
                            </Button>
                            <Button asChild variant="outline" className="justify-start">
                                <Link to="/my-leaves">
                                    <Eye className="mr-2 h-4 w-4" />
                                    My Leaves
                                </Link>
                            </Button>
                            <Button asChild variant="outline" className="justify-start">
                                <Link to="/my-wfh">
                                    <Home className="mr-2 h-4 w-4" />
                                    My WFH
                                </Link>
                            </Button>
                            <Button asChild variant="outline" className="justify-start">
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
    );
}

// ---------------------------------------------------------------------------
// Admin Dashboard Tab
// ---------------------------------------------------------------------------

function AdminDashboardTab({ data, isLoading }: { data?: AdminDashboardResponse; isLoading: boolean }) {
    const { can } = usePermission();

    if (isLoading) {
        return (
            <div className="space-y-6">
                <div className="grid grid-cols-1 gap-6 md:grid-cols-4">
                    {[...Array(4)].map((_, i) => (
                        <Skeleton key={i} className="h-[100px] rounded-xl" />
                    ))}
                </div>
                <div className="grid grid-cols-1 gap-6 lg:grid-cols-3">
                    <Skeleton className="h-[400px] rounded-xl lg:col-span-2" />
                    <Skeleton className="h-[400px] rounded-xl" />
                </div>
            </div>
        );
    }

    return (
        <div className="space-y-6">
            {/* Summary Cards */}
            <div className="grid grid-cols-1 gap-6 md:grid-cols-4">
                <StatCard label="Active Employees" value={data?.totalActiveEmployees ?? 0} icon={Users} color="blue" />
                <StatCard label="Pending Approvals" value={data?.pendingAccountApprovals ?? 0} icon={UserCheck} color="orange" />
                <StatCard label="Pending Leaves" value={data?.pendingLeaveRequests ?? 0} icon={Clock} color="yellow" />
                <StatCard label="Active Teams" value={data?.activeTeamsCount ?? 0} icon={UsersRound} color="green" />
            </div>

            {/* Main Content Grid */}
            <div className="grid grid-cols-1 gap-6 lg:grid-cols-3">
                {/* Left Column */}
                <div className="space-y-6 lg:col-span-2">
                    {/* Recent Leave Applications */}
                    <Card>
                        <CardHeader>
                            <div className="flex items-center justify-between">
                                <CardTitle className="flex items-center gap-2">
                                    <Calendar className="h-5 w-5" />
                                    Recent Leave Applications
                                </CardTitle>
                                {can('leaves.view') && (
                                    <Button asChild variant="outline" size="sm">
                                        <Link to="/leaves/management">View All</Link>
                                    </Button>
                                )}
                            </div>
                        </CardHeader>
                        <CardContent>
                            {data?.recentLeaveApplications && data.recentLeaveApplications.length > 0 ? (
                                <Table>
                                    <TableHeader>
                                        <TableRow>
                                            <TableHead>Employee</TableHead>
                                            <TableHead>Type</TableHead>
                                            <TableHead>Dates</TableHead>
                                            <TableHead>Days</TableHead>
                                            <TableHead>Status</TableHead>
                                        </TableRow>
                                    </TableHeader>
                                    <TableBody>
                                        {data.recentLeaveApplications.map((la) => (
                                            <TableRow key={la.id}>
                                                <TableCell className="font-medium">{la.userName}</TableCell>
                                                <TableCell>
                                                    <div className="flex items-center gap-2">
                                                        <div
                                                            className="h-2.5 w-2.5 rounded-full"
                                                            style={{ backgroundColor: la.leaveTypeColor }}
                                                        />
                                                        {la.leaveTypeName}
                                                    </div>
                                                </TableCell>
                                                <TableCell>{formatDateRange(la.startDate, la.endDate)}</TableCell>
                                                <TableCell>{la.totalDays}</TableCell>
                                                <TableCell>{statusBadge(la.status)}</TableCell>
                                            </TableRow>
                                        ))}
                                    </TableBody>
                                </Table>
                            ) : (
                                <div className="py-8 text-center text-gray-500">
                                    <Calendar className="mx-auto mb-2 h-12 w-12 text-gray-400" />
                                    <p>No leave applications yet</p>
                                </div>
                            )}
                        </CardContent>
                    </Card>

                    {/* Announcements */}
                    <Card>
                        <CardHeader>
                            <div className="flex items-center justify-between">
                                <CardTitle className="flex items-center gap-2">
                                    <Bell className="h-5 w-5" />
                                    Recent Announcements
                                </CardTitle>
                                <Link to="/announcements">
                                    <Button variant="ghost" size="sm" className="gap-1 text-xs">
                                        View All <Eye className="h-3 w-3" />
                                    </Button>
                                </Link>
                            </div>
                        </CardHeader>
                        <CardContent>
                            {data?.recentAnnouncements && data.recentAnnouncements.length > 0 ? (
                                <div className="space-y-3">
                                    {data.recentAnnouncements.map((a) => (
                                        <Link
                                            key={a.id}
                                            to="/announcements"
                                            className="flex items-center justify-between rounded-lg border p-3 transition-colors hover:bg-gray-50"
                                        >
                                            <div className="min-w-0 flex-1">
                                                <p className="truncate text-sm font-medium text-gray-900">
                                                    {a.title}
                                                </p>
                                                <p className="mt-0.5 text-xs text-gray-500">
                                                    {a.authorName} · {a.category.replace('_', ' ')}
                                                </p>
                                            </div>
                                            <div className="ml-3 text-right">
                                                <span className="text-xs text-gray-400">
                                                    {new Date(a.publishedAt).toLocaleDateString('en-US', {
                                                        month: 'short',
                                                        day: 'numeric',
                                                    })}
                                                </span>
                                                {a.totalReactions > 0 && (
                                                    <p className="text-xs text-gray-400">
                                                        {a.totalReactions} reactions
                                                    </p>
                                                )}
                                            </div>
                                        </Link>
                                    ))}
                                </div>
                            ) : (
                                <div className="py-8 text-center text-gray-500">
                                    <Bell className="mx-auto mb-2 h-12 w-12 text-gray-400" />
                                    <p>No announcements yet</p>
                                    <p className="mt-1 text-xs text-gray-400">
                                        Company announcements will appear here
                                    </p>
                                </div>
                            )}
                        </CardContent>
                    </Card>

                    {/* Team Overview */}
                    <Card>
                        <CardHeader>
                            <div className="flex items-center justify-between">
                                <CardTitle className="flex items-center gap-2">
                                    <UsersRound className="h-5 w-5" />
                                    Team Overview
                                </CardTitle>
                                {can('teams.view') && (
                                    <Button asChild variant="outline" size="sm">
                                        <Link to="/teams">Manage Teams</Link>
                                    </Button>
                                )}
                            </div>
                        </CardHeader>
                        <CardContent>
                            {data?.teamOverview && data.teamOverview.length > 0 ? (
                                <Table>
                                    <TableHeader>
                                        <TableRow>
                                            <TableHead>Team</TableHead>
                                            <TableHead>Leader</TableHead>
                                            <TableHead>Members</TableHead>
                                            <TableHead>Status</TableHead>
                                        </TableRow>
                                    </TableHeader>
                                    <TableBody>
                                        {data.teamOverview.map((team) => (
                                            <TableRow key={team.teamId}>
                                                <TableCell className="font-medium">{team.teamName}</TableCell>
                                                <TableCell>{team.leaderName}</TableCell>
                                                <TableCell>{team.membersCount}</TableCell>
                                                <TableCell>
                                                    <Badge className="bg-green-100 text-green-700">
                                                        {team.status}
                                                    </Badge>
                                                </TableCell>
                                            </TableRow>
                                        ))}
                                    </TableBody>
                                </Table>
                            ) : (
                                <div className="py-8 text-center text-gray-500">
                                    <UsersRound className="mx-auto mb-2 h-12 w-12 text-gray-400" />
                                    <p>No teams created yet</p>
                                </div>
                            )}
                        </CardContent>
                    </Card>
                </div>

                {/* Right Sidebar */}
                <div className="space-y-6">
                    {/* Users on Leave Today */}
                    <Card>
                        <CardHeader>
                            <CardTitle className="flex items-center gap-2">
                                <Calendar className="h-5 w-5 text-red-600" />
                                On Leave Today
                            </CardTitle>
                        </CardHeader>
                        <CardContent>
                            {data?.usersOnLeaveToday && data.usersOnLeaveToday.length > 0 ? (
                                <div className="space-y-3">
                                    {data.usersOnLeaveToday.map((u) => (
                                        <div key={u.userId} className="flex items-center gap-3">
                                            <div className="flex h-8 w-8 items-center justify-center rounded-full bg-blue-600 text-xs font-medium text-white">
                                                {u.userName.charAt(0).toUpperCase()}
                                            </div>
                                            <div className="flex-1 min-w-0">
                                                <p className="truncate text-sm font-medium text-gray-900">
                                                    {u.userName}
                                                </p>
                                                <div className="flex items-center gap-1">
                                                    <div
                                                        className="h-2 w-2 rounded-full"
                                                        style={{ backgroundColor: u.leaveTypeColor }}
                                                    />
                                                    <p className="text-xs text-gray-500">{u.leaveTypeName}</p>
                                                </div>
                                            </div>
                                        </div>
                                    ))}
                                </div>
                            ) : (
                                <p className="py-4 text-center text-sm text-gray-500">
                                    No one on leave today
                                </p>
                            )}
                        </CardContent>
                    </Card>

                    {/* WFH Today */}
                    <Card>
                        <CardHeader>
                            <CardTitle className="flex items-center gap-2">
                                <Home className="h-5 w-5 text-green-600" />
                                WFH Today
                            </CardTitle>
                        </CardHeader>
                        <CardContent>
                            <div className="flex items-center gap-3 py-2">
                                <div className="rounded-lg bg-green-100 p-3">
                                    <Laptop className="h-6 w-6 text-green-600" />
                                </div>
                                <div>
                                    <p className="text-2xl font-bold text-gray-900">
                                        {data?.usersWfhTodayCount ?? 0}
                                    </p>
                                    <p className="text-sm text-gray-500">employees working from home</p>
                                </div>
                            </div>
                        </CardContent>
                    </Card>

                    {/* Upcoming Holidays */}
                    <Card>
                        <CardHeader>
                            <CardTitle className="flex items-center gap-2">
                                <Calendar className="h-5 w-5 text-purple-600" />
                                Upcoming Holidays
                            </CardTitle>
                        </CardHeader>
                        <CardContent>
                            {data?.upcomingHolidays && data.upcomingHolidays.length > 0 ? (
                                <div className="space-y-3">
                                    {data.upcomingHolidays.map((h) => (
                                        <div key={h.id} className="flex items-start gap-3">
                                            <div className="mt-0.5 rounded bg-purple-100 px-2 py-1 text-xs font-medium text-purple-700">
                                                {new Date(h.date).toLocaleDateString('en-US', {
                                                    month: 'short',
                                                    day: 'numeric',
                                                })}
                                            </div>
                                            <div>
                                                <p className="text-sm font-medium text-gray-900">{h.name}</p>
                                                <p className="text-xs text-gray-500">{h.country}</p>
                                            </div>
                                        </div>
                                    ))}
                                </div>
                            ) : (
                                <p className="py-4 text-center text-sm text-gray-500">
                                    No upcoming holidays
                                </p>
                            )}
                        </CardContent>
                    </Card>

                    {/* Quick Actions (Admin) */}
                    <Card>
                        <CardHeader>
                            <CardTitle>Quick Actions</CardTitle>
                        </CardHeader>
                        <CardContent className="grid grid-cols-2 gap-3">
                            {can('users.view') && (
                                <Button asChild variant="outline" className="justify-start">
                                    <Link to="/users">
                                        <Users className="mr-2 h-4 w-4" />
                                        Users
                                    </Link>
                                </Button>
                            )}
                            {can('teams.view') && (
                                <Button asChild variant="outline" className="justify-start">
                                    <Link to="/teams">
                                        <UsersRound className="mr-2 h-4 w-4" />
                                        Teams
                                    </Link>
                                </Button>
                            )}
                            {can('leaves.approve') && (
                                <Button asChild variant="outline" className="justify-start">
                                    <Link to="/leaves/management">
                                        <CheckCircle2 className="mr-2 h-4 w-4" />
                                        Approvals
                                    </Link>
                                </Button>
                            )}
                            {can('users.view') && (
                                <Button asChild variant="outline" className="justify-start">
                                    <Link to="/users/pending-approvals">
                                        <UserCheck className="mr-2 h-4 w-4" />
                                        Pending Accts
                                    </Link>
                                </Button>
                            )}
                        </CardContent>
                    </Card>
                </div>
            </div>
        </div>
    );
}

// ---------------------------------------------------------------------------
// Main Dashboard Page
// ---------------------------------------------------------------------------

export default function Dashboard() {
    const { user } = useAuth();
    const { can } = usePermission();
    const canViewAdmin = can('users.view');

    const [activeTab, setActiveTab] = useState<string>('my');

    const { data: myData, isLoading: myLoading } = useQuery({
        queryKey: ['dashboard', 'my'],
        queryFn: () => apiGet<MyDashboardResponse>('/dashboard/my'),
    });

    const { data: adminData, isLoading: adminLoading } = useQuery({
        queryKey: ['dashboard', 'admin'],
        queryFn: () => apiGet<AdminDashboardResponse>('/dashboard/admin'),
        enabled: activeTab === 'admin' && canViewAdmin,
    });

    return (
        <>
            <Helmet>
                <title>Dashboard</title>
            </Helmet>

            {/* Header */}
            <div className="border-b border-gray-200 bg-white">
                <div className="px-4 py-4 sm:px-6 sm:py-6 lg:px-8">
                    <div className="flex items-center gap-3">
                        <div className="hidden rounded-lg bg-blue-100 p-2 lg:block">
                            <LayoutDashboard className="h-6 w-6 text-blue-600" />
                        </div>
                        <div>
                            <h2 className="text-2xl font-bold text-gray-900 lg:text-3xl">
                                Welcome back, {user?.firstName || user?.name}!
                            </h2>
                            <p className="mt-0.5 text-sm text-gray-600 lg:mt-1 lg:text-base">
                                Here's what's happening with your account
                            </p>
                        </div>
                    </div>
                </div>
            </div>

            <div className="mx-auto max-w-7xl px-4 py-8 sm:px-6 lg:px-8">
                {canViewAdmin ? (
                    <Tabs value={activeTab} onValueChange={setActiveTab}>
                        <TabsList className="mb-6">
                            <TabsTrigger value="my">My Dashboard</TabsTrigger>
                            <TabsTrigger value="admin">Admin Overview</TabsTrigger>
                        </TabsList>
                        <TabsContent value="my">
                            <MyDashboardTab data={myData} isLoading={myLoading} />
                        </TabsContent>
                        <TabsContent value="admin">
                            <AdminDashboardTab data={adminData} isLoading={adminLoading} />
                        </TabsContent>
                    </Tabs>
                ) : (
                    <MyDashboardTab data={myData} isLoading={myLoading} />
                )}
            </div>
        </>
    );
}
