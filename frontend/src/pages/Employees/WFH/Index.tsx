import { Alert, AlertDescription } from '@/components/ui/alert';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import {
    Dialog,
    DialogContent,
    DialogDescription,
    DialogFooter,
    DialogHeader,
    DialogTitle,
} from '@/components/ui/dialog';
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
import { apiFetch } from '@/lib/spring-boot-api';
import WFHScheduleModal from '@/pages/Calendar/WFHScheduleModal';
import type { WFHMonthlyStats, WFHSchedule, WFHWeeklyUsage } from '@/types';
import {
    AlertCircle,
    Calendar,
    CheckCircle2,
    Home,
    Plus,
    XCircle,
} from 'lucide-react';
import { useCallback, useEffect, useState } from 'react';
import { Helmet } from 'react-helmet-async';

interface StatusConfig {
    label: string;
    className: string;
}

const statusConfig: Record<string, StatusConfig> = {
    approved: {
        label: 'Approved',
        className: 'bg-green-100 text-green-800 border-green-200',
    },
    pending: {
        label: 'Pending',
        className: 'bg-yellow-100 text-yellow-800 border-yellow-200',
    },
    cancelled: {
        label: 'Cancelled',
        className: 'bg-gray-100 text-gray-500 border-gray-200',
    },
};

function formatMonth(monthStr: string): string {
    const [y, m] = monthStr.split('-');
    return new Date(parseInt(y), parseInt(m) - 1).toLocaleDateString('en-US', {
        month: 'long',
        year: 'numeric',
    });
}

function formatDate(dateStr: string): string {
    return new Date(dateStr + 'T00:00:00').toLocaleDateString('en-US', {
        month: 'short',
        day: 'numeric',
        year: 'numeric',
    });
}

function getCurrentMonth(): string {
    const now = new Date();
    return `${now.getFullYear()}-${String(now.getMonth() + 1).padStart(2, '0')}`;
}

function generateAvailableMonths(): string[] {
    const months: string[] = [];
    const now = new Date();
    // 6 months back + current + 3 months forward
    for (let i = -6; i <= 3; i++) {
        const d = new Date(now.getFullYear(), now.getMonth() + i, 1);
        months.push(
            `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, '0')}`,
        );
    }
    return months;
}

export default function MyWFH() {
    const [schedules, setSchedules] = useState<WFHSchedule[]>([]);
    const [weeklyUsage, setWeeklyUsage] = useState<WFHWeeklyUsage>({
        used: 0,
        quota: 0,
        remaining: 0,
    });
    const [monthlyStats, setMonthlyStats] = useState<WFHMonthlyStats>({
        approved: 0,
        upcoming: 0,
    });
    const [currentMonth, setCurrentMonth] = useState<string>(getCurrentMonth());
    const [availableMonths] = useState<string[]>(generateAvailableMonths());
    const [loading, setLoading] = useState<boolean>(true);
    const [cancelTarget, setCancelTarget] = useState<WFHSchedule | null>(null);
    const [showScheduleModal, setShowScheduleModal] = useState<boolean>(false);
    const [wfhWeeklyUsage, setWfhWeeklyUsage] = useState<WFHWeeklyUsage | null>(null);
    const [successMessage, setSuccessMessage] = useState<string | null>(null);
    const [errorMessage, setErrorMessage] = useState<string | null>(null);

    const fetchData = useCallback(
        async (month: string) => {
            setLoading(true);
            try {
                const [schedulesRes, usageRes, statsRes] = await Promise.allSettled([
                    apiFetch(`/wfh/schedules?month=${month}`),
                    apiFetch('/wfh/weekly-usage'),
                    apiFetch(`/wfh/monthly-stats?month=${month}`),
                ]);

                if (schedulesRes.status === 'fulfilled' && schedulesRes.value.ok) {
                    const json = await schedulesRes.value.json();
                    setSchedules(json.data || []);
                }

                if (usageRes.status === 'fulfilled' && usageRes.value.ok) {
                    const json = await usageRes.value.json();
                    setWeeklyUsage(json.data || { used: 0, quota: 0, remaining: 0 });
                }

                if (statsRes.status === 'fulfilled' && statsRes.value.ok) {
                    const json = await statsRes.value.json();
                    setMonthlyStats(json.data || { approved: 0, upcoming: 0 });
                }
            } catch {
                /* silent */
            } finally {
                setLoading(false);
            }
        },
        [],
    );

    useEffect(() => {
        fetchData(currentMonth);
    }, [currentMonth, fetchData]);

    const handleOpenSchedule = async () => {
        try {
            const res = await apiFetch('/wfh/weekly-usage');
            if (res.ok) {
                const json = await res.json();
                setWfhWeeklyUsage(json.data);
            }
        } catch {
            /* ignore */
        }
        setShowScheduleModal(true);
    };

    const handleWFHScheduled = (message: string) => {
        setSuccessMessage(message);
        setTimeout(() => setSuccessMessage(null), 5000);
        fetchData(currentMonth);
    };

    const handleMonthChange = (month: string) => {
        setCurrentMonth(month);
    };

    const handleCancel = async () => {
        if (!cancelTarget) return;
        try {
            const res = await apiFetch(`/wfh/schedules/${cancelTarget.id}/cancel`, {
                method: 'POST',
            });
            const json = await res.json();

            if (res.ok) {
                setSuccessMessage(json.message || 'WFH cancelled successfully.');
                setTimeout(() => setSuccessMessage(null), 5000);
                setCancelTarget(null);
                fetchData(currentMonth);
            } else {
                setErrorMessage(json.message || 'Failed to cancel WFH.');
                setTimeout(() => setErrorMessage(null), 5000);
                setCancelTarget(null);
            }
        } catch {
            setErrorMessage('Failed to cancel WFH.');
            setTimeout(() => setErrorMessage(null), 5000);
            setCancelTarget(null);
        }
    };

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
                <title>My WFH</title>
            </Helmet>

            {/* Header */}
            <div className="border-b border-gray-200 bg-white">
                <div className="px-4 py-6 sm:px-6 lg:px-8">
                    <div className="flex items-center justify-between">
                        <div>
                            <h2 className="text-xl font-semibold leading-tight text-gray-800">
                                My Work From Home
                            </h2>
                            <p className="mt-1 text-sm text-gray-600">
                                View and manage your WFH schedule
                            </p>
                        </div>
                        <Button
                            variant="default"
                            size="sm"
                            onClick={handleOpenSchedule}
                        >
                            <Plus className="mr-2 h-4 w-4" />
                            Schedule WFH
                        </Button>
                    </div>
                </div>
            </div>

            <div className="py-6">
                <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
                    {/* Flash Messages */}
                    {successMessage && (
                        <Alert className="animate-fade-in mb-4 border-green-200 bg-green-50">
                            <CheckCircle2 className="h-4 w-4 text-green-600" />
                            <AlertDescription className="font-medium text-green-800">
                                {successMessage}
                            </AlertDescription>
                        </Alert>
                    )}
                    {errorMessage && (
                        <Alert className="animate-fade-in mb-4 border-red-200 bg-red-50">
                            <AlertCircle className="h-4 w-4 text-red-600" />
                            <AlertDescription className="font-medium text-red-800">
                                {errorMessage}
                            </AlertDescription>
                        </Alert>
                    )}

                    {/* Stats Cards */}
                    <div className="mb-6 grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-4">
                        <Card>
                            <CardContent className="pt-6">
                                <div className="flex items-center justify-between">
                                    <div>
                                        <p className="text-sm text-gray-500">
                                            This Week
                                        </p>
                                        <p className="mt-1 text-2xl font-bold">
                                            {weeklyUsage.used}/
                                            {weeklyUsage.quota}
                                        </p>
                                        <p className="text-xs text-gray-500">
                                            days used
                                        </p>
                                    </div>
                                    <div className="flex h-12 w-12 items-center justify-center rounded-full bg-blue-100">
                                        <Home className="h-6 w-6 text-blue-600" />
                                    </div>
                                </div>
                            </CardContent>
                        </Card>

                        <Card>
                            <CardContent className="pt-6">
                                <div className="flex items-center justify-between">
                                    <div>
                                        <p className="text-sm text-gray-500">
                                            Remaining
                                        </p>
                                        <p className="mt-1 text-2xl font-bold text-green-600">
                                            {weeklyUsage.remaining}
                                        </p>
                                        <p className="text-xs text-gray-500">
                                            days this week
                                        </p>
                                    </div>
                                    <div className="flex h-12 w-12 items-center justify-center rounded-full bg-green-100">
                                        <CheckCircle2 className="h-6 w-6 text-green-600" />
                                    </div>
                                </div>
                            </CardContent>
                        </Card>

                        <Card>
                            <CardContent className="pt-6">
                                <div className="flex items-center justify-between">
                                    <div>
                                        <p className="text-sm text-gray-500">
                                            This Month
                                        </p>
                                        <p className="mt-1 text-2xl font-bold">
                                            {monthlyStats.approved}
                                        </p>
                                        <p className="text-xs text-gray-500">
                                            approved days
                                        </p>
                                    </div>
                                    <div className="flex h-12 w-12 items-center justify-center rounded-full bg-purple-100">
                                        <Calendar className="h-6 w-6 text-purple-600" />
                                    </div>
                                </div>
                            </CardContent>
                        </Card>

                        <Card>
                            <CardContent className="pt-6">
                                <div className="flex items-center justify-between">
                                    <div>
                                        <p className="text-sm text-gray-500">
                                            Upcoming
                                        </p>
                                        <p className="mt-1 text-2xl font-bold text-blue-600">
                                            {monthlyStats.upcoming}
                                        </p>
                                        <p className="text-xs text-gray-500">
                                            days scheduled
                                        </p>
                                    </div>
                                    <div className="flex h-12 w-12 items-center justify-center rounded-full bg-blue-100">
                                        <Calendar className="h-6 w-6 text-blue-600" />
                                    </div>
                                </div>
                            </CardContent>
                        </Card>
                    </div>

                    {/* Schedule Table */}
                    <Card>
                        <CardHeader>
                            <div className="flex items-center justify-between">
                                <CardTitle className="text-base">
                                    WFH Schedule
                                </CardTitle>
                                <Select
                                    value={currentMonth}
                                    onValueChange={handleMonthChange}
                                >
                                    <SelectTrigger className="w-48">
                                        <SelectValue />
                                    </SelectTrigger>
                                    <SelectContent>
                                        {availableMonths.map((month) => (
                                            <SelectItem
                                                key={month}
                                                value={month}
                                            >
                                                {formatMonth(month)}
                                            </SelectItem>
                                        ))}
                                    </SelectContent>
                                </Select>
                            </div>
                        </CardHeader>
                        <CardContent>
                            {schedules.length === 0 ? (
                                <div className="py-12 text-center">
                                    <Home className="mx-auto h-12 w-12 text-gray-300" />
                                    <p className="mt-3 text-sm text-gray-500">
                                        No WFH days scheduled for{' '}
                                        {formatMonth(currentMonth)}
                                    </p>
                                    <Button
                                        variant="outline"
                                        size="sm"
                                        className="mt-4"
                                        onClick={handleOpenSchedule}
                                    >
                                        <Plus className="mr-2 h-4 w-4" />
                                        Schedule WFH
                                    </Button>
                                </div>
                            ) : (
                                <Table>
                                    <TableHeader>
                                        <TableRow>
                                            <TableHead>Date</TableHead>
                                            <TableHead>Day</TableHead>
                                            <TableHead>Type</TableHead>
                                            <TableHead>Reason</TableHead>
                                            <TableHead>Status</TableHead>
                                            <TableHead className="text-right">
                                                Action
                                            </TableHead>
                                        </TableRow>
                                    </TableHeader>
                                    <TableBody>
                                        {schedules.map((wfh) => {
                                            const config =
                                                statusConfig[wfh.status] ||
                                                statusConfig.approved;
                                            return (
                                                <TableRow
                                                    key={wfh.id}
                                                    className={
                                                        wfh.isToday
                                                            ? 'bg-blue-50/50'
                                                            : wfh.status ===
                                                                'cancelled'
                                                              ? 'opacity-50'
                                                              : ''
                                                    }
                                                >
                                                    <TableCell className="font-medium">
                                                        {formatDate(wfh.date)}
                                                        {wfh.isToday && (
                                                            <Badge className="ml-2 bg-blue-100 text-xs text-blue-700">
                                                                Today
                                                            </Badge>
                                                        )}
                                                    </TableCell>
                                                    <TableCell>
                                                        {wfh.dayName}
                                                    </TableCell>
                                                    <TableCell>
                                                        <span className="capitalize">
                                                            {wfh.type.replace(
                                                                '_',
                                                                ' ',
                                                            )}
                                                        </span>
                                                    </TableCell>
                                                    <TableCell className="max-w-xs truncate text-gray-500">
                                                        {wfh.reason || '-'}
                                                    </TableCell>
                                                    <TableCell>
                                                        <Badge
                                                            className={
                                                                config.className
                                                            }
                                                        >
                                                            {config.label}
                                                        </Badge>
                                                    </TableCell>
                                                    <TableCell className="text-right">
                                                        {!wfh.isPast &&
                                                            wfh.status !==
                                                                'cancelled' && (
                                                                <Button
                                                                    variant="ghost"
                                                                    size="sm"
                                                                    className="text-red-600 hover:bg-red-50 hover:text-red-700"
                                                                    onClick={() =>
                                                                        setCancelTarget(
                                                                            wfh,
                                                                        )
                                                                    }
                                                                >
                                                                    <XCircle className="mr-1 h-4 w-4" />
                                                                    Cancel
                                                                </Button>
                                                            )}
                                                    </TableCell>
                                                </TableRow>
                                            );
                                        })}
                                    </TableBody>
                                </Table>
                            )}
                        </CardContent>
                    </Card>
                </div>
            </div>

            {/* WFH Schedule Modal */}
            <WFHScheduleModal
                open={showScheduleModal}
                onOpenChange={setShowScheduleModal}
                weeklyUsage={wfhWeeklyUsage}
                onScheduled={handleWFHScheduled}
            />

            {/* Cancel Confirmation Dialog */}
            <Dialog
                open={!!cancelTarget}
                onOpenChange={(open) => {
                    if (!open) setCancelTarget(null);
                }}
            >
                <DialogContent className="sm:max-w-md">
                    <DialogHeader>
                        <DialogTitle>Cancel WFH</DialogTitle>
                        <DialogDescription>
                            Are you sure you want to cancel your WFH on{' '}
                            <span className="font-semibold">
                                {cancelTarget && formatDate(cancelTarget.date)}
                            </span>
                            ? This action cannot be undone.
                        </DialogDescription>
                    </DialogHeader>
                    <DialogFooter className="gap-2">
                        <Button
                            variant="outline"
                            onClick={() => setCancelTarget(null)}
                        >
                            Keep It
                        </Button>
                        <Button variant="destructive" onClick={handleCancel}>
                            Yes, Cancel WFH
                        </Button>
                    </DialogFooter>
                </DialogContent>
            </Dialog>
        </>
    );
}
