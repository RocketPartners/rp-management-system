// resources/js/Pages/Employees/Leaves/MyLeaves.jsx
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
import { Progress } from '@/Components/ui/progress';
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
    Edit2,
    Eye,
    MoreVertical,
    Plus,
    X,
    XCircle,
} from 'lucide-react';
import { useState } from 'react';

export default function MyLeaves({
    auth,
    leaveRequests,
    leaveBalances,
    availableYears,
    currentYear,
    filters,
}) {
    const [status, setStatus] = useState(filters.status || 'all');
    const [year, setYear] = useState(filters.year || currentYear);
    const { flash } = usePage().props;

    const handleFilter = () => {
        const params = {};
        if (status && status !== 'all') params.status = status;
        if (year) params.year = year;

        router.get(route('my-leaves.index'), params, {
            preserveState: true,
        });
    };

    const handleReset = () => {
        setStatus('all');
        setYear(currentYear);
        router.get(route('my-leaves.index'));
    };

    const handleCancel = (leave) => {
        if (confirm('Are you sure you want to cancel this leave request?')) {
            router.post(route('my-leaves.cancel', leave.id));
        }
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
            cancelled: {
                bg: 'bg-gray-100',
                text: 'text-gray-700',
                border: 'border-gray-200',
                icon: XCircle,
            },
        };
        return styles[status] || styles.pending_manager;
    };

    const hasFilters = status !== 'all' || year !== currentYear;

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
                                My Leave Requests
                            </h2>
                            <p className="mt-1 text-gray-600">
                                View and manage your leave requests
                            </p>
                        </div>
                    </div>
                    <Button asChild className="bg-blue-600 hover:bg-blue-700">
                        <Link href={route('my-leaves.apply')}>
                            <Plus className="mr-2 h-4 w-4" />
                            Apply for Leave
                        </Link>
                    </Button>
                </div>
            }
        >
            <Head title="My Leaves" />

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
                {flash?.error && (
                    <Alert className="animate-fade-in border-red-200 bg-red-50">
                        <AlertCircle className="h-4 w-4 text-red-600" />
                        <AlertDescription className="font-medium text-red-800">
                            {flash.error}
                        </AlertDescription>
                    </Alert>
                )}

                {/* Leave Balance Summary */}
                {leaveBalances && leaveBalances.length > 0 && (
                    <div className="animate-fade-in grid grid-cols-1 gap-6 md:grid-cols-2 lg:grid-cols-4">
                        {leaveBalances.map((balance) => (
                            <Card key={balance.id}>
                                <CardContent className="pt-6">
                                    <div className="space-y-3">
                                        <div className="flex items-center justify-between">
                                            <div
                                                className="h-3 w-3 rounded-full"
                                                style={{
                                                    backgroundColor:
                                                        balance.leave_type
                                                            .color,
                                                }}
                                            />
                                            <Badge
                                                variant="outline"
                                                className="text-xs"
                                            >
                                                {balance.leave_type.code}
                                            </Badge>
                                        </div>
                                        <div>
                                            <p className="text-sm text-gray-600">
                                                {balance.leave_type.name}
                                            </p>
                                            <div className="mt-1 flex items-baseline gap-2">
                                                <span
                                                    className={`text-3xl font-bold ${balance.remaining_days < 3 ? 'text-red-600' : 'text-gray-900'}`}
                                                >
                                                    {balance.remaining_days}
                                                </span>
                                                <span className="text-gray-500">
                                                    / {balance.total_days}
                                                </span>
                                            </div>
                                            <p className="mt-1 text-xs text-gray-500">
                                                days remaining
                                            </p>
                                        </div>
                                        <Progress
                                            value={
                                                (balance.remaining_days /
                                                    balance.total_days) *
                                                100
                                            }
                                            className="h-2"
                                        />
                                    </div>
                                </CardContent>
                            </Card>
                        ))}
                    </div>
                )}

                {/* Filters */}
                <Card className="animate-fade-in animation-delay-100 shadow-sm">
                    <CardContent className="pt-6">
                        <div className="flex flex-wrap items-end gap-3">
                            <div className="min-w-[200px] flex-1 space-y-1.5">
                                <label className="text-sm font-medium text-gray-700">
                                    Year
                                </label>
                                <Select
                                    value={year.toString()}
                                    onValueChange={(value) =>
                                        setYear(parseInt(value))
                                    }
                                >
                                    <SelectTrigger className="h-10">
                                        <SelectValue />
                                    </SelectTrigger>
                                    <SelectContent>
                                        {availableYears &&
                                            availableYears.map((y) => (
                                                <SelectItem
                                                    key={y}
                                                    value={y.toString()}
                                                >
                                                    {y}
                                                </SelectItem>
                                            ))}
                                        {(!availableYears ||
                                            availableYears.length === 0) && (
                                            <SelectItem
                                                value={currentYear.toString()}
                                            >
                                                {currentYear}
                                            </SelectItem>
                                        )}
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
                                        <SelectValue />
                                    </SelectTrigger>
                                    <SelectContent>
                                        <SelectItem value="all">
                                            All Status
                                        </SelectItem>
                                        <SelectItem value="pending_manager">
                                            Pending Review
                                        </SelectItem>
                                        <SelectItem value="pending_hr">
                                            Pending HR
                                        </SelectItem>
                                        <SelectItem value="approved">
                                            Approved
                                        </SelectItem>
                                        <SelectItem value="rejected_by_manager">
                                            Rejected
                                        </SelectItem>
                                        <SelectItem value="rejected_by_hr">
                                            Rejected by HR
                                        </SelectItem>
                                        <SelectItem value="cancelled">
                                            Cancelled
                                        </SelectItem>
                                    </SelectContent>
                                </Select>
                            </div>

                            <div className="flex gap-2">
                                <Button
                                    onClick={handleFilter}
                                    className="h-10 bg-blue-600 hover:bg-blue-700"
                                >
                                    Apply Filters
                                </Button>
                                {hasFilters && (
                                    <Button
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

                        <div className="mt-4 border-t pt-4 text-sm text-gray-600">
                            Showing{' '}
                            <span className="font-semibold text-gray-900">
                                {leaveRequests?.total || 0}
                            </span>{' '}
                            {leaveRequests?.total === 1
                                ? 'request'
                                : 'requests'}
                        </div>
                    </CardContent>
                </Card>

                {/* Leave Requests Table */}
                <Card className="animate-fade-in animation-delay-200 shadow-sm">
                    <div className="overflow-x-auto">
                        <Table>
                            <TableHeader>
                                <TableRow className="bg-gray-50 hover:bg-gray-50">
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
                                        Reviewed By
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
                                    leaveRequests.data.map((leave) => {
                                        const statusStyle = getStatusBadge(
                                            leave.status,
                                        );
                                        const StatusIcon = statusStyle.icon;
                                        const canCancel = [
                                            'pending_manager',
                                            'pending_hr',
                                        ].includes(leave.status);
                                        const canEdit =
                                            leave.status === 'pending_manager';

                                        return (
                                            <TableRow
                                                key={leave.id}
                                                className="hover:bg-gray-50"
                                            >
                                                <TableCell>
                                                    <div className="flex items-center gap-2">
                                                        <div
                                                            className="h-3 w-3 rounded-full"
                                                            style={{
                                                                backgroundColor:
                                                                    leave
                                                                        .leave_type
                                                                        .color,
                                                            }}
                                                        />
                                                        <div>
                                                            <p className="font-medium text-gray-900">
                                                                {
                                                                    leave
                                                                        .leave_type
                                                                        .name
                                                                }
                                                            </p>
                                                            <p className="text-xs text-gray-500">
                                                                {
                                                                    leave
                                                                        .leave_type
                                                                        .code
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
                                                        {leave.status
                                                            .replace(/_/g, ' ')
                                                            .replace(
                                                                /\b\w/g,
                                                                (l) =>
                                                                    l.toUpperCase(),
                                                            )}
                                                    </Badge>
                                                </TableCell>
                                                <TableCell>
                                                    {leave.manager_approver ? (
                                                        <div className="flex items-center gap-2">
                                                            <div className="flex h-8 w-8 items-center justify-center rounded-full bg-gray-600">
                                                                <span className="text-xs font-medium text-white">
                                                                    {leave.manager_approver.name
                                                                        .charAt(
                                                                            0,
                                                                        )
                                                                        .toUpperCase()}
                                                                </span>
                                                            </div>
                                                            <span className="text-sm text-gray-900">
                                                                {
                                                                    leave
                                                                        .manager_approver
                                                                        .name
                                                                }
                                                            </span>
                                                        </div>
                                                    ) : leave.status ===
                                                      'pending_manager' ? (
                                                        <span className="text-sm text-gray-400">
                                                            Pending
                                                        </span>
                                                    ) : (
                                                        <span className="text-sm text-gray-400">
                                                            —
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
                                                                        'my-leaves.show',
                                                                        leave.id,
                                                                    )}
                                                                    className="cursor-pointer"
                                                                >
                                                                    <Eye className="mr-2 h-4 w-4" />
                                                                    View Details
                                                                </Link>
                                                            </DropdownMenuItem>

                                                            {canEdit && (
                                                                <DropdownMenuItem
                                                                    asChild
                                                                >
                                                                    <Link
                                                                        href={route(
                                                                            'my-leaves.edit',
                                                                            leave.id,
                                                                        )}
                                                                        className="cursor-pointer"
                                                                    >
                                                                        <Edit2 className="mr-2 h-4 w-4" />
                                                                        Edit
                                                                        Request
                                                                    </Link>
                                                                </DropdownMenuItem>
                                                            )}

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

                                                            {canCancel && (
                                                                <>
                                                                    <DropdownMenuSeparator />
                                                                    <DropdownMenuItem
                                                                        onClick={() =>
                                                                            handleCancel(
                                                                                leave,
                                                                            )
                                                                        }
                                                                        className="cursor-pointer text-red-600 focus:bg-red-50 focus:text-red-600"
                                                                    >
                                                                        <XCircle className="mr-2 h-4 w-4" />
                                                                        Cancel
                                                                        Request
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
                                            colSpan={6}
                                            className="py-16 text-center"
                                        >
                                            <div className="flex flex-col items-center">
                                                <div className="mb-4 rounded-full bg-gray-100 p-4">
                                                    <Calendar className="h-12 w-12 text-gray-400" />
                                                </div>
                                                <p className="mb-1 text-lg font-medium text-gray-900">
                                                    No leave requests found
                                                </p>
                                                <p className="mb-4 text-sm text-gray-500">
                                                    {hasFilters
                                                        ? 'Try adjusting your filters'
                                                        : 'Apply for your first leave'}
                                                </p>
                                                <Button
                                                    asChild
                                                    className="bg-blue-600 hover:bg-blue-700"
                                                >
                                                    <Link
                                                        href={route(
                                                            'my-leaves.apply',
                                                        )}
                                                    >
                                                        <Plus className="mr-2 h-4 w-4" />
                                                        Apply for Leave
                                                    </Link>
                                                </Button>
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
