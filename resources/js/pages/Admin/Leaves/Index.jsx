// resources/js/Pages/Admin/Leaves/Index.jsx
import { Alert, AlertDescription } from '@/Components/ui/alert';
import { Badge } from '@/Components/ui/badge';
import { Button } from '@/Components/ui/button';
import { Card, CardContent } from '@/Components/ui/card';
import {
    DropdownMenu,
    DropdownMenuContent,
    DropdownMenuItem,
    DropdownMenuSeparator,
    DropdownMenuTrigger,
} from '@/Components/ui/dropdown-menu';
import { Input } from '@/Components/ui/input';
import {
    Select,
    SelectContent,
    SelectItem,
    SelectTrigger,
    SelectValue,
} from '@/Components/ui/select';
import {
    Table,
    TableBody,
    TableCell,
    TableHead,
    TableHeader,
    TableRow,
} from '@/Components/ui/table';
import AuthenticatedLayout from '@/Layouts/AuthenticatedLayout';
import { Head, Link, router, usePage } from '@inertiajs/react';
import {
    AlertCircle,
    Calendar,
    CheckCircle2,
    ChevronLeft,
    ChevronRight,
    Clock,
    Download,
    Eye,
    MoreVertical,
    Plus,
    Search,
    X,
    XCircle,
} from 'lucide-react';
import { useState } from 'react';

export default function Index({
    auth,
    leaveRequests,
    leaveTypes,
    users,
    stats,
    filters,
}) {
    const [search, setSearch] = useState(filters.search || '');
    const [status, setStatus] = useState(filters.status || 'all');
    const [leaveType, setLeaveType] = useState(filters.leave_type || 'all');
    const [employee, setEmployee] = useState(filters.employee || 'all');
    const { flash } = usePage().props;

    const handleSearch = (e) => {
        e.preventDefault();
        const params = { search };

        if (status && status !== 'all') params.status = status;
        if (leaveType && leaveType !== 'all') params.leave_type = leaveType;
        if (employee && employee !== 'all') params.employee = employee;

        router.get(route('leaves.index'), params, {
            preserveState: true,
        });
    };

    const handleReset = () => {
        setSearch('');
        setStatus('all');
        setLeaveType('all');
        setEmployee('all');
        router.get(route('leaves.index'));
    };

    const getStatusBadge = (status) => {
        const styles = {
            pending_manager: {
                bg: 'bg-yellow-100',
                text: 'text-yellow-700',
                border: 'border-yellow-200',
                icon: Clock,
            },
            pending_hr: {
                bg: 'bg-blue-100',
                text: 'text-blue-700',
                border: 'border-blue-200',
                icon: Clock,
            },
            approved: {
                bg: 'bg-green-100',
                text: 'text-green-700',
                border: 'border-green-200',
                icon: CheckCircle2,
            },
            rejected_by_manager: {
                bg: 'bg-red-100',
                text: 'text-red-700',
                border: 'border-red-200',
                icon: XCircle,
            },
            rejected_by_hr: {
                bg: 'bg-red-100',
                text: 'text-red-700',
                border: 'border-red-200',
                icon: XCircle,
            },
            appealed: {
                bg: 'bg-orange-100',
                text: 'text-orange-700',
                border: 'border-orange-200',
                icon: AlertCircle,
            },
            cancelled: {
                bg: 'bg-gray-100',
                text: 'text-gray-700',
                border: 'border-gray-200',
                icon: XCircle,
            },
        };
        return styles[status] || styles.pending_manager;
    };

    const getStatusLabel = (status) => {
        const labels = {
            pending_manager: 'Pending Manager',
            pending_hr: 'Pending HR',
            approved: 'Approved',
            rejected_by_manager: 'Rejected (Manager)',
            rejected_by_hr: 'Rejected (HR)',
            appealed: 'Under Appeal',
            cancelled: 'Cancelled',
        };
        return labels[status] || status;
    };

    const hasFilters =
        search || status !== 'all' || leaveType !== 'all' || employee !== 'all';

    return (
        <AuthenticatedLayout
            header={
                <div className="flex items-center justify-between">
                    <div className="flex items-center gap-3">
                        <div className="rounded-lg bg-blue-100 p-2">
                            <Calendar className="h-6 w-6 text-blue-600" />
                        </div>
                        <div>
                            <h2 className="text-3xl font-bold text-gray-900">
                                Leave Management
                            </h2>
                            <p className="mt-1 text-gray-600">
                                Manage all employee leave requests
                            </p>
                        </div>
                    </div>
                    <div className="flex gap-3">
                        <Button
                            asChild
                            className="bg-blue-600 hover:bg-blue-700"
                        >
                            <Link href={route('leaves.apply')}>
                                <Plus className="mr-2 h-4 w-4" />
                                Apply for Leave
                            </Link>
                        </Button>
                    </div>
                </div>
            }
        >
            <Head title="Leave Management" />

            <div className="space-y-6">
                {/* Flash Messages */}
                {flash?.success && (
                    <Alert className="animate-fade-in border-green-200 bg-green-50">
                        <CheckCircle2 className="h-4 w-4 text-green-600" />
                        <AlertDescription className="font-medium text-green-800">
                            {flash.success}
                        </AlertDescription>
                    </Alert>
                )}

                {/* Stats Cards */}
                <div className="animate-fade-in grid grid-cols-1 gap-6 md:grid-cols-4">
                    <Card>
                        <CardContent className="pt-6">
                            <div className="flex items-center justify-between">
                                <div>
                                    <p className="text-sm font-medium text-gray-600">
                                        Total Requests
                                    </p>
                                    <p className="mt-2 text-3xl font-bold text-gray-900">
                                        {stats?.total || 0}
                                    </p>
                                </div>
                                <div className="rounded-lg bg-blue-100 p-3">
                                    <Calendar className="h-6 w-6 text-blue-600" />
                                </div>
                            </div>
                        </CardContent>
                    </Card>

                    <Card>
                        <CardContent className="pt-6">
                            <div className="flex items-center justify-between">
                                <div>
                                    <p className="text-sm font-medium text-gray-600">
                                        Pending HR
                                    </p>
                                    <p className="mt-2 text-3xl font-bold text-blue-600">
                                        {stats?.pending_hr || 0}
                                    </p>
                                </div>
                                <div className="rounded-lg bg-blue-100 p-3">
                                    <Clock className="h-6 w-6 text-blue-600" />
                                </div>
                            </div>
                        </CardContent>
                    </Card>

                    <Card>
                        <CardContent className="pt-6">
                            <div className="flex items-center justify-between">
                                <div>
                                    <p className="text-sm font-medium text-gray-600">
                                        Approved
                                    </p>
                                    <p className="mt-2 text-3xl font-bold text-green-600">
                                        {stats?.approved || 0}
                                    </p>
                                </div>
                                <div className="rounded-lg bg-green-100 p-3">
                                    <CheckCircle2 className="h-6 w-6 text-green-600" />
                                </div>
                            </div>
                        </CardContent>
                    </Card>

                    <Card>
                        <CardContent className="pt-6">
                            <div className="flex items-center justify-between">
                                <div>
                                    <p className="text-sm font-medium text-gray-600">
                                        This Month
                                    </p>
                                    <p className="mt-2 text-3xl font-bold text-purple-600">
                                        {stats?.this_month || 0}
                                    </p>
                                </div>
                                <div className="rounded-lg bg-purple-100 p-3">
                                    <Calendar className="h-6 w-6 text-purple-600" />
                                </div>
                            </div>
                        </CardContent>
                    </Card>
                </div>

                {/* Filters Card */}
                <Card className="animate-fade-in animation-delay-100 shadow-sm">
                    <CardContent className="pt-6">
                        <form onSubmit={handleSearch} className="space-y-4">
                            {/* Search Bar */}
                            <div className="relative">
                                <Search className="absolute left-3 top-1/2 h-5 w-5 -translate-y-1/2 transform text-gray-400" />
                                <Input
                                    type="text"
                                    placeholder="Search by employee name, leave type, or reason..."
                                    value={search}
                                    onChange={(e) => setSearch(e.target.value)}
                                    className="h-11 pl-10 text-base"
                                />
                            </div>

                            {/* Filters */}
                            <div className="flex flex-wrap items-end gap-3">
                                <div className="min-w-[200px] flex-1 space-y-1.5">
                                    <label className="text-sm font-medium text-gray-700">
                                        Employee
                                    </label>
                                    <Select
                                        value={employee}
                                        onValueChange={setEmployee}
                                    >
                                        <SelectTrigger className="h-10">
                                            <SelectValue placeholder="All Employees" />
                                        </SelectTrigger>
                                        <SelectContent>
                                            <SelectItem value="all">
                                                All Employees
                                            </SelectItem>
                                            {users &&
                                                users.map((user) => (
                                                    <SelectItem
                                                        key={user.id}
                                                        value={user.id.toString()}
                                                    >
                                                        {user.name}
                                                    </SelectItem>
                                                ))}
                                        </SelectContent>
                                    </Select>
                                </div>

                                <div className="min-w-[200px] flex-1 space-y-1.5">
                                    <label className="text-sm font-medium text-gray-700">
                                        Leave Type
                                    </label>
                                    <Select
                                        value={leaveType}
                                        onValueChange={setLeaveType}
                                    >
                                        <SelectTrigger className="h-10">
                                            <SelectValue placeholder="All Types" />
                                        </SelectTrigger>
                                        <SelectContent>
                                            <SelectItem value="all">
                                                All Types
                                            </SelectItem>
                                            {leaveTypes &&
                                                leaveTypes.map((type) => (
                                                    <SelectItem
                                                        key={type.id}
                                                        value={type.id.toString()}
                                                    >
                                                        {type.name} ({type.code}
                                                        )
                                                    </SelectItem>
                                                ))}
                                        </SelectContent>
                                    </Select>
                                </div>

                                <div className="min-w-[200px] flex-1 space-y-1.5">
                                    <label className="text-sm font-medium text-gray-700">
                                        Status
                                    </label>
                                    <Select
                                        value={status}
                                        onValueChange={setStatus}
                                    >
                                        <SelectTrigger className="h-10">
                                            <SelectValue placeholder="All Status" />
                                        </SelectTrigger>
                                        <SelectContent>
                                            <SelectItem value="all">
                                                All Status
                                            </SelectItem>
                                            <SelectItem value="pending_manager">
                                                Pending Manager
                                            </SelectItem>
                                            <SelectItem value="pending_hr">
                                                Pending HR
                                            </SelectItem>
                                            <SelectItem value="approved">
                                                Approved
                                            </SelectItem>
                                            <SelectItem value="rejected_by_manager">
                                                Rejected by Manager
                                            </SelectItem>
                                            <SelectItem value="rejected_by_hr">
                                                Rejected by HR
                                            </SelectItem>
                                            <SelectItem value="appealed">
                                                Under Appeal
                                            </SelectItem>
                                            <SelectItem value="cancelled">
                                                Cancelled
                                            </SelectItem>
                                        </SelectContent>
                                    </Select>
                                </div>

                                <div className="flex gap-2">
                                    <Button
                                        type="submit"
                                        className="h-10 bg-blue-600 hover:bg-blue-700"
                                    >
                                        <Search className="mr-2 h-4 w-4" />
                                        Search
                                    </Button>
                                    {hasFilters && (
                                        <Button
                                            type="button"
                                            variant="outline"
                                            onClick={handleReset}
                                            className="h-10"
                                        >
                                            <X className="mr-2 h-4 w-4" />
                                            Reset
                                        </Button>
                                    )}
                                </div>
                            </div>

                            <div className="border-t pt-2 text-sm text-gray-600">
                                Showing{' '}
                                <span className="font-semibold text-gray-900">
                                    {leaveRequests?.total || 0}
                                </span>{' '}
                                {leaveRequests?.total === 1
                                    ? 'request'
                                    : 'requests'}
                            </div>
                        </form>
                    </CardContent>
                </Card>

                {/* Table */}
                <Card className="animate-fade-in animation-delay-200 shadow-sm">
                    <div className="overflow-x-auto">
                        <Table>
                            <TableHeader>
                                <TableRow className="bg-gray-50 hover:bg-gray-50">
                                    <TableHead className="font-semibold">
                                        Employee
                                    </TableHead>
                                    <TableHead className="font-semibold">
                                        Leave Type
                                    </TableHead>
                                    <TableHead className="font-semibold">
                                        Dates
                                    </TableHead>
                                    <TableHead className="font-semibold">
                                        Duration
                                    </TableHead>
                                    <TableHead className="font-semibold">
                                        Status
                                    </TableHead>
                                    <TableHead className="font-semibold">
                                        Manager
                                    </TableHead>
                                    <TableHead className="text-right font-semibold">
                                        Actions
                                    </TableHead>
                                </TableRow>
                            </TableHeader>
                            <TableBody>
                                {leaveRequests &&
                                leaveRequests.data &&
                                leaveRequests.data.length > 0 ? (
                                    leaveRequests.data.map((leave, index) => {
                                        const statusStyle = getStatusBadge(
                                            leave.status,
                                        );
                                        const StatusIcon = statusStyle.icon;

                                        return (
                                            <TableRow
                                                key={leave.id}
                                                className={`animate-fade-in-up hover:bg-gray-50 animation-delay-${Math.min((index + 3) * 100, 900)}`}
                                            >
                                                <TableCell className="py-4">
                                                    <div className="flex items-center gap-3">
                                                        {leave.user
                                                            ?.profile_picture ? (
                                                            <img
                                                                src={`/storage/${leave.user.profile_picture}`}
                                                                alt={
                                                                    leave.user
                                                                        .name
                                                                }
                                                                className="h-10 w-10 rounded-full object-cover"
                                                            />
                                                        ) : (
                                                            <div className="flex h-10 w-10 items-center justify-center rounded-full bg-blue-600">
                                                                <span className="text-sm font-medium text-white">
                                                                    {leave.user?.name
                                                                        ?.charAt(
                                                                            0,
                                                                        )
                                                                        .toUpperCase() ||
                                                                        'U'}
                                                                </span>
                                                            </div>
                                                        )}
                                                        <div>
                                                            <p className="font-medium text-gray-900">
                                                                {leave.user
                                                                    ?.name ||
                                                                    'Unknown'}
                                                            </p>
                                                            <p className="text-xs text-gray-500">
                                                                {leave.user
                                                                    ?.position ||
                                                                    leave.user
                                                                        ?.email}
                                                            </p>
                                                        </div>
                                                    </div>
                                                </TableCell>
                                                <TableCell>
                                                    <div className="flex items-center gap-2">
                                                        <div
                                                            className="h-3 w-3 rounded-full"
                                                            style={{
                                                                backgroundColor:
                                                                    leave
                                                                        .leave_type
                                                                        ?.color,
                                                            }}
                                                        />
                                                        <div>
                                                            <p className="font-medium text-gray-900">
                                                                {
                                                                    leave
                                                                        .leave_type
                                                                        ?.name
                                                                }
                                                            </p>
                                                            <p className="text-xs text-gray-500">
                                                                {
                                                                    leave
                                                                        .leave_type
                                                                        ?.code
                                                                }
                                                            </p>
                                                        </div>
                                                    </div>
                                                </TableCell>
                                                <TableCell>
                                                    <div className="text-sm">
                                                        <p className="font-medium text-gray-900">
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
                                                            <p className="text-gray-500">
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
                                                </TableCell>
                                                <TableCell>
                                                    <div className="flex items-center gap-2">
                                                        <Clock className="h-4 w-4 text-gray-400" />
                                                        <span className="text-sm font-medium text-gray-900">
                                                            {leave.total_days}{' '}
                                                            {leave.total_days ===
                                                            1
                                                                ? 'day'
                                                                : 'days'}
                                                        </span>
                                                    </div>
                                                </TableCell>
                                                <TableCell>
                                                    <Badge
                                                        className={`${statusStyle.bg} ${statusStyle.text} ${statusStyle.border} flex w-fit items-center gap-1.5 border`}
                                                    >
                                                        <StatusIcon className="h-3.5 w-3.5" />
                                                        {getStatusLabel(
                                                            leave.status,
                                                        )}
                                                    </Badge>
                                                </TableCell>
                                                <TableCell>
                                                    {leave.manager ? (
                                                        <div className="flex items-center gap-2">
                                                            <div className="flex h-8 w-8 items-center justify-center rounded-full bg-gray-600">
                                                                <span className="text-xs font-medium text-white">
                                                                    {leave.manager.name
                                                                        .charAt(
                                                                            0,
                                                                        )
                                                                        .toUpperCase()}
                                                                </span>
                                                            </div>
                                                            <span className="text-sm text-gray-900">
                                                                {
                                                                    leave
                                                                        .manager
                                                                        .name
                                                                }
                                                            </span>
                                                        </div>
                                                    ) : (
                                                        <span className="text-sm text-gray-400">
                                                            No manager
                                                        </span>
                                                    )}
                                                </TableCell>
                                                <TableCell className="text-right">
                                                    <DropdownMenu>
                                                        <DropdownMenuTrigger
                                                            asChild
                                                        >
                                                            <button className="inline-flex h-8 w-8 items-center justify-center rounded-md transition-colors hover:bg-gray-100">
                                                                <MoreVertical className="h-4 w-4" />
                                                            </button>
                                                        </DropdownMenuTrigger>
                                                        <DropdownMenuContent
                                                            align="end"
                                                            className="w-48"
                                                        >
                                                            <DropdownMenuItem
                                                                asChild
                                                            >
                                                                <Link
                                                                    href={route(
                                                                        'leaves.show',
                                                                        leave.id,
                                                                    )}
                                                                    className="cursor-pointer"
                                                                >
                                                                    <Eye className="mr-2 h-4 w-4" />
                                                                    View Details
                                                                </Link>
                                                            </DropdownMenuItem>

                                                            {leave.attachment && (
                                                                <>
                                                                    <DropdownMenuSeparator />
                                                                    <DropdownMenuItem
                                                                        asChild
                                                                    >
                                                                        <a
                                                                            href={`/storage/${leave.attachment}`}
                                                                            download
                                                                            target="_blank"
                                                                            className="cursor-pointer"
                                                                        >
                                                                            <Download className="mr-2 h-4 w-4" />
                                                                            Download
                                                                            Attachment
                                                                        </a>
                                                                    </DropdownMenuItem>
                                                                </>
                                                            )}
                                                        </DropdownMenuContent>
                                                    </DropdownMenu>
                                                </TableCell>
                                            </TableRow>
                                        );
                                    })
                                ) : (
                                    <TableRow>
                                        <TableCell
                                            colSpan={7}
                                            className="py-16 text-center"
                                        >
                                            <div className="flex flex-col items-center">
                                                <div className="mb-4 rounded-full bg-gray-100 p-4">
                                                    <Calendar className="h-12 w-12 text-gray-400" />
                                                </div>
                                                <p className="mb-1 text-lg font-medium text-gray-900">
                                                    No leave requests found
                                                </p>
                                                <p className="text-sm text-gray-500">
                                                    {hasFilters
                                                        ? 'Try adjusting your filters'
                                                        : 'No leave requests have been submitted yet'}
                                                </p>
                                            </div>
                                        </TableCell>
                                    </TableRow>
                                )}
                            </TableBody>
                        </Table>
                    </div>

                    {/* Pagination */}
                    {leaveRequests &&
                        leaveRequests.data &&
                        leaveRequests.data.length > 0 && (
                            <div className="flex items-center justify-between border-t bg-gray-50 px-6 py-4">
                                <div className="flex items-center gap-2">
                                    <p className="text-sm text-gray-700">
                                        Showing{' '}
                                        <span className="font-medium">
                                            {leaveRequests.from}
                                        </span>{' '}
                                        to{' '}
                                        <span className="font-medium">
                                            {leaveRequests.to}
                                        </span>{' '}
                                        of{' '}
                                        <span className="font-medium">
                                            {leaveRequests.total}
                                        </span>{' '}
                                        results
                                    </p>
                                </div>
                                <div className="flex gap-2">
                                    <Button
                                        variant="outline"
                                        size="sm"
                                        onClick={() =>
                                            router.get(
                                                leaveRequests.prev_page_url,
                                            )
                                        }
                                        disabled={!leaveRequests.prev_page_url}
                                        className="h-9"
                                    >
                                        <ChevronLeft className="mr-1 h-4 w-4" />
                                        Previous
                                    </Button>
                                    <Button
                                        variant="outline"
                                        size="sm"
                                        onClick={() =>
                                            router.get(
                                                leaveRequests.next_page_url,
                                            )
                                        }
                                        disabled={!leaveRequests.next_page_url}
                                        className="h-9"
                                    >
                                        Next
                                        <ChevronRight className="ml-1 h-4 w-4" />
                                    </Button>
                                </div>
                            </div>
                        )}
                </Card>
            </div>
        </AuthenticatedLayout>
    );
}
