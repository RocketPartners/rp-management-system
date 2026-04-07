import { Alert, AlertDescription } from '@/components/ui/alert';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import {
    DropdownMenu,
    DropdownMenuContent,
    DropdownMenuItem,
    DropdownMenuSeparator,
    DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import { Progress } from '@/components/ui/progress';
import {
    Select,
    SelectContent,
    SelectItem,
    SelectTrigger,
    SelectValue,
} from '@/components/ui/select';
import {
    Table,
    TableBody,
    TableCell,
    TableHead,
    TableHeader,
    TableRow,
} from '@/components/ui/table';
import { MobileBottomSheet } from '@/components/mobile-nav/MobileBottomSheet';
import { useIsBottomNav } from '@/hooks/use-bottom-nav';
import { apiFetch } from '@/lib/spring-boot-api';
import type {
    LeaveApplicationResponse,
    LeaveBalanceResponse,
    LeaveStatus,
} from '@/types';
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
    Filter,
    MoreVertical,
    Plus,
    X,
    XCircle,
} from 'lucide-react';
import { type LucideIcon } from 'lucide-react';
import { useCallback, useEffect, useState } from 'react';
import { Helmet } from 'react-helmet-async';
import { Link } from 'react-router-dom';

interface StatusStyle {
    bg: string;
    text: string;
    border: string;
    icon: LucideIcon;
}

const STATUS_STYLES: Record<string, StatusStyle> = {
    PENDING_MANAGER: {
        bg: 'bg-yellow-100',
        text: 'text-yellow-700',
        border: 'border-yellow-200',
        icon: Clock,
    },
    PENDING_HR: {
        bg: 'bg-blue-100',
        text: 'text-blue-700',
        border: 'border-blue-200',
        icon: Clock,
    },
    APPROVED: {
        bg: 'bg-green-100',
        text: 'text-green-700',
        border: 'border-green-200',
        icon: CheckCircle2,
    },
    REJECTED_BY_MANAGER: {
        bg: 'bg-red-100',
        text: 'text-red-700',
        border: 'border-red-200',
        icon: XCircle,
    },
    REJECTED_BY_HR: {
        bg: 'bg-red-100',
        text: 'text-red-700',
        border: 'border-red-200',
        icon: XCircle,
    },
    CANCELLED: {
        bg: 'bg-gray-100',
        text: 'text-gray-700',
        border: 'border-gray-200',
        icon: XCircle,
    },
    PENDING_CANCELLATION: {
        bg: 'bg-orange-100',
        text: 'text-orange-700',
        border: 'border-orange-200',
        icon: Clock,
    },
};

const API_BASE_URL = import.meta.env.VITE_SPRING_BOOT_API_URL || '';

export default function MyLeaves() {
    const [leaves, setLeaves] = useState<LeaveApplicationResponse[]>([]);
    const [balances, setBalances] = useState<LeaveBalanceResponse[]>([]);
    const [loading, setLoading] = useState<boolean>(true);
    const [status, setStatus] = useState<string>('all');
    const [year, setYear] = useState<number>(new Date().getFullYear());
    const [page, setPage] = useState<number>(0);
    const [totalPages, setTotalPages] = useState<number>(0);
    const [totalElements, setTotalElements] = useState<number>(0);
    const [successMsg, setSuccessMsg] = useState<string>('');
    const [errorMsg, setErrorMsg] = useState<string>('');
    const [showMobileFilters, setShowMobileFilters] = useState(false);
    const isMobile = useIsBottomNav();

    const currentYear = new Date().getFullYear();
    const availableYears = Array.from({ length: 5 }, (_, i) => currentYear - i);

    const fetchLeaves = useCallback(async () => {
        try {
            const params = new URLSearchParams({
                page: page.toString(),
                size: '15',
                sort: 'createdAt,desc',
            });
            if (status !== 'all') params.set('status', status);
            if (year) params.set('year', year.toString());

            const res = await apiFetch(`/leave-applications/my?${params}`);
            if (res.ok) {
                const json = await res.json();
                const data = json.data;
                if (data.content) {
                    setLeaves(data.content);
                    setTotalPages(data.totalPages);
                    setTotalElements(data.totalElements);
                } else if (Array.isArray(data)) {
                    setLeaves(data);
                    setTotalElements(data.length);
                }
            }
        } catch {
            // Silent fail
        }
    }, [page, status, year]);

    const fetchBalances = useCallback(async () => {
        try {
            const res = await apiFetch('/leave-applications/balances/my');
            if (res.ok) {
                const json = await res.json();
                setBalances(json.data || []);
            }
        } catch {
            // Silent fail
        }
    }, []);

    useEffect(() => {
        Promise.all([fetchLeaves(), fetchBalances()]).finally(() =>
            setLoading(false),
        );
    }, [fetchLeaves, fetchBalances]);

    const handleFilter = () => {
        setPage(0);
        // fetchLeaves is triggered by page/status/year changes via useCallback deps
    };

    const handleReset = () => {
        setStatus('all');
        setYear(currentYear);
        setPage(0);
    };

    const handleCancel = async (leave: LeaveApplicationResponse) => {
        if (!confirm('Are you sure you want to cancel this leave request?')) return;

        try {
            const res = await apiFetch(`/leave-applications/${leave.id}/cancel`, {
                method: 'POST',
            });
            if (res.ok) {
                setSuccessMsg('Leave request cancelled successfully.');
                fetchLeaves();
            } else {
                const json = await res.json();
                setErrorMsg(json.message || 'Failed to cancel leave request.');
            }
        } catch {
            setErrorMsg('Failed to cancel leave request.');
        }
    };

    const getStatusStyle = (s: LeaveStatus): StatusStyle => {
        return STATUS_STYLES[s] || STATUS_STYLES.PENDING_MANAGER;
    };

    const formatStatusLabel = (s: string): string => {
        return s
            .replace(/_/g, ' ')
            .toLowerCase()
            .replace(/\b\w/g, (l) => l.toUpperCase());
    };

    const hasFilters = status !== 'all' || year !== currentYear;

    if (loading) {
        return (
            <div className="flex h-[calc(100vh-4rem)] items-center justify-center">
                <div className="h-8 w-8 animate-spin rounded-full border-4 border-blue-600 border-t-transparent" />
            </div>
        );
    }

    return (
        <>
            <Helmet>
                <title>My Leaves</title>
            </Helmet>

            {/* Header */}
            <div className="border-b border-gray-200 bg-white">
                <div className="px-4 py-4 sm:px-6 sm:py-6 lg:px-8">
                    <div className="flex items-center justify-between">
                        <div className="flex items-center gap-3">
                            <div className="hidden rounded-lg bg-blue-100 p-2 lg:block">
                                <Calendar className="h-6 w-6 text-blue-600" />
                            </div>
                            <div>
                                <h2 className="text-xl font-bold text-gray-900 lg:text-3xl">
                                    My Leaves
                                </h2>
                                <p className="hidden mt-1 text-gray-600 lg:block">
                                    View and manage your leave requests
                                </p>
                                {isMobile && (
                                    <p className="text-xs text-gray-500 mt-0.5">
                                        {totalElements} {totalElements === 1 ? 'request' : 'requests'}
                                        {hasFilters && ' (filtered)'}
                                    </p>
                                )}
                            </div>
                        </div>
                        <div className="flex items-center gap-2">
                            {isMobile && (
                                <Button
                                    variant="outline"
                                    size="sm"
                                    onClick={() => setShowMobileFilters(true)}
                                    className={hasFilters ? 'border-blue-200 bg-blue-50 text-blue-600' : ''}
                                >
                                    <Filter className="mr-1.5 h-4 w-4" />
                                    Filter
                                </Button>
                            )}
                            <Button asChild size="sm" className="bg-blue-600 hover:bg-blue-700 lg:size-default">
                                <Link to="/my-leaves/apply">
                                    <Plus className="mr-1.5 h-4 w-4" />
                                    Apply
                                </Link>
                            </Button>
                        </div>
                    </div>
                </div>
            </div>

            <div className="mx-auto max-w-7xl space-y-4 px-4 py-4 sm:px-6 lg:space-y-6 lg:py-8 lg:px-8">
                {/* Flash Messages */}
                {successMsg && (
                    <Alert className="animate-fade-in border-green-200 bg-green-50">
                        <CheckCircle2 className="h-4 w-4 text-green-600" />
                        <AlertDescription className="font-medium text-green-800">
                            {successMsg}
                        </AlertDescription>
                    </Alert>
                )}
                {errorMsg && (
                    <Alert className="animate-fade-in border-red-200 bg-red-50">
                        <AlertCircle className="h-4 w-4 text-red-600" />
                        <AlertDescription className="font-medium text-red-800">
                            {errorMsg}
                        </AlertDescription>
                    </Alert>
                )}

                {/* Leave Balance Summary — horizontal scroll on mobile, grid on desktop */}
                {balances.length > 0 && (
                    <>
                        {/* Mobile: horizontal scroll */}
                        <div className="flex gap-3 overflow-x-auto pb-1 lg:hidden" style={{ scrollbarWidth: 'none', WebkitOverflowScrolling: 'touch' }}>
                            {balances.map((balance) => (
                                <div
                                    key={balance.id}
                                    className="flex-shrink-0 rounded-xl border border-gray-200 bg-white p-3"
                                    style={{ width: '140px' }}
                                >
                                    <p className="truncate text-xs font-medium text-gray-600">{balance.leaveTypeName}</p>
                                    <div className="mt-1 flex items-baseline gap-1">
                                        <span className={`text-xl font-bold ${balance.remainingDays < 3 ? 'text-red-600' : 'text-gray-900'}`}>
                                            {balance.remainingDays}
                                        </span>
                                        <span className="text-xs text-gray-400">/ {balance.totalDays}</span>
                                    </div>
                                    <Progress value={(balance.remainingDays / balance.totalDays) * 100} className="mt-2 h-1.5" />
                                </div>
                            ))}
                        </div>
                        {/* Desktop: grid */}
                        <div className="hidden animate-fade-in gap-6 md:grid-cols-2 lg:grid lg:grid-cols-4">
                            {balances.map((balance) => (
                                <Card key={balance.id}>
                                    <CardContent className="pt-6">
                                        <div className="space-y-3">
                                            <div className="flex items-center justify-between">
                                                <Badge variant="outline" className="text-xs">{balance.leaveTypeCode}</Badge>
                                            </div>
                                            <div>
                                                <p className="text-sm text-gray-600">{balance.leaveTypeName}</p>
                                                <div className="mt-1 flex items-baseline gap-2">
                                                    <span className={`text-3xl font-bold ${balance.remainingDays < 3 ? 'text-red-600' : 'text-gray-900'}`}>
                                                        {balance.remainingDays}
                                                    </span>
                                                    <span className="text-gray-500">/ {balance.totalDays}</span>
                                                </div>
                                                <p className="mt-1 text-xs text-gray-500">days remaining</p>
                                            </div>
                                            <Progress value={(balance.remainingDays / balance.totalDays) * 100} className="h-2" />
                                        </div>
                                    </CardContent>
                                </Card>
                            ))}
                        </div>
                    </>
                )}

                {/* Filters — hidden on mobile (moved to bottom sheet) */}
                <Card className="hidden animate-fade-in animation-delay-100 shadow-sm lg:block">
                    <CardContent className="p-3 lg:pt-6 lg:p-6">
                        <div className="flex flex-col gap-3 lg:flex-row lg:flex-wrap lg:items-end">
                            <div className="flex gap-2 lg:min-w-[200px] lg:flex-1">
                                <div className="flex-1 space-y-1">
                                    <label className="text-xs font-medium text-gray-700 lg:text-sm">Year</label>
                                    <Select value={year.toString()} onValueChange={(value) => setYear(parseInt(value))}>
                                        <SelectTrigger className="h-10"><SelectValue /></SelectTrigger>
                                        <SelectContent>
                                            {availableYears.map((y) => (
                                                <SelectItem key={y} value={y.toString()}>{y}</SelectItem>
                                            ))}
                                        </SelectContent>
                                    </Select>
                                </div>
                                <div className="flex-1 space-y-1">
                                    <label className="text-xs font-medium text-gray-700 lg:text-sm">Status</label>
                                    <Select value={status} onValueChange={setStatus}>
                                        <SelectTrigger className="h-10"><SelectValue /></SelectTrigger>
                                        <SelectContent>
                                            <SelectItem value="all">All Status</SelectItem>
                                            <SelectItem value="PENDING_MANAGER">Pending Review</SelectItem>
                                            <SelectItem value="PENDING_HR">Pending HR</SelectItem>
                                            <SelectItem value="APPROVED">Approved</SelectItem>
                                            <SelectItem value="REJECTED_BY_MANAGER">Rejected</SelectItem>
                                            <SelectItem value="REJECTED_BY_HR">Rejected by HR</SelectItem>
                                            <SelectItem value="CANCELLED">Cancelled</SelectItem>
                                        </SelectContent>
                                    </Select>
                                </div>
                            </div>

                            <div className="flex gap-2">
                                <Button onClick={handleFilter} className="h-10 flex-1 bg-blue-600 hover:bg-blue-700 lg:flex-none">
                                    Apply
                                </Button>
                                {hasFilters && (
                                    <Button variant="outline" onClick={handleReset} className="h-10">
                                        <X className="h-4 w-4 lg:mr-2" />
                                        <span className="hidden lg:inline">Reset</span>
                                    </Button>
                                )}
                            </div>
                        </div>

                        <div className="mt-3 border-t pt-3 text-xs text-gray-600 lg:mt-4 lg:pt-4 lg:text-sm">
                            Showing{' '}
                            <span className="font-semibold text-gray-900">{totalElements}</span>{' '}
                            {totalElements === 1 ? 'request' : 'requests'}
                        </div>
                    </CardContent>
                </Card>

                {/* Leave Requests — cards on mobile, table on desktop */}

                {/* Mobile card list */}
                <div className="space-y-2 lg:hidden">
                    {leaves.length > 0 ? (
                        leaves.map((leave) => {
                            const statusStyle = getStatusStyle(leave.status);
                            const StatusIcon = statusStyle.icon;
                            return (
                                <Link
                                    key={leave.id}
                                    to={`/my-leaves/${leave.id}`}
                                    className="block rounded-2xl border border-gray-100 bg-white p-4 transition-all active:scale-[0.98]"
                                >
                                    <div className="flex items-start justify-between">
                                        <div className="flex items-center gap-2.5">
                                            <div
                                                className="h-3 w-3 rounded-full"
                                                style={{ backgroundColor: leave.leaveTypeColor || '#3B82F6' }}
                                            />
                                            <span className="text-sm font-semibold text-gray-900">{leave.leaveTypeName}</span>
                                        </div>
                                        <Badge className={`${statusStyle.bg} ${statusStyle.text} ${statusStyle.border} flex items-center gap-1 border text-[11px]`}>
                                            <StatusIcon className="h-3 w-3" />
                                            {leave.statusLabel || formatStatusLabel(leave.status)}
                                        </Badge>
                                    </div>
                                    <div className="mt-2.5 flex items-center gap-3 text-xs text-gray-500">
                                        <span>
                                            {new Date(leave.startDate).toLocaleDateString('en-US', { month: 'short', day: 'numeric' })}
                                            {leave.startDate !== leave.endDate && (
                                                <> – {new Date(leave.endDate).toLocaleDateString('en-US', { month: 'short', day: 'numeric' })}</>
                                            )}
                                        </span>
                                        <span className="text-gray-300">·</span>
                                        <span>{leave.totalDays} {leave.totalDays === 1 ? 'day' : 'days'}</span>
                                    </div>
                                </Link>
                            );
                        })
                    ) : (
                        <div className="py-12 text-center">
                            <div className="mx-auto mb-3 flex h-14 w-14 items-center justify-center rounded-2xl bg-gray-100">
                                <Calendar className="h-6 w-6 text-gray-400" />
                            </div>
                            <p className="text-sm font-medium text-gray-900">
                                {hasFilters ? 'No matching requests' : 'No leave requests yet'}
                            </p>
                            <Button asChild size="sm" className="mt-3 bg-blue-600 hover:bg-blue-700">
                                <Link to="/my-leaves/apply">
                                    <Plus className="mr-1.5 h-4 w-4" />
                                    Apply for Leave
                                </Link>
                            </Button>
                        </div>
                    )}
                </div>

                {/* Mobile pagination */}
                {leaves.length > 0 && totalPages > 1 && (
                    <div className="flex items-center justify-between py-2 lg:hidden">
                        <p className="text-xs text-gray-500">
                            Page {page + 1} of {totalPages}
                        </p>
                        <div className="flex gap-2">
                            <Button
                                variant="outline"
                                size="sm"
                                onClick={() => setPage((p) => Math.max(0, p - 1))}
                                disabled={page === 0}
                            >
                                <ChevronLeft className="h-4 w-4" />
                            </Button>
                            <Button
                                variant="outline"
                                size="sm"
                                onClick={() => setPage((p) => Math.min(totalPages - 1, p + 1))}
                                disabled={page >= totalPages - 1}
                            >
                                <ChevronRight className="h-4 w-4" />
                            </Button>
                        </div>
                    </div>
                )}

                {/* Desktop table */}
                <Card className="hidden animate-fade-in animation-delay-200 shadow-sm lg:block">
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
                                {leaves.length > 0 ? (
                                    leaves.map((leave) => {
                                        const statusStyle = getStatusStyle(leave.status);
                                        const StatusIcon = statusStyle.icon;
                                        const canCancel = (
                                            ['PENDING_MANAGER', 'PENDING_HR'] as LeaveStatus[]
                                        ).includes(leave.status);
                                        const canEdit =
                                            leave.status === 'PENDING_MANAGER';

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
                                                                    leave.leaveTypeColor || '#3B82F6',
                                                            }}
                                                        />
                                                        <div>
                                                            <p className="font-medium text-gray-900">
                                                                {leave.leaveTypeName}
                                                            </p>
                                                            <p className="text-xs text-gray-500">
                                                                {leave.leaveTypeCode}
                                                            </p>
                                                        </div>
                                                    </div>
                                                </TableCell>
                                                <TableCell>
                                                    <div className="text-sm">
                                                        <p className="font-medium text-gray-900">
                                                            {new Date(
                                                                leave.startDate,
                                                            ).toLocaleDateString(
                                                                'en-US',
                                                                {
                                                                    month: 'short',
                                                                    day: 'numeric',
                                                                },
                                                            )}
                                                        </p>
                                                        {leave.startDate !==
                                                            leave.endDate && (
                                                            <p className="text-gray-500">
                                                                to{' '}
                                                                {new Date(
                                                                    leave.endDate,
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
                                                            {leave.totalDays}{' '}
                                                            {leave.totalDays === 1
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
                                                        {leave.statusLabel || formatStatusLabel(leave.status)}
                                                    </Badge>
                                                </TableCell>
                                                <TableCell>
                                                    {leave.hrApprovedByName ? (
                                                        <div className="flex items-center gap-2">
                                                            <div className="flex h-8 w-8 items-center justify-center rounded-full bg-gray-600">
                                                                <span className="text-xs font-medium text-white">
                                                                    {leave.hrApprovedByName
                                                                        .charAt(0)
                                                                        .toUpperCase()}
                                                                </span>
                                                            </div>
                                                            <span className="text-sm text-gray-900">
                                                                {leave.hrApprovedByName}
                                                            </span>
                                                        </div>
                                                    ) : leave.managerApprovedByName ? (
                                                        <div className="flex items-center gap-2">
                                                            <div className="flex h-8 w-8 items-center justify-center rounded-full bg-gray-600">
                                                                <span className="text-xs font-medium text-white">
                                                                    {leave.managerApprovedByName
                                                                        .charAt(0)
                                                                        .toUpperCase()}
                                                                </span>
                                                            </div>
                                                            <span className="text-sm text-gray-900">
                                                                {leave.managerApprovedByName}
                                                            </span>
                                                        </div>
                                                    ) : leave.status === 'PENDING_MANAGER' ? (
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
                                                                    to={`/my-leaves/${leave.id}`}
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
                                                                        to={`/my-leaves/${leave.id}/edit`}
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
                                                                            href={`${API_BASE_URL}/leave-applications/${leave.id}/attachment`}
                                                                            download
                                                                            target="_blank"
                                                                            rel="noreferrer"
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
                                                    <Link to="/my-leaves/apply">
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
                    {leaves.length > 0 && totalPages > 1 && (
                        <div className="flex items-center justify-between border-t bg-gray-50 px-6 py-4">
                            <p className="text-sm text-gray-700">
                                Page{' '}
                                <span className="font-medium">
                                    {page + 1}
                                </span>{' '}
                                of{' '}
                                <span className="font-medium">
                                    {totalPages}
                                </span>{' '}
                                ({totalElements} total)
                            </p>
                            <div className="flex gap-2">
                                <Button
                                    variant="outline"
                                    size="sm"
                                    onClick={() => setPage((p) => Math.max(0, p - 1))}
                                    disabled={page === 0}
                                    className="h-9"
                                >
                                    <ChevronLeft className="mr-1 h-4 w-4" />
                                    Previous
                                </Button>
                                <Button
                                    variant="outline"
                                    size="sm"
                                    onClick={() =>
                                        setPage((p) =>
                                            Math.min(totalPages - 1, p + 1),
                                        )
                                    }
                                    disabled={page >= totalPages - 1}
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

            {/* Mobile filter bottom sheet */}
            <MobileBottomSheet
                open={showMobileFilters}
                onOpenChange={setShowMobileFilters}
                header={
                    <div className="px-5 pb-3 pt-1">
                        <h2 className="text-base font-semibold text-slate-900">Filter Leaves</h2>
                        <p className="text-xs text-gray-500">Narrow down your leave requests</p>
                    </div>
                }
            >
                <div className="px-5 pb-6 space-y-5">
                    <div className="space-y-1.5">
                        <label className="text-sm font-medium text-gray-700">Year</label>
                        <Select value={year.toString()} onValueChange={(v) => setYear(parseInt(v))}>
                            <SelectTrigger className="h-12 text-base"><SelectValue /></SelectTrigger>
                            <SelectContent>
                                {availableYears.map((y) => (
                                    <SelectItem key={y} value={y.toString()}>{y}</SelectItem>
                                ))}
                            </SelectContent>
                        </Select>
                    </div>
                    <div className="space-y-1.5">
                        <label className="text-sm font-medium text-gray-700">Status</label>
                        <Select value={status} onValueChange={setStatus}>
                            <SelectTrigger className="h-12 text-base"><SelectValue /></SelectTrigger>
                            <SelectContent>
                                <SelectItem value="all">All Status</SelectItem>
                                <SelectItem value="PENDING_MANAGER">Pending Review</SelectItem>
                                <SelectItem value="PENDING_HR">Pending HR</SelectItem>
                                <SelectItem value="APPROVED">Approved</SelectItem>
                                <SelectItem value="REJECTED_BY_MANAGER">Rejected</SelectItem>
                                <SelectItem value="REJECTED_BY_HR">Rejected by HR</SelectItem>
                                <SelectItem value="CANCELLED">Cancelled</SelectItem>
                            </SelectContent>
                        </Select>
                    </div>
                    <div className="flex gap-3 pt-2">
                        {hasFilters && (
                            <Button
                                variant="outline"
                                className="flex-1 h-12 text-base"
                                onClick={() => { handleReset(); setShowMobileFilters(false); }}
                            >
                                Reset
                            </Button>
                        )}
                        <Button
                            className="flex-1 h-12 text-base bg-blue-600 hover:bg-blue-700"
                            onClick={() => { handleFilter(); setShowMobileFilters(false); }}
                        >
                            Apply Filters
                        </Button>
                    </div>
                </div>
            </MobileBottomSheet>
        </>
    );
}
