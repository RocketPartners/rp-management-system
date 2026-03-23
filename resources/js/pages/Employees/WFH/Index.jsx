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
import AuthenticatedLayout from '@/layouts/AuthenticatedLayout';
import WFHScheduleModal from '@/pages/Calendar/WFHScheduleModal';
import { Head, router, usePage } from '@inertiajs/react';
import {
    AlertCircle,
    Calendar,
    CheckCircle2,
    Home,
    Plus,
    XCircle,
} from 'lucide-react';
import { useState } from 'react';

const statusConfig = {
    approved: {
        label: 'Approved',
        variant: 'default',
        className: 'bg-green-100 text-green-800 border-green-200',
    },
    pending: {
        label: 'Pending',
        variant: 'secondary',
        className: 'bg-yellow-100 text-yellow-800 border-yellow-200',
    },
    cancelled: {
        label: 'Cancelled',
        variant: 'outline',
        className: 'bg-gray-100 text-gray-500 border-gray-200',
    },
};

export default function MyWFH({
    auth,
    schedules,
    weeklyUsage,
    settings,
    monthlyStats,
    currentMonth,
    availableMonths,
}) {
    const { flash } = usePage().props;
    const [cancelTarget, setCancelTarget] = useState(null);
    const [showScheduleModal, setShowScheduleModal] = useState(false);
    const [wfhWeeklyUsage, setWfhWeeklyUsage] = useState(weeklyUsage);
    const [successMessage, setSuccessMessage] = useState(null);

    const handleOpenSchedule = async () => {
        try {
            const response = await window.apiAxios.get('/api/wfh/weekly-usage');
            setWfhWeeklyUsage(response.data.data);
        } catch {
            /* ignore */
        }
        setShowScheduleModal(true);
    };

    const handleWFHScheduled = (message) => {
        setSuccessMessage(message);
        setTimeout(() => setSuccessMessage(null), 5000);
        // Reload the page data to reflect the new schedule
        router.reload({ preserveScroll: true });
    };

    const handleMonthChange = (month) => {
        router.get('/my-wfh', { month }, { preserveState: true });
    };

    const handleCancel = () => {
        if (!cancelTarget) return;
        router.post(
            `/my-wfh/${cancelTarget.id}/cancel`,
            {},
            {
                preserveScroll: true,
                onSuccess: () => setCancelTarget(null),
            },
        );
    };

    const formatMonth = (monthStr) => {
        const [y, m] = monthStr.split('-');
        return new Date(y, m - 1).toLocaleDateString('en-US', {
            month: 'long',
            year: 'numeric',
        });
    };

    const formatDate = (dateStr) => {
        return new Date(dateStr + 'T00:00:00').toLocaleDateString('en-US', {
            month: 'short',
            day: 'numeric',
            year: 'numeric',
        });
    };

    return (
        <AuthenticatedLayout
            user={auth.user}
            header={
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
            }
        >
            <Head title="My WFH" />

            <div className="py-6">
                <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
                    {/* Flash Messages */}
                    {flash?.success && (
                        <Alert className="animate-fade-in mb-4 border-green-200 bg-green-50">
                            <CheckCircle2 className="h-4 w-4 text-green-600" />
                            <AlertDescription className="font-medium text-green-800">
                                {flash.success}
                            </AlertDescription>
                        </Alert>
                    )}
                    {flash?.error && (
                        <Alert className="animate-fade-in mb-4 border-red-200 bg-red-50">
                            <AlertCircle className="h-4 w-4 text-red-600" />
                            <AlertDescription className="font-medium text-red-800">
                                {flash.error}
                            </AlertDescription>
                        </Alert>
                    )}

                    {/* Success Message from WFH scheduling */}
                    {successMessage && (
                        <Alert className="animate-fade-in mb-4 border-green-200 bg-green-50">
                            <CheckCircle2 className="h-4 w-4 text-green-600" />
                            <AlertDescription className="font-medium text-green-800">
                                {successMessage}
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
                                                        wfh.is_today
                                                            ? 'bg-blue-50/50'
                                                            : wfh.is_past &&
                                                                wfh.status !==
                                                                    'cancelled'
                                                              ? ''
                                                              : wfh.status ===
                                                                  'cancelled'
                                                                ? 'opacity-50'
                                                                : ''
                                                    }
                                                >
                                                    <TableCell className="font-medium">
                                                        {formatDate(wfh.date)}
                                                        {wfh.is_today && (
                                                            <Badge className="ml-2 bg-blue-100 text-xs text-blue-700">
                                                                Today
                                                            </Badge>
                                                        )}
                                                    </TableCell>
                                                    <TableCell>
                                                        {wfh.day_name}
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
                                                        {!wfh.is_past &&
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
        </AuthenticatedLayout>
    );
}
