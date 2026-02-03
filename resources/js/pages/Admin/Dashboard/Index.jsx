// resources/js/Pages/Admin/Dashboard/Index.jsx
import { Badge } from '@/Components/ui/badge';
import { Button } from '@/Components/ui/button';
import {
    Card,
    CardContent,
    CardDescription,
    CardHeader,
    CardTitle,
} from '@/Components/ui/card';
import AuthenticatedLayout from '@/Layouts/AuthenticatedLayout';
import { Head, Link } from '@inertiajs/react';
import {
    AlertTriangle,
    ArrowRight,
    Calendar,
    CheckCircle2,
    Clock,
    Eye,
    FileText,
    FolderKanban,
    Megaphone,
    Package,
    UserCheck,
    Users,
} from 'lucide-react';

export default function Dashboard({
    auth,
    stats,
    lowStockItems,
    recentTasks,
    projectsByStatus,
    inventoryByCategory,
    leaveStats,
    pendingLeaveApprovals,
    upcomingLeaves,
    announcements,
}) {
    const statCards = [
        {
            title: 'Total Users',
            value: stats.total_users,
            icon: Users,
            color: 'bg-blue-500',
            href: '/users',
        },
        {
            title: 'Inventory Items',
            value: stats.total_inventory,
            icon: Package,
            color: 'bg-green-500',
            href: '/inventory',
        },
        {
            title: 'Active Projects',
            value: `${stats.active_projects}/${stats.total_projects}`,
            icon: FolderKanban,
            color: 'bg-purple-500',
            href: '/projects',
        },
        {
            title: 'Low Stock Alerts',
            value: stats.low_stock_items,
            icon: AlertTriangle,
            color: 'bg-red-500',
            href: '/inventory?filter=low-stock',
        },
    ];

    // Leave management stats cards
    const leaveStatCards = [
        {
            title: 'Pending Manager',
            value: leaveStats?.pending_manager || 0,
            icon: Clock,
            color: 'bg-yellow-500',
            href: '/leaves?status=pending_manager',
        },
        {
            title: 'Pending HR',
            value: leaveStats?.pending_hr || 0,
            icon: UserCheck,
            color: 'bg-blue-500',
            href: '/leaves?status=pending_hr',
        },
        {
            title: 'Pending Cancellation',
            value: leaveStats?.pending_cancellation || 0,
            icon: AlertTriangle,
            color: 'bg-orange-500',
            href: '/leaves?status=pending_cancellation',
        },
        {
            title: 'This Month',
            value: leaveStats?.this_month || 0,
            icon: Calendar,
            color: 'bg-green-500',
            href: '/leaves',
        },
    ];

    const getStatusColor = (status) => {
        const colors = {
            todo: 'bg-gray-100 text-gray-800',
            in_progress: 'bg-blue-100 text-blue-800',
            review: 'bg-yellow-100 text-yellow-800',
            completed: 'bg-green-100 text-green-800',
            planning: 'bg-purple-100 text-purple-800',
            on_hold: 'bg-orange-100 text-orange-800',
        };
        return colors[status] || 'bg-gray-100 text-gray-800';
    };

    const getLeaveStatusBadge = (status) => {
        const styles = {
            pending_manager: {
                bg: 'bg-yellow-100',
                text: 'text-yellow-700',
                border: 'border-yellow-200',
            },
            pending_hr: {
                bg: 'bg-blue-100',
                text: 'text-blue-700',
                border: 'border-blue-200',
            },
            approved: {
                bg: 'bg-green-100',
                text: 'text-green-700',
                border: 'border-green-200',
            },
            pending_cancellation: {
                bg: 'bg-orange-100',
                text: 'text-orange-700',
                border: 'border-orange-200',
            },
        };
        return styles[status] || styles.pending_manager;
    };

    return (
        <AuthenticatedLayout
            header={
                <div className="flex items-center justify-between">
                    <div>
                        <h2 className="text-3xl font-bold text-gray-900">
                            Dashboard
                        </h2>
                        <p className="mt-1 text-gray-600">
                            Welcome back, {auth.user.name}!
                        </p>
                    </div>
                </div>
            }
        >
            <Head title="Dashboard" />

            <div className="space-y-6">
                {/* Main Stats Cards */}
                <div className="animate-fade-in grid grid-cols-1 gap-6 md:grid-cols-2 lg:grid-cols-4">
                    {statCards.map((stat, index) => {
                        const Icon = stat.icon;
                        return (
                            <Link
                                key={stat.title}
                                href={stat.href}
                                className={`animate-fade-in-up block animation-delay-${(index + 1) * 100}`}
                            >
                                <Card
                                    className="border-l-4 transition-shadow duration-300 hover:shadow-lg"
                                    style={{
                                        borderLeftColor: stat.color.replace(
                                            'bg-',
                                            '#',
                                        ),
                                    }}
                                >
                                    <CardContent className="pt-6">
                                        <div className="flex items-center justify-between">
                                            <div>
                                                <p className="text-sm font-medium text-gray-600">
                                                    {stat.title}
                                                </p>
                                                <p className="mt-2 text-3xl font-bold text-gray-900">
                                                    {stat.value}
                                                </p>
                                            </div>
                                            <div
                                                className={`${stat.color} rounded-lg p-3`}
                                            >
                                                <Icon className="h-6 w-6 text-white" />
                                            </div>
                                        </div>
                                    </CardContent>
                                </Card>
                            </Link>
                        );
                    })}
                </div>

                {/* Leave Management Stats */}
                <div className="animate-fade-in animation-delay-400">
                    <div className="mb-4 flex items-center justify-between">
                        <h3 className="flex items-center gap-2 text-xl font-semibold text-gray-900">
                            <Calendar className="h-5 w-5 text-blue-600" />
                            Leave Management Overview
                        </h3>
                        <Button asChild variant="outline" size="sm">
                            <Link href={route('leaves.index')}>
                                View All Leaves
                                <ArrowRight className="ml-2 h-4 w-4" />
                            </Link>
                        </Button>
                    </div>
                    <div className="grid grid-cols-1 gap-6 md:grid-cols-2 lg:grid-cols-4">
                        {leaveStatCards.map((stat, index) => {
                            const Icon = stat.icon;
                            return (
                                <Link
                                    key={stat.title}
                                    href={stat.href}
                                    className={`animate-fade-in-up block animation-delay-${(index + 5) * 100}`}
                                >
                                    <Card className="transition-shadow duration-300 hover:shadow-lg">
                                        <CardContent className="pt-6">
                                            <div className="flex items-center justify-between">
                                                <div>
                                                    <p className="text-sm font-medium text-gray-600">
                                                        {stat.title}
                                                    </p>
                                                    <p className="mt-2 text-3xl font-bold text-gray-900">
                                                        {stat.value}
                                                    </p>
                                                </div>
                                                <div
                                                    className={`${stat.color} rounded-lg p-3`}
                                                >
                                                    <Icon className="h-6 w-6 text-white" />
                                                </div>
                                            </div>
                                        </CardContent>
                                    </Card>
                                </Link>
                            );
                        })}
                    </div>
                </div>

                {/* Announcements & Upcoming Leaves Row */}
                <div className="grid grid-cols-1 gap-6 lg:grid-cols-2">
                    {/* Announcements */}
                    <Card className="animate-fade-in animation-delay-500">
                        <CardHeader>
                            <div className="flex items-center justify-between">
                                <div>
                                    <CardTitle className="flex items-center gap-2">
                                        <Megaphone className="h-5 w-5 text-purple-600" />
                                        Recent Announcements
                                    </CardTitle>
                                    <CardDescription>
                                        Latest company updates
                                    </CardDescription>
                                </div>
                            </div>
                        </CardHeader>
                        <CardContent>
                            {announcements && announcements.length > 0 ? (
                                <div className="space-y-3">
                                    {announcements
                                        .slice(0, 4)
                                        .map((announcement) => (
                                            <div
                                                key={announcement.id}
                                                className="block rounded-lg border border-gray-200 bg-gray-50 p-4"
                                            >
                                                <div className="flex items-start justify-between gap-3">
                                                    <div className="min-w-0 flex-1">
                                                        <h4 className="truncate font-medium text-gray-900">
                                                            {announcement.title}
                                                        </h4>
                                                        {announcement.body && (
                                                            <p className="mt-1 line-clamp-2 text-sm text-gray-600">
                                                                {
                                                                    announcement.body
                                                                }
                                                            </p>
                                                        )}
                                                        <div className="mt-2 flex items-center gap-3 text-xs text-gray-500">
                                                            <span>
                                                                {new Date(
                                                                    announcement.published_at ||
                                                                        announcement.created_at,
                                                                ).toLocaleDateString()}
                                                            </span>
                                                            {announcement.creator && (
                                                                <>
                                                                    <span>
                                                                        •
                                                                    </span>
                                                                    <span>
                                                                        By{' '}
                                                                        {
                                                                            announcement
                                                                                .creator
                                                                                .name
                                                                        }
                                                                    </span>
                                                                </>
                                                            )}
                                                            {announcement.attachments &&
                                                                announcement
                                                                    .attachments
                                                                    .length >
                                                                    0 && (
                                                                    <>
                                                                        <span>
                                                                            •
                                                                        </span>
                                                                        <span className="flex items-center gap-1">
                                                                            <FileText className="h-3 w-3" />
                                                                            {
                                                                                announcement
                                                                                    .attachments
                                                                                    .length
                                                                            }{' '}
                                                                            attachment
                                                                            {announcement
                                                                                .attachments
                                                                                .length !==
                                                                            1
                                                                                ? 's'
                                                                                : ''}
                                                                        </span>
                                                                    </>
                                                                )}
                                                        </div>
                                                    </div>
                                                    <Eye className="h-4 w-4 flex-shrink-0 text-gray-400" />
                                                </div>
                                            </div>
                                        ))}
                                </div>
                            ) : (
                                <div className="py-8 text-center text-gray-500">
                                    <Megaphone className="mx-auto mb-2 h-12 w-12 text-gray-400" />
                                    <p className="mb-3">No announcements yet</p>
                                    <p className="text-sm text-gray-600">
                                        Announcements feature coming soon!
                                    </p>
                                </div>
                            )}
                        </CardContent>
                    </Card>

                    {/* Upcoming Leaves */}
                    <Card className="animate-fade-in animation-delay-600">
                        <CardHeader>
                            <div className="flex items-center justify-between">
                                <div>
                                    <CardTitle className="flex items-center gap-2">
                                        <Calendar className="h-5 w-5 text-blue-600" />
                                        Upcoming Approved Leaves
                                    </CardTitle>
                                    <CardDescription>
                                        Employees scheduled to be on leave
                                    </CardDescription>
                                </div>
                            </div>
                        </CardHeader>
                        <CardContent>
                            {upcomingLeaves && upcomingLeaves.length > 0 ? (
                                <div className="space-y-3">
                                    {upcomingLeaves.slice(0, 5).map((leave) => (
                                        <Link
                                            key={leave.id}
                                            href={route(
                                                'leaves.show',
                                                leave.id,
                                            )}
                                            className="block rounded-lg border border-gray-200 bg-gray-50 p-3 transition-colors hover:bg-gray-100"
                                        >
                                            <div className="flex items-center justify-between">
                                                <div className="flex min-w-0 flex-1 items-center gap-3">
                                                    {leave.user
                                                        ?.profile_picture ? (
                                                        <img
                                                            src={`/storage/${leave.user.profile_picture}`}
                                                            alt={
                                                                leave.user.name
                                                            }
                                                            className="h-8 w-8 flex-shrink-0 rounded-full object-cover"
                                                        />
                                                    ) : (
                                                        <div className="flex h-8 w-8 flex-shrink-0 items-center justify-center rounded-full bg-blue-600">
                                                            <span className="text-xs font-medium text-white">
                                                                {leave.user?.name
                                                                    ?.charAt(0)
                                                                    .toUpperCase()}
                                                            </span>
                                                        </div>
                                                    )}
                                                    <div className="min-w-0 flex-1">
                                                        <p className="truncate font-medium text-gray-900">
                                                            {leave.user?.name}
                                                        </p>
                                                        <div className="mt-0.5 flex items-center gap-2">
                                                            <div
                                                                className="h-2 w-2 flex-shrink-0 rounded-full"
                                                                style={{
                                                                    backgroundColor:
                                                                        leave
                                                                            .leave_type
                                                                            ?.color,
                                                                }}
                                                            />
                                                            <p className="truncate text-xs text-gray-600">
                                                                {
                                                                    leave
                                                                        .leave_type
                                                                        ?.code
                                                                }{' '}
                                                                •{' '}
                                                                {
                                                                    leave.total_days
                                                                }{' '}
                                                                {leave.total_days ===
                                                                1
                                                                    ? 'day'
                                                                    : 'days'}
                                                            </p>
                                                        </div>
                                                    </div>
                                                </div>
                                                <div className="ml-3 flex-shrink-0 text-right">
                                                    <p className="text-sm font-medium text-gray-900">
                                                        {new Date(
                                                            leave.start_date,
                                                        ).toLocaleDateString(
                                                            'en-US',
                                                            {
                                                                month: 'short',
                                                                day: 'numeric',
                                                            },
                                                        )}
                                                    </p>
                                                    {leave.start_date !==
                                                        leave.end_date && (
                                                        <p className="text-xs text-gray-500">
                                                            to{' '}
                                                            {new Date(
                                                                leave.end_date,
                                                            ).toLocaleDateString(
                                                                'en-US',
                                                                {
                                                                    month: 'short',
                                                                    day: 'numeric',
                                                                },
                                                            )}
                                                        </p>
                                                    )}
                                                </div>
                                            </div>
                                        </Link>
                                    ))}
                                    <Button
                                        asChild
                                        variant="outline"
                                        className="w-full"
                                    >
                                        <Link
                                            href={route('leaves.index', {
                                                status: 'approved',
                                            })}
                                        >
                                            View All Approved Leaves
                                            <ArrowRight className="ml-2 h-4 w-4" />
                                        </Link>
                                    </Button>
                                </div>
                            ) : (
                                <div className="py-8 text-center text-gray-500">
                                    <Calendar className="mx-auto mb-2 h-12 w-12 text-gray-400" />
                                    <p>No upcoming leaves scheduled</p>
                                </div>
                            )}
                        </CardContent>
                    </Card>
                </div>

                {/* Pending Leave Approvals & Low Stock Row */}
                <div className="grid grid-cols-1 gap-6 lg:grid-cols-2">
                    {/* Pending Leave Approvals */}
                    <Card className="animate-fade-in animation-delay-700">
                        <CardHeader>
                            <div className="flex items-center justify-between">
                                <div>
                                    <CardTitle className="flex items-center gap-2">
                                        <Clock className="h-5 w-5 text-yellow-600" />
                                        Pending Leave Approvals
                                    </CardTitle>
                                    <CardDescription>
                                        Leaves waiting for your review
                                    </CardDescription>
                                </div>
                                <Badge className="border border-yellow-200 bg-yellow-100 text-yellow-700">
                                    {(leaveStats?.pending_manager || 0) +
                                        (leaveStats?.pending_hr || 0)}
                                </Badge>
                            </div>
                        </CardHeader>
                        <CardContent>
                            {pendingLeaveApprovals &&
                            pendingLeaveApprovals.length > 0 ? (
                                <div className="space-y-3">
                                    {pendingLeaveApprovals
                                        .slice(0, 5)
                                        .map((leave) => {
                                            const statusStyle =
                                                getLeaveStatusBadge(
                                                    leave.status,
                                                );
                                            return (
                                                <Link
                                                    key={leave.id}
                                                    href={route(
                                                        'leaves.show',
                                                        leave.id,
                                                    )}
                                                    className="block rounded-lg border border-gray-200 bg-gray-50 p-3 transition-colors hover:bg-gray-100"
                                                >
                                                    <div className="flex items-center justify-between gap-3">
                                                        <div className="flex min-w-0 flex-1 items-center gap-3">
                                                            {leave.user
                                                                ?.profile_picture ? (
                                                                <img
                                                                    src={`/storage/${leave.user.profile_picture}`}
                                                                    alt={
                                                                        leave
                                                                            .user
                                                                            .name
                                                                    }
                                                                    className="h-8 w-8 flex-shrink-0 rounded-full object-cover"
                                                                />
                                                            ) : (
                                                                <div className="flex h-8 w-8 flex-shrink-0 items-center justify-center rounded-full bg-blue-600">
                                                                    <span className="text-xs font-medium text-white">
                                                                        {leave.user?.name
                                                                            ?.charAt(
                                                                                0,
                                                                            )
                                                                            .toUpperCase()}
                                                                    </span>
                                                                </div>
                                                            )}
                                                            <div className="min-w-0 flex-1">
                                                                <p className="truncate font-medium text-gray-900">
                                                                    {
                                                                        leave
                                                                            .user
                                                                            ?.name
                                                                    }
                                                                </p>
                                                                <p className="text-xs text-gray-600">
                                                                    {
                                                                        leave
                                                                            .leave_type
                                                                            ?.name
                                                                    }{' '}
                                                                    •{' '}
                                                                    {
                                                                        leave.total_days
                                                                    }{' '}
                                                                    {leave.total_days ===
                                                                    1
                                                                        ? 'day'
                                                                        : 'days'}
                                                                </p>
                                                            </div>
                                                        </div>
                                                        <Badge
                                                            className={`${statusStyle.bg} ${statusStyle.text} ${statusStyle.border} flex-shrink-0 border text-xs`}
                                                        >
                                                            {leave.status ===
                                                            'pending_manager'
                                                                ? 'Manager'
                                                                : 'HR'}
                                                        </Badge>
                                                    </div>
                                                </Link>
                                            );
                                        })}
                                    <Button
                                        asChild
                                        variant="outline"
                                        className="w-full"
                                    >
                                        <Link
                                            href={route('leaves.index', {
                                                status: 'pending_hr',
                                            })}
                                        >
                                            View All Pending Leaves
                                            <ArrowRight className="ml-2 h-4 w-4" />
                                        </Link>
                                    </Button>
                                </div>
                            ) : (
                                <div className="py-8 text-center text-gray-500">
                                    <CheckCircle2 className="mx-auto mb-2 h-12 w-12 text-green-500" />
                                    <p>All caught up! No pending approvals</p>
                                </div>
                            )}
                        </CardContent>
                    </Card>

                    {/* Low Stock Alerts */}
                    <Card className="animate-fade-in animation-delay-800">
                        <CardHeader>
                            <div className="flex items-center justify-between">
                                <div>
                                    <CardTitle className="flex items-center gap-2">
                                        <AlertTriangle className="h-5 w-5 text-red-500" />
                                        Low Stock Alerts
                                    </CardTitle>
                                    <CardDescription>
                                        Items that need restocking
                                    </CardDescription>
                                </div>
                                <span className="text-2xl font-bold text-red-500">
                                    {stats.low_stock_items}
                                </span>
                            </div>
                        </CardHeader>
                        <CardContent>
                            {lowStockItems.length > 0 ? (
                                <div className="space-y-3">
                                    {lowStockItems.map((item) => (
                                        <div
                                            key={item.id}
                                            className="flex items-center justify-between rounded-lg border border-red-100 bg-red-50 p-3"
                                        >
                                            <div>
                                                <p className="font-medium text-gray-900">
                                                    {item.name}
                                                </p>
                                                <p className="text-sm text-gray-600">
                                                    {item.category?.name}
                                                </p>
                                            </div>
                                            <div className="text-right">
                                                <p className="text-sm font-medium text-red-600">
                                                    {item.quantity} /{' '}
                                                    {item.min_quantity}
                                                </p>
                                                <p className="text-xs text-gray-500">
                                                    {item.unit}
                                                </p>
                                            </div>
                                        </div>
                                    ))}
                                    <Button
                                        asChild
                                        variant="outline"
                                        className="w-full"
                                    >
                                        <Link href="/inventory?filter=low-stock">
                                            View All Alerts
                                            <ArrowRight className="ml-2 h-4 w-4" />
                                        </Link>
                                    </Button>
                                </div>
                            ) : (
                                <div className="py-8 text-center text-gray-500">
                                    <CheckCircle2 className="mx-auto mb-2 h-12 w-12 text-green-500" />
                                    <p>All items are well stocked!</p>
                                </div>
                            )}
                        </CardContent>
                    </Card>
                </div>

                {/* Charts Row - Projects & Inventory */}
                <div className="grid grid-cols-1 gap-6 lg:grid-cols-2">
                    {/* Project Status */}
                    <Card className="animate-fade-in animation-delay-900">
                        <CardHeader>
                            <CardTitle>Project Status</CardTitle>
                            <CardDescription>
                                Overview of all projects by status
                            </CardDescription>
                        </CardHeader>
                        <CardContent>
                            <div className="space-y-4">
                                {projectsByStatus.map((project) => (
                                    <div
                                        key={project.status}
                                        className="flex items-center justify-between"
                                    >
                                        <div className="flex items-center gap-3">
                                            <div className="h-3 w-3 rounded-full bg-blue-500"></div>
                                            <span className="text-sm font-medium capitalize">
                                                {project.status.replace(
                                                    '_',
                                                    ' ',
                                                )}
                                            </span>
                                        </div>
                                        <span className="text-2xl font-bold text-gray-900">
                                            {project.count}
                                        </span>
                                    </div>
                                ))}
                            </div>
                            <Button
                                asChild
                                variant="outline"
                                className="mt-4 w-full"
                            >
                                <Link href="/projects">
                                    View All Projects
                                    <ArrowRight className="ml-2 h-4 w-4" />
                                </Link>
                            </Button>
                        </CardContent>
                    </Card>

                    {/* Inventory by Category */}
                    <Card className="animate-fade-in animation-delay-1000">
                        <CardHeader>
                            <CardTitle>Inventory Categories</CardTitle>
                            <CardDescription>
                                Items grouped by category
                            </CardDescription>
                        </CardHeader>
                        <CardContent>
                            <div className="space-y-4">
                                {inventoryByCategory.map((category) => (
                                    <div
                                        key={category.name}
                                        className="flex items-center justify-between"
                                    >
                                        <div className="flex items-center gap-3">
                                            <div
                                                className="h-3 w-3 rounded-full"
                                                style={{
                                                    backgroundColor:
                                                        category.color,
                                                }}
                                            ></div>
                                            <span className="text-sm font-medium">
                                                {category.name}
                                            </span>
                                        </div>
                                        <span className="text-2xl font-bold text-gray-900">
                                            {category.count}
                                        </span>
                                    </div>
                                ))}
                            </div>
                            <Button
                                asChild
                                variant="outline"
                                className="mt-4 w-full"
                            >
                                <Link href="/inventory">
                                    View Inventory
                                    <ArrowRight className="ml-2 h-4 w-4" />
                                </Link>
                            </Button>
                        </CardContent>
                    </Card>
                </div>
            </div>
        </AuthenticatedLayout>
    );
}
